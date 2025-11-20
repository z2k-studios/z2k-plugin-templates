---
sidebar_folder_position: 20
sidebar_position: 1
---
# Formatting Helper Functions

## Overview
The Z2K Templates plugin has a wide variety of helper functions to assist with formatting data into different styles. This includes:
- [[#Date Formatting Helpers]]
- [[#Number Formatting Helpers]]
- [[#String Formatting Helpers]]

Please see below for a complete list of built-in formatting helper functions.


## Date Formatting Helpers

| Link            | Helper Function Name | Purpose                                       |
| --------------- | -------------------- | --------------------------------------------- |
| [[format-date]] | `{{format-date}}`    | Formats a date with a moment.js format string |

## Number Formatting Helpers

| Link                       | Helper Function Name         | Purpose                                              |
| -------------------------- | ---------------------------- | ---------------------------------------------------- |
| [[format-number]]          | `{{format-number}}`          | Formats a number with a format string                |
| [[format-number-to-fixed]] | `{{format-number-to-fixed}}` | Formats a number to a fixed number of decimal places |


## String Formatting Helpers

| Link                            | Helper Function Name              | Purpose                                                                                                                                                            |
| ------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [[format-string]]               | `{{format-string}}`               | Formats a string with additional text                                                                                                                              |
| [[format-string-to-upper]]      | `{{format-string-to-upper}}`      | Formats a string into all caps                                                                                                                                     |
| [[format-string-to-lower]]      | `{{format-string-to-lower}}`      | Formats a string into all lowercase                                                                                                                                |
| [[format-string-slugify]]       | `{{format-string-slugify}}`       | Formats a string into URL friendly text string for slugs                                                                                                           |
| [[format-string-encode-URI]]    | `{{format-string-encode-URI}}`    | Formats a string into a URI friendly text string                                                                                                                   |
| [[format-string-encode-base64]] | `{{format-string-encode-base64}}` | Formats a string into Base 64 encoding                                                                                                                             |
| [[format-string-spacify]]       | `{{format-string-spacify}}`       | Converts a string collapsed of Spaces into a name with spaces.                                                                                                     |
| [[format-string-commafy]]       | `{{format-string-commafy}}`       | Takes a multiselect list and renders the active elements into a string with the elements separated by commas (is this the default rendering, and thus not needed?) |
| [[format-string-trim]]          | `{{format-string-trim}}`          | Removes all preceding and trailing whitespace from a field                                                                                                         |
| [[format-string-raw]]           | `{{format-string-raw}}`           | Prevents any escaping of characters in the final output (default mode for text replacement is to escape markdown relevant characters)                              |
| [[format-string-bulletize]]     | `{{format-string-bulletize}}`     | Formats the source data (which may be multilined) into a bulleted list using dashes                                                                                |
| [[format-string-file-friendly]] | `{{format-string-file-friendly}}` | Takes a string and makes a file friendly version of the string (e.g. removes wild card characters, colons, etc.)                                                   |
