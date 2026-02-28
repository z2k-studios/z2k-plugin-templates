---
sidebar_position: 10
aliases:
- Fields and Helpers
- Variable Reference
- Helper Reference
- Full Variable and Helper Reference
---
# Fields & Helpers
A quick-reference index of every built-in field and helper function in Z2K Templates. Click any reference link for full documentation.

## Contents
- [[#Built-In Fields]]
  - [[#Date & Time]]
  - [[#File Data]]
  - [[#Template Data]]
  - [[#Misc]]
  - [[#Z2K System]]
- [[#Built-In Helper Functions]]
  - [[#fieldInfo Helpers]]
  - [[#Formatting]]
  - [[#Linking]]
  - [[#Math]]
  - [[#Misc Helpers]]

---

## Built-In Fields
Fields that are automatically populated by the plugin — no user input required. Use them anywhere in a template with `{{fieldName}}`.

### Date & Time

| Field | Reference | Description |
|-------|-----------|-------------|
| `{{date}}` | [[date]] | Today's date (`YYYY-MM-DD`) |
| `{{today}}` | [[today]] | Today's date — alias for `{{date}}` |
| `{{yesterday}}` | [[yesterday]] | Yesterday's date |
| `{{tomorrow}}` | [[tomorrow]] | Tomorrow's date |
| `{{time}}` | [[time]] | Current time (`HH:mm`) |
| `{{utcTime}}` | [[utcTime]] | Current time expressed in UTC |
| `{{now}}` | [[now]] | Full date and time (long format) |
| `{{timestamp}}` | [[timestamp]] | Zettelkasten timestamp (`YYYYMMDDHHmmss`) |
| `{{dayOfWeek}}` | [[dayOfWeek]] | Current day name (e.g. `Friday`) |
| `{{weekNum}}` | [[weekNum]] | ISO week number |
| `{{year}}` | [[year]] | Current year |
| `{{yearWeek}}` | [[yearWeek]] | Year and ISO week (`YYYY-[w]WW`) |
| `{{yearMonth}}` | [[yearMonth]] | Year and month (`YYYY-MM`) |
| `{{yearMonthName}}` | [[yearMonthName]] | Year, month number, and month name |
| `{{yearQuarter}}` | [[yearQuarter]] | Year and quarter (`YYYY-[Q]Q`) |

### File Data

| Field | Reference | Description |
|-------|-----------|-------------|
| `{{fileTitle}}` | [[fileTitle and Variations\|fileTitle]] | Name of the content file being created |
| `{{cardTitle}}` | [[fileTitle and Variations\|cardTitle]] | Alias for `{{fileTitle}}` |
| `{{noteTitle}}` | [[fileTitle and Variations\|noteTitle]] | Alias for `{{fileTitle}}` |
| `{{creator}}` | [[creator]] | Creator name from plugin settings |
| `{{fileCreationDate}}` | [[fileCreationDate]] | File creation date (`YYYY-MM-DD`) |

### Template Data

| Field | Reference | Description |
|-------|-----------|-------------|
| `{{templateName}}` | [[templateName]] | Filename of the template used |
| `{{templateVersion}}` | [[templateVersion]] | Version of the template (if defined in YAML) |
| `{{templateAuthor}}` | [[templateAuthor]] | Author of the template (if defined in YAML) |

### Misc

| Field | Reference | Description |
|-------|-----------|-------------|
| `{{clipboard}}` | [[clipboard]] | Current contents of the system clipboard |
| `{{sourceText}}` | [[sourceText]] | Bulk text passed into the template at creation |

### Z2K System
These fields are specific to vaults built on the [[The Z2K System|Z2K System]].

| Field | Reference | Description |
|-------|-----------|-------------|
| `{{todayLog}}` | [[Built-In Fields - Z2K System\|Z2K System]] | Today's log file name |
| `{{yesterdayLog}}` | [[Built-In Fields - Z2K System\|Z2K System]] | Yesterday's log file name |
| `{{tomorrowLog}}` | [[Built-In Fields - Z2K System\|Z2K System]] | Tomorrow's log file name |
| `{{todayJournal}}` | [[Built-In Fields - Z2K System\|Z2K System]] | Today's journal file name |
| `{{yesterdayJournal}}` | [[Built-In Fields - Z2K System\|Z2K System]] | Yesterday's journal file name |
| `{{tomorrowJournal}}` | [[Built-In Fields - Z2K System\|Z2K System]] | Tomorrow's journal file name |
| `{{creatorRootCard}}` | [[Built-In Fields - Z2K System\|Z2K System]] | Name of the root creator card |
| `{{inboxCard}}` | [[Built-In Fields - Z2K System\|Z2K System]] | Name of the inbox card |
| `{{cardInitialDomain}}` | [[Built-In Fields - Z2K System\|Z2K System]] | Initial domain of the current card |
| `{{cardType}}` | [[Built-In Fields - Z2K System\|Z2K System]] | Z2K card type |
| `{{cardSourceType}}` | [[Built-In Fields - Z2K System\|Z2K System]] | Z2K card source type |

---

## Built-In Helper Functions
Helper functions perform operations on field data. Syntax: `{{helperName field param ...}}`.

### fieldInfo Helpers
Silent helpers that declare field metadata. See [[fieldInfo Helper]] for full parameter documentation.

| Helper | Reference | Description |
|--------|-----------|-------------|
| `{{fieldInfo}}` | [[fieldInfo Helper\|fieldInfo]] | Declares field type, prompt, fallback, and directives — no output |
| `{{fieldOutput}}` | [[fieldOutput Helper Variation\|fieldOutput]] | Same as `fieldInfo`, but also outputs the field value |
| `{{fi}}` | [[fi Helper Variation\|fi]] | Abbreviated form of `{{fieldInfo}}` |
| `{{fo}}` | [[fo Helper Variation\|fo]] | Abbreviated form of `{{fieldOutput}}` |

### Formatting

| Helper | Reference | Description |
|--------|-----------|-------------|
| `{{formatDate}}` | [[formatDate]] | Formats a date with a Moment.js format string |
| `{{formatNumber}}` | [[formatNumber]] | Formats a number with a format string |
| `{{formatNumberToFixed}}` | [[formatNumberToFixed]] | Formats a number to a fixed number of decimal places |
| `{{formatString}}` | [[formatString]] | Wraps or prepends/appends text to a string |
| `{{formatStringToUpper}}` | [[formatStringToUpper]] | Converts a string to all caps |
| `{{formatStringToLower}}` | [[formatStringToLower]] | Converts a string to all lowercase |
| `{{formatStringSlugify}}` | [[formatStringSlugify]] | Converts a string to a URL-friendly slug |
| `{{formatStringEncodeURI}}` | [[formatStringEncodeURI]] | Encodes a string for use in a URI |
| `{{formatStringEncodeBase64}}` | [[formatStringEncodeBase64]] | Encodes a string as Base64 |
| `{{formatStringSpacify}}` | [[formatStringSpacify]] | Converts a CamelCase or collapsed string to one with spaces |
| `{{formatStringCommafy}}` | [[formatStringCommafy]] | Renders a multi-select list as comma-separated values |
| `{{formatStringTrim}}` | [[formatStringTrim]] | Removes leading and trailing whitespace |
| `{{formatStringRaw}}` | [[formatStringRaw]] | Outputs a string without markdown character escaping |
| `{{formatStringBulletize}}` | [[formatStringBulletize]] | Converts multi-line text into a bulleted list |
| `{{formatStringFileFriendly}}` | [[formatStringFileFriendly]] | Strips characters that are invalid in filenames |

### Linking

| Helper | Reference | Description |
|--------|-----------|-------------|
| `{{wikilink}}` | [[wikilink]] | Wraps a field value in Obsidian `[[double brackets]]` |
| `{{hashtag}}` | [[hashtag]] | Formats a string as an Obsidian hashtag |
| `{{url}}` | [[url]] | Formats a field as a clickable URL |
| `{{google}}` | [[google]] | Generates a Google search link for the field value |
| `{{chatGPT}}` | [[chatGPT]] | Generates a ChatGPT link for the field value |
| `{{wikipedia}}` | [[wikipedia]] | Generates a Wikipedia search link for the field value |

### Math

| Helper | Reference | Description |
|--------|-----------|-------------|
| `{{add}}` `{{subtract}}` `{{multiply}}` `{{divide}}` | [[Arithmetic Operators]] | Basic arithmetic operations |
| `{{calc}}` | [[calc]] | Evaluates a mathematical expression string |
| `{{dateAdd}}` | [[dateAdd]] | Adds a duration to a date field |
| `{{random}}` | [[random]] | Returns a random item from an array |

### Misc Helpers

| Helper | Reference | Description |
|--------|-----------|-------------|
| `{{eq}}` `{{ne}}` `{{lt}}` `{{lte}}` `{{gt}}` `{{gte}}` | [[Comparison Operators]] | Comparison operators for use in `{{#if}}` conditions |
| `{{arr}}` | [[arr]] | Creates an array from a list of arguments |
| `{{obj}}` | [[obj]] | Creates an object from named key-value parameters |
| `{{toNumber}}` `{{toBool}}` `{{toString}}` | [[Type Conversion Helpers]] | Converts a value between data types |

> [!DANGER] INTERNAL NOTES
> - Observations:
>   - Z2K System fields are grouped separately and noted as Z2K System-specific. Verify whether these should be shown with a callout or simply omitted until the Z2K Core plugin is released (they are marked as "will be moved to Z2K Core plugin" in the source page).
>   - The Appendix index currently lists "Full Variable & Helper Reference" as plain text (no wikilink). The index should be updated to link to this file: `[[Fields & Helpers|Full Variable & Helper Reference]]`.
> - Action Items:
>   - #AR/User: Update `Appendix.md` to add a wikilink to this page.
>   - #AR/User: Decide whether to add a "Syntax" column showing example usage (e.g. `{{formatDate 'YYYY-MM-DD' now}}`). High value for helpers; not needed for fields.
>   - #AR/User: Confirm whether Handlebars built-in block helpers (`{{#if}}`, `{{#each}}`, etc.) should also appear in this reference, or remain documented only in the Handlebars Support section.
>   - #AR/AI: Verify all wikilinks resolve — particularly `[[fileTitle and Variations|fileTitle]]`, `[[Built-In Fields - Z2K System|Z2K System]]`, and `[[fieldOutput Helper Variation|fieldOutput]]`.
> - Testing Items:
>   - #TEST/User: Confirm the full list of Z2K System fields is complete and current.
