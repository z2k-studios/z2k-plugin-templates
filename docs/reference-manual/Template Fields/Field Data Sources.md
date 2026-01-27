---
sidebar_position: 30
---
# Template Field Data Sources
Z2K Templates is all about taking data in from a source and then inserting that information into templates to make new files in your vault. The information that can be inserted into [[Template Fields]] can come from a variety of places.

Here are the different ways in which data can be inserted into a template using its template fields:

| Data Type                  | Data Source | Description                                                                                                                                | Learn More                                         |
| -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| **Prompting**              | User        | User is prompted via the prompting interface for any missing data.                                                                         | [[Prompting]]                                      |
| **Built-Ins**              | Computed    | Built-in fields and helper functions — values like `{{date}}` or computed values from helper functions.                                    | [[Built-In Fields]], [[Built-In Helper Functions]] |
| **Defaults**               | User        | User can use `{{field-info}}` to specify the default value for each field                                                                  | [[field-info default]]                             |
| **Misses**                 | User        | The user can specify fallback behaviors ("miss handling") in the event that all other data sources fail.                                   | [[Miss Handling]]                                  |
| **Existing Files**         | The Vault   | Other vault files can be fed into a template via the `{{sourceText}}` field, or through the use of block templates.                        | [[sourceText\|sourceText]], [[Block Templates]]    |
| **3rd Party URI Calls**    | External    | Other applications (e.g. Apple Shortcuts, batch scripts) can insert data into templates to create new files via URI calls.                 | [[URI Calls\|URI]]                                 |
| **3rd Party JSON packets** | External    | 3rd party applications (e.g. Apple Shortcuts) can create actions inside JSON files that will be read automatically by the Templates Plugin | [[Command Lists]], [[JSON Packages\|JSON]]         |

