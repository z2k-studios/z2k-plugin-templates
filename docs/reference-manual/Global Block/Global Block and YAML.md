---
sidebar_position: 40
aliases:
  - Global Block and YAML
---
# The Global Block and YAML
YAML frontmatter in the global block is merged into every file's frontmatter before rendering. This gives you a way to inject default metadata properties – status fields, author tags, workflow state – into every new file without embedding them in each template individually.

## Injecting Global YAML Properties
Any YAML frontmatter block in the global block is merged into the template's own frontmatter. For example, to give every new file a default `fileStatus` of `Draft`:

```handlebars
---
fileStatus: Draft
---
```

Every file created from any template will include `fileStatus: Draft` in its frontmatter unless the template overrides it with its own `fileStatus` value.

## Merge Behavior
The Global Block should follow the same guidelines mentioned in [[Z2K Templates and YAML]]. See also the discussion on [[Merging Multiple YAML Sources]].

The merge uses a **last-wins** strategy at the top level:
- If the global block and the template both define the same key, the template's value wins
- If only the global block defines a key, it is carried through to the output
- If only the template defines a key, it is unaffected

This means global YAML properties are true defaults — they're present unless explicitly overridden.

> [!NOTE] Top-Level Merge Only
> YAML merging is top-level only. If both the global block and a template contain a nested object under the same key (e.g., `metadata:`), the entire `metadata` object from the later source replaces the earlier one — nested keys are not merged. See [[YAML and Block Templates]] for more detail.


## Example - Global YAML Fields
To inject a `fileStatus` property defaulting to `Draft` into every new file:

```handlebars
---
fileStatus: Draft
---
```

Every file created from any template will include `fileStatus: Draft` in its frontmatter unless the template overrides it with its own `fileStatus` value.

> [!DANGER] INTERNAL NOTES
> - YAML merge behavior (last-wins, top-level only) was confirmed from engine source analysis. Deep merge is not supported.