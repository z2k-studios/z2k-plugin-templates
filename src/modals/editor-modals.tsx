import { App, Modal, Notice, TFolder } from 'obsidian';
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from "@codemirror/view";
import { EditorState, Compartment, type Extension } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { syntaxHighlighting, bracketMatching, HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { javascript } from "@codemirror/lang-javascript";
import { handlebarsOverlay } from '../syntax-highlighting';
import { Z2KTemplatesPluginSettings, ErrorBoundary } from '../utils';
import { SuggestInput, SuggestItem } from '../components/suggest-input';
import type Z2KTemplatesPlugin from '../main';

// ------------------------------------------------------------------------------------------------
// Code Editor Modal
// ------------------------------------------------------------------------------------------------
interface EditorModalOptions {
	title: string;
	initialContent: string;
	language: 'javascript' | 'handlebars';
	helpText: string;
	validate: (code: string) => { valid: boolean; error?: string; message?: string };
	onSave: (content: string) => void;
}

interface ValidationState {
	status: 'pending' | 'valid' | 'invalid';
	message?: string;
}

function EditorModalContent({
	initialContent,
	language,
	helpText,
	validate,
	onCancel,
	onSave,
}: {
	initialContent: string;
	language: 'javascript' | 'handlebars';
	helpText: string;
	validate: (code: string) => { valid: boolean; error?: string; message?: string };
	onCancel: () => void;
	onSave: (content: string) => void;
}) {
	const [content, setContent] = useState(initialContent);
	const [helpExpanded, setHelpExpanded] = useState(false);
	const [validation, setValidation] = useState<ValidationState>({ status: 'pending' });
	const [canSave, setCanSave] = useState(false);
	const [fontSize, setFontSize] = useState(14);
	const editorContainerRef = useRef<HTMLDivElement>(null);
	const editorViewRef = useRef<EditorView | null>(null);
	const fontSizeCompartment = useRef(new Compartment());
	const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const makeFontSizeTheme = (size: number) => EditorView.theme({
		"&": { fontSize: `${size}px` },
		".cm-scroller": { fontSize: `${size}px` },
		".cm-content": { fontSize: `${size}px`, fontFamily: "var(--font-monospace)" },
		".cm-gutters": { fontSize: `${size}px` },
	});

	// Run validation
	const runValidation = (code: string) => {
		const result = validate(code);
		if (result.valid) {
			setValidation({ status: 'valid', message: result.message });
			setCanSave(true);
		} else {
			setValidation({ status: 'invalid', message: result.error });
			setCanSave(false);
		}
	};

	// Initial validation
	useEffect(() => {
		runValidation(initialContent);
	}, []);

	// Setup CodeMirror
	useEffect(() => {
		if (!editorContainerRef.current) { return; }

		// Custom highlight style using Obsidian's CSS variables
		const obsidianHighlightStyle = HighlightStyle.define([
			{ tag: tags.keyword, color: "var(--code-keyword)" },
			{ tag: tags.string, color: "var(--code-string)" },
			{ tag: tags.number, color: "var(--code-value)" },
			{ tag: tags.bool, color: "var(--code-value)" },
			{ tag: tags.null, color: "var(--code-value)" },
			{ tag: tags.comment, color: "var(--code-comment)", fontStyle: "italic" },
			{ tag: tags.variableName, color: "var(--code-property)" },
			{ tag: tags.function(tags.variableName), color: "var(--code-function)" },
			{ tag: tags.propertyName, color: "var(--code-property)" },
			{ tag: tags.operator, color: "var(--code-operator)" },
			{ tag: tags.punctuation, color: "var(--code-punctuation)" },
			{ tag: tags.className, color: "var(--code-tag)" },
			{ tag: tags.definition(tags.variableName), color: "var(--code-property)" },
		]);

		// Use handlebarsOverlay for Handlebars (matches main editor), javascript() for JS
		const languageExtensions = language === 'javascript'
			? [javascript(), syntaxHighlighting(obsidianHighlightStyle)]
			: [handlebarsOverlay()];

		const extensions: Extension[] = [
			lineNumbers(),
			highlightActiveLine(),
			highlightActiveLineGutter(),
			history(),
			bracketMatching(),
			keymap.of([...defaultKeymap, ...historyKeymap]),
			...languageExtensions,
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					const newContent = update.state.doc.toString();
					setContent(newContent);
					setCanSave(false); // Disable save while typing
					// Debounced validation
					clearTimeout(debounceRef.current);
					debounceRef.current = setTimeout(() => {
						runValidation(newContent);
					}, 1000);
				}
			}),
			EditorView.theme({
				"&": { height: "100%" },
				".cm-scroller": { overflow: "auto" },
			}),
			fontSizeCompartment.current.of(makeFontSizeTheme(fontSize)),
		];

		const state = EditorState.create({
			doc: initialContent,
			extensions,
		});

		const view = new EditorView({
			state,
			parent: editorContainerRef.current,
		});

		editorViewRef.current = view;

		return () => {
			view.destroy();
		};
	}, [language]);

	// Reconfigure font size theme when font size changes
	useEffect(() => {
		const view = editorViewRef.current;
		if (view) {
			view.dispatch({
				effects: fontSizeCompartment.current.reconfigure(makeFontSizeTheme(fontSize))
			});
			// Force remeasure after CSS applies
			requestAnimationFrame(() => {
				view.requestMeasure();
			});
		}
	}, [fontSize]);

	const adjustFontSize = (delta: number) => {
		setFontSize(prev => Math.max(6, Math.min(20, prev + delta)));
	};

	return (
		<div className="editor-modal-content">
			{/* Toolbar row with help toggle and font size */}
			<div className="editor-toolbar">
				<div
					className="help-header"
					onClick={() => setHelpExpanded(!helpExpanded)}
				>
					<span className="help-toggle">{helpExpanded ? '▼' : '▶'}</span>
					<span>Help</span>
				</div>
				<button
					className="toolbar-btn"
					onClick={() => adjustFontSize(-1)}
					title="Decrease font size"
				>
					A−
				</button>
				<span className="font-size-label">{fontSize}px</span>
				<button
					className="toolbar-btn"
					onClick={() => adjustFontSize(1)}
					title="Increase font size"
				>
					A+
				</button>
			</div>

			{/* Collapsible help content */}
			{helpExpanded && (
				<div className="help-content">
					<pre>{helpText}</pre>
				</div>
			)}

			{/* CodeMirror editor */}
			<div
				className="editor-container"
				ref={editorContainerRef}
			/>

			{/* Validation status */}
			<div className={`validation-status ${validation.status}`}>
				{validation.status === 'valid' && `✓ ${validation.message || 'Valid'}`}
				{validation.status === 'invalid' && `✗ ${validation.message || 'Invalid'}`}
				{validation.status === 'pending' && ''}
			</div>

			{/* Buttons */}
			<div className="modal-buttons">
				<button className="btn btn-secondary" onClick={onCancel}>
					Cancel
				</button>
				<button
					className="btn btn-primary"
					onClick={() => onSave(content)}
					disabled={!canSave}
				>
					Save
				</button>
			</div>
		</div>
	);
}

// ------------------------------------------------------------------------------------------------
// Quick Commands Modal
// ------------------------------------------------------------------------------------------------
type QuickCommand = Z2KTemplatesPluginSettings["quickCommands"][number];
function newQuickCommand(): QuickCommand {
	return {
		id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
		name: '',
		action: 'create',
		targetFolder: '',
		templateFile: '',
		sourceText: 'none',
	};
}
// Sort template items by proximity to a target folder.
// Templates whose card type (detail) matches the target come first, then root-level, then rest.
function sortTemplatesByProximity(items: SuggestItem[], targetFolder: string, templatesRoot: string): SuggestItem[] {
	if (!targetFolder.trim()) { return items; }
	// Strip templates root from target to get effective card type path
	let target = targetFolder;
	if (templatesRoot && target.startsWith(templatesRoot + '/')) {
		target = target.substring(templatesRoot.length + 1);
	} else if (target === templatesRoot) {
		target = '';
	}
	if (!target) { return items; }
	const segCount = (p: string) => p === '' || p === '/' ? 0 : p.split('/').length;
	const targetSegs = segCount(target);
	// Rank each template: distance = how many segments the card type is above the target
	// Only count as related if card type is a prefix of (or equal to) target
	const ranked = items.map(item => {
		const cardType = item.detail === '/' ? '' : (item.detail || '');
		const isAncestor = cardType === '' || target === cardType || target.startsWith(cardType + '/');
		const distance = isAncestor ? targetSegs - segCount(cardType) : Infinity;
		return { item, distance };
	});
	ranked.sort((a, b) => a.distance - b.distance);
	return ranked.map(r => r.item);
}

function QuickCommandsModalContent({ initialCommands, onSave, onCancel, loadSuggestItems }: {
	initialCommands: QuickCommand[];
	onSave: (commands: QuickCommand[]) => void;
	onCancel: () => void;
	loadSuggestItems: () => Promise<{ folderItems: SuggestItem[]; templateItems: SuggestItem[]; templatesRoot: string }>;
}) {
	const [folderItems, setFolderItems] = useState<SuggestItem[] | null>(null);
	const [templateItems, setTemplateItems] = useState<SuggestItem[] | null>(null);
	const [templatesRoot, setTemplatesRoot] = useState('');
	useEffect(() => {
		loadSuggestItems().then(result => {
			setFolderItems(result.folderItems);
			setTemplateItems(result.templateItems);
			setTemplatesRoot(result.templatesRoot);
		}).catch(() => {
			setFolderItems([]);
			setTemplateItems([]);
		});
	}, []);
	const [commands, setCommands] = useState<QuickCommand[]>(() =>
		initialCommands.map(c => ({...c}))
	);
	const updateCommand = (index: number, updates: Partial<QuickCommand>) => {
		setCommands(prev => prev.map((c, i) => i === index ? {...c, ...updates} : c));
	};
	const removeCommand = (index: number) => {
		setCommands(prev => prev.filter((_, i) => i !== index));
	};
	const moveCommand = (index: number, direction: -1 | 1) => {
		const target = index + direction;
		if (target < 0 || target >= commands.length) { return; }
		setCommands(prev => {
			const next = [...prev];
			[next[index], next[target]] = [next[target], next[index]];
			return next;
		});
	};
	const insertCommand = (afterIndex: number) => {
		setCommands(prev => {
			const next = [...prev];
			next.splice(afterIndex + 1, 0, newQuickCommand());
			return next;
		});
	};
	const hasEmptyNames = commands.some(c => !c.name.trim());
	return (
		<div className="quick-commands-editor">
			<div className="quick-commands-list">
				{commands.length === 0 && (
					<div className="quick-commands-empty">No quick commands configured.</div>
				)}
				{commands.map((cmd, i) => (
					<div key={cmd.id} className={`quick-command-card${!cmd.name.trim() && commands.length > 0 ? ' is-invalid' : ''}`}>
						<div className="quick-command-fields">
							<label>
								Name
								<input
									type="text"
									value={cmd.name}
									placeholder="New Thought"
									onChange={e => updateCommand(i, {name: e.target.value})}
								/>
							</label>
							<label>
								Action
								<select
									className="dropdown"
									value={cmd.action}
									onChange={e => updateCommand(i, {action: e.target.value as QuickCommand["action"]})}
								>
									<option value="create">Create New File</option>
									<option value="insert">Insert Block</option>
								</select>
							</label>
							<label>
								Target Folder
								<SuggestInput
									value={cmd.targetFolder}
									onChange={v => updateCommand(i, {targetFolder: v})}
									items={folderItems}
									placeholder="Folder name or path (empty = prompt)"
								/>
							</label>
							<label>
								Template File
								<SuggestInput
									value={cmd.templateFile}
									onChange={v => updateCommand(i, {templateFile: v})}
									items={templateItems ? sortTemplatesByProximity(templateItems, cmd.targetFolder, templatesRoot) : null}
									placeholder="Template name or path (empty = prompt)"
								/>
							</label>
							<label>
								Source Text
								<select
									className="dropdown"
									value={cmd.sourceText}
									onChange={e => updateCommand(i, {sourceText: e.target.value as QuickCommand["sourceText"]})}
								>
									<option value="none">None</option>
									<option value="selection">Selection</option>
									<option value="clipboard">Clipboard</option>
								</select>
							</label>
						</div>
						<div className="quick-command-controls">
							<button
								className="clickable-icon"
								aria-label="Move up"
								disabled={i === 0}
								onClick={() => moveCommand(i, -1)}
							>↑</button>
							<button
								className="clickable-icon"
								aria-label="Move down"
								disabled={i === commands.length - 1}
								onClick={() => moveCommand(i, 1)}
							>↓</button>
							<button
								className="clickable-icon"
								aria-label="Insert below"
								onClick={() => insertCommand(i)}
							>+</button>
							<button
								className="clickable-icon"
								aria-label="Delete"
								onClick={() => removeCommand(i)}
							>×</button>
						</div>
					</div>
				))}
			</div>
			<div className="quick-commands-actions">
				<button
					className="mod-cta"
					onClick={() => setCommands(prev => [...prev, newQuickCommand()])}
				>
					Add Command
				</button>
			</div>
			<div className="quick-commands-footer">
				{hasEmptyNames && <span className="quick-commands-error">All commands need a name</span>}
				<button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
				<button className="btn btn-primary" onClick={() => onSave(commands)} disabled={hasEmptyNames}>Save</button>
			</div>
		</div>
	);
}
export class QuickCommandsModal extends Modal {
	plugin: Z2KTemplatesPlugin;
	root: any;
	constructor(app: App, plugin: Z2KTemplatesPlugin) {
		super(app);
		this.plugin = plugin;
	}
	onOpen() {
		this.modalEl.addClass('z2k', 'quick-commands-modal');
		this.titleEl.setText('Quick Commands');
		this.contentEl.empty();
		this.contentEl.addClass('modal-content');
		this.root = createRoot(this.contentEl);
		this.root.render(
			<ErrorBoundary onError={(error) => { new Notice(`Quick Commands error: ${error.message}`); this.close(); }}>
				<QuickCommandsModalContent
					initialCommands={this.plugin.settings.quickCommands}
					loadSuggestItems={() => this.buildSuggestItems()}
					onCancel={() => this.close()}
					onSave={async (commands) => {
						this.plugin.settings.quickCommands = commands;
						await this.plugin.saveData(this.plugin.settings);
						this.plugin.queueRefreshCommands();
						this.close();
					}}
				/>
			</ErrorBoundary>
		);
	}
	private async buildSuggestItems(): Promise<{ folderItems: SuggestItem[]; templateItems: SuggestItem[]; templatesRoot: string }> {
		// Build folder suggestions from all vault folders (excluding template folders)
		const folderItems: SuggestItem[] = [];
		const tfn = this.plugin.settings.templatesFolderName;
		const allFiles = this.app.vault.getAllLoadedFiles();
		for (const f of allFiles) {
			if (!(f instanceof TFolder)) { continue; }
			if (f.isRoot()) { continue; }
			if (f.path.startsWith('.')) { continue; } // Skip dot-prefixed system folders
			if (f.name === tfn || f.name === '.' + tfn) { continue; } // Skip template folders
			folderItems.push({
				label: f.path,
				value: f.path,
			});
		}
		// Build template suggestions
		const templateItems: SuggestItem[] = [];
		const templates = await this.plugin.getAllTemplates();
		const baseNameCount = new Map<string, number>();
		for (const t of templates) {
			baseNameCount.set(t.file.basename, (baseNameCount.get(t.file.basename) || 0) + 1);
		}
		const dotTfn = '.' + tfn;
		for (const t of templates) {
			const isAmbiguous = (baseNameCount.get(t.file.basename) || 0) > 1;
			// Strip templates folder name from end of parent path to show card type
			let detail = t.file.parentPath || '/';
			if (detail.endsWith('/' + tfn)) { detail = detail.slice(0, -(tfn.length + 1)); }
			else if (detail.endsWith('/' + dotTfn)) { detail = detail.slice(0, -(dotTfn.length + 1)); }
			else if (detail === tfn || detail === dotTfn) { detail = '/'; }
			templateItems.push({
				label: t.file.basename,
				value: isAmbiguous ? t.file.path : t.file.basename,
				detail: detail || '/',
			});
		}
		return { folderItems, templateItems, templatesRoot: this.plugin.settings.templatesRootFolder };
	}
	onClose() {
		if (this.root) { this.root.unmount(); }
		this.contentEl.empty();
	}
}

export class EditorModal extends Modal {
	options: EditorModalOptions;
	root: any;

	constructor(app: App, options: EditorModalOptions) {
		super(app);
		this.options = options;
	}

	onOpen() {
		this.modalEl.addClass('z2k', 'editor-modal');
		this.titleEl.setText(this.options.title);
		this.contentEl.empty();
		this.contentEl.addClass('modal-content');

		this.root = createRoot(this.contentEl);
		this.root.render(
			<ErrorBoundary onError={(error) => { new Notice(`Editor error: ${error.message}`); this.close(); }}>
				<EditorModalContent
					initialContent={this.options.initialContent}
					language={this.options.language}
					helpText={this.options.helpText}
					validate={this.options.validate}
					onCancel={() => this.close()}
					onSave={(content) => {
						this.options.onSave(content);
						this.close();
					}}
				/>
			</ErrorBoundary>
		);
	}

	onClose() {
		if (this.root) { this.root.unmount(); }
		this.contentEl.empty();
	}
}

