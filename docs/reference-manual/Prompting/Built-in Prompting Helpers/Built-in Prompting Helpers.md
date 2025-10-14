---
sidebar_position: 1
doc_state: initial_ai_draft
sidebar_folder_position: 83
---
# Built-in Prompting Helpers

The [[Prompting Interface|default prompting interface]] works great out of the box, but sometimes you may want to more tightly control how the prompt works or appears. You can do just that with the built-in prompting helper functions:

```md
{{prompt-info CharacterName prompt="Which character do you want to document?" default="Sherlock Holmes"}}
{{prompt-info CharacterType prompt="What type of character is {{CharacterName}}?"  type="multiselect:Protagonist,Antagonist,Supporting}}
```

# Prompting Options
There are two variations of prompting helpers:
- `{{prompt-info}}` - A silent helper function that does not output anything in the final file
- `{{prompt-value}}` - Works just like `{{prompt-info}}`, except that it outputs the value of the field when the data becomes available.

# Why the two variations? 
- Sometimes you just need to add some quick prompt information to a field inside your template, but you do not want to disrupt the flow of the document. Use a `{{prompt-value}}` helper. 
- Sometimes you want to fine-tune the prompting interface with a number of options for a number of fields. This can make the template become messy as you embed the prompting information. Use `{{prompt-info}}` here to group all of the prompting information together at the beginning of a section or file. When the final file is created, these silent `{{prompt-info}}` helpers will simply disappear.

