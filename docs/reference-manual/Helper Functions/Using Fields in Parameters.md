---
sidebar_position: 20
aliases:
- Using Fields in Helper Parameters
---
# Using Fields in Helper Parameters

Helper functions really gain their power by being able to perform actions on `{{fields}}`. This page steps through how to use fields inside your [[Helper Functions|Helper Function]] parameters.

To pass a `{{fieldNames}}` to a helper function, there are a few approaches:

1. [[#Passing Fields By Name]]
2. [[#Passing Fields By Quoted String]]
3. [[#Combination Approach]]

## Passing Fields By Name
If you wish to pass a `{{fieldName}}` to a helper function without any extra surrounding text, you can simply provide the name of the field without the `{{`handlebars`}}`. 

For example,
```md file="Template.md"
These are example uses of passing a field by name to a Helper Function:
- {{wikilink today}}
- {{format-string-bulletize KeyPoints}}
```  

It may take some getting use to see fields be referenced by Helper Functions without their curly braces. This was a design decision made by the original handlebars.js spec. 

## Passing Fields By Quoted String
If you wish to pass a `{{fieldName}}` to a helper function with some extra text around the field value, you can construct a string and reference the field within the string using `{{`curly braces`}}`.

For example,
```md file="Template.md"
These are example uses of passing a field by name to a Helper Function:
- {{google "{{BookTitle}} by {{BookAuthor}}"}}
  - This constructs a string with the BookTitle and BookAuthor fields, and then builds an internet link to a google search with them combined together.

- {{format-string-bulletize "{{KeyPoints}}"}}
  - This is functionally equivalent to the version above that does not use curly braces.
```  

Note: You can use either `"`double quotes or `'` single quotes to delimit the string. 

> [!Tip] Delimeters
> If you are trying to capture a string that contains double quotes, use single quote delimeters, and vice versa. 


## Combination Approach
Lastly, you can mix and match approaches for each parameter. 

For example,
```md file="Template.md"
- {{google BookTitle "Google Search for {{BookTitle}}"}}
   - This example uses the field by name approach for the first parameter, and field by quoted string approach for the second parameter:
```  

