---
sidebar_position: 70
doc_state: revised_ai_draft_2
title: "Comparison with Templater Plugin"
sidebar_label: "Templater Comparison"
aliases:
- What about Templater?
---
# Why Another Templating Plugin?
Why a new templating plugin when the impressive [Templater plugin](https://silentvoid13.github.io/Templater/) already does so much? Templater is a fine option for users who prefer script-like control and advanced logic. Templater has a strong "coding" vibe - to use it, it helps to have a background as a programmer. 

**Z2K Templates** takes the [[How is it Different than other Template Plugins|opposite approach]]: less scripting, more static field names. Z2K Templates also focuses on building out a larger templating system beyond individual snippets (for example, [[Block Templates|block templates]] and [[Hierarchical Template Folders|hierarchical folders]]).

# Use them Both!
If you like both approaches, rest easy, you can keep both installed: Templater for logic, Z2K Templates for systems. In fact, **they can work together fantastically**, for instance see this article on [[How to Wrap Templater Code Snippets into Fields|wrapping templater code into Z2K Templates Fields]].


---

## Feature Matrix (Z2K Templates vs. Templater)

| Feature                               | **Z2K Templates**                              | **Templater**                                |
| ------------------------------------- | ---------------------------------------------- | -------------------------------------------- |
| **Interactive prompting UI**          | **Yes** — native modal prompts per field       | **Yes** — `tp.system.prompt/suggester` in JS |
| **Date & time constants**             | **Yes** (e.g., `{{date}}`)                     | **Yes** (`<% tp.date.now() %>`, etc.)        |
| **String/date formatting helpers**    | **Yes** (`format-string`, `format-date`, etc.) | **Yes** (via JS functions/libraries)         |
| **Context-aware template discovery**  | **Yes** (folder ancestry)                      | Not built-in (QuickAdd/scripts)              |
| **Hierarchical System YAML**          | **Yes** (merged on create)                     | Not built-in (scriptable)                    |
| **Partials / includes**               | **Yes** (Handlebars partials)                  | **Yes** (`tp.file.include()`)                |
| **Deferred fields & Finalize step**   | **Yes** (continue filling, then finalize)      | Not a first-class concept                    |
| **YAML merge across templates**       | **Yes** (built-in)                             | Scriptable                                   |
| **URI triggers / JSON command lists** | **Yes** (URIs + packages)                      | Possible via JS/QuickAdd                     |
| **Custom user functions / execution** | Roadmap (helper registration)                  | **Yes** — full **JavaScript** execution      |
| **File system operations**            | Not in scope (by design)                       | **Yes** — create/move/rename via JS          |
| **Event-based triggers**              | Via Obsidian command; finalize workflow        | **Yes** — on open/create hooks via JS        |
| **Safety / Sandbox**                  | No code execution inside notes                 | Runs user JS (powerful; requires care)       |

> This matrix reflects native emphasis. Templater can often **script** comparable behaviors; Z2K Templates makes many behaviors **declarative** and built-in.


---

## Side‑by‑Side Code Examples (Templater ↔ Z2K)

### Comparison: Date, Time, Conditionals

**Goal:** Insert today’s date and a title, then show a conditional section if notes exist.

- **Templater** (from the official docs style):

```md title="Example A - Templater.md"
# <% tp.date.now('YYYY-MM-DD') %> — <% tp.file.title %>
<%* if (tp.frontmatter.notes) { %>
## Notes
<%* tR += tp.frontmatter.notes %>
<%* } %>
```

Source: Templater docs — Introduction: variables and JS execution.

- **Z2K Templates**:

```md title="Example A - Z2K Templates.md"
–––
Title: {{TitleText}}
Date: {{date}}
–––
# {{date}} — {{TitleText}}
{{#if notes}}
## Notes
{{notes}}
{{/if}}
```

---

### Comparison: Resuable Blocks

**Goal:** Include a reusable block (participants/contact info).

- **Templater**:

```md title="Example B - Templater.md"
<%* tR += await tp.file.include("_partials/participants.md") %>
```

- **Z2K Templates**:

```md title="Example B - Z2K Templates.md"
{{> ParticipantsBlock}}
```

> The Z2K version keeps logic out of code blocks and standardizes on fields and partials. Templater enables deep automation through JavaScript.


---

### Comparison: Field Fata Types, YAML, Multiple Entries

**Goal:** Prompt the user for a category from a list and insert it in YAML and body.

- **Templater**:
```md title="Example C - Templater.md"
---
Category: <%* const c = await tp.system.suggester(['Work','Home','Study'], ['work','home','study']); tR += c %>
---
# Note — <%* tR += c %>
```

- **Z2K Templates**:
```md title="Example C - Z2K Templates.md"
–––
Category: {{Category typeselect:Work,Home,Study}}
–––
# Note — {{Category}}
```

---

### Comparison: Deferred Data Entry

**Goal:** Start a daily note with deferred fields you’ll fill later; finalize when done.

- **Templater** (conceptual; no first-class deferred placeholders):
```md title="Example D - Templater.md"
---
Title: <% tp.date.now('YYYY-MM-DD') %>
---
Steps: 
Breakfast: 
Dinner: 
Weight: 
Mood: 
```
(You would manually edit later or script a custom command.)

- **Z2K Templates**:
```md title="Example D - Z2K Templates.md"
–––
Title: {{date}}
–––
Steps: {{StepsTaken}}
Breakfast: {{Breakfast}}
Dinner: {{Dinner}}
Weight: {{Weight}}
Mood: {{Mood}}
```
Use **Continue filling file** during the day; **Finalize** applies miss-handling for anything left unresolved.

---

> [!DANGER] INTERNAL NOTE
>
> - Re‑verify example parity against the latest Templater docs. If needed, add a more exact citation for each snippet and a screenshot of the equivalent Z2K prompt.
> - Confirm “custom user functions” status in Z2K (helpers registration roadmap) before publishing.
> - Consider adding QuickAdd launch examples in a future “Workflows” page.
> - Fix the | syntax with current field-info

