---
sidebar_position: 10
doc_state: initial_ai_draft
title: fieldInfo Cheat Sheet
sidebar_label: fieldInfo Cheat Sheet
aliases:
- fieldInfo helper function
---
## fieldInfo Cheat Sheet
The `{{fieldInfo}}` built-In helper function is a powerful tool for controlling how a `{{fieldName}}` is prompted for and handled by the plugin. There is a lot behind this workhorse of a helper. To help you get a one-page overview, here is a quick cheat sheet on its core functions.

## Syntax
The [[fieldInfo Syntax|Syntax]] of `{{fieldInfo}}` supports both positional and named parameters:
- **Positional Parameters**:
  - `{{fieldInfo` [[fieldInfo fieldName|fieldName]] [[fieldInfo prompt|prompt]] [[fieldInfo suggest|suggest]] [[fieldInfo type|type]]`}}`
- **Named Parameters**:
  - `{{fieldInfo fieldName=`*[[fieldInfo fieldName|fieldName]]*` prompt=`*[[fieldInfo prompt|prompt]]*` suggest=`*[[fieldInfo suggest|suggest]]*` type=`*[[fieldInfo type|type]]*` opts=`*[[fieldInfo opts|opts]]*` fallback=`*[[fieldInfo fallback|fallback]]*` directives=`*[[fieldInfo directives|directives]]`}}`

## Parameters
![[fieldInfo Parameters#Overview]]

## Directives
![[fieldInfo directives#Overview]]