---
sidebar_position: 100
sidebar_class_name: z2k-code
---

# Command - Name

## Overview


## Detailed Description of What It Does

    - Sets the [[z2k_template_type]] YAML Property to `content-file` (or potentially just removes the field from the YAML)
    - If the file currently has either a `.template` or `.block` file extension, it will rename it to be `.md`.
    - *Note:* If the file lives inside a template folder, you may still need to manually move it elsewhere.