---
sidebar_position: 96
---

# Linking Helper Functions

| Helper Function Name | Purpose                                                                                                  | Parameters (beyond the field name) |
| -------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `wikilink`           | Formats a field as if it were a wikilink (see [[#wikilink Helper]] below)                                | *(none)*                           |
| `wikilink-named`     | Formats a field as if it were a wikilink with an alternative name (see [[#wikilink-named Helper]] below) | `name`                             |
| `url`                | Formats a field as if it were a URL (see [[#url Helper]] below)                                          | *(none)*                           |
| `url-named`          | Formats a field as if it were a wikilink with an alternative name (see [[#url-named Helper]] below)      | `name`                             |
| `google`             | Generates a link to a google search using a field name                                                   | `searchString`                     |
| `chatGPT`            | Generates a link to a chatGPT chat using the field value and a prompt string                             | `chat preface`                     |


# Linking Helper Functions

## wikilink Helper
The `wikilink` Helper function is a very frequently used helper function to format a piece of text as a wikilink.

The format for the helper function is:
```
{{wikilink fieldname}}
```

where:
	- `wikilink` is the predefined name used for converting fields to wikilinks
	- `fieldname` is the name of the field that will receive be outputted as a wikilink


## wikilink-named Helper

This is for `[[foo|bar]]` 


## url Helper

## url-named Helper


## geocontext-basic Helper


