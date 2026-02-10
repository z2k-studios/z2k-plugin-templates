---
sidebar_position: 20
sidebar_class_name: z2k-code
aliases:
- create file from selected text
- create note from selected text
- create card from selected text
---

# Create file from selected text
Creates a new file from a template, passing the currently selected text as input data. Useful for quickly turning a phrase or paragraph into a fully-formed templated file.

> [!NOTE] Command Name
> This command appears as "Create file from selected text," "Create note from selected text," or "Create card from selected text" depending on your [[File Naming in Commands|settings]].

## Availability
Available in the Command Palette when **text is selected** in the active editor.

If no text is selected, this command won't appear in the Command Palette. Use [[Create new file]] instead.

## What It Does
When you run this command:

1. **Capture selection** – The plugin stores your selected text
2. **Select a destination** – Choose the [[Template Folders|file type folder]] for the new file
3. **Select a template** – Pick which [[Types of Template Files#Document Templates|document template]] to use
4. **Fill in fields** – Provide values for any [[Template Fields]] in the template
5. **File is created** – The new file appears with template content, field values, and your selection incorporated

## How the Selection Is Used
The selected text becomes available to the template as the `{{sourceText}}` field. Templates can use this in several ways:

- **As the title** – `# {{sourceText}}` makes the selection the file's heading
- **As content** – Place `{{sourceText}}` in the body where the text should appear
- **As a field value** – Use `{{field-info "topic" suggest=sourceText}}` to pre-fill a field with the selection.

If the template does not include a reference to `{{sourceText}}`, the plugin will simply place the selected text at the end of the new file. 

> [!TIP] Selected Text as Field Data
> This third option is a great way to present the selected text as a value into a field for the template. If you know you wish to use it as a value without modifications, use the [[field-info value|value]] parameter instead.


### Example Template
```handlebars
---
title: {{sourceText}}
created: {{date}}
---
# {{sourceText}}

{{notes}}
```

### Example Usage

1. In a meeting note, select the text "Quarterly review postponed to March"
2. Run **Create file from selected text**
3. Choose "Tasks" folder and "Task – Quick Capture" template
4. The new file is created with "Quarterly review postponed to March" as the title

## Tips
A few tips for making this command even more powerful:
- Works well for "clip and file" workflows – select interesting text, immediately create a dedicated note
- See the tip [[#Create file from selected text|above]] on using the selected text to fill in fields for the template.

## Related Commands
Siblings:
- [[Create new file]] – Same workflow without selection
- [[Insert block template using selected text]] – Insert a block using selection, rather than creating a new file
