---
sidebar_position: 40
sidebar_class_name: z2k-code
sidebar_label: "{{today}}"
---
# today Built-In Field
The `{{today}}` built-in field returns the current date. 

## Default Format
The default format for the `{{today}}` built-in field is `YYYY-MM-DD`.

## Similarity to date Built-In Field
The `{{today}}` built-in field is functionally identical to `{{date}}`, which is supported to maintain consistency with [Obsidian's implementation](https://help.obsidian.md/plugins/templates#Template+variables). By using `{{today}}` instead of `{{date}}`, your templates will be more logically consistent with the other [[Built-In Fields - Date and Time|Date and Time]] built-in fields.

## Customizing the Format of today
To adjust the format of the built-in `{{today}}` field, please use the [[formatDate]] built-in Helper function. 

> [!TIP] Best to use the now built-in field for formatDate
> When using `formatDate` to alter the appearance of `{{today}}`, we recommend using the `{{now}}` built-in field instead. Please see the [[formatDate#Using formatDate with sourceTimes other than Now|comment in the formatDate]] reference page.

## Tip: Consider Using fileCreationDate Instead
If your template might be used with [[Apply Template to File]], consider `{{fileCreationDate}}` instead of `{{today}}` (see [[fileCreationDate]]).

The difference:
- `{{today}}` – Always returns the current date (when the template is applied)
- `{{fileCreationDate}}` – Returns when the source file was originally created

This matters for retroactive organization. If you jot down meeting notes on Monday and apply a template on Friday, `{{today}}` shows Friday. `{{fileCreationDate}}` shows Monday – preserving when the event actually happened.

For [[Create New File]], both fields return the same value since the file is being created now.

## Example Output 
Given a template snippet of:
```md title="Today Example Template.md"
- Today's Date: {{today}}           {{~! This uses the default formatting.    }}
- Today's Month: {{formatDate "YYYY-MM" now}} {{~! use "now", not "today"    }}
- Today's Year: {{formatDate "YYYY" now}}     {{~! use "now", not "today"    }}
- Link to Today's Daily Note: {{wikilink today}}
```

If today was 2026-07-04, this would yield the following result:
```md title="Today Example Instantiated File.md"
- Today's Date: 2026-07-04
- Today's Month: 2026-07
- Today's Year: 2026
- Link to Today's Daily Note: [[2026-07-04]]
```
