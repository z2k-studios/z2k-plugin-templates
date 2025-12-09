---
sidebar_position: 30
doc_state: initial_ai_draft
title: field-info Output
sidebar_label: field-info Output
---

# field-info Output
`{{field-info}}` is a [[Silent Helper Functions|Silent Helper Function]], meaning that it does not have any output when it is finalized. Instead it simply disappears when then resultant file is [[Finalization|finalized]] or when the corresponding field is fully resolved. 

## Can I Output the Field Value?
If you wish to specify the [[field-info Parameters]] but want it to also emit the field value once the user specifies it, then use the [[field-output Helper Variation]] instead.

## Whitespace
The `{{field-info}}` helper function will remove any whitespace after it up until the end of the line, and will remove the ending "new line" (return/enter) at the end of the line. This effectively makes a line


> [!TIP] Multiple Lines of Whitespace
> If you have multiple lines of text that you wish to remove around a `{{field-info}}`, consider using the Handlebars [[tilde]] command. For example:
> ```md title="Template - Person.md"
> 
> {{~field-info fileTitle default="{{FullName}}" miss="{{FullName}}"}}
> {{field-info FullName default="{{FirstName}} {{LastName}}" ~}}
> 
> # Person: {{FullName}}
> - First Name :: {{LastName}}
> - Last Name  :: {{FirstName}}
> - Relationship :: {{fo Relationship type="multiselect" opts="#Friend, #Family, #Acquaintance, #Colleague"}}
> ```
> 


