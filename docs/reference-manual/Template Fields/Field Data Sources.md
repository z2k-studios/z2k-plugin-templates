---
sidebar_position: 30
---
# Template Field Data Sources
Z2K Templates is all about taking data in from a source and then inserting that information into templates to make new files in your vault. The information that can be inserted into [[Template Fields]] can come from a variety of places.

%% Note: this next section is ! included into the [[Data Formatting Overview]] page %%
## Known Data Sources
Here are the different ways in which data can be inserted into a template using its template fields:

| Data Type           | Data Source | Description                                                                                                                  | Learn More                                         |
| ------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **Prompting**       | User        | User is prompted via the prompting interface for any missing data.                                                           | [[Prompting]]                                      |
| **Built-Ins**       | Computed    | Built-in fields and helper functions — values like `{{date}}` or computed values from helper functions.                      | [[Built-In Fields]], [[Built-In Helper Functions]] |
| **Defaults**        | User        | User can use `{{fieldInfo}}` to specify the default value for each field                                                    | [[fieldInfo suggest]]                             |
| **Fallbacks**       | User        | The user can specify fallback values to use when all other data sources fail.                                                | [[Fallback Behavior]]                              |
| **YAML Properties** | The Vault   | YAML frontmatter properties from the file, system blocks, or block templates are automatically available as field values.    | [[Using YAML Metadata as Fields]]                  |
| **Existing Files**  | The Vault   | Other vault files can be fed into a template via the `{{sourceText}}` field, or through the use of block templates.          | [[sourceText\|sourceText]], [[Block Templates]]    |
| **URI Calls**       | External    | Other applications (e.g. Apple Shortcuts, batch scripts) can insert data into templates to create new files via URI calls.   | [[URI Calls]]                                      |
| **JSON Packages**   | External    | 3rd party applications (e.g. Apple Shortcuts) can create actions inside JSON files that will be read by the Templates Plugin | [[JSON Packages]]                                  |
| **Command Queues**  | External    | Offline and programmatic template invocation that occurs asynchronously                                                      | [[Command Queues]]                                 |

## How Field Values Are Resolved
When multiple data sources provide a value for the same field, the plugin doesn't replace the field's text multiple times. Instead, it collects all field metadata into a single internal state, sets values through a sequence of steps, and renders the template **once** at the end.

There are two separate concerns: **field metadata** (prompts, types, directives) and **field values** (the actual data inserted). Each has its own resolution logic.

### Field Metadata Resolution
During template parsing, the engine collects [[reference-manual/fieldInfo Helper/fieldInfo Helper|fieldInfo]] declarations from multiple sources – system blocks, block templates, and the primary document template. When the same field has declarations in multiple sources (i.e. "collisions"), the more specific source wins. From least to most specific:
- [[Intro to System Blocks|System block]] declarations
- [[Block Templates|Block template]] declarations
- [[Types of Template Files#Document Templates|Document template]] declarations

Metadata collisions within one of these sources (e.g. multiple fieldInfos within a document template) are resolved with a "last value set wins" in a sequential reading of the file. 

For example, if a system block declares `{{fieldInfo "status" type="text"}}` but the main template declares `{{fieldInfo "status" type="singleSelect" opts="draft,active"}}`, the main template's declaration wins – the field becomes a dropdown, not a text input.

### Field Value Priority
Field values are set through a series of steps. Each step either checks whether a value already exists (and skips if so) or writes unconditionally (overriding whatever was there). The result is a priority order where **higher-priority sources always win**:

| Priority    | Source                                                                                                                          | Behavior                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **Highest** | **External overrides** – values from [[JSON Packages]] or [[URI Calls]]                                                         | Unconditionally overwrites any existing value                                                 |
|             | **Plugin-managed built-ins** – `{{templateName}}`, `{{templateVersion}}`, `{{templateAuthor}}`, `{{sourceText}}`, `{{creator}}` | Unconditionally overwrites – ensures these fields always reflect the actual template metadata |
|             | **fieldInfo `value` parameter** – explicit values set via `{{fieldInfo}}` with [[fieldInfo value]]                           | Set during parsing, before YAML values are applied                                            |
|             | **YAML property values** – from merged YAML frontmatter (see [[Using YAML Metadata as Fields]])                                 | Only fills in fields that don't already have a value – skips if fieldInfo already set one    |
| **Lowest**  | **Prompting** – user input via the [[Prompting Interface]]                                                                      | Only runs for fields that still have no value after all the above                             |

## Field Data Formatting
For more information on how the data from these different field data sources gets formatted, please see [[Data Formatting]].


> [!NOTE] Most Built-In Fields
> Most [[Built-In Fields]] (like `{{date}}` and `{{time}}`) are computed during rendering, not during the value-setting phase. They don't participate in the priority table above – they resolve at render time if no other source has provided a value for them.

> [!DANGER] Notes
> - The execution order in the plugin is: `addYamlFieldValues()` (line 1866), then `addPluginBuiltIns()` (line 1867), then `handleOverrides()` (line 1877). YAML values use a conditional write (skip if value exists), while plugin built-ins and overrides use unconditional writes.
> - The code comment at plugin line 2908 documents the intended priority as: `Built-ins < YAML fields < fieldInfo.value < Plugin built-ins < Overrides` (where `<` means lower priority).
> - There is a TODO at plugin line 2912 to refactor this into a `valuesBySource` pattern for more explicit priority ordering.
