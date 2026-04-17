---
sidebar_position: 80
aliases:
  - custom formatting functions
---
# Writing Custom Formatting Functions
The most common reason to write a [[Custom Helper Functions|custom helper]] is to handle a formatting transformation that Z2K Templates' built-in [[Formatting Functions]] don't cover. A custom formatting helper takes a value, transforms it, and returns the result.

For complete documentation — including setup, available globals, Obsidian API access, error handling, and best practices — see [[Custom Helper Functions]].

## A Simple Formatter
A custom formatting helper takes a value and returns a transformed string:

```javascript
registerHelper('shout', (value) => {
    return String(value).toUpperCase() + '!';
});
```

Usage in a template:

```handlebars
{{shout title}}
```

Output: `MY NOTE TITLE!`

## Single Parameter
Most formatting helpers take one value and transform it:

```javascript
registerHelper('reverse', (value) => {
    return String(value).split('').reverse().join('');
});
```

Usage: `{{reverse "hello"}}` → `olleh`

## Multiple Parameters
Helpers can accept additional arguments to control behavior:

```javascript
registerHelper('repeat', (value, times) => {
    return String(value).repeat(Number(times) || 1);
});
```

Usage: `{{repeat "echo " 3}}` → `echo echo echo `

For more examples and full reference documentation, see [[Custom Helper Functions]].
