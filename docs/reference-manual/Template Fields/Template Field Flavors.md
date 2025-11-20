---
sidebar_position: 20
---
# Template Field Flavors
There are two flavors of [[Template Fields Overview|Template Fields]]:

1. [[#Template Field Type User Specified Fields|User Specified Fields]]
2. [[#Template Field Type Built-In Fields|Built-In Fields]]

## User Specified Fields
These are the most basic form of field information - they represent a single piece of data with a field name that are then presented to the user to optionally fill out. These field are customized "placeholders" for data that will be replaced when the user provides the data for the new file. 

For example, a Template card might read:

```md title="Book Template.md"
- Title:: {{BookTitle}}
- Author:: {{Author}}
```

In this instance, `{{BookTitle}}` and `{{Author}}` are user specified fields, because the user provides the actual book title for the card during card creation from a template.

## Built-In Fields
In addition to user specified fields, Z2K also includes a number of [[Built-In Fields|built-in fields]] that will be filled in by the system **automatically** during card creation (e.g. daily card creation, new card action). 

For instance, the fields `{{date}}` and `{{today}}` will automatically insert the current date into its location in the template card's content when a card is created using that template card. See [[Built-In Fields|Built-In Template Fields]] below for a list of all known built-in fields.


```md title="Log Template.md"
- Date :: {{date}}
- Daily Notes :: {{wikilink today}}
```







