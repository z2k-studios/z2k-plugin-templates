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
%% EMBEDDED: This section is embedded in [[Formatting Dates]] %%

| Link            | Helper Function Name | Purpose                                       |
| --------------- | -------------------- | --------------------------------------------- |
| [[formatDate]] | `{{formatDate}}`    | Formats a date with a moment.js format string |

## Number Formatting Helpers
%% EMBEDDED: This section is embedded in [[Formatting Numbers]] %%

| Link                       | Helper Function Name         | Purpose                                              |
| -------------------------- | ---------------------------- | ---------------------------------------------------- |
| [[formatNumber]]          | `{{formatNumber}}`          | Formats a number with a format string                |
| [[formatNumberToFixed]] | `{{formatNumberToFixed}}` | Formats a number to a fixed number of decimal places |


## String Formatting Helpers
%% EMBEDDED: This section is embedded in [[Formatting Text]] %%

| Link                            | Helper Function Name              | Purpose                                                                                                                                                                |
| ------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [[formatString]]               | `{{formatString}}`               | Formats a string with additional text                                                                                                                                  |
| [[formatStringToUpper]]      | `{{formatStringToUpper}}`      | Formats a string into all caps                                                                                                                                         |
| [[formatStringToLower]]      | `{{formatStringToLower}}`      | Formats a string into all lowercase                                                                                                                                    |
| [[formatStringSlugify]]       | `{{formatStringSlugify}}`       | Formats a string into URL friendly text string for slugs                                                                                                               |
| [[formatStringEncodeURI]]    | `{{formatStringEncodeURI}}`    | Formats a string into a URI friendly text string                                                                                                                       |
| [[formatStringEncodeBase64]] | `{{formatStringEncodeBase64}}` | Formats a string into Base 64 encoding                                                                                                                                 |
| [[formatStringSpacify]]       | `{{formatStringSpacify}}`       | Converts a string collapsed of spaces into a name with spaces.                                                                                                         |
| [[formatStringCommafy]]       | `{{formatStringCommafy}}`       | Takes a multiselect list and renders the active elements into a string with the elements separated by commas ==(is this the default rendering, and thus not needed?)== |
| [[formatStringTrim]]          | `{{formatStringTrim}}`          | Removes all preceding and trailing whitespace from a field                                                                                                             |
| [[formatStringRaw]]           | `{{formatStringRaw}}`           | Prevents any escaping of characters in the final output (default mode for text replacement is to escape markdown relevant characters)                                  |
| [[formatStringBulletize]]     | `{{formatStringBulletize}}`     | Formats the source data (which may be multilined) into a bulleted list using dashes                                                                                    |
| [[formatStringFileFriendly]] | `{{formatStringFileFriendly}}` | Takes a string and makes a file friendly version of the string (e.g. removes wild card characters, colons, etc.)                                                       |
