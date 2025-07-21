# Overview
Template Fields are used inside [[Z2K Templates]] as embedded placeholders for information that is to be added into the template. Template fields are denoted using curly braces, e.g. `{{field}}` where `field` is the name of some unit of information to be filled either by a user or some external program.

# Why use Templates and Template Fields
The use of templates and template fields will result in a far more uniform and consistent documentation for the cards in your vault. Making your cards be more consistent in formatting serves several purposes:
1. They quicken your ability to consume the content of a card because you will not visually need to re-learn how a card is organized with every card.
2. They improve the ability for AI engines, if you use them, to pull content out of the card to help generate an AI agent.
3. Consistency also enables search and replace scripts to find and update formatting and details as your digital self evolves.
4. Consistency also enables advanced data tools such as the Obsidian Dataview plugin to access well-formed data across multiple cards.

# Basic Structure of a Template Field
These placeholders are designated through the use of curly braces (aka handlebars), such as `{{fieldname}}`. The fieldname will specify the name of the field (i.e. a word description of the the type of information to be provided). 

For instance, consider an information card template to be used to collect quotes and ideas from a book. In the Overview section of the card template, you can imagine a section that includes:

```
- Title:: {{BookTitle}}
- Author:: {{Author}}
```

With these fields specified, Z2K will prompt the user for these fields when creating a new card with this template. These will then be filled in the new card with the data provided by the user, replacing the field name (e.g. "{{BookTitle}}") with the actual Book Title provided by the user. 

