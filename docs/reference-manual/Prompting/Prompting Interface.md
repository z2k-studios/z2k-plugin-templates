---
sidebar_position: 10
aliases:
- prompting interface
- prompting dialog box
- prompting modal
- field collection modal
---
# Prompting Interface
When you create a note from a template, Z2K Templates opens a modal dialog – the **prompting interface** – where you provide values for the template's [[Template Fields|fields]]. This is where your template becomes a note or a content file using the data you provide.

## Contents
- [[#When It Appears]]
- [[#Anatomy of the Prompting Interface]]
- [[#Field Ordering]]
- [[#Field Filtering]]
- [[#Submission Modes]]
- [[#Validation]]

## When It Appears
The prompting interface appears whenever a command triggers template [[Instantiation|instantiation]] or [[WIP Stage#WIP Iterating|WIP iteration]]. This includes:
- [[Create new file]]
- [[Continue filling file]]
- [[Create file from selected text]]
- [[Quick Create Commands]]

If the template has no promptable fields the interface is skipped entirely. For instance, if all fields in the template are built-in, computed, or hidden, there is no need to prompt for data.

## Anatomy of the Prompting Interface
Each field in the prompting interface is rendered as a row with the following elements:

- **Label** – Currently a single text element that shows either the custom `prompt=` text (if set via [[field-info Helper|{{field-info}}]]) or the field name converted to title case (e.g., `projectName` → "Project Name")
- **Input control** – The widget where you enter data. The control type depends on the field's `type=` parameter. See [[Prompting Interface per Type]] for details on each type.
- **Reset button** (⟲) – Appears on hover after you've [[Prompt Touching|touched]] a field. Clicking it resets the field to its untouched state, restoring the [[field-info suggest|suggest]] value.
- **Fallback preview** – When a [[field-info fallback|fallback]] value for a field has been specified and the field's input control has not been interactively touched, a preview appears below the input: "Value if left untouched: *[value]*". This disappears once the field is touched.
- **Error message** – Appears below the input when validation fails (e.g., invalid number, required field empty).
- **Hover text** – Hovering over a field's label reveals diagnostic information: the raw field name, any [[field-info directives|directives]], and dependency relationships.

![[prompting-interface-anatomy.png]]
*(Screenshot: a prompting interface with several fields showing labels, inputs, a fallback preview, and a reset button)*

### Visual Indicators
The prompting interface uses a colored left border on each field to communicate state:
- **No border** – The field is untouched.
- **Green border** – The field has been [[Prompt Touching|touched]] (you've interacted with it).
- **Red border** – The field has a validation error.
- **Accent border** – The field currently has focus.

## Field Ordering
Fields appear in the prompting interface in a deliberate order:
1. **Required fields first** – Fields with the `required` [[field-info directives|directive]] are promoted to the top.
2. **Dependencies before dependents** – If field B references field A in its `prompt=`, `suggest=`, or `fallback=` parameter, field A appears above field B. This is resolved recursively via topological sort.
3. **Remaining fields** – All other fields appear in their natural declaration order.

This ordering ensures that when you fill in a field, any field that depends on it has already been presented – or will dynamically update as you type.

## Field Filtering
Not every field in a template appears in the prompting interface. A field is **hidden** from the form if:
- It has the `no-prompt` [[field-info directives|directive]] – explicitly suppresses prompting.
- It is **unreferenced** in the template body – if the field only appears inside `{{field-info}}` declarations but is never actually used in the output, it's omitted.
- It has a `value=` parameter – computed fields are resolved automatically and don't need user input.

Note: These hidden fields still participate in dependency resolution and rendering. They just don't appear in the form.

## Submission Modes
The prompting interface offers two buttons for completing the form, plus a cancel button:

- **Submit** – Saves the note with the values you've entered. Fields you haven't [[Prompt Touching|touched]] remain unresolved in the output file, creating a [[WIP Stage|WIP content file]] that you can [[Continue filling file|continue filling]] later. This is [[Deferred Field Resolution]] in action.
- **Submit and Finalize** – Resolves all fields and produces a [[Finalized Stage|finalized content file]]. Untouched fields receive their [[field-info fallback|fallback]] value (if specified), or are handled according to the [[Fallback Behavior]] rules. Required fields must have values – the form will block submission and scroll to the first error if they don't.
- **Cancel** – Discards the operation entirely. No file is created or modified.

> [!NOTE]
> The `fileTitle` field is special – it is always written to the output regardless of touched state, because the file needs a name.

## Validation
The prompting interface validates field values before allowing submission:
- **Number fields** – Must contain a valid number.
- **titleText fields** – Cannot contain characters invalid in filenames (`\ / : * ? " < > |`), cannot be only dots, and cannot end with a space or dot.
- **Required fields** – Must have a non-empty value. This is enforced only on **Submit and Finalize** – the **Submit** button allows partial entry.

When validation fails, the form scrolls to the first field with an error and focuses it.

## See Also
- [[Prompting Interface per Type]] – What each field type looks like in the prompting interface
- [[Prompt Touching]] – How field interaction determines what values are committed
- [[Built-in Helpers for Prompting]] – How `{{field-info}}` parameters shape the prompting interface
- [[field-info Helper]] – Full reference for the `{{field-info}}` helper function

> [!DANGER] Notes for Documentation Team
> - **Title vs. Subtitle**: The current code renders a single label per field (`resolvedPrompt || fieldName` at `src/main.tsx` ~line 4291). When a custom `prompt=` is set, the prettified field name is only accessible via hover text – there is no separate "title" line. The intended design appears to be a title (prettified field name, always shown) with a subtitle (custom prompt text, shown when specified). This needs a code change before the Label bullet point above can be updated to document title/subtitle behavior.
> - The submit button labels are "Submit" and "Submit and Finalize" in the current codebase (~line 4320). See GitHub issue #148 for renaming discussion.
> - The suggest value currently renders identically to user-typed text in untouched fields – no grayed-out or italic treatment. See GitHub issue #147 for tracking. Once resolved, update the "Visual Indicators" section.
> - **Field Filtering bug**: The current code at ~line 3935 allows unreferenced fields with a `prompt` directive to appear in the form. This is a bug – unreferenced fields should always be hidden. See GitHub issue #149. The doc above reflects the intended behavior, not the current code.
> - Screenshot placeholder `prompting-interface-anatomy.png` needs to be captured from a live template with multiple field types and states visible.
