---
sidebar_position: 40
sidebar_class_name: z2k-code
sidebar_label: "{{today}}"
---
# today Built-In Field
The `{{today}}` built-in field returns the current date. 

## Default Format
The default format for the `{{today}}` built-in field is `YYYY-MM-DD`. You can override that using Obsidian style date formatting or with the [[format-date]] Built-In Helper Function. 

## Similarity to date Built-In Field
The `{{today}}` built-in field is functionally identical to `{{date}}`, which is supported to maintain consistency with [Obsidian's implementation](https://help.obsidian.md/plugins/templates#Template+variables). By using `{{today}}` instead of `{{date}}`, your templates will be more logically consistent with the other [[Built-In Fields - Date and Time|Date and Time]] built-in fields.

## Customizing the Format of today
![[date#Customizing the Format of date]]

## Example Output 
Given a template snippet of:
```md title="Today Example Template.md"
- Today's Date: {{today}}           {{~! This uses the default formatting.    }}
- Today's Month: {{today:YYYY-MM}}  {{~! This uses Obsidian Style formatting. }}
- Today's Year: {{format-date today "YYYY"}} {{~! This uses Handlebars style. }}
- Link to Today's Daily Note: {{wikilink today}}
```

If today was 2026-07-04, this would yield the following result:
```md title="Today Example Instantiated File.md"
- Today's Date: 2026-07-04
- Today's Month: 2026-07
- Today's Year: 2026
- Link to Today's Daily Note: [[2026-07-04]]
```

## Obsidian Compatibility
Note: we have included the `{{date}}` built-in field to offer compatibility with Obsidian's own templating ability. We do recommend, however, using the Z2K Templates equivalent field `{{today}}` instead to minimize the chance for confusion. See the [[today]] built-in field. 