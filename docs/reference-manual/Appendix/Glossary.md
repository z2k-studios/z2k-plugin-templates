
### Template


### Template File


### Template Folder

### Content File 

### [[WIP Stage|WIP Content File]]


### Block Template


### Field

### Helper Functions
Helper Functions (AKA "Helpers") are field entries that will run code and usually return strings or rendered blocks that become part of your final outputted file. These functions can take data in as input in the form of parameters, including references to other fields. Examples of helper functions are formatDate, formatString-xxx, wikilink. 

### Directives
Directives are special forms of helper functions that help control how templates behave. A distinguishing feature for directives is that they do not have any output. Examples of directives include `{{fieldInfo}}`.

In your system they are tokens parsed from {{fieldInfo …}} into the engine’s promptInfos to control the _prompting/collection phase_ (e.g., no-prompt on built-ins like date, time, etc.). The engine creates default promptInfos for built-ins and sets directives: ["no-prompt"], and it validates directive strings via an internal whitelist (e.g., isValidDirective) during fieldInfo parsing. These affect how values are gathered before rendering, not how text is formatted during rendering .




### Built-In Field

### Built-In Helper Function

### JSON

### URI

### fieldInfo

### Prompting Interface

### [[Silent Helper Functions|Silent Helper Function]]

### [[Restricted Functionality Mode]]

### Instantiation

### Finalization

### YAML

### Template File Extensions

### Global Block

### System Block

### Quick Command

### Command Queue

### Obsidian

### Obsidian Plugin


### Partials

### Block Helpers

### Commands
