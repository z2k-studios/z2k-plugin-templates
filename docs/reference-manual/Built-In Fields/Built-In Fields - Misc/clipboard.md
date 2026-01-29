---
sidebar_position: 10
sidebar_class_name: z2k-code
sidebar_label: "{{clipboard}}"
title: "{{clipboard}}"
---
# clipboard Built-In Field

The `{{clipboard}}` built-in field returns the current contents of your system clipboard at the moment the template is rendered.

## Syntax

```handlebars
{{clipboard}}
```

## Return Value
Returns the text content currently stored in the system clipboard. If the clipboard is empty or contains non-text content (like images), returns an empty string.

## Use Cases

### Quick Capture from Clipboard

Automatically include clipboard content when creating a new note:

```handlebars
---
created: {{date}}
---
# Quick Capture

{{clipboard}}
```

### Conditional Clipboard Usage

Check if the clipboard has content before including it:

```handlebars
{{#if clipboard}}
## Captured Content

{{clipboard}}
{{/if}}
```

### Using Clipboard as Default Value

Set the clipboard content as a default for a field, allowing the user to modify it:

```handlebars
{{field-info quote suggest=clipboard prompt="Quote text"}}

> {{quote}}
```

### Combining with Other Fields

Use clipboard content alongside other template data:

```handlebars
{{field-info title prompt="Title for this snippet"}}
{{field-info source prompt="Source URL"}}

# {{title}}

{{clipboard}}

Source: {{source}}
Captured: {{date}}
```

## Notes
A few things of note:
- The clipboard content is captured at template render time, not at prompt time
- Only text content is supported; binary data (images, files) will result in an empty value
- Clipboard access requires the appropriate browser/system permissions
- The field is automatically set to `no-prompt` (you cannot be prompted to enter clipboard content)

## See Also
- [[sourceText|sourceText]] for capturing selected text
- [[Built-In Fields - Date and Time]] for timestamp fields
