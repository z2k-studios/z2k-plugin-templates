---
sidebar_position: 10
doc_state: initial_ai_draft
title: field-info Cheat Sheet
sidebar_label: field-info Cheat Sheet
aliases:
- field-info helper function
---
## {{field-info}} Cheat Sheet
There is a lot behind this tiny look workhorse of a helper. Sometimes you just need a quick cheat sheet on its core functions. Here you go:

## Syntax
The [[field-info Syntax|Syntax]] supports both positional and named parameters:
- **Positional Parameters**: 
  - `{{field-info FieldName `[[field-info type|type]] [[field-info prompt|prompt]] [[field-info default|default]] [[field-info miss|miss]] [[field-info directives|directives]]`}}`
- **Named Parameters**: 
  - `{{field-info FieldName type=`*[[field-info type|type]]*` prompt=`*[[field-info prompt|prompt]]*` default=`*[[field-info default|default]]*` miss=`*[[field-info miss|miss]]*` directives=`*[[field-info directives|directives]]`}}`

## Parameters
![[field-info Parameters#Overview]]

## Directives
![[field-info directives#Overview]]