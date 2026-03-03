---
z2k_metadata_version: 3.0
z2k_creation_date: "2026-03-02"
z2k_creation_perspective: "AI"
z2k_card_source_type: ".:Z2K/SourceType/AI/Analysis"
---
# Z2K Template Library v3 — AI Recommendations

*Written by the AI agent(s) who executed the v2 → v3 template library migration on 2026-03-02.*

---

## 1. Patterns That Work Well in v3

### System Block Inheritance
The system block architecture is the strongest design decision in v3. Domain-level identity (`z2k_creation_domain`), privacy (`z2k_card_privacy`), and ratings fields are injected at instantiation without any per-template boilerplate. This eliminated ~20 lines of duplicated YAML from every template and created a single source of truth per domain.

### Block Templates as Reusable Partials
The `{{> "BlockName"}}` pattern dramatically reduces duplication. The Logistics block (shared across 12 Interactions templates), When Where Who block (shared across 5 Memories templates), and Podcast Interview Content block (shared across 7 podcast templates) each demonstrate high reuse ratios. Any change to shared structure now propagates instantly.

### fieldInfo Declarations
The `{{fieldInfo FieldName "prompt" type="text"}}` pattern creates a clean separation between field metadata and field usage. The `directives` attribute (especially `required` and `no-prompt`) proved essential:
- `directives="required"` for fields like ConciseSummary that every template needs
- `directives="no-prompt"` and `value="..."` for preset fields in host-specific podcast templates
- This pattern enables future UI-driven field validation without template changes

### Card Fabric as Opt-In Partial
Moving Card Fabric from mandatory template content to an opt-in `{{> "Card Fabric"}}` partial was the right call. Most templates carry the commented-out reference (`{{!-- To include Card Fabric: {{> "Card Fabric"}} --}}`) as a reminder, keeping templates clean by default.

### Suggested Title Expressions
The `z2k_template_suggested_title` field with Handlebars expressions (e.g., `"{{BookTitle}} - {{AuthorNameOnly}}"`) provides immediate feedback during card creation. The built-in date helpers (`{{today}}`, `{{dateYearMonthName}}`, `{{yearQuarter}}`) are particularly useful for time-indexed domains like Logs and Journals.

---

## 2. Patterns That Are Suboptimal

### Personal Templates in the Default Library
Six Interactions templates (Amateur Hour, Conversation with Doug, etc.), PCT Trail Day, and Code Poem contain hardcoded personal names, locations, and privacy settings. These work for the vault owner but would break for any shared or published library. Future versions should separate personal templates into a user-override layer (e.g., `Templates/Personal/` or a separate vault overlay) while keeping the default library generic.

### Flame Fields Coupling
The Daily Log and Daily Journal templates contain extensive `{{Flame-*}}` field references tied to an external Google Forms/CSV import system (z2k-sheet-importer). These fields bypass `fieldInfo` declarations entirely and have no prompt, type, or validation metadata. This creates an opaque dependency — the template's rendering correctness depends on external automation that the template system has no visibility into. Consider:
- A `{{fieldInfo Flame-FieldName directives="external"}}` directive to declare external fields
- Documentation of the Flame field contract in the template or a linked spec

### Navigation Links (FLAGGED Items)
Multiple templates (Daily Log, Weekly Log, Monthly Log, Yearly Log, Daily Journal) had Templater-computed navigation links (yesterday/tomorrow, prev/next week, etc.) that have no v3 equivalent. These were flagged but not resolved. The Z2K Templates Plugin should consider adding date-offset helpers (e.g., `{{dateOffset today -1 "day"}}`) or a navigation link helper.

### Inconsistent Source Type Taxonomy
The `z2k_card_source_type` values across domains follow different naming conventions. Some use singular nouns (`Book`, `Podcast`), others use compound descriptors (`InternalThought`, `InternalMemories`, `ExternalArticle`). A future standardization pass should define a consistent taxonomy with clear naming rules.

---

## 3. Plugin Feature Gaps Discovered During Execution

### Date-Offset Navigation Links
**Priority: High.** Many Logs and Journals templates need links to previous/next entries (e.g., "Yesterday's Log", "Next Week"). Templater had `tp.date.now("YYYY-MM-DD", -1)`. The v3 plugin needs an equivalent — perhaps `{{dateOffset field days=-1}}` or `{{prevDay today}}`.

### Default Template Feature
**Priority: Medium.** The `(General)` suffix pattern (e.g., "Information (General).md") is a workaround for GH issue #182. Once the Default Template feature ships, these should be renamed to just the domain name or designated as the default via YAML configuration.

### Dot-Notation for Prompted Fields (BLK-001/004/005)
Dot-notation (e.g., `Content.Author`) was tested during Task 07 and confirmed working. However, its behavior in nested block partials and across partial boundaries should be more thoroughly documented.

### Conditional Rendering
Some v2 templates had sections that only appeared when certain fields were filled. The current v3 system has no `{{#if FieldName}}` conditional rendering. This would enable cleaner output for optional sections.

---

## 4. Structural Improvements for Future Library Versions

### Template Categorization Metadata
Add optional `z2k_template_category` (e.g., "Generic", "Personal", "Podcast", "Academic") and `z2k_template_tags` fields to template YAML. This would enable the plugin to group templates in the creation UI and support filtering.

### Block Template Documentation
Each block template should include a comment listing which document templates consume it. Currently there's no reverse mapping — if you change the Logistics block, you don't know which 12 templates are affected without searching.

### Domain-Level Template Index
Consider a `.template-index.md` or `.z2k-templates.yaml` file in each domain's Templates/ folder that lists all available templates with brief descriptions. This aids both human navigation and AI-assisted template selection.

### System Block Versioning
System blocks currently have no version field. If the domain metadata schema changes (e.g., adding a new rating dimension), there's no mechanism to detect which system blocks need updating. Consider adding `z2k_system_block_version` to system blocks.

---

## 5. Recommendations for Automating Library Updates

### Template Validation Script
Extend the current test suite (`test-structure.py`) into a permanent validation tool that runs on every vault sync:
- Verify all templates have required YAML fields
- Check that block partials referenced in templates actually exist
- Validate `z2k_card_source_type` values against a canonical registry
- Detect orphaned templates (files in Templates/ not referenced by any configuration)

### Migration Automation
For future v3.x → v3.y updates:
- A script that reads all templates, validates YAML, and updates `z2k_template_version` in bulk
- A diff tool that compares default library templates against user modifications to detect conflicts

### Continuous Integration
The command-queue testing approach (write JSON, wait, read output) could be wrapped in a CI pipeline that runs after every plugin or library update. The test infrastructure from Task 01 provides the foundation — it just needs a headless Obsidian runner or mock engine.

---

## Migration Statistics

| Metric | Value |
|---|---|
| Templates migrated from v2 | ~55 |
| New templates created for v3 | ~12 |
| Templates dropped (by design) | 2 |
| Block templates created | 13 |
| System blocks created | 14 (13 domain + 1 root) |
| System block stops created | 1 |
| Design decisions resolved | 5 (AI-PERSP, DSB-005, LOC-001, PROJ-YAML, Quotation eval) |
| FLAGGED items (unconvertible) | ~8 (navigation links, Templater date math) |
| Automated tests | 73 |
