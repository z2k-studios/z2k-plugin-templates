---
sidebar_position: 60
sidebar_class_name: z2k-code
aliases:
- insert block template using selected text
- insert block template from selection
---
# Insert Block Template Using Selected Text
Inserts a [[Block Templates|block template]] at the current cursor position, passing the selected text as input data. The selection can be used within the block template as a field value.

## Availability
Available in the Command Palette when:
- The **active file is a markdown file** (`.md`)
- **Text is selected** in the editor

If no text is selected, use [[Insert Block Template]] instead.

## What It Does
When you run this command:
1. **Capture selection** – The plugin stores your selected text
2. **Select a block template** – Choose from available [[Block Templates|block templates]]
3. **Fill in fields** – Provide values for any [[Template Fields]] (selection is available as a field)
4. **Content replaces selection** – The block template content replaces your selected text

## How the Selection Is Used
The selected text becomes available as `{{sourceText}}` within the block template. Templates can use this to:
- **Wrap content** – Add structure around the selected text
- **Transform content** – Use selection as part of a larger pattern
- **Pre-fill fields** – Use `suggest=sourceText` to offer the selection as a default value using the [[fieldInfo Helper|fieldInfo Helper]]

### Example Block Template
A "Callout" block template that wraps selected text:

```handlebars
{{fieldInfo calloutType prompt="Which type of callout do you want to use?" type="singleSelect" opts="note, warning, success, info, tip, error, example" suggest="note"}}
{{fieldInfo calloutText suggest=sourceText}}
> [!{{formatStringToUpper calloutType}}] {{title}}
> {{calloutText}}
```

### Example Usage
1. Select the text: "Remember to update the API keys before deploying"
2. Run **Insert Block Template Using Selected Text**
3. Select the "Callout" block template
4. Enter callout type: "warning", title: "Deployment Reminder"
5. Confirm that the selected text is what you wish to use for the calloutText field by touch the input box.
6. Click "Continue".  ==confirm button name==
7. Your selection is replaced with:

```md
> [!WARNING] Deployment Reminder
> Remember to update the API keys before deploying
```

## Tips
- Great for refactoring – select messy text, wrap it in structured templates
- The selection is replaced, not preserved separately – design templates accordingly
- Combine with [[fieldInfo Helper|fieldInfo]] to offer the selection as a suggestion rather than forcing its use

## Related Commands
- [[Insert Block Template]] – Insert a block without using a selection
- [[Create File From Selected Text]] – Create a new file from selected text instead of inserting a block

> [!DANGER]
> - Check if multi-line selections work correctly, especially with indentation
> - Consider adding a how-to guide for callout example for general use. Consider adding to Z2K System.
> - Build a test case for the callout example as it is so useful
- 