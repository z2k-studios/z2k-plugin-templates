There is a fairly large documentation database for the Z2K Templates Plugin. This file describes how it is organized - mainly for AI Engines (e.g. VS CodePilot or ChatGPT) to read in order to understand how the system is configured. 

# Repos

----
## Primary Repo : z2k-plugin-templates
The primary plugin repo is `z2k-plugin-templates`. This contains all of the Obsidian Plugin Typescript code, test jigs, and documentation. 

### z2k-plugin-templates/
The root folder contains all of the source level typescript code for the plugin
### z2k-plugin-templates/test-data
The `test-data` folder contains test template files to be used in testing builds of the plugin. 
### z2k-plugin-templates/design-notes
`design-notes` contains internal markdown text files used to documentation internal design notes associated with the plugin. This is not intended for public consumption, but nonethless documents internal discussion and overall approach. 
### z2k-plugin-templates/docs
The `docs` folder in this repo contains an Obsidian friendly documentation database intended for public consumption. Characteristics include:
- Liberal use of `[[wikilinks]]` with Obsidian syntax.
- File names that are based on human readable text (i.e. not encoded or sluggified)
- Intended to be opened in an Obsidian vault for editing and ease of use for linking
- Also intended to be opened in Vs. Code (at the root `z2k-plugin-templates` folder) in order to use VS Code Pilot to assist with technical writing.
- All documentation editing should occur within this repo.



----
## Docusaurus Repo : z2k-plugin-templates-docs
A second sister repo to the `z2k-plugin-templates` repo is the `z2k-plugin-templates-docs` repo. This repo is for translating the documentation for the plugin (specifically from `z2k-plugin-templates\docs`) into a format that is compliant with Docusaurus web interfaces. This repo includes scripts for:
1. Copying `docs` files from the primary repo into the docusuarus repo.
2. Building a local copy of the docusaurus website. 
3. Deplying the resultant docusaurus database on to GitHub Pages.

Note: in keeping with Docusaurus best practices, the deployment version of the docs is kept on a `gh_pages` branch within github. 

### z2k-plugin-templates-docs/
The root folder contains all of the scripts required for importing the Obsidian friendly docs into a docusaurus compliant web interface. This includes:
1. Bash Scripts for copying, building and deploying the website
2. Docusaurus configuration files

### z2k-plugin-templates-docs/docs
This folder receives a copy of the plugin docs in Docusaurus compliant format (e.g. sluggified filenames, MDX compliant linking). Note: this folder is set to be read-only to prevent accidental editing of the files copied over. Also, this folder is not committed into the github repo and is only kept locally. 

### z2k-plugin-templates-docs/build
This folder receives a website build ready for deployment. 

---
# Workspaces and Vaults
This plugin is designed to be accessed in several hierarchical workspaces/vaults. Choosing a Workspace level is essential for accessing the appropriate level of AI assistance with Code Pilot.

All of our folders are assumed to be able to be opened with Visual Studio Workspaces and as Obsidian Vaults. 

## Z2K Studios Workspace
The Z2K Studios Workspace is the top most, company wide workspace. This provides access to all information associated with Z2K Studios, the Z2K system and its associated apps, scripts, and plugins. 

## z2k-plugin-templates Workspace
When working on just the plugin, be sure to open only the Workspace associated with just the `z2k-plugin-templates` repo. 

## ## z2k-plugin-templates Workspace
Similarly, if working on the Docusaurus website, be sure to open only the workspace for the `z2k-plugin-templates-docs` repo. 
