---
sidebar_position: 70
sidebar_class_name: z2k-code
sidebar_label: "{{timestamp}}"
---
# timestamp Built-In Field
The `{{timestamp}}` built-in field returns the current moment in time as a zettelkasten-friendly timestamp (out to the current second).

## Default Format
The default format for the `{{timestamp}}` built-in field is `YYYYMMDDHHmmss`. You can override that using Obsidian style date formatting or with the [[format-date]] Built-In Helper Function. 

## Customizing the Format of timestamp
![[date#Customizing the Format of date]]

## Example Output 
Given a template snippet of:
```md title="Today Example Template.md"
{{field-info fileTitle default="{{timestamp}}" directives="finalize-default"}}
- Document Timestamp: {{timestamp}}   {{~! This uses the default formatting. }}
- Document Precise Timestamp: {{format-date timestamp "YYYYMMDDHHmmssSSS"}} 
```

If today was 2026-07-04, at 12:34:56.789 AM this would yield the following result:
```md title="20260704123456789.md"
- Document Timestamp: 20260704123456
- Document Precise Timestamp: 20260704123456789 
```

## Using Timestamps in Your Note Filenames
Notice that in the example above, the template snippet assigns a timestamp to the filename of the resultant note using [[Modifying Built-In Field Behaviors#fileTitle and field-info|field-info]]. This is one easy way to adapt Obsidian into a traditional zettelkasten naming scheme. See the [[Intermediate]] How To Guides for a step through on how to set up timestamp file naming across the entire vault automatically. 