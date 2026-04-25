---
sidebar_position: 35
doc_state: initial_ai_draft
title: fieldInfo Lifecycle
sidebar_label: fieldInfo Lifecycle
aliases:
- fieldInfo lifecycle
- fieldInfo Lifecycle
- field info lifecycle
- field info evaluation
- field info clearing
---
# fieldInfo Lifecycle
A `{{fieldInfo}}` declaration, its companion `{{fieldOutput}}`, and any `{{var}}` references that point at the same field all evolve through two distinct rendering phases – **pre-finalization** and **finalization**. What stays in the file, what gets replaced with a value, and what gets cleared depends on which phase you are in and on the field's current state.

This page is the single reference for that behavior. Other pages describe individual pieces – [[fieldInfo Output]] covers the silent-helper output of `{{fieldInfo}}`, [[fieldInfo value]] covers how computed values resolve, [[Fallback Behavior]] covers what an unresolved `{{var}}` becomes – but the cross-cutting rules live here.

## Contents
- [[#The Two Phases]]
- [[#Field State]]
- [[#Pre-finalization]]
- [[#Finalization]]
- [[#Resolution Precedence]]

## The Two Phases
Every render of a Z2K Templates file happens in one of two phases:

- **Pre-finalization** – The render passes during [[Instantiation|instantiation]] and any [[Continue Filling File|continue-filling]] passes through the [[WIP Stage]]. The file is still a work in progress, and the next pass needs to find all the field metadata intact. So nothing is destroyed – `{{fieldInfo}}`, `{{fieldOutput}}`, and any unresolved `{{var}}` references are all preserved as-is.
- **Finalization** – The render that commits the file to its final form. Now the helpers are stripped, fallbacks are applied, and `{{var}}` references resolve to literal text. The only escape hatch is the [[fieldInfo directives#finalize-preserve|finalize-preserve]] directive, which keeps an unresolved field's helpers and references alive past finalization.

The phase is not a setting on the file – it is determined by which command is running. [[Create New File]] and [[Continue Filling File]] both start pre-finalization; [[Finalize File]] runs finalization.

## Field State
Within a single phase, behavior also depends on which of three states the field is in:

- **Has data** – The field has been resolved, either through user prompting, an external override (a [[URI Actions|URI parameter]] or [[JSON Packages|JSON Package]]), or a YAML frontmatter value.
- **Has `value=` (no data)** – The field has no resolved data, but a [[fieldInfo value|value=]] expression is declared. The expression is evaluated against the current context.
- **Neither** – The field has no data and no `value=` declaration. It is fully unresolved.

The tables below cross-reference these three states with the two phases.

## Pre-finalization
During pre-finalization, the helpers always stay – the file is not yet committed and the next render needs them. Only the `{{var}}` reference visibly changes based on the field state.

| Field state                | `{{fi}}` / `{{fieldInfo}}` | `{{fo}}` / `{{fieldOutput}}` | `{{var}}` reference  |
| -------------------------- | -------------------------- | ---------------------------- | -------------------- |
| Has data                   | stays                      | renders as the data value    | renders as the data value |
| Has `value=` (no data)     | stays                      | renders as the resolved `value=` | renders as the resolved `value=` |
| Neither                    | stays                      | stays as `{{fo var}}`        | stays as `{{var}}`   |

Two practical consequences:

- **`{{fieldInfo}}` is always preserved across non-final renders.** This is what makes [[Continue Filling File|Continue Filling]] work – the directives, prompts, fallbacks, and `value=` expressions are all still there for the next pass.
- **An unresolved `{{var}}` survives every non-final render** until either the user supplies a value, a `value=` resolves, or finalization runs.

## Finalization
At finalization, the plugin commits the file. `{{fieldInfo}}` is removed, `{{fieldOutput}}` outputs whatever the field resolves to, and `{{var}}` references are replaced with their resolved value. The exception is `finalize-preserve`, which keeps an unresolved field's helpers and reference alive in the final file.

| Field state                          | `{{fi}}` / `{{fieldInfo}}` | `{{fo}}` / `{{fieldOutput}}`      | `{{var}}` reference          |
| ------------------------------------ | -------------------------- | --------------------------------- | ---------------------------- |
| Has data                             | removed                    | outputs the data value            | replaced with the data value |
| Has `value=` (no data)               | removed                    | outputs the resolved `value=`     | replaced with the resolved `value=` |
| Neither, no `finalize-preserve`      | removed                    | outputs the [[Fallback Behavior\|fallback]] result (typically empty) | replaced per [[Fallback Behavior\|fallback]] (typically empty) |
| Neither, with `finalize-preserve`    | stays                      | stays as `{{fo var}}`             | stays as `{{var}}`           |

The last row is the only way `{{fieldInfo}}` survives finalization. See [[fieldInfo directives#finalize-preserve|finalize-preserve]] for when this is useful, and [[Fallback Behavior]] for the full precedence rules that decide what an unresolved field becomes when finalize-preserve is not in play.

## Resolution Precedence
For any phase, a `{{var}}` reference resolves in this order:

1. **Data** – User input, [[URI Actions|URI parameters]], [[JSON Packages|JSON Package]] data, or YAML frontmatter values
2. **`value=`** – A [[fieldInfo value|value=]] expression declared in the highest-priority source (main template > block template > system block > global block)
3. **Unresolved** – Falls back to the rules in the tables above

External data overrides a `value=` declaration even when both are present – see [[fieldInfo value#Resolution Priority]] for the full chain. At finalization, an unresolved field then runs through the [[Fallback Behavior]] precedence to determine its final substitution.

## See Also
- [[fieldInfo Output]] – Silent-helper output and whitespace handling for `{{fieldInfo}}`
- [[fieldInfo value]] – How `value=` expressions are evaluated and prioritized
- [[fieldInfo directives|fieldInfo directives Parameter]] – `finalize-clear`, `finalize-preserve`, `finalize-suggest`
- [[Fallback Behavior]] – What an unresolved `{{var}}` becomes at finalization
- [[Lifecycle of a Template]] – The broader file-level lifecycle (Template → WIP → Finalized)

> [!DANGER] INTERNAL NOTES
> - Notes:
>   - The user-facing tables above abstract over the engine's actual mechanism. The engine has a single rule – `preserveExpressionsPreprocess` preserves any expression whose top-level variable is undefined in context, on every render – plus an extra rule that always preserves `fi`/`fieldInfo` declarations and Handlebars comments when `!finalize`. There is no `finalize-preserve` exception in `removeFieldInfosAndComments`. `finalize-preserve` works by causing `handleSubmit`/main.tsx to skip applying the resolved fallback for the field, leaving the var unresolved – which then triggers undefined-var preservation at render time. Net result matches the user-facing tables.
>   - `{{fo}}` / `{{fieldOutput}}` is never explicitly stripped – it is a regular Handlebars helper that returns the field's value. When the field is undefined, the entire `{{fo var}}` expression is preserved by the undefined-var rule, so the literal syntax survives. When the field is resolved, the helper renders normally.
>   - The "stays" cells in the tables are shorthand. When an expression is preserved at finalization, the engine retains the *complete* original syntax including every parameter. For example, `{{fo foPreserve directives="finalize-preserve"}}` survives literally with the directives string intact – not as a stripped-down `{{fo var}}`. The shorthand was chosen to keep the tables scannable; if a future reader expects the literal output, they should consult `Tests\fieldInfo\directives\finalize-preserve-comprehensive\expected.md`.
>   - Source references: [`src/template-engine/main.ts`](../../../src/template-engine/main.ts) `renderTemplate` (entry point), `preserveExpressionsPreprocess` (preservation rule), `removeFieldInfosAndComments` (fi stripping at finalize); [`src/modals/field-collection.tsx`](../../../src/modals/field-collection.tsx) `handleSubmit` (skips fallback for `finalize-preserve`); [`src/main.tsx`](../../../src/main.tsx) `applyFinalFieldStates` (mirror of handleSubmit logic – kept in sync per source comments).
> - Known GitHub Issues:
>   - GH Issue #87 – This page resolves the documentation request from that issue.
> - Verification status:
>   - Finalization table (4 rows) – static-verified against the test fixture `Tests\fieldInfo\directives\finalize-preserve-comprehensive\expected.md`. All 16 case rows match the table behavior.
>   - Pre-finalization table (3 rows) – not yet verified by an existing test fixture. No `finalize: false` companion test exists for this scenario.
> - Action Items:
>   - #AR/User: Once GWP reviews, decide whether the engine-level mechanism note belongs in a separate "How fieldInfo is implemented" appendix page rather than buried in DANGER. The current placement keeps user-facing docs clean but means the mechanism note disappears from the published docs.
> - Testing Items:
>   - #TEST/User: Re-run `Tests\fieldInfo\directives\finalize-preserve-comprehensive\` in Obsidian to confirm the static fixture still matches engine output (requires running plugin – AI cannot execute).
>   - #TEST/AI: Add a companion `Tests\fieldInfo\directives\finalize-preserve-pre-finalization\` (same template, `finalize: false`) so the pre-finalization table has a fixture too.
