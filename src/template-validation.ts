import { MarkdownView, type TFile } from 'obsidian';
import { type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { linter, type Diagnostic } from '@codemirror/lint';
import { Handlebars } from './template-engine/main';
import { normalizeEol } from './utils';
import type Z2KTemplatesPlugin from './main';

type ValidationResult =
	| { valid: true }
	| { valid: false; line: number; col: number; brief: string; detail: string };

// Real-time Handlebars syntax validation for template files.
//
// The lint extension produces both the inline squiggle decoration and the
// hover tooltip — we use its defaults rather than rolling our own, with one
// dark-mode CSS override for the tooltip background. The status bar item
// tracks state and on click scrolls the cursor to the error position.
//
// Gating: only activates on files getFileTemplateTypeSync recognizes as a template.
export class TemplateValidationController {
	private statusBarItem: HTMLElement;
	private lastError: { line: number; col: number } | null = null;
	private debounceTimer: number | null = null;
	private waitingTimer: number | null = null;

	constructor(private plugin: Z2KTemplatesPlugin) {
		this.statusBarItem = plugin.addStatusBarItem();
		this.statusBarItem.addClass('z2k-template-validation-status');
		// Hide synchronously so the empty min-width slot doesn't flash before
		// refreshFromActiveFile (async) settles to its real state.
		this.statusBarItem.addClass('z2k-template-hidden');
		this.plugin.registerDomEvent(this.statusBarItem, 'click', () => this.handleStatusBarClick());
		void this.refreshFromActiveFile();
	}

	getEditorExtensions(): Extension[] {
		return [
			EditorView.updateListener.of((update) => {
				if (update.docChanged) { this.scheduleWaiting(); }
			}),
			linter((view) => this.runLinter(view), { delay: 700 }),
		];
	}

	// Debounce flipping to "Validating" — avoids flicker during continuous typing.
	// If the linter completes (set Valid/Invalid) before the timer fires, we never show it.
	private scheduleWaiting() {
		if (this.waitingTimer !== null) { window.clearTimeout(this.waitingTimer); }
		this.waitingTimer = window.setTimeout(() => {
			this.waitingTimer = null;
			this.setWaiting();
		}, 200);
	}

	private clearWaitingTimer() {
		if (this.waitingTimer !== null) {
			window.clearTimeout(this.waitingTimer);
			this.waitingTimer = null;
		}
	}

	onActiveLeafChange() {
		this.clearDebounce();
		void this.refreshFromActiveFile();
	}

	onFileModify(file: TFile) {
		const active = this.plugin.app.workspace.getActiveFile();
		if (!active || file.path !== active.path) { return; }
		this.clearDebounce();
		this.debounceTimer = window.setTimeout(() => {
			this.debounceTimer = null;
			void this.refreshFromActiveFile();
		}, 1000);
	}

	destroy() {
		this.clearDebounce();
		this.clearWaitingTimer();
	}

	private runLinter(view: EditorView): Diagnostic[] {
		const file = this.plugin.app.workspace.getActiveFile();
		if (!file || this.plugin.getFileTemplateTypeSync(file) === 'content-file') {
			this.setHidden();
			return [];
		}
		const content = view.state.doc.toString();
		const result = this.validate(content);
		if (result.valid) {
			this.setValid();
			return [];
		}
		this.setInvalid(result.line, result.col);
		const doc = view.state.doc;
		const clampedLine = Math.max(1, Math.min(result.line, doc.lines));
		const lineObj = doc.line(clampedLine);
		const from = lineObj.from + Math.min(result.col, lineObj.length);
		const to = Math.max(lineObj.to, from + 1);
		// `message` is what the lint hover tooltip displays — pass the full multi-line detail.
		return [{ from, to, severity: 'error', message: result.detail }];
	}

	private async refreshFromActiveFile() {
		const file = this.plugin.app.workspace.getActiveFile();
		if (!file || this.plugin.getFileTemplateTypeSync(file) === 'content-file') {
			this.setHidden();
			return;
		}
		// In edit mode the linter is authoritative — skip the disk read here so
		// a stale-disk result can't overwrite a fresher linter result.
		const mdView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
		if (mdView?.getMode() === 'source') { return; }
		const content = normalizeEol(await this.plugin.app.vault.cachedRead(file));
		const result = this.validate(content);
		if (result.valid) { this.setValid(); }
		else { this.setInvalid(result.line, result.col); }
	}

	private validate(content: string): ValidationResult {
		if (!content || content.trim() === '') { return { valid: true }; }
		try {
			Handlebars.parse(content);
			return { valid: true };
		} catch (e: any) {
			const message = String(e?.message ?? e);
			// Handlebars 4.x rarely populates hash.loc on parse errors — extract
			// from the message text as a reliable fallback.
			let line: number | undefined = e?.hash?.loc?.first_line;
			let col: number | undefined = e?.hash?.loc?.first_column;
			if (!line) {
				const m = /on line (\d+)/.exec(message);
				if (m) { line = parseInt(m[1], 10); }
			}
			if (col === undefined) { col = 0; }
			const lines = message.split('\n').map(l => l.trimEnd()).filter(l => l.length > 0);
			// Brief: last non-empty line — typically "Expecting X, got Y".
			const brief = lines[lines.length - 1] || message;
			// Detail: full message minus the redundant "Parse error on line N:" header.
			const detailLines = (lines[0] && /^Parse error on line/i.test(lines[0])) ? lines.slice(1) : lines;
			const detail = detailLines.join('\n') || message;
			return { valid: false, line: line ?? 1, col, brief, detail };
		}
	}

	private setHidden() {
		this.clearWaitingTimer();
		this.statusBarItem.addClass('z2k-template-hidden');
		this.clearStateClasses();
		this.lastError = null;
	}

	private setValid() {
		this.clearWaitingTimer();
		this.statusBarItem.removeClass('z2k-template-hidden');
		this.statusBarItem.setText('✓ Template is valid');
		this.clearStateClasses();
		this.statusBarItem.addClass('z2k-template-valid');
		this.lastError = null;
	}

	private setInvalid(line: number, col: number) {
		this.clearWaitingTimer();
		this.statusBarItem.removeClass('z2k-template-hidden');
		this.statusBarItem.setText(`✗ Error on line ${line}`);
		this.clearStateClasses();
		this.statusBarItem.addClass('z2k-template-invalid');
		this.lastError = { line, col };
	}

	private setWaiting() {
		const file = this.plugin.app.workspace.getActiveFile();
		if (!file || this.plugin.getFileTemplateTypeSync(file) === 'content-file') { return; }
		this.statusBarItem.removeClass('z2k-template-hidden');
		this.statusBarItem.setText('⋯ Validating template');
		this.clearStateClasses();
		this.statusBarItem.addClass('z2k-template-waiting');
		this.lastError = null;
	}

	private clearStateClasses() {
		this.statusBarItem.removeClass('z2k-template-valid');
		this.statusBarItem.removeClass('z2k-template-invalid');
		this.statusBarItem.removeClass('z2k-template-waiting');
	}

	private handleStatusBarClick() {
		if (!this.lastError) { return; }
		const view = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
		if (!view) { return; }
		const cm = (view.editor as any).cm as EditorView | undefined;
		if (!cm) { return; } // Reading view has no editor to scroll to
		const doc = cm.state.doc;
		const clampedLine = Math.max(1, Math.min(this.lastError.line, doc.lines));
		const lineObj = doc.line(clampedLine);
		const pos = lineObj.from + Math.min(this.lastError.col, lineObj.length);
		cm.dispatch({
			selection: { anchor: pos },
			effects: [EditorView.scrollIntoView(pos, { y: 'center' })],
		});
		cm.focus();
	}

	private clearDebounce() {
		if (this.debounceTimer !== null) {
			window.clearTimeout(this.debounceTimer);
			this.debounceTimer = null;
		}
	}
}
