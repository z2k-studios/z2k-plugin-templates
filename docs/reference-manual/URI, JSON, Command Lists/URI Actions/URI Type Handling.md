---
sidebar_position: 60
aliases:
- URI Type Handling
- URI Types
- URI Type Conversion
---
# URI Type Handling
Every value in a URI arrives as a string. The string `"5"` and the number `5` are indistinguishable in a URI parameter. The plugin resolves this ambiguity by consulting the template's [[Field Types|field type]] declarations.

## How Conversion Works
When the plugin receives field data from a URI, it checks whether the template declares a type for that field via [[fieldInfo type|fieldInfo]]:
- **Declared type exists** – the plugin converts the string to the declared type. `"5"` becomes the number `5`, `"true"` becomes the boolean `true`, etc.
- **No declared type** – auto-conversion applies: `"true"` and `"false"` become booleans, numeric strings become numbers, everything else stays as a string.

For the complete conversion rules, see [[JSON Type Conversion#Conversion Rules for URI Strings|Conversion Rules for URI Strings]].

## URI vs JSON Sources
This is the key behavioral difference between URI transport and JSON transport:
- **URI parameters** – all values start as strings and are converted based on field type declarations
- **JSON sources** (`.json` files, the [[URI Command - fromJson|fromJson command]], or [[URIs with JSON Data#fieldData|fieldData]]) – values arrive with their native JSON types already intact. `5` is a number, `true` is a boolean – no conversion needed.

If precise typing matters for your use case – and you don't want to rely on type declarations in the template – use the `fromJson` command or `fieldData` to pass typed values directly. 

## More Information
For more information:
- To understand the loose field typing in Z2K Templates, see [[Field Types]]. 
- To understand how JSON types are converted, see [[JSON Type Conversion]].
- To understand how to use JSON with URI Actions, see [[URIs with JSON Data]]


