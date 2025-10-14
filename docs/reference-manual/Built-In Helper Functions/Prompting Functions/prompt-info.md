---
sidebar_position: 84
doc_state: initial_ai_draft
---

# `{{prompt-info}}`

## Syntax and Semantics

`{{prompt-info}}` creates or augments a field’s prompting metadata. It accepts either **positional** or **named** parameters. 

The overall helper structure is as follows:
> `{{prompt-info` ***fieldName*** ***[[optional-parameters]]***`}}`

where:
- `prompt-info` ==  the keyword for this helper function
- ***[[#fieldName|fieldName]]*** == the fieldname that you are specifying prompting information for
- ***parameters*** == the parameters of `{{prompt-info}}`

---

# Parameters

## Parameters - Required

### fieldName
  The required fieldname parameters specifies the field for which you are providing prompting information. Must be **unquoted** when passed positionally, or as a named bare path (e.g., `fieldName=title`).

  Examples:
```md title="Template File.md"
  {{prompt-info myField}}
  {{prompt-info fieldName="myField"}}
```

---

## Parameters - Optional

### `type`
  One of the supported prompting data types (see [[Prompting Data Types]]). For select types, you may append a colon‑delimited option list, e.g., `singleSelect:High,Medium,Low` or `multiSelect:Personal,Work`.
==Use a ! [ [  #Header ]] ==

### `prompt`
  Human‑readable prompt text shown in the dialog. If omitted, the engine can fall back to the variable name or other heuristics.

### `default`
  Default value used if the user provides nothing and miss rules allow substitution. See [[Miss Handling]].

### `miss`
  Strategy for unresolved values on finalize. Typically `clear` (remove) vs `preserve` (leave token or placeholder). See [[Miss Handling]].

### `directives`
  A comma‑separated list of prompting directives (engine‑level controls). Examples include `no-prompt` (documented below). Others are enumerated by the engine; unknown entries are rejected.    See the [[#Directives]] section below. ==needs cleaning up!==






type Directive = "required" | "no-prompt";
function isValidDirective(value: any): value is Directive {
	return ["required", "no-prompt"].includes(value);
}

type VarValueType = string | number | boolean | moment.Moment | string[] | undefined;

interface PromptInfo {
	varName: string;
	type?: DataType;
	typeOptions?: string[];
	prompt?: string;
	default?: string;
	miss?: string;
	directives?: Directive[];
}

---

## Forms

1. **Positional (preferred for brevity)**
   ```md
   {{prompt-info title "text" "Short title for this note" "Untitled" "preserve" "required"}}
   ```

2. **Named (explicit and order‑independent)**
   ```md
   {{prompt-info varName=title type="text" prompt="Short title for this note" default="Untitled" miss="preserve" directives="required"}}
   ```

3. **Hybrid (named overrides positional)**
   ```md
   {{prompt-info title "text" "Title..." "Untitled" miss="clear" directives="required,no-prompt"}}
   ```

### Merging and Overrides

- Multiple `{{prompt-info}}` entries for the **same `varName`** are **merged**; later declarations override earlier ones.
- Prompt‑info found inside partials is merged into the caller; in case of conflict, **earlier (outer) declarations win** unless explicitly overridden at the call site.
- Any **standalone `{{varName}}` usage** without prior prompt‑info causes the engine to **auto‑register a default prompt-info entry** for that field so it can be collected during prompting.


## Directives (Engine-Level Controls)

> [!NOTE]
> The engine validates each directive token; invalid directives produce template errors. Keep directive tokens lowercase with hyphens.

Below are directives whose behavior is stable or clearly implied by current engine behavior. Where semantics are inferred, they are flagged. See the DANGER block for open questions.

- **`no-prompt`**  
  Do not show a prompt for this field. Use when the engine can compute a value automatically (e.g., built‑ins like `date`, `time`). The value is set in `resolvedValues` before prompting, and the field is omitted from the dialog. Useful for programmatically supplied overrides as well.

- **`required`** *(inferred)*  
  Treat the field as mandatory during collection. The dialog should not finalize until a non‑empty value is supplied, or an injected default exists. If paired with `miss="clear"`, the collection UI still enforces input.

- **`auto` / `autofill`** *(inferred)*  
  Prefer a default or previously supplied value and suppress the prompt if available; otherwise fall back to prompting.

- **`hidden`** *(inferred)*  
  Collect the value but hide the field in the main dialog; use a separate UI affordance or accept injected values (e.g., via URI/JSON).

> [!WARNING]
> Directive tokens are a compact control API. Overuse can reduce clarity. Prefer explicit defaults and clear prompting text; reserve directives for enforceable policy or automation hints.
## Examples

### 1) Simple — Title with default, required

```md
---
sidebar_position: 10
---

# New Note

{{prompt-info title "text" "Short title" "Untitled" "preserve" "required"}}

# {{title}}
```

**Behavior**: A single input for `title` appears with a hint “Short title”; default is “Untitled.” Finalization requires non‑empty input. If user leaves it blank and miss is `preserve`, the token remains or the default is applied per your miss policy.

### 2) Moderate — Selects, hidden metadata, and skip prompt for computed fields

```md
{{prompt-info date      "date"  "When did this happen?" ""       "clear"    "no-prompt"}}
{{prompt-info category  "singleSelect:Personal,Work,Other" "Choose a category"}}
{{prompt-info tags      "multiSelect:Idea,Todo,Refactor"   "Apply tags (multi)"}}
{{prompt-info guid      "text" "Internal id (usually auto)" "" "clear" "hidden,auto"}}
```

**Behavior**: `date` is auto‑set and not prompted. `category` and `tags` render as select inputs. `guid` prefers an injected value (or a generator) and stays out of the main dialog.

### 3) Advanced — Hybrid overrides, field reuse, and structured output

```md
{{! High‑level defaults }}
{{prompt-info priority "singleSelect:High,Medium,Low" "Pick a priority" "Medium"}}
{{prompt-info owner    "text" "Who owns this?" "" "clear"}}

{{! Partial provides a stricter policy; named args override where necessary }}
{{prompt-info owner prompt="Assignee" directives="required"}}
{{prompt-info sprint "text" "Sprint label (e.g., 2025‑10‑S1)" "" "preserve" "auto"}}

## Ticket
- Title: {{title}}
- Owner: {{owner}}
- Priority: {{priority}}
- Sprint: {{sprint}}
```

## Advanced Considerations

- Do you need to include a {{~}} prefix? what about a `{{no-prompt}}`

### Edge Conditions:
- ==Multiple {{prompt-infos }} resolution - what happens?==
- if you do not provide any parameters, then what is the point? It will result it no changes. 
- The engine merges **named over positional**; latter declarations of the same field override earlier ones.


**Behavior**: The second `prompt-info owner` overrides only the `prompt` and adds `required`. `priority` defaults to “Medium.” `sprint` is auto‑filled when available and otherwise preserved if missing.


## Tips
- using the named arguments option will make your templates much more readable.
- Did you know that prompt-info paramters can have fields in them as well? The prompting interface will dynamically update as you provide data for fields






> [!DANGER] OPEN QUESTIONS / ACTION ITEMS
> 1) **Directive Catalog**. Please confirm the authoritative list of recognized directives the engine accepts and rejects. Current docs assume at least `no-prompt`; additional candidates (`required`, `auto`/`autofill`, `hidden`) are inferred from typical workflow needs and partial code hints.  
> 2) **Conflict Resolution Rule**. We state that earlier (outer) declarations are overridden by later declarations for the same field. In partial composition, do we want the opposite precedence? Please verify the intended policy and adjust wording.  
> 3) **Miss + Directives**. Should `miss` semantics ever be coupled to directives (e.g., `required` + `miss="clear"` hard‑errors on finalize)? Clarify UI behavior and error surfaces.  
> 4) **`prompt-value` Implementation**. Confirm whether it should: (a) render the resolved value *post‑prompt*, (b) accept the same argument grammar as `prompt-info`, and (c) honor formatting helpers inline (e.g., `{{format-date (prompt-value date) "YYYY‑MM‑DD"}}`).  
> 5) **Validation Messages**. Are there standard, user‑facing error strings for invalid directives or types we should document verbatim? If so, surface them here for consistency across UI and docs.


