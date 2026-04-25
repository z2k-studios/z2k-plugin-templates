import { App, Modal, Notice } from 'obsidian';
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Z2KTemplatesPluginSettings, cardRefNameUpper, cardRefNameLower, ErrorBoundary, TemplatePluginError, UserCancelError } from '../utils';
import { TemplateError } from '../template-engine/main';
import { PathFolder, PathFile, normalizeFullPath } from '../paths';

// ------------------------------------------------------------------------------------------------
// Card Type Selection Modal
// ------------------------------------------------------------------------------------------------
export class CardTypeSelectionModal extends Modal {
	cardTypes: PathFolder[];
	settings: Z2KTemplatesPluginSettings;
	resolve: (cardType: PathFolder) => void;
	reject: (error: Error) => void;
	root: any; // For React root
	private settled = false;

	constructor(app: App, cardTypes: PathFolder[], settings: Z2KTemplatesPluginSettings, resolve: (cardType: PathFolder) => void, reject: (error: Error) => void) {
		super(app);
		this.cardTypes = cardTypes;
		this.settings = settings;
		this.resolve = resolve;
		this.reject = reject;
	}

	private settleResolve(value: PathFolder) {
		if (this.settled) { return; }
		this.settled = true;
		this.resolve(value);
	}

	private settleReject(error: Error) {
		if (this.settled) { return; }
		this.settled = true;
		this.reject(error);
	}

	onOpen() {
		this.modalEl.addClass('z2k', 'card-type-selection-modal');
		this.titleEl.setText(`Select ${cardRefNameUpper(this.settings)} Type`);
		this.contentEl.empty();
		this.contentEl.addClass('modal-content');
		this.root = createRoot(this.contentEl);
		this.root.render(
			<ErrorBoundary onError={(error) => { this.settleReject(error); this.close(); }}>
				<CardTypeSelector
					cardTypes={this.cardTypes}
					settings={this.settings}
					onConfirm={(cardType: PathFolder) => {
						this.settleResolve(cardType);
						this.close();
					}}
					onCancel={() => {
						this.settleReject(new UserCancelError(`User cancelled ${cardRefNameLower(this.settings)} type selection`));
						this.close();
					}}
				/>
			</ErrorBoundary>
		);
	}

	onClose() {
		// Outside-click / Escape closes the modal without going through our handlers; treat as cancel.
		this.settleReject(new UserCancelError(`User cancelled ${cardRefNameLower(this.settings)} type selection`));
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
	const [focusedIndex, setFocusedIndex] = useState<number>(0);
	const listRef = useRef<HTMLDivElement>(null);

	// Focus the container on mount for keyboard navigation
	useEffect(() => {
		if (listRef.current) {
			listRef.current.focus();
		}
	}, []);

	// Keyboard navigation
	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const newIndex = Math.min(focusedIndex + 1, cardTypes.length - 1);
			setFocusedIndex(newIndex);
			scrollToItem(newIndex);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const newIndex = Math.max(focusedIndex - 1, 0);
			setFocusedIndex(newIndex);
			scrollToItem(newIndex);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (cardTypes.length > 0) {
				onConfirm(cardTypes[focusedIndex]);
			}
		} else if (e.key === 'Escape') {
			e.preventDefault();
			onCancel();
		}
	};

	const scrollToItem = (index: number) => {
		if (index >= 0 && listRef.current) {
			const items = listRef.current.querySelectorAll('.selection-item');
			if (items[index]) {
				items[index].scrollIntoView({ block: 'nearest' });
			}
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
							className={`selection-item ${focusedIndex === index ? 'focused' : ''}`}
							onClick={() => onConfirm(cardType)}
							onMouseEnter={() => setFocusedIndex(index)}
						>
							<span className="selection-primary" title={cardType.path}>{getPrettyPath(cardType.path)}</span>
							{/* <span className="selection-secondary">{cardType.}</span> */}
						</div>
					))
				)}
			</div>
		</div>
	);
};



// ------------------------------------------------------------------------------------------------
// Template Selection Modal
// ------------------------------------------------------------------------------------------------
export class TemplateSelectionModal extends Modal {
	templates: { file: PathFile, isDefault: boolean, description?: string }[];
	settings: Z2KTemplatesPluginSettings;
	resolve: (template: PathFile) => void;
	reject: (error: Error) => void;
	root: any; // For React root
	private settled = false;

	constructor(app: App, templates: { file: PathFile, isDefault: boolean, description?: string }[], settings: Z2KTemplatesPluginSettings, resolve: (template: PathFile) => void, reject: (error: Error) => void){
		super(app);
		this.templates = templates;
		this.settings = settings;
		this.resolve = resolve;
		this.reject = reject;
	}

	private settleResolve(value: PathFile) {
		if (this.settled) { return; }
		this.settled = true;
		this.resolve(value);
	}

	private settleReject(error: Error) {
		if (this.settled) { return; }
		this.settled = true;
		this.reject(error);
	}

	onOpen() {
		this.modalEl.addClass('z2k', 'template-selection-modal');
		this.titleEl.setText('Select Template');
		this.contentEl.empty();
		this.contentEl.addClass('modal-content');
		this.root = createRoot(this.contentEl);
		this.root.render(
			<ErrorBoundary onError={(error) => { this.settleReject(error); this.close(); }}>
				<TemplateSelector
					templates={this.templates}
					settings={this.settings}
					onConfirm={(template: PathFile) => {
						this.settleResolve(template);
						this.close();
					}}
					onCancel={() => {
						this.settleReject(new UserCancelError("User cancelled template selection"));
						this.close();
					}}
				/>
			</ErrorBoundary>
		);
		// Lock minimum dimensions after initial render so search filtering doesn't shrink the modal
		requestAnimationFrame(() => {
			this.modalEl.style.minWidth = this.modalEl.offsetWidth + 'px';
			this.modalEl.style.minHeight = this.modalEl.offsetHeight + 'px';
		});
	}

	onClose() {
		// Outside-click / Escape closes the modal without going through our handlers; treat as cancel.
		this.settleReject(new UserCancelError("User cancelled template selection"));
		if (this.root) { this.root.unmount(); }
		this.contentEl.empty();
	}
}

interface TemplateSelectorProps {
	templates: { file: PathFile, isDefault: boolean, description?: string }[];
	settings: Z2KTemplatesPluginSettings;
	onConfirm: (template: PathFile) => void;
	onCancel: () => void;
}

// React component for the modal content
const TemplateSelector = ({ templates, settings, onConfirm, onCancel }: TemplateSelectorProps) => {
	const getItems = (): { file: PathFile, name: string, cardType: string, isDefault: boolean, description?: string }[] => {
		const rootPath = normalizeFullPath(settings.templatesRootFolder);
		return templates.map((t) => {
			let parentPath = normalizeFullPath(t.file.parentPath);
			// Show path relative to templates root
			if (rootPath && parentPath.startsWith(rootPath + '/')) {
				parentPath = parentPath.slice(rootPath.length + 1);
			} else if (parentPath === rootPath) {
				parentPath = "";
			}
			return { file: t.file, name: t.file.basename, cardType: parentPath, isDefault: t.isDefault, description: t.description }
		});
	}

	const [searchTerm, setSearchTerm] = useState<string>('');
	const [filteredItems, setFilteredItems] = useState<{ file: PathFile, name: string, cardType: string, isDefault: boolean, description?: string }[]>(getItems());
	// Unified focus index — driven by both arrow keys and mouse hover
	const [focusedIndex, setFocusedIndex] = useState<number>(0);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const listRef = useRef<HTMLDivElement>(null);

	// Filter templates when search term changes
	useEffect(() => {
		setFilteredItems(
			getItems().filter(item => {
				const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
				const pathMatch = item.cardType.toLowerCase().includes(searchTerm.toLowerCase());
				return nameMatch || pathMatch;
			})
		);
		setFocusedIndex(0); // Reset focus when search changes
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
			const newIndex = Math.min(focusedIndex + 1, filteredItems.length - 1);
			setFocusedIndex(newIndex);
			scrollToItem(newIndex);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const newIndex = Math.max(focusedIndex - 1, 0);
			setFocusedIndex(newIndex);
			scrollToItem(newIndex);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (filteredItems.length > 0) {
				onConfirm(filteredItems[focusedIndex].file);
			}
		} else if (e.key === 'Escape') {
			e.preventDefault();
			onCancel();
		}
	};

	const scrollToItem = (index: number) => {
		if (index >= 0 && listRef.current) {
			const items = listRef.current.querySelectorAll('.selection-item');
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

	const focusedDescription = filteredItems[focusedIndex]?.description;

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
					filteredItems.map((item, index) => (
						<div
							key={item.file.path}
							className={`selection-item ${focusedIndex === index ? 'focused' : ''}`}
							onClick={() => onConfirm(item.file)}
							onMouseEnter={() => setFocusedIndex(index)}
						>
							<span className="selection-primary">
								{highlightMatch(item.name, searchTerm)}
								{item.isDefault && <span className="template-default-indicator" title="Default template">★</span>}
							</span>
							<span className="selection-secondary" title={item.cardType}>
								{highlightMatch(item.cardType, searchTerm)}
							</span>
						</div>
					))
				)}
			</div>
			<div className="selection-description-slot">
				<div className="selection-description">{focusedDescription || '\u00A0'}</div>
			</div>
		</div>
	);
};



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

