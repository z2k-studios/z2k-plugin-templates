---
sidebar_position: 30
aliases:
  - The Global Block and fieldInfo
---
# The Global Block and fieldInfo
The most common use of the global block is declaring `{{fieldInfo}}` entries that apply vault-wide. Rather than repeating the same field metadata in every template, you declare it once in the global block and the engine applies it everywhere. Individual templates can still override any declaration at a more specific scope.

## Principle: DRY
DRY – "Don't Repeat Yourself" – is the principle that a piece of knowledge should have a single, authoritative source. If you find yourself copying the same `{{fieldInfo}}` block into ten templates, you've created ten places to update when the prompt changes. The global block is the DRY solution: one declaration, applied everywhere.

## Why Use fieldInfo Entries in the Global Block
Any `{{fieldInfo}}` entry in the global block becomes the default for that field across every template in the vault. Here is why you would want to do that:
- **Globally change prompts** – pre-specify [[#Example - Global Field Prompts|field prompts]] for commonly used fields
- **Globally set field types** – assign sensible [[#Example - Global Field Typing|types]] (text, singleSelect, date, etc.) to fields used across the vault
- **Globally provide default suggest values** – [[#Example - Global Suggested and Fallback Values|pre-fill or fall back]] to a value for a field throughout the vault
- **Type consistency** – ensure a field like `{{Status}}` always presents the [[#Example - Global Field Typing|same options]], regardless of which template uses it

See the examples at the bottom of this page.

Beyond the above [[Built-in Helpers for Prompting|prompt control]], you can also use `{{fieldInfo}}` in the global block to override field values - an advanced technique that has its [[Global Block and Field Values|its own reference page]].

## fieldInfo's for Unused Fields
If you declare a `{{fieldInfo}}` in the global block for a field that doesn't appear in the template being processed, the declaration is harmless. The field's metadata exists in the engine's context but produces no visible output, since there is no `{{fieldName}}` expression in the template to resolve it.

During the [[WIP Stage]], the unused field may persist in the file's internal metadata – but it generates no content and imposes no prompt on the user. On [[Finalization]], field declarations for fields absent from the final content are cleared automatically.

This means you can safely declare fieldInfos for any field your vault might ever use, even if only some templates reference them.

## fieldInfo Resolution Order
When the same field has `{{fieldInfo}}` declarations at multiple levels, the most specific one wins:

`built-in` < `global` < `system block` < `block template` < `main template`

A declaration in the global block overrides built-in defaults. A declaration in a system block overrides the global block. The main template always has the final say.

Interestingly, this means you can override the behavior of built-in fields, see [[Modifying Built-In Field Behaviors]] for more details.

This also means the global block sets the floor: it establishes defaults that every template inherits, but any template (or system block) can override them by providing its own `{{fieldInfo}}` for the same field.

## Example - Global Field Prompts
When a field appears across many templates but has no `{{fieldInfo}}` declaration in each one, users see a generic prompt (or no prompt at all). The global block solves this at the source:

```handlebars
{{fieldInfo Project "Project" type="text" prompt="Which Project?"}}
```

Any template using `{{Project}}` will inherit the customized prompt and type – unless it provides its own `{{fieldInfo Project}}` to override.

## Example - Global Field Typing
Field types declared globally ensure consistent interaction patterns across all templates. A `singleSelect` field presents a dropdown everywhere, not just in templates that remembered to declare it:

```handlebars
{{fieldInfo Status "Status" type="singleSelect" opts="Draft,In Progress,Complete"}}
```

Any template using `{{Status}}` will inherit the type and option set. See [[fieldInfo type|type]] and [[fieldInfo opts|opts]] parameters for full details.

## Example - Global Suggested and Fallback Values
`suggest` pre-fills the prompt with a likely answer. `fallback` provides the value when the user skips the field entirely. Both can be set globally:

```handlebars
{{fieldInfo ContactRelationship type="multiSelect" opts="Friend,Family,Colleague,Client,Associate,PublicFigure" suggest="Friend"}}
{{fieldInfo Answer suggest="42"}}
{{fieldInfo Occupation fallback="Freelance Philosopher"}}
```

The first line makes "Friend" the pre-selected option for `ContactRelationship`. The second pre-fills `Answer` with 42 (Douglas Adams would approve). The third ensures `Occupation` always resolves to something even if the user skips past it.

See [[fieldInfo suggest|suggest]] and [[fieldInfo fallback|fallback]] for more details.
