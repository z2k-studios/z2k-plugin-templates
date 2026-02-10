---
sidebar_position: 10
sidebar_class_name: z2k-code
aliases:
- create new file
- create new note
- create new card
---
# Create new file
Creates a new file in your vault using a [[Types of Template Files#Document Templates|document template]]. This is the primary command for generating templated content.

> [!NOTE] Command Name
> This command appears as "Create new file," "Create new note," or "Create new card" depending on your [[File Naming in Commands|settings]].

## Availability
Always available in the Command Palette.

## What It Does
When you run this command:

1. **Select a destination context** – A modal appears showing available [[Destination Context|destination contexts]] (destination folders). Choose where in your vault the new file should be created.
2. **Select a template** – A second modal shows [[Types of Template Files#Document Templates|document templates]] available for that destination context. Pick the template to use.
3. **Fill in fields** – If the template contains [[Template Fields]], you'll be prompted to provide values for each one using the [[Prompting Interface|prompting interface]].
4. **File is instantiated** – The new file appears in your vault with the template content and your field values inserted. See [[Template Lifecycle Overview]] for the meaning instantiation and finalization. 

![[CreateNewFile-SelectFileType.png]]
*(Screenshot: File type selection modal)*

![[CreateNewFile-SelectTemplate.png]]
*(Screenshot: Template selection modal)*

## Why Ask for Destination First Then Template?
Asking for the destination before the template points to a fundamental design decision for Z2K Templates. The destination folder is more than just a folder to receive a file, but points to the [[Destination Context|context]] of the content you wish to create. Then, [[Template Folder Hierarchies|based on that content]], the plugin will present the available set of templates that are relevant to that context using [[Template Folder Hierarchies]]. Specifically, templates in [[Template Folders]] along the path from the destination to the [[Template Folders#Template Root Folder|templates root folder]] appear - see [[Template Discovery]] for the full algorithm.

## Example Workflow
Here is a typical way to create a new file from a template
1. Press `Ctrl/Cmd + P` to open the Command Palette
2. Type "Create new" and select **Z2K Templates: Create new file**
3. Choose "People" as the destination folder
4. Select "Person – Contact" as the template
5. Enter values when prompted: Name → "Ada Lovelace", Role → "Mathematician"
6. A new file `Ada Lovelace.md` appears in `People/` with your data filled in

## Tips
Here are some tips for making this most important command even easier to use:
- Assign this command to `Ctrl/Cmd + N` to replace Obsidian's default new note behavior
- You can also right click on a folder in the folder view and use the [[Create new file here]] command to skip the destination context query.
- If no templates appear, check that you have [[Template Folders]] configured correctly
- For frequently-used templates, consider setting up [[Quick Create Commands]] instead

## Related Commands

- [[Create file from selected text]] – Same workflow, but passes selected text to the template
- [[Apply template to file]] – Apply a template to a file that already exists



> [!DANGER]
> - Confirm the exact modal titles shown in the UI
> 	- Did it get updated to "Destination Context" and if so, update the screen shot?

