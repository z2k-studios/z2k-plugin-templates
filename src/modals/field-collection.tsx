import { App, Modal, Notice } from 'obsidian';
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Z2KTemplateEngine, TemplateState, VarValueType, FieldInfo } from '../template-engine/main';
import { ErrorBoundary, TemplatePluginError, UserCancelError } from '../utils';
import moment from 'moment';

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
	private settled = false;

	constructor(app: App, title: string, templateState: TemplateState, userHelpers: Record<string, Function>, resolve: (finalize: boolean) => void, reject: (error: Error) => void) {
		super(app);
		this.title = title;
		this.templateState = templateState;
		this.userHelpers = userHelpers;
		this.resolve = resolve;
		this.reject = reject;
	}

	private settleResolve(value: boolean) {
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
		this.modalEl.addClass('z2k', 'field-collection-modal');
		this.titleEl.setText(this.title);
		this.contentEl.empty();
		this.contentEl.addClass('modal-content');
		this.root = createRoot(this.contentEl);
		const handleError = (error: Error) => { this.settleReject(error); this.close(); };
		this.root.render(
			<ErrorBoundary onError={handleError}>
				<FieldCollectionForm
					templateState={this.templateState}
					userHelpers={this.userHelpers}
					onComplete={(finalize) => {
						this.settleResolve(finalize);
						this.close();
					}}
					onCancel={() => {
						this.settleReject(new UserCancelError("User cancelled field collection"));
						this.close();
					}}
					onError={handleError}
				/>
			</ErrorBoundary>
		);
	}

	onClose() {
		// Outside-click / Escape closes the modal without going through our handlers; treat as cancel.
		this.settleReject(new UserCancelError("User cancelled field collection"));
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
			const dependencies = Z2KTemplateEngine.getFieldInfoDependencies(fieldInfo);

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
				omitFromForm: (fieldInfo.directives?.includes('no-prompt') || (fieldName !== 'fileTitle' && !templateState.referencedFields.has(fieldName))) ?? false,
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
				if (fieldInfo.directives?.includes('raw-content')) {
					// Raw-content fields (clipboard, sourceText, etc.) are used verbatim, never interpreted.
					newFieldStates[fieldName].value = fieldInfo.value;
				} else {
					const valueDeps = Z2KTemplateEngine.reducedGetDependencies(fieldInfo.value);
					const allDepsExist = valueDeps.every(dep => dep in context);
					if (allDepsExist) {
						newFieldStates[fieldName].value = Z2KTemplateEngine.reducedRenderContent(fieldInfo.value, context, true, userHelpers);
					} else {
						newFieldStates[fieldName].value = undefined;
					}
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
				console.error(`[Z2K Templates] Field ${fieldName} not found in fieldInfos`);
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
			{templateState.metadata.z2k_template_description && (
				<div className="template-description">{templateState.metadata.z2k_template_description}</div>
			)}
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

export function buildDependencyMap(fieldInfos: Record<string, FieldInfo>): Record<string, string[]> {
	const deps: Record<string, string[]> = {};
	for (const [fieldName, fieldInfo] of Object.entries(fieldInfos)) {
		deps[fieldName] = Z2KTemplateEngine.getFieldInfoDependencies(fieldInfo);
	}
	return deps;
}

/**
 * Returns an array of field names involved in circular dependencies, or an empty array if none are found
 */
export function detectCircularDependencies(dependencies: Record<string, string[]>): string[] {
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

export function calculateFieldDependencyOrder(dependencies: Record<string, string[]>): string[] {
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

