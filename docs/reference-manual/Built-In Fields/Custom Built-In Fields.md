---
sidebar_position: 70
aliases:
- Custom Built-In Fields
- custom built-in field
- creating built-in fields
- define your own built-in fields
---
# Custom Built-In Fields
Z2K Templates ships with a set of [[Built-In Fields]] that resolve automatically — no prompting, no per-template declaration. You can also create your own fields that behave the same way.

Two methods are available, although both are considered "for advanced users only":
- **`fieldInfo value` in a global or system block** — declare a computed field using the template engine's existing helper library. No code required.
- **A zero-parameter Custom Helper Function** — register a JavaScript function in the [[Edit Custom Helpers|Custom Helpers editor]]. It appears in templates exactly like any built-in field.

## Contents
- [[#Method 1 – fieldInfo value in a Block]]
- [[#Method 2 – Zero-Parameter Custom Helper Function]]
- [[#Choosing a Method]]
- [[#Naming Custom Built-In Fields]]

## Method 1 – fieldInfo value in a Block
Place a `{{fieldInfo}}` declaration with a `value` expression in your [[Global Block]] or a [[Intro to System Blocks|System Block]]. The engine resolves the expression at instantiation time and makes it available to every template in scope — without any declaration in the template itself.

```handlebars file="Global Block"
{{fieldInfo InOneWeek value=(formatDate "YYYY-MM-DD" (dateAdd 7 now))}}
{{fieldInfo AuthorAtWikipedia value=(wikipedia Author Author)}}
```

Once declared, any template in the vault can reference `{{InOneWeek}}` or `{{AuthorAtWikipedia}}` and receive the computed value — silently, without prompting.

**Scope:**
- Declared in the [[Global Block]] → available vault-wide
- Declared in a [[Intro to System Blocks|System Block]] → available only within that folder's hierarchy, with deeper system blocks able to override the value

**What `value` can express:**
- Date math — `(dateAdd 7 now)`, `(formatDate "YYYY-MM-DD" ...)`
- String composition — `"{{firstName}} {{lastName}}"`
- Field references — `value=Author` (mirrors another field's value)
- Helper calls — `(wikipedia Author Author)`, `(arr "a" "b" "c")`

For the full parameter reference — accepted types, dependency tracking, resolution priority — see [[fieldInfo value|fieldInfo value Parameter]]. Note that `value` expressions run in [[Restricted Functionality Mode]]: helpers and field references work, but [[Block Templates]] (partials) do not.

## Method 2 – Zero-Parameter Custom Helper Function
In Handlebars, a zero-parameter helper function is indistinguishable from a built-in field in template syntax. `{{currentSeason}}` resolves the same way whether the value comes from the engine context or from a registered helper — the template author sees no difference.

As an example, if you register a zero-parameter helper in the [[Edit Custom Helpers|Custom Helpers editor]]:

```javascript
registerHelper('currentSeason', () => {
    const month = moment().month(); // 0-indexed
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Autumn';
    return 'Winter';
});
```

then, in any template you can write something like:

```handlebars
Season: {{currentSeason}}
```

When that template is Instantiated, it will output (in December): `Season: Winter`

No `{{fieldInfo}}` declaration is needed. The helper is registered globally and available in every template once the Custom Helpers editor is saved.

For setup, see [[Custom Helper Functions]] for more information.

## Choosing a Method

| | `fieldInfo value`                                                  | Zero-Parameter Helper |
|---|---|---|
| **Requires JavaScript** | No                                                                 | Yes |
| **Scope control** | Global block (vault) or system block (folder)                      | Always vault-wide |
| **Uses template engine helpers** | Yes – full helper library                                          | No – uses `moment`, `app`, `obsidian` |
| **Can access Obsidian API** | No                                                                 | Yes |
| **Can override built-in fields** | Yes                                                                | Yes |
| **Best for** | Date math, string composition, field aliases, folder-scoped values | External lookups, vault metadata, logic that requires JavaScript |

The `fieldInfo value` method covers many basic cases — it has access to the full helper library and requires no code. Reach for a Custom Helper Function when you need something the template engine cannot express: querying vault metadata, calling Obsidian APIs, or computing values that require genuine programming logic.

## Naming Custom Built-In Fields
Custom built-in fields should follow the same naming conventions as all template fields. The short version:
- For custom Built-In Fields defined via  [[#Method 1 – fieldInfo value in a Block]], we recommend that you use Pascal Case (i.e. capitalize the first letter).
- For custom Built-In Fields defined via [[#Method 2 – Zero-Parameter Custom Helper Function]], we suggest using Camel Case (i.e. make the first letter be lowercase). 
- Be descriptive — the field resolves silently, without a declaration visible to the reader, so its name should make its purpose self-evident.

See [[Naming Fields]] for the full naming guide.



> [!DANGER] NOTES
> - **Zero-parameter helper resolution**: Verify that zero-parameter Custom Helper Functions produce identical output to built-in context properties across all template scenarios — single expression (`{{foo}}`), inline in strings (`"value: {{foo}}"`), and nested in subexpressions (`(someHelper foo)`). The engine's single-expression detection logic checks `allHelpers` to determine resolution path; confirm this covers all cases.
> - **Custom helper scope**: Confirm that helpers registered in the Custom Helpers editor are available globally across all templates, not just the template being instantiated.
> - **Wikilink: Edit Custom Helpers**: Verify this matches the exact page name in the docs.
> - **Wikilink: User Defined Helper Functions**: Page is being renamed to "Custom Helper Functions" — update this link once the rename is complete.
> - **Wikilink: arr**: Confirm `[[arr]]` is the correct page name for the arr helper reference.
