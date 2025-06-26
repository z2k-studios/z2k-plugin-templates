
// TODO: Add error handling for errors within react components by using React Error Boundaries

import { App, Plugin, Modal, Notice, TFolder, TFile, PluginSettingTab, Setting, MarkdownView, EditorPosition } from 'obsidian';
import { Z2KTemplateEngine, TemplateState, BuiltInVar, SegmentList, VarInfo, VarValueType, ReducedSetSegment, TemplateError } from 'z2k-template-engine';
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
	}
	onunload() {}

	registerCommands() {
		// Command palette commands
		this.addCommand({
			id: 'z2k-create-new-card',
			name: 'Create card from template',
			callback: () => this.createOrContinueCard({}),
		});

		// Command palette commands for when text is selected
		this.addCommand({
			id: 'z2k-create-card-from-selected-text',
			name: 'Create card from selected text',
			editorCheckCallback: (checking, editor) => {
				const selectedText = editor.getSelection();
				if (checking) { return selectedText.length > 0; } // Only enable if text is selected
				this.createOrContinueCard({inputText: selectedText});
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
							this.createOrContinueCard({inputText: selectedText});
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
				this.createOrContinueCard({inputFile: activeFile as TFile});
			},
		});

		// Command palette 'continue card creation' to continue creating a card from an existing file
		this.addCommand({
			id: 'z2k-continue-filling-card',
			name: 'Continue filling card',
			editorCheckCallback: (checking, editor) => {
				const activeFile = this.app.workspace.getActiveFile();
				if (checking) { return !!activeFile && activeFile.extension === 'md'; }
				this.createOrContinueCard({ continueFile: activeFile as TFile });
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
				this.insertPartialTemplate();
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
							this.insertPartialTemplate();
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
				this.insertPartialTemplate({inputText: editor.getSelection()});
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
							this.insertPartialTemplate({inputText: selectedText});
						});
				});
			})
		);
	}

	async createOrContinueCard(opts: { inputText?: string, inputFile?: TFile, continueFile?: TFile }) {
		try {
			let { inputText, inputFile, continueFile } = opts;

			// Pull text from file if needed
			if (inputFile) {
				try {
					inputText = await this.app.vault.read(inputFile);
				} catch (error) {
					rethrowWithMessage(error, "Error occurred trying to read the file");
				}
			}

			let inputContent: string;
			let cardType: TFolder | null = null;
			let fieldCollectionModalTitle = "Field Collection for Card";
			let templateName: any;
			if (continueFile) {
				// If continuing from an existing file, just read its content
				fieldCollectionModalTitle = "Continue Filling Card:";
				try {
					inputContent = await this.app.vault.read(continueFile);
				} catch (error) {
					rethrowWithMessage(error, "Error occurred while reading the file to continue from");
				}
			} else {
				// Prompt for card type (the folder containing the desired template)
				const cardTypes = this.getTemplatesTypes(false);
				cardType = await new Promise<TFolder>((resolve, reject) =>
					new CardTypeSelectionModal(this.app, cardTypes, this.settings, resolve, reject).open()
				);

				// Get template using TemplateSelectionModal modal (the template file)
				const templates = this.getTemplatesForType(cardType, false);
				const template = await new Promise<TFile>((resolve, reject) => {
					new TemplateSelectionModal(this.app, templates, this.settings, resolve, reject).open();
				});
				fieldCollectionModalTitle = template.basename;
				templateName = template.basename;

				// Get template
				try {
					inputContent = await this.app.vault.read(template);
				} catch (error) {
					rethrowWithMessage(error, "Error occurred while reading the template");
				}
			}

			// Parse the template
			let templateState: TemplateState;
			let hadSourceTextField: boolean;
			try {
				templateState = this.templateEngine.parseTemplate(inputContent);

				// Add some extra built-ins:

				// sourceText
				hadSourceTextField = templateState.mergedVarInfoMap.has("sourceText");
				templateState.mergedVarInfoMap.set("sourceText", {
					varName: "sourceText",
					dataType: "text",
					directives: ['no-prompt'],
					resolvedValue: inputText || "",
					valueSource: "built-in",
				});

				// creator
				templateState.mergedVarInfoMap.set("creator", {
					varName: "creator",
					dataType: "text",
					directives: ['no-prompt'],
					resolvedValue: this.settings.creator || "",
					valueSource: "built-in",
				});

				// templateName
				if (continueFile) {
					// Only use the yaml from the file if continuing
					templateName = templateState.parsedYaml["z2k_template_name"];
				} else {
					// Override the template name if specified in YAML
					let templateNameYaml = templateState.parsedYaml["z2k_template_name"];
					if (templateNameYaml instanceof SegmentList) {
						if (templateNameYaml.items.length !== 1 || typeof templateNameYaml.items[0] !== 'string') {
							new Notice("Sorry, variables in the template name are not supported");
						} else {
							templateName = templateNameYaml.items[0] as string;
						}
					}
				}
				templateState.mergedVarInfoMap.set("templateName", {
					varName: "templateName",
					dataType: "text",
					directives: ['no-prompt'],
					resolvedValue: templateName as string || "",
					valueSource: "built-in",
				});

				// title
				// title is reduced set compatible
				if (continueFile) {
					let currTitle = continueFile.basename;
					if (currTitle.endsWith('.md')) { currTitle = currTitle.slice(0, -3); }
					templateState.mergedVarInfoMap.set("title", {
						varName: "title",
						rawExpression: currTitle,
						promptText: "Title",
						parsedPromptText: Z2KTemplateEngine.parseReducedSetSegmentsText("Title"),
						dataType: "titleText",
						defaultValue: currTitle,
						parsedDefaultValue: Z2KTemplateEngine.parseReducedSetSegmentsText(currTitle),
						directives: ['required', 'no-prompt'],
						resolvedValue: currTitle,
						valueSource: "user-input",
					});
				} else {
					if (templateState.parsedYaml.hasOwnProperty("z2k_template_title")) {
						// This will override any existing "title" variable
						const segmentList = templateState.parsedYaml["z2k_template_title"];
						if (!(segmentList instanceof SegmentList)) {
							throw new TemplatePluginError("z2k_template_title yaml value must be a string");
						}
						const reducedSetSegments = Z2KTemplateEngine.parseReducedSetSegments(segmentList);
						templateState.mergedVarInfoMap.set("title", {
							varName: "title",
							promptText: "Title",
							parsedPromptText: Z2KTemplateEngine.parseReducedSetSegmentsText("Title"),
							dataType: "titleText",
							parsedDefaultValue: reducedSetSegments,
							directives: ['required'],
							valueSource: "yaml",
						});
					} else if (!templateState.mergedVarInfoMap.has("title")) {
						templateState.mergedVarInfoMap.set("title", {
							varName: "title",
							promptText: "Title",
							parsedPromptText: Z2KTemplateEngine.parseReducedSetSegmentsText("Title"),
							dataType: "titleText",
							parsedDefaultValue: Z2KTemplateEngine.parseReducedSetSegmentsText("Untitled"),
							directives: ['required'],
							valueSource: "built-in",
						});
					}
				}

				// Ensure title variable is properly configured
				const titleVarInfo = templateState.mergedVarInfoMap.get("title") as VarInfo;
				if (titleVarInfo) {
					titleVarInfo.dataType = "titleText";
					if (!titleVarInfo.promptText) {
						titleVarInfo.promptText = "Title";
					}
					if (!titleVarInfo.parsedPromptText) {
						titleVarInfo.parsedPromptText = Z2KTemplateEngine.parseReducedSetSegmentsText("Title");
					}
					if (!titleVarInfo.directives.includes("required")) {
						titleVarInfo.directives.push("required");
					}
				}
			} catch (error) {
				rethrowWithMessage(error, "Error occurred while parsing the template");
			}

			// if (jsonData) {
			// 	this.templateEngine.resolveVarsFromJSON(templateState, jsonData);
			// }
			// console.log("After parse:", JSON.stringify(templateState, null, 2));

			// Prompt user for missing variables if needed
			if (this.hasFillableFields(templateState.mergedVarInfoMap)) {
				await new Promise<void>((resolve, reject) => {
					new FieldCollectionModal(this.app, fieldCollectionModalTitle, templateState.mergedVarInfoMap, resolve, reject).open();
				});
			} else {
				new Notice("No fields to prompt for.");
			}
			// console.log("After prompt:", JSON.stringify(templateState, null, 2));

			// // Resolve any remaining missing variables with defaults
			// this.templateEngine.resolveMissText(templateState);
			// console.log("After resolveMissText:", templateState);

			// Render the template
			let title: string | undefined, content: string;
			try {
				({ title, content } = this.templateEngine.renderTemplate(templateState));
			} catch (error) {
				rethrowWithMessage(error, "Error occurred while rendering the template");
			}

			// check if the {{sourceText}} field is in the template, and if not, add it to the end of the template
			if (hadSourceTextField && inputText) {
				content += `\n\n${inputText}\n`;
			}

			const filename = title
				?.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_') // Illegal in Windows + control chars
				.replace(/^\.+$/, '_')                      // Avoid names like "." or ".."
				.replace(/[. ]+$/, '')                      // No trailing dots or spaces
				.replace(/^ +/, '')                         // No leading spaces
				|| 'Untitled';                              // Fallback if empty

			if (continueFile) {
				// If continuing an existing file, update its content
				try {
					if (continueFile.basename !== filename) {
						// Write the new contents at the new path
						let newCardPath = this.joinPath(continueFile.parent?.path as string, filename + '.md');
						let counter = 1;
						while (this.getFile(newCardPath)) {
							newCardPath = this.joinPath(continueFile.parent?.path as string, `${filename} (${counter++}).md`);
						}
						await this.app.vault.create(newCardPath, content); // Create the new file
						await this.app.vault.delete(continueFile); // Delete the old file
						await this.app.workspace.openLinkText(newCardPath, ""); // Open the new file
					} else {
						await this.app.vault.modify(continueFile, content); // Just modify the existing file
						await this.app.workspace.openLinkText(continueFile.path, ""); // Open the file if not already open
					}
				} catch (error) {
					rethrowWithMessage(error, "Error occurred while updating the existing file");
				}
			} else {
				// Create the new card
				let newCardPath: string;
				try {
					// Determine new card location
					let finalFolderPath = normalizePath((cardType as TFolder).path);
					if (this.settings.useExternalTemplates) {
						const base = normalizePath(this.settings.externalTemplatesFolder);
						if (!this.isSubPath(base, finalFolderPath)) {
							throw new TemplatePluginError(`Card type folder must be inside external templates folder`);
						}
						finalFolderPath = finalFolderPath === base ? this.settings.z2kRootFolder : this.joinPath(this.settings.z2kRootFolder, finalFolderPath.slice(base.length + 1));
					}

					// Ensure folder exists
					let folder = this.getFolder(finalFolderPath);
					if (!folder) {
						try {
							await this.app.vault.createFolder(finalFolderPath);
						} catch (err) {
							rethrowWithMessage(err, `Error creating folder "${finalFolderPath}"`);
						}
					}

					// Create the new card path (and avoid overwriting existing files)
					newCardPath = this.joinPath(finalFolderPath, filename + ".md");
					let counter = 1;
					while (this.getFile(newCardPath)) {
						newCardPath = this.joinPath(finalFolderPath, `${filename} (${counter++}).md`);
					}
					await this.app.vault.create(newCardPath, content);
				} catch (error) {
					rethrowWithMessage(error, "Error creating new file");
				}

				// Open the new file
				try {
					this.app.workspace.openLinkText(newCardPath, "");
				} catch (error) {
					rethrowWithMessage(error, "Error opening new file");
				}

				// Prompt for deletion if file was provided
				if (inputFile) {
					const shouldDelete = await new Promise<boolean>(resolve => {
						new DeleteConfirmationModal(this.app, inputFile as TFile, resolve).open();
					});
					if (shouldDelete) {
						try {
							await this.app.vault.delete(inputFile);
						} catch (error) {
							rethrowWithMessage(error, "Error deleting original file");
						}
					}
				}
			}

		} catch (error: unknown) {
			this.handleErrors(error);
		}
	}

	async insertPartialTemplate(opts: { inputText?: string } = {}) {
		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
		const file = this.app.workspace.getActiveFile();
		if (!editor || !file || file.extension !== 'md') { return; }

		try {
			// First parse the file content
			let fileContent: string;
			try {
				fileContent = await this.app.vault.read(file);
			} catch (error) {
				rethrowWithMessage(error, "Error occurred while reading the current file");
			}
			const currentState = this.templateEngine.parseTemplate(fileContent);

			// Get valid partial template types
			const cardTypes = this.getTemplatesTypes(true);
			const cardType = await new Promise<TFolder>((resolve, reject) =>
				new CardTypeSelectionModal(this.app, cardTypes, this.settings, resolve, reject).open());

			// Get templates in that type
			const templates = this.getTemplatesForType(cardType, true);
			if (templates.length === 0) throw new Error("No partial templates found in selected folder");

			// Let user pick one
			const template = await new Promise<TFile>((resolve, reject) =>
				new TemplateSelectionModal(this.app, templates, this.settings, resolve, reject).open());

			// Read and ask for fields
			const templateContent = await this.app.vault.read(template);
			const partialState = this.templateEngine.parseTemplate(templateContent);

			{ // Insert some built-in variables
				// sourceText
				partialState.mergedVarInfoMap.set("sourceText", {
					varName: "sourceText",
					dataType: "text",
					directives: ['no-prompt'],
					resolvedValue: opts.inputText || "",
					valueSource: "built-in",
				});

				// creator
				partialState.mergedVarInfoMap.set("creator", {
					varName: "creator",
					dataType: "text",
					directives: ['no-prompt'],
					resolvedValue: this.settings.creator || "",
					valueSource: "built-in",
				});

				// templateName
				partialState.mergedVarInfoMap.set("templateName", {
					varName: "templateName",
					dataType: "text",
					directives: ['no-prompt'],
					resolvedValue: template.basename,
					valueSource: "built-in",
				});

				// title
				partialState.mergedVarInfoMap.set("title", {
					varName: "title",
					dataType: "titleText",
					directives: ['no-prompt'],
					resolvedValue: file.basename,
					valueSource: "built-in",
				});
			}

			if (this.hasFillableFields(partialState.mergedVarInfoMap)) {
				await new Promise<void>((resolve, reject) =>
					new FieldCollectionModal(this.app, template.basename, partialState.mergedVarInfoMap, resolve, reject).open());
			}

			{ // Merge, render, and update text
				// 1. Render current YAML to get line count
				const { yamlString: originalYaml } = this.templateEngine.renderTemplate(currentState);
				const originalYamlLineCount = originalYaml.trim() === "" ? 0 : originalYaml.trim().split("\n").length + 2; // +2 for `---`

				// 2. Merge YAML
				Z2KTemplateEngine.deepMergeParsedYaml(currentState.parsedYaml, partialState.parsedYaml);

				// 3. Re-render after merge
				const { yamlString: mergedYaml, bodyString: mainBody } = this.templateEngine.renderTemplate(currentState);
				let { bodyString: partialBody } = this.templateEngine.renderTemplate(partialState);

				// 4. Calculate YAML line delta
				// All this stuff is to accomodate the change of position in the file because of YAML being inserted
				const mergedYamlLineCount = mergedYaml.trim() === "" ? 0 : mergedYaml.trim().split("\n").length + 2;
				console.log(`YAML line count: original=${originalYamlLineCount}, merged=${mergedYamlLineCount}`);
				const yamlLineDelta = mergedYamlLineCount - originalYamlLineCount;

				// 5. Replace selected range in mainBody by character offset
				const origFrom = editor.getCursor("from");
				const origTo = editor.getCursor("to");
				console.log(`Original selection: from=${origFrom.line}:${origFrom.ch}, to=${origTo.line}:${origTo.ch}`);
				const from: EditorPosition = {
					line: origFrom.line - originalYamlLineCount, // Adjust for YAML offset
					ch: origFrom.ch
				};
				const to: EditorPosition = {
					line: origTo.line - originalYamlLineCount,
					ch: origTo.ch
				};
				const mainLines = mainBody.split("\n");

				const before = mainLines.slice(0, from.line);
				const fromLinePrefix = mainLines[from.line]?.slice(0, from.ch) ?? "";
				if (fromLinePrefix !== "") { before.push(fromLinePrefix); }

				const after = mainLines.slice(to.line + 1);
				if (to.line < mainLines.length && mainLines[to.line]) {
					after.unshift(mainLines[to.line].slice(to.ch));
				}

				const updatedBody = [...before, ...partialBody.split("\n"), ...after].join("\n");

				// 6. Assemble full content with YAML
				let fullContent = "";
				if (mergedYaml.trim() !== "") {
					fullContent += `---\n${mergedYaml.trim()}\n---\n`;
					if (!updatedBody.startsWith("\n")) { // Put an empty line after yaml for convention
						fullContent += `\n`;
					}
				}
				fullContent += updatedBody;

				// 7. Replace full file
				editor.setValue(fullContent);

				// 8. Scroll to inserted partial
				const scrollStart: EditorPosition = {
					line: from.line + yamlLineDelta,
					ch: from.ch
				};
				const scrollEnd: EditorPosition = {
					line: scrollStart.line + partialBody.split("\n").length - 1,
					ch: partialBody.split("\n").at(-1)?.length ?? 0
				};

				editor.scrollIntoView({ from: scrollStart, to: scrollEnd });
				editor.setCursor(scrollEnd);
			}
		} catch (error: unknown) {
			this.handleErrors(error);
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
				const allTemplates = this.getMarkdownFilesRecursively(templateFolder);
				const filtered = allTemplates.filter(f => f.name.startsWith(settings.partialPrefixFilter) === partials);
				result.push(...filtered);
			}

			curr = curr.parent instanceof TFolder ? curr.parent : null;
		}

		return result;
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

	private getMarkdownFilesRecursively(folder: TFolder): TFile[] {
		let files: TFile[] = [];

		// Process all children
		folder.children.forEach(child => {
			if (child instanceof TFile && child.extension === 'md') {
				files.push(child);
			} else if (child instanceof TFolder) {
				files = files.concat(this.getMarkdownFilesRecursively(child));
			}
		});

		return files;
	}

	private hasFillableFields(mergedVarInfoMap: Map<string, VarInfo>): boolean {
		for (const varInfo of mergedVarInfoMap.values()) {
			if (!varInfo.directives.includes("no-prompt")) { return true; }
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
	const [selectedTemplate, setSelectedTemplate] = useState<TFile | null>(null);
	const [selectedIndex, setSelectedIndex] = useState<number>(-1);
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
		setSelectedIndex(-1); // Reset selection when search changes
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
			setSelectedTemplate(filteredTemplates[newIndex]);
			scrollToItem(newIndex);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const newIndex = Math.max(selectedIndex - 1, -1);
			setSelectedIndex(newIndex);
			setSelectedTemplate(newIndex >= 0 ? filteredTemplates[newIndex] : null);
			scrollToItem(newIndex);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (selectedTemplate) {
				onConfirm(selectedTemplate);
			}
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

	const handleTemplateClick = (template: TFile, index: number) => {
		setSelectedTemplate(template);
		setSelectedIndex(index);
	};

	const handleTemplateDoubleClick = (template: TFile) => {
		setSelectedTemplate(template);
		onConfirm(template);
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
							onClick={() => handleTemplateClick(template, index)}
							onDoubleClick={() => handleTemplateDoubleClick(template)}
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
					onClick={() => onConfirm(selectedTemplate as TFile)}
					disabled={!selectedTemplate}
				>
					Select Template
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
	varInfoMap: Map<string, VarInfo>;
	resolve: () => void;
	reject: (error: Error) => void;
	root: any; // React root

	constructor(app: App, title: string, varInfoMap: Map<string, VarInfo>, resolve: () => void, reject: (error: Error) => void) {
		super(app);
		this.title = title;
		this.varInfoMap = varInfoMap;
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
				varInfoMap={this.varInfoMap}
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
	varInfoMap: Map<string, VarInfo>;
	onComplete: () => void;
	onCancel: () => void;
}
// This component assumes that varInfoMap will not be changing.
const FieldCollectionForm = ({ varInfoMap, onComplete, onCancel }: FieldCollectionFormProps) => {
	function computeInitialFieldStates(): Record<string, FieldState> {
		const initialFieldStates: Record<string, FieldState> = {};

		// Initialize field states with metadata
		for (const [fieldName, varInfo] of varInfoMap.entries()) {

			function getJustFieldReferences(segments: ReducedSetSegment[] | undefined): string[] {
				if (!segments) return [];
				return segments
					.filter(segment => segment.type === 'fieldReference')
					.map(segment => segment.content);
			}
			// Get dependencies from prompt text, default value, and miss text
			const dependencies = [
				...getJustFieldReferences(varInfo.parsedPromptText),
				...getJustFieldReferences(varInfo.parsedDefaultValue),
				...getJustFieldReferences(varInfo.parsedMissText)
			];

			// Set initial field state
			initialFieldStates[fieldName] = {
				value: varInfo.resolvedValue ?? varInfo.defaultValue ?? '',
				alreadyResolved: varInfo.resolvedValue !== undefined,
				omitFromForm: varInfo.directives.includes('no-prompt'),
				touched: false,
				focused: false,
				hasError: false,
				dependencies: [...new Set(dependencies)],
				dependentFields: [],
				resolvedPromptText: varInfo.promptText ?? fieldName,
				resolvedDefaultValue: varInfo.defaultValue ?? '',
				resolvedMissText: varInfo.missText ?? ''
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
			const varInfo = varInfoMap.get(fieldName);
			return varInfo && varInfo.directives.includes('required');
		});
		const optionalFields = renderOrderFieldNames.filter(fieldName => {
			const varInfo = varInfoMap.get(fieldName);
			return varInfo && !varInfo.directives.includes('required');
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
			const varInfo = varInfoMap.get(fieldName);
			if (!varInfo) {continue;}

			let context = {
				...Object.fromEntries(Object.entries(newFieldStates).map(
					([name, state]) => [name, { value: state.value, dataType: varInfoMap.get(name)?.dataType ?? 'text'}])),
			};

			// Update all resolved text fields
			newFieldStates[fieldName].resolvedPromptText = Z2KTemplateEngine.renderReducedSetText(varInfo.parsedPromptText, context);
			newFieldStates[fieldName].resolvedDefaultValue = Z2KTemplateEngine.renderReducedSetText(varInfo.parsedDefaultValue, context);
			newFieldStates[fieldName].resolvedMissText = Z2KTemplateEngine.renderReducedSetText(varInfo.parsedMissText, context);

			if (!newFieldStates[fieldName].alreadyResolved && !newFieldStates[fieldName].touched) {
				newFieldStates[fieldName].value = newFieldStates[fieldName].resolvedDefaultValue;
			}
			if (reEvalValues) {
				// Go ahead and parse and render any values regardless. This
				if (typeof(newFieldStates[fieldName].value) === 'string') {
					let parsedValue = Z2KTemplateEngine.parseReducedSetSegmentsText(newFieldStates[fieldName].value as string);
					newFieldStates[fieldName].value = Z2KTemplateEngine.renderReducedSetText(parsedValue, context);
				}
			}
		}
	}

	function	validateAllFields(newFieldStates: Record<string, FieldState>): boolean {
		let isValid: boolean = true;
		for (const fieldName of Object.keys(newFieldStates)) {
			const varInfo = varInfoMap.get(fieldName);
			if (!varInfo) {
				console.error(`Field ${fieldName} not found in varInfoMap`);
				return true; // Skip validation if field not found
			}

			const value = fieldStates[fieldName].value;
			let hasError = false;
			let errorMessage = '';

			// Basic validation based on field type
			if (varInfo.dataType === 'number' && isNaN(Number(value))) {
				hasError = true;
				errorMessage = 'Please enter a valid number';
			} else if (value === '' && varInfo.directives.includes('required')) {
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

	function handleSubmit(e: React.FormEvent, finalize: boolean = false) {
		e.preventDefault();

		// Abort if there are errors
		let isValid = validateAllFields(fieldStates);
		if (!isValid) {
			scrollToFirstError();
			return;
		}

		// Update varInfoMap with resolved values
		for (const fieldName of dependencyOrderedFieldNames) {
			const varInfo = varInfoMap.get(fieldName);
			if (!varInfo) { continue; }
			if (fieldStates[fieldName].alreadyResolved || fieldStates[fieldName].touched || fieldName === 'title') {
				varInfo.resolvedValue = fieldStates[fieldName].value;
				varInfo.valueSource = 'user-input';
			} else {
				// Left untouched, use miss value if finalizing
				if (finalize) {
					varInfo.resolvedValue = fieldStates[fieldName].resolvedMissText || '';
					varInfo.valueSource = 'miss';
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
		const varInfo = varInfoMap.get(fieldName);
		const fieldState = fieldStates[fieldName];

		if (!varInfo || !fieldState) return null;

		return (
			<div key={fieldName} className={`field-container ${
				fieldState.hasError ? 'has-error' : (fieldState.touched ? 'touched' : '')
			}`}>
				<FieldInput
					name={fieldName}
					label={fieldState.resolvedPromptText || fieldName}
					varInfo={varInfo}
					fieldState={fieldState}
					onChange={(value) => handleFieldChange(fieldName, value)}
					onFocus={() => handleFieldFocus(fieldName)}
					onBlur={() => handleFieldBlur(fieldName)}
				/>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="field-collection-form">
			{varInfoMap.has('title') && fieldStates['title']?.omitFromForm !== true && (
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
	resolvedPromptText?: string; // Prompt text with references resolved
	resolvedDefaultValue?: string; // Default value with references resolved
	resolvedMissText?: string; // Miss text with references resolved
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
	varInfo: VarInfo;
	fieldState: FieldState;
	onChange: (value: any) => void;
	onFocus: () => void;
	onBlur: () => void;
}

const FieldInput = ({ name, label, varInfo, fieldState, onChange, onFocus, onBlur }: FieldInputProps) => {
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
		const dataType = varInfo.dataType || 'text';

		switch(dataType) {
			case 'titleText':
				return (
					<input
						type="text"
						className={`title-text-input ${fieldState.hasError ? 'has-error' : ''}`}
						value={fieldState.value?.toString() || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={fieldState.resolvedDefaultValue}
						{...commonProps}
					/>
				);

			case 'text':
				return (
					<textarea
						className={`text-input ${fieldState.hasError ? 'has-error' : ''}`}
						value={fieldState.value?.toString() || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={fieldState.resolvedDefaultValue}
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
						placeholder={fieldState.resolvedDefaultValue}
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
						{varInfo.options?.map((option) => (
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
						{varInfo.options?.map((option) => (
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
		finalText += varInfo.directives.length > 0 ? `\nDirectives: ${varInfo.directives.join(', ')}` : '';
		finalText += fieldState.dependencies.length > 0 ? `\nDepends on: ${fieldState.dependencies.join(', ')}` : '';
		finalText += fieldState.dependentFields.length > 0 ? `\nUsed by: ${fieldState.dependentFields.join(', ')}` : '';
		return finalText;
	}

	function renderMissTextPreview() {
		if (fieldState.resolvedMissText && !fieldState.touched) {
			return (
				<div className="miss-text-preview">
					Default if left untouched:<br/><span>{fieldState.resolvedMissText}</span>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="field-input">
			{/* Don't show label twice for checkboxes */}
			{varInfo.dataType !== 'boolean' && <label htmlFor={inputId} title={generateHoverText()}>{label}</label>}
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
