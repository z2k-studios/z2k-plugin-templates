---
sidebar_position: 15
doc_state: revised_ai_draft_2
title: "Why Use Z2K Templates?"
---

# Why Use Z2K Templates

Obsidian is famous for diverse plugin marketplace. Z2K Templates is only one of several plugins you can install to templatize notes in Obsidian. This page outlines alternatives, offers a neutral compare/contrast, and then clarifies where Z2K Templates’ design choices differ. Links below go to official docs or plugin listings.

Note: we *love* our fellow plugin developers - many thanks go out to [@silentvoid13](https://github.com/SilentVoid13), [@oeN](https://github.com/oeN), [@chhouman](https://github.com/chhoumann) and others for their fine work in making templating solutions for Obsdian. 

---

## Alternative Plugins
Let's step back and review the top alternatives to **Z2K Templates**:

- **Templater (community plugin)** — Full-featured templating language with JavaScript execution and prompts. Widely adopted by power users. [Docs](https://silentvoid13.github.io/Templater/introduction.html) · [GitHub](https://github.com/SilentVoid13/Templater)
- **Templates (core plugin)** — Simple snippet insertion with date/title variables and a designated template folder. [Obsidian Help](https://help.obsidian.md/plugins/templates)
- **QuickAdd (community plugin)** — Workflow accelerator that *invokes* templates (core or community), captures, and macros. Often used alongside Templater or core Templates. [Docs](https://quickadd.obsidian.guide/docs/) · [GitHub](https://github.com/chhoumann/quickadd)
- **Liquid Templates (community plugin)** — Alternative templating engine using LiquidJS tags. Smaller but active. [Obsidian Hub](https://publish.obsidian.md/hub/02%2B-%2BCommunity%2BExpansions/02.05%2BAll%2BCommunity%2BExpansions/Plugins/liquid-templates) · [GitHub](https://github.com/oeN/liquid-template)
- **Periodic Notes (community plugin)** — Specialized periodic-note workflows with template hooks for daily/weekly/monthly notes. [GitHub](https://github.com/liamcain/obsidian-periodic-notes)

> These are complementary tools. Many vaults successfully combine Core Templates + QuickAdd, or Templater + QuickAdd. Z2K Templates can also coexist with them.

---

## Top‑Line Compare & Contrast

- **Core Templates** is the easiest entry point: insert prewritten text and a few built‑in variables. No logic, no language to learn. Ideal for lightweight snippets.
- **Templater** adds a **programmable layer**: JavaScript execution, file ops, and a rich API. This is excellent for complex automation, with the trade‑off of more moving parts and code in your notes.
- **Liquid Templates** swaps in a **LiquidJS** syntax. It emphasizes template tags over code, landing between Core Templates and Templater in capability.
- **Z2K Templates** takes a **declarative `{{fields}}` approach** backed by the [Handlebars.js](https://handlebarsjs.com/) language. It focuses on structured fields, interactive prompting, YAML integration, partials, and *context-aware* discovery (hierarchical templates). The intent is to standardize structure without requiring JavaScript in your notes.

---

## Design Approach Comparison

| Aspect                            | **Z2K Templates**                                                                   | **Templater**                                                                                  | **Liquid Templates**                                          |
| --------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Style**                         | Declarative `{{fields}}` with prompting and helpers                                 | Functional `<% code %>` blocks + JS API                                                        | Declarative Liquid tags (`{% ... %}`, `{{ ... }}`)            |
| **Instantiation**                 | Immediate **or deferred**; unresolved fields can persist and be **finalized** later | Immediate expansion on command; event triggers available; no first-class deferred placeholders | Immediate expansion on command                                |
| **Interactive data-prompting UI** | **Yes** — native, field-driven modal prompts (text, number, select, etc.)           | **Yes** — prompts/suggesters via API (`tp.system.prompt/suggester`)                            | Typically **No** — Liquid is a static engine (no built-in UI) |
| **Underlying language**           | Handlebars (expressions, conditionals, partials)                                    | Custom template syntax + **JavaScript** execution                                              | **LiquidJS** (filters/tags)                                   |
| **Primary emphasis**              | Structured fields, YAML merging, hierarchical discovery, partials                   | Programmable automation, JS scripting, file ops                                                | Liquid-style tags/filters in notes                            |
| **Typical pairings**              | Stands alone; pairs well with QuickAdd                                              | Frequently paired with QuickAdd                                                                | Sometimes paired with QuickAdd                                |

> Notes: “Deferred” means leaving unresolved `{{fields}}` in a note to fill later. Z2K Templates handles these explicitly at **[[Lifecycle of a Template#Finalize|Finalize]]** time.

### Capabilities present in other plugins (not core to Z2K Templates)
- **Templater:** Arbitrary **JavaScript execution**, Obsidian API access, file system operations (create/move/rename), shell/process execution via JS, complex programmatic control flow.
- **Liquid Templates:** Liquid-specific filter ecosystem and tag syntax; useful if you prefer Liquid across multiple tools.

---

## Z2K Templates and Templater

For a more detailed analysis of Z2K Templates in contrast to the popular Templater plugin, continue to the [[Z2K Templates vs. Templater|next page]].

---

> [!DANGER] INTERNAL NOTE
>
> - Re‑verify example parity against the latest Templater docs. If needed, add a more exact citation for each snippet and a screenshot of the equivalent Z2K prompt.
> - Confirm “custom user functions” status in Z2K (helpers registration roadmap) before publishing.
> - Consider adding QuickAdd launch examples in a future “Workflows” page.
> - Fix the | syntax with current field-info

