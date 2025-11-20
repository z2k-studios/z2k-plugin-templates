---
sidebar_position: 20
sidebar_class_name: z2k-code
sidebar_label: "{{date-add}}"
---
# date-add Helper

Z2K Templates supports a number of [[Built-In Fields]] for [[Built-In Fields - Date and Time|Date and Time]] entries. But, there is always a need for more customized date fields. You can use the `{{date-add}}` Helper Function to construct new fields for specific moments in time. 

## Syntax
The `{{date-add}}` helper uses the following syntax:

> `{{date-add unitsInDays sourceTime}}`

Where:
- `date-add` -- the name of the Helper Function
- `unitsInDays` -- the numeric number of days to forward adjust a day by (where 1 = 1 Day). Can be negative to go backwards in time. 
- `sourceTime` -- the optional name of the date field to modify. 
	- By default, this parameter is `{{now}}` - see [[now]]. Besides being the default value for `sourceTime`, we highly recommend to only use the built-in `{{now}}` field under most circumstances. 
	- See [[#Using Other Date-Time Values for sourceTime]] section below for more details.
## Controlling Format
When you use a `{{date-add}}` Helper, it creates a new date that represents the adjusted date. If you want to control the formatting of the date, you will still need to use the `{{format-date}}` Helper to control the [[format-date|format of the date]].

## Examples

```
# Direct Usage
One Hour From Now: {{date-add (calc "1/24")}} {{! 1/24th of a day is an hour }}
Same Day Last Week : {{format-date "YYYY-MM-DD" (date-add -7 now)}} 

# Creating new custom fields using field-info
{{field-info DaysFromNow2 value=(date-add 2)}}
{{field-info InTwoHours value=(format-date "HH:mm" (date-add (calc "2/24") now))}}
Two Hours From Now: {{InTwoHours}}
Link to Two Days From Now: {{wikilink (format-date "YYYY-MM-DD" DaysFromNow2)}}

```


> [!TIP] Custom Time Built-Ins
> If there are some time offsets that you would like to be more universally accessible across your vault, you can place the `{{field-info … value=(date-add …)}}` into either a [[Intro to System Blocks|System Blocks]] or the [[Global Block]]


## Using Other Date-Time Values for sourceTime
The date that is passed into the `sourceTime` parameter is expected to be a fully qualified date stored as a string (i.e. what is provided by `{{now}}` - see [[now]]). If you pass a date that is only partially specified (e.g. `{{today}}` does not contain the current time element), then you will have a truncation of data that will yield unpredictable results if you attempt to access the portion of the date that has been truncated. 

Similarly, some date formats are ambiguous, e.g. MM/DD/YYYY vs. DD/MM/YYYY - these can produce unexpected responses.

For more details, see the [[format-date#Using format-date with sourceTimes other than Now|similar issue in format-date]].

> [!Warning] Only use \{\{now\}\} with date-add
> For all these reasons, we strongly recommend that you use `{{date-add}}` only with the fully qualified `{{now}}` built-in as its `sourceTime` parameter. If you use alternative source times, you will need to ensure that truncation and ambiguity does not occur in your usage.