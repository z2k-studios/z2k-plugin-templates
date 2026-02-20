---
sidebar_position: 1
doc_state: initial_ai_draft
sidebar_folder_position: 83
sidebar_label: Helpers for Prompting
---
# Built-in Prompting Helpers

The [[Prompting Interface|default prompting interface]] works great out of the box, but sometimes you may want to more tightly control how the prompt works or appears. You can do just that with the built-in prompting helper functions:

```md
{{fieldInfo CharacterName prompt="Which character do you want to document?" suggest="Sherlock Holmes"}}
{{fieldInfo CharacterType prompt="What type of character is {{CharacterName}}?"  type="multiselect:Protagonist,Antagonist,Supporting}}
```
## Field Information Helper Functions
![[fieldInfo Variations#fieldInfo Variations]]

## Why the Variations? 
![[fieldInfo Variations#Why the Variations?]]
