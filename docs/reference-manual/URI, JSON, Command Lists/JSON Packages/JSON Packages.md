---
aliases:
- JSON
sidebar_position: 1
sidebar_folder_position: 10
---
# Z2K Templates JSON Packages
Z2K Templates JSON Packages are the standard data format used by the Z2K Templates plugin to pass commands and field data into Z2K Templates from external sources — [[URI Actions]], [[Command Queues]], and other programmatic integrations. This section defines the structure of a Z2K Templates JSON Package, the formats it can take, and the rules governing how its data is interpreted.

## Contents
For more information, please see:
1. [[JSON Packages Overview]] — What Z2K Templates JSON Packages are, where they're used, and how the `CommandParams` structure works
2. Z2K Templates JSON Packages:
	1. [[JSON Structure]] — The `.json` single-command file specification
	2. [[JSON Commands]] — Per-command reference for `new`, `continue`, `upsert`, and `insertblock`
		- [[JSON Command - new]] — Create a new note from a template
		- [[JSON Command - continue]] — Continue filling fields in an existing note
		- [[JSON Command - upsert]] — Create a note if it doesn't exist, or update it if it does
		- [[JSON Command - insertblock]] — Insert a block template into a file
	3. [[JSON Directives]] — The directives or parameters that control how a command is performed
	4. [[JSON Field Data]] — How field data is passed within the JSON Package.
		- [[fieldData]] — The `fieldData` parameter for bundling field data separately from command directives

3.  Other JSON Formats and details: 
	- [[JSONL Format]] — The `.jsonl` batch file specification for sending multiple commands
	- [[JSON64 Format]] — Base64-encoded JSON for transport-constrained environments
	- [[JSON Type Conversion]] — How JSON-sourced values preserve native types versus URI string coercion
