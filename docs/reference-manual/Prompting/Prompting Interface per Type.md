---
sidebar_position: 20
aliases:
- prompting interface per type
- field type inputs
- input types
---
# Prompting Interface per Type
The [[Prompting Interface]] renders a different input control for each [[Field Types|field type]]. The type is set via the `type` parameter on [[fieldInfo Helper|{{fieldInfo}}]]. If no type is specified, the field defaults to `text`.

This page shows what each type looks like and how it behaves inside the prompting modal.

## Contents
- [[#text]]
- [[#titleText]]
- [[#number]]
- [[#date]]
- [[#datetime]]
- [[#boolean]]
- [[#singleSelect]]
- [[#multiSelect]]

## text
The default type. Renders as a **multi-line textarea**.

```md
{{fieldInfo journalEntry prompt="What happened today?" type="text"}}
```

- Accepts any text, including line breaks
- No built-in validation beyond the `required` directive

![[prompting-type-text.png]]
*(Screenshot: a text field with a multi-line textarea)*

## titleText
Renders as a **single-line text input** with filename validation. Used for the built-in `fileTitle` field and any field whose value will become part of a filename.

```md
{{fieldInfo projectName prompt="Project name" type="titleText"}}
```

- Rejects characters invalid in filenames: `\ / : * ? " < > |`
- Rejects values that are only dots (e.g., `..`)
- Rejects values ending with a space or dot
- Error messages appear inline below the field

![[prompting-type-titletext.png]]
*(Screenshot: a titleText field showing a validation error for invalid characters)*

## number
Renders as a **number input** (browser-native spinner control).

```md
{{fieldInfo rating prompt="Rate this album (1-10)" type="number"}}
```

- Only accepts numeric values
- Non-numeric input produces a "Please enter a valid number" error
- The value is stored as a number, not a string

![[prompting-type-number.png]]
*(Screenshot: a number field with the spinner control)*

## date
Renders as a **date picker** using the browser's native `date` input.

```md
{{fieldInfo startDate prompt="When does the project begin?" type="date"}}
```

- Presents a calendar-style date picker (appearance varies by OS/browser)
- Stores the value in ISO format: `YYYY-MM-DD`
- Invalid dates are rejected

![[prompting-type-date.png]]
*(Screenshot: a date field with the date picker open)*

## datetime
Renders as a **datetime-local picker** using the browser's native `datetime-local` input.

```md
{{fieldInfo eventTime prompt="When is the meeting?" type="datetime"}}
```

- Presents a combined date and time picker
- Stores the value as `YYYY-MM-DD HH:mm` when seconds are zero, or `YYYY-MM-DD HH:mm:ss` when seconds are non-zero
- Invalid datetimes are rejected

![[prompting-type-datetime.png]]
*(Screenshot: a datetime field with the datetime picker open)*

## boolean
Renders as a **checkbox**.

```md
{{fieldInfo isPublished prompt="Published?" type="boolean"}}
```

- The label is rendered *beside* the checkbox rather than above it
- The value is `true` or `false`
- Clicking the checkbox counts as [[Prompt Touching|touching]] the field

![[prompting-type-boolean.png]]
*(Screenshot: a boolean field rendered as a checkbox with its label to the right)*

## singleSelect
Renders as a **dropdown** (`<select>`) populated with options from the [[fieldInfo opts|opts]] parameter.

```md
{{fieldInfo genre prompt="Pick a genre" type="singleSelect" opts="Fiction,Non-Fiction,Poetry,Drama"}}
```

- Displays a "Select an option" placeholder when no selection has been made
- The [[fieldInfo suggest|suggest]] value pre-selects the matching option if it exists in the options list
- The stored value is the selected option's text, not an index

![[prompting-type-singleselect.png]]
*(Screenshot: a singleSelect dropdown with options expanded)*

## multiSelect
Renders as a **group of checkboxes** – one for each option in the [[fieldInfo opts|opts]] parameter.

```md
{{fieldInfo tags prompt="Select applicable tags" type="multiSelect" opts="Research,Review,Draft,Final"}}
```

- Each option is an independent checkbox with a label
- The [[fieldInfo suggest|suggest]] value can pre-select multiple options (pass a comma-separated list)
- The stored value is an array of the selected options' text values
- Checking or unchecking any box counts as [[Prompt Touching|touching]] the field

![[prompting-type-multiselect.png]]
*(Screenshot: a multiSelect field with several checkbox options, some checked)*

## See Also
- [[Prompting Interface]] – Overview of the prompting modal
- [[fieldInfo type|type Parameter]] – Full documentation of the `type` parameter
- [[fieldInfo opts|opts Parameter]] – How to define options for select types

> [!DANGER] INTERNAL NOTES
> - All screenshot placeholders need to be captured from a live prompting interface showing each field type.
> - The `datetime` format depends on whether seconds are zero: `YYYY-MM-DD HH:mm` vs `YYYY-MM-DD HH:mm:ss`. Verify this is intentional or if it should always include seconds for consistency.
> - The `boolean` type has a unique label layout (label beside checkbox via `boolean-input-container` class). All other types render the label above the input.
