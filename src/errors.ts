import { TemplateError } from './template-engine/main';
import { Z2KTemplatesPluginSettings } from './utils';
import { App } from 'obsidian';
import moment from 'moment';
import { Component, ReactNode } from 'react';

// Error logging types
export type ErrorSeverity = "error" | "warn" | "info" | "debug";

export interface LogContext {
	severity: ErrorSeverity;
	error?: Error;
	message: string;
	additionalContext?: Record<string, any>;
}

export class ErrorLogger {
	private listeners: Set<() => void> = new Set();

	constructor(
		private app: App,
		private settings: Z2KTemplatesPluginSettings
	) {}

	onChange(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private notifyListeners(): void {
		for (const cb of this.listeners) {
			try { cb(); } catch (e) { console.error("[Z2K Templates] Log change listener threw:", e); }
		}
	}

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
			this.notifyListeners();
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
			this.notifyListeners();
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
