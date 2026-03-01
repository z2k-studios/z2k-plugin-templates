---
sidebar_position: 1
sidebar_folder_position: 60
aliases:
- YAML Configuration Setting
- YAML Configuration Property
- Z2K Templates YAML Configuration Setting
- Z2K Templates YAML Configuration Settings
- Z2K Templates YAML Configuration Property
- Z2K Templates YAML Configuration Properties
---
# Z2K Templates' YAML Configuration Properties
The Z2K Templates plugin uses properties stored in the YAML frontmatter of a template file to control how the plugin behaves on a per-template basis. All property keys are prefixed with `z2k_template_` to separate them from other YAML frontmatter you may use.

## Using Z2K Templates YAML Configuration Properties
Z2K Templates YAML Configuration Properties can be placed directly in the YAML frontmatter of a template file. They can also be placed in [[Intro to System Blocks|System Blocks]] to configure behavior across a larger set of files in [[Template Folder Hierarchies|hierarchically designed vaults]].

## Supported YAML Configuration Properties
The following YAML configuration properties are recognized by the Z2K Templates plugin:
- Properties set by Z2K Templates throughout the [[Lifecycle of a Template]]:
	- [[z2k_template_type]] – declares how the plugin treats a file (template vs. content)
	- [[z2k_template_name]] – overrides the template's display name
- Properties set by Template Authors and never deleted:
	- [[z2k_template_author]] – assigns an author attribution to the template
	- [[z2k_template_version]] – assigns a version identifier to the template
- Properties set by Template Authors and Removed after Instantiation:
	- [[z2k_template_suggested_title]] – provides a suggested filename for new notes created from the template
- Properties set by Template Authors and Removed after Finalization:
	- [[z2k_template_default_fallback_handling]] – sets the default fallback behavior for fields without explicit fallback directives
	- [[z2k_template_default_prompt]] – sets a default prompt string for all fields in the file

## Lifecycle Behavior
Most configuration properties are cleaned up automatically as a file moves through the [[Lifecycle of a Template]]:

| Property                                 | On [[Instantiation]]          | On [[Finalization]]             | On [[Block Templates |
| ---------------------------------------- | ----------------------------- | ------------------------------- | -------------------- |
| `z2k_template_type`                      | Set to `wip-content-file`     | Set to `finalized-content-file` | Deleted              |
| `z2k_template_suggested_title`           | Deleted                       | –                               | Deleted              |
| `z2k_template_default_fallback_handling` | Kept (engine needs it)        | Deleted                         | Deleted              |
| `z2k_template_name`                      | Set to source template's name | Kept                            | –                    |
| `z2k_template_version`                   | Kept                          | Kept                            | –                    |
| `z2k_template_author`                    | Kept                          | Kept                            | –                    |
| `z2k_template_default_prompt`            | –                             | –                               | –                    |

> [!DANGER] INTERNAL NOTES
> - `z2k_template_default_prompt` is documented but not yet implemented in the codebase. The lifecycle behavior column is blank because there is no code that reads or removes it.
> - Verify whether `z2k_template_name`, `z2k_template_version`, and `z2k_template_author` should be cleared on finalization – currently they persist into the finalized content file.
