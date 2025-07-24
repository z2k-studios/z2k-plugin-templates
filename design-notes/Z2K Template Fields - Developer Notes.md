
# Prioritization of Features
1. Required Features
	1. Good Old {{field}} replacement
	2. Prompting - see [[Prompting]]
	3. Built In Fields - see [[Built-In Template Fields]]
	4. Prompting - see [[Prompting]]
	5. Miss Handling - see [[Finalizing and Miss Handling for Z2K Templates]]
2. Advance Features not needed in the first release:
	1. For R2:
		1. many of the [[Built-In Helper Functions]]
	2. For R3+
		1. [[Z2K Templates, URI, and JSON]]
		2. [[Finalizing and Miss Handling for Z2K Templates#Override - Default Miss Handling]]

# Quick Testing
- Include a link for one of the fiddlers
	- fiddler:
		- https://jsfiddle.net/76484/bpoezqga/

# References
- Insert the Mustache Vs. Handlebars link. Include a discussion on which to use.

# Scratch List
Hodge podge list of implementation questions details.

==These still need to be specified==
- Do I use {{{ raw }}} for raw fields?
- Specify which fields are required for input 
	- Do it automatically - Do it be seeing if any are in the %%Title: {{field}} %% comment?
- Special field to set the card title?
- See [[Finalizing and Miss Handling for Z2K Templates#Scratch]]

- Handlebar/Mustache support:
	- JSON names
	- Comments {{! }}
	- Helpers
	- ==Partials==
- #Include (must have a way to allow additional YAML entries to be inserted, should
- Any additional custom helpers
	- https://developer-beta.bigcommerce.com/docs/storefront/stencil/themes/context/handlebars-reference#custom-helpers
	- https://docs.airship.com/guides/messaging/user-guide/personalization/handlebars/basics/
	- https://www.palantir.com/docs/foundry/slate/references-helpers
- Developer Tools
	- https://docs.airship.com/guides/messaging/user-guide/personalization/simplifying-handlebars/
	- 

- What does the existing Handlebars plugin do?
	- https://github.com/sbquinlan/obsidian-handlebars
		- Provides access to frontmatter tags
		- Text is inside \`\`\``handlebars` codeblocks
		- Built-in functions:
			- #Notes - iterates through all notes in a folder
			- 


On field names, is there a way to group them with different steps - perhaps JSON? That way the verify logs function will just inherently group them all together for each step.
