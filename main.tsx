
// TODO: Add error handling for errors within react components by using React Error Boundaries

import { App, Plugin, Modal, Notice, TAbstractFile, TFolder, TFile, PluginSettingTab, Setting, MarkdownView, Editor, Command } from 'obsidian';
import { Z2KTemplateEngine, Z2KYamlDoc, TemplateState, VarValueType, PromptInfo, TemplateError } from 'z2k-template-engine';
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import moment from 'moment';   // npm i moment

import { EditorView, ViewPlugin, ViewUpdate, Decoration, DecorationSet } from "@codemirror/view";
import { RangeSetBuilder, type Extension } from "@codemirror/state";
import { handlebarsLanguage } from "@xiechao/codemirror-lang-handlebars"; // npm i @xiechao/codemirror-lang-handlebars
import { highlightTree, classHighlighter } from "@lezer/highlight"; // npm i @lezer/highlight

interface Z2KPluginSettings {
	templatesRootFolder: string;
	creator: string;
	templatesFolderName: string;
	cardReferenceName: string;
	dynamicCardCommands: Array<{
		id: string; // stable id (to retain keyboard shortcuts)
		name: string; // display name
		targetFolder: string; // vault-relative path to folder
	}>;
	// templateEditingEnabled: boolean;
}

const DEFAULT_SETTINGS: Z2KPluginSettings = {
	// templatesRootFolder: '/Z2K',
	templatesRootFolder: '',
	creator: '',
	templatesFolderName: 'Templates',
	cardReferenceName: 'note',
	dynamicCardCommands: [],
	// templateEditingEnabled: true,
};

class Z2KSettingTab extends PluginSettingTab {
	plugin: Z2KPlugin;
	private refs = {
		descTemplatesRootFolder: null as Setting | null,
		descEmbeddedTemplatesFolderName: null as Setting | null,
		quickCreateDesc: null as HTMLElement | null,
	}

	constructor(app: App, plugin: Z2KPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private applyDescs() {
		this.refs.descTemplatesRootFolder?.setDesc(`Folder where the ${cardRefNameLowerPlural(this.plugin.settings)} will be created (root of the ${cardRefNameLower(this.plugin.settings)} type folders). Leave empty to use vault root.`);
		this.refs.descEmbeddedTemplatesFolderName?.setDesc(createFragment(f => {
			f.appendText(`Any ${cardRefNameLowerPlural(this.plugin.settings)} within folders of this name will show up as templates `)
			f.createEl('a', {
				text: '(?)',
				href: 'https://z2k-studios.github.io/z2k-plugin-templates-docs/docs/reference-manual/Template%20Folders',
			});
		}));
		this.refs.quickCreateDesc?.setText(`You can create custom commands to quickly create ${cardRefNameLowerPlural(this.plugin.settings)} in specific folders. These commands will appear in the command palette and can be assigned keyboard shortcuts.`);
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		containerEl.addClass('z2k-settings');
		containerEl.createEl('h3', {text: 'Z2K Template Settings'});

		// About block
		const about = containerEl.createDiv({cls: ['z2k-about', 'setting-item']});
		// const aboutInfo = about.createDiv({cls: 'setting-item-info'});
		about.createEl('div', {cls: 'setting-item-description', text: 'Here you can customize some of the functionality of the template plugin.'});

		this.refs.descTemplatesRootFolder = new Setting(containerEl)
			.setName('Templates root folder')
			.setDesc('') // Description is set dynamically
			.addText(text => {
				const input = text
					.setPlaceholder(DEFAULT_SETTINGS.templatesRootFolder)
					.setValue(this.plugin.settings.templatesRootFolder)
					.inputEl;

				this.validateTextInput(input,
					(value) => {
						if (/[*?"<>|:]/.test(value)) { return "Invalid characters in folder path"; }
						return null;
					},
					async (validValue) => {
						this.plugin.settings.templatesRootFolder = validValue;
						await this.plugin.saveData(this.plugin.settings);
					});
			});
		new Setting(containerEl)
			.setName('Creator name')
			.setDesc(createFragment(f => {
				f.appendText(`Name to use for the built-in {{creator}} fields `)
				f.createEl('a', {
					text: '(?)',
					href: 'https://z2k-studios.github.io/z2k-plugin-templates-docs/docs/reference-manual/Z2K%20Built-In%20Template%20Fields',
				});
			}))
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
		this.refs.descEmbeddedTemplatesFolderName = new Setting(containerEl)
			.setName('Embedded templates folder name')
			.setDesc('') // Description is set dynamically
			.addText(text => {
				const input = text
					.setPlaceholder(DEFAULT_SETTINGS.templatesFolderName)
					.setValue(this.plugin.settings.templatesFolderName)
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
						this.plugin.settings.templatesFolderName = validValue;
						await this.plugin.saveData(this.plugin.settings);
					});
			});
		new Setting(containerEl)
			.setName('Name for files')
			.setDesc(createFragment(f => {
				f.appendText("This is the name to use when referring to files in the system. ('note', 'card', 'file', etc.) ");
				f.createEl('a', {
					text: '(?)',
					href: 'https://z2k-studios.github.io/z2k-plugin-templates-docs/docs/reference-manual/Template%20Folders', // TODO
				})
			}))
			.addText(text => {
				const input = text
					.setPlaceholder(DEFAULT_SETTINGS.cardReferenceName)
					.setValue(this.plugin.settings.cardReferenceName)
					.inputEl;

				this.validateTextInput(input,
					(value) => {
						if (!value.trim()) { return "File reference name cannot be empty"; }
						return null;
					},
					async (validValue) => {
						this.plugin.settings.cardReferenceName = validValue;
						await this.plugin.saveData(this.plugin.settings);
						this.applyDescs(); // Update descriptions
						this.plugin.queueRefreshCommands();
					});
			});
		// new Setting(containerEl)
		// 	.setName('Enable template editing')
		// 	.setDesc('Enables editing of templates in the Templates folder')
		// 	.addToggle(toggle => toggle
		// 		.setValue(this.plugin.settings.templateEditingEnabled)
		// 		.onChange(async (value) => {
		// 			this.plugin.settings.templateEditingEnabled = value;
		// 			await this.plugin.saveData(this.plugin.settings);
		// 			if (value) {
		// 				await this.plugin.enableTemplateEditing();
		// 			} else {
		// 				await this.plugin.disableTemplateEditing();
		// 			}
		// 		}));

		containerEl.createEl('h3', {text: 'Quick Create Commands'});
		const quickCreateDesc = containerEl.createDiv({cls: 'setting-item'});
		this.refs.quickCreateDesc = quickCreateDesc.createDiv({cls: 'setting-item-description'});
		const dyn = this.plugin.settings.dynamicCardCommands;
		for (let i = 0; i < dyn.length; i++) {
			const row = new Setting(containerEl)
				.setName(`Command ${i + 1}`);
				// .setDesc('Command label and target folder');

			row.addText((text) => {
				text.setPlaceholder('New Thought').setValue(dyn[i].name || '');
				text.onChange(async v => {
					const nv = v.trim();
					if (nv === dyn[i].name) return;
					dyn[i].name = nv;
					await this.plugin.saveData(this.plugin.settings);
					this.plugin.queueRefreshCommands();
				});
			});

			row.addText((text) => {
				text.setPlaceholder('/Thoughts').setValue(dyn[i].targetFolder || '');
				text.onChange(async v => {
					const nv = v.trim();
					if (nv === dyn[i].targetFolder) return;
					dyn[i].targetFolder = nv;
					await this.plugin.saveData(this.plugin.settings);
					this.plugin.queueRefreshCommands();
				});
			});

			row.addExtraButton((button) => {
				button.setIcon('arrow-up').setTooltip('Move up').setDisabled(i === 0).onClick(async () => {
					if (i <= 0) { return; }
					const tmp = dyn[i - 1];
					dyn[i - 1] = dyn[i];
					dyn[i] = tmp;
					await this.plugin.saveData(this.plugin.settings);
					this.plugin.queueRefreshCommands();
					this.display();
				});
			});

			row.addExtraButton((button) => {
				button.setIcon('arrow-down').setTooltip('Move down').setDisabled(i >= dyn.length - 1).onClick(async () => {
					if (i >= dyn.length - 1) { return; }
					const tmp = dyn[i + 1];
					dyn[i + 1] = dyn[i];
					dyn[i] = tmp;
					await this.plugin.saveData(this.plugin.settings);
					this.plugin.queueRefreshCommands();
					this.display();
				});
			});

			row.addExtraButton((button) => {
				button.setIcon('plus').setTooltip('Insert below').onClick(async () => {
					const id = Math.random().toString(36).slice(2,10) + Date.now().toString(36); // unique id
					dyn.splice(i + 1, 0, { id, name: '', targetFolder: '' }); // insert after this row
					await this.plugin.saveData(this.plugin.settings);
					this.plugin.queueRefreshCommands();
					this.display(); // structural change: repaint
				});
			});

			row.addExtraButton((button) => {
				button.setIcon('trash').setTooltip('Delete').onClick(async () => {
					const id = dyn[i]?.id;
					if (id) { this.plugin.removeCommand(id); }
					dyn.splice(i, 1);
					await this.plugin.saveData(this.plugin.settings);
					this.plugin.queueRefreshCommands();
					this.display(); // structural change: safe to repaint
				});
			});
		}

		new Setting(containerEl)
			.addButton((button) => {
				button.setButtonText('Add Command').onClick(async () => {
					const id = Math.random().toString(36).slice(2,10) + Date.now().toString(36);
					// No need to add the command, the command will be added in the refresh
					dyn.push({ id, name: '', targetFolder: '' });
					await this.plugin.saveData(this.plugin.settings);
					this.plugin.queueRefreshCommands();
					this.display(); // structural change: repaint is fine
				});
			});


		this.applyDescs(); // Apply dynamic descriptions
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
	private _refreshTimer: number | null = null;

	async onload() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.templateEngine = new Z2KTemplateEngine();
		this.refreshMainCommands(false); // Don't delete existing, since none exist yet
		this.refreshDynamicCommands(false);
		this.registerEvents();
		this.addSettingTab(new Z2KSettingTab(this.app, this));
		this.registerEditorExtension(handlebarsOverlay());
		this.registerURIHandler();

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
		// 			finalPath = this.joinPath(this.settings.templatesRootFolder, timestampFilename);
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
		// 			folderPath = this.settings.templatesRootFolder;
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

	refreshMainCommands(deleteExisting: boolean = true) {
		let mainCommands: Command[] = [
			{
				id: 'z2k-create-new-card',
				name: `Create new ${cardRefNameLower(this.settings)}`,
				callback: () => this.createCard(),
			},
			{
				id: 'z2k-create-card-from-selected-text',
				name: `Create ${cardRefNameLower(this.settings)} from selected text`,
				editorCheckCallback: (checking, editor) => {
					const selectedText = editor.getSelection();
					if (checking) { return selectedText.length > 0; } // Only enable if text is selected
					this.createCardFromSelection();
				},
			},
			{
				id: 'z2k-convert-file-to-card',
				name: `Convert existing file to templated ${cardRefNameLower(this.settings)}`,
				checkCallback: (checking) => {
					const activeFile = this.app.workspace.getActiveFile();
					// Only enable if there's an active file and it's a markdown file
					if (checking) { return !!activeFile && activeFile.extension === 'md'; }
					this.createCardFromFile(activeFile as TFile);
				},
			},
			{
				id: 'z2k-continue-filling-card',
				name: `Continue filling ${cardRefNameLower(this.settings)}`,
				editorCheckCallback: (checking, editor) => {
					const activeFile = this.app.workspace.getActiveFile();
					if (checking) { return !!activeFile && activeFile.extension === 'md'; }
					this.continueCard(activeFile as TFile);
				},
			},
			{
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
			},
			{
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
			},
			// {
			// 	id: 'z2k-enable-template-editing',
			// 	name: 'Enable template editing mode',
			// 	checkCallback: (checking) => {
			// 		if (checking) { return !this.settings.templateEditingEnabled; }
			// 		this.enableTemplateEditing();
			// 	},
			// },
			// {
			// 	id: 'z2k-disable-template-editing',
			// 	name: 'Disable template editing mode',
			// 	checkCallback: (checking) => {
			// 		if (checking) { return this.settings.templateEditingEnabled; }
			// 		this.disableTemplateEditing();
			// 	},
			// },
			{
				id: "z2k-convert-file-to-template",
				name: "Convert file to named template",
				checkCallback: (checking) => {
					let file = this.app.workspace.getActiveFile();
					if (checking) { return !!file && this.getFileTemplateType(file) !== "named"; }
					this.convertFileTemplateType(file as TFile, "named");
				},
			},
			{
				id: "z2k-convert-file-to-partial",
				name: "Convert file to partial template",
				checkCallback: (checking) => {
					let file = this.app.workspace.getActiveFile();
					if (checking) { return !!file && this.getFileTemplateType(file) !== "partial"; }
					this.convertFileTemplateType(file as TFile, "partial");
				},
			},
			{
				id: "z2k-convert-file-to-md",
				name: "Convert file to markdown",
				checkCallback: (checking) => {
					let file = this.app.workspace.getActiveFile();
					if (checking) { return !!file && this.getFileTemplateType(file) !== "normal"; }
					this.convertFileTemplateType(file as TFile, "normal");
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
		for (const cmd of this.settings.dynamicCardCommands) {
			if (deleteExisting) {
				this.removeCommand(cmd.id); // Just returns if not found
			}
		}
		// Dynamic commands for creating cards in specific folders
		for (const cmd of this.settings.dynamicCardCommands) {
			if (!cmd.id || !cmd.name || !cmd.targetFolder) { continue; }
			this.addCommand({
				id: cmd.id,
				name: cmd.name,
				callback: async () => {
					const folder = this.getFolder(cmd.targetFolder);
					if (!folder) {
						new Notice(`Target folder not found: ${cmd.targetFolder}`);
						return;
					}
					await this.createCard(folder);
				},
			});
		}
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
					item.setTitle(`Z2K: Create ${cardRefNameLower(this.settings)} from selection...`)
						.onClick(() => {
							this.createCardFromSelection();
						});
				});
			})
		);
		// Context menu 'create new card here'
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (!(folder instanceof TFolder)) return;
				menu.addItem((item) => {
					item.setTitle(`Z2K - Create new ${cardRefNameLower(this.settings)} here`)
						.onClick(() => this.createCard(folder as TFolder));
				});
			})
		);

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

		// { // Template editing mode toggle
		// 	// Toggle command
		// 	this.addCommand({
		// 		id: 'z2k-enable-template-editing',
		// 		name: 'Enable template editing mode',
		// 		checkCallback: (checking) => {
		// 			if (checking) { return !this.settings.templateEditingEnabled; }
		// 			this.enableTemplateEditing();
		// 		},
		// 	});
		// 	this.addCommand({
		// 		id: 'z2k-disable-template-editing',
		// 		name: 'Disable template editing mode',
		// 		checkCallback: (checking) => {
		// 			if (checking) { return this.settings.templateEditingEnabled; }
		// 			this.disableTemplateEditing();
		// 		},
		// 	});
		// 	// Toggle in context menu in file explorer
		// 	this.registerEvent(
		// 		this.app.workspace.on('file-menu', (menu, file) => {
		// 			if (this.settings.templateEditingEnabled) {
		// 				menu.addItem(i => i.setTitle("Z2K - Disable template editing mode")
		// 					.onClick(() => this.disableTemplateEditing()));
		// 			} else {
		// 				menu.addItem(i => i.setTitle("Z2K - Enable template editing mode")
		// 					.onClick(() => this.enableTemplateEditing()));
		// 			}
		// 		})
		// 	);
		// 	this.registerEvent(
		// 		// ts-ignore because folder-menu is not in the type definitions
		// 		// @ts-ignore
		// 		this.app.workspace.on('folder-menu', (menu, folder) => {
		// 			if (this.settings.templateEditingEnabled) {
		// 				menu.addItem((i: any) => i.setTitle("Z2K - Disable template editing mode")
		// 					.onClick(() => this.disableTemplateEditing()));
		// 			} else {
		// 				menu.addItem((i: any) => i.setTitle("Z2K - Enable template editing mode")
		// 					.onClick(() => this.enableTemplateEditing()));
		// 			}
		// 		})
		// 	);
		// }

		// Template conversion context menu in file explorer
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile) || this.getFileTemplateType(file) === "named") return;
				menu.addItem((item) => {
					item.setTitle("Z2K - Convert to named template")
						.onClick(() => this.convertFileTemplateType(file as TFile, "named"));
				});
			})
		);
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile) || this.getFileTemplateType(file) === "partial") return;
				menu.addItem((item) => {
					item.setTitle("Z2K - Convert to partial template")
						.onClick(() => this.convertFileTemplateType(file as TFile, "partial"));
				});
			})
		);
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile) || this.getFileTemplateType(file) === "normal") return;
				menu.addItem((item) => {
					item.setTitle("Z2K - Convert to markdown")
						.onClick(() => this.convertFileTemplateType(file as TFile, "normal"));
				});
			})
		);
	}

	registerURIHandler() {
		// this.registerObsidianProtocolHandler("z2k-templates", async (params) => {
		// 	try {
		// 		const action = params.action?.trim();
		// 		if (!action) { throw new Error("Missing 'action'"); }

		// 		// Common: field overrides (anything not in known set)
		// 		const known = new Set(["action","vault","templatepath","partialpath","filepath","existingfilepath","templateJSONdata","destheader","location"]);
		// 		const fieldOverrides: Record<string,string> = {};
		// 		for (const k in params) {
		// 			if (!known.has(k)) { fieldOverrides[k] = decodeURIComponent(params[k]); }
		// 		}
		// 		let jsonOverrides: Record<string, any> = {};
		// 		if (params.templateJSONdata) {
		// 			try {
		// 				jsonOverrides = JSON.parse(decodeURIComponent(params.templateJSONdata));
		// 			} catch { new Notice("Failed to parse templateJSONdata JSON"); }
		// 		}
		// 		const mergedOverrides = { ...jsonOverrides, ...fieldOverrides };

		// 		if (action.toLowerCase() === "new") {
		// 			const templatePath = decodeURIComponent(params.templatepath || "").trim();
		// 			if (!templatePath) { throw new Error("Missing 'templatepath'"); }
		// 			const templateFile = this.getFile(templatePath);
		// 			if (!templateFile || templateFile.extension !== "md") { throw new Error(`Template not found: ${templatePath}`); }

		// 			const rawPath = decodeURIComponent(params.filepath || "").trim();
		// 			const parentFallback = this.getTemplateCardType(templateFile) || this.getTemplatesRootFolder();
		// 			let finalPath: string;
		// 			if (!rawPath) {
		// 				finalPath = this.joinPath(parentFallback.path, moment().format("YYYY-MM-DD_HH-mm-ss") + ".md");
		// 			} else if (!rawPath.includes("/")) {
		// 				const folder = parentFallback;
		// 				const filename = rawPath.endsWith(".md") ? rawPath : `${rawPath}.md`;
		// 				finalPath = this.joinPath(folder, filename);
		// 			} else {
		// 				const endsWithSlash = rawPath.endsWith("/") || !rawPath.includes(".");
		// 				if (endsWithSlash) {
		// 					finalPath = this.joinPath(rawPath.replace(/\/+$/,""), `${Date.now()}.md`);
		// 				} else {
		// 					finalPath = rawPath.endsWith(".md") ? rawPath : `${rawPath}.md`;
		// 				}
		// 			}
		// 			await this.createFromTemplateUri(templateFile, finalPath, mergedOverrides);
		// 			return;
		// 		}

		// 		if (action.toLowerCase() === "insertpartial") {
		// 			const partialPath = decodeURIComponent(params.partialpath || "").trim();
		// 			if (!partialPath) { throw new Error("Missing 'partialpath'"); }
		// 			const partialFile = this.getFile(partialPath);
		// 			if (!partialFile || partialFile.extension !== "md") { throw new Error(`Partial not found: ${partialPath}`); }
		// 			const existingPath = decodeURIComponent(params.existingfilepath || "").trim();
		// 			const destHeader = params.destheader ? decodeURIComponent(params.destheader) : "";
		// 			const location = (params.location || "top").toLowerCase(); // "top" | "bottom"
		// 			await this.insertPartialFromUri(partialFile, existingPath, destHeader, location, mergedOverrides);
		// 			return;
		// 		}

		// 		new Notice(`Unknown Z2K action: ${action}`);
		// 	} catch (e) {
		// 		console.error("[Z2K URI handler error]", e);
		// 		new Notice("Failed to process z2k-templates URI");
		// 	}
		// });
	}

	//// Functions called from commands/context menu/etc

	// Card creation and management
	// 	(I couldn't find a good way to de-duplicate these functions,
	// 	so I made them separate and tried to reduce the repetition as much as I could)
	async createCard(cardTypeFolder: TFolder | null = null) {
		try {
			if (!cardTypeFolder) {
				cardTypeFolder = await this.promptForCardTypeFolder();
			}
			const templateFile = await this.promptForTemplateFile(cardTypeFolder, "named");

			let z2kSystemYaml = await this.GetZ2KSystemYaml(cardTypeFolder);
			let content = await this.app.vault.read(templateFile);
			let { fm, body } = Z2KYamlDoc.splitFrontmatter(content);
			fm = Z2KYamlDoc.mergeFirstWins([z2kSystemYaml, fm]);
			fm = this.updateYamlOnCreate(fm, templateFile.basename);
			content = Z2KYamlDoc.joinFrontmatter(fm, body);
			let state = await this.parseTemplate(content, templateFile.parent ?? this.app.vault.getRoot());
			state = this.addBuiltIns(state);
			state = this.setDefaultTitle(state);
			state = await this.promptForFieldCollection(state);

			let { fm: fmOut, body: bodyOut } = Z2KTemplateEngine.renderTemplate(state);
			let contentOut = Z2KYamlDoc.joinFrontmatter(fmOut, bodyOut);
			let title = state.resolvedValues["title"] as string || "Untitled";
			title = Z2KTemplateEngine.reducedRenderContent(title, state.resolvedValues);
			let newFile = await this.createFile(cardTypeFolder, title, contentOut);
			await this.app.workspace.openLinkText(newFile.path, "");
		} catch (error) { this.handleErrors(error); }
	}
	async createCardFromFile(sourceFile: TFile) {
		try {
			const cardTypeFolder = await this.promptForCardTypeFolder();
			const templateFile = await this.promptForTemplateFile(cardTypeFolder, "named");

			let z2kSystemYaml = await this.GetZ2KSystemYaml(cardTypeFolder);
			let content = await this.app.vault.read(templateFile);
			let { fm, body } = Z2KYamlDoc.splitFrontmatter(content);
			fm = Z2KYamlDoc.mergeFirstWins([z2kSystemYaml, fm]);
			fm = this.updateYamlOnCreate(fm, templateFile.basename);
			content = Z2KYamlDoc.joinFrontmatter(fm, body);
			let state = await this.parseTemplate(content, templateFile.parent ?? this.app.vault.getRoot());
			let hadSourceTextField = state.promptInfos["sourceText"] !== undefined;
			let sourceText = await this.app.vault.read(sourceFile);
			state = this.addBuiltIns(state, { sourceText });
			state = this.setDefaultTitle(state);
			state = await this.promptForFieldCollection(state);

			let { fm: fmOut, body: bodyOut } = Z2KTemplateEngine.renderTemplate(state);
			bodyOut = this.ensureSourceText(bodyOut, hadSourceTextField, sourceText);
			let contentOut = Z2KYamlDoc.joinFrontmatter(fmOut, bodyOut);
			let title = state.resolvedValues["title"] as string || "Untitled";
			title = Z2KTemplateEngine.reducedRenderContent(title, state.resolvedValues);
			let newFile = await this.createFile(cardTypeFolder, title, contentOut);
			await this.app.workspace.openLinkText(newFile.path, "");
			await this.promptAndDeleteFile(sourceFile);
		} catch (error) { this.handleErrors(error); }
	}
	async createCardFromSelection() {
		try {
			const editor = this.getEditorOrThrow();
			const cardTypeFolder = await this.promptForCardTypeFolder();
			const templateFile = await this.promptForTemplateFile(cardTypeFolder, "named");

			let z2kSystemYaml = await this.GetZ2KSystemYaml(cardTypeFolder);
			let content = await this.app.vault.read(templateFile);
			let { fm, body } = Z2KYamlDoc.splitFrontmatter(content);
			fm = Z2KYamlDoc.mergeFirstWins([z2kSystemYaml, fm]);
			fm = this.updateYamlOnCreate(fm, templateFile.basename);
			content = Z2KYamlDoc.joinFrontmatter(fm, body);
			let state = await this.parseTemplate(content, templateFile.parent ?? this.app.vault.getRoot());
			let hadSourceTextField = state.promptInfos["sourceText"] !== undefined;
			let sourceText = editor.getSelection();
			state = this.addBuiltIns(state, { sourceText });
			state = this.setDefaultTitle(state);
			state = await this.promptForFieldCollection(state);

			let { fm: fmOut, body: bodyOut } = Z2KTemplateEngine.renderTemplate(state);
			bodyOut = this.ensureSourceText(bodyOut, hadSourceTextField, sourceText);
			let contentOut = Z2KYamlDoc.joinFrontmatter(fmOut, bodyOut);
			let title = state.resolvedValues["title"] as string || "Untitled";
			title = Z2KTemplateEngine.reducedRenderContent(title, state.resolvedValues);
			let newFile = await this.createFile(cardTypeFolder, title, contentOut);
			editor.replaceSelection("");
			await this.app.workspace.openLinkText(newFile.path, "");
		} catch (error) { this.handleErrors(error); }
	}
	async continueCard(continueFile: TFile) {
		try {
			let content = await this.app.vault.read(continueFile);
			let state = await this.parseTemplate(content, continueFile.parent ?? this.app.vault.getRoot());
			state = this.addBuiltIns(state, { existingTitle: continueFile.basename });
			state = await this.promptForFieldCollection(state);
			let { fm, body } = Z2KTemplateEngine.renderTemplate(state);
			let contentOut = Z2KYamlDoc.joinFrontmatter(fm, body);
			let title = state.resolvedValues["title"] as string || "Untitled";
			title = Z2KTemplateEngine.reducedRenderContent(title, state.resolvedValues);
			await this.updateTitleAndContent(continueFile, title, contentOut);
		} catch (error) { this.handleErrors(error); }
	}
	async insertPartial() {
		try {
			const editor = this.getEditorOrThrow();
			const currFile = this.getOpenFileOrThrow();
			const currDir = this.getOpenFileParentOrThrow();
			const partialFile = await this.promptForTemplateFile(currDir, "partial");

			let content = await this.app.vault.read(partialFile);
			let state = await this.parseTemplate(content, partialFile.parent ?? this.app.vault.getRoot());
			state = this.addBuiltIns(state, { existingTitle: currFile.basename });
			state = await this.promptForFieldCollection(state);
			let { fm: partialFm, body: partialBody } = Z2KTemplateEngine.renderTemplate(state);
			partialFm = this.updatePartialYamlOnInsert(partialFm);
			editor.replaceRange(partialBody, editor.getCursor());
			let fileContent = await this.app.vault.read(currFile);
			let { fm: fileFm, body: fileBody } = Z2KYamlDoc.splitFrontmatter(fileContent);
			const mergedFm = Z2KYamlDoc.mergeFirstWins([fileFm, partialFm]);
			const newFileContent = Z2KYamlDoc.joinFrontmatter(mergedFm, fileBody);
			await this.app.vault.modify(currFile, newFileContent);
		} catch (error) { this.handleErrors(error); }
	}
	async insertPartialFromSelection() {
		try {
			const editor = this.getEditorOrThrow();
			const currFile = this.getOpenFileOrThrow();
			const currDir = this.getOpenFileParentOrThrow();
			const partialFile = await this.promptForTemplateFile(currDir, "partial");

			let content = await this.app.vault.read(partialFile);
			let state = await this.parseTemplate(content, partialFile.parent ?? this.app.vault.getRoot());
			let hadSourceTextField = state.promptInfos["sourceText"] !== undefined;
			let sourceText = editor.getSelection();
			state = this.addBuiltIns(state, { sourceText, existingTitle: currFile.basename });
			state = await this.promptForFieldCollection(state);
			let { fm: partialFm, body: partialBody } = Z2KTemplateEngine.renderTemplate(state);
			partialFm = this.updatePartialYamlOnInsert(partialFm);
			partialBody = this.ensureSourceText(partialBody, hadSourceTextField, sourceText);
			editor.replaceSelection(partialBody);
			let fileContent = await this.app.vault.read(currFile);
			let { fm: fileFm, body: fileBody } = Z2KYamlDoc.splitFrontmatter(fileContent);
			const mergedFm = Z2KYamlDoc.mergeFirstWins([fileFm, partialFm]);
			const newFileContent = Z2KYamlDoc.joinFrontmatter(mergedFm, fileBody);
			await this.app.vault.modify(currFile, newFileContent);
		} catch (error) { this.handleErrors(error); }
	}

	// de-duplication helper functions
	async parseTemplate(content: string, relativeFolder: TFolder): Promise<TemplateState> {
		try {
			return await Z2KTemplateEngine.parseTemplate(content, relativeFolder.path, this.getPartialCallbackFunc());
		} catch (error) {
			rethrowWithMessage(error, "Error occurred while parsing the template");
		}
	}
	async createFile(folder: TFolder, title: string, content: string): Promise<TFile> {
		try {
			const filename = this.getValidFilename(title);
			const newPath = this.generateUniqueFilePath(folder.path, filename);
			const file = await this.app.vault.create(newPath, content);
			return file;
		} catch (error) {
			rethrowWithMessage(error, "Error occurred while creating the file");
		}
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



	// Template editing
	async convertFileTemplateType(file: TFile, type: "normal" | "named" | "partial") {
		try {
			if (type === "normal" && this.isInsideTemplatesFolder(file)) {
				new Notice("You will need to manually move the file outside of your templates folder (" + this.settings.templatesFolderName + ").");
			}
			let content = await this.app.vault.read(file);
			let { fm, body } = Z2KYamlDoc.splitFrontmatter(content);
			let doc = Z2KYamlDoc.fromString(fm);
			if (type === "normal") {
				doc.del("z2k_template_type");
			} else if (type === "named" || type === "partial") {
				doc.set("z2k_template_type", type);
			}
			fm = doc.toString();
			content = Z2KYamlDoc.joinFrontmatter(fm, body);
			await this.app.vault.modify(file, content);
			// // if editing is disabled, rename file to start with '.' (this shouldn't ever really happen though)
			// if (!this.settings.templateEditingEnabled && type !== "normal") {
			// 	await this.hideTemplateFile(file);
			// }
		} catch (error) { this.handleErrors(error); }
	}
	// async enableTemplateEditing() {
	// 	try {
	// 		this.settings.templateEditingEnabled = true;
	// 		await this.saveData(this.settings);
	// 		for (const f of this.getAllZ2KFiles()) {
	// 			// Not using await
	// 			if (f instanceof TFolder && f.name === "." + this.settings.templatesFolderName) {
	// 				this.unhideFolder(f);
	// 			}
	// 			if (f instanceof TFile && f.name.startsWith(".") && this.getFileTemplateType(f) !== "normal") {
	// 				this.unhideTemplateFile(f);
	// 			}
	// 		}
	// 		this.registerTemplateFileExtension();
	// 		new Notice("Z2K template editing enabled.");
	// 	} catch (error) { this.handleErrors(error); }
	// }
	// async disableTemplateEditing() {
	// 	try {
	// 		this.settings.templateEditingEnabled = false;
	// 		await this.saveData(this.settings);
	// 		for (const f of this.getAllZ2KFiles()) {
	// 			// Not using await
	// 			if (f instanceof TFolder && f.name === this.settings.templatesFolderName) {
	// 				this.hideFolder(f);
	// 			}
	// 			if (f instanceof TFile && this.getFileTemplateType(f) !== "normal") {
	// 				this.hideTemplateFile(f);
	// 			}
	// 		}
	// 		this.unregisterTemplateFileExtension();
	// 		new Notice("Z2K template editing disabled.");
	// 	} catch (error) { this.handleErrors(error); }
	// }

	//// All other functions

	// Prompts
	async promptForCardTypeFolder(): Promise<TFolder> {
		const cardTypes = this.getAllCardTypes("named");
		if (cardTypes.length === 0) {
			throw new Error(`No ${cardRefNameLower(this.settings)} types available. Please create a template folder first.`);
		}
		return new Promise<TFolder>((resolve, reject) => {
			new CardTypeSelectionModal(this.app, cardTypes, this.settings, resolve, reject).open();
		});
	}
	async promptForTemplateFile(cardType: TFolder, type: "named" | "partial"): Promise<TFile> {
		const templates = this.getAssociatedTemplates(type, cardType);
		if (templates.length === 0) {
			throw new Error(`No ${type === "named" ? "" : "partial "}templates available in the selected ${cardRefNameLower(this.settings)} type folder.`);
		}
		return new Promise<TFile>((resolve, reject) => {
			new TemplateSelectionModal(this.app, templates, this.settings, resolve, reject).open();
		});
	}
	async promptForFieldCollection(templateState: TemplateState): Promise<TemplateState> {
		if (this.hasFillableFields(templateState.promptInfos)) {
			await new Promise<void>((resolve, reject) => {
				new FieldCollectionModal(this.app, `Field Collection for ${cardRefNameUpper(this.settings)}`, templateState, resolve, reject).open();
			});
		} else {
			new Notice("No fields to prompt for.");
		}
		return templateState;
	}
	async promptAndDeleteFile(file: TFile) {
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
	getFileTemplateType(file: TFile): "normal" | "named" | "partial" {
		const yamlTemplateType = this.app.metadataCache.getFileCache(file)?.frontmatter?.["z2k_template_type"];
		if (yamlTemplateType === "named" || yamlTemplateType === "partial") {
			return yamlTemplateType;
		} else if (this.isInsideTemplatesFolder(file)) {
			return "named";
		} else if (file.extension === "template") {
			return "named";
		} else {
			return "normal";
		}
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

	getAllTemplates(): { file: TFile, type: "named" | "partial" }[] {
		let list = [];
		for (const f of this.getAllTemplatesRootFiles()) {
			if (!(f instanceof TFile)) { continue; }
			const type = this.getFileTemplateType(f);
			if (type === "normal") { continue; }
			list.push({ file: f, type });
		}
		return list;
	}
	getAllCardTypes(filter: "named" | "partial"): TFolder[] {
		let folders: TFolder[] = [];
		for (const t of this.getAllTemplates()) {
			if (t.type !== filter) { continue; }
			let folder = t.file.parent;
			if (folder?.name === this.settings.templatesFolderName ||
					folder?.name === '.' + this.settings.templatesFolderName) {
				folder = folder.parent as TFolder; // templates are in the templates folder, so we want the parent folder
			}
			if (!folder || folders.includes(folder)) { continue; }
			folders.push(folder);
		}
		folders.sort((a, b) => a.path.localeCompare(b.path));
		return folders;
	}
	getAssociatedTemplates(filter: "named" | "partial", cardType: TFolder): TFile[] {
		const templatesRootFolder = this.getTemplatesRootFolder();
		if (!this.isSubPathOf(cardType.path, templatesRootFolder.path)) {
			throw new Error(`The selected ${cardRefNameLower(this.settings)} type folder is not inside your templates root folder.`);
		}
		let currFolder: TFolder = cardType;
		let templates: TFile[] = [];
		while (true) {
			for (const template of this.getAllTemplates()) {
				if (template.type !== filter) { continue; }
				if (this.isInThisFolderOrItsTemplatesFolder(template.file, currFolder)) {
					if (!templates.includes(template.file)) {
						templates.push(template.file);
					}
					continue;
				}
			}
			if (currFolder === templatesRootFolder || !currFolder.parent) { break; }
			currFolder = currFolder.parent as TFolder;
		}
		templates.sort((a, b) => a.path.localeCompare(b.path));
		return templates;
	}
	getTemplateCardType(template: TFile): TFolder | null {
		if (this.getFileTemplateType(template) === "normal") { return null; } // not a template
		let folder = template.parent;
		if (folder?.name === this.settings.templatesFolderName ||
				folder?.name === '.' + this.settings.templatesFolderName) {
			folder = folder.parent as TFolder; // templates are in the templates folder, so we want the parent folder
		}
		return folder || null;
	}
	getPartialCallbackFunc(): (name: string, path: string) => Promise<[found: boolean, content: string, path: string]> {
		// Store [file, normalized path] pairs for all partials
		let allPartials: [TFile, string][] = [];
		for (const t of this.getAllTemplates()) {
			if (t.type === "partial") {
				allPartials.push([t.file, normalizeFullPath(t.file.path)]);
			}
		}

		return async (name: string, path: string): Promise<[found: boolean, content: string, path: string]> => {
			// TODO: support more path formats, like relative paths, partial paths, etc; Maybe make relative paths required to start with './' or '../'?
			// name can be just the title (partial.md) or an absolute path (/folder/partial.md).
			// path is the folder of the template/partial where the partial was referenced (so it's relative to here).
			if (name.startsWith("/")) { // absolute path
				const absolutePath = normalizeFullPath(this.joinPath(this.getTemplatesRootFolder().path, name.substring(1))); // DOCS: relative to templates root folder
				const file = this.getFile(absolutePath);
				if (!file) { return [false, "", ""]; }
				const normPath = normalizeFullPath(file.path);
				if (!allPartials.some(([f, p]) => p === normPath)) { return [false, "", ""]; }
				return [true, await this.app.vault.read(file), normPath];
			}
			// if given just the name, search current dir first (including templates dir), then search parents, then the whole vault
			if (!name.includes("/")) { // just the name
				let matches: [TFile, string][] = [];
				for (const partial of allPartials) {
					if (partial[0].basename === name || partial[0].name === name) {
						matches.push(partial);
					}
				}
				if (matches.length === 0) { return [false, "", ""]; }
				if (matches.length === 1) {
					// found exactly one match, return it
					return [true, await this.app.vault.read(matches[0][0]), matches[0][1]];
				}

				let currFolder = this.getFolder(path);
				if (!currFolder) { throw new Error(`Path '${path}' does not point to a folder.`); }
				while (true) {
					// check if any of the matches are in the current folder
					for (const match of matches) {
						if (this.isInThisFolderOrItsTemplatesFolder(match[0], currFolder as TFolder)) {
							return [true, await this.app.vault.read(match[0]), match[1]];
						}
					}
					if (currFolder === this.getTemplatesRootFolder() || !currFolder.parent) { break; }
					currFolder = currFolder.parent as TFolder;
				}
				// if we reach here, no match was found in the current folder or its parents, so return the first match
				return [true, await this.app.vault.read(matches[0][0]), matches[0][1]];
			} else {
				// relative path
				throw new Error("Relative paths are not supported yet. Please use absolute paths or just the name of the partial.");
			}
		}
	}

	isInThisFolderOrItsTemplatesFolder(file: TFile, folder: TFolder): boolean {
		if (file.parent === folder) { return true; }
		if (this.isSubPathOf(file.path, this.joinPath(folder.path, this.settings.templatesFolderName))
				|| this.isSubPathOf(file.path, this.joinPath(folder.path, '.' + this.settings.templatesFolderName))) {
			return true;
		}
		return false;
	}
	isInsideTemplatesFolder(file: TFile): boolean {
		const tfn = this.settings.templatesFolderName;
		const templatesRoot = this.getTemplatesRootFolder();
		if (!this.isSubPathOf(file.path, templatesRoot.path)) { return false; }
		const normPath = normalizeFullPath(file.path);
		return normPath.includes(`/${tfn}/`) || normPath.includes(`/.${tfn}/`) || normPath.startsWith(`${tfn}/`) || normPath.startsWith(`.${tfn}/`);
	}
	getAllTemplatesRootFiles(): TAbstractFile[] {
		let files: TAbstractFile[] = [];
		const templatesRootPath = this.getTemplatesRootFolder().path;
		for (const f of this.app.vault.getAllLoadedFiles()) {
			if (this.isSubPathOf(f.path, templatesRootPath)) {
				files.push(f);
			}
		}
		return files;
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
	getOpenFileParentOrThrow(): TFolder {
		const file = this.getOpenFileOrThrow();
		return file.parent ?? this.app.vault.getRoot();
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
		let fullPath = this.joinPath(folderPath, filename);
		let counter = 1;
		while (this.getFile(fullPath)) {
			fullPath = this.joinPath(folderPath, `${basename} (${counter++}).md`);
		}
		return fullPath;
	}
	setDefaultTitle(state: TemplateState): TemplateState {
		// look through all the yaml (including from partials) and find any z2k_template_default_title field
		for (const yamlStr of state.templatesYaml) {
			let yaml = Z2KYamlDoc.fromString(yamlStr);

			let raw = yaml.get("z2k_template_default_title");
			let defaultTitle = (raw && typeof raw === "object" && "toJSON" in raw) ? (raw as any).toJSON() : raw;
			if (defaultTitle === undefined) { continue; } // not found in this yaml
			if (typeof defaultTitle !== "string") {
				throw new TemplatePluginError(`z2k_template_default_title must be a string (got a ${typeof defaultTitle})`);
			}
			state.promptInfos["title"].default = defaultTitle;
			break; // take the first one we find
		}
		return state;
	}
	addBuiltIns(state: TemplateState, opts: { sourceText?: string, existingTitle?: string, templateName?: string } = {}): TemplateState {
		// sourceText
		state.promptInfos["sourceText"] = {
			varName: "sourceText",
			type: "text",
			directives: ['no-prompt'],
		};
		state.resolvedValues["sourceText"] = opts.sourceText || "";

		// creator
		state.promptInfos["creator"] = {
			varName: "creator",
			type: "text",
			directives: ['no-prompt'],
		};
		state.resolvedValues["creator"] = this.settings.creator || "";

		// template name
		state.promptInfos["templateName"] = {
			varName: "templateName",
			type: "text",
			directives: ['no-prompt'],
		};
		// try getting existing template name from yaml if not provided
		if (!opts.templateName) {
			for (const yamlStr of state.templatesYaml) {
				let yaml = Z2KYamlDoc.fromString(yamlStr);
				let raw = yaml.get("z2k_template_name");
				let templateName = (raw && typeof raw === "object" && "toJSON" in raw) ? (raw as any).toJSON() : raw;
				if (templateName === undefined) { continue; } // not found in this yaml
				if (typeof templateName !== "string") {
					throw new TemplatePluginError(`z2k_template_name must be a string (got a ${typeof templateName})`);
				}
				opts.templateName = templateName;
				break; // take the first one we find
			}
		}
		state.resolvedValues["templateName"] = opts.templateName || "";

		// title
		state.promptInfos["title"] = {
			varName: "title",
			type: "titleText",
			directives: opts.existingTitle ? ['required', 'no-prompt'] : ['required'],
		};
		state.resolvedValues["title"] = opts.existingTitle || "Untitled";

		return state;
	}
	updateYamlOnCreate(fm: string, templateName: string): string {
		const doc = Z2KYamlDoc.fromString(fm);
		doc.set("z2k_template_name", templateName);
		doc.del("z2k_template_type");
		doc.del("z2k_template_default_title");
		doc.del("z2k_template_default_miss_handling");
		return doc.toString();
	}
	updatePartialYamlOnInsert(fm: string): string {
		const doc = Z2KYamlDoc.fromString(fm);
		doc.del("z2k_template_type");
		doc.del("z2k_template_default_miss_handling");
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

	private async GetZ2KSystemYaml(cardTypeFolder: TFolder): Promise<string> {
		// Get all the z2k system yaml files between here and the root
		const templatesRoot = this.getFolder(this.settings.templatesRootFolder);
		let currentFolder: TFolder | null = cardTypeFolder;
		let systemYamls: string[] = [];
		while (currentFolder) {
			const filePath = this.joinPath(currentFolder.path, '.z2k-system.yaml');
			try {
				// Need to use adapter because the usual file read doesn't work for files that start with .
				systemYamls.push(await this.app.vault.adapter.read(filePath));
			} catch {
				// Can't find/read the file
			}
			if (currentFolder === templatesRoot) break; // Stop at the templates root
			currentFolder = currentFolder.parent;
		}

		let fm = "";
		// Combine in reverse order (root first)
		for (const yamlStr of systemYamls.reverse()) {
			fm = Z2KYamlDoc.mergeFirstWins([yamlStr, fm]);
		}
		return fm;
	}
	private handleErrors(error: unknown) {
		// Display error messages to the user
		if (error instanceof TemplatePluginError) {
			console.error("TemplatePluginError: ", error.message);
			new ErrorModal(this.app, error).open();
		} else if (error instanceof UserCancelError) {
			// Just exit, no need to show a message
		} else if (error instanceof TemplateError) {
			console.error("Template error: ", error.message);
			new ErrorModal(this.app, error).open();
		} else {
			console.error("Unexpected error: ", error);
			new ErrorModal(this.app, new TemplatePluginError("An unexpected error occurred", error)).open();
		}
	}

	// Helpers for file/folder operations
	private getFile(path: string): TFile | null {
		const normalized = normalizeFullPath(path);
		const file = this.app.vault.getAbstractFileByPath(normalized);
		return file instanceof TFile ? file : null;
	}
	private getFolder(path: string): TFolder | null {
		const normalized = normalizeFullPath(path);
		if (normalized === '') { return this.app.vault.getRoot(); } // Special case for root folder
		const file = this.app.vault.getAbstractFileByPath(normalized);
		return file instanceof TFolder ? file : null;
	}
	private isSubPathOf(child: string, parent: string): boolean {
		const normParent = normalizeFullPath(parent);
		const normChild = normalizeFullPath(child);
		if (normParent === '') { return true; } // root is parent of everything
		if (normChild === normParent) { return true; }
		return normChild.startsWith(normParent + '/');
	}
	private joinPath(...parts: string[]): string {
		return normalizeFullPath(parts.join('/'));
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

function normalizeFullPath(path: string): string {
	return path
		.trim()
		.replace(/\\/g, '/')       // Normalize backslashes to '/'
		.replace(/\/{2,}/g, '/')   // Collapse multiple slashes
		.replace(/^\.\//, '')      // Remove leading "./"
		.replace(/^\/+/, '')       // Remove leading slashes
		.replace(/\/+$/, '');      // Remove trailing slashes
}

function cardRefNameUpper(settings: { cardReferenceName: string }): string {
	const s = settings.cardReferenceName || "Card";
	return s.charAt(0).toLocaleUpperCase() + s.slice(1);
}
function cardRefNameLower(settings: { cardReferenceName: string }): string {
	const s = settings.cardReferenceName || "Card";
	return s.charAt(0).toLocaleLowerCase() + s.slice(1);
}
function cardRefNameUpperPlural(settings: { cardReferenceName: string }): string {
	return cardRefNameUpper(settings) + "s";
}
function cardRefNameLowerPlural(settings: { cardReferenceName: string }): string {
	return cardRefNameLower(settings) + "s";
}

// ------------------------------------------------------------------------------------------------
// Handlebars syntax highlighting
// ------------------------------------------------------------------------------------------------

type SpanType = "normal" | "triple" | "comment" | "raw";
type Span = { from: number; to: number; type: SpanType };

export function handlebarsOverlay(): Extension {
	const spanMark = (cls: string) => Decoration.mark({class: cls});
	const tokMark  = (cls: string) => Decoration.mark({class: `cm-hbs-token ${cls}`});

	function build(view: EditorView): DecorationSet {
		const b = new RangeSetBuilder<Decoration>();

		for (const {from, to} of view.visibleRanges) {
			const text = view.state.doc.sliceString(from, to);

			for (const m of scanAll(text)) {
				const baseCls =
					m.type === "comment" ? "cm-hbs-comment" :
					m.type === "raw" ? "cm-hbs-raw" :
					m.type === "triple" ? "cm-hbs-triple" : "cm-hbs";

				// whole-span tint (lightweight)
				b.add(from + m.from, from + m.to, spanMark(baseCls));

				// deep tokenization with Handlebars Lezer (cap length for perf)
				const spanLen = m.to - m.from;
				if (spanLen <= 4000) {
					const slice = text.slice(m.from, m.to);
					const tree  = handlebarsLanguage.parser.parse(slice);

					// Use Lezer’s classHighlighter to get tag-based classes like "tok-string"
					highlightTree(tree, classHighlighter, (s, e, classes) => {
						// Map "tok-foo tok-bar" -> "cm-tok-foo cm-tok-bar"
						const cls = classes.split(/\s+/).map(c => `cm-${c}`).join(" ");
						b.add(from + m.from + s, from + m.from + e, tokMark(cls));
					});
				}
			}
		}
		return b.finish();
	}

	return [
		// Theme defaults: inherit from Obsidian’s code vars
		EditorView.baseTheme({
			".cm-hbs": { color: "var(--text-faint)" },
			".cm-hbs-triple": { color: "var(--text-muted)" },
			".cm-hbs-comment": { color: "var(--text-faint)", fontStyle: "italic" },
			".cm-hbs-raw": { color: "var(--text-muted)" },

			/* token-level colors (from classHighlighter) */
			".cm-hbs-token.cm-tok-string": { color: "var(--code-string)" },
			".cm-hbs-token.cm-tok-number": { color: "var(--code-number)" },
			".cm-hbs-token.cm-tok-comment": { color: "var(--code-comment)", fontStyle: "italic" },
			".cm-hbs-token.cm-tok-keyword": { color: "var(--code-keyword)" },
			".cm-hbs-token.cm-tok-operator": { color: "var(--code-operator)" },
			".cm-hbs-token.cm-tok-variableName": { color: "var(--code-property)" },
			".cm-hbs-token.cm-tok-atom": { color: "var(--code-important)" },
			".cm-hbs-token.cm-tok-tagName": { color: "var(--code-tag)" },
			".cm-hbs-token.cm-tok-propertyName": { color: "var(--code-property)" },
		}),
		ViewPlugin.fromClass(class {
			decorations: DecorationSet;
			constructor(view: EditorView) { this.decorations = build(view); }
			update(u: ViewUpdate) {
				if (u.docChanged || u.viewportChanged) this.decorations = build(u.view);
			}
		}, { decorations: v => v.decorations })
	];
}

function scanAll(text: string): Span[] {
	const out: Span[] = [];
	let i = 0;
	while (i < text.length) {
		const j = text.indexOf("{{", i);
		if (j < 0) break;
		// skip escaped \{{ (odd number of backslashes)
		if (isEscapedAt(text, j)) { i = j + 2; continue; }
		const res = scanHandlebarsSpan(text, j);
		if (res) { out.push({ from: j, to: res.end, type: res.type }); i = res.end; }
		else { i = j + 2; }
	}
	return out;
}

// odd backslashes immediately before position => escaped
function isEscapedAt(text: string, pos: number): boolean {
	let b = 0; for (let k = pos - 1; k >= 0 && text.charCodeAt(k) === 92; k--) { b++; }
	return (b & 1) === 1;
}

function scanHandlebarsSpan(text: string, start: number): { end: number; type: SpanType } | null {
	if (!text.startsWith("{{", start)) { return null; }
	if (isEscapedAt(text, start)) { return null; }

	// support trim marker right after open: {{~... / {{{~...
	const afterOpen = start + 2;
	const hasTrimOpen = text.charCodeAt(afterOpen) === 126; // '~'
	const p = hasTrimOpen ? afterOpen + 1 : afterOpen;

	// Long comment: {{~!-- ... --}}
	if (text.startsWith("!--", p)) {
		const end = text.indexOf("--}}", p + 3);
		return end >= 0 ? { end: end + 4, type: "comment" } : null;
	}
	// Short comment: {{~! ... }}
	if (text.charCodeAt(p) === 33 /* '!' */) {
		const end = text.indexOf("}}", p + 1);
		// allow optional trim before close: ~}}
		return end >= 0 ? { end: end + 2, type: "comment" } : null;
	}

	// Raw block: {{{{~name}}}} ... {{{{/name~}}}}
	if (text.startsWith("{{{{", start)) {
		let q = start + 4;
		if (text.charCodeAt(q) === 126) { q++; } // optional ~ after {{{{
		const m = text.slice(q).match(/^\s*([A-Za-z_][\w:-]*)/);
		if (!m) { return null; }
		const name = m[1];
		const openRest = q + m[0].length;
		// find matching close: {{{{/name ... }}}}
		const closeHead = `{{{{/${name}`;
		let idx = text.indexOf(closeHead, openRest);
		if (idx < 0) { return null; }
		const endBraces = text.indexOf("}}}}", idx); // allows optional ~/ws before braces
		return endBraces >= 0 ? { end: endBraces + 4, type: "raw" } : null;
	}

	// Normal or triple mustache (allow trim after open)
	const triple = text.startsWith("{{{", start);
	let i = start + (triple ? 3 : 2);
	if (text.charCodeAt(i) === 126) { i++; } // skip {{~ or {{{~
	let inDQ = false, inSQ = false;

	while (i < text.length) {
		const ch = text.charCodeAt(i);
		if (inDQ) { if (ch === 34 && !isEscapedAt(text, i)) { inDQ = false; } i++; continue; } // "
		if (inSQ) { if (ch === 39 && !isEscapedAt(text, i)) { inSQ = false; } i++; continue; } // '
		if (ch === 34) { inDQ = true; i++; continue; }
		if (ch === 39) { inSQ = true; i++; continue; }
		// closer with optional trim before braces: ~}} or ~}}}
		if (text.charCodeAt(i) === 126 /* '~' */) {
			if (triple ? text.startsWith("}}}", i + 1) : text.startsWith("}}", i + 1)) {
				return { end: i + 1 + (triple ? 3 : 2), type: triple ? "triple" : "normal" };
			}
		}
		if (triple ? text.startsWith("}}}", i) : text.startsWith("}}", i)) {
			return { end: i + (triple ? 3 : 2), type: triple ? "triple" : "normal" };
		}
		i++;
	}
	return null;
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
		this.titleEl.setText(`Select ${cardRefNameUpper(this.settings)} Type`);
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
					this.reject(new UserCancelError(`User cancelled ${cardRefNameLower(this.settings)} type selection`));
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
			const newIndex = Math.min(selectedIndex + 1, cardTypes.length - 1);
			setSelectedIndex(newIndex);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const newIndex = Math.max(selectedIndex - 1, 0);
			setSelectedIndex(newIndex);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			onConfirm(cardTypes[selectedIndex]);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			onCancel();
		}
	};

	function getPrettyPath(path: string): string {
		let normPath = normalizeFullPath(path);
		let templatesRoot = normalizeFullPath(settings.templatesRootFolder);
		if (normPath === templatesRoot) { return "/"; }
		if (normPath.startsWith(templatesRoot + "/")) {
			return "/" + normPath.substring(templatesRoot.length + 1);
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
				{cardTypes.length === 0 ? (
					<div className="selection-empty-state">No {cardRefNameLower(settings)} types found</div>
				) : (
					cardTypes.map((cardType, index) => (
						<div
							key={cardType.path}
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
	const getItems = (): { file: TFile, name: string, cardType: string }[] => {
		return templates.map((template: TFile) => {
			let cardType = template.parent?.path;
			if (template.parent?.name === settings.templatesFolderName || template.parent?.name === "." + settings.templatesFolderName) {
				cardType = template.parent?.parent?.path;
			}
			cardType = normalizeFullPath(cardType ?? "");
			return { file: template, name: template.basename, cardType: cardType }
		});
	}

	const [searchTerm, setSearchTerm] = useState<string>('');
	const [filteredItems, setFilteredItems] = useState<{ file: TFile, name: string, cardType: string }[]>(getItems());
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	// Filter templates when search term changes
	useEffect(() => {
		// const filtered = templates.filter((template: TFile) => {
		// 	const nameMatch = template.basename.toLowerCase().includes(searchTerm.toLowerCase());
		// 	const pathMatch = template.parent?.path.toLowerCase().includes(searchTerm.toLowerCase()) || false;
		// 	return nameMatch || pathMatch;
		// });
		setFilteredItems(
			getItems().filter(item => {
				const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
				const pathMatch = item.cardType.toLowerCase().includes(searchTerm.toLowerCase());
				return nameMatch || pathMatch;
			})
		);
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
			const newIndex = Math.min(selectedIndex + 1, filteredItems.length - 1);
			setSelectedIndex(newIndex);
			scrollToItem(newIndex);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const newIndex = Math.max(selectedIndex - 1, -1);
			setSelectedIndex(newIndex);
			scrollToItem(newIndex);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			onConfirm(filteredItems[selectedIndex].file);
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
				{filteredItems.length === 0 ? (
					<div className="selection-empty-state template-list-empty-state">No templates found</div>
				) : (
					filteredItems.map((item: { file: TFile, name: string, cardType: string }, index: number) => (
						<div
							key={item.file.path}
							className={`selection-item ${selectedIndex === index ? 'selected' : ''}`}
							onClick={() => onConfirm(item.file)}
							tabIndex={index + 2} // +2 because search is tabIndex 1
						>
							{/* <span className="selection-primary">{template.basename}</span>
							<span className="selection-secondary">{template.parent?.path || ''}</span> */}
							<span className="selection-primary">
								{highlightMatch(item.name, searchTerm)}
							</span>
							<span className="selection-secondary">
								{highlightMatch(item.cardType, searchTerm)}
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
					onClick={() => onConfirm(filteredItems[selectedIndex].file)}
					disabled={filteredItems.length === 0}
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
	templateState: TemplateState;
	resolve: () => void;
	reject: (error: Error) => void;
	root: any; // React root

	constructor(app: App, title: string, templateState: TemplateState, resolve: () => void, reject: (error: Error) => void) {
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
	templateState: TemplateState;
	onComplete: () => void;
	onCancel: () => void;
}
// This component assumes that varInfoMap will not be changing.
const FieldCollectionForm = ({ templateState, onComplete, onCancel }: FieldCollectionFormProps) => {
	function formatFieldName(str: string): string {
		str = str.charAt(0).toUpperCase() + str.slice(1);
		return str
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')      // parseXML → parse XML, GLTF2L → GLTF2 L
			.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')   // XMLFile → XML File, HTTPServer → HTTP Server
			.trim();
	}
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
				resolvedPrompt: promptInfo.prompt ?? formatFieldName(fieldName),
				resolvedDefault: promptInfo.default ?? "",
				resolvedMiss: promptInfo.miss ?? ""
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
			newFieldStates[fieldName].resolvedPrompt = Z2KTemplateEngine.reducedRenderContent(promptInfo.prompt || formatFieldName(fieldName), context)
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
