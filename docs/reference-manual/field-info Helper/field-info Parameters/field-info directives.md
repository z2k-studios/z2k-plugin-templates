---
sidebar_position: 60
doc_state: initial_ai_draft
title: field-info directives Parameter
sidebar_label: directives
aliases:
- directives
- field-info directives Parameter
---

# Overview
The [[field-info directives|directives]] parameter allows some fine tuning of prompting-interfaces:
- **[[field-info directives#no-prompt|no-prompt]]** :: Directs the [[Prompting Interface]] to skip prompting the user for a field
- **[[field-info directives#required|required]]** :: Tells the [[Prompting Interface]] that a field requires a value in order to ==finalize== the card
- **[[field-info directives#miss-preserve|miss-preserve]]** :: Instructs the plugin to preserve the `{{field}}` entry in the final generated file if the user does not specify a value
- **[[field-info directives#miss-clear|miss-clear]]** :: Directs the plugin to clear out the value of this field if no value is provided.



# Fill In
### `directives`
  A comma‑separated list of prompting directives (engine‑level controls). Examples include `no-prompt` (documented below). Others are enumerated by the engine; unknown entries are rejected.    See the [[#Directives]] section below. ==needs cleaning up!==




