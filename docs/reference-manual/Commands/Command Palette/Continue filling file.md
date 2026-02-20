---
sidebar_position: 40
sidebar_class_name: z2k-code
aliases:
- continue filling file
- continue filling note
- continue filling card
---
# Continue Filling File
Resumes the prompting process for a file that has unfilled [[Template Fields]]. Use this when you [[Deferred Field Resolution|deferred]] fields during initial creation or when you want to complete a partially-filled template.

> [!NOTE] Command Name
> This command appears as "Continue filling file," "Continue filling note," or "Continue filling card" depending on your [[File Naming in Commands|settings]].

## Availability
Available in the Command Palette when the **active file is a markdown file** (`.md`).

## What It Does
When you run this command:

1. **Scan for unfilled fields** – The plugin identifies any remaining `{{field}}` placeholders in the file
2. **Prompt for values** – You're prompted for each unfilled field via the [[Prompting Interface]].
3. **Insert values** – Each field is replaced with the value you provide. 
4. **Repeat as needed** – Run the command again if you defer more fields or if new fields remain.

## Understanding Deferred Fields
[[Deferred Field Resolution]] allows you to skip field prompts during file creation. When you skip a prompt, the `{{field}}` placeholder remains in the file. This command lets you come back later to fill those fields.

### Why Defer Fields?
- **Capture now, detail later** – Create the file quickly, fill metadata when you have time
- **Progressive disclosure** – Fill basic fields first, advanced fields as the file matures
- **Batch workflows** – Create multiple files, then fill common fields across all of them
- **Unknown Data** – Not all data is known when a file is created. You can defer the unknown fields for a later date.

## Example Workflow
An example of a workflow for tracking tasks:
1. Create a new file for a task using [[Create New File]]
2. When prompted for `{{dueDate}}`, click **Skip** – the field remains as `{{dueDate}}`
3. Later, open the file and run **Continue Filling File**
4. You're prompted for `{{dueDate}}` again – this time enter "2024-02-01"
5. The file now shows "2024-02-01" where `{{dueDate}}` was

## Tips
- Run this command multiple times if you keep deferring – each run catches remaining fields
- Combine with the [[fieldInfo Helper]] to control which fields can be deferred
- Use [[Fallback Behavior]] to set default values for fields you frequently skip
- If you are done, use the [[Finalization|Finalize]] command to remove all remaining fields.

## Related Commands
- [[Create New File]] – Initial file creation where deferral begins
- [[Finalize file]] – Finalizes a file to remove all remaining unknown fields
- [[Insert Block Template]] – Block templates can also have deferred fields


