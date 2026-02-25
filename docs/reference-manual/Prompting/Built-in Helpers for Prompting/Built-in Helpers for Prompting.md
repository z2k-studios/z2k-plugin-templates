---
sidebar_position: 1
sidebar_folder_position: 83
sidebar_label: Helpers for Prompting
aliases:
- built-in helpers for prompting
- prompting helpers
- controlling the prompt with field-info
- controlling prompting
- prompt control
---
# Built-in Helpers for Prompting
The [[Prompting Interface]] works out of the box – every [[Template Fields|field]] gets a label, an input, and sensible defaults. But when you want more control over how the prompt looks and behaves, the [[field-info Helper|{{field-info}}]] family of [[Silent Helper Functions|silent]] helpers is the tool for the job.

## Contents
- [[#What field-info Controls]]
- [[#Quick Examples]]
- [[#How Each Parameter Affects Prompting]]
- [[#Full Reference]]

## What field-info Controls
The `{{field-info}}` helper (and its [[field-info Variations|variations]]) lets you configure how each field appears in the prompting interface:
- **What the user sees** – custom label text via `prompt=`
- **What value is suggested** – pre-filled content via `suggest=`
- **What input type is used** – text, number, date, dropdown, checkboxes via `type=`
- **What happens if the user skips the field** – fallback values via `fallback=`
- **Whether the field appears at all** – visibility control via `directives=`

## Quick Examples

### Custom prompt with a suggested value
```md
{{field-info authorName prompt="Who wrote this?" suggest="{{creator}}"}}
```
The field label reads "Who wrote this?" and the input is pre-filled with the current user's name.

### Dropdown selection
```md
{{field-info difficulty prompt="Difficulty level" type="singleSelect" opts="Beginner,Intermediate,Advanced"}}
```
Renders as a dropdown with three options instead of a freeform text area.

### Hidden field with a computed value
```md
{{field-info wordCount value="{{word-count content}}" directives="no-prompt"}}
```
The field never appears in the prompting interface – its value is computed automatically with a user defined helper.

==Maybe give an example of how to use wordCount. Could be valuable to truncate a field if > 10 words, e.g. like a quote== 

## How Each Parameter Affects Prompting
Each `{{field-info}}` parameter maps to a specific aspect of the prompting interface. This section summarizes the prompting-specific effects – see the linked parameter pages for full details.

### prompt= → Label Text
The `prompt=` parameter controls the **label text** displayed above the field's input control.

```md
{{field-info recipeName prompt="What are we cooking today?"}}
```

Without this parameter, the label is auto-generated from the field name (e.g., `recipeName` → "Recipe Name"). See [[Prompting Defaults]] for the generation rules. The prompt text can reference other fields – the label updates dynamically as you fill in the form.

See [[field-info prompt|prompt Parameter]] for full details.

### suggest= → Pre-filled Value
The `suggest=` parameter sets a **pre-filled value** in the input control. The value appears in the field before the user interacts with it.

```md
{{field-info author suggest="{{creator}}"}}
```

The suggest value is the starting point, not a commitment. If the user never [[Prompt Touching|touches]] the field:
- On **Submit** – the field is deferred (suggest is not written to output)
- On **Submit and Finalize** – the [[Fallback Behavior]] procedure applies (not the suggest value, unless `finalize-suggest` is set)

If the user touches the field and doesn't change it, the suggest value becomes the committed value. Like `prompt=`, the suggest value can reference other fields and updates dynamically.

See [[field-info suggest|suggest Parameter]] for full details.

### type= → Input Control
The `type=` parameter determines **which input control** is rendered.

```md
{{field-info eventDate type="date"}}
{{field-info isArchived type="boolean"}}
{{field-info category type="singleSelect" opts="Work,Personal,Archive"}}
```

Available types: `text`, `titleText`, `number`, `date`, `datetime`, `boolean`, `singleSelect`, `multiSelect`. See [[Prompting Interface per Type]] for a visual guide to each type.

See [[field-info type|type Parameter]] for full details.

### opts= → Selection Options
The `opts=` parameter supplies the **list of choices** for `singleSelect` and `multiSelect` fields.

```md
{{field-info priority type="singleSelect" opts="Low,Medium,High,Critical"}}
```

Options can reference other fields – the list updates as dependencies change.

See [[field-info opts|opts Parameter]] for full details.

### directives= → Visibility and Behavior
The directives relevant to prompting are:
- **`no-prompt`** – Hides the field from the prompting interface entirely
- **`prompt`** – Forces the field to appear even if it's not referenced in the template body
- **`required`** – The field must have a non-empty value to finalize; promotes the field to the top of the form

```md
{{field-info internalId directives="no-prompt"}}
{{field-info projectName directives="required"}}
```

See [[field-info directives|directives Parameter]] for the full list of available directives.

### fallback= → Untouched Field Value
The `fallback=` parameter determines the value used when a field is **untouched** and the note is finalized.

```md
{{field-info status fallback="Draft"}}
```

When a fallback is configured, the prompting interface shows a **preview** below the input: "Value if left untouched: *Draft*". This preview disappears once the field is [[Prompt Touching|touched]].

See [[field-info fallback|fallback Parameter]] for full details.

## Full Reference
The `{{field-info}}` helper has extensive documentation in its own section:
- [[field-info Helper]] – Introduction and overview
- [[field-info Parameters]] – All parameters in detail
- [[field-info Variations]] – `{{field-output}}`, `{{fi}}`, and `{{fo}}` shorthand forms

## See Also
- [[Prompting Interface]] – The modal where these helpers take effect
- [[Prompting Defaults]] – What happens when no `{{field-info}}` is specified

> [!DANGER] Notes for Documentation Team
> - This page merges the former "Controlling the Prompt with field-info" standalone page. The aliases from that page are preserved in frontmatter above so existing wikilinks (`[[Controlling the Prompt with field-info]]`) still resolve.
> - The `refhtml` placeholder files (`refhtml - field-info (Prompting).md` and `refhtml - field-output (Prompting).md`) in this folder are Docusaurus redirect placeholders. They should remain unchanged.
> - The `value=` parameter is not covered here because it bypasses the prompting interface entirely (computed fields are hidden from the form). It's documented in [[field-info value|value Parameter]].
