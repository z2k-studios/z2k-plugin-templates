---
sidebar_position: 70
sidebar_class_name: z2k-code
sidebar_label: "{{timestamp}}"
---
# timestamp Built-In Field
The `{{timestamp}}` built-in field returns the current moment in time as a zettelkasten-friendly timestamp (out to the current second).

## Default Format
The default format for the `{{timestamp}}` built-in field is `YYYYMMDDHHmmss`. You can override that using Obsidian style date formatting or with the [[formatDate]] Built-In Helper Function. 

## Customizing the Format of timestamp
To adjust the format of the built-in `{{timestamp}}` field, please use the [[formatDate]] built-in Helper function.

> [!WARNING] Do not use Date Helper Functions on timestamps!
> Passing the field `timestamp` to either [[dateAdd]] or [[formatDate]] will fail because the timestamp string is not a valid date or time value. Therefore, if you need to use an alternative timestamp value, construct it with the [[formatDate]] helper using [[now]] as the sourceTime. Please see the [[formatDate#Using formatDate with sourceTimes other than Now|comment in the formatDate]] reference page.


## Example Output 
Given a template snippet of:
```md title="Timestamp Example Template.md"
{{fieldInfo fileTitle suggest="{{timestamp}}" directives="finalize-suggest"}}
{{fieldInfo PreciseTimestamp type="string" value=(formatDate "YYYYMMDDHHmmssSSS") directives="no-prompt"}}

- Document Timestamp: {{timestamp}}   {{~! This uses the default formatting. }}
- Document Precise Timestamp: {{formatDate "YYYYMMDDHHmmssSSS"}}  {{~! This uses now instead of timestamp }}
- Precise Timestamp #2: {{PreciseTimestamp}}  {{~! This uses our own timestamp field }}
```

If today was 2026-07-04, at 12:34:56.789 AM this would yield the following result:
```md title="20260704123456789.md"
- Document Timestamp: 20260704123456
- Document Precise Timestamp: 20260704123456789 
- Precise Timestamp #2: 20260704123456789 
```

## Using Timestamps in Your Note Filenames
Notice that in the example above, the template snippet assigns a timestamp to the filename of the resultant note using [[Modifying Built-In Field Behaviors#fileTitle and fieldInfo|fieldInfo]]. This is one easy way to adapt Obsidian into a traditional zettelkasten naming scheme. See the [[Intermediate]] How To Guides for a step through on how to set up timestamp file naming across the entire vault automatically. 