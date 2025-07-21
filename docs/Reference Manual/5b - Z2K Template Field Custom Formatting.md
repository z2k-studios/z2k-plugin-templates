When a Template's `{{field}}` is replaced with data, a template has the option to format the data in the process. There are several ways in which formatting can be done:

1. [[#Default Formatting]] - All data has a small amount of default formatting applied
2. [[#Handlebars Whitespace Formatting]] - using Handlebars' whitespace formatting feature, you can adjust the whitespace in the source template file
3. [[#Obsidian Date-Time Formatting]] - Obsidian also proposes its own date and time formatting ability
4. [[#Z2K Predefined Helpers for Formatting]] - Z2K comes with a number of predefined helper functions to help format the data during field replacement

# Default Formatting
By default, all text, date and numeric data is formatted with default formatting rules. Please see [[5a - Z2K Template Field Data Default Formatting|Default Template Field Formatting]] for more details.

# Handlebars Whitespace Formatting
Z2K supports [Handlebars' White Space](https://handlebarsjs.com/guide/expressions.html#whitespace-control) control using the `~` (tilde) character. Here a tilde is added to either the beginning and/or end of a field name to signify that any white space before or after the `{{field}}` inside the template text should be removed. 

Note that this modifies the text outside/around the `{{field}}` tag in the template text - NOT the actual text being inserted. To trim the preceding or trailing whitespace inside the inserted text, use the [[#format-string-trim Helper|format-string-trim Helper]] function. 

# Obsidian Date-Time Formatting
In keeping with Obsidian's date and time formatting rules, any field that contains date and time information can be formatted by postfixing a colon ( `:`) to the field name, followed by a string of [Moment.js format tokens](https://momentjs.com/docs/#/displaying/format/), for example `{{date:YYYY-MM-DD}}`.

*Note:* This method of formatting date-time fields is included simply to be compatible with Obsdian's existing method for formatting dates. To be more consistent with the general Z2K formatting, you make want to consider using the [[#Z2K Date-Time Formatting|Z2K Date-Time Formatting Helper]] instead.

# Z2K Predefined Helpers for Formatting
The preferred and more general method for formatting information being passed into a Template Field is to use one of the predefined helper functions for formatting. For more details, please see [[7b - Built-In Helper Functions#Formatting Helper Functions|Predefined Helper Formatting Functions]].






