---
sidebar_position: 60
sidebar_label: Modifying Built-In Fields
aliases:
- Modifying Built-In Field Behaviors
- Field-Info for Built-In Fields
- Built-In Fields and Field-Info
---
# Modifying Built-In Field Behaviors
Built-in fields aren't fixed. Using the [[fieldInfo Helper]], you can change how any built-in field behaves — reformatting its output, replacing its value entirely, or forcing it to appear in the prompting interface.

## Contents
- [[#How it Works]]
- [[#Use Case – Controlling Prompting Behavior]]
- [[#Use Case – Overriding a Built-In's Value]]
- [[#Use Case – Scoping an Override to a Folder]]
- [[#Limitations]]

## How it Works
Every built-in field has default behavior defined by the engine. But that behavior is just a starting point — it can be replaced, suppressed, or redirected using `{{fieldInfo}}` declarations, exactly as you would configure any other template field.

The key insight: the engine sees a `{{fieldInfo}}` declaration for a built-in field the same way it sees one for a user-defined field. The same parameters apply — `value`, `directives`, `suggest`, and others. You are not patching the built-in; you are declaring how the field should behave at the scope where your `{{fieldInfo}}` for your Built-in field lives.

**Where to place the declaration:**
- In the [[Global Block]] to apply vault-wide — every template inherits the behavior
- In a [[Intro to System Blocks|System Block]] to limit scope to a folder and its subfolders — different parts of the vault can behave differently

A more specific declaration always wins. A `{{fieldInfo}}` in a template overrides one in a system block, which overrides one in the global block.

## Use Case – Controlling Prompting Behavior
The simplest modification: change whether a built-in appears in the prompting interface, without changing what it produces.

By default, built-in fields resolve silently — they never appear in the prompt dialog. You can override this with `directives="yes-prompt"`:

```handlebars
{{fieldInfo today directives="yes-prompt" suggest=(formatDate "YYYY-MM-DD" now)}}
```

This forces a prompt for `{{today}}`, pre-filling the input with today's date in `YYYY-MM-DD` format. The user can accept it or enter a different date entirely. The `suggest` here uses a fresh `formatDate` expression with the [[now]] value — not a reference to `today` itself — so there is no circular dependency.

## Use Case – Overriding a Built-In's Value
The [[fieldInfo value|value parameter]] replaces a built-in field's default computation with an expression you provide. Declared in the [[Global Block]], the override applies vault-wide.

`{{today}}` defaults to `YYYY-MM-DD`. To apply a different format across all templates:

```handlebars file="Global Block"
{{fieldInfo today value=(formatDate "MM/DD/YYYY")}}
```

Any template referencing `{{today}}` now receives the US-style date — no changes to individual templates required. The same technique applies to `{{yesterday}}`, `{{tomorrow}}`, and other date fields.

> [!WARNING]
> Built-in overrides inside the Global Block apply everywhere the field appears. Any template expecting the standard format will silently receive the override. Document all overrides in your global block so vault collaborators are not surprised.

## Use Case – Scoping an Override to a Folder
The same override mechanism works in a [[Intro to System Blocks|System Block]], but applies only to templates within that folder's hierarchy. This makes the `creator` field a natural example — different vault sections can have different attribution without any per-template configuration.

Consider a vault organized like this:

```text
my-vault/
├── Personal/
│   ├── .system-block.md
│   └── ...
├── Work/
│   ├── .system-block.md
│   └── ...
```

In `Personal/.system-block.md`:
```handlebars file="Personal/.system-block.md"
{{fieldInfo creator value="Bruce Wayne"}}
```

In `Work/.system-block.md`:
```handlebars file="Work/.system-block.md"
{{fieldInfo creator value="Wayne Enterprises, Inc."}}
```

Any template instantiated under `Personal/` receives `{{creator}}` as `Bruce Wayne`. Any template under `Work/` receives `Wayne Enterprises, Inc.`. Templates outside both folders receive `{{creator}}` from its default engine behavior — the plugin settings value. No template needs to declare anything about `creator` at all.

See [[Using System Blocks and fieldInfo]] for a deeper walkthrough of hierarchical scoping.

## Limitations

### No Circular Self-Reference
A built-in field cannot be redefined in terms of itself. The engine resolves built-in values before user prompting begins, so any expression that depends on the field's own current value will find it already filled — creating either a circular dependency or a no-op.

What fails:

```handlebars
{{! Fails — circular dependency}}
{{fieldInfo today suggest=(formatDate "M/D/YY" today) directives="finalize-suggest"}}
```

What works — use a fresh expression that does not reference the field being overridden:

```handlebars
{{fieldInfo today value=(formatDate "MM/DD/YYYY" now)}}
{{fieldInfo tomorrow suggest=(formatDate "M/D/YY" (dateAdd now 1)) directives="finalize-suggest"}}
```

## Creating New Built-In Fields
To define entirely new fields that resolve automatically — without modifying existing built-ins — see [[Custom Built-In Fields]].



> [!DANGER] INTERNAL NOTES
> - **suggest + yes-prompt on built-ins**: Verify that `directives="yes-prompt"` combined with `suggest` works correctly for built-in fields. Specifically: does the `suggest` value appear pre-filled in the prompt, and does the user's input correctly override it? Also confirm `suggest=(formatDate "MM/DD/YYYY")` does not trigger a circular dependency even though `today` uses the same underlying date.
> - **fileTitle + fieldInfo**: Verify which `{{fieldInfo}}` parameters apply to `{{fileTitle}}` and title variant fields. Specifically: does `value` work on `fileTitle` to programmatically set the output filename? This section intentionally omitted until confirmed in source code.
> - **dateAdd argument order**: The working example uses `(dateAdd now 1)` — verify this is correct. Other examples in the docs use `(dateAdd 7 now)` (amount first, then date). If argument order is `(dateAdd amount date)`, then `(dateAdd 1 now)` is correct and `(dateAdd now 1)` should be fixed.
> - **today override end-to-end**: Verify `value=(formatDate "MM/DD/YYYY" now)` and `value=(formatDate "MM/DD/YYYY")` (no second arg) both work in the current engine build.
