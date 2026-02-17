---
sidebar_position: 50
aliases:
- Custom Helper Functions
---
# User Defined Helper Functions
Z2K Templates supports custom helper functions written in JavaScript. Custom helpers can perform any transformation you need and have full access to the Obsidian API.

For complete documentation on writing custom helpers, see [[Writing Custom Formatting Functions]].

## Quick Start

1. Open **Settings → Z2K Templates**
2. Enable the **Custom Helpers** toggle
3. Click **Edit Custom Helpers**
4. Register helpers using `registerHelper(name, fn)`

## Example
```javascript
registerHelper('shout', (value) => {
    return String(value).toUpperCase() + '!';
});
```

Usage: `{{shout "hello"}}` → `HELLO!`

## Available Globals
Inside the custom helpers editor:
- `app` – Obsidian App instance
- `obsidian` – Obsidian module (Notice, Modal, TFile, etc.)
- `moment` – Moment.js for dates
- `Handlebars` – The Handlebars instance
- `registerHelper` – Function to register helpers

> [!WARNING]
> Custom helpers execute arbitrary JavaScript with full access to your vault. Only enable if you trust the code.

> [!DANGER] Notes for Review
> - This page is now a redirect/summary. Full documentation is in [[Writing Custom Formatting Functions]].
> - Consider whether this page should remain or be removed entirely (with redirects).
