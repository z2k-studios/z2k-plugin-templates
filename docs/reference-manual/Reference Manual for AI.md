---
title: Manual for AI
sidebar_position: 200
---

Do you want your AI to help you write templates for you? Point them to this page for a condensed reference manual that fits in a single document. 

---  
  

> [!DANGER] Needs Updating
> This is an early revision of the Template Engine Spec and will need updating. 


## Z2K Templates Plugin - Condensed Reference Manual


### 1. Core Concepts

  

The Z2K Templates Plugin is designed to handle template fields within Obsidian, with extended functionality beyond Obsidian's native template system. It is built on [handlebars.js](https://handlebarsjs.com). Key concepts include:

  

- **Template Fields**: Placeholders (using `{{field}}` syntax) embedded in templates that get replaced with actual content

- **Field Types**:

- User Specified Fields (e.g., `{{BookTitle}}`)

- Built-in Fields (automatically filled by the system, e.g., `{{today}}`)

  

### 2. Benefits of the Template System

  

- Creates uniform/consistent documentation

- Improves content consumption efficiency

- Enhances AI compatibility

- Enables search/replace scripts for updating

- Improves compatibility with data tools like Obsidian Dataview

  

### 3. Field Naming Conventions

  

- No spaces in field names

- Built-in fields start with lowercase (e.g., `{{weekNum}}`)

- User-specified fields start with uppercase (e.g., `{{BookAuthor}}`)

- Special characters have functional meanings:

- Space: Helper functions

- Colon: Date formatting

- Pipe: User querying prompts

- Period: JSON hierarchical data

- Less than: Partial templates

- Parentheses: Nested helper functions

- Tilde: External whitespace trimming

  

### 4. Built-in Fields

  

The system includes several categories of built-in fields:

- **Date and Time**: `{{date}}`, `{{time}}`, `{{today}}`, `{{yesterday}}`, `{{tomorrow}}`, `{{timestamp}}`, etc.

- **Card Data**: `{{title}}`, `{{cardTitle}}`, `{{cardAtom}}`, `{{cardTemplateName}}`, etc.

- **Card References**: `{{todayLog}}`, `{{yesterdayJournal}}`, `{{creatorRootCard}}`, etc.

  

### 5. Helper Functions

  

Z2K provides various built-in helper functions:

  

**Formatting Helpers**:

- `format-date`: Format dates with Moment.js patterns

- `format-string`: Add text around field values with placeholder

- `format-string-to-upper`: Convert to uppercase

- `format-string-to-lower`: Convert to lowercase

- `format-string-spacify`: Convert camelCase to spaced text

- `format-string-trim`: Remove whitespace

- `format-string-raw`: Prevent markdown escaping

- `format-string-bulletize`: Create bullet lists

- `format-number`: Format numbers using Numeral.js

- `format-number-toFixed`: Format to fixed decimal places

  

**Linking Helpers**:

- `wikilink`: Create Obsidian wiki links

- `wikilink-named`: Create wiki links with custom display text

- `url`: Format as URL

- `url-named`: Create named URLs

  

**Prompting Helpers**:

- `clear`: Clear field if no data provided

- `preserve`: Keep field if no data provided

- `no-prompt`: Don't prompt user for this field

- `required`: Mark field as required

  

**Misc Helpers**:

- `geocontext-basic`: Format geographic context

  

### 6. Data Formatting

  

Default formatting rules:

- Text fields preserve whitespace by default (can be trimmed with helper)

- By default, markdown characters are escaped in text fields

- Date/time fields use default formats "YYYY-MM-DD" and "HH:mm"

  

Custom formatting options:

- Handlebars whitespace control with tilde `~`

- Obsidian-compatible date formatting with colon syntax: `{{date:YYYY-MM}}`

- Dedicated helper functions for advanced formatting

  

### 7. Handlebars Compatibility

  

Supported Handlebars features:

- Nested input objects for JSON data

- Whitespace control

- Helper functions (built-in)

- Nested helper functions

- Template comments

- Partials for reusable components

  

Unsupported Handlebars features:

- Conditionals and other block helpers

- Custom helper functions

- Some advanced block features

  

Z2K differences from Handlebars:

- Output is Markdown, not HTML (affects escaping)

- Missing fields remain in template instead of being removed

- Additional advanced expressions specific to Z2K

  

### 8. Advanced Expressions

  

Z2K supports several advanced expression types:

  

**User Prompting**:

- Format: `{{FieldName|dataType|Prompt text|Default Answer|Miss Expression}}`

- Supported data types:

- `number`: Numeric input only

- `date`: Date picker

- `boolean`: Checkbox

- `singleSelect:`: Dropdown with single selection

- `multiSelect:`: Dropdown with multiple selection

- Default answers can include other template fields

- Miss expressions specify what to use if field is skipped

  

**JSON Data Handling**:

- Templates can receive external JSON data

- Dot notation access: `{{person.lastname}}`

- JSON data is used before prompting user

  

**Comment Fields**:

- Format: `{{! This is a comment }}`

  

**Nested Helpers**:

- Format: `{{helper1 (helper2 fieldname)}}`

- Allows for chaining of operations

  

**Partial Templates**:

- Format: `{{< partialTemplateFile.md}}`

- Allows inclusion of reusable template components

- Partial templates may contain their own YAML settings

  

### 9. Miss Handling

  

When a field lacks data during processing ("miss"), Z2K offers several handling options:

  

**Default Behavior**: Fields without data remain unchanged in the output file

  

**Override Options**:

1. **Default Answer**: If a field has a default answer in prompt syntax, it's used upon miss

2. **Global YAML Setting**: Set `z2k_template_default_miss_handling` to:

- `preserve`: Keep fields as-is (default)

- `clear`: Remove fields without data

3. **Helper Functions**: Individual fields can override global setting with:

- `clear`: Remove field if no data

- `preserve`: Keep field if no data

  

### 10. YAML Configuration

  

Template files can include YAML frontmatter with Z2K-specific settings:

  

**Miss Handling**:

```yaml

z2k_template_default_miss_handling: preserve|clear

```

  

**Default Prompt**:

```yaml

z2k_template_default_prompt: "Please specify the value of {{FieldName}}"

```

  

**Title**:

```yaml

z2k_template_title: "{{BookTitle|text|Book Title||preserve}} - {{BookAuthor}}"

```

  

### 11. Implementation Priorities

  

**Required Features (R1)**:

1. Basic field replacement

2. Prompting functionality

3. Built-in fields

4. Basic miss handling

  

**Future Releases**:

- R2: Most of the built-in helper functions

- R3+: JSON data handling, advanced miss handling

  

## Architecture Recommendations

  

Based on the specification, I recommend the following architecture:

  

### 1. Core Components

  

**Template Parser**:

- Parse template text into tokens

- Identify field expressions and their components

- Support nested expressions and special syntax

  

**Field Registry**:

- Register and manage built-in field providers

- Interface for field resolution

  

**Helper Function Registry**:

- Register and manage built-in helpers

- Support for helper function composition

  

**Prompting System**:

- Parse prompting syntax

- Generate appropriate UI based on data type

- Handle default values and miss expressions

  

**Field Resolution Engine**:

- Resolve fields in correct order (JSON → built-in → user input)

- Apply formatting and helper functions

- Handle misses according to configuration

  

**Template Processor**:

- Coordinate the overall template processing

- Multi-pass processing for resolving dependencies

- YAML configuration handling

  

### 2. Implementation Approach

  

I recommend a modular approach with clear interfaces between components:

  

1. **Start with Core Field Resolution**:

- Basic field replacement

- Built-in field providers

- Simple prompting

  

2. **Add Helper Functions**:

- Implement the most critical helpers first

- Create a pluggable helper system

  

3. **Implement Advanced Features**:

- Miss handling

- JSON data integration

- Partial templates

  

### 3. Technical Considerations

  

1. **Handlebars Integration**:

- Consider using a modified Handlebars library to leverage existing parsing

- Extensions needed for Z2K-specific features

  

2. **Field Resolution Strategy**:

- Clear determination of precedence for field values

- Multi-pass resolution for interdependent fields

  

3. **Testing Framework**:

- Create a comprehensive test suite

- Use the provided fiddle for quick testing: https://jsfiddle.net/76484/bpoezqga/

  

4. **Performance Considerations**:

- Optimize for templates with many fields

- Efficient parsing for large templates

  

## Next Steps

  

1. **Create Core Interfaces**:

- Define interfaces for field providers, helpers, and formatters

- Establish the template processing pipeline

  

2. **Implement Minimal Viable Product**:

- Basic field replacement

- Critical built-in fields

- Simple prompting

  

3. **Add Testing Framework**:

- Comprehensive tests for each component

- Integration tests for full template processing

  

4. **Implement Priority Features**:

- Follow the prioritization guidance in the developer notes

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

## Z2K Template Field Processing

  

1. **Parse Template**

- Split the template into plain text and field expressions

- Identify field expressions by matching `{{...}}` pairs, handling nesting correctly by tracking depth

  

2. **Process Each Field Expression**

- Start with the `rawExpression` containing the entire contents between `{{` and `}}`

- Identify any Z2K-formatted fields within the expression using pattern matching

- Z2K fields follow pattern: `FieldName(#directive)*(|dataType)?(|Prompt)?(|Default)?(|Miss)?`

  

3. **Extract Z2K Metadata**

- Field name: The identifier before any `#` or `|`

- Directives: Any `#directive` flags (`#clear`, `#preserve`, etc.)

- Data type: Information after first `|` (if present)

- Prompt text: Text after second `|` (if present)

- Default value: Value after third `|` (if present)

- Miss expression: Value after fourth `|` (if present)

  

4. **Transform for Handlebars**

- Generate `handlebarsReadyExpression` by replacing Z2K formatted fields with simple `FieldName` references

- Preserve all other Handlebars syntax (helpers, conditionals, etc.)

- Store the metadata separately for use in your prompt system

  

5. **Gather Field Values**

- Use your prompt system to collect user input for each field based on stored metadata

- Build a context object mapping field names to their resolved values

  

6. **Process with Handlebars**

- Run Handlebars using the `handlebarsReadyExpression` and context object

- Apply any custom helpers as needed