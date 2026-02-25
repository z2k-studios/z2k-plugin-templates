---
sidebar_position: 10
aliases:
- use template file extensions
- template file extensions enabled
- enable template file extensions
---
# Use Template File Extensions
Enables the `.template` and `.block` file extensions across the plugin. When on, template conversion commands will change the file extension in addition to setting the template type.

- **Default:** Off
- **Type:** Toggle

When this setting is **off**, all templates remain `.md` files – they live alongside your regular notes and are visible in Obsidian's file explorer, search, and graph view like any other file.

When this setting is **on:**
- Template conversion commands (e.g., [[Convert to Document Template]], [[Convert to Block Template]]) change file extensions to `.template` or `.block`
- The [[Make .template and .block templates visible-hidden]] command becomes available
- The [[Template Files Visible in File Explorer]] setting appears in the panel below this toggle

## Disabling Warning
If you turn this setting **off** while `.template` or `.block` files exist in your vault, the plugin shows a confirmation dialog. It recommends converting those files back to `.md` first – otherwise they remain in their custom extension and are not easily editable inside Obsidian.
