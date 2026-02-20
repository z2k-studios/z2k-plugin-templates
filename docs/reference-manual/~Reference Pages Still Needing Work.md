

# Sections
- Done, but needs review
	- [[Handlebars Support]]
- Needs Creation
	- [[Error Handling]]
	- [[Naming Conventions]]
	- [[Prompting]]
	- [[Settings Page]]
	- [[Z2K System Features]]
- Sections waiting on code changes:
	- [[Quick Create Commands]]

# Pages
[[Modifying Built-In Field Behaviors]]
[[random]]
[[Misc Functions]]
[[Silent Helper Functions|Silent Helper Function]]


# Claude Code Requests to Prioritize

## Handlebars Support
Handlebars Support 

I will be working in the documentation section "Handlebars Support" for the Z2K Templates plugin in it reference manual. 

## Conditionals
My first question will be on the page `reference-manual/Handlebars Support/Conditionals.md`. It suggests that (in the section `Conditionals and Deferred Fields`) that if a field is a deferred field, then it will still evaluate the #IF conditional. This is not what was intended in the code - it should instead ignore all conditionals until either a) the field does become defined, or b) finalization. 
- (If this is too difficult, then a stop gap solution would be to still handle the field replacement in the #IF statement, but just always defer all conditionals to be executed upon and only upon finalization - that implementation choice is left to the developer). 
- ((A third fallback is to make it a hard requirement that a field is `required`, which is better than nothing - so worth mentioning as an option)) 
	- See `Z2K Studios Workspace/Code/Obsidian Plugins/z2k-plugin-templates/docs/reference-manual/fieldInfo Helper/fieldInfo Parameters/fieldInfo directives.md` 

So the task is to evaluate the code and determine what it actually does. Further, it should note all of this desired behaviour in the danger section so that it can be added to a test jig. 

Finally if the code appears to be doing the wrong thing, then we need to note that in a danger section and file a github issue clarifying what it should do (and back options), and why you think it isnt doing that. 

This problem exists for all handlebars built-ins that assesses field value (e.g. #Each, #Unless, #With). So their documentation also needs to be noted with this issue if it is indeed an issue. 

## Iterators
While you are working on the [[Iterators]] page, can you redo the "# Iterators and Block Templates" example? It is not clear what it is doing. 

## Raw Blocks
On [[Raw Blocks]], I believe this is simply a bug in the code. Can you please make a note to revisit in the doc page, add it to the danger section and file a github issue for me? Can you also confirm that fields inside code blocks are not processed? 

## Block Helpers
In the [[Block Helpers]] page, I believe you make reference in the "Limitation: Reduced-Set Contexts" section to the Restricted Functionality Mode - see `reference-manual/Template Fields/Restricted Functionality Mode.md`. If so, could you please link to that page? I believe that page needs to be fleshed out, so feel free to also take care of creating that doc page. Just make use of the chicken scratch already in it.
