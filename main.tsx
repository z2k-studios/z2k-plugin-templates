
import { App, Plugin, Modal, Notice, TFolder, TFile, Editor } from 'obsidian';
import { Z2KTemplateEngine, VarInfo, PromptTextSegment } from 'z2k-template-engine';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

export default class Z2KPlugin extends Plugin {
	templateEngine: Z2KTemplateEngine;
	foldersByType: Record<string, string>;

	async onload() {
		this.templateEngine = new Z2KTemplateEngine();
		this.foldersByType = {
			"thought": "Thoughts",
			"memory": "Memories",
		};
		this.registerCommands();
	}
	onunload() {}

	registerCommands() {
		this.addCommand({
			id: 'create-card-from-command-palette',
			name: 'Create Card from Command Palette',
			callback: () => this.createCardFromCommandPalette('thought'),
		});

		this.addCommand({
			id: 'create-card-from-selected-text',
			name: 'Create Card from Selected Text',
			editorCheckCallback: (checking, editor) => {
				if (checking) return true;
				this.createCardFromSelectedText(editor, 'memory');
			},
		});

		this.addCommand({
			id: 'create-card-from-quick-note',
			name: 'Create Card from Quick Note',
			callback: () => this.createCardFromQuickNote('thought'),
		});
	}
	registerEventListeners() {}

	// Core functions for handling card creation
	async createCardFromCommandPalette(cardType: string) {
		await this.mainCreationProcess(cardType);
	}
	async createCardFromSelectedText(editor: Editor, cardType: string) {
		const selectedText = editor.getSelection();
		if (!selectedText) {
			new Notice('No text selected.');
			return;
		}
		await this.mainCreationProcess(cardType, selectedText);
	}
	async createCardFromQuickNote(cardType: string) {}

	async mainCreationProcess(cardType: string, existingText?: string) {
		// Get template using TemplateSelectionModal modal
		const templates = this.getTemplatesForType(cardType);
		if (templates.length === 0) {
			new Notice('No templates found.');
			return;
		}
		const template = await new Promise<TFile>(resolve => {
			new TemplateSelectionModal(this.app, templates, resolve).open();
		});

		const templateContent = await this.app.vault.read(template);
		const templateState = this.templateEngine.parseTemplate(templateContent);
		// if (jsonData) {
		// 	this.templateEngine.resolveVarsFromJSON(templateState, jsonData);
		// }
		console.log("After parse:", JSON.stringify(templateState, null, 2));
		this.templateEngine.resolveBuiltInVars(templateState);
		console.log("After resolveBuiltInVars:", JSON.stringify(templateState, null, 2));

		// Prompt user for missing variables if needed
		if (templateState.mergedVarInfoMap.size > 0) {
			await new Promise<void>(resolve => {
				new FieldCollectionModal(this.app, templateState.mergedVarInfoMap, resolve).open();
			});
		}
		console.log("After prompt:", JSON.stringify(templateState, null, 2));

		// // Resolve any remaining missing variables with defaults
		// this.templateEngine.resolveMissText(templateState);
		// console.log("After resolveMissText:", templateState);

		const filename = "temp.md";
		let renderedContent = this.templateEngine.renderTemplate(templateState);
		if (existingText) {
			// Append existing text if provided
			renderedContent = `${renderedContent}\n\n---\n\n${existingText}`;
		}

		// Create note
		await this.app.vault.create(filename, renderedContent);
	}

	private getTemplatesForType(cardType: string): TFile[] {
		let folderPath = this.foldersByType[cardType] + "/Templates";
		let folder = this.app.vault.getAbstractFileByPath(folderPath);
		let files: TFile[] = [];
		if (folder instanceof TFolder) {
			files = this.getMarkdownFilesRecursively(folder);
		}
		folderPath = "Templates";
		folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (folder instanceof TFolder) {
			files = files.concat(this.getMarkdownFilesRecursively(folder));
		}
		return files;
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



export class TemplateSelectionModal extends Modal {
	templates: TFile[];
	onSelect: (template: TFile) => void;
	root: any; // For React root

	constructor(app: App, templates: TFile[], onSelect: (template: TFile) => void) {
		super(app);
		this.templates = templates;
		this.onSelect = onSelect;
	}

	onOpen() {
		// Add CSS class to modal for styling
		this.contentEl.addClass('template-selection-modal');

		// Set modal title
		this.titleEl.setText('Select Template');

		this.contentEl.empty(); // Clear any existing content

		// Create React root and render component
		const reactContainer = this.contentEl.createDiv();
		this.root = createRoot(reactContainer);

		this.root.render(
			<TemplateSelector
				templates={this.templates}
				onSelect={(template: TFile) => {
					this.onSelect(template);
					this.close();
				}}
				onClose={() => this.close()}
			/>
		);
	}

	onClose() {
		// Unmount React component
		if (this.root) {
			this.root.unmount();
		}
		this.contentEl.empty();
	}
}

interface TemplateSelectorProps {
	templates: TFile[];
	onSelect: (template: TFile) => void;
	onClose: () => void;
}

// React component for the modal content
const TemplateSelector = ({ templates, onSelect, onClose }: TemplateSelectorProps) => {
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
				handleSelect();
			}
		} else if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
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

	const handleSelect = () => {
		if (selectedTemplate) {
			onSelect(selectedTemplate);
		}
	};

	const handleTemplateClick = (template: TFile, index: number) => {
		setSelectedTemplate(template);
		setSelectedIndex(index);
	};

	const handleTemplateDoubleClick = (template: TFile) => {
		setSelectedTemplate(template);
		onSelect(template);
	};

	return (
		<div className="template-selection-content" onKeyDown={handleKeyDown}>
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
			<div className="template-list" ref={listRef}>
				{filteredTemplates.length === 0 ? (
					<div className="empty-state">No templates found</div>
				) : (
					filteredTemplates.map((template: TFile, index: number) => (
						<div
							key={template.path}
							className={`template-item ${selectedIndex === index ? 'selected' : ''}`}
							onClick={() => handleTemplateClick(template, index)}
							onDoubleClick={() => handleTemplateDoubleClick(template)}
							tabIndex={index + 2} // +2 because search is tabIndex 1
						>
							<span className="template-name">{template.basename}</span>
							<span className="template-path">{template.parent?.path || ''}</span>
						</div>
					))
				)}
			</div>
			<div className="template-selection-actions">
				<button className="btn btn-secondary" onClick={onClose}>
					Cancel
				</button>
				<button
					className="btn btn-primary"
					onClick={handleSelect}
					disabled={!selectedTemplate}
				>
					Select Template
				</button>
			</div>
		</div>
	);
};



/**
 * Modal for collecting field values from the user
 * Supports dynamic field updates and tracking field interactions
 */
export class FieldCollectionModal extends Modal {
	varInfoMap: Map<string, VarInfo>;
	onComplete: () => void;
	root: any; // React root

	constructor(app: App, varInfoMap: Map<string, VarInfo>, onComplete: () => void) {
		super(app);
		this.varInfoMap = varInfoMap;
		this.onComplete = onComplete;
	}

	onOpen() {
		// Add CSS class to modal for styling
		this.contentEl.addClass('field-collection-modal');

		// Set modal title
		this.titleEl.setText('Fill Template Fields');

		this.contentEl.empty(); // Clear any existing content

		// Create React root and render component
		const reactContainer = this.contentEl.createDiv();
		this.root = createRoot(reactContainer);

		this.root.render(
			<FieldCollectionForm
				varInfoMap={this.varInfoMap}
				onComplete={() => {
					this.onComplete();
					this.close();
				}}
				onCancel={() => this.close()}
			/>
		);
	}

	onClose() {
		// Unmount React component
		if (this.root) {
			this.root.unmount();
		}
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
const FieldCollectionForm = ({ varInfoMap, onComplete, onCancel }: FieldCollectionFormProps) => {
	const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>({});
	const [orderedFieldNames, setOrderedFieldNames] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const formRef = useRef<HTMLFormElement>(null);

	// Setup field states on initial render
	useEffect(() => {
		const initialFieldStates: Record<string, FieldState> = {};
		const initialValues: Record<string, any> = {};

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
				value: varInfo.defaultValue || '',
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

			// Set initial value
			initialValues[fieldName] = varInfo.defaultValue || '';
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
			onCancel();
			return;
		}

		// Calculate the initial order of fields based on dependencies
		const orderedFields = calculateFieldOrder(initialFieldStates);
		setOrderedFieldNames(orderedFields);

		// Set initial field states
		setFieldStates(initialFieldStates);
	}, [varInfoMap]);

	// Update resolved text when field values change
	useEffect(() => {
		if (Object.keys(fieldStates).length === 0) return;

		const updatedFieldStates = { ...fieldStates };
		for (const fieldName of orderedFieldNames) { // orderedFieldNames ensures dependencies are resolved first
			const varInfo = varInfoMap.get(fieldName);
			if (!varInfo) continue;

			// Helper function to resolve text segments
			const resolveSegments = (segments?: PromptTextSegment[]): string => {
				if (!segments) return '';
				return segments.map(segment => {
					if (segment.type === 'text') return segment.content;
					// Replace field references with their current values
					return fieldStates[segment.content]?.value?.toString() || '';
				}).join('');
			};

			// Update all resolved text fields
			updatedFieldStates[fieldName].resolvedPromptText = resolveSegments(varInfo.parsedPromptText);
			updatedFieldStates[fieldName].resolvedDefaultValue = resolveSegments(varInfo.parsedDefaultValue);
			updatedFieldStates[fieldName].resolvedMissText = resolveSegments(varInfo.parsedMissText);

			if (!updatedFieldStates[fieldName].touched) {
				updatedFieldStates[fieldName].value = updatedFieldStates[fieldName].resolvedDefaultValue;
			}
		}

		setFieldStates(updatedFieldStates);
	}, [fieldStates, varInfoMap]);

	const handleFieldChange = (fieldName: string, value: any) => {
		setFieldStates(prevState => {
			const updatedFieldState = { ...prevState[fieldName], value, touched: true };
			return { ...prevState, [fieldName]: updatedFieldState };
		});
	};

	const handleFieldFocus = (fieldName: string) => {
		setFieldStates(prev => ({
			...prev,
			[fieldName]: {
				...prev[fieldName],
				value: prev[fieldName].touched ? prev[fieldName].value : prev[fieldName].resolvedDefaultValue,
				touched: true,
				focused: true
			}
		}));
	};

	const handleFieldBlur = (fieldName: string) => {
		setFieldStates(prev => ({
			...prev,
			[fieldName]: {
				...prev[fieldName],
				focused: false
			}
		}));

		// Validate field on blur
		validateField(fieldName);
	};

	const validateField = (fieldName: string) => {
		const varInfo = varInfoMap.get(fieldName);
		if (!varInfo) return;

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

		setFieldStates(prev => ({
			...prev,
			[fieldName]: {
				...prev[fieldName],
				hasError,
				errorMessage
			}
		}));

		return !hasError;
	};

	const validateAllFields = () => {
		let isValid = true;

		for (const fieldName of Object.keys(fieldStates)) {
			const fieldValid = validateField(fieldName);
			if (!fieldValid) isValid = false;
		}

		return isValid;
	};

	const handleSubmit = (e: React.FormEvent, finalize: boolean = false) => {
		e.preventDefault();
		setIsSubmitting(true);

		const isValid = validateAllFields();
		if (!isValid) {
			setIsSubmitting(false);
			return;
		}

		// Update varInfoMap with resolved values
		for (const fieldName of orderedFieldNames) {
			const varInfo = varInfoMap.get(fieldName);
			if (varInfo) {
				if (fieldStates[fieldName].touched) {
					let value = fieldStates[fieldName].value;
					// Convert arrays to comma-separated strings for multiSelect
					if (Array.isArray(value)) {
						value = value.join(", ");
					}
					varInfo.resolvedValue = value;
					varInfo.valueSource = 'user-input';
				} else {
					if (finalize) {
						varInfo.resolvedValue = fieldStates[fieldName].resolvedMissText || '';
						varInfo.valueSource = 'miss';
					}
				}
			}
		}

		onComplete();
	};

	// Get and filter ordered fields for rendering
	const fieldsToRender = useMemo(() => {
		const orderedFields = calculateFieldOrder(fieldStates);
		return orderedFields.filter(fieldName => !fieldStates[fieldName].omitFromForm);
	}, [fieldStates]);

	// Check if form is valid
	const isFormValid = useMemo(() => {
		for (const fieldState of Object.values(fieldStates)) {
			if (fieldState.hasError) return false;
		}
		return true;
	}, [fieldStates]);

	return (
		<form ref={formRef} onSubmit={handleSubmit} className="field-collection-form">
			<div className="field-list">
				{fieldsToRender.map(fieldName => {
					const varInfo = varInfoMap.get(fieldName);
					const fieldState = fieldStates[fieldName];

					if (!varInfo || !fieldState) return null;

					return (
						<div key={fieldName} className="field-container">
							<FieldInput
								name={fieldName}
								label={fieldState.resolvedPromptText || fieldName}
								varInfo={varInfo}
								fieldState={fieldState}
								onChange={(value) => handleFieldChange(fieldName, value)}
								onFocus={() => handleFieldFocus(fieldName)}
								onBlur={() => handleFieldBlur(fieldName)}
							/>
							{fieldState.hasError && (
								<div className="field-error">{fieldState.errorMessage}</div>
							)}
							<FieldStateIndicator
								touched={fieldState.touched}
								focused={fieldState.focused}
								hasError={fieldState.hasError}
								hasReferences={fieldState.dependencies.length > 0}
								isReferenced={fieldState.dependentFields.length > 0}
							/>
						</div>
					);
				})}
			</div>

			<div className="form-actions">
				<button
					type="button"
					className="btn btn-secondary"
					onClick={onCancel}
					disabled={isSubmitting}
				>
					Cancel
				</button>
				<button
					type="submit"
					className="btn btn-primary"
					disabled={!isFormValid || isSubmitting}
				>
					Submit
				</button>
				<button
					type="button"
					className="btn btn-primary"
					onClick={(e) => handleSubmit(e, true)} // Submit and finalize
					disabled={!isFormValid || isSubmitting}
				>
					Submit and Finalize
				</button>
			</div>
		</form>
	);
};

/**
 * Tracks the state of each field including user interactions
 */
interface FieldState {
	value: undefined | string | number | string[]; // Value given back to the template engine
	omitFromForm: boolean;
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

function calculateFieldOrder(fieldStates: Record<string, FieldState>): string[] {
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
	// Always put title first
	const titleIndex = orderedFields.indexOf('title');
	if (titleIndex !== -1) {
		orderedFields.unshift(orderedFields.splice(titleIndex, 1)[0]);
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
	const renderInput = () => {
		const dataType = varInfo.dataType || 'text';

		switch(dataType) {
			case 'text':
				return (
					<input
						type="text"
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
						<label htmlFor={inputId} className="checkbox-label">{label}</label>
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
					<div className="multi-select-container">
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

			default:
				return (
					<input
						type="text"
						className={`text-input ${fieldState.hasError ? 'has-error' : ''}`}
						value={fieldState.value?.toString() || ''}
						onChange={(e) => onChange(e.target.value)}
						placeholder={fieldState.resolvedDefaultValue}
						{...commonProps}
					/>
				);
		}
	};

	// Show dependency indicators (fields this field depends on or that depend on it)
	const renderDependencyIndicators = () => {
		const hasDependencies = fieldState.dependencies.length > 0;
		const isDependedOn = fieldState.dependentFields.length > 0;

		if (!hasDependencies && !isDependedOn) return null;

		return (
			<div className="dependency-indicators">
				{hasDependencies && (
					<div className="depends-on" title={`Depends on: ${fieldState.dependencies.join(', ')}`}>
						<span className="indicator-icon">↑</span>
					</div>
				)}
				{isDependedOn && (
					<div className="is-dependency" title={`Used by: ${fieldState.dependentFields.join(', ')}`}>
						<span className="indicator-icon">↓</span>
					</div>
				)}
			</div>
		);
	};

	// Show a preview of what will be used if field is left empty
	const renderMissTextPreview = () => {
		if (fieldState.resolvedMissText && !fieldState.touched) {
			return (
				<div className="miss-text-preview">
					Default if empty: <span>{fieldState.resolvedMissText}</span>
				</div>
			);
		}
		return null;
	};

	return (
		<div className={`field-input ${fieldState.touched ? 'touched' : ''} ${fieldState.focused ? 'focused' : ''}`}>
			{/* Don't show label twice for checkboxes */}
			{varInfo.dataType !== 'boolean' && <label htmlFor={inputId}>{label}</label>}

			<div className="input-wrapper">
				{renderInput()}
				{renderDependencyIndicators()}
			</div>

			{renderMissTextPreview()}

			{fieldState.hasError && fieldState.errorMessage && (
				<div className="error-message">{fieldState.errorMessage}</div>
			)}
		</div>
	);
};

/**
 * Helper component that shows a visual indicator for field interaction states
 */
interface FieldStateIndicatorProps {
	touched: boolean;
	focused: boolean;
	hasError: boolean;
	hasReferences: boolean; // Field contains references to other fields
	isReferenced: boolean;  // Field is referenced by other fields
}

const FieldStateIndicator = ({ touched, focused, hasError, hasReferences, isReferenced }: FieldStateIndicatorProps) => {
	// Define indicator classes and titles based on state
	const indicators = [
		{
			active: touched,
			className: 'touched-indicator',
			title: 'Field has been modified',
			icon: '✓'
		},
		{
			active: focused,
			className: 'focused-indicator',
			title: 'Field is currently focused',
			icon: '⌨'
		},
		{
			active: hasError,
			className: 'error-indicator',
			title: 'Field has validation errors',
			icon: '⚠'
		},
		{
			active: hasReferences,
			className: 'has-references-indicator',
			title: 'Field references other fields',
			icon: '↑'
		},
		{
			active: isReferenced,
			className: 'is-referenced-indicator',
			title: 'Field is referenced by other fields',
			icon: '↓'
		}
	];

	// Only show the container if at least one indicator is active
	const hasActiveIndicators = indicators.some(indicator => indicator.active);
	if (!hasActiveIndicators) {
		return null;
	}

	return (
		<div className="field-state-indicators">
			{indicators.map((indicator, index) =>
				indicator.active && (
					<div
						key={index}
						className={`indicator ${indicator.className}`}
						title={indicator.title}
						aria-label={indicator.title}
					>
						<span className="indicator-icon">{indicator.icon}</span>
					</div>
				)
			)}
		</div>
	);
};

