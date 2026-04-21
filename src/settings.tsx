import { App, Plugin, Modal, Notice, PluginSettingTab, Setting, ToggleComponent } from 'obsidian';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Z2KTemplatesPluginSettings, DEFAULT_SETTINGS, DOCS_BASE_URL, cardRefNameUpper, cardRefNameLower, cardRefNameUpperPlural, cardRefNameLowerPlural, parseDuration } from './utils';
import moment from 'moment';
import type Z2KTemplatesPlugin from './main';
import { EditorModal } from './modals/editor-modals';
import { QuickCommandsModal } from './modals/editor-modals';
import { LogViewerModal, ConfirmationModal } from './modals/simple-modals';

export class Z2KTemplatesSettingTab extends PluginSettingTab {
	plugin: Z2KTemplatesPlugin;
	private refs = {
		descTemplatesRootFolder: null as Setting | null,
		descTemplatesFolderName: null as Setting | null,
	}

	constructor(app: App, plugin: Z2KTemplatesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	private applyDescs() {
		this.refs.descTemplatesRootFolder?.setDesc(createFragment(f => {
			f.appendText(`Folder where the ${cardRefNameLowerPlural(this.plugin.settings)} will be created (root of the ${cardRefNameLower(this.plugin.settings)} type folders). Leave empty to use vault root. `);
			f.createEl('a', {
				text: '(?)',
				href: `${DOCS_BASE_URL}/settings-page/general-settings/templates-root-folder`,
			});
		}));
		this.refs.descTemplatesFolderName?.setDesc(createFragment(f => {
			f.appendText(`Any ${cardRefNameLowerPlural(this.plugin.settings)} within folders of this name will show up as templates `)
			f.createEl('a', {
				text: '(?)',
				href: `${DOCS_BASE_URL}/settings-page/general-settings/templates-folder-name`,
			});
		}));
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		containerEl.addClass('z2k-settings');
		// --- General ---
		const generalGroup = containerEl.createDiv({ cls: 'setting-group' });
		new Setting(generalGroup).setHeading().setName('General');
		const generalItems = generalGroup.createDiv({ cls: 'setting-items' });

		this.refs.descTemplatesRootFolder = new Setting(generalItems)
			.setName('Templates root folder')
			.setDesc('') // Description is set dynamically
			.setClass('setting-full-width')
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
		new Setting(generalItems)
			.setName('Creator name')
			.setDesc(createFragment(f => {
				f.appendText(`Name to use for the built-in {{creator}} fields `)
				f.createEl('a', {
					text: '(?)',
					href: `${DOCS_BASE_URL}/settings-page/general-settings/creator-name`,
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
		this.refs.descTemplatesFolderName = new Setting(generalItems)
			.setName('Templates folder name')
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
		new Setting(generalItems)
			.setName('Name for files')
			.setDesc(createFragment(f => {
				f.appendText("This is the name to use when referring to files in the system. ('note', 'card', 'file', etc.) ");
				f.createEl('a', {
					text: '(?)',
					href: `${DOCS_BASE_URL}/settings-page/general-settings/name-for-files`,
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

		// --- Command Queue ---
		const queueGroup = containerEl.createDiv({ cls: 'setting-group' });
		new Setting(queueGroup).setHeading().setName('Command Queue');
		const queueItems = queueGroup.createDiv({ cls: 'setting-items' });

		const queueSubSettings: Setting[] = [];
		const toggleQueueSettings = (show: boolean) => {
			for (const s of queueSubSettings) { s.settingEl.toggle(show); }
		};

		new Setting(queueItems)
			.setName('Enable command queue')
			.setDesc(createFragment(f => {
				f.appendText('Process queued JSON command files automatically. ');
				f.createEl('a', {
					text: '(?)',
					href: `${DOCS_BASE_URL}/settings-page/command-queue-settings/enable-command-queue`,
				});
			}))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.offlineCommandQueueEnabled)
				.onChange(async (value) => {
					this.plugin.settings.offlineCommandQueueEnabled = value;
					await this.plugin.saveData(this.plugin.settings);
					toggleQueueSettings(value);
				}));

		queueSubSettings.push(new Setting(queueItems)
			.setName('Queue folder')
			.setDesc(createFragment(f => {
				f.appendText('Folder for queued command files (JSON/JSONL) - vault-relative or absolute. ');
				f.createEl('a', {
					text: '(?)',
					href: `${DOCS_BASE_URL}/settings-page/command-queue-settings/queue-folder-settings`,
				});
			}))
			.setClass('setting-full-width')
			.addText(text => {
				const input = text
					.setValue(this.plugin.settings.offlineCommandQueueDir)
					.inputEl;
				this.validateTextInput(input,
					(value) => {
						if (value && /[*?"<>|]/.test(value)) { return "Invalid characters in file path"; }
						return null;
					},
					async (validValue) => {
						await this.plugin.updateQueueDirPath(validValue);
					});
			}));

		queueSubSettings.push(new Setting(queueItems)
			.setName('Scan frequency')
			.setDesc(createFragment(f => {
				f.appendText('How often to scan for new commands. Blank = manual only. ');
				f.createEl('a', {
					text: '(?)',
					href: `${DOCS_BASE_URL}/settings-page/command-queue-settings/scan-frequency`,
				});
			}))
			.addText(text => {
				const input = text
					.setValue(this.plugin.settings.offlineCommandQueueFrequency)
					.inputEl;
				this.validateTextInput(input,
					(value) => {
						const trimmed = value.trim();
						if (trimmed === '') return null; // Blank = manual only
						try {
							const ms = parseDuration(trimmed);
							if (ms < 5000) return "Minimum is 5 seconds";
							return null;
						} catch (e: any) {
							return e.message;
						}
					},
					async (validValue) => {
						this.plugin.settings.offlineCommandQueueFrequency = validValue;
						await this.plugin.saveData(this.plugin.settings);
					});
			}));

		queueSubSettings.push(new Setting(queueItems)
			.setName('Pause between commands')
			.setDesc(createFragment(f => {
				f.appendText('Delay between processing each command. Blank = no pause. ');
				f.createEl('a', {
					text: '(?)',
					href: `${DOCS_BASE_URL}/settings-page/command-queue-settings/pause-between-commands`,
				});
			}))
			.addText(text => {
				const input = text
					.setValue(this.plugin.settings.offlineCommandQueuePause)
					.inputEl;
				this.validateTextInput(input,
					(value) => {
						const trimmed = value.trim();
						if (trimmed === '') return null; // Blank = no pause
						try {
							parseDuration(trimmed);
							return null;
						} catch (e: any) {
							return e.message;
						}
					},
					async (validValue) => {
						this.plugin.settings.offlineCommandQueuePause = validValue;
						await this.plugin.saveData(this.plugin.settings);
					});
			}));

		queueSubSettings.push(new Setting(queueItems)
			.setName('Archive duration')
			.setDesc(createFragment(f => {
				f.appendText('How long to keep processed files. Blank = delete immediately. ');
				f.createEl('a', {
					text: '(?)',
					href: `${DOCS_BASE_URL}/settings-page/command-queue-settings/archive-duration`,
				});
			}))
			.addText(text => {
				const input = text
					.setValue(this.plugin.settings.offlineCommandQueueArchiveDuration)
					.inputEl;
				this.validateTextInput(input,
					(value) => {
						const trimmed = value.trim();
						if (trimmed === '') return null; // Blank = delete immediately
						try {
							parseDuration(trimmed);
							return null;
						} catch (e: any) {
							return e.message;
						}
					},
					async (validValue) => {
						this.plugin.settings.offlineCommandQueueArchiveDuration = validValue;
						await this.plugin.saveData(this.plugin.settings);
					});
			}));

		toggleQueueSettings(this.plugin.settings.offlineCommandQueueEnabled);

		// --- Error Logging ---
		const errorGroup = containerEl.createDiv({ cls: 'setting-group' });
		new Setting(errorGroup).setHeading().setName('Error Logging');
		const errorItems = errorGroup.createDiv({ cls: 'setting-items' });

		// Log path setting removed from UI — uses default path in plugin folder.
		// new Setting(errorItems)
		// 	.setName('Error log file')
		// 	.setDesc('Path to error log file (vault-relative or absolute).')
		// 	.setClass('setting-full-width')
		// 	.addText(text => {
		// 		const input = text
		// 			.setValue(this.plugin.settings.errorLogPath)
		// 			.inputEl;
		//
		// 		this.validateTextInput(input,
		// 			(value) => {
		// 				if (value && /[*?"<>|]/.test(value)) { return "Invalid characters in file path"; }
		// 				return null;
		// 			},
		// 			async (validValue) => {
		// 				this.plugin.settings.errorLogPath = validValue;
		// 				await this.plugin.saveData(this.plugin.settings);
		// 			});
		// 	});

		new Setting(errorItems)
			.setName('Error log level')
			.setDesc(createFragment(f => {
				f.appendText('Minimum severity level to log. "none" disables logging, "error" logs only errors, "warn" includes warnings, "info" includes informational messages, "debug" logs everything. ');
				f.createEl('a', {
					text: '(?)',
					href: `${DOCS_BASE_URL}/settings-page/error-logging-settings/error-log-level`,
				});
			}))
			.addDropdown(dropdown => dropdown
				.addOption('none', 'None')
				.addOption('error', 'Error')
				.addOption('warn', 'Warning')
				.addOption('info', 'Info')
				.addOption('debug', 'Debug')
				.setValue(this.plugin.settings.errorLogLevel)
				.onChange(async (value) => {
					this.plugin.settings.errorLogLevel = value as "none" | "error" | "warn" | "info" | "debug";
					await this.plugin.saveData(this.plugin.settings);
				}));

		new Setting(errorItems)
			.setName('Error log')
			.setDesc(createFragment(f => {
				f.appendText('View the error log file. ');
				f.createEl('a', {
					text: '(?)',
					href: `${DOCS_BASE_URL}/settings-page/error-logging-settings/view-error-log`,
				});
			}))
			.addButton(button => button
				.setButtonText('View Error Log')
				.onClick(() => {
					new LogViewerModal(this.app, {
						title: 'Error Log',
						logPath: this.plugin.settings.errorLogPath,
						emptyMessage: 'No log entries yet.',
						onClear: () => this.plugin.errorLogger.clearLog(),
					}).open();
				}));

		// --- Quick Commands ---
		const quickGroup = containerEl.createDiv({ cls: 'setting-group' });
		new Setting(quickGroup).setHeading().setName('Quick Commands');
		const quickItems = quickGroup.createDiv({ cls: 'setting-items' });

		new Setting(quickItems)
			.setName('Quick commands')
			.setDesc(createFragment(f => {
				f.appendText('Commands for quickly creating files or inserting blocks from the command palette. ');
				f.createEl('a', {
					text: '(?)',
					href: `${DOCS_BASE_URL}/settings-page/quick-commands-settings/edit-quick-commands`,
				});
			}))
			.addButton(button => button
				.setButtonText('Edit Quick Commands')
				.onClick(() => {
					new QuickCommandsModal(this.app, this.plugin).open();
				})
			);

		// --- Advanced ---
		const advancedGroup = containerEl.createDiv({ cls: 'setting-group' });
		new Setting(advancedGroup).setHeading().setName('Advanced');
		const advancedItems = advancedGroup.createDiv({ cls: 'setting-items' });

		let visibilityToggle: ToggleComponent | null = null;
		let visibilitySetting: Setting;

		new Setting(advancedItems)
			.setName('Use template file extensions')
			.setDesc(createFragment(f => {
				f.appendText('Use .template and .block file extensions to hide template files from Obsidian. ');
				f.createEl('a', {
					text: '(?)',
					href: `${DOCS_BASE_URL}/settings-page/advanced-settings/file-extension-settings/use-template-file-extensions`,
				});
			}))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useTemplateFileExtensions)
				.onChange(async (value) => {
					if (!value && this.plugin.settings.useTemplateFileExtensions) {
						// Turning OFF - check if there are any .template or .block files first
						const files = this.app.vault.getFiles();
						const templateFiles = files.filter(f => f.extension === 'template' || f.extension === 'block');
						if (templateFiles.length > 0) {
							// Show warning only if template files exist
							const confirmed = await new Promise<boolean>((resolve) => {
								new ConfirmationModal(this.app, {
									title: 'Disable Template File Extensions?',
									message: <>
										<p>We recommend that you convert your existing .template and .block files back to markdown before disabling Template File Extensions.</p>
										<p>If you do not convert them to markdown, then these templates will not be easily accessible inside Obsidian for updates and changes.</p>
										<p><a href={`${DOCS_BASE_URL}/settings-page/advanced-settings/file-extension-settings/use-template-file-extensions`} target="_blank">See docs for more details.</a></p>
									</>,
									confirmText: 'Disable Anyway',
									cancelText: 'Cancel',
								}, resolve).open();
							});
							if (!confirmed) {
								toggle.setValue(true); // Revert toggle
								return;
							}
						}
						// Also hide template files when disabling the feature
						await this.plugin.setTemplateExtensionsVisible(false);
						visibilityToggle?.setValue(false);
					}
					this.plugin.settings.useTemplateFileExtensions = value;
					await this.plugin.saveData(this.plugin.settings);
					this.plugin.queueRefreshCommands();
					visibilitySetting.settingEl.toggle(value);
				}));

		visibilitySetting = new Setting(advancedItems)
			.setName('Template files visible in file explorer')
			.setDesc(createFragment(f => {
				f.appendText('When off, .template and .block files are hidden from the file explorer. ');
				f.createEl('a', {
					text: '(?)',
					href: `${DOCS_BASE_URL}/settings-page/advanced-settings/file-extension-settings/template-files-visible-in-file-explorer`,
				});
			}))
			.addToggle(toggle => {
				visibilityToggle = toggle;
				toggle.setValue(this.plugin.settings.templateExtensionsVisible)
					.onChange(async (value) => {
						await this.plugin.setTemplateExtensionsVisible(value);
					});
			});
		visibilitySetting.settingEl.toggle(this.plugin.settings.useTemplateFileExtensions);

		new Setting(advancedItems)
			.setName('Global block')
			.setDesc(createFragment(f => {
				f.appendText('Template content prepended to every template in this vault before rendering. Field declarations here can be overridden by system blocks or the template itself. ');
				f.createEl('a', {
					text: '(?)',
					href: `${DOCS_BASE_URL}/settings-page/advanced-settings/global-block-settings/global-block-editor`,
				});
			}))
			.addButton(button => button
				.setButtonText('Edit Global Block')
				.onClick(() => {
					new EditorModal(this.app, {
						title: 'Edit Global Block',
						initialContent: this.plugin.settings.globalBlock,
						language: 'handlebars',
						helpText: `The global block works like a system block but applies to all templates
in this vault. Content here is prepended to every template before rendering.

Use it for:
- Field-info declarations that should be available everywhere
- Common template snippets
- Default values you want across all templates

Priority: built-in < global < system < block < main
(Global fieldInfos can be overridden by system blocks or the template itself.)

Example:
{{fieldInfo author "Author name" suggest="Anonymous"}}
{{fieldInfo project "Project" type="text"}}`,
						validate: (code) => this.plugin.validateGlobalBlock(code),
						onSave: async (content) => {
							this.plugin.settings.globalBlock = content;
							await this.plugin.saveData(this.plugin.settings);
						}
					}).open();
				})
			);

		new Setting(advancedItems)
			.setName('Custom helpers')
			.setDesc(createFragment(f => {
				f.appendText('Register custom Handlebars helper functions using JavaScript. ');
				f.createEl('a', {
					text: '(?)',
					href: `${DOCS_BASE_URL}/settings-page/advanced-settings/custom-helper-settings/enable-custom-helpers`,
				});
			}))
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.customHelpersEnabled)
				.onChange(async (value) => {
					if (value) {
						// Show ACE warning before enabling
						const confirmed = await new Promise<boolean>((resolve) => {
							new ConfirmationModal(this.app, {
								title: 'Enable Custom Helpers?',
								message: <>
									<p>Custom helpers execute <strong>arbitrary JavaScript code</strong> with full access to your vault, files, and the Obsidian API.</p>
									<p>Only enable this if you wrote the helper code yourself or fully trust its source.</p>
								</>,
								confirmText: 'I understand, enable',
								cancelText: 'Cancel',
							}, resolve).open();
						});
						if (confirmed) {
							this.plugin.settings.customHelpersEnabled = true;
							await this.plugin.saveData(this.plugin.settings);
							// Load helpers now that feature is enabled
							if (this.plugin.settings.userHelpers && this.plugin.settings.userHelpers.trim() !== "") {
								const result = this.plugin.loadUserHelpers(this.plugin.settings.userHelpers);
								if (!result.valid) {
									new Notice('Failed to load custom helpers - check console');
									console.error('[Z2K Templates] Custom helpers error:', result.error);
								}
							}
							this.display(); // Re-render to show editor button
						} else {
							toggle.setValue(false); // Reset toggle
						}
					} else {
						this.plugin.settings.customHelpersEnabled = false;
						await this.plugin.saveData(this.plugin.settings);
						this.display(); // Re-render to hide editor button
					}
				})
			);
		if (this.plugin.settings.customHelpersEnabled) {
			const editSetting = new Setting(advancedItems)
				.setName('Edit custom helpers')
				.addButton(button => button
					.setButtonText('Edit Custom Helpers')
					.onClick(() => {
						new EditorModal(this.app, {
							title: 'Edit Custom Helpers',
							initialContent: this.plugin.settings.userHelpers,
							language: 'javascript',
							helpText: `Write JavaScript code to register custom Handlebars helpers.
These helpers can be used in any template with {{helperName ...}} syntax.

Available Globals:
- app: Obsidian App instance (vault, workspace, metadataCache, etc.)
- obsidian: The Obsidian module (Notice, Modal, TFile, etc.)
- moment: Moment.js for date manipulation
- Handlebars: The Handlebars instance
- registerHelper(name, fn): Register a custom helper

Example - transform a value:
registerHelper('shout', (value) => String(value).toUpperCase() + '!');
// Usage: {{shout "hello"}} → HELLO!

Example - get recent files:
registerHelper('recentFiles', () => {
    return app.vault.getMarkdownFiles()
        .sort((a, b) => b.stat.mtime - a.stat.mtime)
        .slice(0, 5)
        .map(f => f.basename)
        .join(', ');
});
// Usage: {{recentFiles}} → Note A, Note B, ...`,
							validate: (code) => this.plugin.validateUserHelpers(code),
							onSave: async (content) => {
								this.plugin.settings.userHelpers = content;
								await this.plugin.saveData(this.plugin.settings);
								// Reload helpers
								const result = this.plugin.loadUserHelpers(content);
								if (!result.valid) {
									new Notice('Failed to load custom helpers - check console');
									console.error('[Z2K Templates] Custom helpers error:', result.error);
								}
							}
						}).open();
					})
				);
			// This overwrites the initial .setDesc(), so any description content (including docs links) must go here
			const warningDesc = createFragment(f => {
				const warn = f.createSpan({ text: 'Warning: ' });
				warn.style.color = 'var(--text-warning, #e0a530)';
				f.appendText('Custom helpers run arbitrary JavaScript with full access to your vault and Obsidian API. ');
				f.createEl('a', {
					text: '(?)',
					href: `${DOCS_BASE_URL}/settings-page/advanced-settings/custom-helper-settings/edit-custom-helpers`,
				});
			});
			editSetting.setDesc(warningDesc);
		}

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
			if (!errorDescEl && settingItem) {
				errorDescEl = createDiv({cls: ['setting-item-description', 'setting-item-error-description']});
				// Append to settingItem - CSS handles layout via .is-invalid flex-wrap
				settingItem.appendChild(errorDescEl);
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
