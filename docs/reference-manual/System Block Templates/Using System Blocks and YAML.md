---
sidebar_position: 20
aliases:
- System Blocks and YAML
- Z2K System Blocks and YAML
- Z2K System Block Templates and YAML
---


# Sample YAML for System Block files

## Basic 
Assume you have a file in your root folder of your vault that reads:
```yaml
# My Beautiful Vault
card_author : "Mark Twain"
```

Then every card created in your vault will have a the above yaml code inserted into it.

## With Prompted Fields 
You can amend the above example with a field that has a default value, but is shown to the user through a prompt
```yaml
# My Beautiful Vault
card_author : "{{CardAuthor|text|Who is the Author of this card?|My Name|My Name}}"
```

Then every card created in your vault will have a the above yaml code inserted into it.




