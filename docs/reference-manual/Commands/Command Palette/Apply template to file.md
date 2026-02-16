---
sidebar_position: 30
sidebar_class_name: z2k-code
aliases:
- apply template to file
- apply template to note
- apply template to card
---
# Apply Template to File
Applies a template to a file that already exists in your vault. The template wraps around or merges with the existing content, adding structure and prompting for additional fields.

This command effectively applies a template *in-place* on an existing content file, and possibly then moving the file to a new folder if a new destination context was selected. 

> [!NOTE] Command Name
> This command appears as "Apply template to file," "Apply template to note," or similar variations depending on your [[File Naming in Commands|settings]].

## Availability
Available in the Command Palette when the **active file is a markdown file** (`.md`).

## What It Does
When you run this command on an existing file:

1. **Select a destination** – Choose a [[Destination Context]] (file type folder) for the file
2. **Select a template** – Choose a [[Types of Template Files#Document Templates|document template]] from that destination
3. **Fill in fields** – Provide values for any [[Template Fields]] in the template
4. **Merge content** – The template content wraps around your existing file content
5. **File is updated** – The file now has the template's structure with your original content preserved

If you select a different destination than the file's current location, the file will be **moved** to the new destination folder.

## When to Use It
This command is useful when:
- You have updated a template and wish to "reapply" to a content file that used a previous versions
- You created a quick note and now want to give it proper structure
- You're retroactively organizing files to match a template pattern
- You want to add YAML frontmatter and standard sections to an existing file

## How Existing Content Is Handled
The template determines where your original content appears:
- Templates can use `{{sourceText}}` to place existing content, or by default, the existing content is placed at the end of the file.
- YAML frontmatter from the existing file will by [[Merging Multiple YAML Sources|merged]] with the template (and any template blocks, system blocks and global blocks).
	- Thus, if you're template has been set up for [[Storing Field Values in YAML]], these values will be reused with the new template.

See [[Template Merging]] for details on how content combination works.

### Example Scenario - Quick Note to Structured Meeting
You jotted down some quick notes after a fateful introduction, making the quick note file on the day of the meeting (1957-07-06). The quick note file `Met Paul at the fete.md` contains:

```md file="Met Paul at the fete.md"
Interesting chap - plays guitar left-handed but upside down
Knows all the words to Twenty Flight Rock
Maybe we could write some songs together?
Ivan introduced us
```

Your **Meeting Notes** template looks like this:

```handlebars
---
date: {{fileCreationDate}}
attendees: {{attendees}}
location: {{location}}
type: meeting
---
# {{fileTitle}} – {{fileCreationDate}}

## Attendees
{{attendees}}

## Notes
{{sourceText}}

## Follow-up
{{followUp}}
```

Running **Apply template to file** and selecting the "Meeting Notes" template, you then get prompted for a number of fields: `attendees`, `location`, `followUp` and `fileTitle`. After filling those in, the existing content file is now transformed into a structured content file:

```md
---
date: 1957-07-06
attendees: Paul McCartney, Ivan Vaughan
location: St. Peter's Church, Woolton
type: meeting
---
# Met Paul at the fete – 1957-07-06

## Attendees
Paul McCartney, Ivan Vaughan

## Notes
Interesting chap - plays guitar left-handed but upside down
Knows all the words to Twenty Flight Rock
Maybe we could write some songs together?
Ivan introduced us

## Follow-up
Invite him to join the Quarrymen
```

> [!TIP] File Creation Date
> Notice how `{{fileCreationDate}}` captures when the original quick note was created – not when the template was applied. This preserves the actual meeting date even if you're organizing notes weeks later.

### Example Scenario - Upgrading a Templated File
You can also use this command to "upgrade" a file that was already created from a template. This is useful when:
- You've improved a template and want existing files to use the new structure
- You want to migrate files to a new organizational pattern

This works because Z2K Templates allows templates to [[Storing Field Values in YAML|store field values in YAML frontmatter]]. When you apply a new template, those stored values are automatically reused.

**Original file** (created from v1 of your "Person - Historical" template):

```md
---
name: Ada Lovelace
role: Mathematician
notes: "Pioneer of computing"
---
# Ada Lovelace

Role: Mathematician

## Notes
Pioneer of computing

Ada is the answer to the question "Which historical scientist would you like to meet?"
```

**New template** (v2, with added sections):

```handlebars
---
name: {{name}}
role: {{role}}
era: {{era}}
---
# {{name}}

**Role:** {{role}}
**Era:** {{era}}

## Biography
{{bio}}

## Contributions
{{sourceText}}
```

After applying the new template, the stored `name` and `role` values are pre-filled. You only need to enter the new fields (`era`, `bio`), and the original content flows into `{{sourceText}}`. 

You will still need to manually delete the portions of the old content file at the end of the file that have been duplicated - but at least the job of upgrading a file to a new template has been made easier.

## Tips
- Use Obsidian's file history features (available with Obsidian Sync) to restore a file if a template application fails. 

## Related Commands
- [[Create New File]] – Create a new file from scratch with a template
- [[Continue Filling File]] – Resume filling deferred fields in any templated file


> [!DANGER]
> - `{{fileCreationDate}}` is a proposed built-in field – see [GitHub issue #133](https://github.com/z2k-studios/z2k-plugin-templates/issues/133). Verify if implemented before publishing.
> - Confirm both of these examples work! 
