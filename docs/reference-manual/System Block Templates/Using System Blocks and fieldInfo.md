---
sidebar_position: 30
aliases:
- System Blocks and fieldInfo
- Z2K System Blocks and fieldInfo
- Z2K System Block Templates and fieldInfo
---
# Using System Blocks and fieldInfo
The [[fieldInfo Helper]] Allows you to control how fields are prompted for and behave within [[Template Files]]. By moving your `{{fieldInfo}}` helper function calls into system blocks, you allow for frequently used fields to be configured across many templates, and even adapted based on which folders they are in. It's a powerful combination. 


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
