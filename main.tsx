
// TODO: Add error handling for errors within react components by using React Error Boundaries

import { App, Plugin, Modal, Notice, TFolder, TFile, PluginSettingTab, Setting, MarkdownView, Editor } from 'obsidian';
import { Z2KTemplateEngine, TemplateStateNew, VarValueType, PromptInfo, TemplateError } from 'z2k-template-engine';
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import moment from 'moment';   // npm i moment

interface Z2KPluginSettings {
	z2kRootFolder: string;
	useExternalTemplates: boolean;
	embeddedTemplatesFolderName: string;
	externalTemplatesFolder: string;
	partialPrefixFilter: string;
	creator: string;
}

const DEFAULT_SETTINGS: Z2KPluginSettings = {
	z2kRootFolder: '/Z2K',
	useExternalTemplates: false,
	embeddedTemplatesFolderName: 'Templates',
	externalTemplatesFolder: '/Templates-External',
	partialPrefixFilter: 'Partial - ',
	creator: '',
};

class Z2KSettingTab extends PluginSettingTab {
	plugin: Z2KPlugin;

	constructor(app: App, plugin: Z2KPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		containerEl.addClass('z2k-settings');
		containerEl.createEl('h2', {text: 'Z2K Template Settings'});

		new Setting(containerEl)
			.setName('Z2K root folder')
			.setDesc('Folder where card structure starts')
			.addText(text => {
				const input = text
					.setPlaceholder(DEFAULT_SETTINGS.z2kRootFolder)
					.setValue(this.plugin.settings.z2kRootFolder)
					.inputEl;

				this.validateTextInput(input,
					(value) => {
						if (/[*?"<>|:]/.test(value)) { return "Invalid characters in folder path"; }
						return null;
					},
					async (validValue) => {
						this.plugin.settings.z2kRootFolder = validValue;
						await this.plugin.saveData(this.plugin.settings);
					});
			});


		new Setting(containerEl)
			.setName('Use external templates folder')
			.setDesc('If enabled, templates will be loaded from the external templates folder')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useExternalTemplates)
				.onChange(async (value) => {
					this.plugin.settings.useExternalTemplates = value;
					await this.plugin.saveData(this.plugin.settings);
					this.display(); // re-render settings UI
				}));

		if (this.plugin.settings.useExternalTemplates) {
			new Setting(containerEl)
				.setName('External templates folder')
				.setDesc('All files within this folder will show up as templates')
				.addText(text => {
					const input = text
						.setPlaceholder(DEFAULT_SETTINGS.externalTemplatesFolder)
						.setValue(this.plugin.settings.externalTemplatesFolder)
						.inputEl;

					this.validateTextInput(input,
						(value) => {
							if (/[*?"<>|:]/.test(value)) { return "Invalid characters in folder path"; }
							return null;
						},
						async (validValue) => {
							this.plugin.settings.externalTemplatesFolder = validValue;
							await this.plugin.saveData(this.plugin.settings);
						});
				});
		} else {
			new Setting(containerEl)
				.setName('Embedded templates folder name')
				.setDesc('Any files within folders of this name will show up as templates')
				.addText(text => {
					const input = text
						.setPlaceholder(DEFAULT_SETTINGS.embeddedTemplatesFolderName)
						.setValue(this.plugin.settings.embeddedTemplatesFolderName)
						.inputEl;

					this.validateTextInput(input,
						(value) => {
							if (!value.trim()) { return "Folder name cannot be empty"; }
							if (value.includes('/') || value.includes('\\')) { return "Folder name cannot contain slashes"; }
							if (/^[.]+$/.test(value)) { return `"${value}" is not a valid folder name`; }
							if (/[*?"<>|:]/.test(value)) { return "Invalid characters in folder name"; }
							return null;
						},
						async (validValue) => {
							this.plugin.settings.embeddedTemplatesFolderName = validValue;
							await this.plugin.saveData(this.plugin.settings);
						});
				});
		}

		new Setting(containerEl)
			.setName('Block prefix filter')
			.setDesc('Filename prefix to mark the template as a block-template')
			.addText(text => {
				const input = text
					.setPlaceholder(DEFAULT_SETTINGS.partialPrefixFilter)
					.setValue(this.plugin.settings.partialPrefixFilter)
					.inputEl;

				this.validateTextInput(input,
					(value) => {
						if (!value.trim()) { return "Prefix cannot be empty"; }
						if (/[*?"<>|:./\\]/.test(value)) { return "Invalid characters in prefix"; }
						return null;
					},
					async (validValue) => {
						this.plugin.settings.partialPrefixFilter = validValue;
						await this.plugin.saveData(this.plugin.settings);
					});
			});

		new Setting(containerEl)
			.setName('Creator name')
			.setDesc('Name to put in YAML when creating new cards (disabled if empty)')
			.addText(text => {
				const input = text
					.setPlaceholder(DEFAULT_SETTINGS.creator)
					.setValue(this.plugin.settings.creator)
					.inputEl;

				this.validateTextInput(input,
					(value) => {
						if (value.length > 100) { return "Creator name is too long"; }
						return null;
					},
					async (validValue) => {
						this.plugin.settings.creator = validValue;
						await this.plugin.saveData(this.plugin.settings);
					});
			});
	}

	validateTextInput(
		el: HTMLInputElement,
		isValid: (val: string) => string | null,
		onValid: (val: string) => Promise<void>
	) {
		let lastValid = el.value;
		const settingItem = el.closest('.setting-item');
		let errorDescEl: HTMLElement | null = null;

		const showError = (msg: string) => {
			const infoEl = settingItem?.querySelector('.setting-item-info');
			if (!errorDescEl && infoEl) {
				errorDescEl = infoEl.createDiv({cls: ['setting-item-description', 'setting-item-error-description']});
			}
			errorDescEl?.setText(msg);
			settingItem?.addClass('is-invalid');
		};

		const clearError = () => {
			errorDescEl?.remove();
			errorDescEl = null;
			settingItem?.removeClass('is-invalid');
		};

		const applyValidation = async (val: string) => {
			const err = isValid(val);
			if (err) {
				showError(err);
			} else {
				clearError();
				lastValid = val;
				await onValid(val);
			}
		};

		el.addEventListener('input', () => applyValidation(el.value));
		el.addEventListener('blur', () => {
			if (settingItem?.classList.contains('is-invalid')) {
				el.value = lastValid;
				clearError();
			}
		});
	}
}

export default class Z2KPlugin extends Plugin {
	templateEngine: Z2KTemplateEngine;
	settings: Z2KPluginSettings;

	async onload() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.templateEngine = new Z2KTemplateEngine();
		this.registerCommands();
		this.addSettingTab(new Z2KSettingTab(this.app, this));

		// // API?
		// this.registerObsidianProtocolHandler("z2k-templates", async (params) => {
		// 	try {
		// 		const action = params.action;
		// 		if (!action) throw new Error("Missing 'action' parameter");

		// 		const templatePath = decodeURIComponent(params.templatepath || params.partialpath || "").trim();
		// 		if (!templatePath) throw new Error("Missing 'templatepath' or 'partialpath'");

		// 		// Resolve template file
		// 		const templateFile = this.getFile(templatePath);
		// 		if (!templateFile || templateFile.extension !== "md") {
		// 			throw new Error(`Template not found: ${templatePath}`);
		// 		}

		// 		// Determine target folder and filename
		// 		let rawPath = decodeURIComponent(params.filepath || "").trim();
		// 		let finalPath = "";
		// 		let timestampFilename = moment().format("YYYY-MM-DD_HH-mm-ss") + ".md";
		// 		if (!rawPath) {
		// 			// No filepath → root + timestamp
		// 			finalPath = this.joinPath(this.settings.z2kRootFolder, timestampFilename);
		// 		} else if (!rawPath.includes("/")) {
		// 			// Filename only → resolve folder from template
		// 			const folder = this.resolveTemplateParentFolder(templateFile);
		// 			const filename = rawPath.endsWith(".md") ? rawPath : `${rawPath}.md`;
		// 			finalPath = this.joinPath(folder, filename);

		// 		} else {
		// 			const endsWithSlash = rawPath.endsWith("/") || !rawPath.includes(".");
		// 			if (endsWithSlash) {
		// 				// Case 2: Folder path → use folder + timestamp
		// 				const folder = rawPath.replace(/\/+$/, "");
		// 				const filename = `${Date.now()}.md`;
		// 				finalPath = this.joinPath(folder, filename);
		// 			} else {
		// 				// Case 4: Full path → use as-is, just ensure `.md`
		// 				finalPath = rawPath.endsWith(".md") ? rawPath : `${rawPath}.md`;
		// 			}
		// 		}


		// 		if (filepath && filepath.endsWith("/")) {
		// 			folderPath = filepath.slice(0, -1);
		// 		} else if (filepath.includes("/")) {
		// 			folderPath = filepath.substring(0, filepath.lastIndexOf("/"));
		// 		} else {
		// 			folderPath = this.settings.z2kRootFolder;
		// 		}

		// 		// Filename fallback
		// 		let fileName = filepath.substring(filepath.lastIndexOf("/") + 1) || `${Date.now()}`;
		// 		if (!fileName.endsWith(".md")) fileName += ".md";
		// 		finalPath = this.joinPath(folderPath, fileName);

		// 		// Extract template fields (skip known ones)
		// 		const known = new Set(["action", "vault", "templatepath", "partialpath", "filepath", "existingfilepath", "templateJSONdata", "destheader", "location"]);
		// 		const templateVars: Record<string, string> = {};
		// 		for (const key in params) {
		// 			if (!known.has(key)) {
		// 				templateVars[key] = decodeURIComponent(params[key]);
		// 			}
		// 		}

		// 		// Optional: decode JSON fields
		// 		let parsedJson = {};
		// 		if (params.templateJSONdata) {
		// 			try {
		// 				parsedJson = JSON.parse(decodeURIComponent(params.templateJSONdata));
		// 			} catch (e) {
		// 				new Notice("Failed to parse templateJSONdata");
		// 				return;
		// 			}
		// 		}

		// 		if (action === "New") {
		// 			await this.createOrContinueCard({
		// 				inputFile: undefined,
		// 				continueFile: undefined,
		// 				// Inject preloaded content/vars if needed
		// 				__uriInjected: {
		// 					templateFile,
		// 					filepath: finalPath,
		// 					fieldOverrides: { ...parsedJson, ...templateVars },
		// 				},
		// 			});

		// 		} else if (action === "InsertPartial") {
		// 			await this.insertPartialTemplate({
		// 				inputText: "",
		// 				__uriInjected: {
		// 					partialFile: templateFile,
		// 					existingFilePath: filepath,
		// 					destHeader: params.destheader,
		// 					insertLocation: params.location || "top",
		// 					fieldOverrides: { ...parsedJson, ...templateVars },
		// 				},
		// 			});

		// 		} else {
		// 			new Notice(`Unknown Z2K action: ${action}`);
		// 		}

		// 	} catch (e) {
		// 		console.error("[Z2K URI handler error]", e);
		// 		new Notice("Failed to process z2k-templates URI");
		// 	}
		// });
	}
	onunload() {}

	registerCommands() {
		// Command palette commands
		this.addCommand({
			id: 'z2k-create-new-card',
			name: 'Create card from template',
			callback: () => this.createCard(),
		});

		// Command palette commands for when text is selected
		this.addCommand({
			id: 'z2k-create-card-from-selected-text',
			name: 'Create card from selected text',
			editorCheckCallback: (checking, editor) => {
				const selectedText = editor.getSelection();
				if (checking) { return selectedText.length > 0; } // Only enable if text is selected
				this.createCardFromSelection();
			},
		});

		// Context menu 'new card from selection' when text is selected
		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor) => {
				const selectedText = editor.getSelection();
				if (selectedText.length === 0) return;
				menu.addItem((item) => {
					item.setTitle("Z2K: Create card from selection...")
						.onClick(() => {
							this.createCardFromSelection();
						});
				});
			})
		);

		// Command palette 'convert file to card' when a file is active
		this.addCommand({
			id: 'z2k-convert-file-to-card',
			name: 'Convert file to card',
			checkCallback: (checking) => {
				const activeFile = this.app.workspace.getActiveFile();
				// Only enable if there's an active file and it's a markdown file
				if (checking) { return !!activeFile && activeFile.extension === 'md'; }
				this.createCardFromFile(activeFile as TFile);
			},
		});

		// Command palette 'continue card creation' to continue creating a card from an existing file
		this.addCommand({
			id: 'z2k-continue-filling-card',
			name: 'Continue filling card',
			editorCheckCallback: (checking, editor) => {
				const activeFile = this.app.workspace.getActiveFile();
				if (checking) { return !!activeFile && activeFile.extension === 'md'; }
				this.continueCard(activeFile as TFile);
			},
		});

		// Command palette for inserting a partial when no text is selected
		this.addCommand({
			id: 'z2k-insert-partial-template',
			name: 'Insert partial template',
			editorCheckCallback: (checking, editor) => {
				const file = this.app.workspace.getActiveFile();
				if (checking) {
					// Only enable if there's an active markdown file and no text is selected
					return !!file && file.extension === 'md' && editor.getSelection().length === 0;
				}
				this.insertPartial();
			}
		});

		// Context menu for inserting a partial template when no text is selected
		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor) => {
				const file = this.app.workspace.getActiveFile();
				if (!(file instanceof TFile) || file.extension !== 'md') return;
				const selectedText = editor.getSelection();
				if (selectedText.length > 0) return;
				menu.addItem((item) => {
					item.setTitle("Z2K: Insert partial template...")
						.onClick(() => {
							this.insertPartial();
						});
				});
			})
		);

		// Command palette for inserting a partial template when text is selected
		this.addCommand({
			id: 'z2k-insert-partial-template-from-selection',
			name: 'Insert partial template using selected text',
			editorCheckCallback: (checking, editor) => {
				const file = this.app.workspace.getActiveFile();
				if (checking) {
					// Only enable if there's an active markdown file and text is selected
					return !!file && file.extension === 'md' && editor.getSelection().length > 0;
				}
				this.insertPartialFromSelection();
			}
		});

		// Context menu for inserting a partial template when text is selected
		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor) => {
				const file = this.app.workspace.getActiveFile();
				if (!(file instanceof TFile) || file.extension !== 'md') return;
				const selectedText = editor.getSelection();
				if (selectedText.length === 0) return;
				menu.addItem((item) => {
					item.setTitle("Z2K: Insert partial template using selection...")
						.onClick(() => {
							this.insertPartialFromSelection();
						});
				});
			})
		);


		//// Template editing mode
		// Toggle
		this.addCommand({
			id: 'z2k-enable-template-editing',
			name: 'Enable template editing mode',
			checkCallback: (checking) => {
				if (checking) { return !this.isTemplateEditingEnabled(); }
				this.enableTemplateEditing();
			},
		});
		this.addCommand({
			id: 'z2k-disable-template-editing',
			name: 'Disable template editing mode',
			checkCallback: (checking) => {
				if (checking) { return this.isTemplateEditingEnabled(); }
				this.disableTemplateEditing();
			},
		});
		// Toggle in context menu in file explorer
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				if (!(file instanceof TFile) || file.extension !== 'md') return;
				menu.addItem((item) => {
					if (this.isTemplateEditingEnabled()) {
						item.setTitle("Disable Template Editing Mode")
							.onClick(() => this.disableTemplateEditing());
					} else {
						item.setTitle("Enable Template Editing Mode")
							.onClick(() => this.enableTemplateEditing());
					}
				});
			})
		);

		{ // Template conversion
			// Command
			this.addCommand({
				id: 'z2k-convert-file-to-template',
				name: 'Convert file to named template',
				checkCallback: (checking) => {
					const activeFile = this.app.workspace.getActiveFile();
					if (checking) { return !!activeFile && activeFile.extension !== 'template'; }
					this.convertFileToExtension(activeFile as TFile, 'template');
				},
			});
			this.addCommand({
				id: 'z2k-convert-file-to-partial',
				name: 'Convert file to partial template',
				checkCallback: (checking) => {
					const activeFile = this.app.workspace.getActiveFile();
					if (checking) { return !!activeFile && activeFile.extension !== 'partial'; }
					this.convertFileToExtension(activeFile as TFile, 'partial');
				},
			});
			this.addCommand({
				id: 'z2k-convert-file-to-md',
				name: 'Convert file to markdown',
				checkCallback: (checking) => {
					const activeFile = this.app.workspace.getActiveFile();
					if (checking) { return !!activeFile && activeFile.extension !== 'md'; }
					this.convertFileToExtension(activeFile as TFile, 'md');
				},
			});

			// Context menu in file explorer
			this.registerEvent(
				this.app.workspace.on('file-menu', (menu, file) => {
					if (!(file instanceof TFile) || file.extension === 'template') return;
					menu.addItem((item) => {
						item.setTitle("Convert to named template")
							.onClick(() => this.convertFileToExtension(file, 'template'));
					});
				})
			);
			this.registerEvent(
				this.app.workspace.on('file-menu', (menu, file) => {
					if (!(file instanceof TFile) || file.extension === 'partial') return;
					menu.addItem((item) => {
						item.setTitle("Convert to partial template")
							.onClick(() => this.convertFileToExtension(file, 'partial'));
					});
				})
			);
			this.registerEvent(
				this.app.workspace.on('file-menu', (menu, file) => {
					if (!(file instanceof TFile) || file.extension === 'md') return;
					menu.addItem((item) => {
						item.setTitle("Convert to markdown")
							.onClick(() => this.convertFileToExtension(file, 'md'));
					});
				})
			);
		}
	}



	///////////////////////////////////////////////////////////////////////////////////
	// Functions called from commands/context menu/etc
	// 	These should all handle any errors
	///////////////////////////////////////////////////////////////////////////////////

	// Template editing
	enableTemplateEditing() {
		// @ts-expect-error: internal API
		this.app.viewRegistry.registerExtensions(["template"], "markdown");
	}
	disableTemplateEditing() {
		// @ts-expect-error: internal API
		this.app.viewRegistry.unregisterExtensions("template");
	}
	isTemplateEditingEnabled(): boolean {
		// @ts-expect-error: internal API
		return !!this.app.viewRegistry.getTypeByExtension("template");
	}

	// Template conversion
	async convertFileToExtension(file: TFile, newExtension: string) {
		if (!file) { throw new Error("No file given to convert extension."); }
		try {
			const parentPath = file.parent?.path ?? "/";
			const newPath = this.joinPath(parentPath, `${file.basename}.${newExtension}`);
			await this.app.fileManager.renameFile(file, newPath);
		} catch (error) {
			rethrowWithMessage(error, "Error converting file extension");
		}
	}

	// Card creation and management
	// 	(I couldn't find a good way to de-duplicate these functions,
	// 	so I made them separate and tried to reduce the repetition as much as I could)
	async createCard() {
		try {
			const cardTypeFolder = await this.promptForCardTypeFolder();
			const templateFile = await this.promptForTemplateFile(cardTypeFolder);
			let state = await this.parseTemplate(templateFile);
			state = await this.promptForFieldCollection(state);
			let content = Z2KTemplateEngine.renderTemplateNew(state);
			let title = state.resolvedValues["title"] as string || "Untitled";
			title = Z2KTemplateEngine.reducedRenderContent(title, state.resolvedValues);
			await this.createAndOpenFile(cardTypeFolder, title, content);
		} catch (error) { this.handleErrors(error); }
	}
	async createCardFromFile(sourceFile: TFile) {
		try {
			const cardTypeFolder = await this.promptForCardTypeFolder();
			const templateFile = await this.promptForTemplateFile(cardTypeFolder);
			let state = await this.parseTemplate(templateFile);
			let hadSourceTextField = state.promptInfos["sourceText"] !== undefined;
			let sourceText = await this.app.vault.read(sourceFile);
			state = this.addBuiltIns(state, { sourceText });
			state = await this.promptForFieldCollection(state);
			let content = Z2KTemplateEngine.renderTemplateNew(state);
			content = this.ensureSourceText(content, hadSourceTextField, sourceText);
			let title = state.resolvedValues["title"] as string || "Untitled";
			title = Z2KTemplateEngine.reducedRenderContent(title, state.resolvedValues);
			await this.createAndOpenFile(cardTypeFolder, title, content);
			await this.promptAndDeleteFile(sourceFile);
		} catch (error) { this.handleErrors(error); }
	}
	async createCardFromSelection() {
		try {
			const editor = this.getEditorOrThrow();
			const cardTypeFolder = await this.promptForCardTypeFolder();
			const templateFile = await this.promptForTemplateFile(cardTypeFolder);
			let state = await this.parseTemplate(templateFile);
			let hadSourceTextField = state.promptInfos["sourceText"] !== undefined;
			let sourceText = editor.getSelection();
			state = this.addBuiltIns(state, { sourceText });
			state = await this.promptForFieldCollection(state);
			let content = Z2KTemplateEngine.renderTemplateNew(state);
			content = this.ensureSourceText(content, hadSourceTextField, sourceText);
			let title = state.resolvedValues["title"] as string || "Untitled";
			title = Z2KTemplateEngine.reducedRenderContent(title, state.resolvedValues);
			await this.createAndOpenFile(cardTypeFolder, title, content);
			editor.replaceSelection("");
		} catch (error) { this.handleErrors(error); }
	}
	async continueCard(continueFile: TFile) {
		try {
			let state = await this.parseTemplate(continueFile);
			state = this.addBuiltIns(state, { existingTitle: continueFile.basename });
			state = await this.promptForFieldCollection(state);
			let content = Z2KTemplateEngine.renderTemplateNew(state);
			let title = state.resolvedValues["title"] as string || "Untitled";
			title = Z2KTemplateEngine.reducedRenderContent(title, state.resolvedValues);
			await this.updateTitleAndContent(continueFile, title, content);
		} catch (error) { this.handleErrors(error); }
	}
	async insertPartial() {
		try {
			const editor = this.getEditorOrThrow();
			const currDir = this.getOpenFileParentOrThrow();
			const partialFile = await this.promptForPartialFile(currDir);
			let state = await this.parseTemplate(partialFile);
			state = this.addBuiltIns(state, {
				existingTitle: this.getOpenFileOrThrow().basename });
			state = await this.promptForFieldCollection(state);
			let content = Z2KTemplateEngine.renderTemplateNew(state);
			editor.replaceRange(content, editor.getCursor());
		} catch (error) { this.handleErrors(error); }
	}
	async insertPartialFromSelection() {
		try {
			const editor = this.getEditorOrThrow();
			const currDir = this.getOpenFileParentOrThrow();
			const partialFile = await this.promptForPartialFile(currDir);
			let state = await this.parseTemplate(partialFile);
			let hadSourceTextField = state.promptInfos["sourceText"] !== undefined;
			let sourceText = editor.getSelection();
			state = this.addBuiltIns(state, {
				sourceText,
				existingTitle: this.getOpenFileOrThrow().basename });
			state = await this.promptForFieldCollection(state);
			let content = Z2KTemplateEngine.renderTemplateNew(state);
			content = this.ensureSourceText(content, hadSourceTextField, sourceText);
			editor.replaceSelection(content);
		} catch (error) { this.handleErrors(error); }
	}

	///////////////////////////////////////////////////////////////////////////////////

	// Prompts
	async promptForCardTypeFolder(): Promise<TFolder> {
		const cardTypes = this.getTemplatesTypes(false);
		if (cardTypes.length === 0) {
			throw new Error("No card types available. Please create a template folder first.");
		}
		return new Promise<TFolder>((resolve, reject) => {
			new CardTypeSelectionModal(this.app, cardTypes, this.settings, resolve, reject).open();
		});
	}
	async promptForTemplateFile(cardType: TFolder, partial: boolean = false): Promise<TFile> {
		const templates = this.getTemplatesForType(cardType, partial);
		if (templates.length === 0) {
			throw new Error("No templates available in the selected card type folder.");
		}
		return new Promise<TFile>((resolve, reject) => {
			new TemplateSelectionModal(this.app, templates, this.settings, resolve, reject).open();
		});
	}
	async promptForPartialFile(cardType: TFolder): Promise<TFile> {
		return this.promptForTemplateFile(cardType, true);
	}
	async promptForFieldCollection(templateState: TemplateStateNew): Promise<TemplateStateNew> {
		if (this.hasFillableFields(templateState.promptInfos)) {
			await new Promise<void>((resolve, reject) => {
				new FieldCollectionModal(this.app, "Field Collection for Card", templateState, resolve, reject).open();
			});
		} else {
			new Notice("No fields to prompt for.");
		}
		return templateState;
	}
	async promptAndDeleteFile(file: TFile): Promise<void> {
		const shouldDelete = await new Promise<boolean>(resolve => {
			new DeleteConfirmationModal(this.app, file as TFile, resolve).open();
		});
		if (shouldDelete) {
			try {
				await this.app.vault.delete(file);
			} catch (error) {
				rethrowWithMessage(error, "Error deleting original file");
			}
		}
	}

	// Helpers
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
	getOpenFileParentOrThrow(): TFolder {
		const file = this.getOpenFileOrThrow();
		return file.parent ?? this.app.vault.getRoot();
	}
	async getPartialCallback(name: string, path: string): Promise<[content: string, path: string]> {
		return ["", ""];
		// TODO: stopped mid-way through these comments

		// The name can be just the title (partial.md), an absolute path (/folder/partial.md), or a relative path (../folder/partial.md).
		// The path is the folder of the template/partial where there partial was referenced (so it's relative to here).
		// It behaves according to whether we are using an external templates folder or not.

		// If the name is just the title (partial.md), then it checks for it at every tree folder from current up to root.
		// If it has an absolute path, then just go to that path
		// If it has a relative path, then just go to that relative path from the current folder. (You could traverse up the tree, but that seems complicated).
	}
	async parseTemplate(templateFile: TFile): Promise<TemplateStateNew> {
		const content = await this.app.vault.read(templateFile);
		const path = this.getOpenFileParentOrThrow().path;
		try {
			return Z2KTemplateEngine.parseTemplateNew(content, path, this.getPartialCallback);
		} catch (error) {
			rethrowWithMessage(error, "Error occurred while parsing the template");
		}
	}
	async createAndOpenFile(folder: TFolder, title: string, content: string): Promise<TFile> {
		try {
			const filename = this.getValidFilename(title);
			const newPath = this.generateUniqueFilePath(folder.path, filename);
			const file = await this.app.vault.create(newPath, content);
			await this.app.workspace.openLinkText(file.path, "");
			return file;
		} catch (error) {
			rethrowWithMessage(error, "Error occurred while creating the file");
		}
	}
	async updateTitleAndContent(file: TFile, title: string, content: string): Promise<void> {
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
	getValidFilename(title: string): string {
		return title
			?.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_') // Illegal in Windows + control chars
			.replace(/^\.+$/, '_')                      // Avoid names like "." or ".."
			.replace(/[. ]+$/, '')                      // No trailing dots or spaces
			.replace(/^ +/, '')                         // No leading spaces
			|| 'Untitled';                              // Fallback if empty
	}
	generateUniqueFilePath(folderPath: string, basename: string): string {
		basename = basename.replace(/\.md$/, '');
		let filename = basename + '.md';
		let fullPath = this.joinPath(folderPath, filename);
		let counter = 1;
		while (this.getFile(fullPath)) {
			fullPath = this.joinPath(folderPath, `${basename} (${counter++}).md`);
		}
		return fullPath;
	}
	addBuiltIns(templateState: TemplateStateNew, opts: { sourceText?: string, existingTitle?: string } = {}): TemplateStateNew {
		// sourceText
		templateState.promptInfos["sourceText"] = {
			varName: "sourceText",
			type: "text",
			directives: ['no-prompt'],
		};
		templateState.resolvedValues["sourceText"] = opts.sourceText || "";

		// creator
		templateState.promptInfos["creator"] = {
			varName: "creator",
			type: "text",
			directives: ['no-prompt'],
		};
		templateState.resolvedValues["creator"] = this.settings.creator || "";

		// template name
		templateState.promptInfos["templateName"] = {
			varName: "templateName",
			type: "text",
			directives: ['no-prompt'],
		};
		templateState.resolvedValues["templateName"] = "temp"; // TODO

		// title
		templateState.promptInfos["title"] = {
			varName: "title",
			type: "titleText",
			directives: opts.existingTitle ? ['required', 'no-prompt'] : ['required'],
		};
		templateState.resolvedValues["title"] = opts.existingTitle || "Untitled";

		return templateState;
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





	private async AddZ2KSystemYaml(inputContent: string, cardType: TFolder): Promise<string> {
		// Get all the z2k system yaml files between here and the root
		const z2kRoot = this.getFolder(this.settings.z2kRootFolder);
		let currentFolder: TFolder | null = cardType;
		let mergedYaml = "";
		while (currentFolder) {
			const filePath = this.joinPath(currentFolder.path, '.z2k-system.yaml');
			try {
				// Need to use adapter because the usual file read doesn't work for files that start with .
				mergedYaml += await this.app.vault.adapter.read(filePath) + "\n";
			} catch {
				// Can't find/read the file
			}
			if (currentFolder === z2kRoot) break; // Stop at the Z2K root
			currentFolder = currentFolder.parent;
		}
		if (!mergedYaml.trim()) { return inputContent; }

		// Insert the YAML
		if (!inputContent.trimStart().startsWith("---")) { // No YAML block in the content
			return `---\n${mergedYaml}\n---\n\n${inputContent}`;
		} else {
			const insertPos = inputContent.indexOf('---') + 3; // right after first --- in the content
			return `---\n${mergedYaml}\n${inputContent.slice(insertPos)}`;
		}
	}

	private handleErrors(error: unknown) {
		// Display error messages to the user
		if (error instanceof TemplatePluginError) {
			console.error("TemplatePluginError: ", error.message);
			new ErrorModal(this.app, error).open();
		} else if (error instanceof UserCancelError) {
			// Just exit, no need to show a message
			// console.log("User cancelled the operation.");
		} else if (error instanceof TemplateError) {
			console.error("Template error: ", error.message);
			new ErrorModal(this.app, error).open();
		} else {
			console.error("Unexpected error: ", error);
			new ErrorModal(this.app, new TemplatePluginError("An unexpected error occurred", error)).open();
		}
	}

	private getTemplatesTypes(partials: boolean): TFolder[] {
		const folders: TFolder[] = [];
		const blockPrefix = this.settings.partialPrefixFilter;
		const rootPath = normalizePath(this.settings.z2kRootFolder);
		const root = rootPath
			? this.app.vault.getAbstractFileByPath(rootPath)
			: this.app.vault.getRoot();
		if (!(root instanceof TFolder)) {
			throw new TemplatePluginError(`Could not find Z2K root folder "${this.settings.z2kRootFolder}"`);
		}

		const folderHasMatchingTemplates = (folder: TFolder): boolean =>
			folder.children.some(child =>
				child instanceof TFile && (child.name.startsWith(blockPrefix) === partials)
			);

		if (this.settings.useExternalTemplates) {
			const externalPath = normalizePath(this.settings.externalTemplatesFolder);
			const external = externalPath
				? this.app.vault.getAbstractFileByPath(externalPath)
				: this.app.vault.getRoot();
			if (!(external instanceof TFolder)) {
				throw new TemplatePluginError(`Could not find external templates folder "${this.settings.externalTemplatesFolder}"`);
			}

			const recurse = (folder: TFolder) => {
				if (folderHasMatchingTemplates(folder)) { folders.push(folder); }
				for (const child of folder.children) {
					if (child instanceof TFolder) { recurse(child); }
				}
			};
			recurse(external);
		} else {
			const templateFolderName = this.settings.embeddedTemplatesFolderName.trim();
			const recurse = (folder: TFolder) => {
				for (const child of folder.children) {
					if (!(child instanceof TFolder)) continue;
					if (child.name === templateFolderName) {
						if (folderHasMatchingTemplates(child)) {
							folders.push(folder); // Parent of matching template folder
						}

					} else {
						recurse(child);
					}
				}
			};
			recurse(root);
		}

		return folders.sort((a, b) => a.path.localeCompare(b.path));
	}

	private getTemplatesForType(cardType: TFolder, partials: boolean): TFile[] {
		const settings = this.settings;
		const result: TFile[] = [];
		let curr: TFolder | null = cardType;

		while (curr) {
			const currPath = normalizePath(curr.path);
			let templateFolderPath: string;

			if (settings.useExternalTemplates) {
				if (!this.isSubPath(settings.externalTemplatesFolder, curr.path)) { break; }
				templateFolderPath = currPath;
			} else {
				if (!this.isSubPath(settings.z2kRootFolder, curr.path)) { break; }
				templateFolderPath = this.joinPath(currPath, settings.embeddedTemplatesFolderName);
			}

			const templateFolder = this.getFolder(templateFolderPath);
			if (templateFolder) {
				const allTemplates = this.getMarkdownFilesInFolder(templateFolder, true);
				const filtered = allTemplates.filter(f => f.name.startsWith(settings.partialPrefixFilter) === partials);
				result.push(...filtered);
			}

			curr = curr.parent instanceof TFolder ? curr.parent : null;
		}

		return result;
	}

	private async getAllPartials(relativeTo: TFile): Promise<Record<string, string>> {
		let partialMap: Record<string, string> = {};

		const addAllPartialsInFolder = async (folder: TFolder | undefined, recurse: boolean) => {
			if (!folder) { return; }
			for (const file of this.getMarkdownFilesInFolder(folder, recurse)) {
				if (!file.name.startsWith(this.settings.partialPrefixFilter)) { continue; }
				if (partialMap.hasOwnProperty(file.basename)) { continue; }
				partialMap[file.basename] = await this.app.vault.read(file);
			}
		}
		function getChildrenFoldersRecursivelyByDepth(folder: TFolder | null): TFolder[] {
			let folders: TFolder[] = [];
			if (!folder) { return folders; }
			for (const child of folder.children) {
				if (!(child instanceof TFolder)) { continue; }
				folders.push(child);
			}
			for (const child of folder.children) {
				if (!(child instanceof TFolder)) { continue; }
				folders = folders.concat(getChildrenFoldersRecursivelyByDepth(child));
			}
			return folders;
		}

		if (!(relativeTo.parent instanceof TFolder)) {
			console.error(`Relative file "${relativeTo.path}" has no parent folder`);
			return partialMap;
		}

		if (this.settings.useExternalTemplates) {
			let externalTemplatesFolder = this.getFolder(this.settings.externalTemplatesFolder);
			if (!externalTemplatesFolder) {
				console.error(`Could not find external templates folder "${this.settings.externalTemplatesFolder}"`);
				return partialMap;
			}
			let currDir: TFolder | null = relativeTo.parent;
			// self + ancestors
			while (currDir) {
				await addAllPartialsInFolder(currDir, false);
				if (currDir === externalTemplatesFolder) { break; }
				currDir = currDir.parent instanceof TFolder ? currDir.parent : null;
			}
			// descendants
			for (const folder of getChildrenFoldersRecursivelyByDepth(relativeTo.parent)) {
				await addAllPartialsInFolder(folder, false);
			}
			// all
			await addAllPartialsInFolder(externalTemplatesFolder, true);
		} else {
			let currDir: TFolder | null = relativeTo.parent;
			let embeddedTemplatesFolder;

			{ // Within the Templates folder
				// self + ancestors
				while (currDir) {
					await addAllPartialsInFolder(currDir, false);
					if (currDir.name === this.settings.embeddedTemplatesFolderName) {
						embeddedTemplatesFolder = currDir;
						break;
					}
					currDir = currDir.parent instanceof TFolder ? currDir.parent : null;
				}
				// descendants
				for (const folder of getChildrenFoldersRecursivelyByDepth(relativeTo.parent)) {
					await addAllPartialsInFolder(folder, false);
				}
				// all
				if (!embeddedTemplatesFolder) {
					console.error(`Could not find embedded templates folder "${this.settings.embeddedTemplatesFolderName}"`);
					return partialMap;
				}
				await addAllPartialsInFolder(embeddedTemplatesFolder, true);
			}
			{ // Within the Z2K root folder
				function getAllTemplateFoldersRecursivelyByDepth(folder: TFolder | null): TFolder[] {
					let folders: TFolder[] = [];
					if (!folder) { return folders; }
					for (const child of folder.children) {
						if (!(child instanceof TFolder)) { continue; }
						if (child.name !== this.settings.embeddedTemplatesFolderName) { continue; }
						folders.push(child);
						break;
					}
					for (const child of folder.children) {
						if (!(child instanceof TFolder)) { continue; }
						if (child.name === this.settings.embeddedTemplatesFolderName) { continue; }
						folders = folders.concat(getAllTemplateFoldersRecursivelyByDepth(child));
					}
					return folders;
				}

				let z2kRootFolder = this.getFolder(this.settings.z2kRootFolder);
				// self + ancestors
				currDir = embeddedTemplatesFolder.parent;
				while (currDir) {
					if (currDir === z2kRootFolder) { break; }
					for (const child of currDir.children) {
						if (!(child instanceof TFolder)) { continue; }
						if (child.name !== this.settings.embeddedTemplatesFolderName) { continue; }
						await addAllPartialsInFolder(child, true);
						break;
					}
					currDir = currDir.parent instanceof TFolder ? currDir.parent : null;
				}
				// descendants
				for (const folder of getAllTemplateFoldersRecursivelyByDepth(embeddedTemplatesFolder.parent)) {
					await addAllPartialsInFolder(folder, true);
				}
				// all
				if (!z2kRootFolder) {
					console.error(`Could not find Z2K root folder "${this.settings.z2kRootFolder}"`);
					return partialMap;
				}
				for (const folder of getAllTemplateFoldersRecursivelyByDepth(z2kRootFolder)) {
					await addAllPartialsInFolder(folder, true);
				}
			}
		}
		return partialMap;
	}

	private getFile(path: string): TFile | null {
		const normalized = normalizePath(path);
		const file = this.app.vault.getAbstractFileByPath(normalized);
		return file instanceof TFile ? file : null;
	}
	private getFolder(path: string): TFolder | null {
		const normalized = normalizePath(path);
		if (normalized === '') { return this.app.vault.getRoot(); } // Special case for root folder
		const file = this.app.vault.getAbstractFileByPath(normalized);
		return file instanceof TFolder ? file : null;
	}
	private isSubPath(parent: string, child: string): boolean {
		const normParent = normalizePath(parent);
		const normChild = normalizePath(child);
		if (normParent === '') { return true; } // root is parent of everything
		if (normChild === normParent) { return true; }
		return normChild.startsWith(normParent + '/');
	}
	private joinPath(...parts: string[]): string {
		return normalizePath(parts.join('/'));
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
	private hasFillableFields(promptInfos: Record<string, PromptInfo>): boolean {
		for (const promptInfo of Object.values(promptInfos)) {
			if (!promptInfo.directives?.includes("no-prompt")) { return true; }
		}
		return false;
	}
}

function normalizePath(path: string): string {
	return path
		.trim()
		.replace(/\\/g, '/')       // Normalize backslashes
		.replace(/\/{2,}/g, '/')   // Collapse multiple slashes
		.replace(/^\.\//, '')      // Remove leading "./"
		.replace(/^\/+/, '')       // Remove leading slashes
		.replace(/\/+$/, '');      // Remove trailing slashes
}

// ------------------------------------------------------------------------------------------------
// Errors
// ------------------------------------------------------------------------------------------------

class UserCancelError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UserCancelError";
	}
}

class TemplatePluginError extends Error {
	userMessage: string;
	cause?: unknown;
	constructor(userMessage: string, cause?: unknown) {
		if (cause instanceof Error) {
			super(cause.message);
			if (cause?.stack) {
				this.stack += "\nCaused by: " + cause.stack;
			}
		} else if (typeof cause === "string") {
			super(cause);
		} else {
			super(userMessage);
		}
		this.name = "TemplatePluginError";
		this.userMessage = userMessage;
		this.cause = cause;
	}
}

function rethrowWithMessage(error: unknown, message: string): never {
	if (error instanceof TemplatePluginError || error instanceof UserCancelError || error instanceof TemplateError) {
		throw error; // Don't modify the error
	} else {
		throw new TemplatePluginError(message, error);
	}
}


// ------------------------------------------------------------------------------------------------
// Card Type Selection Modal
// ------------------------------------------------------------------------------------------------
export class CardTypeSelectionModal extends Modal {
	cardTypes: TFolder[];
	settings: Z2KPluginSettings;
	resolve: (cardType: TFolder) => void;
	reject: (error: Error) => void;
	root: any; // For React root

	constructor(app: App, cardTypes: TFolder[], settings: Z2KPluginSettings, resolve: (cardType: TFolder) => void, reject: (error: Error) => void) {
		super(app);
		this.cardTypes = cardTypes;
		this.settings = settings;
		this.resolve = resolve;
		this.reject = reject;
	}

	onOpen() {
		this.modalEl.addClass('z2k', 'card-type-selection-modal');
		this.titleEl.setText('Select Card Type');
		this.contentEl.empty();
		this.contentEl.addClass('modal-content');
		this.root = createRoot(this.contentEl);
		this.root.render(
			<CardTypeSelector
				cardTypes={this.cardTypes}
				settings={this.settings}
				onConfirm={(cardType: TFolder) => {
					this.resolve(cardType);
					this.close();
				}}
				onCancel={() => {
					this.reject(new UserCancelError("User cancelled card type selection"));
					this.close();
				}}
			/>
		);
	}

	onClose() {
		if (this.root) { this.root.unmount(); }
		this.contentEl.empty();
	}
}

interface CardTypeSelectorProps {
	cardTypes: TFolder[];
	settings: Z2KPluginSettings;
	onConfirm: (cardType: TFolder) => void;
	onCancel: () => void;
}

// React component for the modal content
const CardTypeSelector = ({ cardTypes, settings, onConfirm, onCancel }: CardTypeSelectorProps) => {
	let cardTypeEntries: [string, TFolder][] = [];
	for (const cardType of cardTypes) {
		let visStr = cardType.path;
		if (settings.useExternalTemplates) {
			if (cardType.path.startsWith(settings.externalTemplatesFolder + "/")) {
				visStr = cardType.path.substring(settings.externalTemplatesFolder.length + 1);
			}
		} else {
			if (cardType.path.startsWith(settings.z2kRootFolder + "/")) {
				visStr = cardType.path.substring(settings.z2kRootFolder.length + 1);
			}
		}
		cardTypeEntries.push([visStr, cardType]);
	}

	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const listRef = useRef<HTMLDivElement>(null);

	// Focus first item on mount
	useEffect(() => {
		// Focus the container for keyboard navigation
		if (listRef.current) {
			listRef.current.focus();
		}
	}, []);

	// Keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const newIndex = Math.min(selectedIndex + 1, cardTypeEntries.length - 1);
			setSelectedIndex(newIndex);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const newIndex = Math.max(selectedIndex - 1, 0);
			setSelectedIndex(newIndex);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			onConfirm(cardTypeEntries[selectedIndex][1]);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			onCancel();
		}
	};

	function getPrettyPath(path: string): string {
		let normPath = normalizePath(path);
		if (settings.useExternalTemplates) {
			let etf = normalizePath(settings.externalTemplatesFolder);
			if (normPath === etf) { return "/"; }
			if (normPath.startsWith(etf + "/")) {
				return "/" + normPath.substring(etf.length + 1);
			}
		} else {
			let z2kRoot = normalizePath(settings.z2kRootFolder);
			if (normPath === z2kRoot) { return "/"; }
			if (normPath.startsWith(z2kRoot + "/")) {
				return "/" + normPath.substring(z2kRoot.length + 1);
			}
		}
		return normPath;
	}

	return (
		<div
			className="selection-content"
			onKeyDown={handleKeyDown}
			tabIndex={0}
			ref={listRef}
		>
			<div className="selection-list">
				{cardTypeEntries.length === 0 ? (
					<div className="selection-empty-state">No card types found</div>
				) : (
					cardTypeEntries.map(([id, cardType], index) => (
						<div
							key={id}
							className={`selection-item ${selectedIndex === index ? 'selected' : ''}`}
							onClick={() => onConfirm(cardType)}
							tabIndex={index + 1}
							role="button"
							aria-selected={selectedIndex === index}
						>
							<span className="selection-primary">{getPrettyPath(cardType.path)}</span>
							{/* <span className="selection-secondary">{cardType.}</span> */}
						</div>
					))
				)}
			</div>
			<div className="selection-actions">
				<button className="btn btn-secondary" onClick={onCancel}>
					Cancel
				</button>
			</div>
		</div>
	);
};


// ------------------------------------------------------------------------------------------------
// Template Selection Modal
// ------------------------------------------------------------------------------------------------
export class TemplateSelectionModal extends Modal {
	templates: TFile[];
	settings: Z2KPluginSettings;
	resolve: (template: TFile) => void;
	reject: (error: Error) => void;
	root: any; // For React root

	constructor(app: App, templates: TFile[], settings: Z2KPluginSettings, resolve: (template: TFile) => void, reject: (error: Error) => void){
		super(app);
		this.templates = templates;
		this.settings = settings;
		this.resolve = resolve;
		this.reject = reject;
	}

	onOpen() {
		this.modalEl.addClass('z2k', 'template-selection-modal');
		this.titleEl.setText('Select Template');
		this.contentEl.empty();
		this.contentEl.addClass('modal-content');
		this.root = createRoot(this.contentEl);
		this.root.render(
			<TemplateSelector
				templates={this.templates}
				settings={this.settings}
				onConfirm={(template: TFile) => {
					this.resolve(template);
					this.close();
				}}
				onCancel={() => {
					this.reject(new UserCancelError("User cancelled template selection"));
					this.close();
				}}
			/>
		);
	}

	onClose() {
		if (this.root) { this.root.unmount(); }
		this.contentEl.empty();
	}
}

interface TemplateSelectorProps {
	templates: TFile[];
	settings: Z2KPluginSettings;
	onConfirm: (template: TFile) => void;
	onCancel: () => void;
}

// React component for the modal content
const TemplateSelector = ({ templates, settings, onConfirm, onCancel }: TemplateSelectorProps) => {
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [filteredTemplates, setFilteredTemplates] = useState<TFile[]>(templates);
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	// Filter templates when search term changes
	useEffect(() => {
		const filtered = templates.filter((template: TFile) => {
			const nameMatch = displayName(template).toLowerCase().includes(searchTerm.toLowerCase());
			const pathMatch = template.parent?.path.toLowerCase().includes(searchTerm.toLowerCase()) || false;
			return nameMatch || pathMatch;
		});

		setFilteredTemplates(filtered);
		setSelectedIndex(0); // Reset selection when search changes
	}, [searchTerm, templates]);

	// Focus search input on mount
	useEffect(() => {
		if (searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, []);

	// Keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const newIndex = Math.min(selectedIndex + 1, filteredTemplates.length - 1);
			setSelectedIndex(newIndex);
			scrollToItem(newIndex);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const newIndex = Math.max(selectedIndex - 1, -1);
			setSelectedIndex(newIndex);
			scrollToItem(newIndex);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			onConfirm(filteredTemplates[selectedIndex]);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			onCancel();
		}
	};

	const scrollToItem = (index: number) => {
		if (index >= 0 && listRef.current) {
			const items = listRef.current.querySelectorAll('.template-item');
			if (items[index]) {
				items[index].scrollIntoView({ block: 'nearest' });
			}
		}
	};

	const displayName = (template: TFile): string => {
		if (template.basename.startsWith(settings.partialPrefixFilter)) {
			return template.basename.slice(settings.partialPrefixFilter.length);
		}
		return template.basename;
	}

	const highlightMatch = (text: string, search: string) => {
		if (!search) return <>{text}</>;
		const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'); // escape + global match
		const parts = [];
		let lastIndex = 0;
		let match;

		while ((match = regex.exec(text)) !== null) {
			const start = match.index;
			const end = regex.lastIndex;

			if (start > lastIndex) {
				parts.push(<span key={lastIndex}>{text.slice(lastIndex, start)}</span>);
			}
			parts.push(
				<span key={start} className="search-highlight">
					{text.slice(start, end)}
				</span>
			);
			lastIndex = end;
		}
		if (lastIndex < text.length) {
			parts.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
		}

		return <>{parts}</>;
	};

	return (
		<div className="selection-content" onKeyDown={handleKeyDown}>
			<div className="search-container">
				<input
					ref={searchInputRef}
					type="text"
					className="search-input"
					placeholder="Search templates..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
			</div>
			<div className="selection-list" ref={listRef}>
				{filteredTemplates.length === 0 ? (
					<div className="selection-empty-state template-list-empty-state">No templates found</div>
				) : (
					filteredTemplates.map((template: TFile, index: number) => (
						<div
							key={template.path}
							className={`selection-item ${selectedIndex === index ? 'selected' : ''}`}
							onClick={() => onConfirm(template)}
							tabIndex={index + 2} // +2 because search is tabIndex 1
						>
							{/* <span className="selection-primary">{displayName(template)}</span>
							<span className="selection-secondary">{template.parent?.path || ''}</span> */}
							<span className="selection-primary">
								{highlightMatch(displayName(template), searchTerm)}
							</span>
							<span className="selection-secondary">
								{highlightMatch(template.parent?.path || '', searchTerm)}
							</span>
						</div>
					))
				)}
			</div>
			<div className="selection-actions">
				<button className="btn btn-secondary" onClick={onCancel}>
					Cancel
				</button>
				<button
					className="btn btn-primary"
					onClick={() => onConfirm(filteredTemplates[selectedIndex])}
					disabled={filteredTemplates.length === 0}
				>
					Select
				</button>
			</div>
		</div>
	);
};



// TODO: Save the state of the modal to prevent large data loss on accidental close
// I tried a long time to block the closing upong clicking outside the modal but was not able to do so.

// ------------------------------------------------------------------------------------------------
// Field Collection Modal
// ------------------------------------------------------------------------------------------------
/**
 * Modal for collecting field values from the user
 * Supports dynamic field updates and tracking field interactions
 */
export class FieldCollectionModal extends Modal {
	title: string;
	templateState: TemplateStateNew;
	resolve: () => void;
	reject: (error: Error) => void;
	root: any; // React root

	constructor(app: App, title: string, templateState: TemplateStateNew, resolve: () => void, reject: (error: Error) => void) {
		super(app);
		this.title = title;
		this.templateState = templateState;
		this.resolve = resolve;
		this.reject = reject;
	}

	onOpen() {
		this.modalEl.addClass('z2k', 'field-collection-modal');
		this.titleEl.setText(this.title);
		this.contentEl.empty();
		this.contentEl.addClass('modal-content');
		this.root = createRoot(this.contentEl);
		this.root.render(
			<FieldCollectionForm
				templateState={this.templateState}
				onComplete={() => {
					this.resolve();
					this.close();
				}}
				onCancel={() => {
					this.reject(new UserCancelError("User cancelled field collection"));
					this.close();
				}}
			/>
		);
	}

	onClose() {
		if (this.root) { this.root.unmount(); }
		this.contentEl.empty();
	}
}

/**
 * Main React component for the form
 * Handles form state, dependencies between fields, and validation
 */
interface FieldCollectionFormProps {
	templateState: TemplateStateNew;
	onComplete: () => void;
	onCancel: () => void;
}
// This component assumes that varInfoMap will not be changing.
const FieldCollectionForm = ({ templateState, onComplete, onCancel }: FieldCollectionFormProps) => {
	function computeInitialFieldStates(): Record<string, FieldState> {
		const initialFieldStates: Record<string, FieldState> = {};

		// Initialize field states with metadata
		for (const [fieldName, promptInfo] of Object.entries(templateState.promptInfos)) {
			// Get dependencies from prompt text, default value, and miss text
			const dependencies = [
				...promptInfo.prompt ? Z2KTemplateEngine.reducedGetDependencies(promptInfo.prompt) : [],
				...promptInfo.default ? Z2KTemplateEngine.reducedGetDependencies(promptInfo.default) : [],
				...promptInfo.miss ? Z2KTemplateEngine.reducedGetDependencies(promptInfo.miss) : [],
			];

			// Set initial field state
			initialFieldStates[fieldName] = {
				value: templateState.resolvedValues[fieldName] ?? promptInfo.default ?? '',
				alreadyResolved: templateState.resolvedValues[fieldName] !== undefined,
				omitFromForm: promptInfo.directives?.contains('no-prompt') ?? false,
				touched: false,
				focused: false,
				hasError: false,
				dependencies: [...new Set(dependencies)],
				dependentFields: [],
				resolvedPrompt: promptInfo.prompt ?? fieldName,
				resolvedDefault: promptInfo.default ?? '',
				resolvedMiss: promptInfo.miss ?? ''
			};
		}

		// Resolve dependencies to set dependent fields
		for (const [fieldName, fieldState] of Object.entries(initialFieldStates)) {
			for (const dependency of fieldState.dependencies) {
				if (initialFieldStates[dependency]) {
					initialFieldStates[dependency].dependentFields.push(fieldName);
				}
			}
		}
		for (const fieldState of Object.values(initialFieldStates)) {
			fieldState.dependentFields = [...new Set(fieldState.dependentFields)];
		}

		// Check for circular dependencies
		const circularDependency = detectCircularDependencies(initialFieldStates);
		if (circularDependency.length > 0) {
			new Notice(`Aborting! Circular dependency: ${circularDependency.join(' -> ')}`);
			setTimeout(() => { onCancel(); }, 0); // defer unmounting until after the render finishes
			return {}; // Return empty state to prevent further processing
		}

		return initialFieldStates;
	}
	function computeInitialRenderOrderFieldNames(): string[] {
		// let renderOrderFieldNames = dependencyOrderedFieldNames;
		let renderOrderFieldNames = Object.keys(fieldStates);
		renderOrderFieldNames = renderOrderFieldNames.filter(fieldName => !fieldStates[fieldName].omitFromForm);
		// Put required fields at the top
		const requiredFields = renderOrderFieldNames.filter(fieldName => {
			return templateState.promptInfos[fieldName]?.directives?.includes('required') ?? false;
		});
		const optionalFields = renderOrderFieldNames.filter(fieldName => {
			return !templateState.promptInfos[fieldName]?.directives?.includes('required') ?? true;
		});
		renderOrderFieldNames = [...requiredFields, ...optionalFields];

		// But then put the fields that they depend on before them (recursively)
		const finalRenderOrder: string[] = [];
		const visited: Set<string> = new Set();
		function visit(fieldName: string) {
			if (visited.has(fieldName)) return;
			visited.add(fieldName);
			const fieldState = fieldStates[fieldName];
			if (!fieldState || fieldState.omitFromForm) return;
			for (const dependency of fieldState.dependencies) {
				visit(dependency);
			}
			if (!finalRenderOrder.includes(fieldName)) {
				finalRenderOrder.push(fieldName);
			}
		}
		for (const fieldName of renderOrderFieldNames) {
			visit(fieldName);
		}
		renderOrderFieldNames = finalRenderOrder;

		return renderOrderFieldNames;
	}

	// State variables (definition order is important here)
	const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>(computeInitialFieldStates());
	const [dependencyOrderedFieldNames] = useState<string[]>(() => calculateFieldDependencyOrder(fieldStates));
	const [renderOrderFieldNames] = useState<string[]>(() => computeInitialRenderOrderFieldNames());
	// Update fields after the first render to distribute and apply dependencies
	useEffect(() => {
		let newFieldStates = {...fieldStates};
		updateFieldStates(newFieldStates, true);
		validateAllFields(newFieldStates);
		setFieldStates(newFieldStates);
	}, []);

	function updateFieldStates(newFieldStates: Record<string, FieldState>, reEvalValues: boolean = false) {
		for (const fieldName of dependencyOrderedFieldNames) { // dependencyOrderedFieldNames ensures dependencies are resolved first
			const promptInfo = templateState.promptInfos[fieldName];
			if (!promptInfo || newFieldStates[fieldName].omitFromForm) { continue; }

			let context = {
				...Object.fromEntries(Object.entries(newFieldStates).map(
					([name, state]) => [name, state.value])),
			};

			// Update all resolved text fields
			newFieldStates[fieldName].resolvedPrompt = Z2KTemplateEngine.reducedRenderContent(promptInfo.prompt || fieldName, context)
			newFieldStates[fieldName].resolvedDefault = Z2KTemplateEngine.reducedRenderContent(promptInfo.default || "", context);
			newFieldStates[fieldName].resolvedMiss = Z2KTemplateEngine.reducedRenderContent(promptInfo.miss || "", context);

			if (!newFieldStates[fieldName].alreadyResolved && !newFieldStates[fieldName].touched) {
				newFieldStates[fieldName].value = newFieldStates[fieldName].resolvedDefault;
			}
			// // I don't remember what this did, but I'm going to leave it disabled for now
			// if (reEvalValues) {
			// 	// Go ahead and parse and render any values regardless. This
			// 	if (typeof(newFieldStates[fieldName].value) === 'string') {
			// 		let parsedValue = Z2KTemplateEngine.parseReducedSetSegmentsText(newFieldStates[fieldName].value as string);
			// 		newFieldStates[fieldName].value = Z2KTemplateEngine.renderReducedSetText(parsedValue, context);
			// 	}
			// }
		}
	}

	function	validateAllFields(newFieldStates: Record<string, FieldState>): boolean {
		let isValid: boolean = true;
		for (const fieldName of Object.keys(newFieldStates)) {
			const promptInfo = templateState.promptInfos[fieldName];
			if (!promptInfo) {
				console.error(`Field ${fieldName} not found in promptInfos`);
				return true; // Skip validation if field not found
			}

			const value = fieldStates[fieldName].value;
			let hasError = false;
			let errorMessage = '';

			// Basic validation based on field type
			if (promptInfo.type === 'number' && isNaN(Number(value))) {
				hasError = true;
				errorMessage = 'Please enter a valid number';
			} else if (value === '' && promptInfo.directives?.contains('required')) {
				hasError = true;
				errorMessage = 'This field is required';
			}
			if (fieldName === "title") {
				const val = (value as string).trim();
				if (!val) {
					hasError = true;
					errorMessage = 'Title cannot be empty';
				} else if (/^[.]+$/.test(val)) {
					hasError = true;
					errorMessage = 'Title cannot be just dots';
				} else if (/[<>:"/\\|?*\u0000-\u001F]/.test(val)) {
					hasError = true;
					errorMessage = 'Title contains invalid characters (\\ / : * ? " < > |)';
				} else if (/[. ]+$/.test(val)) {
					hasError = true;
					errorMessage = 'Title cannot end with a space or dot';
				}
			}
			newFieldStates[fieldName].hasError = hasError;
			newFieldStates[fieldName].errorMessage = errorMessage;
			if (hasError) {
				isValid = false;
			}
		}
		return isValid;
	}

	function handleFieldChange(fieldName: string, value: string | number | string[]) {
		let newFieldStates = { ...fieldStates };
		newFieldStates[fieldName].value = value;
		newFieldStates[fieldName].touched = true;
		updateFieldStates(newFieldStates);
		validateAllFields(newFieldStates);
		setFieldStates(newFieldStates);
	};

	function handleFieldFocus(fieldName: string) {
		let newFieldStates = { ...fieldStates };
		newFieldStates[fieldName].touched = true;
		newFieldStates[fieldName].focused = true;
		updateFieldStates(newFieldStates);
		validateAllFields(newFieldStates);
		setFieldStates(newFieldStates);
	};

	function handleFieldBlur(fieldName: string) {
		let newFieldStates = { ...fieldStates };
		newFieldStates[fieldName].focused = false;
		updateFieldStates(newFieldStates, true);
		validateAllFields(newFieldStates);
		setFieldStates(newFieldStates);
	};

	function handleFieldReset(fieldName: string) {
		let newFieldStates = { ...fieldStates };
		newFieldStates[fieldName].touched = false;
		newFieldStates[fieldName].value = newFieldStates[fieldName].resolvedDefault;
		updateFieldStates(newFieldStates, true);
		validateAllFields(newFieldStates);
		setFieldStates(newFieldStates);
	}

	function handleSubmit(e: React.FormEvent, finalize: boolean = false) {
		e.preventDefault();

		// Abort if there are errors
		let isValid = validateAllFields(fieldStates);
		if (!isValid) {
			scrollToFirstError();
			return;
		}

		// Update template state with resolved values
		for (const fieldName of dependencyOrderedFieldNames) {
			const propmtInfo = templateState.promptInfos[fieldName];
			if (!propmtInfo) { continue; }
			if (fieldStates[fieldName].alreadyResolved || fieldStates[fieldName].touched || fieldName === 'title') {
				templateState.resolvedValues[fieldName] = fieldStates[fieldName].value;
			} else {
				// Left untouched, use miss value if finalizing
				if (finalize) {
					templateState.resolvedValues[fieldName] = fieldStates[fieldName].resolvedMiss || '';
				}
			}
		}

		onComplete();
	};

	function scrollToFirstError() {
		for (const fieldName of dependencyOrderedFieldNames) {
			if (fieldStates[fieldName].hasError) {
				const element = document.querySelector(`[name="${fieldName}"]`) || document.getElementById(fieldName);
				if (element) {
					element.scrollIntoView({ behavior: 'smooth', block: 'center' });
					(element as HTMLElement).focus();
					break;
				}
			}
		}
	}

	function getFieldContainer(fieldName: string) {
		const promptInfo = templateState.promptInfos[fieldName];
		const fieldState = fieldStates[fieldName];

		if (!promptInfo || !fieldState) return null;

		return (
			<div key={fieldName} className={`field-container ${
				fieldState.hasError ? 'has-error' : (fieldState.touched ? 'touched' : '')
			}`}>
				<FieldInput
					name={fieldName}
					label={fieldState.resolvedPrompt || fieldName}
					promptInfo={promptInfo}
					fieldState={fieldState}
					onChange={(value) => handleFieldChange(fieldName, value)}
					onFocus={() => handleFieldFocus(fieldName)}
					onBlur={() => handleFieldBlur(fieldName)}
					onReset={() => handleFieldReset(fieldName)}
				/>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="field-collection-form">
			{templateState.promptInfos['title'] && fieldStates['title']?.omitFromForm !== true && (
				<div className="field-title-container">{getFieldContainer('title')}</div>
			)}
			<div className="field-list">
				{renderOrderFieldNames
					.filter(fieldName => fieldName !== 'title')
					.map(fieldName => getFieldContainer(fieldName))}
			</div>

			<div className="form-actions">
				<button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
				<button type="submit" className="btn btn-primary">Submit</button>
				<button type="button" className="btn btn-primary" onClick={(e) => handleSubmit(e, true)}>Submit and Finalize</button>
			</div>
		</form>
	);
};

/**
 * Tracks the state of each field including user interactions
 */
interface FieldState {
	// The current value of the field
	// 	Should always be ready to be verified/submitted (except for miss text resolution, that can be applied upon being verified/submitted)
	//    Should also always be what's shown in the field and be used for dependencies
	value: VarValueType;
	alreadyResolved?: boolean;
	omitFromForm: boolean;
	// Keeps track of whether the field has been interacted with
	// 	(determines miss text behavior and default value behavior in the field itself)
	touched: boolean;
	focused: boolean;
	hasError: boolean;
	errorMessage?: string;
	dependentFields: string[]; // Fields that depend on this field
	dependencies: string[]; // Fields this field depends on
	resolvedPrompt?: string; // Prompt text with references resolved
	resolvedDefault?: string; // Default value with references resolved
	resolvedMiss?: string; // Miss text with references resolved
}

/**
 * Returns an array of field names involved in circular dependencies, or an empty array if none are found
 */
function detectCircularDependencies(fieldStates: Record<string, FieldState>): string[] {
	const visited = new Set<string>();
	const stack: string[] = [];
	let circularPath: string[] = [];

	function visit(fieldName: string) {
		const cycleStartIndex = stack.indexOf(fieldName);
		if (cycleStartIndex !== -1) {
			// Found a cycle, capture the complete circular path
			circularPath = [...stack.slice(cycleStartIndex), fieldName];
			return;
		}
		if (visited.has(fieldName)) return;

		visited.add(fieldName);
		stack.push(fieldName);

		const fieldState = fieldStates[fieldName];
		if (!fieldState) {
			stack.pop();
			return;
		}

		for (const dependency of fieldState.dependencies) {
			visit(dependency);
			// If we found a cycle, stop traversing
			if (circularPath.length > 0) return;
		}

		stack.pop();
	}

	for (const fieldName of Object.keys(fieldStates)) {
		visit(fieldName);
		if (circularPath.length > 0) return circularPath;
	}

	return [];
}

function calculateFieldDependencyOrder(fieldStates: Record<string, FieldState>): string[] {
	const orderedFields: string[] = [...Object.keys(fieldStates)];

	let madeChange = true;
	while (madeChange) {
		madeChange = false;
		for (const fieldName of [...orderedFields]) {
			const fieldState = fieldStates[fieldName];
			if (!fieldState) continue;
			const fieldIndex = orderedFields.indexOf(fieldName);
			let maxDepIndex = -1;
			for (const dep of fieldState.dependencies) {
				const depIndex = orderedFields.indexOf(dep);
				if (depIndex > maxDepIndex) {
					maxDepIndex = depIndex;
				}
			}
			if (maxDepIndex >= 0 && fieldIndex < maxDepIndex) {
				// Move field after its farthest dependency
				orderedFields.splice(fieldIndex, 1);
				orderedFields.splice(maxDepIndex, 0, fieldName);
				madeChange = true;
			}
		}
	}

	return orderedFields;
}

/**
 * React component for rendering form fields of all types
 * Renders appropriate input based on field data type
 */
interface FieldInputProps {
	name: string;
	label: string;
	promptInfo: PromptInfo;
	fieldState: FieldState;
	onChange: (value: any) => void;
	onFocus: () => void;
	onBlur: () => void;
	onReset: () => void;
}

const FieldInput = ({ name, label, promptInfo, fieldState, onChange, onFocus, onBlur, onReset }: FieldInputProps) => {
	// Generate a unique ID for the input element
	const inputId = `field-${name}`;

	// Common props for input elements
	const commonProps = {
		id: inputId,
		name,
		onFocus,
		onBlur,
		'aria-invalid': fieldState.hasError
	};

	// Render the appropriate input based on data type
	function renderInput() {
		const dataType = promptInfo.type || 'text';

		switch(dataType) {
			case 'titleText':
				return (
					<input
						type="text"
						className={`title-text-input ${fieldState.hasError ? 'has-error' : ''}`}
						value={fieldState.value?.toString() || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={fieldState.resolvedDefault}
						{...commonProps}
					/>
				);

			case 'text':
				return (
					<textarea
						className={`text-input ${fieldState.hasError ? 'has-error' : ''}`}
						value={fieldState.value?.toString() || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={fieldState.resolvedDefault}
						{...commonProps}
					/>
				);

			case 'number':
				return (
					<input
						type="number"
						className={`number-input ${fieldState.hasError ? 'has-error' : ''}`}
						value={fieldState.value?.toString() || ''}
						onChange={(e) => {
							const num = Number(e.target.value);
							onChange(isNaN(num) ? undefined : num);
						}}
						placeholder={fieldState.resolvedDefault}
						{...commonProps}
					/>
				);

			case 'date':
				return (
					<input
						type="date"
						className={`date-input ${fieldState.hasError ? 'has-error' : ''}`}
						value={
							moment.isMoment(fieldState.value) && fieldState.value.isValid()
								? fieldState.value.format("YYYY-MM-DD") : ''
						}
						onChange={(e) => {
							const m = moment(e.target.value, "YYYY-MM-DD", true);
							onChange(m.isValid() ? m : undefined);
						}}
						{...commonProps}
					/>
				);

			case 'datetime':
				return (
					<input
						type="datetime-local"
						className={`date-input ${fieldState.hasError ? 'has-error' : ''}`}
						value={
							moment.isMoment(fieldState.value) && fieldState.value.isValid()
								? fieldState.value.format("YYYY-MM-DD HH:mm:ss") : ''
						}
						onChange={(e) => {
							const m = moment(e.target.value, "YYYY-MM-DD HH:mm:ss", true);
							onChange(m.isValid() ? m : undefined);
						}}
						{...commonProps}
					/>
				);

			case 'boolean':
				return (
					<div className="boolean-input-container">
						<input
							type="checkbox"
							className={`boolean-input ${fieldState.hasError ? 'has-error' : ''}`}
							checked={!!fieldState.value}
							onChange={(e) => onChange(e.target.checked)}
							{...commonProps}
						/>
						<label htmlFor={inputId} className="checkbox-label" title={generateHoverText()}>{label}</label>
					</div>
				);

			case 'singleSelect':
				return (
					<select
						className={`select-input ${fieldState.hasError ? 'has-error' : ''}`}
						value={fieldState.value?.toString() || ''}
						onChange={(e) => onChange(e.target.value)}
						{...commonProps}
					>
						<option value="">Select an option</option>
						{promptInfo.typeOptions?.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				);

			case 'multiSelect':
				// For multiSelect, we need to handle an array of values
				const selectedValues = Array.isArray(fieldState.value) ? fieldState.value : [];
				return (
					<div className={`multi-select-container ${fieldState.hasError ? 'has-error' : ''}`}>
						{promptInfo.typeOptions?.map((option) => (
							<div key={option} className="multi-select-option">
								<input
									type="checkbox"
									id={`${inputId}-${option}`}
									checked={selectedValues.includes(option)}
									onChange={(e) => {
										const newValues = e.target.checked
											? [...selectedValues, option] // Add the option
											: selectedValues.filter(val => val !== option); // Remove the option
										onChange(newValues);
									}}
								/>
								<label htmlFor={`${inputId}-${option}`}>{option}</label>
							</div>
						))}
					</div>
				);
		}
	};

	function generateHoverText() {
		let finalText = "";
		finalText += `Field name: ${name}`;
		finalText += promptInfo.directives?.length ?? 0 > 0 ? `\nDirectives: ${promptInfo.directives?.join(', ')}` : '';
		finalText += fieldState.dependencies.length > 0 ? `\nDepends on: ${fieldState.dependencies.join(', ')}` : '';
		finalText += fieldState.dependentFields.length > 0 ? `\nUsed by: ${fieldState.dependentFields.join(', ')}` : '';
		return finalText;
	}

	function renderMissTextPreview() {
		if (fieldState.resolvedMiss && !fieldState.touched) {
			return (
				<div className="miss-text-preview">
					Default if left untouched:<br/><span>{fieldState.resolvedMiss}</span>
				</div>
			);
		}
		return null;
	};

	// return (
	// 	<div className="field-input">
	// 		{/* Don't show label twice for checkboxes */}
	// 		{varInfo.dataType !== 'boolean' && <label htmlFor={inputId} title={generateHoverText()}>{label}</label>}
	// 		{renderInput()}
	// 		{renderMissTextPreview()}
	// 		{fieldState.hasError && fieldState.errorMessage && (
	// 			<div className="error-message">{fieldState.errorMessage}</div>
	// 		)}
	// 	</div>
	// );
	return (
		<div className="field-input">
			{promptInfo.type !== 'boolean' && (
				<div className="label-wrapper">
					<label htmlFor={inputId} title={generateHoverText()}>{label}</label>
					<span className="reset-icon-wrapper">
						<span
							className="reset-icon"
							title="Reset to default"
							onMouseDown={(e) => { // use onMouseDown instead of onClick to prevent focus issues
								e.preventDefault(); // Prevent icon from taking focus
								onReset();
								// Blur only if input already had focus
								const inputEl = document.getElementById(inputId) as HTMLElement;
								if (inputEl && inputEl === document.activeElement) { inputEl.blur(); }
							}}
							role="button"
							tabIndex={-1}
						>⟲</span>
					</span>
				</div>
			)}
			{renderInput()}
			{renderMissTextPreview()}
			{fieldState.hasError && fieldState.errorMessage && (
				<div className="error-message">{fieldState.errorMessage}</div>
			)}
		</div>
	);

};


// ------------------------------------------------------------------------------------------------
// Delete Confirmation Modal
// ------------------------------------------------------------------------------------------------
export class DeleteConfirmationModal extends Modal {
	file: TFile;
	onConfirm: (shouldDelete: boolean) => void;
	root: any; // For React root

	constructor(app: App, file: TFile, onConfirm: (shouldDelete: boolean) => void) {
		super(app);
		this.file = file;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		this.modalEl.addClass('z2k', 'delete-confirmation-modal');
		this.titleEl.setText('Delete Original File?');
		this.contentEl.empty();
		this.contentEl.addClass('modal-content');
		this.root = createRoot(this.contentEl);
		this.root.render(
			<>
				<p className="delete-confirmation-message">
					Would you like to now delete "{this.file.name}"?
				</p>

				<div className="delete-confirmation-buttons">
					<button
						className="btn btn-secondary"
						onClick={() => {
							this.onConfirm(false);
							this.close();
						}}
					>
						Keep Original File
					</button>

					<button
						className="btn btn-warning"
						onClick={() => {
							this.onConfirm(true);
							this.close();
						}}
					>
						Move to Trash
					</button>
				</div>
			</>
		);
	}

	onClose() {
		if (this.root) { this.root.unmount(); }
		this.contentEl.empty();
	}
}

export class ErrorModal extends Modal {
	error: Error;
	root: any; // React root

	constructor(app: App, error: Error) {
		super(app);
		this.error = error;
	}

	onOpen() {
		this.modalEl.addClass('z2k', 'error-modal');
		this.titleEl.setText('Error');
		this.contentEl.empty();
		this.contentEl.addClass('modal-content');
		this.root = createRoot(this.contentEl);
		this.root.render(
			<>
				<p className="error-modal-message">{this.error.message}</p>
				{this.error instanceof TemplateError && (
					<p className="error-modal-description">{this.error.description}</p>
				)}
				<button
					className="btn btn-secondary"
					onClick={() => {
						const text = this.error.stack ?? this.error.message;
						navigator.clipboard.writeText(text).then(() => {
							new Notice("Copied!", 2000);
						});
					}}
					style={{ alignSelf: 'flex-end' }}
				>
					Copy Error
				</button>
			</>
		);
	}
	onClose() {
		if (this.root) { this.root.unmount(); }
		this.contentEl.empty();
	}
}
