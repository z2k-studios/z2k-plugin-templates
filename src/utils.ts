import { TemplateError } from './template-engine/main';
import { App } from 'obsidian';
import moment from 'moment';
import { Component, ReactNode } from 'react';

// Paths use kebab-case mirroring the doc file tree, e.g. settings-page/general-settings/creator-name
export const DOCS_BASE_URL = 'https://z2k-studios.github.io/z2k-plugin-templates-docs/docs/reference-manual';


export interface Z2KTemplatesPluginSettings {
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
	userHelpersEnabled: boolean; // Whether user-written custom helpers are active (ACE risk)
	pluginHelpersEnabled: boolean; // Master toggle for helpers/built-in fields registered by other plugins
	perPluginEnabled: Record<string, boolean>; // Per-plugin enable/disable of registered helpers and built-in fields; missing entries default to enabled
	hasSeenWelcome: boolean; // Set to true after the first-run welcome modal has been shown and dismissed
}

export const DEFAULT_SETTINGS: Z2KTemplatesPluginSettings = {
	// templatesRootFolder: '/Z2K',
	templatesRootFolder: '',
	creator: '',
	templatesFolderName: 'Templates',
	cardReferenceName: 'file',
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
	userHelpersEnabled: false,
	pluginHelpersEnabled: true,
	perPluginEnabled: {},
	hasSeenWelcome: false,
};

const DURATION_FORMAT_ERROR = 'Invalid duration. Use number + suffix: ms, s, m, h, d, w, mo, y (e.g., 500ms, 30s, 5m, 12h, 3d, 1w, 6mo, 1y)';

// Parses duration strings like "500ms", "30s", "5m", "12h", "3d", "1w", "6mo", "1y" into milliseconds
// If defaultOnError is provided, returns it for invalid/empty input. Otherwise throws Error.
export function parseDuration(value: string, defaultOnError?: number): number {
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
export function parseDelayFromFilename(filename: string): number | null {
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

export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}

// Error logging types
export type ErrorSeverity = "error" | "warn" | "info" | "debug";

export interface LogContext {
	severity: ErrorSeverity;
	error?: Error;
	message: string;
	additionalContext?: Record<string, any>;
}

export class ErrorLogger {
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
			console.error("[Z2K Templates] Failed to clear error log:", error);
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
			console.error("[Z2K Templates] Failed to write to error log:", error);
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

export function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function cardRefNameUpper(settings: { cardReferenceName: string }): string {
	const s = settings.cardReferenceName || "Card";
	return s.charAt(0).toLocaleUpperCase() + s.slice(1);
}
export function cardRefNameLower(settings: { cardReferenceName: string }): string {
	const s = settings.cardReferenceName || "Card";
	return s.charAt(0).toLocaleLowerCase() + s.slice(1);
}
export function cardRefNameUpperPlural(settings: { cardReferenceName: string }): string {
	return cardRefNameUpper(settings) + "s";
}
export function cardRefNameLowerPlural(settings: { cardReferenceName: string }): string {
	return cardRefNameLower(settings) + "s";
}

export class UserCancelError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "UserCancelError";
	}
}

export class TemplatePluginError extends Error {
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

export function rethrowWithMessage(error: unknown, message: string): never {
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
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
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
