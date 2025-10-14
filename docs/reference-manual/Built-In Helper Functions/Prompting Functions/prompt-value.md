---
sidebar_position: 85
doc_state: initial_ai_draft
---
## `{{prompt-value}}`

## Syntax and Semantics

A forthcoming built‑in that mirrors `{{prompt-info}}`’s argument structure but **emits** the field’s resolved value at render time. This is useful when you want to both declare prompting metadata and later place the finalized value inline without repeating logic. For example, you might specify `{{prompt-info title "text" "Give this a short name"}}` near the top of a template, then use `{{prompt-value title}}` in the body to render the chosen title exactly as resolved.

## Parameters
The parameters of `{{prompt-value}}` are identical to that of `{{[[prompt_info]]}}`:

![[prompt-info#Parameters]]

### Forms

1. **Positional (preferred for brevity)**
   ```md
   {{prompt-info title "text" "Short title for this note" "Untitled" "preserve" "required"}}
   ```

2. **Named (explicit and order‑independent)**
   ```md
   {{prompt-info varName=title type="text" prompt="Short title for this note" default="Untitled" miss="preserve" directives="required"}}
   ```

3. **Hybrid (named overrides positional)**
   ```md
   {{prompt-info title "text" "Title…" "Untitled" miss="clear" directives="required,no-prompt"}}
   ```

## Merging and Overrides

- Multiple `{{prompt-info}}` entries for the **same `varName`** are **merged**; later declarations override earlier ones.
- Prompt‑info found inside partials is merged into the caller; in case of conflict, **earlier (outer) declarations win** unless explicitly overridden at the call site.
- Any **standalone `{{varName}}` usage** without prior prompt‑info causes the engine to **auto‑register a default prompt-info entry** for that field so it can be collected during prompting.

## Directives

![[prompt-info#Directives]]

## Examples

