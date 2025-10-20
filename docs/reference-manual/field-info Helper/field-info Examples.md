---
sidebar_position: 60
doc_state: initial_ai_draft
title: field-info Examples
sidebar_label: field-info Examples
---
# field-info Examples


## 1) Simple — Title with default, required

```md
---
sidebar_position: 10
---

# New Note

{{field-info title "text" "Short title" "Untitled" "preserve" "required"}}

# {{title}}
```

**Behavior**: A single input for `title` appears with a hint “Short title”; default is “Untitled.” Finalization requires non‑empty input. If user leaves it blank and miss is `preserve`, the token remains or the default is applied per your miss policy.

## 2) Moderate — Selects, hidden metadata, and skip prompt for computed fields

```md
{{field-info date      "date"  "When did this happen?" ""       "clear"    "no-prompt"}}
{{field-info category  "singleSelect:Personal,Work,Other" "Choose a category"}}
{{field-info tags      "multiSelect:Idea,Todo,Refactor"   "Apply tags (multi)"}}
{{field-info guid      "text" "Internal id (usually auto)" "" "clear" "hidden,auto"}}
```

**Behavior**: `date` is auto‑set and not prompted. `category` and `tags` render as select inputs. `guid` prefers an injected value (or a generator) and stays out of the main dialog.

## 3) Advanced — Hybrid overrides, field reuse, and structured output

```md
{{! High‑level defaults }}
{{field-info priority "singleSelect:High,Medium,Low" "Pick a priority" "Medium"}}
{{field-info owner    "text" "Who owns this?" "" "clear"}}

{{! Partial provides a stricter policy; named args override where necessary }}
{{field-info owner prompt="Assignee" directives="required"}}
{{field-info sprint "text" "Sprint label (e.g., 2025‑10‑S1)" "" "preserve" "auto"}}

## Ticket
- Title: {{title}}
- Owner: {{owner}}
- Priority: {{priority}}
- Sprint: {{sprint}}
```

