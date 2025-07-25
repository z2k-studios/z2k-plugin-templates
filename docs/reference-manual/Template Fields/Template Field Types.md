---
sidebar_position: 22
---

There are a number of [[reference-manual|Template Field]] types available to the user to include in their [[Docs/z2k-system-docs/4 - Z2K Reference Docs/4h - Z2K Templates/Z2K Templates]] cards. They are:

1. [[#Template Field Type User Specified Fields|User Specified Fields]]
2. [[#Template Field Type Built-In Fields|Built-In Fields]]

# Template Field Type: User Specified Fields
These are the most basic form of field information - they represent a single piece of data with a field name that are then presented to the user to optionally fill out. 

For example, a Template card might read:

```
- Title:: {{BookTitle}}
- Author:: {{Author}}
```

In this instance, `{{BookTitle}}` and `{{Author}}` are user specified fields, because the user provides the actual book title for the card during card creation from a template.

# Template Field Type: Built-In Fields
In addition to user specified fields, Z2K also includes a number of [[Built-In Template Fields|built-in fields]] that will be filled in by the system automatically during card creation (e.g. daily card creation, new card action). 

For instance, the field `{{today}}` will automatically insert the current date into its location in the template card's content when a card is created using that template card. See [[Built-In Template Fields|Built-In Template Fields]] below for a list of all known built-in fields.






