---
sidebar_position: 20
sidebar_class_name: z2k-code
sidebar_label: "{{dateAdd}}"
---
# dateAdd Helper

Z2K Templates supports a number of [[Built-In Fields]] for [[Built-In Fields - Date and Time|Date and Time]] entries. But, there is always a need for more customized date fields. You can use the `{{dateAdd}}` Helper Function to construct new fields for specific moments in time. 

## Syntax
The `{{dateAdd}}` helper uses the following syntax:

> `{{dateAdd unitsInDays sourceTime}}`

Where:
- `dateAdd` -- the name of the Helper Function
- `unitsInDays` -- the numeric number of days to adjust by (where 1 = 1 Day). Can be negative to go backwards in time. Supports fractional values (e.g., `1/24` for one hour, `1/1440` for one minute).
- `sourceTime` -- the optional name of the date field to modify. 
	- By default, this parameter is `{{now}}` - see [[now]]. Besides being the default value for `sourceTime`, we highly recommend to only use the built-in `{{now}}` field under most circumstances. 
	- See [[#Using Other Date-Time Values for sourceTime]] section below for more details.
## Controlling Format
When you use a `{{dateAdd}}` Helper, it creates a new date that represents the adjusted date. If you want to control the formatting of the date, you will still need to use the `{{formatDate}}` Helper to control the [[formatDate|format of the date]].

## Examples
Some sample usages outputting modified dates directly into a file:

```handlebars
# Direct Usage
One Hour From Now: {{dateAdd (calc "1/24")}} {{! 1/24th of a day is an hour }}
Same Day Last Week : {{formatDate "YYYY-MM-DD" (dateAdd -7 now)}} 

Some more advance examples that use the [[fieldInfo value|value]] parameter to create new fields that behave like [[Built-In Fields]]:
```handlebars
# Creating new custom fields using fieldInfo
{{fieldInfo DaysFromNow2 value=(dateAdd 2)}}
{{fieldInfo InTwoHours value=(formatDate "HH:mm" (dateAdd (calc "2/24") now))}}
Two Hours From Now: {{InTwoHours}}
Link to Two Days From Now: {{wikilink (formatDate "YYYY-MM-DD" DaysFromNow2)}}

```


> [!TIP] Custom Time Built-Ins
> If there are some time offsets that you would like to be more universally accessible across your vault, you can place the `{{fieldInfo … value=(dateAdd …)}}` into either a [[Intro to System Blocks|System Blocks]] or the [[Global Block]]


## Using Other Date-Time Values for sourceTime
The date that is passed into the `sourceTime` parameter is expected to be a fully qualified date stored as a string (i.e. what is provided by `{{now}}` - see [[now]]). If you pass a date that is only partially specified (e.g. `{{today}}` does not contain the current time element), then you will have a truncation of data that will yield unpredictable results if you attempt to access the portion of the date that has been truncated. 

Similarly, some date formats are ambiguous, e.g. MM/DD/YYYY vs. DD/MM/YYYY - these can produce unexpected responses.

For more details, see the [[formatDate#Using formatDate with sourceTimes other than Now|similar issue in formatDate]].

> [!Warning] Only use \{\{now\}\} with dateAdd
> For all these reasons, we strongly recommend that you use `{{dateAdd}}` only with the fully qualified `{{now}}` built-in as its `sourceTime` parameter. If you use alternative source times, you will need to ensure that truncation and ambiguity does not occur in your usage.