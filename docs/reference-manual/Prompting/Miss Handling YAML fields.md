---
sidebar_position: 66
---

There several built in directives for adjusting how fields are prompted for:

| Function     | Description                                                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@clear`     | Specifies that a field should clear itself if no data was provided (see [[Finalizing and Miss Handling for Z2K Templates\|Miss Handling]] for more details)    |
| `@preserve`  | Specifies that a field should preserve itself if no data was provided (see [[Finalizing and Miss Handling for Z2K Templates\|Miss Handling]] for more details) |
| `@no-prompt` | Specifies that a field should not be included in the UI to prompt the user for values.                                                                     |
| `@required`  | Specifies that a field is required for input before proceeding. Note: if a default value is provided, then that is sufficient for proceeding forward       |


## Directives (Engine-Level Controls)

> [!NOTE]
> The engine validates each directive token; invalid directives produce template errors. Keep directive tokens lowercase with hyphens.

Below are directives whose behavior is stable or clearly implied by current engine behavior. Where semantics are inferred, they are flagged. See the DANGER block for open questions.

- **`no-prompt`**  
  Do not show a prompt for this field. Use when the engine can compute a value automatically (e.g., built‑ins like `date`, `time`). The value is set in `resolvedValues` before prompting, and the field is omitted from the dialog. Useful for programmatically supplied overrides as well.

- **`required`** *(inferred)*  
  Treat the field as mandatory during collection. The dialog should not finalize until a non‑empty value is supplied, or an injected default exists. If paired with `miss="clear"`, the collection UI still enforces input.


> [!WARNING]
> Directive tokens are a compact control API. Overuse can reduce clarity. Prefer explicit defaults and clear prompting text; reserve directives for enforceable policy or automation hints.


## Examples


## Implementation Details
See the ChatGPT chat on implementation 
https://chatgpt.com/share/67ba03b7-44f0-8007-be1d-0267208ea8f3



From the source code:

