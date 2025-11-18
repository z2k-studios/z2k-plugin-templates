---
sidebar_position: 20
sidebar_class_name: z2k-code
sidebar_label: "{{date-add}}"
---
# date-add Helper

Z2K Templates supports a number of [[Built-In Fields]] for [[Built-In Fields - Date and Time|Date and Time]] entries. But, there is always a need for more customized date fields. You can use the `{{date-add}}` Helper Function to construct new fields for specific moments in time. 

## Syntax
The `{{date-add}}` helper uses the following syntax:

> `{{date-add aDate unitsInDays}}`

Where:
- `date-add` -- the name of the Helper Function
- `aDate` -- the name of the date field to modify. This recommended to be the built-in `{{now}}` under most circumstances. See [[#date Datatype]] section below for more details.
- `unitsInDays` -- the numeric number of days to forward adjust a day by (where 1 = 1 Day). Can be negative to go backwards in time. 

## Controlling Format
When you use a `{{date-add}}` Helper, it creates a new date that represents the adjusted date. If you want to control the formatting of the date, you will still need to use the `{{format-date}}` Helper to control the [[format-date|format of the date]].

## Examples

```
# Direct Usage
One Hour From Now: {{date-add now (calc "1/24")}} {{! 1/24th of a day is an hour }}
Same Day Last Week : {{format-date (date-add now -7) "YYYY-MM-DD"}} 

# Creating new custom fields using field-info
{{field-info DaysFromNow2 value=(date-add now 2)}}
{{field-info InTwoHours value=(date-add now (calc "2/24"))}}
Two Hours From Now: {{InTwoHours:hh:mm:ss}}
Link to Two Days From Now: {{wikilink (format-date DaysFromNow2 "YYYY-MM-DD")}}

```


> [!TIP] Custom Time Built-Ins
> If there are some time offsets that you would like to be more universally accessible across your vault, you can place the `{{field-info … value=(date-add …)}}` into either a [[Intro to System Blocks|System Blocks]] or the [[Global Block]]


## date Datatype
The date that is passed into the `{{date-add}}` function as the 1st parameter is expected to be a fully qualified date stored as a string. If you pass a date that is only partially specified (e.g. `{{today}}` does not contain the current time element, then you will have a truncation of data that will yield unpredictable results. Similarly, some date formats are ambiguous, e.g. MM/DD/YYYY vs. DD/MM/YYYY.

> [!Warning] Only use \{\{now\}\} with date-add
> For this reason, we strongly recommend that you use `{{date-add}}` only with the fully qualified `{{now}}` built-in as its first parameter. 