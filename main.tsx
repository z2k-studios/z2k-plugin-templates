
// TODO: Add error handling for errors within react components by using React Error Boundaries

import { App, Plugin, Modal, Notice, TFolder, TFile, PluginSettingTab, Setting } from 'obsidian';
import { Z2KTemplateEngine, TemplateState, VarInfo, PromptTextSegment, TemplateError } from 'z2k-template-engine';
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

interface Z2KPluginSettings {
	z2kRootFolder: string;
	useExternalTemplates: boolean;
	embeddedTemplatesFolderName: string;
	externalTemplatesFolder: string;
	blockPrefixFilter: string;
}

const DEFAULT_SETTINGS: Z2KPluginSettings = {
	z2kRootFolder: '/Z2K',
	useExternalTemplates: false,
	embeddedTemplatesFolderName: 'Templates',
	externalTemplatesFolder: '/Templates-External',
	blockPrefixFilter: 'Block - ',
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
					.setPlaceholder(DEFAULT_SETTINGS.blockPrefixFilter)
					.setValue(this.plugin.settings.blockPrefixFilter)
					.inputEl;

				this.validateTextInput(input,
					(value) => {
						if (!value.trim()) { return "Prefix cannot be empty"; }
						if (/[*?"<>|:./\\]/.test(value)) { return "Invalid characters in prefix"; }
						return null;
					},
					async (validValue) => {
						this.plugin.settings.blockPrefixFilter = validValue;
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
		this.templateEngine = new Z2KTemplateEngine(true);
		this.registerCommands();
		this.addSettingTab(new Z2KSettingTab(this.app, this));
	}
	onunload() {}

	registerCommands() {
		// Command palette commands
		this.addCommand({
			id: 'z2k-create-new-card',
			name: 'Create new card from template',
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
						.setIcon("document-plus")
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

		// Context menu version of 'convert file to card'
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				// Only show option for markdown files
				if (!(file instanceof TFile) || file.extension !== 'md') return;

				menu.addItem((item) => {
					item.setTitle("Z2K: Convert to card...")
						.setIcon("document-plus")
						.onClick(() => {
							this.createOrContinueCard({inputFile: file});
						});
				});
			})
		);

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

		// Context menu 'continue card creation' when a file is active
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				if (!(file instanceof TFile) || file.extension !== 'md') return;

				menu.addItem((item) => {
					item.setTitle("Z2K: Continue filling card...")
						.setIcon("document-plus")
						.onClick(() => {
							this.createOrContinueCard({ continueFile: file as TFile });
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
			if (continueFile) {
				// If continuing from an existing file, just read its content
				fieldCollectionModalTitle = continueFile.basename;
				try {
					inputContent = await this.app.vault.read(continueFile);
				} catch (error) {
					rethrowWithMessage(error, "Error occurred while reading the file to continue from");
				}
			} else {
				// Prompt for card type (the folder containing the desired template)
				const cardTypes = this.getTemplatesTypes();
				cardType = await new Promise<TFolder>((resolve, reject) =>
					new CardTypeSelectionModal(this.app, cardTypes, this.settings, resolve, reject).open()
				);

				// Get template using TemplateSelectionModal modal (the template file)
				const templates = this.getTemplatesForType(cardType);
				const template = await new Promise<TFile>((resolve, reject) => {
					new TemplateSelectionModal(this.app, templates, resolve, reject).open();
				});
				fieldCollectionModalTitle = template.basename;

				// Get template
				try {
					inputContent = await this.app.vault.read(template);
				} catch (error) {
					rethrowWithMessage(error, "Error occurred while reading the template");
				}
			}

			// Parse the template
			let templateState: TemplateState;
			try {
				templateState = this.templateEngine.parseTemplate(inputContent);
			} catch (error) {
				rethrowWithMessage(error, "Error occurred while parsing the template");
			}

			// if (jsonData) {
			// 	this.templateEngine.resolveVarsFromJSON(templateState, jsonData);
			// }
			// console.log("After parse:", JSON.stringify(templateState, null, 2));

			// Resolve built-in variables
			try {
				this.templateEngine.resolveBuiltInVars(templateState);
			} catch (error) {
				rethrowWithMessage(error, "Error occurred while resolving built-in variables");
			}

			// Prompt user for missing variables if needed
			if (templateState.mergedVarInfoMap.size > 0) {
				await new Promise<void>((resolve, reject) => {
					new FieldCollectionModal(this.app, fieldCollectionModalTitle, templateState.mergedVarInfoMap, resolve, reject).open();
				});
			}
			// console.log("After prompt:", JSON.stringify(templateState, null, 2));

			// // Resolve any remaining missing variables with defaults
			// this.templateEngine.resolveMissText(templateState);
			// console.log("After resolveMissText:", templateState);

			// Render the template
			let title: string, content: string;
			try {
				({ title, content } = this.templateEngine.renderTemplate(templateState));
				if (inputText) {
					// Append existing text if provided
					content = `${content}\n\n---\n\n${inputText}`;
				}
			} catch (error) {
				rethrowWithMessage(error, "Error occurred while rendering the template");
			}

			if (continueFile) {
				// If continuing an existing file, update its content
				try {
					await this.app.vault.modify(continueFile, content);
					await this.app.workspace.openLinkText(continueFile.path, continueFile.path);
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
							throw new NewCardPluginError(`Card type folder must be inside external templates folder`);
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

					const filename = title
						.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_') // Illegal in Windows + control chars
						.replace(/^\.+$/, '_')                      // Avoid names like "." or ".."
						.replace(/[. ]+$/, '')                      // No trailing dots or spaces
						.replace(/^ +/, '')                         // No leading spaces
						|| 'Untitled';                              // Fallback if empty

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
					this.app.workspace.openLinkText(newCardPath, newCardPath);
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
			// Display error messages to the user
			if (error instanceof NewCardPluginError) {
				console.error("NewCardPluginError: ", error.message);
				new ErrorModal(this.app, error).open();
			} else if (error instanceof UserCancelError) {
				// Just exit, no need to show a message
				// console.log("User cancelled the operation.");
			} else if (error instanceof TemplateError) {
				console.error("Template error: ", error.message);
				new ErrorModal(this.app, error).open();
			} else {
				console.error("Unexpected error: ", error);
				new ErrorModal(this.app, new NewCardPluginError("An unexpected error occurred", error)).open();
			}
		}
	}

	private getTemplatesTypes(): TFolder[] {
		const folders: TFolder[] = [];

		const rootPath = normalizePath(this.settings.z2kRootFolder);
		const root = rootPath
			? this.app.vault.getAbstractFileByPath(rootPath)
			: this.app.vault.getRoot();
		if (!(root instanceof TFolder)) {
			throw new NewCardPluginError(`Could not find Z2K root folder "${this.settings.z2kRootFolder}"`);
		}

		if (this.settings.useExternalTemplates) {
			const externalPath = normalizePath(this.settings.externalTemplatesFolder);
			const external = externalPath
				? this.app.vault.getAbstractFileByPath(externalPath)
				: this.app.vault.getRoot();
			if (!(external instanceof TFolder)) {
				throw new NewCardPluginError(`Could not find external templates folder "${this.settings.externalTemplatesFolder}"`);
			}

			const recurse = (folder: TFolder) => {
				folders.push(folder);
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
						folders.push(folder); // Parent of matching template folder
					} else {
						recurse(child);
					}
				}
			};
			recurse(root);
		}

		return folders.sort((a, b) => a.path.localeCompare(b.path));
	}

	private getTemplatesForType(cardType: TFolder): TFile[] {
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
				result.push(...this.getMarkdownFilesRecursively(templateFolder));
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

class NewCardPluginError extends Error {
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
		this.name = "NewCardPluginError";
		this.userMessage = userMessage;
		this.cause = cause;
	}
}

function rethrowWithMessage(error: unknown, message: string): never {
	if (error instanceof NewCardPluginError || error instanceof UserCancelError || error instanceof TemplateError) {
		throw error; // Don't modify the error
	} else {
		throw new NewCardPluginError(message, error);
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
	resolve: (template: TFile) => void;
	reject: (error: Error) => void;
	root: any; // For React root

	constructor(app: App, templates: TFile[], resolve: (template: TFile) => void, reject: (error: Error) => void){
		super(app);
		this.templates = templates;
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
	onConfirm: (template: TFile) => void;
	onCancel: () => void;
}

// React component for the modal content
const TemplateSelector = ({ templates, onConfirm, onCancel }: TemplateSelectorProps) => {
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [filteredTemplates, setFilteredTemplates] = useState<TFile[]>(templates);
	const [selectedTemplate, setSelectedTemplate] = useState<TFile | null>(null);
	const [selectedIndex, setSelectedIndex] = useState<number>(-1);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	// Filter templates when search term changes
	useEffect(() => {
		const filtered = templates.filter((template: TFile) => {
			const nameMatch = template.basename.toLowerCase().includes(searchTerm.toLowerCase());
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
							<span className="selection-primary">{template.basename}</span>
							<span className="selection-secondary">{template.parent?.path || ''}</span>
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

			function getJustFieldReferences(segments: PromptTextSegment[] | undefined): string[] {
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
				value: varInfo.resolvedValue || varInfo.defaultValue || '',
				omitFromForm: varInfo.resolvedValue !== undefined || varInfo.directives.includes('no-prompt'),
				touched: false,
				focused: false,
				hasError: false,
				dependencies: [...new Set(dependencies)],
				dependentFields: [],
				resolvedPromptText: varInfo.promptText || fieldName,
				resolvedDefaultValue: varInfo.defaultValue || '',
				resolvedMissText: varInfo.missText || ''
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

		// Always put the title at the top
		const titleIndex = renderOrderFieldNames.indexOf('title');
		if (titleIndex > -1) {
			renderOrderFieldNames.unshift(renderOrderFieldNames.splice(titleIndex, 1)[0]);
		}
		return renderOrderFieldNames;
	}

	// State variables (definition order is important here)
	const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>(computeInitialFieldStates());
	const [dependencyOrderedFieldNames] = useState<string[]>(() => calculateFieldDependencyOrder(fieldStates));
	const [renderOrderFieldNames] = useState<string[]>(() => computeInitialRenderOrderFieldNames());
	// Update fields after the first render to distribute and apply dependencies
	useEffect(() => {
		let newFieldStates = {...fieldStates};
		updateFieldStates(newFieldStates);
		validateAllFields(newFieldStates);
		setFieldStates(newFieldStates);
	}, []);

	function updateFieldStates(newFieldStates: Record<string, FieldState>) {
		for (const fieldName of dependencyOrderedFieldNames) { // dependencyOrderedFieldNames ensures dependencies are resolved first
			const varInfo = varInfoMap.get(fieldName);
			if (!varInfo) continue;

			// Helper function to resolve text segments
			const resolveSegments = (segments?: PromptTextSegment[]): string => {
				if (!segments) return '';
				return segments.map(segment => {
					if (segment.type === 'text') return segment.content;
					// Replace field references with their current values
					// 	(if the field doesn't exist, just return blank)
					let currValue = newFieldStates[segment.content]?.value?.toString();
					return currValue ? currValue : "{{" + segment.content + "}}";
				}).join('');
			};

			// Update all resolved text fields
			newFieldStates[fieldName].resolvedPromptText = resolveSegments(varInfo.parsedPromptText);
			newFieldStates[fieldName].resolvedDefaultValue = resolveSegments(varInfo.parsedDefaultValue);
			newFieldStates[fieldName].resolvedMissText = resolveSegments(varInfo.parsedMissText);

			if (!newFieldStates[fieldName].touched) {
				newFieldStates[fieldName].value = newFieldStates[fieldName].resolvedDefaultValue;
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
		updateFieldStates(newFieldStates);
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
			if (fieldStates[fieldName].touched) {
				let value = fieldStates[fieldName].value;
				// Convert arrays to comma-separated strings for multiSelect
				if (Array.isArray(value)) {
					value = value.join(", ");
				}
				varInfo.resolvedValue = value;
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

	return (
		<form onSubmit={handleSubmit} className="field-collection-form">
			<div className="field-list">
				{renderOrderFieldNames.map(fieldName => {
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
				})}
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
	value: undefined | string | number | string[];
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
	// order based on the dependency tree
	// if a field has dependencies, it should come after its dependencies
	// so go through each field and check its dependencies,
	//   if its dependencies are below it in the list,
	//   move it down until all dependencies are above it
	// keep iterating until no more moves are needed
	// return the ordered list of field names
	const orderedFields: string[] = [...Object.keys(fieldStates)];

	let madeChange = true;
	while (madeChange) {
		madeChange = false;
		for (const fieldName of Object.keys(fieldStates)) {
			const fieldState = fieldStates[fieldName];
			if (!fieldState) continue;

			let insertIndex = orderedFields.length;
			for (const dependency of fieldState.dependencies) {
				const dependencyIndex = orderedFields.indexOf(dependency);
				if (dependencyIndex !== -1 && dependencyIndex < insertIndex) {
					insertIndex = dependencyIndex;
				}
			}
			if (insertIndex < orderedFields.indexOf(fieldName)) {
				// Move the field down to its correct position
				orderedFields.splice(orderedFields.indexOf(fieldName), 1);
				orderedFields.splice(insertIndex, 0, fieldName);
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
							const num = e.target.valueAsNumber;
							onChange(isNaN(num) ? null : num);
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
						value={fieldState.value?.toString() || ''}
						onChange={(e) => onChange(e.target.value)}
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
						<label htmlFor={inputId} className="checkbox-label" title={generateTitle()}>{label}</label>
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
				const selectedValues = Array.isArray(fieldState.value)
					? fieldState.value
					: fieldState.value ? [fieldState.value] : [];

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
											? [...selectedValues, option]
											: selectedValues.filter(val => val !== option);
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

	function generateTitle() {
		const hasDependencies = fieldState.dependencies.length > 0;
		const isDependedOn = fieldState.dependentFields.length > 0;
		const nameText = `Field name: ${name}`;
		const dependencyText = hasDependencies ? `Depends on: ${fieldState.dependencies.join(', ')}` : '';
		const dependencyText2 = isDependedOn ? `Used by: ${fieldState.dependentFields.join(', ')}` : '';
		return `${nameText}\n${dependencyText}\n${dependencyText2}`;
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
			{varInfo.dataType !== 'boolean' && <label htmlFor={inputId} title={generateTitle()}>{label}</label>}
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
