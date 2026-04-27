
import { App, Plugin, Modal, Notice, TAbstractFile, TFolder, TFile, Setting, MarkdownView, Editor, Command, DataAdapter } from 'obsidian';
import * as obsidian from 'obsidian';
import { Z2KTemplateEngine, Z2KYamlDoc, TemplateState, VarValueType, FieldInfo, TemplateError, Handlebars } from './template-engine/main';
import { PathFile, PathFolder, pathFileFrom, pathFolderFrom, pathFileFromTFile, pathFolderFromTFolder, normalizeFullPath, isSubPathOf, joinPath } from './paths';
import { type Extension } from "@codemirror/state";
import moment from 'moment';
import { Z2KTemplatesPluginSettings, DEFAULT_SETTINGS, DOCS_BASE_URL, ErrorLogger, UserCancelError, TemplatePluginError, rethrowWithMessage, escapeRegExp, cardRefNameUpper, cardRefNameLower, parseDuration, parseDelayFromFilename, sleep, type ErrorSeverity } from './utils';
import { handlebarsOverlay } from './syntax-highlighting';
import { TemplateValidationController } from './template-validation';
import { Z2KTemplatesSettingTab } from './settings';
import { CardTypeSelectionModal, TemplateSelectionModal, ConfirmationModal, ErrorModal, LogViewerModal, WelcomeModal } from './modals/simple-modals';
import { FieldCollectionModal, buildDependencyMap, detectCircularDependencies, calculateFieldDependencyOrder } from './modals/field-collection';
import { EditorModal, QuickCommandsModal } from './modals/editor-modals';
import { createApi, Z2KTemplatesApi, BuiltInContext, BuiltInProvider } from './api';
import { CommandResult } from './api/commands';


// Command parameter interface for processCommand()
// Note: Types are permissive to handle parsing from various sources (URI strings, JSON, etc.)
// processCommand validates and ensures correctness
interface CommandParams {
	cmd?: string;  // Required but might be missing or empty
	// Template & file paths (keys might need normalization)
	templatePath?: string;
	blockPath?: string;  // Alias for templatePath
	templateContents?: string;
	blockContents?: string;  // Alias for templateContents
	existingFilePath?: string;
	destDir?: string;
	destHeader?: string;
	// Behavior flags (might be invalid values from URI parsing)
	prompt?: "none" | "remaining" | "all" | string;  // Allow any string for validation
	finalize?: boolean | string;  // Can be boolean (from JSON) or string "true"/"false" (from URI)
	location?: "file-top" | "file-bottom" | "header-top" | "header-bottom" | number | string;  // Allow any string/number
	// Additional field data - can be string (JSON) or already parsed object
	// Values are typed as unknown here; processCommand narrows and validates them at runtime
	fieldData?: string | Record<string, unknown>;
	fieldData64?: string;  // Base64-encoded JSON (standard or URL-safe)
	// For fromJson command
	jsonData?: string;
	jsonData64?: string;  // Base64-encoded JSON (standard or URL-safe)
	// Retry configuration
	maxRetries?: number;  // Default 0
	retryDelay?: string;  // Duration string (e.g., "5s", "1m"). Default "0s"
	// Index signature to allow other unknown keys (treated as template data)
	[key: string]: any;
}

interface RetryMetadata {
	attempts: number;
	nextRetryAfter: number;  // Timestamp (ms since epoch)
}

// Mirrors TemplateMetadata keys — runtime counterpart since TS interfaces aren't available at runtime
const TEMPLATE_METADATA_KEYS = new Set([
	"z2k_template_name",
	"z2k_template_version",
	"z2k_template_author",
	"z2k_template_suggested_title",
	"z2k_template_description",
	"z2k_template_type",
	"z2k_template_default_fallback_handling",
	"z2k_default",
]);

export default class Z2KTemplatesPlugin extends Plugin {
	templateEngine: Z2KTemplateEngine;
	settings: Z2KTemplatesPluginSettings;
	errorLogger: ErrorLogger;
	api: Z2KTemplatesApi;
	userHelperFunctions: Record<string, Function> = {};

	// Plugin-registered helpers and built-in fields (issue #169).
	// Outer Map key is the registering plugin's id; inner Map is name -> fn/provider.
	// Insertion order is preserved, which bare-name transfer-on-unregister relies on.
	private pluginHelpers: Map<string, Map<string, Function>> = new Map();
	private pluginBuiltIns: Map<string, Map<string, BuiltInProvider>> = new Map();
	// Reverse lookup: who currently owns the bare (unprefixed) helper/built-in name.
	// User-written helpers always win over plugins; user ownership is implicit
	// (checked via userHelperFunctions) rather than stored here.
	private bareHelperOwner: Map<string, string> = new Map();
	private bareBuiltInOwner: Map<string, string> = new Map();

	// Returns the merged set of helpers available to the engine:
	// user-written helpers (if enabled) plus plugin-registered helpers (if master + per-plugin enabled),
	// with collision resolution already baked in — user helpers claim bare names outright; plugins
	// get their bare name only when no one else has claimed it, and always get their prefixed name.
	get activeHelpers(): Record<string, Function> {
		const out: Record<string, Function> = {};
		if (this.settings.pluginHelpersEnabled) {
			for (const [pluginId, helpers] of this.pluginHelpers) {
				if (!this.isPluginRegistrationEnabled(pluginId)) { continue; }
				for (const [name, fn] of helpers) {
					out[this.pluginPrefixedName(pluginId, name)] = fn;
					if (this.bareHelperOwner.get(name) === pluginId) {
						out[name] = fn;
					}
				}
			}
		}
		if (this.settings.userHelpersEnabled) {
			for (const [name, fn] of Object.entries(this.userHelperFunctions)) {
				out[name] = fn; // user helpers override any bare-name plugin registration
			}
		}
		return out;
	}

	// Build the Handlebars-safe prefixed name for a plugin-registered helper/built-in.
	// Obsidian plugin ids are kebab-case by convention, but Handlebars path expressions only
	// allow [a-zA-Z0-9_], so any non-identifier characters in the id are rewritten to '_'.
	// The internal tracking maps stay keyed by the real pluginId — only the template-facing
	// name goes through this sanitizer.
	private pluginPrefixedName(pluginId: string, name: string): string {
		return `${pluginId.replace(/[^a-zA-Z0-9_]/g, '_')}__${name}`;
	}

	isPluginRegistrationEnabled(pluginId: string): boolean {
		if (!this.settings.pluginHelpersEnabled) { return false; }
		const perPlugin = this.settings.perPluginEnabled[pluginId];
		return perPlugin !== false; // missing or true = enabled
	}

	hasPluginHelper(pluginId: string, name: string): boolean {
		return this.pluginHelpers.get(pluginId)?.has(name) ?? false;
	}

	hasPluginBuiltIn(pluginId: string, name: string): boolean {
		return this.pluginBuiltIns.get(pluginId)?.has(name) ?? false;
	}

	registerPluginHelper(pluginId: string, name: string, fn: Function): void {
		const wrapped = this.wrapHelper(this.pluginPrefixedName(pluginId, name), fn);
		let plugMap = this.pluginHelpers.get(pluginId);
		if (!plugMap) {
			plugMap = new Map();
			this.pluginHelpers.set(pluginId, plugMap);
		}
		plugMap.set(name, wrapped);
		const userHelperClaims = this.settings.userHelpersEnabled && name in this.userHelperFunctions;
		this.claimBareName(this.bareHelperOwner, pluginId, name, 'helper', userHelperClaims);
	}

	unregisterPluginHelper(pluginId: string, name: string): void {
		const plugMap = this.pluginHelpers.get(pluginId);
		if (!plugMap || !plugMap.has(name)) { return; }
		plugMap.delete(name);
		if (plugMap.size === 0) { this.pluginHelpers.delete(pluginId); }
		this.transferBareName(this.bareHelperOwner, this.pluginHelpers, pluginId, name, 'helper');
	}

	registerPluginBuiltIn(pluginId: string, name: string, provider: BuiltInProvider): void {
		let plugMap = this.pluginBuiltIns.get(pluginId);
		if (!plugMap) {
			plugMap = new Map();
			this.pluginBuiltIns.set(pluginId, plugMap);
		}
		plugMap.set(name, provider);
		this.claimBareName(this.bareBuiltInOwner, pluginId, name, 'built-in field', false);
	}

	unregisterPluginBuiltIn(pluginId: string, name: string): void {
		const plugMap = this.pluginBuiltIns.get(pluginId);
		if (!plugMap || !plugMap.has(name)) { return; }
		plugMap.delete(name);
		if (plugMap.size === 0) { this.pluginBuiltIns.delete(pluginId); }
		this.transferBareName(this.bareBuiltInOwner, this.pluginBuiltIns, pluginId, name, 'built-in field');
	}

	private claimBareName(
		ownerMap: Map<string, string>,
		pluginId: string,
		name: string,
		kind: 'helper' | 'built-in field',
		blockedByUser: boolean,
	): void {
		const prefixed = this.pluginPrefixedName(pluginId, name);
		if (blockedByUser) {
			this.errorLogger?.log({
				severity: 'warn',
				message: `Plugin '${pluginId}' registered ${kind} '${name}', but a user-written custom helper already claims that bare name. Only '${prefixed}' is available.`,
			});
			return;
		}
		const currentOwner = ownerMap.get(name);
		if (currentOwner === undefined) {
			ownerMap.set(name, pluginId);
		} else if (currentOwner !== pluginId) {
			this.errorLogger?.log({
				severity: 'warn',
				message: `Plugin '${pluginId}' registered ${kind} '${name}', but the bare name is already owned by plugin '${currentOwner}'. Only '${prefixed}' is available.`,
			});
		}
	}

	private transferBareName(
		ownerMap: Map<string, string>,
		sourceMap: Map<string, Map<string, unknown>>,
		pluginId: string,
		name: string,
		kind: 'helper' | 'built-in field',
	): void {
		if (ownerMap.get(name) !== pluginId) { return; }
		ownerMap.delete(name);
		for (const [otherPluginId, otherMap] of sourceMap) {
			if (otherMap.has(name)) {
				ownerMap.set(name, otherPluginId);
				this.errorLogger?.log({
					severity: 'info',
					message: `Bare ${kind} name '${name}' transferred from '${pluginId}' to '${otherPluginId}' on unregister.`,
				});
				return;
			}
		}
	}

	private _refreshTimer: number | null = null;
	private _queueCheckInterval: number | null = null;
	private _processingQueue: boolean = false;
	private _lastQueueCheck: number = 0;
	private _statusBarItem: HTMLElement | null = null;
	private _templateValidation: TemplateValidationController | null = null;

	private wrapHelper(name: string, fn: Function): Function {
		return (...args: unknown[]) => {
			try {
				return fn(...args);
			} catch (e: any) {
				console.error(`[Z2K Templates] Helper '${name}' threw:`, e);
				this.errorLogger?.log({
					severity: 'error',
					message: `Custom helper '${name}' threw an error: ${e.message}`,
					error: e,
				});
				return `[Error in ${name}]`;
			}
		};
	}

	// SECURITY: dynamic code execution via `new Function`
	//
	// loadUserHelpers and validateUserHelpers execute user-authored JavaScript
	// so users can register custom Handlebars helpers — the pattern Templater
	// established with `tp.user`.
	//
	// The code comes from `this.settings.userHelpers`: a settings textarea
	// the user typed into themselves. Never sourced from templates, vault
	// content, or remote URLs — templates have no path to dynamic execution.
	// Trust boundary matches installing any third-party Obsidian plugin.
	//
	// Mitigations: off by default (`userHelpersEnabled: false` in
	// DEFAULT_SETTINGS); opt-in surfaces a confirm modal in settings.tsx;
	// the setting is type-annotated `(ACE risk)` in utils.ts; errors are
	// caught and surfaced to the user via Notice.
	//
	// `new Function` over `eval` for fresh scope isolation. A sandboxed
	// iframe/Worker would break Handlebars' synchronous render contract and
	// the helpers' need for `app`/`obsidian`/`Handlebars` access.
	loadUserHelpers(code: string): { valid: boolean; error?: string; helperNames?: string[] } {
		const newHelpers: Record<string, Function> = {};
		const registerHelper = (name: string, fn: Function) => {
			newHelpers[name] = this.wrapHelper(name, fn);
		};
		const context = {
			app: this.app,
			obsidian: obsidian,
			moment,
			Handlebars,
			registerHelper,
		};
		try {
			new Function(...Object.keys(context), code)(...Object.values(context));
			const previousNames = Object.keys(this.userHelperFunctions);
			const newNames = Object.keys(newHelpers);
			this.userHelperFunctions = newHelpers;

			// User helpers win over plugins for bare names — demote any plugin currently holding
			// a bare name that a new user helper just claimed.
			for (const name of newNames) {
				const priorOwner = this.bareHelperOwner.get(name);
				if (priorOwner !== undefined) {
					this.bareHelperOwner.delete(name);
					this.errorLogger?.log({
						severity: 'warn',
						message: `User-written helper '${name}' is now claiming the bare name; plugin '${priorOwner}' is demoted to '${this.pluginPrefixedName(priorOwner, name)}' only.`,
					});
				}
			}

			// For names the user just released, grant bare to the first plugin (insertion order)
			// that still has a registration for that name. Keeps "first waiting in line wins"
			// consistent whether the released owner was a plugin or a user helper.
			for (const name of previousNames) {
				if (name in newHelpers) { continue; }
				if (this.bareHelperOwner.has(name)) { continue; }
				for (const [otherPluginId, otherMap] of this.pluginHelpers) {
					if (otherMap.has(name)) {
						this.bareHelperOwner.set(name, otherPluginId);
						this.errorLogger?.log({
							severity: 'info',
							message: `Bare helper name '${name}' reclaimed by plugin '${otherPluginId}' after user-written helper was removed.`,
						});
						break;
					}
				}
			}

			return { valid: true, helperNames: newNames };
		} catch (e: any) {
			return { valid: false, error: e.message };
		}
	}

	validateGlobalBlock(code: string): { valid: boolean; error?: string; message?: string } {
		if (!code || code.trim() === "") {
			return { valid: true, message: "Empty" };
		}
		try {
			Handlebars.parse(code);
			return { valid: true, message: "No syntax issues" };
		} catch (e: any) {
			return { valid: false, error: e.message };
		}
	}

	// See the security notes above loadUserHelpers — same `new Function`
	// pattern, but for read-only validation (settings UI syntax check),
	// not for committing helpers to plugin state.
	validateUserHelpers(code: string): { valid: boolean; error?: string; message?: string } {
		if (!code || code.trim() === "") {
			return { valid: true, message: "Empty" };
		}
		const newHelpers: Record<string, Function> = {};
		const registerHelper = (name: string, fn: Function) => {
			newHelpers[name] = fn;
		};
		const context = {
			app: this.app,
			obsidian: obsidian,
			moment,
			Handlebars,
			registerHelper,
		};
		try {
			new Function(...Object.keys(context), code)(...Object.values(context));
			const names = Object.keys(newHelpers);
			return {
				valid: true,
				message: names.length > 0
					? `${names.length} helper${names.length !== 1 ? 's' : ''} registered: ${names.join(', ')}`
					: "No helpers registered"
			};
		} catch (e: any) {
			return { valid: false, error: e.message };
		}
	}

	async onload() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.api = createApi(this);
		this.templateEngine = new Z2KTemplateEngine();
		this.errorLogger = new ErrorLogger(this.app, this.settings);
		// Load user-defined custom helpers (only when enabled)
		if (this.settings.userHelpersEnabled && this.settings.userHelpers && this.settings.userHelpers.trim() !== "") {
			const result = this.loadUserHelpers(this.settings.userHelpers);
			if (!result.valid) {
				console.error('[Z2K Templates] Custom helpers error:', result.error);
				new ErrorModal(this.app, new Error(`Failed to load custom helpers: ${result.error}`)).open();
			}
		}
		this.refreshMainCommands(false); // Don't delete existing, since none exist yet
		this.refreshDynamicCommands(false);
		this.registerEvents();
		this.addSettingTab(new Z2KTemplatesSettingTab(this.app, this));
		this.addRibbonIcon('file-plus', `Create new ${cardRefNameLower(this.settings)} from template`,
			() => this.runWithErrorHandling(() => this.createCard({ openInEditor: true })));
		this.registerEditorExtension(handlebarsOverlay());
		this._templateValidation = new TemplateValidationController(this);
		this.registerEditorExtension(this._templateValidation.getEditorExtensions());
		this.registerEvent(this.app.workspace.on('active-leaf-change', () => this._templateValidation?.onActiveLeafChange()));
		this.registerEvent(this.app.vault.on('modify', (f) => {
			if (f instanceof TFile) { this._templateValidation?.onFileModify(f); }
		}));
		this.registerURIHandler();
		this._statusBarItem = this.addStatusBarItem();

		// Initialize offline command queue
		await this.recoverFromCrash();
		this.startQueueProcessor();
		// Restore template extension visibility state.
		// Note: viewRegistry.registerExtensions is an internal Obsidian API (not in the public types).
		// We use it because there is no public way to make Obsidian treat a custom file extension as
		// markdown. Without this, .template / .block files cannot be opened in the markdown editor.
		// If/when Obsidian adds a public alternative, swap in the public call. Risk: if Obsidian
		// removes or renames this internal method, the toggle stops working — feature degrades
		// (files become unopenable as markdown) but the rest of the plugin keeps working.
		if (this.settings.useTemplateFileExtensions && this.settings.templateExtensionsVisible) {
			// @ts-expect-error: internal API — see comment above
			this.app.viewRegistry.registerExtensions(["template", "block"], "markdown");
		}
		// First-run welcome modal. Defer until after layout settles so we don't open a modal
		// during Obsidian's startup paint pass (which can cause focus-trap issues).
		// Persist the flag regardless of whether the modal actually rendered, so a broken
		// modal can never repeatedly re-fire on every plugin enable.
		if (!this.settings.hasSeenWelcome) {
			this.app.workspace.onLayoutReady(() => {
				this.settings.hasSeenWelcome = true;
				void this.saveData(this.settings);
				try {
					new WelcomeModal(this.app, DOCS_BASE_URL).open();
				} catch (e) {
					console.error('[Z2K Templates] Welcome modal failed to open:', e);
				}
			});
		}
	}
	onunload() {
		if (this._queueCheckInterval !== null) {
			window.clearInterval(this._queueCheckInterval);
			this._queueCheckInterval = null;
		}
		this._templateValidation?.destroy();
		this._templateValidation = null;
	}

	refreshMainCommands(deleteExisting: boolean = true) {
		let mainCommands: Command[] = [
			{
				id: 'create-new-card',
				name: `Create new ${cardRefNameLower(this.settings)}`,
				callback: () => this.runWithErrorHandling(() => this.createCard({ openInEditor: true })),
			},
			{
				id: 'create-card-from-selection',
				name: `Create ${cardRefNameLower(this.settings)} from selected text`,
				editorCheckCallback: (checking, editor) => {
					const selectedText = editor.getSelection();
					if (checking) { return selectedText.length > 0; } // Only enable if text is selected
					this.runWithErrorHandling(() => this.createCard({ fromSelection: true, openInEditor: true }));
				},
			},
			{
				id: 'apply-template-to-file',
				name: `Apply template to ${cardRefNameLower(this.settings)}`,
				checkCallback: (checking) => {
					const activeFile = this.app.workspace.getActiveFile();
					// Only enable if there's an active file and it's a markdown file
					if (checking) { return !!activeFile && activeFile.extension === 'md'; }
					this.runWithErrorHandling(() => this.createCard({ sourceFile: activeFile as TFile, openInEditor: true }));
				},
			},
			{
				id: 'continue-filling-card',
				name: `Continue filling ${cardRefNameLower(this.settings)}`,
				checkCallback: (checking) => {
					const activeFile = this.app.workspace.getActiveFile();
					if (checking) { return !!activeFile && activeFile.extension === 'md'; }
					this.runWithErrorHandling(() => this.continueCard({ existingFile: activeFile as TFile }));
				},
			},
			{
				id: 'finalize-card',
				name: `Finalize ${cardRefNameLower(this.settings)}`,
				checkCallback: (checking) => {
					const activeFile = this.app.workspace.getActiveFile();
					if (checking) { return !!activeFile && activeFile.extension === 'md'; }
					this.runWithErrorHandling(() => this.continueCard({ existingFile: activeFile as TFile, promptMode: "none", finalize: true }));
				},
			},
			{
				id: 'insert-block',
				name: 'Insert block template',
				editorCheckCallback: (checking, editor) => {
					const file = this.app.workspace.getActiveFile();
					if (checking) {
						// Only enable if there's an active markdown file and no text is selected
						return !!file && file.extension === 'md' && editor.getSelection().length === 0;
					}
					this.runWithErrorHandling(() => this.insertBlock());
				}
			},
			{
				id: 'insert-block-from-selection',
				name: 'Insert block template from selection',
				editorCheckCallback: (checking, editor) => {
					const file = this.app.workspace.getActiveFile();
					if (checking) {
						// Only enable if there's an active markdown file and text is selected
						return !!file && file.extension === 'md' && editor.getSelection().length > 0;
					}
					this.runWithErrorHandling(() => this.insertBlock({ fromSelection: true }));
				}
			},
			{
				id: 'process-command-queue',
				name: 'Process command queue now',
				checkCallback: (checking) => {
					if (!this.settings.offlineCommandQueueEnabled) return false;
					if (checking) return true;
					if (this._processingQueue) {
						new Notice('Command queue is already being processed');
						return;
					}
					this.checkAndProcessQueue();
				},
			},
			{
				id: "convert-to-document-template",
				name: "Convert to document template",
				checkCallback: (checking) => {
					let file = this.app.workspace.getActiveFile();
					if (checking) { return !!file && this.getFileTemplateTypeSync(file) !== "document-template"; }
					this.convertFileTemplateType(file as TFile, "document-template");
				},
			},
			{
				id: "convert-to-block-template",
				name: "Convert to block template",
				checkCallback: (checking) => {
					let file = this.app.workspace.getActiveFile();
					if (checking) { return !!file && this.getFileTemplateTypeSync(file) !== "block-template"; }
					this.convertFileTemplateType(file as TFile, "block-template");
				},
			},
			{
				id: "switch-to-md-extension",
				name: "Switch to .md extension",
				checkCallback: (checking) => {
					let file = this.app.workspace.getActiveFile();
					// Only show if file has .template or .block extension
					if (checking) { return !!file && (file.extension === "template" || file.extension === "block"); }
					this.convertToMarkdownTemplate(file as TFile);
				},
			},
			{
				id: "convert-to-content-file",
				name: "Convert to content file",
				checkCallback: (checking) => {
					let file = this.app.workspace.getActiveFile();
					if (checking) { return !!file && this.getFileTemplateTypeSync(file) !== "content-file"; }
					this.convertFileTemplateType(file as TFile, "content-file");
				},
			},
			{
				id: "toggle-template-visibility",
				name: this.settings.templateExtensionsVisible ? "Hide .template and .block files" : "Show .template and .block files",
				checkCallback: (checking) => {
					// Only show if useTemplateFileExtensions is enabled
					if (checking) { return this.settings.useTemplateFileExtensions; }
					this.toggleTemplateExtensionsVisibility();
				},
			}

		]
		if (deleteExisting) {
			for (const cmd of mainCommands) {
				this.removeCommand(cmd.id);
			}
		}
		for (const cmd of mainCommands) {
			this.addCommand(cmd);
		}
	}

	refreshDynamicCommands(deleteExisting: boolean = true) {
		for (const cmd of this.settings.quickCommands) {
			if (deleteExisting) {
				this.removeCommand(cmd.id); // Just returns if not found
			}
		}
		// Quick Commands for creating cards or inserting blocks
		for (const cmd of this.settings.quickCommands) {
			if (!cmd.id || !cmd.name) { continue; }
			const displayName = `Quick: ${cmd.name}`;
			if (cmd.action === "insert") {
				// Insert commands require an active editor (for cursor position)
				this.addCommand({
					id: cmd.id,
					name: displayName,
					editorCheckCallback: (checking) => {
						const file = this.app.workspace.getActiveFile();
						if (checking) { return !!file && file.extension === 'md'; }
						this.executeQuickCommand(cmd);
					},
				});
			} else {
				this.addCommand({
					id: cmd.id,
					name: displayName,
					callback: () => this.executeQuickCommand(cmd),
				});
			}
		}
	}
	// Resolve a folder reference that may be a full path, partial path, or just a name
	private resolveQuickCommandFolder(input: string): TFolder | null | 'ambiguous' {
		const normalized = normalizeFullPath(input);
		// Try exact path first
		const exact = this.getFolder(normalized);
		if (exact) { return exact; }
		// Search by name/suffix match
		const matches: TFolder[] = [];
		for (const f of this.app.vault.getAllLoadedFiles()) {
			if (!(f instanceof TFolder) || f.isRoot()) { continue; }
			if (f.name === normalized || f.path.endsWith('/' + normalized)) {
				matches.push(f);
			}
		}
		if (matches.length === 1) { return matches[0]; }
		if (matches.length > 1) { return 'ambiguous'; }
		return null;
	}
	// Resolve a template reference that may be a full path, basename, or partial path
	private async resolveQuickCommandTemplate(input: string): Promise<PathFile | null | 'ambiguous'> {
		// Try exact path with extension resolution
		const resolved = await this.tryResolveWithExtensions(normalizeFullPath(input));
		if (resolved) { return resolved; }
		// Search by basename/suffix across all templates
		const normalized = normalizeFullPath(input);
		const templates = await this.getAllTemplates();
		const matches: PathFile[] = [];
		for (const t of templates) {
			if (t.file.basename === normalized || t.file.path.endsWith('/' + normalized) ||
				t.file.path.endsWith('/' + normalized + '.md') ||
				t.file.path.endsWith('/' + normalized + '.template') ||
				t.file.path.endsWith('/' + normalized + '.block')) {
				matches.push(t.file);
			}
		}
		if (matches.length === 1) { return matches[0]; }
		if (matches.length > 1) { return 'ambiguous'; }
		return null;
	}
	async executeQuickCommand(cmd: Z2KTemplatesPluginSettings["quickCommands"][number]) {
		try {
			// Resolve folder (empty = prompt via createCard/insertBlock defaults)
			let folder: PathFolder | undefined;
			if (cmd.targetFolder) {
				const result = this.resolveQuickCommandFolder(cmd.targetFolder);
				if (result === 'ambiguous') {
					new ErrorModal(this.app, new Error(`Multiple folders match '${cmd.targetFolder}' — use a more specific path in Quick Command settings.`)).open();
					return;
				}
				if (!result) {
					new ErrorModal(this.app, new Error(`Target folder not found: ${cmd.targetFolder}`)).open();
					return;
				}
				folder = pathFolderFromTFolder(result);
			}
			// Resolve template (empty = prompt via createCard/insertBlock defaults)
			let template: PathFile | undefined;
			if (cmd.templateFile) {
				const result = await this.resolveQuickCommandTemplate(cmd.templateFile);
				if (result === 'ambiguous') {
					new ErrorModal(this.app, new Error(`Multiple templates match '${cmd.templateFile}' — use a more specific path in Quick Command settings.`)).open();
					return;
				}
				if (!result) {
					new ErrorModal(this.app, new Error(`Template not found: ${cmd.templateFile}`)).open();
					return;
				}
				template = result;
			}
			// Resolve source text
			let fieldOverrides: Record<string, VarValueType> = {};
			let fromSelection = false;
			if (cmd.sourceText === "selection") {
				fromSelection = true;
			} else if (cmd.sourceText === "clipboard") {
				fieldOverrides.sourceText = await navigator.clipboard.readText();
			}
			if (cmd.action === "insert") {
				await this.insertBlock({
					templateFile: template,
					blockTypeFolder: folder,
					fieldOverrides,
					fromSelection,
				});
			} else {
				await this.createCard({
					cardTypeFolder: folder,
					templateFile: template,
					fieldOverrides,
					fromSelection,
					openInEditor: true,
				});
			}
		} catch (error) { this.handleErrors(error); }
	}

	queueRefreshCommands(delay=1000) {
		// 1s debounce so we don't churn while typing
		if (this._refreshTimer != null) { window.clearTimeout(this._refreshTimer); }
		this._refreshTimer = window.setTimeout(() => {
			this._refreshTimer = null;
			this.refreshMainCommands();
			this.refreshDynamicCommands();
		}, delay);
	}

	registerEvents() {
		// Context menu 'new card from selection' when text is selected
		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor) => {
				const selectedText = editor.getSelection();
				if (selectedText.length === 0) return;
				menu.addItem((item) => {
					item.setTitle(`Z2K: Create ${cardRefNameLower(this.settings)} from selection…`)
						.onClick(() => {
							this.runWithErrorHandling(() => this.createCard({ fromSelection: true, openInEditor: true }));
						});
				});
			})
		);
		// Context menu 'create new card here'
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (!(folder instanceof TFolder)) return;
				menu.addItem((item) => {
					item.setTitle(`Z2K: Create new ${cardRefNameLower(this.settings)} here…`)
						.onClick(() => this.runWithErrorHandling(() => this.createCard({ cardTypeFolder: pathFolderFromTFolder(folder as TFolder), openInEditor: true })));
				});
			})
		);

		// Context menu for inserting a block template when no text is selected
		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor) => {
				const file = this.app.workspace.getActiveFile();
				if (!(file instanceof TFile) || file.extension !== 'md') return;
				const selectedText = editor.getSelection();
				if (selectedText.length > 0) return;
				menu.addItem((item) => {
					item.setTitle("Z2K: Insert block template…")
						.onClick(() => {
							this.runWithErrorHandling(() => this.insertBlock());
						});
				});
			})
		);

		// Context menu for inserting a block template when text is selected
		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor) => {
				const file = this.app.workspace.getActiveFile();
				if (!(file instanceof TFile) || file.extension !== 'md') return;
				const selectedText = editor.getSelection();
				if (selectedText.length === 0) return;
				menu.addItem((item) => {
					item.setTitle("Z2K: Insert block template from selection…")
						.onClick(() => {
							this.runWithErrorHandling(() => this.insertBlock({ fromSelection: true }));
						});
				});
			})
		);

		// Template conversion context menu in file explorer
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile) || this.getFileTemplateTypeSync(file) === "document-template") { return; }
				menu.addItem((item) => {
					item.setTitle("Z2K: Convert to document template")
						.onClick(() => this.convertFileTemplateType(file as TFile, "document-template"));
				});
			})
		);
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile) || this.getFileTemplateTypeSync(file) === "block-template") { return; }
				menu.addItem((item) => {
					item.setTitle("Z2K: Convert to block template")
						.onClick(() => this.convertFileTemplateType(file as TFile, "block-template"));
				});
			})
		);
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				// Only show for .template or .block files
				if (!(file instanceof TFile) || (file.extension !== "template" && file.extension !== "block")) { return; }
				menu.addItem((item) => {
					item.setTitle("Z2K: Switch to .md extension")
						.onClick(() => this.convertToMarkdownTemplate(file as TFile));
				});
			})
		);
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile) || this.getFileTemplateTypeSync(file) === "content-file") { return; }
				menu.addItem((item) => {
					item.setTitle("Z2K: Convert to content file")
						.onClick(() => this.convertFileTemplateType(file as TFile, "content-file"));
				});
			})
		);
		// Continue filling / Finalize context menu items
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile) || file.extension !== "md") { return; }
				menu.addItem((item) => {
					item.setTitle(`Z2K: Continue filling this ${cardRefNameLower(this.settings)}`)
						.onClick(() => this.runWithErrorHandling(() => this.continueCard({ existingFile: file as TFile })));
				});
			})
		);
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile) || file.extension !== "md") { return; }
				menu.addItem((item) => {
					item.setTitle(`Z2K: Finalize this ${cardRefNameLower(this.settings)}`)
						.onClick(() => this.runWithErrorHandling(() => this.continueCard({ existingFile: file as TFile, promptMode: "none", finalize: true })));
				});
			})
		);
	}

	registerURIHandler() {
		this.registerObsidianProtocolHandler("z2k-templates", async (rawParams) => {
			await this.runWithErrorHandling(async () => {
				// URL-decode all parameters and pass to processCommand
				const cmdParams: CommandParams = {};
				for (const key in rawParams) {
					cmdParams[key] = decodeURIComponent(rawParams[key]);
				}
				await this.processCommand(cmdParams, true);
			});
		});
	}

	// Decode base64, supporting both standard and URL-safe variants
	private decodeBase64(str: string): string {
		const normalized = str.replace(/-/g, '+').replace(/_/g, '/');
		return atob(normalized);
	}

	// Main command processor - accepts typed parameters and routes to appropriate handlers
	// Called by: registerURIHandler (from URI), processQueueFile (from offline queue)
	// Non-field parameters can be templatePath, TemplatePath, template-path, template_path, etc. for robustness
	// but we should just say templatePath in the docs for simplicity in the docs.
	async processCommand(rawParams: CommandParams, showNotices: boolean, isJsonSource: boolean = false): Promise<CommandResult> {
		const cps: Record<string, any> = {};  // Command parameters
		const templateData: Record<string, any> = {};  // Template field data (preserves original keys)

		const knownKeys = ['cmd', 'templatePath', 'blockPath', 'templateContents', 'blockContents',
			'existingFilePath', 'destDir', 'destHeader', 'prompt', 'finalize', 'location',
			'fieldData', 'fieldData64', 'jsonData', 'jsonData64',
			'openInEditor',
			'maxRetries', 'retryDelay'];

		// Separate command params from template data
		for (const k in rawParams) {
			const normalized = k.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
			const matchedKey = knownKeys.find(key => key.toLowerCase() === normalized);
			if (matchedKey) {
				cps[matchedKey] = rawParams[k];
			} else {
				templateData[k] = rawParams[k];  // Keep original key for template
			}
		}

		// Handle fieldData64 (base64-encoded JSON) - decoded into fieldData if fieldData not present
		if (cps.fieldData64 && !cps.fieldData) {
			try {
				cps.fieldData = this.decodeBase64(cps.fieldData64);
			} catch {
				throw new TemplatePluginError("Command: Invalid fieldData64 (must be valid base64)");
			}
		}

		// Handle fieldData (can be string or object, but not array/null)
		let additionalFields: Record<string, VarValueType> = {};
		if (cps.fieldData) {
			let data = cps.fieldData;
			// Parse if string
			if (typeof data === 'string') {
				// Check if it's a file path (doesn't start with '{')
				if (!data.trim().startsWith('{')) {
					// Try to load as vault-relative file path
					const jsonFile = this.getFile(data);
					if (!jsonFile) {
						throw new TemplatePluginError(`Command: fieldData file not found: ${data}`);
					}
					try {
						const fileContents = await this.app.vault.read(jsonFile);
						data = JSON.parse(fileContents);
					} catch (e) {
						throw new TemplatePluginError(`Command: Failed to read or parse JSON from file: ${data}`);
					}
				} else {
					// It's inline JSON, parse it
					try {
						data = JSON.parse(data);
					} catch {
						throw new TemplatePluginError("Command: Invalid fieldData (must be valid JSON or vault-relative file path)");
					}
				}
			}
			// Validate is plain object (not array/null)
			if (!data || typeof data !== "object" || Array.isArray(data)) {
				throw new TemplatePluginError("Command: fieldData must be an object (not array or null)");
			}
			additionalFields = data;
		}

		// Merge field data
		const fieldOverrides: Record<string, VarValueType> = { ...additionalFields, ...templateData };
		// Only convert URI string values, not JSON-sourced values (already typed)
		const uriKeys: Set<string> = isJsonSource ? new Set() : new Set(Object.keys(templateData));

		// Validate cmd parameter
		if (!cps.cmd || typeof cps.cmd !== 'string') {
			throw new TemplatePluginError("Command: Missing 'cmd' parameter");
		}
		const cmd = cps.cmd.trim().toLowerCase();
		if (!cmd) {
			throw new TemplatePluginError("Command: 'cmd' parameter cannot be empty");
		}

		// Handle 'fromJson' command - parse JSON and recursively call processCommand
		if (cmd === "fromjson") {
			// Decode jsonData64 if jsonData not present
			let jsonStr = cps.jsonData;
			if (!jsonStr && cps.jsonData64) {
				try {
					jsonStr = this.decodeBase64(cps.jsonData64);
				} catch {
					throw new TemplatePluginError("Command: Invalid jsonData64 (must be valid base64)");
				}
			}
			if (!jsonStr) {
				throw new TemplatePluginError("Command: 'fromJson' cmd requires 'jsonData' or 'jsonData64' parameter");
			}
			try {
				const parsedParams = JSON.parse(jsonStr);
				if (!parsedParams || typeof parsedParams !== "object" || Array.isArray(parsedParams)) {
					throw new TemplatePluginError("Command: 'jsonData' must be a valid JSON object (not array or null)");
				}
				// Recursive call with parsed JSON (inherit showNotices, mark as JSON source)
				return await this.processCommand(parsedParams as CommandParams, showNotices, true);
			} catch (e) {
				if (e instanceof TemplatePluginError) throw e;
				throw new TemplatePluginError("Command: Invalid jsonData (must be valid JSON)");
			}
		}

		// Validate and convert prompt mode
		let promptMode: "none"|"remaining"|"all"|undefined = undefined;
		if (cps.prompt) {
			const promptStr = String(cps.prompt).toLowerCase();
			if (!["none", "remaining", "all"].includes(promptStr)) {
				throw new TemplatePluginError(`Command: Invalid prompt mode '${cps.prompt}' (must be 'none', 'remaining', or 'all')`);
			}
			promptMode = promptStr as "none"|"remaining"|"all";
		}

		// Validate and convert finalize (can be boolean or string "true"/"false")
		let finalize: boolean | undefined = undefined;
		if (cps.finalize !== undefined) {
			if (typeof cps.finalize === 'boolean') {
				finalize = cps.finalize;
			} else if (typeof cps.finalize === 'string') {
				const finalizeStr = cps.finalize.toLowerCase();
				if (["true", "1", "yes"].includes(finalizeStr)) {
					finalize = true;
				} else if (["false", "0", "no"].includes(finalizeStr)) {
					finalize = false;
				} else {
					throw new TemplatePluginError(`Command: Invalid finalize value '${cps.finalize}' (must be boolean or 'true'/'false')`);
				}
			} else {
				throw new TemplatePluginError(`Command: Invalid finalize type (must be boolean or string)`);
			}
		}

		// Validate and convert openInEditor (can be boolean or string "true"/"false")
		let openInEditor: boolean = false;
		if (cps.openInEditor !== undefined) {
			if (typeof cps.openInEditor === 'boolean') {
				openInEditor = cps.openInEditor;
			} else if (typeof cps.openInEditor === 'string') {
				const oieStr = cps.openInEditor.toLowerCase();
				if (["true", "1", "yes"].includes(oieStr)) {
					openInEditor = true;
				} else if (["false", "0", "no"].includes(oieStr)) {
					openInEditor = false;
				} else {
					throw new TemplatePluginError(`Command: Invalid openInEditor value '${cps.openInEditor}' (must be boolean or 'true'/'false')`);
				}
			} else {
				throw new TemplatePluginError(`Command: Invalid openInEditor type (must be boolean or string)`);
			}
		}

		// Validate and convert location (can be string or number)
		let location: "file-top"|"file-bottom"|"header-top"|"header-bottom"|number|undefined = undefined;
		if (cps.location !== undefined) {
			const validStrings = ["file-top", "file-bottom", "header-top", "header-bottom"];
			if (typeof cps.location === 'string') {
				const locationLower = cps.location.toLowerCase();
				if (validStrings.includes(locationLower)) {
					location = locationLower as "file-top"|"file-bottom"|"header-top"|"header-bottom";
				} else {
					// Try to parse as number
					const lineNum = parseInt(cps.location, 10);
					if (isNaN(lineNum)) {
						throw new TemplatePluginError(`Command: Invalid location '${cps.location}' (must be 'file-top', 'file-bottom', 'header-top', 'header-bottom', or a line number)`);
					}
					location = lineNum;
				}
			} else if (typeof cps.location === 'number') {
				if (isNaN(cps.location) || !Number.isInteger(cps.location)) {
					throw new TemplatePluginError(`Command: Invalid location '${cps.location}' (must be a valid integer line number)`);
				}
				location = cps.location;
			} else {
				throw new TemplatePluginError(`Command: Invalid location type (must be string or number)`);
			}
		}

		// Resolve template file (support both templatePath and blockPath)
		// Checks indexed files first, then falls back to adapter for hidden (dot-prefixed) paths
		let templateFile: PathFile | undefined;
		const templatePath = cps.templatePath || cps.blockPath;
		if (templatePath) {
			const normalizedPath = normalizeFullPath(templatePath);
			const tFile = this.getFile(normalizedPath);
			if (tFile) {
				templateFile = pathFileFromTFile(tFile);
			} else if (await this.app.vault.adapter.exists(normalizedPath)) {
				templateFile = pathFileFrom(normalizedPath);
			} else {
				throw new TemplatePluginError(`Command: Template not found:\n${templatePath}`);
			}
		}

		// Resolve inline template content (alternative to templatePath/blockPath)
		const templateContent: string | undefined = cps.templateContents || cps.blockContents || undefined;
		if (templateContent && templateFile) {
			throw new TemplatePluginError("Command: Cannot specify both templatePath/blockPath and templateContents/blockContents");
		}

		// Resolve existing file
		let existingFile: TFile | undefined;
		if (cps.existingFilePath) {
			existingFile = this.getFile(cps.existingFilePath) || undefined;
			if (!existingFile && cmd !== "upsert") {
				throw new TemplatePluginError(`Command: File not found:\n${cps.existingFilePath}`);
			}
		}

		// Resolve destination folder
		let destDir: PathFolder | undefined = templateFile
			? this.getTemplateCardType(templateFile)
			: undefined;
		if (cps.destDir) {
			destDir = pathFolderFromTFolder(await this.createFolder(cps.destDir));
		}

		// Route commands
		if (cmd === "new") {
			if (!templateFile && !templateContent) {
				throw new TemplatePluginError("Command: 'new' cmd requires 'templatePath' or 'templateContents'");
			}
			const cardTypeFolder = templateFile
				? this.getTemplateCardType(templateFile)
				: (destDir ?? pathFolderFrom(""));
			return await this.createCard({
				cardTypeFolder,
				templateFile,
				templateContent,
				fieldOverrides,
				uriKeys,
				promptMode,
				destDir,
				finalize,
				openInEditor,
				showNotices,
			});
		}

		if (cmd === "continue") {
			if (!existingFile) {
				throw new TemplatePluginError("Command: 'continue' cmd requires 'existingFilePath'");
			}
			return await this.continueCard({
				existingFile,
				fieldOverrides,
				uriKeys,
				promptMode,
				finalize,
				openInEditor,
				showNotices,
			});
		}

		if (cmd === "upsert") {
			if (!templateFile && !templateContent) {
				throw new TemplatePluginError("Command: 'upsert' cmd requires 'templatePath' or 'templateContents'");
			}
			if (!cps.existingFilePath) {
				throw new TemplatePluginError("Command: 'upsert' cmd requires 'existingFilePath'");
			}
			if (existingFile) {
				// File exists → continue path
				return await this.continueCard({
					existingFile, fieldOverrides, uriKeys, promptMode, finalize, openInEditor, showNotices,
				});
			} else {
				// File doesn't exist → create at exact path
				const targetPath = normalizeFullPath(cps.existingFilePath);
				const lastSlash = targetPath.lastIndexOf('/');
				const folderPath = lastSlash >= 0 ? targetPath.substring(0, lastSlash) : '';
				const basename = targetPath.substring(lastSlash + 1).replace(/\.md$/, '');
				const cardTypeFolder = templateFile
					? this.getTemplateCardType(templateFile)
					: (destDir ?? pathFolderFrom(""));
				const targetFolder = pathFolderFromTFolder(await this.createFolder(folderPath));
				return await this.createCard({
					cardTypeFolder, templateFile, templateContent, fieldOverrides, uriKeys,
					promptMode, destDir: targetFolder, finalize,
					existingTitle: basename,
					openInEditor,
					showNotices,
				});
			}
		}

		if (cmd === "insertblock") {
			if (!existingFile) {
				throw new TemplatePluginError("Command: 'insertblock' cmd requires 'existingFilePath'");
			}
			if (location === undefined && !cps.destHeader) {
				throw new TemplatePluginError("Command: 'insertblock' cmd requires 'location' or 'destHeader'");
			}
			if (location === "header-top" || location === "header-bottom") {
				if (!cps.destHeader) {
					throw new TemplatePluginError(`Command: destHeader is required when location is '${location}'`);
				}
			}

			return await this.insertBlock({
				templateFile,
				templateContent,
				existingFile,
				destHeader: cps.destHeader,
				location,
				fieldOverrides,
				uriKeys,
				promptMode,
				finalize,
				openInEditor,
				showNotices,
			});
		}

		throw new TemplatePluginError(`Command: Unknown cmd '${cmd}'`);
	}

	//// Offline Command Queue
	private resolveQueueFilePath(path: string): string | null {
		if (!path) return null;
		// Check if absolute path (Windows: C:\ or /, Unix: /)
		if (path.startsWith('/') || /^[A-Za-z]:/.test(path)) {
			return path;  // Absolute path - use as-is (desktop only)
		}
		// Vault-relative path
		return path;
	}

	async updateQueueDirPath(newPath: string) {
		const oldPath = this.settings.offlineCommandQueueDir;
		if (oldPath === newPath) { return; }

		const adapter = this.app.vault.adapter;
		const oldDirPath = oldPath ? this.resolveQueueFilePath(oldPath) : null;
		const newDirPath = newPath ? this.resolveQueueFilePath(newPath) : null;

		// Move existing queue contents before persisting the setting, so a failure
		// leaves both setting and files at their old location (recoverable).
		if (oldDirPath && newDirPath && oldDirPath !== newDirPath && await adapter.exists(oldDirPath)) {
			const wasProcessing = this._processingQueue;
			this._processingQueue = true;
			try {
				await this.moveQueueContents(oldDirPath, newDirPath);
			} catch (err) {
				this._processingQueue = wasProcessing;
				await this.log('error', true,
					`Failed to move queue files from ${oldDirPath} to ${newDirPath}. Setting unchanged.`,
					err instanceof Error ? err : undefined);
				return;
			}
			this._processingQueue = wasProcessing;
		}

		this.settings.offlineCommandQueueDir = newPath;
		await this.saveData(this.settings);
	}

	private async moveQueueContents(oldDir: string, newDir: string): Promise<void> {
		const adapter = this.app.vault.adapter;
		if (!(await adapter.exists(newDir))) {
			await adapter.mkdir(newDir);
		}

		const listing = await adapter.list(oldDir);
		const skipped: string[] = [];

		for (const filePath of listing.files) {
			const basename = filePath.split('/').pop()!;
			const targetPath = `${newDir}/${basename}`;
			if (await adapter.exists(targetPath)) {
				skipped.push(basename);
				continue;
			}
			await adapter.rename(filePath, targetPath);
		}

		// Subfolders (e.g., done/, failed/) move whole; collisions skipped without recursive merge.
		for (const folderPath of listing.folders) {
			const basename = folderPath.split('/').pop()!;
			const targetPath = `${newDir}/${basename}`;
			if (await adapter.exists(targetPath)) {
				skipped.push(`${basename}/`);
				continue;
			}
			await adapter.rename(folderPath, targetPath);
		}

		const remaining = await adapter.list(oldDir);
		if (remaining.files.length === 0 && remaining.folders.length === 0) {
			await adapter.rmdir(oldDir, false);
		}

		if (skipped.length > 0) {
			await this.log('warn', true,
				`Queue move: ${skipped.length} item(s) skipped due to name collision in ${newDir}: ${skipped.join(', ')}. Manually move from ${oldDir}.`);
		}
	}

	private startQueueProcessor() {
		if (!this.settings.offlineCommandQueueDir) return;
		// Set initial lastQueueCheck to now (delays first scan by frequency duration)
		this._lastQueueCheck = Date.now();
		// Meta-timer: check every second if it's time to process
		this._queueCheckInterval = window.setInterval(() => {
			if (!this.settings.offlineCommandQueueEnabled) return;
			const freqMs = parseDuration(this.settings.offlineCommandQueueFrequency, 0);
			if (freqMs === 0) return; // Manual only (blank or invalid)
			const now = Date.now();
			if (now >= this._lastQueueCheck + freqMs) {
				this._lastQueueCheck = now;
				this.checkAndProcessQueue();
			}
		}, 1000);
	}

	private async recoverFromCrash() {
		if (!this.settings.offlineCommandQueueDir) return;

		const dirPath = this.resolveQueueFilePath(this.settings.offlineCommandQueueDir);
		if (!dirPath) return;

		const adapter = this.app.vault.adapter;
		if (!(await adapter.exists(dirPath))) return;

		// Look for any .processing.jsonl files left from crash
		const files = await adapter.list(dirPath);
		for (const file of files.files) {
			if (file.endsWith('.processing.jsonl')) {
				await this.processJsonlFile(file);
			}
		}
	}

	private async checkAndProcessQueue() {
		if (this._processingQueue || !this.settings.offlineCommandQueueDir) return;
		if (!this.settings.offlineCommandQueueEnabled) return;
		const dirPath = this.resolveQueueFilePath(this.settings.offlineCommandQueueDir);
		if (!dirPath) return;
		const adapter = this.app.vault.adapter;
		if (!(await adapter.exists(dirPath))) return;
		// Verify it's actually a directory
		const stat = await adapter.stat(dirPath);
		if (!stat || stat.type !== 'folder') {
			await this.log('error', false, `Queue path is not a directory: ${dirPath}`);
			return;
		}
		this._processingQueue = true;
		this.updateStatusBar('⏳ Processing commands...');
		try {
			// Get all files in queue directory
			const listing = await adapter.list(dirPath);
			// Clean up old archives first (scans done/ subfolder)
			await this.cleanupOldArchives();
			// Filter for .json and .jsonl files (excluding special files)
			const queueFiles = listing.files.filter(f =>
				(f.endsWith('.json') || f.endsWith('.jsonl')) &&
				!f.endsWith('.retry.json') &&
				!f.endsWith('.processing.jsonl')
			);
			if (queueFiles.length === 0) {
				return;
			}
			// Get file stats and sort by birth time (creation time)
			const fileStats = await Promise.all(
				queueFiles.map(async (file) => ({
					path: file,
					stat: await adapter.stat(file)
				}))
			);
			fileStats.sort((a, b) => (a.stat?.ctime || 0) - (b.stat?.ctime || 0));
			const pauseMs = parseDuration(this.settings.offlineCommandQueuePause, 0);
			// Process each file
			for (let i = 0; i < fileStats.length; i++) {
				const { path: filePath } = fileStats[i];
				// Check .delay. filename - skip if not ready yet
				const basename = filePath.split('/').pop() || '';
				const delayUntil = parseDelayFromFilename(basename);
				if (delayUntil !== null && delayUntil > Date.now()) {
					continue; // Not ready yet
				}
				// Check for retry sidecar - skip if not ready (only applies to .json files)
				if (filePath.endsWith('.json')) {
					const retryPath = filePath.replace(/\.json$/, '.retry.json');
					if (await adapter.exists(retryPath)) {
						const retryData = JSON.parse(await adapter.read(retryPath)) as RetryMetadata;
						if (retryData.nextRetryAfter > Date.now()) {
							continue; // Not ready to retry yet
						}
					}
				}
				// Process the file
				if (filePath.endsWith('.jsonl')) {
					await this.processJsonlFile(filePath);
				} else if (filePath.endsWith('.json')) {
					await this.processJsonFile(filePath);
				}
				// Pause between files (but not after the last one)
				if (pauseMs > 0 && i < fileStats.length - 1) {
					await sleep(pauseMs);
				}
			}
		} finally {
			this._processingQueue = false;
			this.updateStatusBar('');
		}
	}

	private async processJsonFile(filePath: string) {
		const adapter = this.app.vault.adapter;
		const dirPath = this.resolveQueueFilePath(this.settings.offlineCommandQueueDir);
		if (!dirPath) return;

		let cmdParams: CommandParams;
		try {
			const content = await adapter.read(filePath);
			cmdParams = JSON.parse(content) as CommandParams;
		} catch (parseError) {
			// Invalid JSON - log and rename to .TIMESTAMP.failed.json
			await this.log('error', false, `Invalid JSON in command file ${filePath}`);
			const failedPath = await this.getFailedPath(filePath);
			await adapter.rename(filePath, failedPath);
			return;
		}

		try {
			// Execute command (JSON source - don't convert string types)
			await this.processCommand(cmdParams, false, true);
			// Success - archive or delete based on setting
			const archiveDurationMs = parseDuration(this.settings.offlineCommandQueueArchiveDuration, 0);
			if (archiveDurationMs > 0) {
				// Archive: rename to name.TIMESTAMP.done.json
				const archivePath = await this.getArchivePath(filePath);
				await adapter.rename(filePath, archivePath);
			} else {
				// Delete immediately
				await adapter.remove(filePath);
			}
			// Clean up retry sidecar if it exists
			const retryPath = filePath.replace(/\.json$/, '.retry.json');
			if (await adapter.exists(retryPath)) {
				await adapter.remove(retryPath);
			}
		} catch (e) {
			// Handle failure with retry logic
			await this.handleCommandFailure(filePath, e, cmdParams);
		}
	}

	private async processJsonlFile(filePath: string) {
		const adapter = this.app.vault.adapter;
		const dirPath = this.resolveQueueFilePath(this.settings.offlineCommandQueueDir);
		if (!dirPath) return;

		// Rename to .processing.jsonl
		const processingPath = filePath.replace(/\.jsonl$/, '.processing.jsonl');
		await adapter.rename(filePath, processingPath);

		try {
			const content = await adapter.read(processingPath);
			const lines = content.split('\n').filter(line => line.trim());
			const pauseMs = parseDuration(this.settings.offlineCommandQueuePause, 0);
			const failedLines: string[] = [];
			const succeededLines: string[] = [];
			// Process each line
			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				let cmdParams: CommandParams;
				try {
					cmdParams = JSON.parse(line) as CommandParams;
				} catch (parseError) {
					// Invalid JSON - log and collect
					await this.log('error', false, `Invalid JSON in command queue: ${line}`);
					failedLines.push(line);
					if (pauseMs > 0 && i < lines.length - 1) {
						await sleep(pauseMs);
					}
					continue;
				}
				try {
					await this.processCommand(cmdParams, false, true);
					succeededLines.push(line);
				} catch (e) {
					// Command execution failed - check if it has retry config
					const maxRetries = cmdParams.maxRetries || 0;
					if (maxRetries > 0 || maxRetries === -1) {
						// Create individual .json file for retry, preserving source batch name and line index
						const srcName = (processingPath.split('/').pop() || 'command')
							.replace(/\.processing\.jsonl$/, '');
						let ts = moment();
						let retryFilePath: string;
						do {
							retryFilePath = `${dirPath}/${srcName}.${i}.${ts.format('YYYY-MM-DD_HH-mm-ss')}.json`;
							ts.add(1, 'second');
						} while (await adapter.exists(retryFilePath));
						await adapter.write(retryFilePath, line);
						// Handle as failed command (creates .retry.json)
						await this.handleCommandFailure(retryFilePath, e, cmdParams);
					} else {
						// No retries - collect failed line
						await this.handleErrors(e, false);
						failedLines.push(line);
					}
				}
				// Pause between commands (but not after the last one)
				if (pauseMs > 0 && i < lines.length - 1) {
					await sleep(pauseMs);
				}
			}
			// Archive succeeded lines if archiving is enabled
			if (succeededLines.length > 0) {
				const archiveDurationMs = parseDuration(this.settings.offlineCommandQueueArchiveDuration, 0);
				if (archiveDurationMs > 0) {
					const archivePath = await this.getArchivePath(filePath);
					await adapter.write(archivePath, succeededLines.join('\n'));
				}
			}
			// Write failed lines to .failed.jsonl if any
			if (failedLines.length > 0) {
				const failedPath = await this.getFailedPath(filePath);
				await adapter.write(failedPath, failedLines.join('\n'));
			}
			// Done processing - delete .processing.jsonl
			await adapter.remove(processingPath);
		} catch (e) {
			// Error reading/processing file - rename back
			if (await adapter.exists(processingPath)) {
				await adapter.rename(processingPath, filePath);
			}
			throw e;
		}
	}

	private async handleCommandFailure(filePath: string, error: any, cmdParams?: CommandParams) {
		const adapter = this.app.vault.adapter;

		// Log error
		await this.handleErrors(error, false);

		// Read command to check retry config if not provided
		if (!cmdParams) {
			const content = await adapter.read(filePath);
			cmdParams = JSON.parse(content) as CommandParams;
		}

		const maxRetries = cmdParams.maxRetries || 0;
		const retryDelayMs = parseDuration(cmdParams.retryDelay || '0s', 0);

		if (maxRetries === 0) {
			// No retries configured - rename to .TIMESTAMP.failed.json
			const failedPath = await this.getFailedPath(filePath);
			await adapter.rename(filePath, failedPath);
			return;
		}

		// Check if retry metadata exists
		const retryPath = filePath.replace(/\.json$/, '.retry.json');
		let retryData: RetryMetadata;

		if (await adapter.exists(retryPath)) {
			// Existing retry - increment attempt
			retryData = JSON.parse(await adapter.read(retryPath)) as RetryMetadata;
			retryData.attempts++;
		} else {
			// First attempt
			retryData = {
				attempts: 1,
				nextRetryAfter: 0
			};
		}

		// Check if retries exhausted (-1 means retry forever)
		if (maxRetries !== -1 && retryData.attempts >= maxRetries) {
			// Rename to .TIMESTAMP.failed.json and delete retry metadata
			const failedPath = await this.getFailedPath(filePath);
			await adapter.rename(filePath, failedPath);
			await adapter.remove(retryPath);

			await this.log('error', false, `Command failed after ${retryData.attempts} attempts: ${filePath}`);
		} else {
			// Schedule next retry
			retryData.nextRetryAfter = Date.now() + retryDelayMs;

			// Save retry metadata
			await adapter.write(retryPath, JSON.stringify(retryData, null, 2));
		}
	}

	private updateStatusBar(text: string) {
		if (this._statusBarItem) {
			this._statusBarItem.setText(text);
		}
	}

	private async cleanupOldArchives() {
		const archiveDurationMs = parseDuration(this.settings.offlineCommandQueueArchiveDuration, 0);
		if (archiveDurationMs === 0) return; // Archives are deleted immediately, nothing to clean
		const queueDir = this.resolveQueueFilePath(this.settings.offlineCommandQueueDir);
		if (!queueDir) return;
		const doneDir = `${queueDir}/done`;
		const adapter = this.app.vault.adapter;
		if (!(await adapter.exists(doneDir))) return;
		const listing = await adapter.list(doneDir);
		const now = Date.now();
		// Find .TIMESTAMP.json/.jsonl files in done/ folder
		const archivePattern = /\.(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})\.jsonl?$/;
		for (const file of listing.files) {
			const match = file.match(archivePattern);
			if (!match) continue;
			const archiveTime = moment(match[1], 'YYYY-MM-DD_HH-mm-ss').valueOf();
			if (now > archiveTime + archiveDurationMs) {
				await adapter.remove(file);
			}
		}
	}

	private async getArchivePath(filePath: string): Promise<string> {
		return this.getTimestampedPath(filePath, 'done');
	}

	private async getFailedPath(filePath: string): Promise<string> {
		return this.getTimestampedPath(filePath, 'failed');
	}

	private async getTimestampedPath(filePath: string, suffix: 'done' | 'failed'): Promise<string> {
		const adapter = this.app.vault.adapter;
		// Determine extension (.json or .jsonl)
		const ext = filePath.endsWith('.jsonl') ? '.jsonl' : '.json';
		// Extract directory and filename
		const lastSlash = filePath.lastIndexOf('/');
		const queueDir = filePath.substring(0, lastSlash);
		const filename = filePath.substring(lastSlash + 1)
			.replace(/\.jsonl?$/, '')
			.replace(/\.\d{4}-\d{2}-\d{2}(?:_\d{2}-\d{2}-\d{2})?\.delay$/, '')
			.replace(/\.\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/, '');
		// Ensure subfolder exists
		const subfolderPath = `${queueDir}/${suffix}`;
		if (!(await adapter.exists(subfolderPath))) {
			await adapter.mkdir(subfolderPath);
		}
		let timestamp = moment();
		let resultPath: string;
		do {
			resultPath = `${subfolderPath}/${filename}.${timestamp.format('YYYY-MM-DD_HH-mm-ss')}${ext}`;
			timestamp.add(1, 'second');
		} while (await adapter.exists(resultPath));
		return resultPath;
	}

	//// Functions called from [commands/context menu/uris/etc]
	async createCard(opts?: {
		cardTypeFolder?: PathFolder,
		templateFile?: PathFile,
		templateContent?: string, // Inline template content (alternative to templateFile)
		fieldOverrides?: Record<string,VarValueType>,
		uriKeys?: Set<string>,
		promptMode?: "none"|"remaining"|"all",
		destDir?: PathFolder,
		sourceFile?: TFile, // Always an indexed output file
		fromSelection?: boolean,
		finalize?: boolean,
		existingTitle?: string, // Pre-set fileTitle (used by upsert to match target path)
		openInEditor?: boolean, // When true, opens the resulting file in the workspace
		showNotices?: boolean, // When true, errors/info messages show user-visible notices. Default true.
	}): Promise<CommandResult> {
		if (!opts) { opts = {}; }
		if (!opts.fieldOverrides) { opts.fieldOverrides = {}; }
		if (opts.sourceFile) {
			opts.fieldOverrides.sourceText = await this.app.vault.read(opts.sourceFile);
		}
		if (opts.fromSelection) {
			const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
			if (editor) {
				opts.fieldOverrides.sourceText = editor.getSelection();
			}
		}

		if (!opts.templateContent) {
			if (!opts.cardTypeFolder) {
				opts.cardTypeFolder = await this.promptForCardTypeFolder();
			}
			if (!opts.templateFile) {
				opts.templateFile = await this.promptForTemplateFile(opts.cardTypeFolder, "document-template");
			}
		}
		if (!opts.cardTypeFolder) {
			opts.cardTypeFolder = pathFolderFrom("");
		}
		if (!opts.destDir) {
			opts.destDir = opts.cardTypeFolder;
		}

		let content: string;
		const templateFileForParse = opts.templateFile ?? pathFileFrom("(inline)");
		if (opts.templateContent) {
			content = opts.templateContent;
		} else {
			content = await this.app.vault.adapter.read(opts.templateFile!.path);
		}
		let { fm, body } = Z2KYamlDoc.splitFrontmatter(content);
		if (fm.includes("{{>")) {
			throw new TemplatePluginError("Block templates ({{> ...}}) cannot be used in frontmatter.");
		}
		fm = this.updateYamlOnCreate(fm, templateFileForParse.basename);
		content = Z2KYamlDoc.joinFrontmatter(fm, body);
		let systemBlocksContent = opts.templateFile
			? await this.GetSystemBlocksContent(opts.cardTypeFolder)
			: "";
		let state = await this.parseTemplate(content, systemBlocksContent, this.settings.globalBlock, templateFileForParse);
		this.extractTemplateMetadata(state);
		let hadSourceTextField = !!state.fieldInfos["sourceText"];
		// Convert sourceText to string for addPluginBuiltIns (handles all VarValueType cases)
		const sourceTextStr = opts.fieldOverrides.sourceText != null ? String(opts.fieldOverrides.sourceText) : undefined;
		await this.addYamlFieldValues(state); // System blocks already in state from parseTemplate
		await this.addPluginBuiltIns(state, { sourceText: sourceTextStr, templateName: templateFileForParse.basename, fileCreationDate: opts.sourceFile?.stat.ctime, existingTitle: opts.existingTitle, sourceFile: opts.sourceFile, templatePath: templateFileForParse.path });
		// For sourceFile: use original filename as suggestion if template doesn't specify one
		if (opts.sourceFile) {
			const tfi = state.fieldInfos["fileTitle"];
			if (tfi && tfi.value === undefined && tfi.suggest === undefined) {
				tfi.suggest = opts.sourceFile.basename;
			}
		}
		this.handleOverrides(state, opts.fieldOverrides, opts.uriKeys ?? new Set(), opts.promptMode || "remaining");

		if (this.hasFillableFields(state.fieldInfos) && opts.promptMode !== "none") {
			opts.finalize = await this.promptForFieldCollection(state);
		} else {
			this.resolveComputedFieldValues(state, opts.finalize ?? false);
		}

		let { fm: fmOut, body: bodyOut } = Z2KTemplateEngine.renderTemplate(state, opts.finalize ?? false, this.activeHelpers);
		if (opts.finalize) { fmOut = this.cleanupYamlAfterFinalize(fmOut); }
		if (!hadSourceTextField && opts.fieldOverrides.sourceText != null) {
			bodyOut += `\n\n${String(opts.fieldOverrides.sourceText)}\n`;
		}
		let contentOut = Z2KYamlDoc.joinFrontmatter(fmOut, bodyOut);
		let title = this.getTitle(state.resolvedValues);
		if (opts.fromSelection) {
			const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
			if (editor) { editor.replaceSelection(""); }
		}
		let filePath: string;
		if (opts.sourceFile) {
			// Rename-based flow: modify content, then rename/move (updates links)
			await this.app.vault.modify(opts.sourceFile, contentOut);
			const filename = this.getValidFilename(title);
			const targetPath = joinPath(opts.destDir.path, filename + '.md');
			if (targetPath !== opts.sourceFile.path) {
				const newPath = this.generateUniqueFilePath(opts.destDir.path, filename);
				await this.app.fileManager.renameFile(opts.sourceFile, newPath);
			}
			filePath = opts.sourceFile.path;
			if (opts.openInEditor) {
				await this.app.workspace.openLinkText(filePath, "");
			}
		} else {
			let newFile = await this.createFile(opts.destDir, title, contentOut);
			filePath = newFile.path;
			if (opts.openInEditor) {
				await this.app.workspace.openLinkText(filePath, "");
			}
		}
		return { kind: 'create', filePath, finalized: !!opts.finalize };
	}
	async continueCard(opts: {
		existingFile: TFile,
		fieldOverrides?: Record<string,VarValueType>,
		uriKeys?: Set<string>,
		promptMode?: "none"|"remaining"|"all",
		finalize?: boolean,
		openInEditor?: boolean, // When true, brings the target file to focus after the write
		showNotices?: boolean, // When true, errors/info messages show user-visible notices. Default true.
	}): Promise<CommandResult> {
		let content = await this.app.vault.read(opts.existingFile);
		let state = await this.parseTemplate(content, "", "", pathFileFromTFile(opts.existingFile));
		this.extractTemplateMetadata(state);
		// Add global block YAML for field values (system blocks already in note from creation)
		let globalBlockYaml = Z2KYamlDoc.splitFrontmatter(this.settings.globalBlock).fm;
		await this.addYamlFieldValues(state, [globalBlockYaml]);
		await this.addPluginBuiltIns(state, { existingTitle: opts.existingFile.basename, fileCreationDate: opts.existingFile.stat.ctime, existingFile: opts.existingFile, templatePath: opts.existingFile.path });
		this.handleOverrides(state, opts.fieldOverrides, opts.uriKeys ?? new Set(), opts.promptMode || "remaining");
		let hasFillableFields = this.hasFillableFields(state.fieldInfos);
		if (!hasFillableFields && !opts.fieldOverrides && !opts.finalize) {
			const hasAnyField = state.referencedFields.size > 0 || state.declaredFields.size > 0;
			const msg = hasAnyField
				? `Nothing to fill in — run Finalize ${cardRefNameLower(this.settings)} to commit computed values.`
				: `No fields found in this ${cardRefNameLower(this.settings)}.`;
			await this.logInfo(msg, opts.showNotices ?? true);
			return { kind: 'continue', filePath: opts.existingFile.path, finalized: !!opts.finalize };
		}
		if (hasFillableFields && opts.promptMode !== "none") {
			opts.finalize = await this.promptForFieldCollection(state);
		} else {
			this.resolveComputedFieldValues(state, opts.finalize ?? false);
		}

		let { fm, body } = Z2KTemplateEngine.renderTemplate(state, opts.finalize ?? false, this.activeHelpers);
		if (opts.finalize) { fm = this.cleanupYamlAfterFinalize(fm); }
		let contentOut = Z2KYamlDoc.joinFrontmatter(fm, body);
		let title = this.getTitle(state.resolvedValues);
		await this.updateTitleAndContent(opts.existingFile, title, contentOut);
		if (opts.openInEditor) {
			await this.app.workspace.openLinkText(opts.existingFile.path, "");
		}
		return { kind: 'continue', filePath: opts.existingFile.path, finalized: !!opts.finalize };
	}
	async insertBlock(opts?: {
		templateFile?: PathFile,
		templateContent?: string, // Inline template content (alternative to templateFile)
		blockTypeFolder?: PathFolder, // scopes which block templates are shown in the picker
		existingFile?: TFile, // Always an indexed output file
		destHeader?: string,
		location?: "file-top"|"file-bottom"|"header-top"|"header-bottom"|number,
		fieldOverrides?: Record<string,VarValueType>,
		uriKeys?: Set<string>,
		promptMode?: "none"|"remaining"|"all",
		fromSelection?: boolean,
		finalize?: boolean,
		openInEditor?: boolean, // When true, brings the target file to focus after the write
		showNotices?: boolean, // When true, errors/info messages show user-visible notices. Default true.
	}): Promise<CommandResult> {
		if (!opts) { opts = {}; }
		if (!opts.fieldOverrides) { opts.fieldOverrides = {}; }
		if (!opts.existingFile) { opts.existingFile = this.getOpenFileOrThrow(); }
		let editor: Editor | null = null;
		if (!opts.location && !opts.destHeader) {
			editor = this.getEditorOrThrow();
			// Guard: don't allow insertion into frontmatter
			const fmEnd = this.app.metadataCache.getFileCache(opts.existingFile)?.frontmatterPosition?.end?.line ?? -1;
			if (fmEnd >= 0) {
				const checkLine = opts.fromSelection ? editor.getCursor("from").line : editor.getCursor().line;
				if (checkLine <= fmEnd) {
					throw new TemplatePluginError("Block templates cannot be inserted into frontmatter.");
				}
			}
			if (opts.fromSelection) {
				opts.fieldOverrides.sourceText = editor.getSelection();
			}
		}
		if (!opts.templateFile && !opts.templateContent) {
			const scopeDir = opts.blockTypeFolder ?? pathFolderFromTFolder(opts.existingFile.parent as TFolder);
			opts.templateFile = await this.promptForTemplateFile(scopeDir, "block-template");
		}

		// Parse and resolve block
		const templateFileForParse = opts.templateFile ?? pathFileFrom("(inline)");
		let content: string;
		if (opts.templateContent) {
			content = opts.templateContent;
		} else {
			content = await this.app.vault.adapter.read(opts.templateFile!.path);
		}
		let state = await this.parseTemplate(content, "", "", templateFileForParse);
		this.extractTemplateMetadata(state);
		let hadSourceTextField = !!state.fieldInfos["sourceText"];
		// Add global block, system blocks, and existing file YAML for field values
		let globalBlockYaml = Z2KYamlDoc.splitFrontmatter(this.settings.globalBlock).fm;
		let systemBlocksContent = opts.templateFile
			? await this.GetSystemBlocksContent(this.getTemplateCardType(opts.templateFile))
			: "";
		let systemBlocksYaml = Z2KYamlDoc.splitFrontmatter(systemBlocksContent).fm;
		let existingFileContent = await this.app.vault.read(opts.existingFile);
		let existingFileYaml = Z2KYamlDoc.splitFrontmatter(existingFileContent).fm;
		await this.addYamlFieldValues(state, [globalBlockYaml, systemBlocksYaml, existingFileYaml]);
		// Convert sourceText to string for addPluginBuiltIns (handles all VarValueType cases)
		const sourceTextStr = opts.fieldOverrides.sourceText != null ? String(opts.fieldOverrides.sourceText) : undefined;
		await this.addPluginBuiltIns(state, { sourceText: sourceTextStr, existingTitle: opts.existingFile.basename, fileCreationDate: opts.existingFile.stat.ctime, existingFile: opts.existingFile, templatePath: templateFileForParse.path });
		this.handleOverrides(state, opts.fieldOverrides, opts.uriKeys ?? new Set(), opts.promptMode || "remaining");

		// if (this.hasFillableFields(state.fieldInfos) && opts.promptMode !== "none") {
		if (opts.promptMode !== "none") {
			opts.finalize = await this.promptForFieldCollection(state);
		} else {
			this.resolveComputedFieldValues(state, opts.finalize ?? false);
		}

		let { fm: blockFm, body: blockBody } = Z2KTemplateEngine.renderTemplate(state, opts.finalize ?? false, this.activeHelpers);
		if (opts.finalize) { blockFm = this.cleanupYamlAfterFinalize(blockFm); }
		blockFm = this.updateBlockYamlOnInsert(blockFm);
		if (!hadSourceTextField && opts.fieldOverrides.sourceText != null) {
			blockBody += `\n\n${String(opts.fieldOverrides.sourceText)}\n`;
		}

		// Editor mode (no explicit location/header) drives the editor directly to preserve cursor.
		// All other modes do a programmatic read-modify-write on the file.
		// Note: line-number 0 is a valid explicit location, so we can't use a truthy check on opts.location.
		const isExplicitLocation =
			opts.location === "file-top" ||
			opts.location === "file-bottom" ||
			opts.location === "header-top" ||
			opts.location === "header-bottom" ||
			typeof opts.location === "number";
		const isEditorMode = !isExplicitLocation && !opts.destHeader;
		if (isEditorMode) {
			const editor = this.getEditorOrThrow();
			if (opts.fromSelection) {
				editor.replaceSelection(blockBody);
			} else {
				editor.replaceRange(blockBody, editor.getCursor());
			}
			const full = editor.getValue();
			const { fm: fileFm2, body: newBody2 } = Z2KYamlDoc.splitFrontmatter(full);
			const mergedFm2 = Z2KYamlDoc.mergeLastWins([fileFm2, blockFm]);
			const newFileContent = Z2KYamlDoc.joinFrontmatter(mergedFm2, newBody2);
			await this.app.vault.modify(opts.existingFile, newFileContent);
		} else {
			// Atomic read-modify-write to avoid races with other plugins editing the same file.
			await this.app.vault.process(opts.existingFile, fileContent => {
				const { fm: fileFm, body: fileBody } = Z2KYamlDoc.splitFrontmatter(fileContent);
				const mergedFm = Z2KYamlDoc.mergeLastWins([fileFm, blockFm]);
				let newBody: string;
				if (opts.location === "file-top") {
					newBody = blockBody + fileBody;
				} else if (opts.location === "file-bottom") {
					newBody = fileBody + "\n" + blockBody;
				} else if (opts.location === "header-top" || opts.location === "header-bottom") {
					if (!opts.destHeader) {
						throw new TemplatePluginError("destHeader is required when location is 'header-top' or 'header-bottom'");
					}
					newBody = this.insertIntoHeaderSection(fileBody, opts.destHeader, blockBody, opts.location);
				} else if (typeof opts.location === "number") {
					newBody = this.insertAtLineNumber(fileBody, opts.location, blockBody);
				} else if (opts.destHeader) {
					// Backward compatibility: destHeader without location → header-top
					newBody = this.insertIntoHeaderSection(fileBody, opts.destHeader, blockBody, "header-top");
				} else {
					throw new Error("insertBlock: unreachable — isEditorMode should have handled this");
				}
				return Z2KYamlDoc.joinFrontmatter(mergedFm, newBody);
			});
		}
		if (opts.openInEditor) {
			await this.app.workspace.openLinkText(opts.existingFile.path, "");
		}
		return { kind: 'insertBlock', filePath: opts.existingFile.path, finalized: !!opts.finalize };
	}

	// de-duplication helper functions
	async parseTemplate(content: string, systemBlocksContent: string, globalBlockContent: string, templateFile: PathFile): Promise<TemplateState> {
		try {
			return await Z2KTemplateEngine.parseTemplate(content, systemBlocksContent, globalBlockContent, templateFile.path, await this.getBlockCallbackFunc());
		} catch (error) {
			rethrowWithMessage(error, "Error occurred while parsing the template");
		}
	}
	getTitle(resolvedValues: Record<string, VarValueType>): string {
		let fileTitle = resolvedValues["fileTitle"];
		let title = fileTitle == null || fileTitle === "" ? "Untitled" : String(fileTitle);
		return Z2KTemplateEngine.reducedRenderContent(title, resolvedValues, false, this.activeHelpers) as string;
	}
	async updateTitleAndContent(file: TFile, title: string, content: string) {
		try {
			await this.app.vault.modify(file, content);
			const filename = this.getValidFilename(title);
			if (filename !== file.basename) {
				const newPath = this.generateUniqueFilePath(file.parent?.path as string, filename);
				await this.app.fileManager.renameFile(file, newPath);
			}
		} catch (error) {
			rethrowWithMessage(error, "Error occurred while updating the file content or title");
		}
		// // Old version, just in case it's needed:
		// try {
		// 	if (continueFile.basename !== filename) {
		// 		// Write the new contents at the new path
		// 		let newCardPath = this.generateUniqueFilePath(continueFile.parent?.path as string, filename)
		// 		await this.app.vault.create(newCardPath, content); // Create the new file
		// 		await this.app.vault.delete(continueFile); // Delete the old file
		// 		await this.app.workspace.openLinkText(newCardPath, ""); // Open the new file
		// 	} else {
		// 		await this.app.vault.modify(continueFile, content); // Just modify the existing file
		// 		await this.app.workspace.openLinkText(continueFile.path, ""); // Open the file if not already open
		// 	}
		// } catch (error) {
		// 	rethrowWithMessage(error, "Error occurred while updating the existing file");
		// }
	}
	handleOverrides(state: TemplateState, fieldOverrides: Record<string,VarValueType> | undefined, uriKeys: Set<string>, promptMode: "none"|"remaining"|"all") {
		if (!fieldOverrides) { return; }
		for (const [key, value] of Object.entries(fieldOverrides)) {
			if (!state.fieldInfos[key]) {
				state.fieldInfos[key] = { fieldName: key };
			}
			// Convert URI string values based on field type (JSON values already typed)
			let convertedValue = value;
			if (typeof value === 'string' && uriKeys.has(key)) {
				const fieldType = state.fieldInfos[key].type;
				const trimmed = value.trim();
				if (fieldType === 'text') {
					// Explicit text type - no conversion
					convertedValue = value;
				} else if (fieldType === 'boolean') {
					// Generous boolean parsing
					const lower = trimmed.toLowerCase();
					if (['true', '1', 'yes', 'y', 'on', 'enabled', 'enable'].includes(lower)) {
						convertedValue = true;
					} else if (['false', '0', 'no', 'n', 'off', 'disabled', 'disable'].includes(lower)) {
						convertedValue = false;
					} else {
						convertedValue = undefined;
					}
				} else if (fieldType === 'number') {
					const num = Number(trimmed);
					convertedValue = isNaN(num) ? undefined : num;
				} else {
					// Auto-conversion (no type declared or other types like singleSelect)
					const lower = trimmed.toLowerCase();
					if (lower === 'true') {
						convertedValue = true;
					} else if (lower === 'false') {
						convertedValue = false;
					} else if (trimmed !== '' && !isNaN(Number(trimmed))) {
						convertedValue = Number(trimmed);
					}
					// else: stays as string
				}
			}
			state.fieldInfos[key].value = convertedValue;
			if (promptMode === "remaining") {
				if (!state.fieldInfos[key].directives) {
					state.fieldInfos[key].directives = [];
				}
				if (!state.fieldInfos[key].directives!.includes("no-prompt")) {
					state.fieldInfos[key].directives!.push("no-prompt");
				}
			}
		}
	}

	resolveComputedFieldValues(state: TemplateState, finalize: boolean): void {
		const depsMap = buildDependencyMap(state.fieldInfos);

		// Check for circular dependencies
		const circular = detectCircularDependencies(depsMap);
		if (circular.length > 0) {
			throw new TemplatePluginError(`Circular dependency detected: ${circular.join(' -> ')}`);
		}

		const orderedFields = calculateFieldDependencyOrder(depsMap);

		// NOTE: Similar logic exists in handleSubmit() in PromptForm. If you modify
		// the value= or fallback handling here, check if the same change is needed there.
		for (const fieldName of orderedFields) {
			const fieldInfo = state.fieldInfos[fieldName];
			if (!fieldInfo) { continue; }

			// Build context from current resolvedValues (excluding undefined)
			const context: Record<string, VarValueType> = {};
			for (const [name, value] of Object.entries(state.resolvedValues)) {
				if (value !== undefined) {
					context[name] = value;
				}
			}

			// Resolve value= if present (and not overridden by external data)
			// NOTE: Similar logic in handleSubmit() - keep in sync
			if (fieldInfo.value !== undefined && !(fieldName in state.resolvedValues)) {
				if (fieldInfo.directives?.includes('raw-content')) {
					// Raw-content fields (clipboard, sourceText, etc.) are used verbatim, never interpreted.
					state.resolvedValues[fieldName] = fieldInfo.value;
				} else {
					const valueDeps = Z2KTemplateEngine.reducedGetDependencies(fieldInfo.value);
					const allDepsExist = valueDeps.every(dep => dep in context);
					if (allDepsExist) {
						const resolved = Z2KTemplateEngine.reducedRenderContent(fieldInfo.value, context, true, this.activeHelpers);
						if (resolved === undefined) {
							delete state.resolvedValues[fieldName];
						} else {
							state.resolvedValues[fieldName] = resolved;
						}
					}
					// Else: deps missing, leave unspecified (don't set key)
				}
			}

			// Apply fallback value for unspecified fields when finalizing
			// Skip finalize-preserve fields - leave undefined so preservation logic handles them
			// NOTE: Similar logic in handleSubmit() - keep in sync
			const hasFinalizePreserve = fieldInfo.directives?.includes('finalize-preserve');
			if (finalize && !(fieldName in state.resolvedValues) && !hasFinalizePreserve) {
				const resolvedFallback = Z2KTemplateEngine.reducedRenderContent(fieldInfo.fallback || "", context, true, this.activeHelpers);
				if (resolvedFallback === undefined) {
					delete state.resolvedValues[fieldName];
				} else {
					state.resolvedValues[fieldName] = resolvedFallback || '';
				}
			}
		}
	}

	// Template editing
	async convertFileTemplateType(file: TFile, type: "content-file" | "document-template" | "block-template") {
		try {
			if (type === "content-file" && this.isInsideTemplatesFolder(pathFileFromTFile(file))) {
				await this.logInfo("You will need to manually move the file outside of your templates folder (" + this.settings.templatesFolderName + ").");
			}
			// Atomic read-modify-write to avoid races with other plugins editing the same file.
			await this.app.vault.process(file, content => {
				let { fm, body } = Z2KYamlDoc.splitFrontmatter(content);
				let doc = Z2KYamlDoc.fromString(fm);
				if (type === "content-file") {
					doc.del("z2k_template_type");
				} else if (type === "document-template" || type === "block-template") {
					doc.set("z2k_template_type", type);
				}
				return Z2KYamlDoc.joinFrontmatter(doc.toString(), body);
			});
			// Rename file extension if template file extensions are enabled
			if (this.settings.useTemplateFileExtensions) {
				let targetExt: string;
				if (type === "document-template") {
					targetExt = "template";
				} else if (type === "block-template") {
					targetExt = "block";
				} else {
					targetExt = "md";
				}
				await this.renameFileExtension(file, targetExt);
			} else if (type === "content-file" && (file.extension === "template" || file.extension === "block")) {
				// Always rename .template/.block to .md when converting to content-file
				await this.renameFileExtension(file, "md");
			}
		} catch (error) { this.handleErrors(error); }
	}
	async convertToMarkdownTemplate(file: TFile) {
		try {
			// Determine the template type to preserve (or set based on current extension)
			let currentType = this.getFileTemplateTypeSync(file);
			if (currentType === "content-file") {
				// If it's a content file, determine type from extension
				if (file.extension === "template") {
					currentType = "document-template";
				} else if (file.extension === "block") {
					currentType = "block-template";
				} else {
					// Default to document-template if converting a .md content file
					currentType = "document-template";
				}
			}
			// Rename to .md first so the subsequent modify triggers a metadata cache update on a .md file
			if (file.extension === "template" || file.extension === "block") {
				const renamedFile = await this.renameFileExtension(file, "md");
				if (renamedFile) { file = renamedFile; }
			}
			// Update YAML to ensure type is set. Atomic read-modify-write.
			await this.app.vault.process(file, content => {
				let { fm, body } = Z2KYamlDoc.splitFrontmatter(content);
				let doc = Z2KYamlDoc.fromString(fm);
				doc.set("z2k_template_type", currentType);
				return Z2KYamlDoc.joinFrontmatter(doc.toString(), body);
			});
		} catch (error) { this.handleErrors(error); }
	}
	async setTemplateExtensionsVisible(visible: boolean) {
		if (this.settings.templateExtensionsVisible === visible) {
			return; // Already in desired state
		}
		if (visible) {
			// Show: register extensions as markdown (internal API — see rationale in onload)
			// @ts-expect-error: internal API
			this.app.viewRegistry.registerExtensions(["template", "block"], "markdown");
			new Notice("Template files are now visible");
		} else {
			// Hide: unregister extensions (internal API — see rationale in onload)
			// @ts-expect-error: internal API
			this.app.viewRegistry.unregisterExtensions(["template", "block"]);
			new Notice("Template files are now hidden");
		}
		this.settings.templateExtensionsVisible = visible;
		await this.saveData(this.settings);
		// Refresh commands so the command name updates
		this.queueRefreshCommands(0);
	}
	async toggleTemplateExtensionsVisibility() {
		await this.setTemplateExtensionsVisible(!this.settings.templateExtensionsVisible);
	}

	//// All other functions

	// Prompts
	async promptForCardTypeFolder(): Promise<PathFolder> {
		const cardTypes = await this.getAllCardTypes("document-template");
		if (cardTypes.length === 0) {
			throw new Error(`No ${cardRefNameLower(this.settings)} types available. Please create a template folder first.`);
		}
		return new Promise<PathFolder>((resolve, reject) => {
			new CardTypeSelectionModal(this.app, cardTypes, this.settings, resolve, reject).open();
		});
	}
	async promptForTemplateFile(cardType: PathFolder, type: "document-template" | "block-template"): Promise<PathFile> {
		const templates = await this.getAssociatedTemplates(type, cardType);
		if (templates.length === 0) {
			if (type === "block-template") {
				throw new Error(`No block templates found for this ${cardRefNameLower(this.settings)}.`);
			}
			throw new Error(`No templates found in this ${cardRefNameLower(this.settings)} type folder.`);
		}
		return new Promise<PathFile>((resolve, reject) => {
			new TemplateSelectionModal(this.app, templates, this.settings, resolve, reject).open();
		});
	}
	async promptForFieldCollection(templateState: TemplateState): Promise<boolean> {
		// Errors (including circular dependency errors) propagate to caller for handling
		return await new Promise<boolean>((resolve, reject) => {
			const templateName = templateState.metadata.z2k_template_name;
			const title = templateName
				? `New ${cardRefNameUpper(this.settings)}: ${templateName}`
				: `New ${cardRefNameUpper(this.settings)}`;
			new FieldCollectionModal(this.app, title, templateState, this.activeHelpers, resolve, reject).open();
		});
	}
	// Helpers
	insertIntoHeaderSection(body: string, header: string, insertText: string, location: "header-top"|"header-bottom" = "header-top"): string {
		if (!insertText || insertText.trim() === "") { return body; }

		// Check if header includes # symbols (e.g., "## Section" vs "Section")
		const hashMatch = header.match(/^(#+)\s+(.+)$/);
		let headerMatch: RegExp;
		if (hashMatch) {
			// Header includes specific level (e.g., "## Target Section")
			const hashCount = hashMatch[1].length;
			const headerText = hashMatch[2];
			const escapedHeader = escapeRegExp(headerText);
			headerMatch = new RegExp(`^#{${hashCount}}\\s+${escapedHeader}[\\s\\S]*?(?=\\n#|$(?![\\s\\S]))`, "mi");
		} else {
			// Header without # symbols - match any level (e.g., "Target Section")
			const escapedHeader = escapeRegExp(header);
			headerMatch = new RegExp(`^#+\\s+${escapedHeader}[\\s\\S]*?(?=\\n#|$(?![\\s\\S]))`, "mi");
		}
		const match = body.match(headerMatch);
		if (!match) {
			throw new TemplatePluginError(`Header not found: ${header}`);
		}

		// Insert into matched header section
		const rows = match[0].split("\n");
		// Remove trailing newline from insertText since join("\n") will add separators
		const textToInsert = insertText.replace(/\n$/, '');
		if (location === "header-top") {
			// Find first non-empty line after header
			const emptyLine = /^\s*$/;
			let insertAt = 1;
			for (let i = 1; i < rows.length; i++) {
				if (!emptyLine.test(rows[i])) {
					insertAt = i;
					break;
				}
			}
			rows.splice(insertAt, 0, textToInsert);
		} else {
			const emptyLine = /^\s*$/;
			let insertAt = rows.length;
			for (let i = rows.length - 1; i >= 0; i--) {
				if (emptyLine.test(rows[i])) { insertAt = i; } else { break; }
			}
			rows.splice(insertAt, 0, textToInsert);
		}

		const updated = rows.join("\n");
		return body.replace(match[0], updated);
	}

	insertAtLineNumber(body: string, lineNumber: number, insertText: string): string {
		if (!insertText || insertText.trim() === "") { return body; }

		const rows = body.split("\n");
		const totalLines = rows.length;
		let insertIndex: number;

		// Positive numbers (1 to N+1): 1 = before first line, N+1 = after last line
		// Negative numbers: -1 = before last line, -2 = before second-to-last, etc.
		if (lineNumber > 0) {
			// Positive numbers: convert to 0-indexed (line 1 = index 0)
			if (lineNumber > totalLines + 1) {
				throw new TemplatePluginError(`Line number ${lineNumber} is out of range (file has ${totalLines} lines, valid range: 1 to ${totalLines + 1})`);
			}
			insertIndex = lineNumber - 1;
		} else if (lineNumber < 0) {
			// Negative numbers: -1 = before last line, -2 = before second-to-last, etc.
			insertIndex = totalLines + lineNumber;
			if (insertIndex < 0) {
				throw new TemplatePluginError(`Line number ${lineNumber} is out of range (file has ${totalLines} lines, valid range: -${totalLines} to -1)`);
			}
		} else {
			// lineNumber === 0 is invalid
			throw new TemplatePluginError(`Line number 0 is not valid. Use positive numbers (1 to ${totalLines + 1}) or negative numbers (-1 to -${totalLines})`);
		}

		// Remove trailing newline from insertText since join("\n") will add separators
		const textToInsert = insertText.replace(/\n$/, '');
		rows.splice(insertIndex, 0, textToInsert);
		return rows.join("\n");
	}

	async getFileTemplateType(file: PathFile): Promise<"content-file" | "document-template" | "block-template"> {
		// Extension takes priority — most explicit declaration
		if (file.extension === "template") { return "document-template"; }
		if (file.extension === "block") { return "block-template"; }
		// YAML override — indexed files use metadata cache, hidden files use adapter
		let yamlTemplateType: unknown;
		const tFile = this.app.vault.getAbstractFileByPath(file.path);
		if (tFile instanceof TFile) {
			yamlTemplateType = this.app.metadataCache.getFileCache(tFile)?.frontmatter?.["z2k_template_type"];
		} else {
			try {
				const content = await this.app.vault.adapter.read(file.path);
				const { fm } = Z2KYamlDoc.splitFrontmatter(content);
				if (fm) { yamlTemplateType = Z2KYamlDoc.fromString(fm).get("z2k_template_type"); }
			} catch {} // File unreadable — fall through to location/default
		}
		if (yamlTemplateType === "document-template" || yamlTemplateType === "block-template") {
			return yamlTemplateType;
		}
		// Location-based — .md files inside a templates folder
		if (file.extension === "md" && this.isInsideTemplatesFolder(file)) {
			return "document-template";
		}
		return "content-file";
	}
	// Sync version for contexts that only operate on indexed TFiles.
	// Uses metadataCache (no adapter reads), so only works for Obsidian-indexed files.
	getFileTemplateTypeSync(file: TFile): "content-file" | "document-template" | "block-template" {
		if (file.extension === "template") { return "document-template"; }
		if (file.extension === "block") { return "block-template"; }
		const yamlTemplateType = this.app.metadataCache.getFileCache(file)?.frontmatter?.["z2k_template_type"];
		if (yamlTemplateType === "document-template" || yamlTemplateType === "block-template") {
			return yamlTemplateType;
		}
		if (file.extension === "md" && this.isInsideTemplatesFolder(pathFileFromTFile(file))) {
			return "document-template";
		}
		return "content-file";
	}
	async renameFileExtension(file: TFile, newExtension: string): Promise<TFile | null> {
		const currentExt = file.extension;
		if (currentExt === newExtension) { return file; }
		const parentPath = file.parent?.path ?? "";
		const baseName = file.basename; // filename without extension
		const newFileName = `${baseName}.${newExtension}`;
		const newPath = parentPath ? `${parentPath}/${newFileName}` : newFileName;
		await this.app.vault.rename(file, newPath);
		// Return the renamed file (vault.rename updates the TFile object in place, but we can also re-fetch)
		return this.app.vault.getAbstractFileByPath(newPath) as TFile | null;
	}
	// async hideTemplateFile(file: TFile) {
	// 	// hide a file by renaming it to start with '.' if it doesn't already start with '.' and it's not a '.template' file
	// 	if (file.extension === "template") { return; }
	// 	if (file.name.startsWith(".")) { return; }
	// 	if (this.isInsideTemplatesFolder(file)) { return; }
	// 	const dirname = file.parent?.path ?? "";
	// 	const basename = file.name;
	// 	const newName = "." + basename;
	// 	const newPath = dirname ? `${dirname}/${newName}` : newName;
	// 	await this.app.vault.rename(file, newPath);
	// }
	// async unhideTemplateFile(file: TFile) {
	// 	if (file.extension === "template") { return; }
	// 	if (!file.name.startsWith(".")) { return; }
	// 	const dirname = file.parent?.path ?? "";
	// 	const basename = file.name.slice(1); // remove the leading '.'
	// 	const newPath = dirname ? `${dirname}/${basename}` : basename;
	// 	await this.app.vault.rename(file, newPath);
	// }
	// async hideFolder(folder: TFolder) {
	// 	// hide a folder by renaming it to start with '.'
	// 	if (folder.name.startsWith(".")) { return; }
	// 	const parentPath = folder.parent?.path ?? "";
	// 	const newName = "." + folder.name;
	// 	const newPath = parentPath ? `${parentPath}/${newName}` : newName;
	// 	await this.app.vault.rename(folder, newPath);
	// }
	// async unhideFolder(folder: TFolder) {
	// 	if (!folder.name.startsWith(".")) { return; }
	// 	const parentPath = folder.parent?.path ?? "";
	// 	const newName = folder.name.slice(1); // remove the leading '.'
	// 	const newPath = parentPath ? `${parentPath}/${newName}` : newName;
	// 	await this.app.vault.rename(folder, newPath);
	// }
	// registerTemplateFileExtension() {
	// 	// @ts-expect-error: internal API
	// 	this.app.viewRegistry.registerExtensions(["template"], "markdown");
	// }
	// unregisterTemplateFileExtension() {
	// 	// @ts-expect-error: internal API
	// 	this.app.viewRegistry.unregisterExtensions("template");
	// }
	async getAllTemplates(): Promise<{ file: PathFile, type: "document-template" | "block-template" }[]> {
		let list: { file: PathFile, type: "document-template" | "block-template" }[] = [];
		const adapter = this.app.vault.adapter;
		const dotTfn = '.' + this.settings.templatesFolderName;
		// Recursively list hidden (dot-prefixed) template folders via adapter
		const collectHidden = async (folderPath: string) => {
			const listing = await adapter.list(folderPath);
			for (const filePath of listing.files) {
				const pf = pathFileFrom(filePath);
				const type = await this.getFileTemplateType(pf);
				if (type !== "content-file") { list.push({ file: pf, type }); }
			}
			for (const subPath of listing.folders) {
				await collectHidden(subPath);
			}
		};
		// Walk indexed folders, also checking for dot-prefixed template subfolders
		const collect = async (folder: TFolder) => {
			for (const child of folder.children) {
				if (child instanceof TFile) {
					const pf = pathFileFromTFile(child);
					const type = await this.getFileTemplateType(pf);
					if (type !== "content-file") { list.push({ file: pf, type }); }
				} else if (child instanceof TFolder) {
					await collect(child);
				}
			}
			// Check for hidden templates folder at this level
			const hiddenPath = joinPath(folder.path, dotTfn);
			if (await adapter.exists(hiddenPath)) {
				await collectHidden(hiddenPath);
			}
		};
		await collect(this.getTemplatesRootFolder());
		return list;
	}
	async getAllCardTypes(filter: "document-template" | "block-template"): Promise<PathFolder[]> {
		let seen = new Set<string>();
		let folders: PathFolder[] = [];
		for (const t of await this.getAllTemplates()) {
			if (t.type !== filter) { continue; }
			const cardType = this.getTemplateCardType(t.file);
			if (seen.has(cardType.path)) { continue; }
			seen.add(cardType.path);
			folders.push(cardType);
		}
		folders.sort((a, b) => a.path.localeCompare(b.path));
		return folders;
	}
	// Returns templates sorted by proximity: closest card type first, alphabetical within each level.
	// Distance = how many path segments the template's card type is above the requested card type.
	// e.g. for card type "a/b": templates with card type "a/b" → distance 0, "a" → 1, "" → 2.
	// Templates with z2k_default: true in frontmatter rise to top within their distance group.
	async getAssociatedTemplates(filter: "document-template" | "block-template", cardType: PathFolder): Promise<{ file: PathFile, isDefault: boolean, description?: string }[]> {
		const templatesRootPath = this.getTemplatesRootFolder().path;
		if (!isSubPathOf(cardType.path, templatesRootPath)) {
			throw new Error(`The selected ${cardRefNameLower(this.settings)} type folder is not inside your templates root folder.`);
		}
		const segCount = (p: string) => p === '' ? 0 : p.split('/').length;
		const targetSegCount = segCount(cardType.path);
		let ranked: { file: PathFile, distance: number, isDefault: boolean, description?: string }[] = [];
		for (const t of await this.getAllTemplates()) {
			if (t.type !== filter) { continue; }
			const tCardType = this.getTemplateCardType(t.file);
			// Only include templates whose card type is an ancestor of (or equal to) the target
			if (!isSubPathOf(cardType.path, tCardType.path)) { continue; }
			let isDefault = false;
			let description: string | undefined;
			const tFile = this.app.vault.getAbstractFileByPath(t.file.path);
			if (tFile instanceof TFile) {
				const fmCache = this.app.metadataCache.getFileCache(tFile)?.frontmatter;
				isDefault = fmCache?.["z2k_default"] === true;
				const desc = fmCache?.["z2k_template_description"];
				if (typeof desc === "string") { description = desc; }
			} else {
				try {
					const content = await this.app.vault.adapter.read(t.file.path);
					const { fm } = Z2KYamlDoc.splitFrontmatter(content);
					if (fm) {
						const yaml = Z2KYamlDoc.fromString(fm);
						isDefault = yaml.get("z2k_default") === true;
						const desc = yaml.get("z2k_template_description");
						if (typeof desc === "string") { description = desc; }
					}
				} catch {}
			}
			ranked.push({ file: t.file, distance: targetSegCount - segCount(tCardType.path), isDefault, description });
		}
		ranked.sort((a, b) =>
			a.distance - b.distance ||
			(a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1) ||
			a.file.path.localeCompare(b.file.path)
		);
		return ranked.map(r => ({ file: r.file, isDefault: r.isDefault, description: r.description }));
	}
	// Derives the card type folder from a template's path by stripping the templates root prefix
	// and at most one templates-named subfolder segment. Only one level of templates subfolder
	// is supported (no templates-inside-templates); additional segments with the same name are
	// treated as literal folder names.
	// Callers must ensure the file is actually a template — no type check is done here.
	getTemplateCardType(template: PathFile): PathFolder {
		const tfn = this.settings.templatesFolderName;
		const root = this.settings.templatesRootFolder;
		let path = template.parentPath;
		// Strip the configured templates root prefix
		if (root && path.startsWith(root + '/')) {
			path = path.substring(root.length + 1);
		} else if (root && path === root) {
			path = '';
		}
		// Strip at most one templates-named segment
		const segments = path.split('/');
		let stripped = false;
		const result = segments.filter(s => {
			if (!stripped && (s === tfn || s === '.' + tfn)) {
				stripped = true;
				return false;
			}
			return true;
		});
		return pathFolderFrom(result.join('/'));
	}
	// Extension priority for block templates: more specific extensions win
	static readonly BLOCK_EXTENSIONS = ['.block', '.template', '.md'];
	// Get list of paths that would be tried for a given base path
	getTriedPaths(basePath: string): string[] {
		const hasKnownExt = Z2KTemplatesPlugin.BLOCK_EXTENSIONS.some(ext => basePath.endsWith(ext));
		if (hasKnownExt) {
			return [basePath];
		}
		return Z2KTemplatesPlugin.BLOCK_EXTENSIONS.map(ext => basePath + ext);
	}
	// Try to resolve a file path, attempting extensions in priority order if none given.
	// Checks both indexed files (vault) and hidden files (adapter).
	async tryResolveWithExtensions(basePath: string): Promise<PathFile | null> {
		for (const tryPath of this.getTriedPaths(basePath)) {
			const file = this.getFile(tryPath);
			if (file) { return pathFileFromTFile(file); }
			if (await this.app.vault.adapter.exists(tryPath)) { return pathFileFrom(tryPath); }
		}
		return null;
	}
	// Sort blocks by extension priority (.block > .template > .md), unknown extensions last
	sortByExtensionPriority(blocks: [PathFile, string][]): [PathFile, string][] {
		return [...blocks].sort((a, b) => {
			const aIdx = Z2KTemplatesPlugin.BLOCK_EXTENSIONS.findIndex(ext => a[0].path.endsWith(ext));
			const bIdx = Z2KTemplatesPlugin.BLOCK_EXTENSIONS.findIndex(ext => b[0].path.endsWith(ext));
			const aPriority = aIdx === -1 ? Infinity : aIdx;
			const bPriority = bIdx === -1 ? Infinity : bIdx;
			return aPriority - bPriority;
		});
	}
	// Check if a normalized path ends with a given suffix (for scoped name matching)
	// suffix can be "Sub/Block" or "Sub/Block.md" - handles with/without extension
	pathMatchesSuffix(normPath: string, suffix: string): boolean {
		const hasKnownExt = Z2KTemplatesPlugin.BLOCK_EXTENSIONS.some(ext => suffix.endsWith(ext));
		const normSuffix = normalizeFullPath(suffix);
		if (hasKnownExt) {
			return normPath.endsWith('/' + normSuffix) || normPath === normSuffix;
		}
		// No extension given - match any known extension
		for (const ext of Z2KTemplatesPlugin.BLOCK_EXTENSIONS) {
			const suffixWithExt = normSuffix + ext;
			if (normPath.endsWith('/' + suffixWithExt) || normPath === suffixWithExt) {
				return true;
			}
		}
		return false;
	}
	async getBlockCallbackFunc(): Promise<(name: string, path: string) => Promise<[found: boolean, content: string, path: string]>> {
		// Blocks can include any file in the vault, not just templates.
		// Build list from indexed files + hidden files in dot-prefixed template folders.
		let allBlocks: [PathFile, string][] = [];
		for (const f of this.app.vault.getFiles()) {
			allBlocks.push([pathFileFromTFile(f), normalizeFullPath(f.path)]);
		}
		// Scan for hidden files in .Templates folders within templates root
		const adapter = this.app.vault.adapter;
		const dotTfn = '.' + this.settings.templatesFolderName;
		const templatesRootPath = this.getTemplatesRootFolder().path;
		const scanHidden = async (folderPath: string) => {
			const listing = await adapter.list(folderPath);
			for (const filePath of listing.files) {
				const pf = pathFileFrom(filePath);
				allBlocks.push([pf, normalizeFullPath(filePath)]);
			}
			for (const subPath of listing.folders) {
				await scanHidden(subPath);
			}
		};
		// Walk indexed folders to find dot-prefixed template subfolders
		const findHiddenFolders = async (folder: TFolder) => {
			const hiddenPath = joinPath(folder.path, dotTfn);
			if (await adapter.exists(hiddenPath)) { await scanHidden(hiddenPath); }
			for (const child of folder.children) {
				if (child instanceof TFolder) { await findHiddenFolders(child); }
			}
		};
		await findHiddenFolders(this.getTemplatesRootFolder());

		const returnBlock = async (file: PathFile): Promise<[true, string, string]> => {
			return [true, await adapter.read(file.path), file.path];
		};
		// Helper for hierarchical resolution: prefer current folder → parents → first match
		const resolveHierarchically = async (matches: [PathFile, string][], currentPath: string): Promise<[boolean, string, string]> => {
			if (matches.length === 0) { return [false, "", ""]; }
			const sortedMatches = this.sortByExtensionPriority(matches);
			if (sortedMatches.length === 1) {
				return returnBlock(sortedMatches[0][0]);
			}
			let currPath = currentPath;
			while (true) {
				const currFolder = pathFolderFrom(currPath);
				for (const match of sortedMatches) {
					if (this.isInThisFolderOrItsTemplatesFolder(match[0], currFolder)) {
						return returnBlock(match[0]);
					}
				}
				if (currPath === templatesRootPath || !currPath) { break; }
				const lastSlash = currPath.lastIndexOf('/');
				currPath = lastSlash >= 0 ? currPath.substring(0, lastSlash) : '';
			}
			// No match in hierarchy, return first (highest priority by extension)
			return returnBlock(sortedMatches[0][0]);
		};

		return async (name: string, path: string): Promise<[found: boolean, content: string, path: string]> => {
			// Block reference formats:
			// 1. /Sub/Block - absolute path from templates root
			// 2. ./Sub/Block or ../Sub/Block - relative path from current template
			// 3. Sub/Block - scoped name lookup (path suffix match, hierarchical)
			// 4. Block - simple name lookup (hierarchical)
			// All formats work with or without extension (.block > .template > .md priority)
			if (name.startsWith("/")) {
				// Absolute path from templates root
				const basePath = joinPath(templatesRootPath, name.substring(1));
				const file = await this.tryResolveWithExtensions(basePath);
				if (!file) {
					const triedPaths = this.getTriedPaths(basePath);
					throw new Error(
						`Block not found: '${name}'\n\n` +
						`Resolution mode: Absolute path (from templates root '${templatesRootPath}')\n\n` +
						`Tried these paths:\n${triedPaths.map(p => `  - ${p}`).join('\n')}\n\n` +
						`None of these files exist.`
					);
				}
				return returnBlock(file);
			}
			if (name.startsWith("./") || name.startsWith("../")) {
				// Relative path from current template's folder
				const basePath = joinPath(path, name);
				const file = await this.tryResolveWithExtensions(basePath);
				if (!file) {
					const triedPaths = this.getTriedPaths(basePath);
					throw new Error(
						`Block not found: '${name}'\n\n` +
						`Resolution mode: Relative path (from '${path}')\n\n` +
						`Tried these paths:\n${triedPaths.map(p => `  - ${p}`).join('\n')}\n\n` +
						`None of these files exist.`
					);
				}
				return returnBlock(file);
			}
			if (name.includes("/")) {
				// Scoped name lookup - match blocks whose path ends with this suffix
				let matches: [PathFile, string][] = [];
				for (const block of allBlocks) {
					if (this.pathMatchesSuffix(block[1], name)) {
						matches.push(block);
					}
				}
				if (matches.length === 0) {
					throw new Error(
						`Block not found: '${name}'\n\n` +
						`Resolution mode: Scoped name (path suffix match)\n\n` +
						`No block template path ends with '${name}'\n` +
						`Searched from: '${path}'`
					);
				}
				return resolveHierarchically(matches, path);
			}
			// Simple name lookup - match by basename or full filename
			let matches: [PathFile, string][] = [];
			for (const block of allBlocks) {
				const fileName = block[0].basename + (block[0].extension ? '.' + block[0].extension : '');
				if (block[0].basename === name || fileName === name) {
					matches.push(block);
				}
			}
			if (matches.length === 0) {
				throw new Error(
					`Block not found: '${name}'\n\n` +
					`Resolution mode: Simple name lookup\n\n` +
					`No block template named '${name}' exists.\n` +
					`Searched from: '${path}'`
				);
			}
			return resolveHierarchically(matches, path);
		}
	}

	isInThisFolderOrItsTemplatesFolder(file: PathFile, folder: PathFolder): boolean {
		if (file.parentPath === folder.path) { return true; }
		if (isSubPathOf(file.path, joinPath(folder.path, this.settings.templatesFolderName))
				|| isSubPathOf(file.path, joinPath(folder.path, '.' + this.settings.templatesFolderName))) {
			return true;
		}
		return false;
	}
	isInsideTemplatesFolder(file: PathFile): boolean {
		const tfn = this.settings.templatesFolderName;
		const templatesRoot = this.getTemplatesRootFolder();
		if (!isSubPathOf(file.path, templatesRoot.path)) { return false; }
		const normPath = normalizeFullPath(file.path);
		return normPath.includes(`/${tfn}/`) || normPath.includes(`/.${tfn}/`) || normPath.startsWith(`${tfn}/`) || normPath.startsWith(`.${tfn}/`);
	}
	getTemplatesRootFolder(): TFolder {
		let templatesRoot = this.getFolder(this.settings.templatesRootFolder)
		if (!templatesRoot) { throw new Error(`Templates root folder '${this.settings.templatesRootFolder}' not found.`); }
		return templatesRoot;
	}

	getEditorOrThrow(): Editor {
		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
		if (!editor) { throw new Error("No active markdown editor found."); }
		return editor;
	}
	getOpenFileOrThrow(): TFile {
		const file = this.app.workspace.getActiveFile();
		if (!file || !(file instanceof TFile)) {
			throw new Error("No active markdown file found.");
		}
		return file;
	}

	getValidFilename(title: string): string {
		return title
			.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_') // Illegal in Windows + control chars
			.replace(/^\.+$/, '_')                      // Avoid names like "." or ".."
			.replace(/[. ]+$/, '')                      // No trailing dots or spaces
			.replace(/^ +/, '')                         // No leading spaces
			|| 'Untitled';                              // Fallback if empty
	}
	generateUniqueFilePath(folderPath: string, basename: string): string {
		basename = basename.replace(/\.md$/, '');
		let filename = basename + '.md';
		let fullPath = joinPath(folderPath, filename);
		let counter = 1;
		while (this.getFile(fullPath)) {
			fullPath = joinPath(folderPath, `${basename} ${counter++}.md`);
		}
		return fullPath;
	}
	// One-pass extraction of all plugin-reserved YAML keys into state.metadata.
	// First-match-wins across all YAML sources (template + blocks).
	extractTemplateMetadata(state: TemplateState) {
		for (const yamlStr of state.templatesYaml) {
			const yaml = Z2KYamlDoc.fromString(yamlStr);
			for (const key of TEMPLATE_METADATA_KEYS) {
				if (key in state.metadata) { continue; } // first-match-wins
				const value = yaml.get(key);
				if (value === undefined) { continue; }
				// Type validation for active metadata fields
				if (key === "z2k_template_name" || key === "z2k_template_author" || key === "z2k_template_suggested_title" || key === "z2k_template_description") {
					if (typeof value !== "string") {
						throw new TemplatePluginError(`${key} must be a string (got a ${typeof value})`);
					}
				}
				if (key === "z2k_template_version") {
					if (typeof value !== "string" && typeof value !== "number") {
						throw new TemplatePluginError(`${key} must be a string or number (got a ${typeof value})`);
					}
					(state.metadata as any)[key] = String(value);
					continue;
				}
				(state.metadata as any)[key] = value;
			}
		}
	}
	async addPluginBuiltIns(state: TemplateState, opts: { sourceText?: string, existingTitle?: string, templateName?: string, templateVersion?: string, templateAuthor?: string, fileCreationDate?: number, sourceFile?: TFile, existingFile?: TFile, templatePath?: string } = {}) {
		// sourceText — always used as literal text (editor selection or pasted content).
		// The 'raw-content' directive prevents the resolver from trying to parse the value
		// as Handlebars, which is important because external content can contain '{{', quotes,
		// or anything else that isn't valid template syntax.
		state.fieldInfos["sourceText"] = {
			fieldName: "sourceText",
			type: "text",
			directives: ['no-prompt', 'raw-content'],
			value: opts.sourceText || "",
		};

		// creator
		state.fieldInfos["creator"] = {
			fieldName: "creator",
			type: "text",
			directives: ['no-prompt'],
			value: this.settings.creator || "",
		};

		// templateName — opts take priority, then state.metadata
		state.fieldInfos["templateName"] = {
			fieldName: "templateName",
			type: "text",
			directives: ['no-prompt'],
			value: opts.templateName || state.metadata.z2k_template_name || "",
		};

		// templateVersion
		state.fieldInfos["templateVersion"] = {
			fieldName: "templateVersion",
			type: "text",
			directives: ['no-prompt'],
			value: opts.templateVersion || state.metadata.z2k_template_version || "",
		};

		// templateAuthor
		state.fieldInfos["templateAuthor"] = {
			fieldName: "templateAuthor",
			type: "text",
			directives: ['no-prompt'],
			value: opts.templateAuthor || state.metadata.z2k_template_author || "",
		};

		// fileTitle (aliased as noteTitle and cardTitle)
		let tfi = state.fieldInfos["fileTitle"]; // tfi = titleFieldInfo
		if (!tfi) { tfi = { fieldName: "fileTitle" }; }
		tfi.type = "titleText"; // Always make it titleText
		if (tfi.value === undefined && opts.existingTitle) {
			tfi.value = opts.existingTitle;
		}
		if (opts.existingTitle) {
			tfi.directives = tfi.directives || [];
			if (!tfi.directives.includes("no-prompt")) {
				tfi.directives.push("no-prompt");
			}
		}
		if (tfi.suggest === undefined && tfi.value === undefined && !opts.existingTitle) {
			tfi.suggest = "Untitled";
		}
		// Apply suggested title from metadata (overrides "Untitled" fallback when present)
		if (state.metadata.z2k_template_suggested_title) {
			tfi.suggest = state.metadata.z2k_template_suggested_title;
		}
		state.fieldInfos["fileTitle"] = tfi;

		// clipboard — always used as literal text. See sourceText note above: 'raw-content'
		// prevents the resolver from parsing external content as Handlebars.
		state.fieldInfos["clipboard"] = {
			fieldName: "clipboard",
			type: "text",
			directives: ['no-prompt', 'raw-content'],
			value: await navigator.clipboard.readText(),
		};

		// fileCreationDate - creation date of the file being operated on
		state.fieldInfos["fileCreationDate"] = {
			fieldName: "fileCreationDate",
			type: "text",
			directives: ['no-prompt'],
			value: moment(opts.fileCreationDate ?? Date.now()).format("YYYY-MM-DD"),
		};

		// Plugin-registered built-in fields (issue #169). Populates both the prefixed name
		// (`pluginId__name`) and — when this plugin owns the bare name — the bare name itself,
		// unconditionally overwriting any prior fieldInfo. Matches the behavior of the reserved
		// built-ins above (sourceText, creator, etc.); template references to the bare name create
		// a stub fieldInfo during parse, so a skip-if-exists policy would defeat itself.
		if (this.settings.pluginHelpersEnabled && this.pluginBuiltIns.size > 0) {
			const ctx: BuiltInContext = {
				sourceFile: opts.sourceFile,
				existingFile: opts.existingFile,
				templateName: opts.templateName ?? state.metadata.z2k_template_name ?? "",
				templatePath: opts.templatePath ?? "",
			};
			for (const [pluginId, providers] of this.pluginBuiltIns) {
				if (!this.isPluginRegistrationEnabled(pluginId)) { continue; }
				for (const [name, provider] of providers) {
					const prefixed = this.pluginPrefixedName(pluginId, name);
					let value: unknown;
					try {
						value = provider(ctx);
					} catch (e: any) {
						console.error(`[Z2K Templates] Built-in '${prefixed}' threw:`, e);
						this.errorLogger?.log({
							severity: 'error',
							message: `Plugin '${pluginId}' built-in field '${name}' threw: ${e.message}`,
							error: e,
						});
						value = `[Error in ${prefixed}]`;
					}
					state.fieldInfos[prefixed] = {
						fieldName: prefixed,
						type: "text",
						directives: ['no-prompt'],
						value: value as VarValueType,
					};
					if (this.bareBuiltInOwner.get(name) === pluginId) {
						state.fieldInfos[name] = {
							fieldName: name,
							type: "text",
							directives: ['no-prompt'],
							value: value as VarValueType,
						};
					}
				}
			}
		}
	}

	async addYamlFieldValues(state: TemplateState, additionalYamlSources?: string[]): Promise<void> {
		// YAML frontmatter fields are automatically added as field values.
		// This allows templates to reference metadata from template files, system blocks, and existing files.
		// YAML fields are added with 'no-prompt' directive to avoid re-prompting for existing data.
		// Priority order: Built-ins < YAML fields < fieldInfo.value < Plugin built-ins < Overrides
		// Plugin-reserved keys (TEMPLATE_METADATA_KEYS) are skipped — they live in state.metadata.
		// User-facing fields like 'tags', 'aliases', and 'cssclasses' are included as they represent user data.
		// Values are passed through with their native YAML types (string, number, array, etc.)

		// Merge all YAML sources (from template state + additional sources like system blocks or existing files)
		const allYamlSources = [...state.templatesYaml, ...(additionalYamlSources || [])];
		if (allYamlSources.length === 0) return;

		const mergedYaml = Z2KYamlDoc.mergeLastWins(allYamlSources);
		if (!mergedYaml || mergedYaml.trim() === "") return;

		const doc = Z2KYamlDoc.fromString(mergedYaml);
		const yamlData = doc.doc.toJSON();
		if (!yamlData || typeof yamlData !== 'object') return;

		for (const [key, value] of Object.entries(yamlData)) {
			if (TEMPLATE_METADATA_KEYS.has(key)) { continue; }

			// Skip if fieldInfo already has a value property (higher priority)
			if (state.fieldInfos[key]?.value !== undefined) continue;

			// Create field info if doesn't exist (and add no-prompt directive)
			if (!state.fieldInfos[key]) { state.fieldInfos[key] = { fieldName: key }; }
			if (!state.fieldInfos[key].directives) { state.fieldInfos[key].directives = []; }
			if (!state.fieldInfos[key].directives!.includes('no-prompt')) {
				state.fieldInfos[key].directives!.push('no-prompt');
			}

			// Store as formula so {{references}} resolve dynamically and value is available for other fields
			state.fieldInfos[key].value = value as VarValueType;
		}
	}

	updateYamlOnCreate(fm: string, templateName: string): string {
		const doc = Z2KYamlDoc.fromString(fm);
		doc.set("z2k_template_name", templateName);
		// Only update z2k_template_type if it already exists in the template
		if (doc.get("z2k_template_type") !== undefined) {
			doc.set("z2k_template_type", "wip-content-file");
		}
		// NOTE: Do NOT delete z2k_template_suggested_title or z2k_template_default_fallback_handling here —
		// extractTemplateMetadata needs them in the parsed YAML. Stripped in cleanupYamlAfterFinalize.
		return doc.toString();
	}
	cleanupYamlAfterFinalize(fm: string): string {
		if (!fm || fm.trim() === "") { return fm; }
		// Remove template-only YAML properties that should not appear in finalized output
		const doc = Z2KYamlDoc.fromString(fm);
		doc.del("z2k_template_default_fallback_handling");
		doc.del("z2k_template_suggested_title");
		doc.del("z2k_template_description");
		// Only update z2k_template_type if it already exists
		if (doc.get("z2k_template_type") !== undefined) {
			doc.set("z2k_template_type", "finalized-content-file");
		}
		return doc.toString();
	}
	updateBlockYamlOnInsert(fm: string): string {
		if (!fm || fm.trim() === "") { return fm; }
		const doc = Z2KYamlDoc.fromString(fm);
		doc.del("z2k_template_type");
		doc.del("z2k_template_suggested_title");
		doc.del("z2k_template_default_fallback_handling");
		doc.del("z2k_template_description");
		return doc.toString();
	}
	ensureSourceText(content: string, hadSourceTextField: boolean, sourceText: string): string {
		if (hadSourceTextField) {
			return content;
		} else if (sourceText) {
			return content + "\n\n" + sourceText + "\n";
		} else {
			return content;
		}
	}

	// Walks upward from cardTypeFolder to the vault root, collecting system block files.
	// Recognizes both .system-block.md and system-block.md (dot-prefixed takes priority).
	// At each ancestor level, also checks for Templates/.Templates subfolders and walks down
	// through the corresponding path structure inside them. Each block gets a depth integer
	// (0 = card type folder level, higher = more general). Stop files remove all blocks with
	// depth greater than the stop's depth.
	private async GetSystemBlocksContent(cardTypeFolder: PathFolder): Promise<string> {
		const tfn = this.settings.templatesFolderName;
		const adapter = this.app.vault.adapter;
		const segments = cardTypeFolder.path ? cardTypeFolder.path.split('/') : [];
		let blocks: { content: string, depth: number }[] = [];
		let stopDepths: number[] = [];
		// Walk from card type folder (depth 0) up to vault root (depth = segments.length)
		for (let level = 0; level <= segments.length; level++) {
			const currentPath = segments.slice(0, segments.length - level).join('/');
			const depth = level;
			const relativeSegments = segments.slice(segments.length - level);
			// Direct check at this ancestor
			await this.collectSystemBlock(adapter, currentPath, depth, blocks, stopDepths);
			// Check for templates subfolders and walk down through the relative path inside them
			for (const variant of [tfn, '.' + tfn]) {
				const templatesPath = joinPath(currentPath, variant);
				if (await adapter.exists(templatesPath)) {
					await this.collectSystemBlock(adapter, templatesPath, depth, blocks, stopDepths);
					let walkPath = templatesPath;
					for (let i = 0; i < relativeSegments.length; i++) {
						walkPath = joinPath(walkPath, relativeSegments[i]);
						await this.collectSystemBlock(adapter, walkPath, depth - (i + 1), blocks, stopDepths);
					}
				}
			}
		}
		// Apply stop files: remove all blocks more general than the most restrictive stop
		if (stopDepths.length > 0) {
			const cutoff = Math.min(...stopDepths);
			blocks = blocks.filter(b => b.depth <= cutoff);
		}
		// Sort by depth descending (most general first) so last-wins favors more specific
		blocks.sort((a, b) => b.depth - a.depth);
		let yamls = blocks.map(b => Z2KYamlDoc.splitFrontmatter(b.content).fm);
		let bodies = blocks.map(b => Z2KYamlDoc.splitFrontmatter(b.content).body).filter(body => body.trim() !== '');
		let mergedFm = Z2KYamlDoc.mergeLastWins(yamls);
		let combinedBody = bodies.join('');
		return Z2KYamlDoc.joinFrontmatter(mergedFm, combinedBody);
	}
	private async collectSystemBlock(
		adapter: DataAdapter, folderPath: string, depth: number,
		blocks: { content: string, depth: number }[], stopDepths: number[]
	) {
		// Dot-prefixed version takes priority; fall back to non-dot version
		const dotBlock = joinPath(folderPath, '.system-block.md');
		const plainBlock = joinPath(folderPath, 'system-block.md');
		try {
			blocks.push({ content: await adapter.read(dotBlock), depth });
		} catch {
			try {
				blocks.push({ content: await adapter.read(plainBlock), depth });
			} catch {} // Neither exists
		}
		const dotStop = joinPath(folderPath, '.system-block-stop');
		const plainStop = joinPath(folderPath, 'system-block-stop');
		if (await adapter.exists(dotStop) || await adapter.exists(plainStop)) {
			stopDepths.push(depth);
		}
	}

	// Logging and error handling
	async logWarn(message: string, showNotices: boolean = true) {
		await this.log("warn", showNotices, message);
	}
	async logInfo(message: string, showNotices: boolean = true) {
		await this.log("info", showNotices, message);
	}
	async logDebug(message: string, showNotices: boolean = true) {
		await this.log("debug", showNotices, message);
	}
	async log(severity: ErrorSeverity, showNotices: boolean, message: string, error?: Error) {
		// Don't log UserCancelError (user intentionally cancelled)
		if (error instanceof UserCancelError) {
			return;
		}

		// Always log to file
		await this.errorLogger.log({
			severity,
			message,
			error
		});

		// UI notifications only when requested (suppressed for batch / API / any programmatic caller)
		if (!showNotices) {
			return;
		}

		// Show modal for errors
		if (severity === 'error' && error) {
			new ErrorModal(this.app, error).open();
		}
		// Show notice for warnings/info
		else if (severity === 'warn' || severity === 'info') {
			new Notice(message);
		}
	}
	// Runs an async operation and routes any errors through handleErrors.
	// Use at call sites that want the standard user-facing error handling (toast / modal / log).
	// Callers that want errors to propagate (e.g. the plugin API) should skip this and invoke directly.
	async runWithErrorHandling<T>(fn: () => Promise<T>, showNotices: boolean = true): Promise<T | undefined> {
		try {
			return await fn();
		} catch (error) {
			await this.handleErrors(error, showNotices);
			return undefined;
		}
	}
	private async handleErrors(error: unknown, showNotices: boolean = true) {
		// Display error messages to the user and log them
		if (error instanceof TemplatePluginError) {
			console.error("[Z2K Templates] TemplatePluginError:", error.message);
			await this.log("error", showNotices, error.userMessage || error.message, error);
		} else if (error instanceof UserCancelError) {
			// Just exit, no need to show a message or log
		} else if (error instanceof TemplateError) {
			console.error("[Z2K Templates] Template error:", error.message);
			await this.log("error", showNotices, error.message, error);
		} else {
			console.error("[Z2K Templates] Unexpected error:", error);
			const message = error instanceof Error ? error.message : "An unexpected error occurred";
			const wrappedError = new TemplatePluginError(message, error);
			await this.log("error", showNotices, message, wrappedError);
		}
	}

	// Helpers for file/folder operations
	private getFile(path: string): TFile | null {
		const normalized = normalizeFullPath(path);
		const file = this.app.vault.getAbstractFileByPath(normalized);
		return file instanceof TFile ? file : null;
	}
	async createFile(folder: PathFolder, title: string, content: string): Promise<TFile> {
		try {
			// Ensure the folder exists (card type folder may be virtual, derived from (.)Templates path)
			if (folder.path && !await this.app.vault.adapter.exists(folder.path)) {
				await this.app.vault.createFolder(folder.path);
			}
			const filename = this.getValidFilename(title);
			const newPath = this.generateUniqueFilePath(folder.path, filename);
			const file = await this.app.vault.create(newPath, content);
			return file;
		} catch (error) {
			rethrowWithMessage(error, "Error occurred while creating the file");
		}
	}
	private getFolder(path: string): TFolder | null {
		const normalized = normalizeFullPath(path);
		if (normalized === '') { return this.app.vault.getRoot(); } // Special case for root folder
		const file = this.app.vault.getAbstractFileByPath(normalized);
		return file instanceof TFolder ? file : null;
	}
	async createFolder(path: string): Promise<TFolder> {
		try {
			const normalized = normalizeFullPath(path);
			let folder = this.getFolder(normalized);
			if (!folder) { folder = await this.app.vault.createFolder(normalized); }
			return folder;
		} catch (error) {
			rethrowWithMessage(error, `Error occurred while creating the folder at path '${path}'`);
		}
	}
	private getMarkdownFilesInFolder(folder: TFolder, recurse = false): TFile[] {
		let files: TFile[] = [];

		// Process all children
		folder.children.forEach(child => {
			if (child instanceof TFile && child.extension === 'md') {
				files.push(child);
			} else if (child instanceof TFolder && recurse) {
				files = files.concat(this.getMarkdownFilesInFolder(child, true));
			}
		});

		return files;
	}
	private hasFillableFields(fieldInfos: Record<string, FieldInfo>): boolean {
		for (const fieldInfo of Object.values(fieldInfos)) {
			if (!fieldInfo.directives?.includes("no-prompt")) { return true; }
		}
		return false;
	}
}


