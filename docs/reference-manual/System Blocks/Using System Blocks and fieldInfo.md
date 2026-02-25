---
sidebar_position: 30
aliases:
- System Blocks and fieldInfo
- Z2K System Blocks and fieldInfo
- Z2K System Block Templates and fieldInfo
---
# Using System Blocks and fieldInfo
The [[fieldInfo Helper]] allows you to control how fields are prompted for and behave within [[Template Files]]. By moving your `{{fieldInfo}}` calls into system blocks, you configure fields across many templates at once — and adapt their behavior based on which folder they are in.

The [[Global Block]] does this vault-wide. System blocks do it folder by folder — the same field can carry different values at different depths of your vault hierarchy. That scoped control is the key advantage system blocks offer over the global block.

> [!NOTE] Intentional Collisions
> Using System Blocks with fieldInfo will likely (and intentionally) cause metadata value collisions for fields. Collisions are by design made to result in useful resolution for hierarchical structures. Please see [[Field Data Sources#Field Metadata Resolution|Field Info Metadata Collision Resolution]] for more details.


## Use Case: Customized Field Prompting Across Templates
Did you know that if a field was given a `{{fieldInfo}}` specification, but was otherwise never used elsewhere, it will not be prompted for?  Knowing this tidbit, you can use a System Block template to pre-feed prompting instructions for a wide range of fields used in a folder and all of its subfolders. Then, any field that is not used in a template will just be ignored. Any field that is redefined by subsequent field infos inside actual template files will override these "default" prompting directives. 

```handlebars file=".system-block.md"
{{! The following fieldInfos just provide premade prompting texts for         }}
{{! frequently used fields. Individual templates can override these as needed. }}
{{fieldInfo Title "What is the title for this information source?"}}
{{fieldInfo Importance "Why is this information important to me?"}}
{{fieldInfo Relevance "When will I need to see this information again?"}}
```

This opens a whole world of uses for system blocks - please see the [[Global Block]] section for more use cases (the Global Block behaves very similarly to System Blocks).

## Use Case: Setting Field Values Based on Hierarchical Location
 it is possible to use the [[fieldInfo value]] parameter to feed a value into a field that can be referenced elsewhere. Further, by setting this value to different values within the hierarchy with different System Blocks, you can adapt the value of a field accordingly. 

Take for instance a vault with the following vault structure:

```text
my-vault/                           ← Root Vault Folder
├── .system-block.md
├── Z2K/
│   ├── .system-block.md
│   ├── Source Details.block
│   ├── Thoughts/
│   │   ├── .system-block.md
│   ├── Information/
│   │   ├── .system-block.md
│   │   ├── New Data.template
└── ...
```

Inside the root `my-vault/.system-block.md` you have:
```handlebars file=".system-block.md"
{{fieldInfo DataDomain value="Unknown"}}
```

And inside the `my-vault/Z2K/Information/.system-block.md` you have
```handlebars file="my-vault/Z2K/Information/.system-block.md"
{{fieldInfo DataDomain value="Information"}}
```

Then, you now have a location-aware field that can be referenced by your templates. For instance, imagine a "Source Details" block template:

```handlebars file="my-vault/Z2K/Source Details.block"
# Source Details
- Data Domain: {{DataDomain}}

```


in the Template File `my-vault/Z2K/Information/New Data.template`, you can have:

```handlebars file="my-vault/Z2K/Information/New Data.template"
{{< "../Source Details.block"}}
```

When this template is instantiated into a new content file, it will correctly resolve the localized `{{DataDomain}}` field:

```handlebars file="my-vault/Z2K/Information/Instantiated File.md"
# Source Details
- Data Domain: Information

```

For the vault-wide equivalent of this pattern using the global block, see [[Global Block and Field Values]]. To create new fields that resolve silently without a system block, see [[Custom Built-In Fields]].

> [!DANGER] NOTES
> - **What happens in unaddressed folders**: In the example above, templates inside `Z2K/Thoughts/` have a system block but no `DataDomain` override. Verify whether they inherit from `my-vault/.system-block.md` (value: `"Unknown"`) or produce an empty field. Clarify the inheritance behavior and add a note if needed.
> - **Page completeness**: This page covers two use cases. Consider whether additional use cases warrant documentation — e.g., using system blocks to set `type`, `options`, or other `fieldInfo` parameters (not just `value`) in a folder-scoped way.
