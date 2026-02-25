---
sidebar_position: 1
sidebar_folder_position: 100
---
# Prompting
When you use a template to [[Instantiation|instantiate]] a new content file (and when later continuing to fill in [[Deferred Field Resolution|deferred fields]] during the [[WIP Stage]]), any fields that cannot be be resolved will be prompted for using an interactive [[Prompting Interface]]. This section steps through how this prompting interface works and how it can be customized. 

## Contents
For more details, see:
1. [[Prompting Interface]] – The modal dialog where you fill in field values
2. [[Prompting Interface per Type]] – What each field type looks like in the prompting modal
3. [[Prompting Defaults]] – What happens when no `{{field-info}}` is specified
4. [[Prompt Touching]] – How field interaction determines what values are committed
5. [[Fallback Behavior]] – What happens to untouched fields during finalization
6. [[Built-in Helpers for Prompting]] – How `{{field-info}}` parameters control the prompting interface

## See Also
- [[Lifecycle of a Template]]
- [[fieldInfo Helper]]
