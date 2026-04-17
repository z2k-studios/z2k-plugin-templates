
import { App, Plugin, Modal, Notice, TAbstractFile, TFolder, TFile, PluginSettingTab, Setting, MarkdownView, Editor, Command, ToggleComponent, setIcon, DataAdapter } from 'obsidian';
import * as obsidian from 'obsidian';
import { Z2KTemplateEngine, Z2KYamlDoc, TemplateState, VarValueType, FieldInfo, TemplateError, Handlebars } from 'z2k-template-engine';
import { PathFile, PathFolder, pathFileFrom, pathFolderFrom, pathFileFromTFile, pathFolderFromTFolder, normalizeFullPath, isSubPathOf, joinPath } from './paths';
import React, { useState, useEffect, useRef, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import moment from 'moment';   // npm i moment

import { EditorView, ViewPlugin, ViewUpdate, Decoration, DecorationSet, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from "@codemirror/view";
import { RangeSetBuilder, type Extension, EditorState, Compartment } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { syntaxHighlighting, bracketMatching, HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { javascript } from "@codemirror/lang-javascript"; // npm i @codemirror/lang-javascript
import { handlebarsLanguage } from "@xiechao/codemirror-lang-handlebars"; // npm i @xiechao/codemirror-lang-handlebars
import { highlightTree, classHighlighter } from "@lezer/highlight"; // npm i @lezer/highlight

// Paths use kebab-case mirroring the doc file tree, e.g. settings-page/general-settings/creator-name
const DOCS_BASE_URL = 'https://z2k-studios.github.io/z2k-plugin-templates-docs/docs/reference-manual';

interface Z2KTemplatesPluginSettings {
	templatesRootFolder: string;
	creator: string;
	templatesFolderName: string;
	cardReferenceName: string;
	quickCommands: Array<{
		id: string; // stable id (to retain keyboard shortcuts)
		name: string; // display name
		action: "create" | "insert"; // create file or insert block
		targetFolder: string; // vault-relative path to folder, empty = prompt
		templateFile: string; // vault-relative path to template, empty = prompt
		sourceText: "none" | "selection" | "clipboard"; // source text to pass to template
	}>;
	offlineCommandQueueEnabled: boolean; // Whether offline command queue processing is enabled
	offlineCommandQueueDir: string; // Directory for offline command queue (JSON/JSONL files)
	offlineCommandQueueFrequency: string; // Duration between queue scans (e.g., "60s", "5m"). Blank = manual only
	offlineCommandQueuePause: string; // Duration to pause between commands (e.g., "500ms", "1s"). Blank = no pause
	offlineCommandQueueArchiveDuration: string; // How long to keep archives (e.g., "1d", "1w"). Blank = delete immediately
	errorLogPath: string; // Path to error log file (relative to vault or absolute)
	errorLogLevel: "none" | "error" | "warn" | "info" | "debug"; // Minimum severity level to log
	useTemplateFileExtensions: boolean; // Whether to use .template and .block file extensions
	templateExtensionsVisible: boolean; // Whether .template and .block files are currently visible in Obsidian
	globalBlock: string; // Global fieldInfo declarations (applied to all templates)
	userHelpers: string; // Custom JavaScript helper functions
	customHelpersEnabled: boolean; // Whether custom helpers are active (ACE risk)
}

const DEFAULT_SETTINGS: Z2KTemplatesPluginSettings = {
	// templatesRootFolder: '/Z2K',
	templatesRootFolder: '',
	creator: '',
	templatesFolderName: 'Templates',
	cardReferenceName: 'note',
	quickCommands: [],
	offlineCommandQueueEnabled: false,
	offlineCommandQueueDir: '.obsidian/plugins/z2k-plugin-templates/command-queue',
	offlineCommandQueueFrequency: '60s',
	offlineCommandQueuePause: '1s',
	offlineCommandQueueArchiveDuration: '1w',
	errorLogPath: '.obsidian/plugins/z2k-plugin-templates/error-log.md',
	errorLogLevel: 'warn',
	useTemplateFileExtensions: false,
	templateExtensionsVisible: false,
	globalBlock: '',
	userHelpers: `// Register custom Handlebars helpers here
// Example:
// registerHelper('shout', (value) => String(value).toUpperCase() + '!');
`,
	customHelpersEnabled: false,
};

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
	fieldData?: string | Record<string, VarValueType>;
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

const DURATION_FORMAT_ERROR = 'Invalid duration. Use number + suffix: ms, s, m, h, d, w, mo, y (e.g., 500ms, 30s, 5m, 12h, 3d, 1w, 6mo, 1y)';

// Parses duration strings like "500ms", "30s", "5m", "12h", "3d", "1w", "6mo", "1y" into milliseconds
// If defaultOnError is provided, returns it for invalid/empty input. Otherwise throws Error.
function parseDuration(value: string, defaultOnError?: number): number {
	const trimmed = value.trim();
	if (trimmed === '') {
		if (defaultOnError !== undefined) return defaultOnError;
		throw new Error(DURATION_FORMAT_ERROR);
	}
	const match = trimmed.match(/^(\d+)(ms|s|m|h|d|w|mo|y)$/i);
	if (!match) {
		if (defaultOnError !== undefined) return defaultOnError;
		throw new Error(DURATION_FORMAT_ERROR);
	}
	const num = parseInt(match[1], 10);
	const unit = match[2].toLowerCase();
	switch (unit) {
		case 'ms': return num;
		case 's': return num * 1000;
		case 'm': return num * 60 * 1000;
		case 'h': return num * 60 * 60 * 1000;
		case 'd': return num * 24 * 60 * 60 * 1000;
		case 'w': return num * 7 * 24 * 60 * 60 * 1000;
		case 'mo': return num * 30 * 24 * 60 * 60 * 1000;
		case 'y': return num * 365 * 24 * 60 * 60 * 1000;
		default:
			if (defaultOnError !== undefined) return defaultOnError;
			throw new Error(DURATION_FORMAT_ERROR);
	}
}

// Parses .delay. filenames: name.YYYY-MM-DD.delay.json or name.YYYY-MM-DD_HH-mm-ss.delay.json
// Returns timestamp if valid delay date found, else null
function parseDelayFromFilename(filename: string): number | null {
	const match = filename.match(/\.(\d{4}-\d{2}-\d{2})(?:_(\d{2}-\d{2}-\d{2}))?\.delay\.json$/i);
	if (!match) return null;
	const dateStr = match[1];
	const timeStr = match[2] || '00-00-00';
	const [h, m, s] = timeStr.split('-').map(Number);
	const date = moment(dateStr, 'YYYY-MM-DD');
	if (!date.isValid()) return null;
	date.hour(h).minute(m).second(s);
	return date.valueOf();
}

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

class Z2KTemplatesSettingTab extends PluginSettingTab {
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
			.setName('Quick Commands')
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
			.setName('Global Block')
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
			.setName('Custom Helpers')
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
									console.error('Custom helpers error:', result.error);
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
				.setName('Edit Custom Helpers')
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
									console.error('Custom helpers error:', result.error);
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

// Error logging types
type ErrorSeverity = "error" | "warn" | "info" | "debug";

interface LogContext {
	severity: ErrorSeverity;
	error?: Error;
	message: string;
	additionalContext?: Record<string, any>;
}

class ErrorLogger {
	constructor(
		private app: App,
		private settings: Z2KTemplatesPluginSettings
	) {}

	async log(context: LogContext): Promise<void> {
		if (!this.shouldLog(context.severity)) { return; }
		await this.writeToLog(context);
	}

	private shouldLog(severity: ErrorSeverity): boolean {
		const levels = ["none", "error", "warn", "info", "debug"];
		const currentLevel = this.settings.errorLogLevel;
		if (currentLevel === "none") { return false; }
		return levels.indexOf(severity) <= levels.indexOf(currentLevel);
	}

	private static readonly MAX_LOG_SIZE = 1024 * 1024; // 1 MB
	private static readonly TRUNCATE_TARGET = 700 * 1024; // ~700 KB

	async clearLog(): Promise<void> {
		try {
			await this.app.vault.adapter.write(this.settings.errorLogPath, '');
		} catch (error) {
			console.error("Failed to clear error log:", error);
		}
	}

	private async writeToLog(context: LogContext): Promise<void> {
		const entry = this.formatLogEntry(context);
		const logPath = this.settings.errorLogPath;

		try {
			let existingContent = '';
			if (await this.app.vault.adapter.exists(logPath)) {
				existingContent = await this.app.vault.adapter.read(logPath);
			}
			const newContent = existingContent + entry;
			await this.app.vault.adapter.write(logPath, newContent);
			await this.truncateIfNeeded(logPath, newContent);
		} catch (error) {
			console.error("Failed to write to error log:", error);
		}
	}

	private async truncateIfNeeded(logPath: string, content: string): Promise<void> {
		if (content.length <= ErrorLogger.MAX_LOG_SIZE) return;

		// Find a clean entry boundary (---) at or after the cut point
		const cutPoint = content.length - ErrorLogger.TRUNCATE_TARGET;
		const separator = "\n---\n\n";
		const boundaryIndex = content.indexOf(separator, cutPoint);

		if (boundaryIndex === -1) return; // No clean boundary found, keep as-is

		const trimmed = content.substring(boundaryIndex + separator.length);
		await this.app.vault.adapter.write(logPath, trimmed);
	}

	private formatLogEntry(context: LogContext): string {
		const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

		// Compact format for error/warn/info
		if (this.settings.errorLogLevel !== "debug") {
			return `## [${context.severity.toUpperCase()}] ${timestamp}\n${context.message}\n\n---\n\n`;
		}

		// Verbose format for debug
		let entry = `## [${context.severity.toUpperCase()}] ${timestamp}\n`;
		entry += `**Message:** ${context.message}\n`;

		if (context.error) {
			entry += `**Stack Trace:**\n\`\`\`\n${context.error.stack}\n\`\`\`\n`;
		}

		if (context.additionalContext) {
			entry += `**Context:**\n`;
			for (const [key, value] of Object.entries(context.additionalContext)) {
				entry += `- ${key}: ${value}\n`;
			}
		}

		entry += `\n---\n\n`;
		return entry;
	}
}

export default class Z2KTemplatesPlugin extends Plugin {
	templateEngine: Z2KTemplateEngine;
	settings: Z2KTemplatesPluginSettings;
	errorLogger: ErrorLogger;
	userHelperFunctions: Record<string, Function> = {};
	// Returns user helpers only when the feature is enabled; empty object otherwise
	get activeHelpers(): Record<string, Function> {
		return this.settings.customHelpersEnabled ? this.userHelperFunctions : {};
	}
	private _refreshTimer: number | null = null;
	private _queueCheckInterval: number | null = null;
	private _processingQueue: boolean = false;
	private _lastQueueCheck: number = 0;
	private _statusBarItem: HTMLElement | null = null;

	private wrapHelper(name: string, fn: Function): Function {
		return (...args: unknown[]) => {
			try {
				return fn(...args);
			} catch (e: any) {
				console.error(`Helper '${name}' threw:`, e);
				this.errorLogger?.log({
					severity: 'error',
					message: `Custom helper '${name}' threw an error: ${e.message}`,
					error: e,
				});
				return `[Error in ${name}]`;
			}
		};
	}

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
			this.userHelperFunctions = newHelpers;
			return { valid: true, helperNames: Object.keys(newHelpers) };
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
		this.templateEngine = new Z2KTemplateEngine();
		this.errorLogger = new ErrorLogger(this.app, this.settings);
		// Load user-defined custom helpers (only when enabled)
		if (this.settings.customHelpersEnabled && this.settings.userHelpers && this.settings.userHelpers.trim() !== "") {
			const result = this.loadUserHelpers(this.settings.userHelpers);
			if (!result.valid) {
				new Notice('Failed to load custom helpers - check console for details');
				console.error('Custom helpers error:', result.error);
			}
		}
		this.refreshMainCommands(false); // Don't delete existing, since none exist yet
		this.refreshDynamicCommands(false);
		this.registerEvents();
		this.addSettingTab(new Z2KTemplatesSettingTab(this.app, this));
		this.registerEditorExtension(handlebarsOverlay());
		this.registerURIHandler();
		this._statusBarItem = this.addStatusBarItem();

		// Initialize offline command queue
		await this.recoverFromCrash();
		this.startQueueProcessor();
		// Restore template extension visibility state
		if (this.settings.useTemplateFileExtensions && this.settings.templateExtensionsVisible) {
			// @ts-expect-error: internal API
			this.app.viewRegistry.registerExtensions(["template", "block"], "markdown");
		}
	}
	onunload() {
		if (this._queueCheckInterval !== null) {
			window.clearInterval(this._queueCheckInterval);
			this._queueCheckInterval = null;
		}
	}

	refreshMainCommands(deleteExisting: boolean = true) {
		let mainCommands: Command[] = [
			{
				id: 'z2k-create-new-card',
				name: `Create New ${cardRefNameUpper(this.settings)}`,
				callback: () => this.createCard(),
			},
			{
				id: 'z2k-create-card-from-selected-text',
				name: `Create ${cardRefNameUpper(this.settings)} From Selected Text`,
				editorCheckCallback: (checking, editor) => {
					const selectedText = editor.getSelection();
					if (checking) { return selectedText.length > 0; } // Only enable if text is selected
					this.createCard({ fromSelection: true });
				},
			},
			{
				id: 'z2k-apply-template-to-file',
				name: `Apply Template to ${cardRefNameUpper(this.settings)}`,
				checkCallback: (checking) => {
					const activeFile = this.app.workspace.getActiveFile();
					// Only enable if there's an active file and it's a markdown file
					if (checking) { return !!activeFile && activeFile.extension === 'md'; }
					this.createCard({ sourceFile: activeFile as TFile });
				},
			},
			{
				id: 'z2k-continue-filling-card',
				name: `Continue Filling ${cardRefNameUpper(this.settings)}`,
				checkCallback: (checking) => {
					const activeFile = this.app.workspace.getActiveFile();
					if (checking) { return !!activeFile && activeFile.extension === 'md'; }
					this.continueCard({ existingFile: activeFile as TFile });
				},
			},
			{
				id: 'z2k-finalize-card',
				name: `Finalize ${cardRefNameUpper(this.settings)}`,
				checkCallback: (checking) => {
					const activeFile = this.app.workspace.getActiveFile();
					if (checking) { return !!activeFile && activeFile.extension === 'md'; }
					this.continueCard({ existingFile: activeFile as TFile, promptMode: "none", finalize: true });
				},
			},
			{
				id: 'z2k-insert-block-template',
				name: 'Insert Block Template',
				editorCheckCallback: (checking, editor) => {
					const file = this.app.workspace.getActiveFile();
					if (checking) {
						// Only enable if there's an active markdown file and no text is selected
						return !!file && file.extension === 'md' && editor.getSelection().length === 0;
					}
					this.insertBlock();
				}
			},
			{
				id: 'z2k-insert-block-template-from-selection',
				name: 'Insert Block Template Using Selected Text',
				editorCheckCallback: (checking, editor) => {
					const file = this.app.workspace.getActiveFile();
					if (checking) {
						// Only enable if there's an active markdown file and text is selected
						return !!file && file.extension === 'md' && editor.getSelection().length > 0;
					}
					this.insertBlock({ fromSelection: true });
				}
			},
			{
				id: 'z2k-process-command-queue',
				name: 'Process Command Queue Now',
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
			// {
			// 	id: 'z2k-enable-template-editing',
			// 	name: 'Enable Template Editing Mode',
			// 	checkCallback: (checking) => {
			// 		if (checking) { return !this.settings.templateEditingEnabled; }
			// 		this.enableTemplateEditing();
			// 	},
			// },
			// {
			// 	id: 'z2k-disable-template-editing',
			// 	name: 'Disable Template Editing Mode',
			// 	checkCallback: (checking) => {
			// 		if (checking) { return this.settings.templateEditingEnabled; }
			// 		this.disableTemplateEditing();
			// 	},
			// },
			{
				id: "z2k-convert-file-to-template",
				name: "Convert to Document Template",
				checkCallback: (checking) => {
					let file = this.app.workspace.getActiveFile();
					if (checking) { return !!file && this.getFileTemplateTypeSync(file) !== "document-template"; }
					this.convertFileTemplateType(file as TFile, "document-template");
				},
			},
			{
				id: "z2k-convert-file-to-block-template",
				name: "Convert to Block Template",
				checkCallback: (checking) => {
					let file = this.app.workspace.getActiveFile();
					if (checking) { return !!file && this.getFileTemplateTypeSync(file) !== "block-template"; }
					this.convertFileTemplateType(file as TFile, "block-template");
				},
			},
			{
				id: "z2k-convert-file-to-md-template",
				name: "Switch to .md Extension",
				checkCallback: (checking) => {
					let file = this.app.workspace.getActiveFile();
					// Only show if file has .template or .block extension
					if (checking) { return !!file && (file.extension === "template" || file.extension === "block"); }
					this.convertToMarkdownTemplate(file as TFile);
				},
			},
			{
				id: "z2k-convert-file-to-md",
				name: "Convert to Content File",
				checkCallback: (checking) => {
					let file = this.app.workspace.getActiveFile();
					if (checking) { return !!file && this.getFileTemplateTypeSync(file) !== "content-file"; }
					this.convertFileTemplateType(file as TFile, "content-file");
				},
			},
			{
				id: "z2k-toggle-template-visibility",
				name: this.settings.templateExtensionsVisible ? "Make .template and .block Templates Hidden" : "Make .template and .block Templates Visible",
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
			if (cmd.action === "insert") {
				// Insert commands require an active editor (for cursor position)
				this.addCommand({
					id: cmd.id,
					name: cmd.name,
					editorCheckCallback: (checking) => {
						const file = this.app.workspace.getActiveFile();
						if (checking) { return !!file && file.extension === 'md'; }
						this.executeQuickCommand(cmd);
					},
				});
			} else {
				this.addCommand({
					id: cmd.id,
					name: cmd.name,
					callback: () => this.executeQuickCommand(cmd),
				});
			}
		}
	}
	async executeQuickCommand(cmd: Z2KTemplatesPluginSettings["quickCommands"][number]) {
		try {
			// Resolve folder (empty = prompt via createCard/insertBlock defaults)
			let folder: PathFolder | undefined;
			if (cmd.targetFolder) {
				const tf = this.getFolder(cmd.targetFolder);
				if (!tf) {
					await this.logWarn(`Target folder not found: ${cmd.targetFolder}`);
					return;
				}
				folder = pathFolderFromTFolder(tf);
			}
			// Resolve template (empty = prompt via createCard/insertBlock defaults)
			let template: PathFile | undefined;
			if (cmd.templateFile) {
				template = pathFileFrom(cmd.templateFile);
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
					item.setTitle(`Z2K: Create ${cardRefNameUpper(this.settings)} From Selection...`)
						.onClick(() => {
							this.createCard({ fromSelection: true });
						});
				});
			})
		);
		// Context menu 'create new card here'
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, folder) => {
				if (!(folder instanceof TFolder)) return;
				menu.addItem((item) => {
					item.setTitle(`Z2K: Create New ${cardRefNameUpper(this.settings)} Here...`)
						.onClick(() => this.createCard({ cardTypeFolder: pathFolderFromTFolder(folder as TFolder) }));
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
					item.setTitle("Z2K: Insert Block Template...")
						.onClick(() => {
							this.insertBlock();
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
					item.setTitle("Z2K: Insert Block Template Using Selection...")
						.onClick(() => {
							this.insertBlock({ fromSelection: true });
						});
				});
			})
		);

		// { // Template editing mode toggle
		// 	// Toggle command
		// 	this.addCommand({
		// 		id: 'z2k-enable-template-editing',
		// 		name: 'Enable Template Editing Mode',
		// 		checkCallback: (checking) => {
		// 			if (checking) { return !this.settings.templateEditingEnabled; }
		// 			this.enableTemplateEditing();
		// 		},
		// 	});
		// 	this.addCommand({
		// 		id: 'z2k-disable-template-editing',
		// 		name: 'Disable Template Editing Mode',
		// 		checkCallback: (checking) => {
		// 			if (checking) { return this.settings.templateEditingEnabled; }
		// 			this.disableTemplateEditing();
		// 		},
		// 	});
		// 	// Toggle in context menu in file explorer
		// 	this.registerEvent(
		// 		this.app.workspace.on('file-menu', (menu, file) => {
		// 			if (this.settings.templateEditingEnabled) {
		// 				menu.addItem(i => i.setTitle("Z2K: Disable Template Editing Mode")
		// 					.onClick(() => this.disableTemplateEditing()));
		// 			} else {
		// 				menu.addItem(i => i.setTitle("Z2K: Enable Template Editing Mode")
		// 					.onClick(() => this.enableTemplateEditing()));
		// 			}
		// 		})
		// 	);
		// 	this.registerEvent(
		// 		// ts-ignore because folder-menu is not in the type definitions
		// 		// @ts-ignore
		// 		this.app.workspace.on('folder-menu', (menu, folder) => {
		// 			if (this.settings.templateEditingEnabled) {
		// 				menu.addItem((i: any) => i.setTitle("Z2K: Disable Template Editing Mode")
		// 					.onClick(() => this.disableTemplateEditing()));
		// 			} else {
		// 				menu.addItem((i: any) => i.setTitle("Z2K: Enable Template Editing Mode")
		// 					.onClick(() => this.enableTemplateEditing()));
		// 			}
		// 		})
		// 	);
		// }

		// Template conversion context menu in file explorer
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile) || this.getFileTemplateTypeSync(file) === "document-template") { return; }
				menu.addItem((item) => {
					item.setTitle("Z2K: Convert to Document Template")
						.onClick(() => this.convertFileTemplateType(file as TFile, "document-template"));
				});
			})
		);
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile) || this.getFileTemplateTypeSync(file) === "block-template") { return; }
				menu.addItem((item) => {
					item.setTitle("Z2K: Convert to Block Template")
						.onClick(() => this.convertFileTemplateType(file as TFile, "block-template"));
				});
			})
		);
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				// Only show for .template or .block files
				if (!(file instanceof TFile) || (file.extension !== "template" && file.extension !== "block")) { return; }
				menu.addItem((item) => {
					item.setTitle("Z2K: Switch to .md Extension")
						.onClick(() => this.convertToMarkdownTemplate(file as TFile));
				});
			})
		);
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile) || this.getFileTemplateTypeSync(file) === "content-file") { return; }
				menu.addItem((item) => {
					item.setTitle("Z2K: Convert to Content File")
						.onClick(() => this.convertFileTemplateType(file as TFile, "content-file"));
				});
			})
		);
		// Continue filling / Finalize context menu items
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile) || file.extension !== "md") { return; }
				menu.addItem((item) => {
					item.setTitle(`Z2K: Continue Filling This ${cardRefNameUpper(this.settings)}`)
						.onClick(() => this.continueCard({ existingFile: file as TFile }));
				});
			})
		);
		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				if (!(file instanceof TFile) || file.extension !== "md") { return; }
				menu.addItem((item) => {
					item.setTitle(`Z2K: Finalize This ${cardRefNameUpper(this.settings)}`)
						.onClick(() => this.continueCard({ existingFile: file as TFile, promptMode: "none", finalize: true }));
				});
			})
		);
	}

	registerURIHandler() {
		this.registerObsidianProtocolHandler("z2k-templates", async (rawParams) => {
			try {
				// URL-decode all parameters and pass to processCommand
				const cmdParams: CommandParams = {};
				for (const key in rawParams) {
					cmdParams[key] = decodeURIComponent(rawParams[key]);
				}
				await this.processCommand(cmdParams, 'user');
			} catch (e) { this.handleErrors(e); }
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
	private async processCommand(rawParams: CommandParams, context: "user" | "batch", isJsonSource: boolean = false): Promise<void> {
		const cps: Record<string, any> = {};  // Command parameters
		const templateData: Record<string, any> = {};  // Template field data (preserves original keys)

		const knownKeys = ['cmd', 'templatePath', 'blockPath', 'templateContents', 'blockContents',
			'existingFilePath', 'destDir', 'destHeader', 'prompt', 'finalize', 'location',
			'fieldData', 'fieldData64', 'jsonData', 'jsonData64',
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
				// Recursive call with parsed JSON (inherit context, mark as JSON source)
				return await this.processCommand(parsedParams as CommandParams, context, true);
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
			await this.createCard({
				cardTypeFolder,
				templateFile,
				templateContent,
				fieldOverrides,
				uriKeys,
				promptMode,
				destDir,
				finalize
			});
			return;
		}

		if (cmd === "continue") {
			if (!existingFile) {
				throw new TemplatePluginError("Command: 'continue' cmd requires 'existingFilePath'");
			}
			await this.continueCard({
				existingFile,
				fieldOverrides,
				uriKeys,
				promptMode,
				finalize
			});
			return;
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
				await this.continueCard({
					existingFile, fieldOverrides, uriKeys, promptMode, finalize
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
				await this.createCard({
					cardTypeFolder, templateFile, templateContent, fieldOverrides, uriKeys,
					promptMode, destDir: targetFolder, finalize,
					existingTitle: basename,
				});
			}
			return;
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

			await this.insertBlock({
				templateFile,
				templateContent,
				existingFile,
				destHeader: cps.destHeader,
				location,
				fieldOverrides,
				uriKeys,
				promptMode,
				finalize
			});
			return;
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
		this.settings.offlineCommandQueueDir = newPath;
		await this.saveData(this.settings);

		const adapter = this.app.vault.adapter;

		// Move files from old directory to new if both paths exist
		if (oldPath && oldPath !== newPath && newPath) {
			const oldDirPath = this.resolveQueueFilePath(oldPath);
			const newDirPath = this.resolveQueueFilePath(newPath);
			if (oldDirPath && newDirPath && await adapter.exists(oldDirPath)) {
				// TODO: Move files from old to new directory
			}
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
			await this.log('error', 'batch', `Queue path is not a directory: ${dirPath}`);
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
			await this.log('error', 'batch', `Invalid JSON in command file ${filePath}`);
			const failedPath = await this.getFailedPath(filePath);
			await adapter.rename(filePath, failedPath);
			return;
		}

		try {
			// Execute command (JSON source - don't convert string types)
			await this.processCommand(cmdParams, 'batch', true);
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
					await this.log('error', 'batch', `Invalid JSON in command queue: ${line}`);
					failedLines.push(line);
					if (pauseMs > 0 && i < lines.length - 1) {
						await sleep(pauseMs);
					}
					continue;
				}
				try {
					await this.processCommand(cmdParams, 'batch', true);
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
						await this.handleErrors(e, 'batch');
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
		await this.handleErrors(error, 'batch');

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

			await this.log('error', 'batch', `Command failed after ${retryData.attempts} attempts: ${filePath}`);
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
	}) {
		try {
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
				throw new TemplatePluginError("Block template partials ({{> ...}}) cannot be used in frontmatter.");
			}
			fm = this.updateYamlOnCreate(fm, templateFileForParse.basename);
			content = Z2KYamlDoc.joinFrontmatter(fm, body);
			let systemBlocksContent = opts.templateFile
				? await this.GetSystemBlocksContent(opts.cardTypeFolder)
				: "";
			let state = await this.parseTemplate(content, systemBlocksContent, this.settings.globalBlock, templateFileForParse);
			let hadSourceTextField = !!state.fieldInfos["sourceText"];
			// Convert sourceText to string for addPluginBuiltIns (handles all VarValueType cases)
			const sourceTextStr = opts.fieldOverrides.sourceText != null ? String(opts.fieldOverrides.sourceText) : undefined;
			await this.addYamlFieldValues(state); // System blocks already in state from parseTemplate
			await this.addPluginBuiltIns(state, { sourceText: sourceTextStr, templateName: templateFileForParse.basename, fileCreationDate: opts.sourceFile?.stat.ctime, existingTitle: opts.existingTitle });
			this.setSuggestedTitleFromYaml(state);
			// For sourceFile: use original filename as suggestion if template doesn't specify one
			if (opts.sourceFile) {
				const tfi = state.fieldInfos["fileTitle"];
				if (tfi && tfi.value === undefined && tfi.suggest === undefined) {
					tfi.suggest = opts.sourceFile.basename;
				}
			}
			this.handleOverrides(state, opts.fieldOverrides, opts.uriKeys ?? new Set(), opts.promptMode || "all");

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
			if (opts.sourceFile) {
				// Rename-based flow: modify content, then rename/move (updates links)
				await this.app.vault.modify(opts.sourceFile, contentOut);
				const filename = this.getValidFilename(title);
				const newPath = this.generateUniqueFilePath(opts.destDir.path, filename);
				if (newPath !== opts.sourceFile.path) {
					await this.app.fileManager.renameFile(opts.sourceFile, newPath);
				}
				await this.app.workspace.openLinkText(opts.sourceFile.path, "");
			} else {
				let newFile = await this.createFile(opts.destDir, title, contentOut);
				await this.app.workspace.openLinkText(newFile.path, "");
			}
		} catch (error) { this.handleErrors(error); }
	}
	async continueCard(opts: {
		existingFile: TFile,
		fieldOverrides?: Record<string,VarValueType>,
		uriKeys?: Set<string>,
		promptMode?: "none"|"remaining"|"all",
		finalize?: boolean,
	}) {
		try {
			let content = await this.app.vault.read(opts.existingFile);
			let state = await this.parseTemplate(content, "", "", pathFileFromTFile(opts.existingFile));
			// Add global block YAML for field values (system blocks already in note from creation)
			let globalBlockYaml = Z2KYamlDoc.splitFrontmatter(this.settings.globalBlock).fm;
			await this.addYamlFieldValues(state, [globalBlockYaml]);
			await this.addPluginBuiltIns(state, { existingTitle: opts.existingFile.basename, fileCreationDate: opts.existingFile.stat.ctime });
			this.handleOverrides(state, opts.fieldOverrides, opts.uriKeys ?? new Set(), opts.promptMode || "all");
			let hasFillableFields = this.hasFillableFields(state.fieldInfos);
			// TODO: handle the case where fieldOverrides fills all fields and promptMode is "remaining"
			if (!hasFillableFields && !opts.fieldOverrides) {
				await this.logInfo("No fillable fields found in the template.");
				return;
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
		} catch (error) { this.handleErrors(error); }
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
	}) {
		try {
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
			await this.addPluginBuiltIns(state, { sourceText: sourceTextStr, existingTitle: opts.existingFile.basename, fileCreationDate: opts.existingFile.stat.ctime });
			this.handleOverrides(state, opts.fieldOverrides, opts.uriKeys ?? new Set(), opts.promptMode || "all");

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

			// Insert into body: file position, header position, line number, or editor mode
			let newFileContent: string;
			const fileContent = await this.app.vault.read(opts.existingFile);
			const { fm: fileFm, body: fileBody } = Z2KYamlDoc.splitFrontmatter(fileContent);
			const mergedFm = Z2KYamlDoc.mergeLastWins([fileFm, blockFm]);

			let newBody: string;
			if (opts.location === "file-top") {
				// Insert at top of file (first line of content after frontmatter)
				newBody = blockBody + fileBody;
			} else if (opts.location === "file-bottom") {
				// Insert at bottom of file
				newBody = fileBody + "\n" + blockBody;
			} else if (opts.location === "header-top" || opts.location === "header-bottom") {
				// Insert at header position
				if (!opts.destHeader) {
					throw new TemplatePluginError("destHeader is required when location is 'header-top' or 'header-bottom'");
				}
				newBody = this.insertIntoHeaderSection(fileBody, opts.destHeader, blockBody, opts.location);
			} else if (typeof opts.location === "number") {
				// Insert at specific line number
				newBody = this.insertAtLineNumber(fileBody, opts.location, blockBody);
			} else if (opts.destHeader) {
				// Backward compatibility: if destHeader is specified without location, use header-top
				newBody = this.insertIntoHeaderSection(fileBody, opts.destHeader, blockBody, "header-top");
			} else {
				// Editor mode: insert at cursor or replace selection
				const editor = this.getEditorOrThrow();
				if (opts.fromSelection) {
					editor.replaceSelection(blockBody);
				} else {
					editor.replaceRange(blockBody, editor.getCursor());
				}
				const full = editor.getValue();
				const { fm: fileFm2, body: newBody2 } = Z2KYamlDoc.splitFrontmatter(full);
				const mergedFm2 = Z2KYamlDoc.mergeLastWins([fileFm2, blockFm]);
				newFileContent = Z2KYamlDoc.joinFrontmatter(mergedFm2, newBody2);
				await this.app.vault.modify(opts.existingFile, newFileContent);
				return;
			}

			newFileContent = Z2KYamlDoc.joinFrontmatter(mergedFm, newBody);
			await this.app.vault.modify(opts.existingFile, newFileContent);
		} catch (error) { this.handleErrors(error); }
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
				if (!state.fieldInfos[key].directives.includes("no-prompt")) {
					state.fieldInfos[key].directives.push("no-prompt");
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
			let content = await this.app.vault.read(file);
			let { fm, body } = Z2KYamlDoc.splitFrontmatter(content);
			let doc = Z2KYamlDoc.fromString(fm);
			if (type === "content-file") {
				doc.del("z2k_template_type");
			} else if (type === "document-template" || type === "block-template") {
				doc.set("z2k_template_type", type);
			}
			fm = doc.toString();
			content = Z2KYamlDoc.joinFrontmatter(fm, body);
			await this.app.vault.modify(file, content);
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
			// Update YAML to ensure type is set
			let content = await this.app.vault.read(file);
			let { fm, body } = Z2KYamlDoc.splitFrontmatter(content);
			let doc = Z2KYamlDoc.fromString(fm);
			doc.set("z2k_template_type", currentType);
			fm = doc.toString();
			content = Z2KYamlDoc.joinFrontmatter(fm, body);
			await this.app.vault.modify(file, content);
		} catch (error) { this.handleErrors(error); }
	}
	async setTemplateExtensionsVisible(visible: boolean) {
		if (this.settings.templateExtensionsVisible === visible) {
			return; // Already in desired state
		}
		if (visible) {
			// Show: register extensions as markdown
			// @ts-expect-error: internal API
			this.app.viewRegistry.registerExtensions(["template", "block"], "markdown");
			new Notice("Template files are now visible");
		} else {
			// Hide: unregister extensions
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
	// async enableTemplateEditing() {
	// 	try {
	// 		this.settings.templateEditingEnabled = true;
	// 		await this.saveData(this.settings);
	// 		for (const f of this.getAllZ2KFiles()) {
	// 			// Not using await
	// 			if (f instanceof TFolder && f.name === "." + this.settings.templatesFolderName) {
	// 				this.unhideFolder(f);
	// 			}
	// 			if (f instanceof TFile && f.name.startsWith(".") && this.getFileTemplateTypeSync(f) !== "content-file") {
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
	// 			if (f instanceof TFile && this.getFileTemplateTypeSync(f) !== "content-file") {
	// 				this.hideTemplateFile(f);
	// 			}
	// 		}
	// 		this.unregisterTemplateFileExtension();
	// 		new Notice("Z2K template editing disabled.");
	// 	} catch (error) { this.handleErrors(error); }
	// }

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
			new FieldCollectionModal(this.app, `Field Collection for ${cardRefNameUpper(this.settings)}`, templateState, this.activeHelpers, resolve, reject).open();
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
	async getAssociatedTemplates(filter: "document-template" | "block-template", cardType: PathFolder): Promise<PathFile[]> {
		const templatesRootPath = this.getTemplatesRootFolder().path;
		if (!isSubPathOf(cardType.path, templatesRootPath)) {
			throw new Error(`The selected ${cardRefNameLower(this.settings)} type folder is not inside your templates root folder.`);
		}
		const segCount = (p: string) => p === '' ? 0 : p.split('/').length;
		const targetSegCount = segCount(cardType.path);
		let ranked: { file: PathFile, distance: number }[] = [];
		for (const t of await this.getAllTemplates()) {
			if (t.type !== filter) { continue; }
			const tCardType = this.getTemplateCardType(t.file);
			// Only include templates whose card type is an ancestor of (or equal to) the target
			if (!isSubPathOf(cardType.path, tCardType.path)) { continue; }
			ranked.push({ file: t.file, distance: targetSegCount - segCount(tCardType.path) });
		}
		ranked.sort((a, b) => a.distance - b.distance || a.file.path.localeCompare(b.file.path));
		return ranked.map(r => r.file);
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
		// Partials can include any file in the vault, not just templates.
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
			fullPath = joinPath(folderPath, `${basename} (${counter++}).md`);
		}
		return fullPath;
	}
	setSuggestedTitleFromYaml(state: TemplateState) {
		// look through all the yaml (including from blocks) and find any z2k_template_suggested_title field
		for (const yamlStr of state.templatesYaml) {
			let yaml = Z2KYamlDoc.fromString(yamlStr);

			let suggestedTitle = yaml.get("z2k_template_suggested_title");
			if (suggestedTitle === undefined) { continue; } // not found in this yaml
			if (typeof suggestedTitle !== "string") {
				throw new TemplatePluginError(`z2k_template_suggested_title must be a string (got a ${typeof suggestedTitle})`);
			}
			state.fieldInfos["fileTitle"].suggest = suggestedTitle;
			break; // take the first one we find
		}
	}
	async addPluginBuiltIns(state: TemplateState, opts: { sourceText?: string, existingTitle?: string, templateName?: string, templateVersion?: string, templateAuthor?: string, fileCreationDate?: number } = {}) {
		// sourceText
		state.fieldInfos["sourceText"] = {
			fieldName: "sourceText",
			type: "text",
			directives: ['no-prompt'],
			value: opts.sourceText || "",
		};

		// creator
		state.fieldInfos["creator"] = {
			fieldName: "creator",
			type: "text",
			directives: ['no-prompt'],
			value: this.settings.creator || "",
		};

		// template name
		// try getting existing template name from yaml if not provided
		if (!opts.templateName) {
			for (const yamlStr of state.templatesYaml) {
				let yaml = Z2KYamlDoc.fromString(yamlStr);
				let templateName = yaml.get("z2k_template_name");
				if (templateName === undefined) { continue; } // not found in this yaml
				if (typeof templateName !== "string") {
					throw new TemplatePluginError(`z2k_template_name must be a string (got a ${typeof templateName})`);
				}
				opts.templateName = templateName;
				break; // take the first one we find
			}
		}
		state.fieldInfos["templateName"] = {
			fieldName: "templateName",
			type: "text",
			directives: ['no-prompt'],
			value: opts.templateName || "",
		};

		// templateVersion - get from yaml if not provided
		if (!opts.templateVersion) {
			for (const yamlStr of state.templatesYaml) {
				let yaml = Z2KYamlDoc.fromString(yamlStr);
				let templateVersion = yaml.get("z2k_template_version");
				if (templateVersion === undefined) { continue; }
				if (typeof templateVersion !== "string" && typeof templateVersion !== "number") {
					throw new TemplatePluginError(`z2k_template_version must be a string or number (got a ${typeof templateVersion})`);
				}
				opts.templateVersion = String(templateVersion);
				break;
			}
		}
		state.fieldInfos["templateVersion"] = {
			fieldName: "templateVersion",
			type: "text",
			directives: ['no-prompt'],
			value: opts.templateVersion || "",
		};

		// templateAuthor - get from yaml if not provided
		if (!opts.templateAuthor) {
			for (const yamlStr of state.templatesYaml) {
				let yaml = Z2KYamlDoc.fromString(yamlStr);
				let templateAuthor = yaml.get("z2k_template_author");
				if (templateAuthor === undefined) { continue; }
				if (typeof templateAuthor !== "string") {
					throw new TemplatePluginError(`z2k_template_author must be a string (got a ${typeof templateAuthor})`);
				}
				opts.templateAuthor = templateAuthor;
				break;
			}
		}
		state.fieldInfos["templateAuthor"] = {
			fieldName: "templateAuthor",
			type: "text",
			directives: ['no-prompt'],
			value: opts.templateAuthor || "",
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
		state.fieldInfos["fileTitle"] = tfi;

		// clipboard
		state.fieldInfos["clipboard"] = {
			fieldName: "clipboard",
			type: "text",
			directives: ['no-prompt'],
			value: await navigator.clipboard.readText(),
		};

		// fileCreationDate - creation date of the file being operated on
		state.fieldInfos["fileCreationDate"] = {
			fieldName: "fileCreationDate",
			type: "text",
			directives: ['no-prompt'],
			value: moment(opts.fileCreationDate ?? Date.now()).format("YYYY-MM-DD"),
		};
	}

	async addYamlFieldValues(state: TemplateState, additionalYamlSources?: string[]): Promise<void> {
		// YAML frontmatter fields are automatically added as field values.
		// This allows templates to reference metadata from template files, system blocks, and existing files.
		// YAML fields are added with 'no-prompt' directive to avoid re-prompting for existing data.
		// Priority order: Built-ins < YAML fields < fieldInfo.value < Plugin built-ins < Overrides
		// All frontmatter fields are included except Obsidian internal fields (currently only 'position').
		// User-facing fields like 'tags', 'aliases', and 'cssclasses' are included as they represent user data.
		// Values are passed through with their native YAML types (string, number, array, etc.)
		// TODO: Refactor to use valuesBySource pattern for explicit priority ordering instead of relying on call order

		// Merge all YAML sources (from template state + additional sources like system blocks or existing files)
		const allYamlSources = [...state.templatesYaml, ...(additionalYamlSources || [])];
		if (allYamlSources.length === 0) return;

		const mergedYaml = Z2KYamlDoc.mergeLastWins(allYamlSources);
		if (!mergedYaml || mergedYaml.trim() === "") return;

		const doc = Z2KYamlDoc.fromString(mergedYaml);
		const yamlData = doc.doc.toJSON();
		if (!yamlData || typeof yamlData !== 'object') return;

		for (const [key, value] of Object.entries(yamlData)) {
			// Skip Obsidian internal fields
			if (key === 'position') continue;

			// Skip if fieldInfo already has a value property (higher priority)
			if (state.fieldInfos[key]?.value !== undefined) continue;

			// Create field info if doesn't exist (and add no-prompt directive)
			if (!state.fieldInfos[key]) { state.fieldInfos[key] = { fieldName: key }; }
			if (!state.fieldInfos[key].directives) { state.fieldInfos[key].directives = []; }
			if (!state.fieldInfos[key].directives.includes('no-prompt')) {
				state.fieldInfos[key].directives.push('no-prompt');
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
		doc.del("z2k_template_suggested_title");
		// NOTE: Do NOT delete z2k_template_default_fallback_handling here - the engine needs it for parsing
		// It will be deleted later during finalization in cleanupYamlAfterFinalize
		return doc.toString();
	}
	cleanupYamlAfterFinalize(fm: string): string {
		if (!fm || fm.trim() === "") { return fm; }
		// Remove template-only YAML properties that should not appear in finalized output
		const doc = Z2KYamlDoc.fromString(fm);
		doc.del("z2k_template_default_fallback_handling");
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
	async logWarn(message: string, context: "user" | "batch" = 'user') {
		await this.log("warn", context, message);
	}
	async logInfo(message: string, context: "user" | "batch" = 'user') {
		await this.log("info", context, message);
	}
	async logDebug(message: string, context: "user" | "batch" = 'user') {
		await this.log("debug", context, message);
	}
	async log(severity: ErrorSeverity, context: "user" | "batch", message: string, error?: Error) {
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

		// Handle user notifications (only for user-initiated commands)
		if (context === 'batch') {
			return; // Batch mode - no notifications
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
	private async handleErrors(error: unknown, context: "user" | "batch" = 'user') {
		// Display error messages to the user and log them
		if (error instanceof TemplatePluginError) {
			console.error("TemplatePluginError: ", error.message);
			await this.log("error", context, error.userMessage || error.message, error);
		} else if (error instanceof UserCancelError) {
			// Just exit, no need to show a message or log
		} else if (error instanceof TemplateError) {
			console.error("Template error: ", error.message);
			await this.log("error", context, error.message, error);
		} else {
			console.error("Unexpected error: ", error);
			const message = error instanceof Error ? error.message : "An unexpected error occurred";
			const wrappedError = new TemplatePluginError(message, error);
			await this.log("error", context, message, wrappedError);
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

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
// Error Boundary - Catches React render errors and propagates them to modal error handlers
// ------------------------------------------------------------------------------------------------
interface ErrorBoundaryProps {
	onError: (error: Error) => void;
	children: ReactNode;
}
interface ErrorBoundaryState {
	hasError: boolean;
}
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}
	static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
		return { hasError: true };
	}
	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// Error will be logged by handleErrors - just pass it along
		// Defer to next tick to avoid "synchronously unmount while rendering" race condition
		setTimeout(() => this.props.onError(error), 0);
	}
	render() {
		if (this.state.hasError) {
			return null; // Modal will close, ErrorModal will show
		}
		return this.props.children;
	}
}

// ------------------------------------------------------------------------------------------------
// Card Type Selection Modal
// ------------------------------------------------------------------------------------------------
export class CardTypeSelectionModal extends Modal {
	cardTypes: PathFolder[];
	settings: Z2KTemplatesPluginSettings;
	resolve: (cardType: PathFolder) => void;
	reject: (error: Error) => void;
	root: any; // For React root

	constructor(app: App, cardTypes: PathFolder[], settings: Z2KTemplatesPluginSettings, resolve: (cardType: PathFolder) => void, reject: (error: Error) => void) {
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
			<ErrorBoundary onError={(error) => { this.reject(error); this.close(); }}>
				<CardTypeSelector
					cardTypes={this.cardTypes}
					settings={this.settings}
					onConfirm={(cardType: PathFolder) => {
						this.resolve(cardType);
						this.close();
					}}
					onCancel={() => {
						this.reject(new UserCancelError(`User cancelled ${cardRefNameLower(this.settings)} type selection`));
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

interface CardTypeSelectorProps {
	cardTypes: PathFolder[];
	settings: Z2KTemplatesPluginSettings;
	onConfirm: (cardType: PathFolder) => void;
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
							<span className="selection-primary" title={cardType.path}>{getPrettyPath(cardType.path)}</span>
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
	templates: PathFile[];
	settings: Z2KTemplatesPluginSettings;
	resolve: (template: PathFile) => void;
	reject: (error: Error) => void;
	root: any; // For React root

	constructor(app: App, templates: PathFile[], settings: Z2KTemplatesPluginSettings, resolve: (template: PathFile) => void, reject: (error: Error) => void){
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
			<ErrorBoundary onError={(error) => { this.reject(error); this.close(); }}>
				<TemplateSelector
					templates={this.templates}
					settings={this.settings}
					onConfirm={(template: PathFile) => {
						this.resolve(template);
						this.close();
					}}
					onCancel={() => {
						this.reject(new UserCancelError("User cancelled template selection"));
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

interface TemplateSelectorProps {
	templates: PathFile[];
	settings: Z2KTemplatesPluginSettings;
	onConfirm: (template: PathFile) => void;
	onCancel: () => void;
}

// React component for the modal content
const TemplateSelector = ({ templates, settings, onConfirm, onCancel }: TemplateSelectorProps) => {
	const getItems = (): { file: PathFile, name: string, cardType: string }[] => {
		const rootPath = normalizeFullPath(settings.templatesRootFolder);
		return templates.map((template: PathFile) => {
			let parentPath = normalizeFullPath(template.parentPath);
			// Show path relative to templates root
			if (rootPath && parentPath.startsWith(rootPath + '/')) {
				parentPath = parentPath.slice(rootPath.length + 1);
			} else if (parentPath === rootPath) {
				parentPath = "";
			}
			return { file: template, name: template.basename, cardType: parentPath }
		});
	}

	const [searchTerm, setSearchTerm] = useState<string>('');
	const [filteredItems, setFilteredItems] = useState<{ file: PathFile, name: string, cardType: string }[]>(getItems());
	const [selectedIndex, setSelectedIndex] = useState<number>(0);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	// Filter templates when search term changes
	useEffect(() => {
		// const filtered = templates.filter((template: PathFile) => {
		// 	const nameMatch = template.basename.toLowerCase().includes(searchTerm.toLowerCase());
		// 	const pathMatch = template.parentPath.toLowerCase().includes(searchTerm.toLowerCase()) || false;
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
					filteredItems.map((item: { file: PathFile, name: string, cardType: string }, index: number) => (
						<div
							key={item.file.path}
							className={`selection-item ${selectedIndex === index ? 'selected' : ''}`}
							onClick={() => onConfirm(item.file)}
							tabIndex={index + 2} // +2 because search is tabIndex 1
						>
							{/* <span className="selection-primary">{template.basename}</span>
							<span className="selection-secondary">{template.parentPath || ''}</span> */}
							<span className="selection-primary">
								{highlightMatch(item.name, searchTerm)}
							</span>
							<span className="selection-secondary" title={item.cardType}>
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
// I tried a long time to block the closing upon clicking outside the modal but was not able to do so.

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
	userHelpers: Record<string, Function>;
	resolve: (finalize: boolean) => void;
	reject: (error: Error) => void;
	root: any; // React root

	constructor(app: App, title: string, templateState: TemplateState, userHelpers: Record<string, Function>, resolve: (finalize: boolean) => void, reject: (error: Error) => void) {
		super(app);
		this.title = title;
		this.templateState = templateState;
		this.userHelpers = userHelpers;
		this.resolve = resolve;
		this.reject = reject;
	}

	onOpen() {
		this.modalEl.addClass('z2k', 'field-collection-modal');
		this.titleEl.setText(this.title);
		this.contentEl.empty();
		this.contentEl.addClass('modal-content');
		this.root = createRoot(this.contentEl);
		const handleError = (error: Error) => { this.reject(error); this.close(); };
		this.root.render(
			<ErrorBoundary onError={handleError}>
				<FieldCollectionForm
					templateState={this.templateState}
					userHelpers={this.userHelpers}
					onComplete={(finalize) => {
						this.resolve(finalize);
						this.close();
					}}
					onCancel={() => {
						this.reject(new UserCancelError("User cancelled field collection"));
						this.close();
					}}
					onError={handleError}
				/>
			</ErrorBoundary>
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
	userHelpers: Record<string, Function>;
	onComplete: (finalize: boolean) => void;
	onCancel: () => void;
	onError: (error: Error) => void;
}
const FieldCollectionForm = ({ templateState, userHelpers, onComplete, onCancel, onError }: FieldCollectionFormProps) => {
	function formatFieldName(str: string): string {
		str = str.charAt(0).toUpperCase() + str.slice(1);
		return str
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')      // ParseXML → Parse XML, GLTF2L → GLTF2 L
			.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')   // XMLFile → XML File, HTTPServer → HTTP Server
			.trim();
	}

	function computeInitialFieldStates(): Record<string, FieldState> {
		const initialFieldStates: Record<string, FieldState> = {};

		for (const [fieldName, fieldInfo] of Object.entries(templateState.fieldInfos)) {
			// Get dependencies using shared helper
			const dependencies = getFieldDependencies(fieldInfo);

			// Determine if field is already specified externally
			const wasSpecified = fieldName in templateState.resolvedValues;

			// Initial value: use existing value, or suggest, or empty
			// NOTE: This is a best-effort initial value. The real values will be
			// calculated in updateFieldStates which runs immediately after first render.
			const currentValue = wasSpecified
				? templateState.resolvedValues[fieldName]
				: (fieldInfo.suggest ?? '');

			// Initialize selectedIndices for select fields
			let initialSelectedIndices: number[] | undefined = undefined;
			if (fieldInfo.type === 'singleSelect' || fieldInfo.type === 'multiSelect') {
				if (fieldInfo.type === 'singleSelect' && currentValue !== '' && currentValue !== undefined) {
					const index = fieldInfo.opts?.findIndex(opt => opt === currentValue) ?? -1;
					initialSelectedIndices = index >= 0 ? [index] : [0];
				} else if (fieldInfo.type === 'multiSelect' && Array.isArray(currentValue)) {
					initialSelectedIndices = currentValue
						.map(val => fieldInfo.opts?.findIndex(opt => opt === val) ?? -1)
						.filter(idx => idx >= 0);
				}
			}

			initialFieldStates[fieldName] = {
				value: currentValue,
				omitFromForm: (fieldInfo.directives?.includes('no-prompt') || !templateState.referencedFields.has(fieldName)) ?? false,
				touched: false,
				focused: false,
				hasError: false,
				dependencies: [...new Set(dependencies)],
				dependentFields: [],
				resolvedPrompt: String(fieldInfo.prompt) ?? formatFieldName(fieldName),
				resolvedSuggest: fieldInfo.suggest ?? "",
				resolvedFallback: fieldInfo.fallback ?? "",
				resolvedOpts: fieldInfo.opts,
				selectedIndices: initialSelectedIndices
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
		const depsMap: Record<string, string[]> = {};
		for (const [name, state] of Object.entries(initialFieldStates)) {
			depsMap[name] = state.dependencies;
		}
		const circularDependency = detectCircularDependencies(depsMap);
		if (circularDependency.length > 0) {
			const error = new TemplatePluginError(
				`Circular dependency detected in template fields: ${circularDependency.join(' -> ')}`
			);
			error.userMessage = `Circular dependency detected in template fields: ${circularDependency.join(' -> ')}`;
			setTimeout(() => { onError(error); }, 0);
			return {};
		}

		return initialFieldStates;
	}
	function computeInitialRenderOrderFieldNames(): string[] {
		// let renderOrderFieldNames = dependencyOrderedFieldNames;
		let renderOrderFieldNames = Object.keys(fieldStates);
		renderOrderFieldNames = renderOrderFieldNames.filter(fieldName => !fieldStates[fieldName].omitFromForm);
		// Put required fields at the top
		const requiredFields = renderOrderFieldNames.filter(fieldName => {
			return templateState.fieldInfos[fieldName]?.directives?.includes('required') ?? false;
		});
		const optionalFields = renderOrderFieldNames.filter(fieldName => {
			return !(templateState.fieldInfos[fieldName]?.directives?.includes('required') ?? false);
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
	const [dependencyOrderedFieldNames] = useState<string[]>(() => {
		const depsMap: Record<string, string[]> = {};
		for (const [name, state] of Object.entries(fieldStates)) {
			depsMap[name] = state.dependencies;
		}
		return calculateFieldDependencyOrder(depsMap);
	});
	const [renderOrderFieldNames] = useState<string[]>(() => computeInitialRenderOrderFieldNames());
	// Update fields after the first render to distribute and apply dependencies
	useEffect(() => {
		let newFieldStates = {...fieldStates};
		updateFieldStates(newFieldStates);
		validateAllFields(newFieldStates, false);
		setFieldStates(newFieldStates);
	}, []);

	function updateFieldStates(newFieldStates: Record<string, FieldState>) {
		for (const fieldName of dependencyOrderedFieldNames) {
			const fieldInfo = templateState.fieldInfos[fieldName];
			if (!fieldInfo) { continue; }

			// Build context from current field values (excluding undefined)
			const context: Record<string, VarValueType> = {};
			for (const [name, state] of Object.entries(newFieldStates)) {
				if (state.value !== undefined) {
					context[name] = state.value;
				}
			}

			// Resolve value= if present (and not overridden by external data or user input)
			if (fieldInfo.value !== undefined && !(fieldName in templateState.resolvedValues) && !newFieldStates[fieldName].touched) {
				const valueDeps = Z2KTemplateEngine.reducedGetDependencies(fieldInfo.value);
				const allDepsExist = valueDeps.every(dep => dep in context);
				if (allDepsExist) {
					newFieldStates[fieldName].value = Z2KTemplateEngine.reducedRenderContent(fieldInfo.value, context, true, userHelpers);
				} else {
					newFieldStates[fieldName].value = undefined;
				}
			}

			// Resolve display fields
			newFieldStates[fieldName].resolvedPrompt = String(Z2KTemplateEngine.reducedRenderContent(fieldInfo.prompt || formatFieldName(fieldName), context, true, userHelpers));
			newFieldStates[fieldName].resolvedSuggest = Z2KTemplateEngine.reducedRenderContent(fieldInfo.suggest || "", context, true, userHelpers);
			newFieldStates[fieldName].resolvedFallback = Z2KTemplateEngine.reducedRenderContent(fieldInfo.fallback || "", context, true, userHelpers);

			// Update resolved options for select fields
			if ((fieldInfo.type === 'singleSelect' || fieldInfo.type === 'multiSelect') && fieldInfo.opts) {
				newFieldStates[fieldName].resolvedOpts = fieldInfo.opts.map(opt =>
					Z2KTemplateEngine.reducedRenderContent(opt, context, false, userHelpers)
				);

				// Update values based on selectedIndices if they exist
				const selectedIndices = newFieldStates[fieldName].selectedIndices;
				const resolvedOpts = newFieldStates[fieldName].resolvedOpts!;
				if (selectedIndices && selectedIndices.length > 0) {
					if (fieldInfo.type === 'singleSelect') {
						const idx = selectedIndices[0];
						if (idx >= 0 && idx < resolvedOpts.length) {
							newFieldStates[fieldName].value = resolvedOpts[idx];
						}
					} else if (fieldInfo.type === 'multiSelect') {
						newFieldStates[fieldName].value = selectedIndices
							.filter(idx => idx >= 0 && idx < resolvedOpts.length)
							.map(idx => resolvedOpts[idx]);
					}
				}
			}

			// Auto-update value for untouched, unspecified, non-computed fields
			if (fieldInfo.value === undefined
				&& !(fieldName in templateState.resolvedValues)
				&& !newFieldStates[fieldName].touched) {
				if (fieldInfo.type === 'singleSelect' || fieldInfo.type === 'multiSelect') {
					const resolvedSuggest = newFieldStates[fieldName].resolvedSuggest;
					const resolvedOpts = newFieldStates[fieldName].resolvedOpts || [];

					if (fieldInfo.type === 'singleSelect') {
						const suggestIndex = resolvedOpts.findIndex(opt => opt === resolvedSuggest);
						if (suggestIndex >= 0) {
							newFieldStates[fieldName].value = resolvedSuggest;
							newFieldStates[fieldName].selectedIndices = [suggestIndex];
						} else {
							newFieldStates[fieldName].value = undefined;
							newFieldStates[fieldName].selectedIndices = [];
						}
					} else if (fieldInfo.type === 'multiSelect') {
						const suggestValues = Array.isArray(resolvedSuggest) ? resolvedSuggest : [resolvedSuggest];
						const suggestIndices = suggestValues
							.map(val => resolvedOpts.findIndex(opt => opt === val))
							.filter(idx => idx >= 0);

						if (suggestIndices.length > 0) {
							newFieldStates[fieldName].value = suggestIndices.map(idx => resolvedOpts[idx]);
							newFieldStates[fieldName].selectedIndices = suggestIndices;
						} else {
							newFieldStates[fieldName].value = [];
							newFieldStates[fieldName].selectedIndices = [];
						}
					}
				} else {
					newFieldStates[fieldName].value = newFieldStates[fieldName].resolvedSuggest;
				}
			}
		}
	}

	function	validateAllFields(newFieldStates: Record<string, FieldState>, finalize: boolean): boolean {
		let isValid: boolean = true;
		for (const fieldName of Object.keys(newFieldStates)) {
			const fieldInfo = templateState.fieldInfos[fieldName];
			if (!fieldInfo) {
				console.error(`Field ${fieldName} not found in fieldInfos`);
				return true; // Skip validation if field not found
			}

			const value = fieldStates[fieldName].value;
			let hasError = false;
			let hasFinalizeError = false;
			let errorMessage = '';

			// Basic validation based on field type
			if (fieldInfo.type === 'number' && isNaN(Number(value))) {
				hasError = true;
				errorMessage = 'Please enter a valid number';
			}
			if (value === '' && fieldInfo.directives?.includes('required')) {
				hasFinalizeError = true;
				errorMessage = 'This field is required to finalize';
			}
			if (fieldName === 'fileTitle' || fieldInfo.type === "titleText") {
				if (typeof value !== 'string') {
					hasError = true;
					errorMessage = 'Invalid value';
				} else {
					const valueTrimmed = value.trim();
					if (fieldInfo.type === "titleText") {
						if (/^[.]+$/.test(valueTrimmed)) {
							hasError = true;
							errorMessage = 'Cannot be just dots';
						} else if (/[<>:"/\\|?*\u0000-\u001F]/.test(valueTrimmed)) {
							hasError = true;
							errorMessage = 'Contains invalid characters (\\ / : * ? " < > |)';
						} else if (/[. ]+$/.test(value)) { // not trimmed
							hasError = true;
							errorMessage = 'Cannot end with a space or dot';
						}
					}
				}
			}
			newFieldStates[fieldName].hasError = hasError || hasFinalizeError;
			newFieldStates[fieldName].errorMessage = errorMessage;

			// Only block submission for required fields if finalize is true
			if (hasError) { isValid = false; }
			if (hasFinalizeError && finalize) { isValid = false; }
		}
		return isValid;
	}

	function handleFieldChange(fieldName: string, value: VarValueType, selectedIndices?: number[]) {
		let newFieldStates = { ...fieldStates };
		newFieldStates[fieldName].value = value;
		newFieldStates[fieldName].touched = true;
		// Update selectedIndices if provided (for singleSelect/multiSelect fields)
		if (selectedIndices !== undefined) {
			newFieldStates[fieldName].selectedIndices = selectedIndices;
		}
		updateFieldStates(newFieldStates);
		validateAllFields(newFieldStates, false);
		setFieldStates(newFieldStates);
	};

	function handleFieldFocus(fieldName: string) {
		let newFieldStates = { ...fieldStates };
		newFieldStates[fieldName].touched = true;
		newFieldStates[fieldName].focused = true;
		updateFieldStates(newFieldStates);
		validateAllFields(newFieldStates, false);
		setFieldStates(newFieldStates);
	};

	function handleFieldBlur(fieldName: string) {
		let newFieldStates = { ...fieldStates };
		newFieldStates[fieldName].focused = false;
		updateFieldStates(newFieldStates);
		validateAllFields(newFieldStates, false);
		setFieldStates(newFieldStates);
	};

	function handleFieldReset(fieldName: string) {
		let newFieldStates = { ...fieldStates };
		newFieldStates[fieldName].touched = false;
		newFieldStates[fieldName].value = newFieldStates[fieldName].resolvedSuggest;
		updateFieldStates(newFieldStates);
		validateAllFields(newFieldStates, false);
		setFieldStates(newFieldStates);
	}

	function handleSubmit(e: React.FormEvent, finalize: boolean = false) {
		e.preventDefault();

		// Abort if there are errors
		let isValid = validateAllFields(fieldStates, finalize);
		if (!isValid) {
			scrollToFirstError();
			return;
		}

		// Update template state with resolved values
		// NOTE: Similar logic exists in applyFinalFieldStates(). If you modify
		// the value= or fallback handling here, check if the same change is needed there.
		for (const fieldName of dependencyOrderedFieldNames) {
			const fieldInfo = templateState.fieldInfos[fieldName];
			if (!fieldInfo) { continue; }
			const fieldState = fieldStates[fieldName];
			const value = fieldState.value;

			// fileTitle is special - always write it (file needs a name)
			if (fieldState.touched || fieldName === 'fileTitle') {
				// User interacted with field (or it's fileTitle) - write the value
				if (value === undefined) {
					delete templateState.resolvedValues[fieldName];
				} else {
					templateState.resolvedValues[fieldName] = value;
				}
			} else if (fieldInfo.value !== undefined && !(fieldName in templateState.resolvedValues)) {
				// Computed field (value=) not overridden by external data
				// NOTE: Similar logic in applyFinalFieldStates() - keep in sync
				if (value === undefined) {
					delete templateState.resolvedValues[fieldName];
				} else {
					templateState.resolvedValues[fieldName] = value;
				}
			} else if (finalize && !(fieldName in templateState.resolvedValues) && !fieldInfo.directives?.includes('finalize-preserve')) {
				// Unspecified field during finalization - use fallback value
				// Skip finalize-preserve fields - leave undefined so preservation logic handles them
				// NOTE: Similar logic in applyFinalFieldStates() - keep in sync
				const fallbackValue = fieldState.resolvedFallback;
				if (fallbackValue === undefined) {
					delete templateState.resolvedValues[fieldName];
				} else {
					templateState.resolvedValues[fieldName] = fallbackValue || '';
				}
			}
			// Else: field already specified externally, leave it alone
		}

		onComplete(finalize);
	}

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
		const fieldInfo = templateState.fieldInfos[fieldName];
		const fieldState = fieldStates[fieldName];

		if (!fieldInfo || !fieldState) return null;

		return (
			<div key={fieldName} className={`field-container ${
				fieldState.hasError ? 'has-error' : (fieldState.touched ? 'touched' : '')
			}`}>
				<FieldInput
					name={fieldName}
					label={fieldState.resolvedPrompt || fieldName}
					fieldInfo={fieldInfo}
					fieldState={fieldState}
					onChange={(value, selectedIndices) => handleFieldChange(fieldName, value, selectedIndices)}
					onFocus={() => handleFieldFocus(fieldName)}
					onBlur={() => handleFieldBlur(fieldName)}
					onReset={() => handleFieldReset(fieldName)}
				/>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="field-collection-form">
			{templateState.fieldInfos['fileTitle'] && fieldStates['fileTitle']?.omitFromForm !== true && (
				<div className="field-title-container">{getFieldContainer('fileTitle')}</div>
			)}
			<div className="field-list">
				{renderOrderFieldNames.filter(fieldName => fieldName !== 'fileTitle').length > 0 ? (
					renderOrderFieldNames
						.filter(fieldName => fieldName !== 'fileTitle')
						.map(fieldName => getFieldContainer(fieldName))
				) : (
					<div className="no-fields-message">No{renderOrderFieldNames.filter(fieldName => fieldName === 'fileTitle').length > 0 ? ' other ' : ' '}fields to fill.</div>
				)}
			</div>

			<div className="form-actions">
				<button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
				<button type="submit" className="btn btn-primary">Save for Now</button>
				<button type="button" className="btn btn-primary" onClick={(e) => handleSubmit(e, true)}>Finalize</button>
			</div>
		</form>
	);
};

/**
 * Tracks the state of a field during form interaction.
 *
 * ## Value Storage: fieldInfo.value vs resolvedValues
 *
 * Two properties control field values - understanding when to use each is critical:
 *
 * ### fieldInfo.value (formula)
 * A template expression that computes the field's value from other fields.
 * Example: `value="{{firstName}} {{lastName}}"`
 * - Re-evaluated whenever dependencies change (until user edits the field)
 * - Used by: fieldInfo value= parameter, URI overrides, YAML frontmatter values
 * - When adding external data, store here so {{references}} resolve dynamically
 *
 * ### resolvedValues[fieldName] (locked result)
 * Concrete value that should NOT be re-computed. Key existence = "field is specified."
 * - Used for: form submission results, values that are "locked in"
 * - If a field is in resolvedValues, its formula (fieldInfo.value) is ignored
 *
 * ### touched (user override flag)
 * Set to true when user interacts with a field in the form.
 * Once touched, the field's formula stops auto-updating, preserving user input.
 *
 * ### Priority (highest to lowest)
 * 1. User input (touched = true) - user's edits are preserved
 * 2. resolvedValues - externally locked, no re-computation
 * 3. fieldInfo.value formula - computed from dependencies
 * 4. fieldInfo.suggest - suggested value shown in prompt
 *
 * ## Resolution System Overview
 *
 * The source of truth for whether a field is "specified" is KEY EXISTENCE in
 * templateState.resolvedValues (not the value itself). This allows undefined
 * as a valid value while still distinguishing "unspecified" fields.
 *
 * - Key exists in resolvedValues → field is specified → will be rendered
 * - Key doesn't exist → field is unspecified → {{field}} preserved in output
 *
 * When setting values:
 * - If value is undefined, delete the key: `delete resolvedValues[field]`
 * - Otherwise set normally: `resolvedValues[field] = value`
 *
 * ## Field State Properties
 *
 * - `value`: Current value shown in UI and used in dependency context.
 *   For computed fields (value=), this is calculated from dependencies.
 *   Set to undefined if dependencies are missing.
 *
 * - `touched`: Whether user has interacted with this field in the current
 *   form session. Used to determine if user input should override defaults,
 *   and whether to write to resolvedValues at submit.
 *
 * - `omitFromForm`: Field is hidden from UI. Set when field has 'no-prompt'
 *   directive or has a value= property.
 *
 * Note: We previously had `alreadyResolved` which tracked if a field had a
 * value in resolvedValues at form init. This was removed because we can
 * simply check `fieldName in templateState.resolvedValues` directly, since
 * templateState.resolvedValues is not mutated during form operation.
 */
interface FieldState {
	// The current value of the field
	// 	Should always be ready to be verified/submitted (except for fallback resolution, that can be applied upon being verified/submitted)
	//    Should also always be what's shown in the field and be used for dependencies
	value: VarValueType;
	omitFromForm: boolean;
	// Keeps track of whether the field has been interacted with
	// 	(determines fallback text behavior and suggest value behavior in the field itself)
	touched: boolean;
	focused: boolean;
	hasError: boolean;
	errorMessage?: string;
	dependentFields: string[]; // Fields that depend on this field
	dependencies: string[]; // Fields this field depends on
	resolvedPrompt?: string; // Prompt text with references resolved
	resolvedSuggest?: VarValueType; // Suggest value with references resolved
	resolvedFallback?: VarValueType; // Fallback text with references resolved
	resolvedOpts?: VarValueType[]; // Options with references resolved (for singleSelect/multiSelect)
	selectedIndices?: number[]; // Selected option indices (for singleSelect this is an array of size 1, for multiSelect it can be multiple)
}

function getFieldDependencies(fieldInfo: FieldInfo): string[] {
	const deps: string[] = [];
	if (fieldInfo.prompt) {
		deps.push(...Z2KTemplateEngine.reducedGetDependencies(fieldInfo.prompt));
	}
	if (fieldInfo.suggest) {
		deps.push(...Z2KTemplateEngine.reducedGetDependencies(fieldInfo.suggest));
	}
	if (fieldInfo.fallback) {
		deps.push(...Z2KTemplateEngine.reducedGetDependencies(fieldInfo.fallback));
	}
	if (fieldInfo.value) {
		deps.push(...Z2KTemplateEngine.reducedGetDependencies(fieldInfo.value));
	}
	if (fieldInfo.opts) {
		for (const opt of fieldInfo.opts) {
			if (opt) {
				deps.push(...Z2KTemplateEngine.reducedGetDependencies(opt));
			}
		}
	}
	return [...new Set(deps)];
}

function buildDependencyMap(fieldInfos: Record<string, FieldInfo>): Record<string, string[]> {
	const deps: Record<string, string[]> = {};
	for (const [fieldName, fieldInfo] of Object.entries(fieldInfos)) {
		deps[fieldName] = getFieldDependencies(fieldInfo);
	}
	return deps;
}

/**
 * Returns an array of field names involved in circular dependencies, or an empty array if none are found
 */
function detectCircularDependencies(dependencies: Record<string, string[]>): string[] {
	const visited = new Set<string>();
	const stack: string[] = [];
	let circularPath: string[] = [];

	function visit(fieldName: string) {
		const cycleStartIndex = stack.indexOf(fieldName);
		if (cycleStartIndex !== -1) {
			circularPath = [...stack.slice(cycleStartIndex), fieldName];
			return;
		}
		if (visited.has(fieldName)) { return; }

		visited.add(fieldName);
		stack.push(fieldName);

		const deps = dependencies[fieldName];
		if (deps) {
			for (const dependency of deps) {
				visit(dependency);
				if (circularPath.length > 0) { return; }
			}
		}

		stack.pop();
	}

	for (const fieldName of Object.keys(dependencies)) {
		visit(fieldName);
		if (circularPath.length > 0) { return circularPath; }
	}

	return [];
}

function calculateFieldDependencyOrder(dependencies: Record<string, string[]>): string[] {
	const orderedFields: string[] = [...Object.keys(dependencies)];

	let madeChange = true;
	while (madeChange) {
		madeChange = false;
		for (const fieldName of [...orderedFields]) {
			const deps = dependencies[fieldName];
			if (!deps) { continue; }
			const fieldIndex = orderedFields.indexOf(fieldName);
			let maxDepIndex = -1;
			for (const dep of deps) {
				const depIndex = orderedFields.indexOf(dep);
				if (depIndex > maxDepIndex) {
					maxDepIndex = depIndex;
				}
			}
			if (maxDepIndex >= 0 && fieldIndex < maxDepIndex) {
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
	fieldInfo: FieldInfo;
	fieldState: FieldState;
	onChange: (value: any, selectedIndices?: number[]) => void;
	onFocus: () => void;
	onBlur: () => void;
	onReset: () => void;
}

const FieldInput = ({ name, label, fieldInfo, fieldState, onChange, onFocus, onBlur, onReset }: FieldInputProps) => {
	// Generate a unique ID for the input element
	const inputId = `field-${name}`;
	const dataType = fieldInfo.type || 'text';

	// Common props for input elements
	const commonProps = {
		id: inputId,
		name,
		onFocus,
		onBlur,
		'aria-invalid': fieldState.hasError
	};

	const toHumanReadable = (value: VarValueType): string => {
		if (Array.isArray(value)) { return value.map(v => String(v)).join(', '); }
		if (value === null) { return '[null]'; }
		if (value === undefined) { return '[undefined]'; }
		return String(value);
	};

	// For input field display: show empty for null/undefined instead of [null]/[undefined]
	const toInputDisplayValue = (value: VarValueType): string => {
		if (value === null || value === undefined) { return ''; }
		return toHumanReadable(value);
	};

	const toInputValue = (value: VarValueType): string => {
		if (value === null || value === undefined) { return ''; }
		if (Array.isArray(value)) { return value.map(v => String(v)).join(', '); }
		if (dataType === 'date') {
			if (typeof value !== 'string') { return ''; }
			const m = moment(value);
			return m.isValid() ? m.format("YYYY-MM-DD") : '';
		}
		if (dataType === 'datetime') {
			if (typeof value !== 'string') { return ''; }
			const m = moment(value);
			return m.isValid() ? m.format("YYYY-MM-DDTHH:mm:ss") : '';
		}
		return String(value);
	};


	// Render the appropriate input based on data type
	function renderInput() {
		switch(dataType) {
			case 'titleText':
				return (
					<input
						type="text"
						className={`title-text-input ${fieldState.hasError ? 'has-error' : ''} ${!fieldState.touched && fieldState.resolvedSuggest ? 'showing-suggest' : ''}`}
						value={toInputDisplayValue(fieldState.value)}
						onChange={(e) => onChange(e.target.value)}
						{...commonProps}
					/>
				);

			case 'text':
				return (
					<textarea
						className={`text-input ${fieldState.hasError ? 'has-error' : ''} ${!fieldState.touched && fieldState.resolvedSuggest ? 'showing-suggest' : ''}`}
						value={toInputDisplayValue(fieldState.value)}
						onChange={(e) => onChange(e.target.value)}
						{...commonProps}
					/>
				);

			case 'number':
				return (
					<input
						type="number"
						className={`number-input ${fieldState.hasError ? 'has-error' : ''} ${!fieldState.touched && fieldState.resolvedSuggest ? 'showing-suggest' : ''}`}
						value={toInputDisplayValue(fieldState.value)}
						onChange={(e) => {
							const num = Number(e.target.value);
							onChange(isNaN(num) ? undefined : num);
						}}
						{...commonProps}
					/>
				);

			case 'date':
				return (
					<input
						type="date"
						className={`date-input ${fieldState.hasError ? 'has-error' : ''}`}
						value={toInputValue(fieldState.value)}
						onChange={(e) => {
							const m = moment(e.target.value, "YYYY-MM-DD", true);
							onChange(m.isValid() ? m.format("YYYY-MM-DD") : undefined);
						}}
						{...commonProps}
					/>
				);

			case 'datetime':
				return (
					<input
						type="datetime-local"
						className={`date-input ${fieldState.hasError ? 'has-error' : ''}`}
						value={toInputValue(fieldState.value)}
						onChange={(e) => {
							let m = moment(e.target.value, "YYYY-MM-DDTHH:mm:ss", true);
							if (!m.isValid()) {
								m = moment(e.target.value, "YYYY-MM-DDTHH:mm", true);
							}
							if (m.isValid()) {
								const formatted = m.second() === 0
									? m.format("YYYY-MM-DD HH:mm")
									: m.format("YYYY-MM-DD HH:mm:ss");
								onChange(formatted);
							} else {
								onChange(undefined);
							}
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
							checked={Boolean(fieldState.value)}
							onChange={(e) => onChange(e.target.checked)}
							{...commonProps}
						/>
						<label htmlFor={inputId} className="checkbox-label" title={generateHoverText()}>{label}</label>
					</div>
				);

			case 'singleSelect':
				const resolvedOpts = fieldState.resolvedOpts || [];
				const selectedIndex = fieldState.selectedIndices?.[0] ?? -1;
				return (
					<select
						className={`select-input ${fieldState.hasError ? 'has-error' : ''}`}
						value={selectedIndex >= 0 ? String(selectedIndex) : ""}
						onChange={(e) => {
							const newIndex = Number(e.target.value);
							const newValue = !isNaN(newIndex) && newIndex >= 0 ? resolvedOpts[newIndex] : undefined;
							onChange(newValue, isNaN(newIndex) ? [] : [newIndex]);
						}}
						{...commonProps}
					>
						<option value="">Select an option</option>
						{resolvedOpts.map((option, index) => (
							<option key={index} value={String(index)}>
								{toHumanReadable(option)}
							</option>
						))}
					</select>
				);

			case 'multiSelect':
				// For multiSelect, we need to handle an array of values
				const resolvedOptsMulti = fieldState.resolvedOpts || [];
				const selectedIndicesMulti = fieldState.selectedIndices || [];
				return (
					<div className={`multi-select-container ${fieldState.hasError ? 'has-error' : ''}`}>
						{resolvedOptsMulti.map((option, index) => {
							const checkboxProps = {
								...commonProps,
								id: `${inputId}-${index}`,
								name: `${name}[${index}]`
							};
							return (
							<div key={index} className="multi-select-option">
								<input
									type="checkbox"
									checked={selectedIndicesMulti.includes(index)}
									onChange={(e) => {
										const newIndices = e.target.checked
											? [...selectedIndicesMulti, index] // Add the index
											: selectedIndicesMulti.filter(idx => idx !== index); // Remove the index
										// Get values for all selected indices
										const newValues = newIndices.map(idx => resolvedOptsMulti[idx]);
										onChange(newValues, newIndices);
									}}
										{...checkboxProps}
								/>
								<label htmlFor={`${inputId}-${index}`}>{toHumanReadable(option)}</label>
							</div>
							);
						})}
					</div>
				);
		}
	};

	function generateHoverText() {
		let finalText = "";
		finalText += `Field name: ${name}`;
		finalText += fieldInfo.directives?.length ?? 0 > 0 ? `\nDirectives: ${fieldInfo.directives?.join(', ')}` : '';
		finalText += fieldState.dependencies.length > 0 ? `\nDepends on: ${fieldState.dependencies.join(', ')}` : '';
		finalText += fieldState.dependentFields.length > 0 ? `\nUsed by: ${fieldState.dependentFields.join(', ')}` : '';
		return finalText;
	}

	function renderFallbackPreview() {
		if (fieldState.resolvedFallback && !fieldState.touched) {
			return (
				<div className="fallback-preview">
					Value if left untouched:<br/><span>{toHumanReadable(fieldState.resolvedFallback)}</span>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="field-input">
			{fieldInfo.type !== 'boolean' && (
				<div className="label-wrapper">
					<label htmlFor={inputId} title={generateHoverText()}>{label}</label>
					<span className="reset-icon-wrapper">
						<span
							className="reset-icon"
							title="Reset to suggested value"
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
			{renderFallbackPreview()}
			{fieldState.hasError && fieldState.errorMessage && (
				<div className="error-message">{fieldState.errorMessage}</div>
			)}
		</div>
	);

};

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
function QuickCommandsModalContent({ initialCommands, onSave, onCancel }: {
	initialCommands: QuickCommand[];
	onSave: (commands: QuickCommand[]) => void;
	onCancel: () => void;
}) {
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
	return (
		<div className="quick-commands-editor">
			{commands.length === 0 && (
				<div className="quick-commands-empty">No quick commands configured.</div>
			)}
			{commands.map((cmd, i) => (
				<div key={cmd.id} className="quick-command-card">
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
							<input
								type="text"
								value={cmd.targetFolder}
								placeholder="Leave empty to prompt, / for vault root"
								onChange={e => updateCommand(i, {targetFolder: e.target.value})}
							/>
						</label>
						<label>
							Template File
							<input
								type="text"
								value={cmd.templateFile}
								placeholder="Leave empty to prompt"
								onChange={e => updateCommand(i, {templateFile: e.target.value})}
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
			<div className="quick-commands-actions">
				<button
					className="mod-cta"
					onClick={() => setCommands(prev => [...prev, newQuickCommand()])}
				>
					Add Command
				</button>
			</div>
			<div className="quick-commands-footer">
				<button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
				<button className="btn btn-primary" onClick={() => onSave(commands)}>Save</button>
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

// ------------------------------------------------------------------------------------------------
// Confirmation Modal
// ------------------------------------------------------------------------------------------------
interface ConfirmationModalOptions {
	title: string;
	message: React.ReactNode; // Can be string, JSX, or array of elements
	confirmText: string;
	cancelText: string;
	confirmClass?: string; // CSS class for confirm button (default: btn-warning)
	modalClass?: string; // Additional CSS class for modal
}

export class ConfirmationModal extends Modal {
	options: ConfirmationModalOptions;
	onConfirm: (confirmed: boolean) => void;
	root: any;
	private responded = false;

	constructor(app: App, options: ConfirmationModalOptions, onConfirm: (confirmed: boolean) => void) {
		super(app);
		this.options = options;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		this.modalEl.addClass('z2k', 'confirmation-modal');
		if (this.options.modalClass) {
			this.modalEl.addClass(this.options.modalClass);
		}
		this.titleEl.setText(this.options.title);
		this.contentEl.empty();
		this.contentEl.addClass('modal-content');
		this.root = createRoot(this.contentEl);
		this.root.render(
			<>
				<div className="confirmation-message">{this.options.message}</div>
				<div className="confirmation-buttons">
					<button
						className="btn btn-secondary"
						onClick={() => {
							this.responded = true;
							this.onConfirm(false);
							this.close();
						}}
					>
						{this.options.cancelText}
					</button>
					<button
						className={`btn ${this.options.confirmClass ?? 'btn-warning'}`}
						onClick={() => {
							this.responded = true;
							this.onConfirm(true);
							this.close();
						}}
					>
						{this.options.confirmText}
					</button>
				</div>
			</>
		);
	}

	onClose() {
		// Treat X/Escape as cancellation
		if (!this.responded) { this.onConfirm(false); }
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
				<p className={`error-modal-message${!(this.error instanceof TemplateError) ? ' error-modal-message--raw' : ''}`}>{this.error.message}</p>
				{this.error instanceof TemplateError && (
					<p className="error-modal-description">{this.error.description}</p>
				)}
				<button
					className="btn btn-secondary"
					onClick={() => {
						const description = this.error instanceof TemplateError ? this.error.description : '';
						const text = this.error.message + (description ? '\n\n' + description : '') + '\n\n' + (this.error.stack ?? '');
						navigator.clipboard.writeText(text).then(() => {
							new Notice("Copied!", 2000);
						});
					}}
					style={{ alignSelf: 'flex-end' }}
				>
					Copy Full Error
				</button>
			</>
		);
	}
	onClose() {
		if (this.root) { this.root.unmount(); }
		this.contentEl.empty();
	}
}

// ------------------------------------------------------------------------------------------------
// Log Viewer Modal
// ------------------------------------------------------------------------------------------------
interface LogViewerModalOptions {
	title: string;
	logPath: string;
	emptyMessage?: string;
	onClear?: () => Promise<void>;
}

function LogViewerContent({ app, options, onClose }: { app: App; options: LogViewerModalOptions; onClose: () => void }) {
	const [content, setContent] = useState<string>('');
	const [error, setError] = useState<string | null>(null);
	const contentRef = useRef<HTMLPreElement>(null);
	const lastSizeRef = useRef<number>(-1);
	const lastMtimeRef = useRef<number>(-1);
	const isAtBottomRef = useRef<boolean>(true);

	// Track whether user is scrolled to bottom
	const handleScroll = () => {
		if (!contentRef.current) return;
		const el = contentRef.current;
		isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 20;
	};

	// Auto-scroll to bottom if user was already there
	useEffect(() => {
		if (isAtBottomRef.current && contentRef.current) {
			contentRef.current.scrollTop = contentRef.current.scrollHeight;
		}
	}, [content]);

	useEffect(() => {
		const poll = async () => {
			try {
				const exists = await app.vault.adapter.exists(options.logPath);
				if (!exists) {
					setContent('');
					setError(null);
					lastSizeRef.current = -1;
					lastMtimeRef.current = -1;
					return;
				}
				const stat = await app.vault.adapter.stat(options.logPath);
				if (!stat) return;
				if (stat.size === lastSizeRef.current && stat.mtime === lastMtimeRef.current) return;
				lastSizeRef.current = stat.size;
				lastMtimeRef.current = stat.mtime;
				const text = await app.vault.adapter.read(options.logPath);
				setContent(text);
				setError(null);
			} catch (e: any) {
				setError(`Failed to read log: ${e.message}`);
			}
		};
		poll(); // initial read
		const intervalId = window.setInterval(poll, 250);
		return () => window.clearInterval(intervalId);
	}, []);

	const handleClear = () => {
		if (!options.onClear) return;
		new ConfirmationModal(app, {
			title: 'Clear Log',
			message: 'Are you sure you want to clear the log file? This cannot be undone.',
			confirmText: 'Clear',
			cancelText: 'Cancel',
			confirmClass: 'btn-warning',
		}, async (confirmed) => {
			if (confirmed) { await options.onClear!(); }
		}).open();
	};

	const isEmpty = !content.trim();

	return (
		<div className="log-viewer-content">
			<pre ref={contentRef} className="log-viewer-display" onScroll={handleScroll}>
				{error ? error : isEmpty ? (options.emptyMessage ?? 'No log entries.') : content}
			</pre>
			<div className="log-viewer-footer">
				{options.onClear && (
					<button className="btn btn-warning" onClick={handleClear} disabled={isEmpty && !error}>Clear Log</button>
				)}
				<button className="btn btn-secondary" onClick={onClose}>Close</button>
			</div>
		</div>
	);
}

export class LogViewerModal extends Modal {
	options: LogViewerModalOptions;
	root: any;

	constructor(app: App, options: LogViewerModalOptions) {
		super(app);
		this.options = options;
	}

	onOpen() {
		this.modalEl.addClass('z2k', 'log-viewer-modal');
		this.titleEl.setText(this.options.title);
		this.contentEl.empty();
		this.contentEl.addClass('modal-content');
		this.root = createRoot(this.contentEl);
		this.root.render(
			<ErrorBoundary onError={(error) => { new Notice(`Log viewer error: ${error.message}`); this.close(); }}>
				<LogViewerContent app={this.app} options={this.options} onClose={() => this.close()} />
			</ErrorBoundary>
		);
	}

	onClose() {
		if (this.root) { this.root.unmount(); }
		this.contentEl.empty();
	}
}

