Z2K Fields can not only be used to enter data into a card's body text, they can also be used to fill out YAML fields. 

# Examples
The following examples step through potential usages of Z2K Template Fields inside your vault's cards. 
## Basic Built-ins
```yaml
card-creation-date: "{{today}}"
```
## Basic User Field
Assume you have a file in your root folder of your vault that reads:
```yaml
# My Beautiful Vault
card_summary : "{{SummaryText}}"
```

In this instance, the template plugin will add the summary text to the list of fields to prompt the user for while creating the card. 

## With Prompted Fields 
You can amend the above example with a field that has a default value, but is shown to the user through a prompt
```yaml
# My Beautiful Vault
card_author : "{{@required CardAuthor|text|Who is the Author of this card?|My Name|My Name}}"
```

Then every card created in your vault will have a the above yaml code inserted into it.



# Limitations

## Limited to YAML String Data Types
If you use a Z2K Template Field for a yaml entry, please note that the YAML field should always be considered text - even if the YAML field represents a numeric value. This is because the Z2K Template Field itself must be stored as text before it is filled in, and this will potentially cause a collision in the type of data associated with that yaml field.

Therefore, it is always best practice to force the use of a string format with `""` around the field data entry.
