---
sidebar_position: 10
doc_state: initial_ai_draft
title: field-output Helper
sidebar_label: field-output
aliases:
- field-output Helper Function
- field-output
---

describes that field-output is identical to field-info except that it outputs the value of the field


## Syntax and Semantics

A forthcoming built‑in that mirrors `{{field-info}}`’s argument structure but **emits** the field’s resolved value at render time. This is useful when you want to both declare prompting metadata and later place the finalized value inline without repeating logic. For example, you might specify `{{field-info title "text" "Give this a short name"}}` near the top of a template, then use `{{field-output title}}` in the body to render the chosen title exactly as resolved.

## Parameters
The parameters of `{{field-output}}` are identical to that of `{{[[prompt_info]]}}`:

![[field-info#Parameters]]
