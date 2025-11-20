---
sidebar_position: 10
doc_state: initial_ai_draft
title: field-info Cheat Sheet
sidebar_label: field-info Cheat Sheet
aliases:
- field-info helper function
---
## field-info Cheat Sheet
The `{{field-info}}` built-In helper function is a powerful tool for controlling how a `{{fieldName}}` is prompted for and handled by the plugin. There is a lot behind this workhorse of a helper. To help you get a one-page overview, here is a quick cheat sheet on its core functions.

## Syntax
The [[field-info Syntax|Syntax]] of `{{field-info}}` supports both positional and named parameters:
- **Positional Parameters**: 
  - `{{field-info` [[field-info fieldName|fieldName]] [[field-info prompt|prompt]] [[field-info default|default]] [[field-info type|type]]`}}`
- **Named Parameters**: 
  - `{{field-info fieldName=`*[[field-info fieldName|fieldName]]*` prompt=`*[[field-info prompt|prompt]]*` default=`*[[field-info default|default]]*` type=`*[[field-info type|type]]*` opts=`*[[field-info opts|opts]]*` miss=`*[[field-info miss|miss]]*` directives=`*[[field-info directives|directives]]`}}`

## Parameters
![[field-info Parameters#Overview]]

## Directives
![[field-info directives#Overview]]