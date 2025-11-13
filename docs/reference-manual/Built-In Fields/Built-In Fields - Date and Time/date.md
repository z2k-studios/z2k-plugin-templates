---
sidebar_position: 10
sidebar_class_name: z2k-code
sidebar_label: "{{date}}"
---
# date Built-In Field
The `{{date}}` built-in field returns the current date. 

## Default Format
The default format for the `{{date}}` built-in field is `YYYY-MM-DD`. You can override that using Obsidian style date formatting or with the [[format-date]] Built-In Helper Function. 

## Customizing the Format of date
There are two ways to adjust the format of this built-in date-time field:
1. **Obsidian Style**: You can use Obsidian style formatting with the "`:`" qualifier followed by a string of [Moment.js format tokens](https://momentjs.com/docs/#/displaying/format/). 
2. **Handlebars Style**: You can also use the [[format-date]] built-in Helper function to specify a format string for the date. This is more consistent with the general Handlebars.js approach. 

Note: Both styles use  [moment.js](https://momentjs.com/docs/#/displaying/format/) syntax to specify their format strings. Tip: see this [alternative source for moment.js tokens](https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/) . For more details, see [[Custom Field Formatting#Obsidian Date-Time Formatting|Obsidian Date-Time Formatting]].
%% Note: This section is !\[\[included\]\] directly into other date-time pages. Please keep it generic. %%

## Example Output 
Given a template snippet of:
```md title="Date Example Template.md"
- Today's Date: {{date}}           {{~! This uses the default formatting.    }}
- Today's Month: {{date:YYYY-MM}}  {{~! This uses Obsidian Style formatting. }}
- Today's Year: {{format-date date "YYYY"}} {{~! This uses Handlebars style. }}
- Link to Today's Daily Note: {{wikilink date}}
```

If today was 2026-07-04, this would yield the following result:
```md title="Date Example Instantiated File.md"
- Today's Date: 2026-07-04
- Today's Month: 2026-07
- Today's Year: 2026
- Link to Today's Daily Note: [[2026-07-04]]
```

## Obsidian Compatibility
Note: we have included the `{{date}}` built-in field to offer compatibility with Obsidian's own templating ability. We do recommend, however, using the Z2K Templates equivalent field `{{today}}` instead to minimize the chance for confusion. See the [[today]] built-in field. 