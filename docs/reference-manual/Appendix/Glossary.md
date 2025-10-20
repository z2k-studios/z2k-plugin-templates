
### Template


### Template File


### Block Template


### Field


### Helper Functions
Helper Functions (AKA "Helpers") are field entries that will run code and usually return strings or rendered blocks that become part of your final outputted file. These functions can take data in as input in the form of parameters, including references to other fields. Examples of helper functions are format-date, format-string-xxx, wikilink. 

### Directives
Directives are special forms of helper functions that help control how templates behave. A distinguishing feature for directives is that they do not have any output. Examples of directives include `{{field-info}}`.

In your system they are tokens parsed from {{field-info …}} into the engine’s promptInfos to control the _prompting/collection phase_ (e.g., no-prompt on built-ins like date, time, etc.). The engine creates default promptInfos for built-ins and sets directives: ["no-prompt"], and it validates directive strings via an internal whitelist (e.g., isValidDirective) during field-info parsing. These affect how values are gathered before rendering, not how text is formatted during rendering .




### Built-In Field

### Built-In Helper Function

### JSON

### URI

### Command List

### Obsidian

### Obsidian Plugin



- **Helper functions** (Handlebars “helpers” and “block helpers”) run at render time and return strings or rendered blocks that become part of the output. In your engine, helpers like format-date, format-string-*, wikilink, url, and the passthrough z2k-preserve-raw are registered under getHelperFunctions() and used by Handlebars.compile(…) during rendering .
    
- **Directives** are _not_ a Handlebars concept.