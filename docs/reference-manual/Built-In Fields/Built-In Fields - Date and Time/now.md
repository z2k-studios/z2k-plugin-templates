---
sidebar_position: 15
sidebar_class_name: z2k-code
sidebar_label: "{{now}}"
---
# now Built-In Field
The `{{now}}` built-in field returns the current date and time. The `{{now}}` field is considered the best representation of the current moment in time down to the second. 

## Default Format
The default format for the `{{now}}` built-in field is as `YYYY-MM-DD[T]HH:mm:ss.SSS[Z]`. This produces a fully qualified ("ISO string") string like this:

> `2025-11-19T23:14:58.123Z`

This fully qualified, unambiguous format is important because it is the "root" time that is passed by default to other date helper functions, e.g. [[date-add]] and [[format-date]].

> [!WARNING] Do NOT Override
> We highly recommend that you do not override the `{{now}}` field with an alternative value or format. See [[Modifying Built-In Field Behaviors]]. 

## now Is The Most Accurate Time Representation
The `{{now}}` built-in field is the best representation of the current moment in time. It is:
- Locale-Independent (month names, weekday names)
- Includes Seconds and Milliseconds
- Includes 24 hour clock
- Includes an timezone offset (Z)

This accuracy and lack of ambiguity is important, as it represents the current moment in time without risk of truncation or ambiguity. As a result, you should use this as the preferred time source to pass into Helpers that manipulate time (e.g. [[date-add]] and [[format-date]]).

> [!TIP] The Now is Sacred
> Think of "now" as being the untouchable root of all date built-in fields. 