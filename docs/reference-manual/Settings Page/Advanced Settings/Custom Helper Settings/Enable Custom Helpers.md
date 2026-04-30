---
sidebar_position: 10
aliases:
- enable custom helpers
- custom helpers enabled
---
# Enable Custom Helpers
Master toggle for the custom helpers feature.

- **Default:** Off
- **Type:** Toggle

When you turn this on, the plugin displays a security confirmation dialog before enabling. You must acknowledge the risk before proceeding. Once confirmed:
- The [[Edit Custom Helpers]] button appears below this toggle
- Any previously saved helper code is loaded immediately

When you turn this off:
- Custom helpers are unloaded
- The [[Edit Custom Helpers]] button is hidden

## Security

> [!WARNING]
> Custom helpers execute **arbitrary JavaScript** with full access to your vault, files, and the Obsidian API. Only enable this if you wrote the helper code yourself or fully trust its source. This is not sandboxed.

A malicious helper could:
- Read any file in your vault, including private notes
- Modify or delete notes anywhere in the vault
- Send your data to an external server over the network
- Call any Obsidian API on your behalf — workspace, vault, file manager, and beyond

### Why this is opt-in
Custom helpers are off by default and gated behind a confirmation dialog. Templater — an Obsidian community plugin — has offered similar JavaScript execution for years, and Z2K Templates follows that precedent. The opt-in step exists so activation is an explicit, informed decision rather than a quiet default.

### Sourcing helpers safely
Treat helper code the way you would treat a shell script or browser extension — only run what you trust.
- Prefer helpers you wrote yourself, or code you understand line by line
- Read community-shared helpers before pasting them. Look for filesystem writes, network calls (`fetch`, `XMLHttpRequest`), or use of `app.vault` / `app.fileManager` outside of obvious read-only operations
- Distrust obfuscated or minified helper code — a small text-formatting helper has no reason to be unreadable
- Re-vet helpers when updating them from a new source. A familiar name in search results is not a substitute for the original vetted source.
