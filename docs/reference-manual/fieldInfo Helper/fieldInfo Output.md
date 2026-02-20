---
sidebar_position: 30
doc_state: initial_ai_draft
title: fieldInfo Output
sidebar_label: fieldInfo Output
---

# fieldInfo Output
`{{fieldInfo}}` is a [[Silent Helper Functions|Silent Helper Function]], meaning that it does not have any output when it is finalized. Instead it simply disappears when then resultant file is [[Finalization|finalized]] or when the corresponding field is fully resolved. 

## Can I Output the Field Value?
If you wish to specify the [[fieldInfo Parameters]] but want it to also emit the field value once the user specifies it, then use the [[fieldOutput Helper Variation]] instead.

## Whitespace
The `{{fieldInfo}}` helper function will remove any whitespace after it up until the end of the line, and will remove the ending "new line" (return/enter) at the end of the line. This effectively makes a line


> [!TIP] Multiple Lines of Whitespace
> If you have multiple lines of text that you wish to remove around a `{{fieldInfo}}`, consider using the Handlebars [[tilde]] command. For example:
> ```md title="Template - Person.md"
> 
> {{~fieldInfo fileTitle suggest="{{FullName}}" fallback="{{FullName}}"}}
> {{fieldInfo FullName suggest="{{FirstName}} {{LastName}}" ~}}
> 
> # Person: {{FullName}}
> - First Name :: {{LastName}}
> - Last Name  :: {{FirstName}}
> - Relationship :: {{fo Relationship type="multiselect" opts="#Friend, #Family, #Acquaintance, #Colleague"}}
> ```
> 


