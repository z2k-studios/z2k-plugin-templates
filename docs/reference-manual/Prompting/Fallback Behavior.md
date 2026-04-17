---
sidebar_position: 50
aliases:
- fallback behavior
- fallback handling
- fallback resolution
---
# Fallback Behavior
Fallback behavior determines what happens to a [[Template Fields|template field]] when no value is provided for it – specifically, when the user never [[Prompt Touching|touches]] the field in the [[Prompting Interface]] and then clicks **Submit and Finalize**.

This matters because Z2K Templates supports [[Deferred Field Resolution]] – fields can remain unresolved across multiple editing sessions. At some point, though, the note gets [[Finalization|finalized]], and every remaining field needs a resolution strategy.

## Why Z2K Handles This Differently
Classic [[Handlebars Support|Handlebars]] assumes all data is available at render time – a missing variable produces an empty string. Z2K Templates breaks this assumption for two reasons:

1. **Iterative workflows** – Some notes are built over time (e.g., daily logs updated throughout the day). Not all data is known at creation.
2. **Deferred knowledge** – Some fields can't be answered yet (e.g., a book rating before you've finished reading).

By default, if a field has no value during a processing event, the field is **preserved as-is** in the output file – keeping the template syntax intact for later resolution.

## Order of Precedence
When a field is finalized without a value, the plugin resolves it using the following order of precedence (highest to lowest):

1. **`fallback` parameter** on [[fieldInfo Helper|{{fieldInfo}}]] – If specified, this value is used. When multiple `{{fieldInfo}}` declarations exist for the same field (across [[fieldInfo Variations|variations]], [[Block Templates]], or [[Intro to System Blocks|System Blocks]]), the last `fallback` value wins.

2. **Finalize directive** on [[fieldInfo Helper|{{fieldInfo}}]] – If no `fallback` is specified, the plugin checks for a [[fieldInfo directives|directive]]. The three finalize directives are mutually exclusive – only one can be active per field. If multiple are specified, the most recent one applies.
   - `finalize-suggest` – uses the [[fieldInfo suggest|suggest]] value as the fallback. If no suggest value exists, the field is cleared.
   - `finalize-clear` – removes the field from the output (replaces with empty string)
   - `finalize-preserve` – keeps the raw template syntax in the output

3. **`z2k_template_default_fallback_handling` YAML property** – If neither a `fallback` value nor a finalize directive is present, the plugin checks the template's YAML frontmatter. See [[YAML Configuration Properties]] for details.

| YAML Value | Behavior |
| ---------- | -------- |
| `finalize-preserve` | (default) Preserve the field as-is in the output |
| `finalize-clear` | Clear the field from the output |
| `finalize-suggest` | Use the field's suggest value; if none exists, clear the field |

4. **Default behavior** – If none of the above are configured, the field is **cleared** from the output.

> [!NOTE]
> The `fallback` parameter takes precedence over *all* other mechanisms. If you set `fallback="N/A"`, the field will always resolve to "N/A" on finalization, regardless of directives or YAML settings.

## Examples

### Using a fallback value
```md
{{fieldInfo status fallback="Draft"}}
```
If `status` is never touched, it resolves to "Draft" on finalization.

### Using a fallback value for numeric values
```handlebars
{{fieldInfo rating type="number" fallback="-1"}}
```
If `rating` is never touched, this will output the text `-1` when fallback handling is triggered. Normally this would be fine, but let's say you have other Template code being conditional off that number:

```handlebars
{{#if (gte rating 0)}}Rating:: {{rating}}{{else}}(No rating provided){{/if}}
```

In this case, because it may be worth converting your fallback value to a numeric value first:

```handlebars
{{fieldInfo rating type="number" fallback=(toNumber "-1")}}
```

### Using finalize-suggest
```md
{{fieldInfo fileTitle suggest="{{BookTitle}} - {{BookAuthor}}" directives="finalize-suggest"}}
```
If the user never touches `fileTitle`, the resolved suggest value becomes the filename on finalization. This is especially useful for file titles that have a predictable pattern but should still be editable.

### Using finalize-preserve
```md
{{fieldInfo notes directives="finalize-preserve"}}
```
If `notes` is never touched, the raw `{{notes}}` syntax remains in the finalized file – useful for fields you want to keep available even after finalization.

### Using the YAML property
```yaml
---
z2k_template_default_fallback_handling: finalize-clear
---
```
All fields in this template without explicit fallback values or directives will be cleared on finalization.

### Combining approaches
You can set a template-wide default via YAML and override it for specific fields:
```yaml
---
z2k_template_default_fallback_handling: finalize-clear
---
```

```md
{{fieldInfo importantNote directives="finalize-preserve"}}
{{fieldInfo status fallback="Pending"}}
```
Here, most unresolved fields are cleared – but `importantNote` is preserved, and `status` gets its explicit fallback value.

## Connection to Prompt Touching
Fallback behavior only applies to **untouched** fields. If a user [[Prompt Touching|touches]] a field (even to leave it empty), the entered value is written as-is. Fallback resolution is strictly for fields the user never interacted with.

See [[Prompt Touching]] for details on how the system distinguishes "deliberately empty" from "not yet addressed."

## See Also
- [[Prompt Touching]] – How touching determines whether fallback applies
- [[fieldInfo fallback|fallback Parameter]] – Setting per-field fallback values
- [[fieldInfo directives|directives Parameter]] – The `finalize-suggest`, `finalize-clear`, and `finalize-preserve` directives
- [[YAML Configuration Properties]] – Template-wide fallback settings
- [[Deferred Field Resolution]] – The broader concept of iterative field resolution

> [!DANGER] INTERNAL NOTES
> - Submit handling at `src/main.tsx` ~line 4249: untouched fields during finalization use `resolvedFallback` value, but skip `finalize-preserve` fields to let preservation logic handle them.
