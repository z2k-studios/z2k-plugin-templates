---
z2k_template_type: comprehensive_test
z2k_template_default_miss_handling: preserve
author: Claude
created: "{{date}}"
version: 1.0
---
# Z2K Template Engine Test Document

## Basic Variables
- Simple variable: {{Title}}
- Built-in date: {{date}}
- Built-in time: {{time}}
- Built-in today: {{today}}
- Built-in yesterday: {{yesterday}}
- Built-in tomorrow: {{tomorrow}}
- Built-in timestamp: {{timestamp}}
- Built-in weekNum: {{weekNum}}
- Built-in weekday: {{weekday}}

## Date Formatting
- Date with format: {{date:YYYY-MM-DD}}
- Today with readable format: {{today:MMM Do, YYYY}}
- Yesterday with weekday: {{yesterday:ddd, MMM D}}
- Tomorrow with custom format: {{tomorrow:DD/MM/YYYY}}
- Timestamp formatted: {{timestamp:HH:mm:ss}}

## Helper Functions
- Uppercase: {{format-string-to-upper ::Title::}}
- Lowercase: {{format-string-to-lower ::Author|text|Author of the book?|\[Author\]::}}
- Spacify: {{format-string-spacify "CamelCaseText"}}
- Trim: {{format-string-trim "  Text  "}}
- Raw helper: {{format-string-raw ::RawContent::}}
- Wiki link: {{wikilink ::RelatedNote::}}
- Named wiki link: {{wikilink-named ::RelatedNote:: "See this note"}}

## Prompting Syntax
- Basic prompt: {{BookTitle|text|What's the book title?|The Great Gatsby}}
- Number prompt: {{Rating|number|Rate from 1-10|7}}
- Date prompt: {{DueDate|date|When is it due?|tomorrow}}
- Boolean prompt: {{Complete|boolean|Is it complete?|false}}
- Single select: {{Category|singleSelect:Fiction,Non-fiction,Reference|Select category|Fiction}}
- Multi select: {{Tags|multiSelect:Work,Personal,Urgent|Add tags|Personal}}
- Multi select: {{Tags2|multiSelect: Work, Personal, Urgent |Add tags|Personal}}
- Miss text specified: {{OptionalField|text|Test missing on this|Default|Missing text placeholder}}

## Directive Handling
- Clear if missing: {{@clear ClearField}}
- Preserve if missing: {{@preserve PreserveField}}
- Multiple directives: {{@clear @required ProjectTitle|text|Project name?}}

## Whitespace Control
- Trim both sides: {{~TrimBoth~}}
- Trim left side: {{~TrimLeft }}
- Trim right side: {{ TrimRight~}}

## JSON Data Access
- Nested property: {{person.firstName}}
- Array element: {{book.authors.0.name}}

## Nested Helpers
- Nested function: {{format-string-to-upper (format-string-trim Title)}}
- Format then link: {{wikilink (format-string-to-lower PageName)}}

## Comments
- Comment field: {{! This is a comment and will be removed }}
- Unescaped HTML: {{{RawHTML}}}

## Complex Examples
- Format date from prompt: {{format-date (DueDate|date|When due?|tomorrow) "dddd [at] h:mm a"}}
- Field with field as default: {{~BookTitle|text|What's the title?|{{DefaultTitle}}~}}
- Escaped variables in text: This \{{won't be processed}} as a template var

## Multiple Variables Per Field
- Using caret syntax: {{string-concat ^var1|text|First var^ "and" ^var2|text|Second var^}}

## Expression with Directives
- With clear: {{@clear @preserve DocumentType|text|Document type?|Report}}
- With multiple directives: {{@clear @required @no-prompt Author|text|Author name?}}

## Date Operations
- Yesterday of specific date: {{format-date (yesterday:YYYY-MM-DD) "YYYY-MM-DD"}}
- Tomorrow of today: {{format-date (tomorrow:YYYY-MM-DD) "dddd, MMMM D"}}

## Edge Cases
- Empty default: {{EmptyDefault|text|Provide value||Missing}}
- Special characters: {{SpecialChars|text|Enter special chars|!@#$%^&*()}}
- Quotes: {{QuotedText|text|Enter text with "quotes"|"Quoted text"}}
- Escape sequences: {{EscapeSequences|text|Enter with escapes|\n\t\r}}
- Nested variables multiple levels: {{format-string-to-upper (format-date (DueDate|date|When?) "YYYY-MM-DD [cap]")}}

## Summary
Test template created on {{today:YYYY-MM-DD}} by {{Author|text|Your name?|Template Tester}}.
All {{TotalTests|number|Number of tests?|42}} tests completed.

## Ones that should fail/aren't made right
- {{UserDate:{{DateFormat|text|Which format?|YYYY-MM-DD}}}}
- {{string-concat ^var1|text|First var^ and ^var2|text|Second var^}}
- {{#if ^checkVar|boolean|Enable feature?|false^ }}Feature enabled: ^featureName|text|Name?|Default^{{/if}}

## Other
{{"Simple string"}}
{{("This isn't allowed")}}
