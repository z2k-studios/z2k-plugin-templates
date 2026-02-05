---
sidebar_position: 20
aliases:
- System Blocks Use Cases
- System Block Uses
---
# What are System Blocks Used For?
Z2K Templates supports the concept of "System Block Templates" (aka "System Blocks") - special block templates that is inserted into every new card created with Z2K Templates. 

Using System Blocks, you can:
- Ensure that certain YAML fields are used consistently throughout the entire vault (or subsections) 
	- see [[Using System Blocks and YAML]]
- Ensure that certain `field-info` is consistently defined within the entire vault (or subsections) 
	- see [[Using System Blocks and field-info]]
- Specify a common header of text to include at the top of every markdown file 
	- see [[Using System Blocks and Markdown]]


## Common Use Cases

### Vault-Wide Header Content
Add standard markdown content to be included at the top of every generated file:

```handlebars file=".system-block.md"
> *Notice: This note originates as part of the Second Brain of {{creator}}.*

```

### Global Metadata
Ensure every document includes certain required metadata:

```yaml file=".system-block.md"
---
vault: My Vault
version: 1.0 
---
```

### Standard Tags
Apply default tags to all generated documents:

```yamls file=".system-block.md"
---
tags:
  - generated-by/z2k-templates
---
```

### Required Fields
Define fields that should appear in every template:

```handlebars file=".system-block.md"
{{field-info author default="{{creator}}"}}
{{field-info dataType setValue="Information"}}
{{field-info assumeVoiceIs setValue="AI"}}
```

