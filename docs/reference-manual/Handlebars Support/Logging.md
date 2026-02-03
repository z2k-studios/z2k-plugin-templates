---
sidebar_position: 70
aliases:
  - logging
  - log
  - debug logging
  - Handlebars Logging
---
# Logging
Handlebars provides a `{{log}}` helper for outputting values during template rendering. Z2K Templates passes this through to Handlebars without modification. The main thing to know is where to find the output.

For complete syntax details, see the [Handlebars Log documentation](https://handlebarsjs.com/guide/builtin-helpers.html#log).

## Usage
`{{log}}` outputs a value to the console during rendering. It produces no visible content in the template output:

```handlebars
{{log fieldName}}
{{log "Processing section:" sectionTitle}}
```

You can log multiple values in a single call – they appear as separate arguments in the console output.

## Where to Find the Output
Because Obsidian is an Electron application, `{{log}}` writes to Obsidian's **developer console**, not to the template output or any visible UI element.

To open the developer console:
- **Windows/Linux**: `Ctrl + Shift + I`
- **macOS**: `Cmd + Option + I`

Look for the logged values in the **Console** tab. They appear during the template rendering pass – if you've already rendered the template, you'll need to re-render to see fresh output.

## When to Use It
`{{log}}` is primarily useful for debugging templates during development:

- Inspecting the value of a field before it's inserted
- Verifying that a helper produces the expected result
- Checking whether a field is defined or `undefined` at a particular point in the template

```handlebars
{{log "projectName is:" projectName}}
{{log "status equals:" (eq status "active")}}
# {{projectName}}
```

## Limitations
- `{{log}}` output is only visible in the developer console – there is no way to redirect it to the template output or to a file
- Logging occurs at render time, so deferred fields will show as `undefined` in the log output
- The log helper is a [[Silent Helper Functions|silent helper]] – it produces no output in the rendered template

> [!DANGER] Notes for Review
> - Z2K Templates does not register a custom `log` helper – this is pure Handlebars passthrough. Verified by searching `z2k-template-engine/src/main.ts` for any log-related helper registration.
> - Handlebars supports log levels (`{{log "message" level="warn"}}`), but this has not been tested in the Obsidian/Electron environment. It may or may not map to `console.warn()`.
> - Consider whether a future Z2K-specific debug helper that outputs to the template (rather than console) would be valuable – this could be noted as a potential enhancement.
> - What happens when a URI command uses logging - anything different? Command lists?
