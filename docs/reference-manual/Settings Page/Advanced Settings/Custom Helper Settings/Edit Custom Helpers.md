---
sidebar_position: 20
aliases:
- edit custom helpers
- custom helpers editor
- user helpers
---
# Edit Custom Helpers
Opens a JavaScript code editor modal for writing and registering custom Handlebars helpers. This button only appears when [[Enable Custom Helpers]] is on.

- **Default:** Empty (starter comment block)
- **Type:** Button → opens JavaScript code editor modal
- **Visibility:** Only shown when [[Enable Custom Helpers]] is enabled

![[custom-helpers-editor.png]]
(Screenshot: The Custom Helpers editor modal with example helper code)

Helpers are registered using the `registerHelper(name, fn)` function. Once registered, they are available in any template with `{{helperName ...}}` syntax.

## Available Globals
The following objects and functions are available inside the editor:

| Global | Description |
|--------|-------------|
| `app` | The Obsidian App instance – access to vault, workspace, metadataCache, and more |
| `obsidian` | The Obsidian module – Notice, Modal, TFile, and other classes |
| `moment` | Moment.js library for date manipulation |
| `Handlebars` | The Handlebars instance used by the template engine |
| `registerHelper(name, fn)` | Registers a named helper function |

## Examples

### Transform a Value

```js
registerHelper('shout', (value) => String(value).toUpperCase() + '!');
```

Usage in a template:

```handlebars
{{shout "hello"}}
```

Output: `HELLO!`

### Query the Vault

```js
registerHelper('recentFiles', () => {
    return app.vault.getMarkdownFiles()
        .sort((a, b) => b.stat.mtime - a.stat.mtime)
        .slice(0, 5)
        .map(f => f.basename)
        .join(', ');
});
```

Usage in a template:

```handlebars
{{recentFiles}}
```

Output: `Note A, Note B, Note C, Note D, Note E`

## Validation
The editor validates code before saving. If the code contains syntax errors or fails to execute, the plugin reports the error and the helpers are not loaded.

> [!DANGER] NOTES
> - Verify whether `registerHelper` is the only registration mechanism, or if direct `Handlebars.registerHelper` calls also work.
> - The validation step (`validateUserHelpers`) is called before saving. Confirm what it actually checks – syntax only, or does it also execute the code in a trial run?
