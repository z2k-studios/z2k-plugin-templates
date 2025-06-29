TBD
Support for  the `{{> partialTemplateFile.md}}` capability in HandleBars







Notes:
Captures all the partials using the same scope logic as the templates, registers them with handlebars.

Do partials ever need partials from other directories besides the template scope logic?
- Likely, yes
How should partials be referenced when they are in parent directories?
- Should be answered now
Passing context - this won't be allowed because we're not allowing fields.with.dots, right?
- Shouldn't worry about this right now
Does the prompt need to prompt for the fields in the partials?
- Yes
Should relative paths be relative to the template or relative to the new card location?
- donno, just do relative to template



When referencing partials, use the name of the partial like this:
{{> partial}}

If there are multiple partials with the same name, it will pick the one that is closest to the template, in this order:
1) Same folder
2) Parent folder
3) Grandparent folder
4) ...
5) Root folder
6) Child folder
7) Grandchild folder
8) ...
9) Any sibling folder/cousin folder (undefined order)

When using [[Embedded Templates]], the extra templates folder name can optionally be omitted from the path. This means that, for example, `/z2k/folderA/Templates/partial` can be referenced using `folderA/Templates/partial` or `folderA/partial`. In cases where this creates ambiguity, you must use the path with the Embedded Templates folder name, like `folderA/Templates/partial`.

Examples:

When using External Templates:
	If you're using:
	/External Templates/folderA/template
	This is the order of precedence for  `{{> partial}}`
	/External Templates/folderA/partial
	/External Templates/partial
	/External Templates/folderA/folderB/partial
	/External Templates/folderC/partial

When using Embedded Templates:
	If you're using:
	/z2k/folderA/Templates/template
	This is the order of precedence for `{{> partial}}`
	/z2k/folderA/Templates/partial
	/z2k/folderA/Templates/folderD/partial
	/z2k/Templates/partial
	/z2k/Templates/folderE/partial
	/z2k/folderA/folderB/Templates/partial
	/z2k/folderC/Templates/partial

Relative paths like ../partial are not supported at this time. Please submit a feature request if you would like this functionality.