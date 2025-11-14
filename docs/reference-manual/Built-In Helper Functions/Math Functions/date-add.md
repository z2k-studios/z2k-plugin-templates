---
sidebar_position: 20
sidebar_class_name: z2k-code
sidebar_label: "{{date-add}}"
---
# date-add Helper


==needs specification. Allows people to make their own dates ==

```
{{field-info DaysFromNow2 value=(date-add now 2)}}
{{field-info InTwoHours value=(date-add now (calc "2/24"))}}
```


Allows users to create new built ins with {{field-info todayPlus4 value=(date-add now 4) directives="finalize-default"}} 
May want to call format-date on it too to control how it appears
These field-infos can then go into the system block
