---
z2k_validation_ok: 4
---

# DOCS Tags in Source Code

This file catalogs all `DOCS:` tags found in the plugin and engine source code. These tags mark behaviors, constraints, or design decisions that should be explicitly documented for users.

---

## DOCS Tag #1: Reduced-Set Templates Don't Support fieldInfos or Blocks

- Location: line 366 of z2k-template-engine/src/main.ts
- Link: [main.ts:366](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-template-engine/src/main.ts:366:1)
- Docs Comment:

> DOCS: fieldInfos and blocks are not supported in reduced-set templates

- Issue Summary:

> The `reducedRenderContent` method runs a stripped-down rendering pass — it processes Handlebars expressions but does not parse or apply fieldInfo definitions, and block syntax is not available. This is a deliberate limitation of the reduced rendering path. Users who rely on fieldInfos or block templates need to use the full rendering pipeline.

- Status: ✅ Documented — see [[Restricted Functionality Mode]]

---

## DOCS Tag #2: Single Expression vs. Template Rendering (Type Preservation)

- Location: line 379 of z2k-template-engine/src/main.ts
- Link: [main.ts:379](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-template-engine/src/main.ts:379:1)
- Docs Comment:

> DOCS: Single Expression vs Template Rendering

- Issue Summary:

> When content is exactly `{{expression}}` with no surrounding text, the engine treats it as an expression evaluation and preserves the native return type (array, number, boolean, etc.). When content contains any text outside the braces — even `Hello {{name}}` or `{{a}} and {{b}}` — it is treated as template rendering and always returns a string. This distinction matters because Handlebars stringifies all output during template rendering. The engine uses an internal `__capture__` helper to preserve types for single-expression evaluation.

- Status: ✅ Documented — see [[Field Types#Type Preservation in Expressions]]

---

## DOCS Tag #3: Field Info Priority Chain

- Location: line 555 of z2k-template-engine/src/main.ts
- Link: [main.ts:555](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-template-engine/src/main.ts:555:1)
- Docs Comment:

> DOCS: field info values override the built-in values

- Issue Summary:

> Field info values are resolved through a priority chain: **built-in < global < system < block < main**. Values defined in the main template body override those from blocks, which override system blocks, which override the global block, which override built-in defaults. This determines which value "wins" when the same field is defined in multiple places.

- Status: ✅ Documented — see [[Global Block and fieldInfo#fieldInfo Resolution Order]]

---

## DOCS Tag #4: No Blocks Allowed in YAML Frontmatter

- Location: line 718 of z2k-template-engine/src/main.ts
- Link: [main.ts:718](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-template-engine/src/main.ts:718:1)
- Docs Comment:

> DOCS: No blocks allowed in YAML frontmatter

- Issue Summary:

> Block template syntax is not permitted inside YAML frontmatter sections. The YAML frontmatter is parsed independently and does not go through the block-processing pipeline. Attempting to use block syntax in frontmatter will not work as expected.

---

## DOCS Tag #5: Dynamic Paths in Expressions Are Not Supported

- Location: line 1424 of z2k-template-engine/src/main.ts
- Link: [main.ts:1424](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-template-engine/src/main.ts:1424:1)
- Docs Comment:

> DOCS: not going to support dynamic paths like `{{(lookup "key").foo}}` or `{{(concat "user").foo}}`

- Issue Summary:

> Path expressions where the base variable is itself the result of a helper call — e.g., `{{(lookup "key").foo}}` — are not supported and will throw a `TemplateError`. Only top-level variable names are valid as path bases. This is a deliberate scope limitation; dynamic path resolution would require a significantly more complex evaluation model.

---

## DOCS Tag #6: templatePath Parameter Accepts Multiple Naming Forms

- Location: lines 1325–1326 of z2k-plugin-templates/src/main.tsx
- Link: [main.tsx:1325](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-plugin-templates/src/main.tsx:1325:1)
- Docs Comment:

> DOCS: Non-field parameters can be templatePath, TemplatePath, template-path, template_path, etc. for robustness
> DOCS: but we should just say templatePath in the docs for simplicity

- Issue Summary:

> The command processor normalizes several casing and delimiter variants of the `templatePath` parameter (camelCase, PascalCase, kebab-case, snake_case) to allow for robustness when called from external tools or URIs. However, the canonical documented form is `templatePath` — docs should not enumerate the variants, as doing so would imply all forms are equally intentional.

---

## DOCS Tag #7: All Unrecognized Parameters Are Treated as Template Data

- Location: lines 1392–1393 of z2k-plugin-templates/src/main.tsx
- Link: [main.tsx:1392](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-plugin-templates/src/main.tsx:1392:1)
- Docs Comment:

> DOCS: All params (except recognized command params) are treated as template data
> DOCS: Direct params override values in fieldData

- Issue Summary:

> The command processor separates recognized command parameters (like `cmd`, `templatePath`, `destDir`, etc.) from everything else. All unrecognized keys are automatically treated as template field data. Additionally, parameters passed directly in the command override values in `fieldData` / `fieldData64` — direct params take precedence in the merge.

---

## DOCS Tag #8: Field Overrides Override fieldInfo Values

- Location: line 2065 of z2k-plugin-templates/src/main.tsx
- Link: [main.tsx:2065](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-plugin-templates/src/main.tsx:2065:1)
- Docs Comment:

> DOCS: field overrides override the values specified in fieldinfos

- Issue Summary:

> Field overrides (values passed via URI params or JSON command data) are applied after fieldInfo definitions are processed. This means an override will win over a `value:` directive set in a fieldInfo block inside the template. This is the mechanism that lets callers pre-fill or force-set field values from outside the template.

---

## DOCS Tag #9: Line Number Semantics for Content Insertion

- Location: lines 2602–2603 of z2k-plugin-templates/src/main.tsx
- Link: [main.tsx:2602](vscode://file//Users/gp/Vaults/Z2K%20Studios%20Workspace/Code/Obsidian%20Plugins/z2k-plugin-templates/src/main.tsx:2602:1)
- Docs Comment:

> DOCS: Positive numbers (1 to N+1): 1 = before first line, N+1 = after last line
> DOCS: Negative numbers: -1 = before last line, -2 = before second-to-last, etc.

- Issue Summary:

> The `location` line number parameter uses a 1-based, insertion-point model rather than a line-content model. Positive values: `1` means before the first line, `N+1` means after the last line (append). Negative values count backward from the end: `-1` inserts before the last line, `-2` before the second-to-last, etc. This needs clear documentation since the semantics differ from typical 0-indexed or line-content-based models.

---

## DOCS Tag #10: YAML Frontmatter Fields Are Automatically Added as Field Values

- Location: lines 3172–3178 of z2k-plugin-templates/src/main.tsx
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
