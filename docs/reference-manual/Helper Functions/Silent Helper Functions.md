---
sidebar_position: 40
z2k_validation_ok: 5
aliases:
- Silent Helper Function
- silent helper
- silent helpers
---
# Silent Helper Functions
A **silent helper** is a helper function or expression that executes during template processing but produces no visible output in the rendered result. Silent helpers are used to attach metadata, leave author notes, or emit debug information – none of which should appear in the final content file.

## Contents
- [[#The Silent Helpers]]
- [[#Line Removal Behavior]]
- [[#What Counts as "Alone on a Line"]]
- [[#Edge Cases]]
- [[#Example]]

## The Silent Helpers
Z2K Templates has two silent helpers:

| Expression | Type | Purpose |
|------------|------|---------|
| `{{fieldInfo FieldName ...}}` / `{{fi ...}}` | Z2K helper | Declares metadata about a field (type, prompt, fallback, etc.). See [[fieldInfo Helper]]. |
| `{{! comment }}` / `{{!-- comment --}}` | Handlebars comment | Author notes that are stripped at finalization. See [[Template Comments]]. |

## Line Removal Behavior
Standard Handlebars removes a silent expression but leaves the line intact, which produces a stray blank line. Z2K Templates goes one step further: when a silent helper is the **only content on its line**, Z2K removes the expression and its trailing newline together, so the line disappears entirely.

The condition is precise:
- The character immediately before the expression must be a newline (`\n`) – no leading spaces or tabs
- The character immediately after the closing `}}` must be a newline – nothing else on the line

When both conditions are met, the expression and its trailing `\n` are removed. The newline belonging to the line above is not touched.

Given this template:

```handlebars
# {{ProjectName}}
{{fieldInfo ProjectName "Name of the project?" type="text"}}
## Overview
```

After finalization:

```md
# My Project
## Overview
```

The `{{fieldInfo}}` line vanishes completely – no blank line left behind.

## What Counts as "Alone on a Line"
The check is character-exact. A few scenarios that may surprise you:

**Leading whitespace breaks the condition.** If the expression is indented – even by a single space – the character before `{{` is a space, not `\n`. The expression is removed but the whitespace remains, leaving a blank-looking line:

```handlebars
  {{fieldInfo Title type="text"}}
```

After removal: a line containing just two spaces. This is rarely visible but technically present. Avoid indenting silent helpers.

**Trailing content on the same line breaks the condition.** If anything follows the closing `}}` before the newline, only the expression is removed:

```handlebars
{{fieldInfo Title type="text"}} %% note %%
```

After removal: ` %% note %%` remains on the line.

**Multiple blank lines are not collapsed.** If there are extra blank lines above or below, only the single trailing `\n` of the expression line is consumed. The surrounding blank lines stay:

```handlebars
text

{{fieldInfo Title type="text"}}

more text
```

After removal:

```md
text


more text
```

One blank line remains above, one below — exactly as written, minus the `{{fieldInfo}}` line. Because those two blank lines are now adjacent, the output has two consecutive blank lines.

**Start of file.** If the expression is at the very beginning of the content (no preceding character), the leading-newline condition fails. The expression is removed but its trailing `\n` is kept.

## Edge Cases

| Scenario | Result |
|----------|--------|
| Solo on its own line, flush to left margin | Expression + trailing `\n` removed — line disappears |
| Leading whitespace before `{{` | Expression removed, whitespace line remains |
| Text or content after `}}` on same line | Expression removed, remaining content stays |
| Text or content before `{{` on same line | Expression removed, preceding content stays |
| Blank lines above or below | Only the expression's own trailing `\n` consumed — blank lines unaffected |
| First line of file (no preceding `\n`) | Expression removed, trailing `\n` kept |

## Example
A template with multiple silent helpers on their own lines:

```handlebars
---
{{fieldInfo BookTitle "Title of the book?" type="text" directives="required"}}
{{fieldInfo Author "Author name?" type="text"}}
{{fieldInfo Genre "Genre?" type="singleSelect" opts="Fiction, Non-Fiction, Reference"}}
{{! This section is for reading notes — the header is intentional }}
# {{BookTitle}}
**Author:** {{Author}}
**Genre:** {{Genre}}

## Notes
```

After finalization (all fields resolved, all silent helpers stripped):

```md
---
# Dune
**Author:** Frank Herbert
**Genre:** Fiction

## Notes
```

All three `{{fieldInfo}}` lines and the comment line disappear. The blank line between the silent declarations and the `#` header is the one blank line that was already there – it is preserved as-is.

> [!DANGER] INTERNAL NOTES
> - Notes:
>   - The line removal logic lives in `removeFieldInfosAndComments()` in `z2k-template-engine/src/main.ts` around line 1311. Both `fieldInfo`/`fi` MustacheStatements and CommentStatements are collected into the same `replacements` array; the newline check (`result[start - 1] === '\n'` and `result[end] === '\n'`) is then applied identically to all of them.
>   - `{{fieldOutput}}` / `{{fo}}` is explicitly excluded from this removal pass (see code comment at line 1314: "No need to remove fieldOutput/fo expressions, as they output the value directly").
>   - `charStart` is derived from `loc.start.column` (the column of `{{`), so `result[charStart - 1]` reflects the character immediately before the opening braces — a leading space breaks the condition exactly as documented.
> - Testing Items:
>   - #TEST: Verify the leading-whitespace edge case — confirm that `  {{fieldInfo ...}}` leaves a whitespace-only line after removal.
>   - #TEST: Verify behavior when a silent helper is the very first line of a template body (no preceding `\n`).
