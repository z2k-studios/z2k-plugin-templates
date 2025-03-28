(claude, verified)


# Z2K Obsidian Plugin Specification

## Core Functionality
1. Create new cards using templates with the following commands:
   - "New Thought..."
   - "New Memory..."
   - And other card types

2. Context-sensitive commands:
   - When text is selected: "Create Thought From Text", "Create Memory from Text", etc.
   - When a file in root folder is loaded: "Convert Quick Note to New Thought", etc.

3. Template organization:
   - Templates to be moved into each atom folder as a subfolder (e.g., "Interactions\Templates")
   - Remove "Atom" portion from template filenames

## Template Field System
- Uses a Handlebars-inspired syntax with `{{field}}` notation
- Supports both raw and escaped text modes

### Field Types:
- Regular fields: `{{fieldName}}`
- Date/time fields with formatting: `{{date:YYYY-MM-DD}}`
- Fields with default values
- Optional fields

### Interface Requirements:
- Scrollable form to collect field values when creating from template
- Field for card title (potentially as YAML value)
- Support for required vs. optional fields

## Architecture Considerations:
- Field replacement routines need to be accessible to other plugins
- Potential for advanced Handlebars features (conditionals)
- Need for handling dynamic updating of default answers containing field references
- Possibility to use React for a more sophisticated UI

## Open Questions:
1. Default handling for missing fields
2. Raw vs. escaped text as default
