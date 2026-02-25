---
sidebar_position: 50
aliases:
- Custom Helper Functions
- custom helpers
- user defined helpers
---
# User Defined Helper Functions
When Z2K Templates' built-in helpers don't cover what you need, you can write your own in JavaScript. Custom helpers have full access to the Obsidian API and can perform any transformation you need.

## Contents
- [[#Enabling Custom Helpers]]
- [[#The registerHelper Function]]
- [[#Available Globals]]
- [[#Working with Parameters]]
- [[#Accessing Obsidian APIs]]
- [[#Error Handling]]
- [[#Best Practices]]
- [[#Example Helpers]]

## Enabling Custom Helpers
Custom helpers are disabled by default — they execute arbitrary JavaScript with full access to your vault.

To enable:
1. Open **Settings → Z2K Templates**
2. Find the **Custom Helpers** toggle
3. Enable it (you'll see a security warning)
4. Click **Edit Custom Helpers** to open the code editor

> [!WARNING]
> Custom helpers execute arbitrary JavaScript with full access to your vault, files, and the Obsidian API. Only enable this if you wrote the helper code yourself or fully trust its source.

## The registerHelper Function
All custom helpers are registered using the `registerHelper` function:

```javascript
registerHelper('helperName', (arg1, arg2, ...) => {
    // Your code here
    return result;
});
```

Once registered, use the helper in templates exactly like any built-in helper:

```handlebars
{{helperName argument1 argument2}}
```

## Available Globals
Inside the custom helpers editor, these globals are available:

| Global | Description |
| ------ | ----------- |
| `app` | Obsidian App instance |
| `obsidian` | Obsidian module (Notice, Modal, TFile, etc.) |
| `moment` | Moment.js library for date manipulation |
| `Handlebars` | The Handlebars instance (advanced usage) |
| `registerHelper` | Function to register your custom helpers |

## Working with Parameters

### Single Parameter
Most helpers take one value and transform it:

```javascript
registerHelper('reverse', (value) => {
    return String(value).split('').reverse().join('');
});
```

### Multiple Parameters
Helpers can accept multiple arguments:

```javascript
registerHelper('repeat', (value, times) => {
    return String(value).repeat(Number(times) || 1);
});
```

Usage: `{{repeat "a rose is " 4}}` → `a rose is a rose is a rose is a rose is `

### Optional Parameters with Defaults
```javascript
registerHelper('truncate', (value, length, ellipsis) => {
    const str = String(value);
    const maxLen = Number(length) || 50;
    const suffix = ellipsis !== undefined ? String(ellipsis) : '...';

    if (str.length <= maxLen) return str;
    return str.substring(0, maxLen) + suffix;
});
```

Usage:
- `{{truncate description 100}}` → First 100 chars + "..."
- `{{truncate description 100 " [more]"}}` → First 100 chars + " [more]"

### The Options Hash
Handlebars passes an options object as the last argument. For simple helpers you can ignore it, but it's there if needed:

```javascript
registerHelper('debug', (value, options) => {
    console.log('Value:', value);
    console.log('Options:', options);
    return String(value);
});
```

## Accessing Obsidian APIs
Custom helpers can interact with your vault through the `app` and `obsidian` globals.

### Get Recent Files
```javascript
registerHelper('recentFiles', (count) => {
    const limit = Number(count) || 5;
    return app.vault.getMarkdownFiles()
        .sort((a, b) => b.stat.mtime - a.stat.mtime)
        .slice(0, limit)
        .map(f => f.basename)
        .join(', ');
});
```

Usage: `{{recentFiles 3}}` → `Note A, Note B, Note C`

### Get File Metadata
```javascript
registerHelper('fileTag', (filename, tagIndex) => {
    const file = app.vault.getAbstractFileByPath(filename + '.md');
    if (!file) return '';

    const cache = app.metadataCache.getFileCache(file);
    const tags = cache?.frontmatter?.tags || [];
    const idx = Number(tagIndex) || 0;

    return tags[idx] || '';
});
```

### Show a Notice
```javascript
registerHelper('notify', (message) => {
    new obsidian.Notice(String(message));
    return ''; // Silent helper
});
```

## Error Handling
Z2K Templates wraps all custom helpers with error handling. If your helper throws an error:
1. The error is logged to the console
2. The error is recorded in the [[Error Handling|error log]]
3. The field output is replaced with `[Error in helperName]`

Your template continues processing rather than failing entirely.

### Defensive Coding
Write defensively to provide a better experience when inputs are unexpected:

```javascript
registerHelper('safeDivide', (a, b) => {
    const numA = Number(a);
    const numB = Number(b);

    if (isNaN(numA) || isNaN(numB)) return '[Invalid numbers]';
    if (numB === 0) return '[Division by zero]';
    return numA / numB;
});
```

## Best Practices

### Date Handling
Dates in Z2K Templates are stored as strings. When working with dates:
- Use `moment()` as your source – it's a fully qualified, unambiguous timestamp
- Parse date strings carefully with Moment.js
- Consider timezone implications

```javascript
registerHelper('daysUntil', (dateString) => {
    const target = moment(dateString);
    const now = moment();

    if (!target.isValid()) return '[Invalid date]';

    const days = target.diff(now, 'days');
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
});
```

### Return Types
Helpers should return strings, or values that convert cleanly to strings. Returning objects or `undefined` may produce unexpected output.

### Naming Conventions
Follow Z2K's [[Naming Helpers|helper naming conventions]]:
- Use lowercase with hyphens: `my-helper`
- Be descriptive: `format-phone-number` not `fpn`
- Avoid conflicts with built-in helpers

### Performance
Helpers run during template rendering. Avoid:
- Expensive file system operations
- Network requests
- Infinite loops

## More Example Helpers

### Title Case
```javascript
registerHelper('titleCase', (value) => {
    return String(value)
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
});
```

### Word Count
```javascript
registerHelper('wordCount', (value) => {
    const text = String(value).trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
});
```

### Random Choice
```javascript
registerHelper('randomChoice', (...args) => {
    // Last arg is Handlebars options, ignore it
    const choices = args.slice(0, -1);
    if (choices.length === 0) return '';
    return choices[Math.floor(Math.random() * choices.length)];
});
```

Usage: `{{randomChoice "Option A" "Option B" "Option C"}}`

### Quote Block Formatter
```javascript
registerHelper('blockquote', (value) => {
    return String(value)
        .split('\n')
        .map(line => '> ' + line)
        .join('\n');
});
```

### Link to Daily Note
```javascript
registerHelper('dailyLink', (offset) => {
    const date = moment().add(Number(offset) || 0, 'days');
    const formatted = date.format('YYYY-MM-DD');
    return `[[${formatted}]]`;
});
```

Usage:
- `{{dailyLink}}` → `[[2025-01-14]]`
- `{{dailyLink -1}}` → `[[2025-01-13]]`
- `{{dailyLink 7}}` → `[[2025-01-21]]`

> [!DANGER] Notes for Review
> - Verify all example helpers work as documented – especially the Obsidian API examples.
> - The `recentFiles` example uses `app.vault` directly – confirm this is the correct API.
> - Test what happens when `registerHelper` is called with a name that conflicts with a built-in helper.
> - Document whether helpers persist across sessions or need to be re-registered.
