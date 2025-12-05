

Emphasize that it is only for document tempaltes


## 1. The Three Stable States
Z2K’s lifecycle depends on **nouns**, not verbs. These file types endure across sessions, reloads, and user workflows. The life of any templated note must pass through these states.

  

### **1.1 Document Template**

  

A **Document Template** is a file whose content is intended to produce other files. It may be a normal .md file marked as a template via YAML, or a dedicated .template file. It contains:

- Fields expressed via Handlebars ({{name}}, {{date}}, etc.)
    
- Field-info blocks that describe prompting behavior
    
- Optional YAML defining system defaults, merging rules, or metadata
    
- Optional inclusion of partials and helper functions
    

  

Design is performed here: users craft the shape, constraints, expectations, and prompting model for downstream content.

  

### **1.2 WIP Content File**

  

A **WIP Content File** is produced whenever a template is instantiated but not finalized. It may contain:

- Resolved fields
    
- Unresolved fields
    
- Stale or incomplete field-info blocks
    
- System blocks inherited or merged from the template
    
- Additional content added by the user after instantiation
    

  

This state supports iterative refinement. It is the only state with a loop, because the “Continue Filling Note” action is defined to revisit, re-prompt, and re-resolve the remaining unresolved fields.

  

### **1.3 Finalized Content File**

  

A **Finalized Content File** contains no unresolved fields, no silent helpers, and no template semantics. It is pure Markdown. This is the terminal state.

---

## **2. Transitions**

  

Transitions are **verbs**. They modify a file’s state. The engine does not introduce new nouns at runtime; it only moves files from one state to another.

  

### **2.1 Design**

  

**Design** is the user action of constructing and modifying a Document Template. This involves selecting fields, writing prompt text, embedding helpers, and shaping output structure. The system observes but does not yet intervene.

  

### **2.2 Instantiate**

  

**Instantiate** converts a Document Template into a WIP Content File. This process:

- Prompts for required fields
    
- Auto-populates built-in fields
    
- Performs initial YAML merging
    
- Applies partials, helper functions, and conditional logic
    
- Leaves unresolved fields intact if flagged for deferred filling
    

  

Instantiation is executed via the prompting dialog. “Save For Now” corresponds directly to this transition.

  

### **2.3 Iterate**

  

**Iterate** revisits a WIP Content File. This is the only loop in the lifecycle. During iteration:

- Deferred fields are re-evaluated
    
- Newly available data sources (URIs, external JSON commands, built-ins) may resolve fields
    
- Missing fields may trigger the prompting dialog again
    
- Post-iteration, the file remains a WIP Content File unless fully resolved
    

  

Iteration is triggered through “Continue Filling Note.”

  

### **2.4 Finalize**

  

**Finalize** transforms a WIP Content File into a Finalized Content File. This involves:

- Applying miss-handling (e.g., default values, error strings, or removal)
    
- Removing all remaining field markers
    
- Removing silent helpers and system scaffolding
    
- Producing clean Markdown with no templating semantics
    

  

This is executed from the prompting dialog or via the Finalize command.

  

### **2.5 Instantiate + Finalize**

  

A compound transition where a Document Template becomes a Finalized Content File in one step. This happens when the user elects to finalize immediately during the initial prompting.

---

# **Lifecycle of a Template Overview**

---

## **sidebar_position: 10**

##   

## **doc_state: initial_ai_draft**

  

## **Overview**

  

This page summarizes the lifecycle’s structure and highlights how Z2K Templates uses staged transitions to support both quick-creation workflows and incremental, multi-session authoring.

  

### **Stages**

- **Document Template** — the authored specification.
    
- **WIP Content File** — instantiated but not resolved.
    
- **Finalized Content File** — resolved and stable.
    

  

### **Why This Model**

  

The separation between template, WIP, and finalized states mirrors the responsibilities of the underlying engine: parsing, prompting, merging, iterative re-evaluation, and final output.

  

![[overview-diagram.png]]

(Placeholder: High-level overview diagram.)

  

> [!DANGER]

> Validate stage naming consistency before publishing.

---

# **Initial Instantiation into a Content File**

---

## **sidebar_position: 20**

##   

## **doc_state: initial_ai_draft**

  

## **Initial Instantiation**

  

Instantiation is the system’s most complex transition because it ties together user prompting, YAML merging, and initial field resolution.

  

### **Parsing**

  

The engine reads the template, identifies fields, extracts field-info blocks, and compiles helper functions.

  

### **Prompting**

  

The prompting dialog requests values for required fields. Defaults may be prefilled by built-ins.

  

### **Rendering**

  

Once values are available, the template is rendered using the Handlebars engine. The output is written into a newly created WIP Content File.

  

### **YAML Merging**

  

Frontmatter is merged from multiple sources:

- User input
    
- Template YAML
    
- System defaults
    
- Partial or nested templates
    

  

The result is a WIP Content File that retains unresolved fields flagged for deferred resolution.

  

> [!DANGER]

> Clarify merging precedence rules for nested templates.

---

# **Deferred Field Resolution**

---

## **sidebar_position: 30**

##   

## **doc_state: initial_ai_draft**

  

## **Deferred Field Resolution**

  

Some fields are intended to remain unresolved at instantiation. These include:

- Fields whose values depend on future data sources
    
- Fields designed to be filled across multiple writing sessions
    
- Complex multi-step prompts
    

  

### **Why Defer**

  

Deferred resolution is central for journaling, multi-step workflows, or when field values depend on events that have not yet occurred.

  

### **Interaction with Iterate**

  

When Iterate is triggered, the system:

- Detects unresolved fields
    
- Re-evaluates field-info blocks
    
- Prompts again if required
    
- Renders updated field values
    

  

### **Reference**

  

See the dedicated page: [[Deferred Field Resolution]].

  

> [!DANGER]

> Determine final placement of detailed Deferred Field Resolution documentation.

---

# **Finalizing a File**

---

## **sidebar_position: 40**

##   

## **doc_state: initial_ai_draft**

  

## **Finalizing**

  

Finalization collapses the WIP state and produces the permanent output.

  

### **Miss-Handling**

  

Fields without values are resolved according to miss-handling rules: defaults, warnings, or removal.

  

### **Cleanup**

  

The engine removes:

- All remaining field markers
    
- Silent helpers
    
- Template metadata not relevant to content
    

  

### **Output**

  

A **Finalized Content File**, suitable for versioning, distribution, or archival.

  

> [!DANGER]

> Confirm finalize behavior with nested system blocks and recursive helpers.