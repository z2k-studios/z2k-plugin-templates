---
z2k_validation_ok: 4
---
# DOCS Tags in Source Code

This file catalogs all `DOCS:` tags found in the plugin and engine source code. These tags mark behaviors, constraints, or design decisions that should be explicitly documented for users. Tags marked ✅ have been addressed; all others are open.

---

## DOCS Tag #1: No Blocks Allowed in YAML Frontmatter

- Location: line 723 of `z2k-template-engine/src/main.ts`
- Link: [main.ts:723](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-template-engine/src/main.ts:723:1)
- Docs Comment:

> DOCS: No blocks allowed in YAML frontmatter

- Issue Summary:

> Block template syntax is not permitted inside YAML frontmatter sections. The YAML frontmatter is parsed independently and does not go through the block-processing pipeline. Attempting to use block syntax in frontmatter will not work as expected.

- Status: ✅ Documented — see [[Restricted Functionality Mode#What About YAML Frontmatter?]]

---

## DOCS Tag #2: Dynamic Paths in Expressions Are Not Supported

- Location: line 1429 of `z2k-template-engine/src/main.ts`
- Link: [main.ts:1429](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-template-engine/src/main.ts:1429:1)
- Docs Comment:

> DOCS: not going to support dynamic paths like `{{(lookup "key").foo}}` or `{{(concat "user").foo}}`

- Issue Summary:

> Path expressions where the base variable is itself the result of a helper call — e.g., `{{(lookup "key").foo}}` — are not supported and will throw a `TemplateError`. Only top-level variable names are valid as path bases. This is a deliberate scope limitation; dynamic path resolution would require a significantly more complex evaluation model.

- Status: ✅ Documented — see [[Field Syntax#Dot Notation]], [[JSON Field Data#Nested Objects and Dot Notation]], and [[Handlebars and Z2K Templates]] (moved from Untested to Supported)

---

## DOCS Tag #3: templatePath Parameter Accepts Multiple Naming Forms

- Location: lines 1325–1326 of `z2k-plugin-templates/src/main.tsx`
- Link: [main.tsx:1325](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-plugin-templates/src/main.tsx:1325:1)
- Docs Comment:

> DOCS: Non-field parameters can be templatePath, TemplatePath, template-path, template_path, etc. for robustness
> DOCS: but we should just say templatePath in the docs for simplicity

- Issue Summary:

> The command processor normalizes several casing and delimiter variants of the `templatePath` parameter (camelCase, PascalCase, kebab-case, snake_case) to allow for robustness when called from external tools or URIs. However, the canonical documented form is `templatePath` — docs should not enumerate the variants, as doing so would imply all forms are equally intentional.

- Status: ✅ Documented — noted in DANGER block of [[JSON Directives]]

---

## DOCS Tag #4: All Unrecognized Parameters Are Treated as Template Data

- Location: lines 1392–1393 of `z2k-plugin-templates/src/main.tsx`
- Link: [main.tsx:1392](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-plugin-templates/src/main.tsx:1392:1)
- Docs Comment:

> DOCS: All params (except recognized command params) are treated as template data
> DOCS: Direct params override values in fieldData

- Issue Summary:

> The command processor separates recognized command parameters (like `cmd`, `templatePath`, `destDir`, etc.) from everything else. All unrecognized keys are automatically treated as template field data. Additionally, parameters passed directly in the command override values in `fieldData` / `fieldData64` — direct params take precedence in the merge.

- Status: ✅ Documented — covered by [[JSON Field Data#Deconflicting When Both Methods are Used]]

---

## DOCS Tag #5: Field Overrides Override fieldInfo Values

- Location: line 2065 of `z2k-plugin-templates/src/main.tsx`
- Link: [main.tsx:2065](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-plugin-templates/src/main.tsx:2065:1)
- Docs Comment:

> DOCS: field overrides override the values specified in fieldinfos

- Issue Summary:

> Field overrides (values passed via URI params or JSON command data) are applied after fieldInfo definitions are processed. This means an override will win over a `value:` directive set in a fieldInfo block inside the template. This is the mechanism that lets callers pre-fill or force-set field values from outside the template.

- Status: ✅ Documented — NOTE callout added to [[fieldInfo value#Resolution Priority]]

---

## DOCS Tag #6: Line Number Semantics for Content Insertion

- Location: lines 2602–2603 of `z2k-plugin-templates/src/main.tsx`
- Link: [main.tsx:2602](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-plugin-templates/src/main.tsx:2602:1)
- Docs Comment:

> DOCS: Positive numbers (1 to N+1): 1 = before first line, N+1 = after last line
> DOCS: Negative numbers: -1 = before last line, -2 = before second-to-last, etc.

- Issue Summary:

> The `location` line number parameter uses a 1-based, insertion-point model rather than a line-content model. Positive values: `1` means before the first line, `N+1` means after the last line (append). Negative values count backward from the end: `-1` inserts before the last line, `-2` before the second-to-last, etc. This needs clear documentation since the semantics differ from typical 0-indexed or line-content-based models.

- Status: ✅ Documented — see [[JSON Directives#Line Number Semantics]], with cross-reference added to [[JSON Command - insertblock#Insert at a Line Number]]

---

## DOCS Tag #7: YAML Frontmatter Fields Are Automatically Added as Field Values

- Location: lines 3172–3178 of `z2k-plugin-templates/src/main.tsx`
- Link: [main.tsx:3172](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-plugin-templates/src/main.tsx:3172:1)
- Docs Comment:

> DOCS: YAML frontmatter fields are automatically added as field values.
> DOCS: This allows templates to reference metadata from template files, system blocks, and existing files.
> DOCS: YAML fields are added with 'no-prompt' directive to avoid re-prompting for existing data.
> DOCS: Priority order: Built-ins < YAML fields < fieldInfo.value < Plugin built-ins < Overrides
> DOCS: All frontmatter fields are included except Obsidian internal fields (currently only 'position').
> DOCS: User-facing fields like 'tags', 'aliases', and 'cssclasses' are included as they represent user data.
> DOCS: Values are passed through with their native YAML types (string, number, array, etc.)

- Issue Summary:

> The `addYamlFieldValues` method automatically harvests YAML frontmatter from template files, system blocks, and existing files, injecting them as field values available to Handlebars expressions. They're added with `no-prompt` so they don't trigger user prompts for already-known data. Priority: built-ins are overridden by YAML fields, which are overridden by explicit `fieldInfo.value` declarations, which are overridden by plugin built-ins, which are overridden by external overrides. Only the Obsidian-internal `position` field is excluded; standard user fields (`tags`, `aliases`, `cssclasses`) are included. Types are preserved as native YAML types.

- Status: ✅ Documented — [[Using YAML Metadata as Fields]] covers this comprehensively. Added clarifying sentence to "YAML Types Are Preserved" section noting that `{{field}}` output is always a string, with cross-reference to [[Field Types#Native Types vs. String Types]].
