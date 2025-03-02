
import { App, Plugin, PluginSettingTab, Setting, Notice, Modal, FileSystemAdapter } from 'obsidian';
import fs from 'fs';
import moment from 'moment';

interface DateFromFilenameSettings {
	format: string;
	showConfirmation: boolean;
}

const DEFAULT_SETTINGS: DateFromFilenameSettings = {
	format: 'YYYY-MM-DD',
	showConfirmation: true
}

class ConfirmationModal extends Modal {
	files: Array<{fullPath: string, currentDate: Date, newDate: Date}>;
	onConfirm: () => void;

	constructor(app: App, files: Array<{fullPath: string, currentDate: Date, newDate: Date}>, onConfirm: () => void) {
		super(app);
		this.files = files;
		this.onConfirm = onConfirm;
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.createEl("h2", { text: "Files to Update" });

		// Set modal size with just max constraints
		const modalEl = this.modalEl;
		modalEl.style.width = "min(80vw, 1200px)";
		modalEl.style.maxHeight = "80vh";

		// Ensure modal is centered
		const modalContainer = contentEl.closest('.modal-container');
		if (modalContainer instanceof HTMLElement) {
			modalContainer.style.display = "flex";
			modalContainer.style.justifyContent = "center";
			modalContainer.style.alignItems = "center";
		}

		const container = contentEl.createDiv({ cls: "confirmation-container" });
		container.style.maxHeight = "calc(80vh - 160px)"; // Max height for very large lists
		container.style.overflow = "auto";
		container.style.marginBottom = "20px";

		// Create table
		const table = container.createEl("table", { cls: "date-update-table" });
		table.style.width = "100%";
		table.style.borderCollapse = "collapse";

		// Create header
		const thead = table.createEl("thead");
		const headerRow = thead.createEl("tr");
		["File Path", "Current Date", "New Date"].forEach(text => {
			const th = headerRow.createEl("th");
			th.setText(text);
			th.style.padding = "8px 12px";
			th.style.textAlign = "left";
			th.style.borderBottom = "2px solid var(--background-modifier-border)";
			th.style.color = "var(--text-muted)";
			th.style.fontWeight = "600";
		});

		// Create body
		const tbody = table.createEl("tbody");
		for (const file of this.files) {
			const row = tbody.createEl("tr");
			row.style.borderBottom = "1px solid var(--background-modifier-border)";

			// Normalize path separators and create path cell
			const normalizedPath = file.fullPath.replace(/[\\/]+/g, '/');
			const pathCell = row.createEl("td", { text: normalizedPath });
			pathCell.style.padding = "8px 12px";
			pathCell.style.fontFamily = "var(--font-monospace)";
			pathCell.style.fontSize = "0.9em";

			// Create date cells
			const currentDateCell = row.createEl("td", {
				text: moment(file.currentDate).format('YYYY-MM-DD HH:mm:ss')
			});
			currentDateCell.style.padding = "8px 12px";

			const newDateCell = row.createEl("td", {
				text: moment(file.newDate).format('YYYY-MM-DD HH:mm:ss')
			});
			newDateCell.style.padding = "8px 12px";
		}

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText("Update Files")
				.setCta()
				.onClick(() => {
					this.close();
					this.onConfirm();
				}))
			.addButton(btn => btn
				.setButtonText("Cancel")
				.onClick(() => this.close()));
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

export default class DateFromFilename extends Plugin {
	settings: DateFromFilenameSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'z2k-update-file-dates',
			name: 'Update file modification dates from filenames',
			callback: async () => this.updateDates()
		});

		this.addSettingTab(new DateFromFilenameSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async updateDates() {
		const files = this.app.vault.getFiles();
		const filesToUpdate: Array<{
			path: string,
			fullPath: string,
			currentDate: Date,
			newDate: Date
		}> = [];

		let adapter = this.app.vault.adapter;
		let basePath;
		if (adapter instanceof FileSystemAdapter) {
			basePath = adapter.getBasePath();
		} else {
			// I think this is the message we want?
			new Notice('This plugin is not supported on this platform.');
			return;
		}

		for (const file of files) {
			const m = moment(file.basename, this.settings.format, true);
			if (!m.isValid()) continue;

			const fullPath = `${basePath}/${file.path}`;
			const newDate = new Date(m.valueOf());
			const currentDate = await new Promise<Date>((resolve, reject) => {
				fs.stat(fullPath, (err: any, stats: any) => {
					if (err) reject(err);
					else resolve(stats.mtime);
				});
			});

			if (currentDate.getTime() !== newDate.getTime()) {
				filesToUpdate.push({
					path: file.path,
					fullPath: fullPath,
					currentDate: currentDate,
					newDate: newDate
				});
			}
		}

		if (filesToUpdate.length === 0) {
			new Notice('No files need updating');
			return;
		}

		const updateFiles = async () => {
			let updatedCount = 0;

			for (const file of filesToUpdate) {
				try {
					await new Promise<void>((resolve, reject) => {
						fs.utimes(
							file.fullPath,
							file.newDate,
							file.newDate,
							(err: any) => {
								if (err) reject(err);
								else resolve();
							}
						);
					});
					updatedCount++;
				} catch (error) {
					new Notice(`Error updating ${file.path}: ${error}`);
				}
			}

			new Notice(`Updated ${updatedCount} file` + (updatedCount !== 1 ? 's' : ''));
		};

		if (this.settings.showConfirmation) {
			new ConfirmationModal(this.app, filesToUpdate, updateFiles).open();
		} else {
			await updateFiles();
		}
	}
}

class DateFromFilenameSettingTab extends PluginSettingTab {
	plugin: DateFromFilename;

	constructor(app: App, plugin: DateFromFilename) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Date format')
			.setDesc('Format to search for in filenames (moment.js format)')
			.addText(text => text
				.setPlaceholder('YYYY-MM-DD')
				.setValue(this.plugin.settings.format)
				.onChange(async (value) => {
					this.plugin.settings.format = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show confirmation')
			.setDesc('Show a confirmation dialog with file list before updating')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showConfirmation)
				.onChange(async (value) => {
					this.plugin.settings.showConfirmation = value;
					await this.plugin.saveSettings();
				}));
	}
}