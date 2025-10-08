---
sidebar_position: 134
---

## Quick Command Settings
- [[#What Are Quick Commands]]
- [[#What are the Components of a Quick Command]]
	- [[#Command]] - The command to perform
	- [[#Context]] - The context to perform it in
	- [[#Name]] - The name of the Quick Command to Display to the User
- [[#Sample Quick Commands]]
- [[#Creating HotKeys for Quick Commands]]

---
### What Are Quick Commands
Quick Commands allow you to create customized commands to appear inside Obsidian's command list. In particular, by assigning specific templates or folders to Quick Commands, you can [[#Creating HotKeys for Quick Commands|assign hotkeys to your Quick Commands]].

---
### What are the Components of a Quick Command
Quick commands are made up of several components:
- [[#Command]] - The command to perform
- [[#Context]] - The context to perform it in
- [[#Name]] - The name of the Quick Command to Display to the User

---
#### Command
The command component for a Quick Command presents the following options in a dropdown:
- [[#Create File From Template]]
- [[#Create File at Folder]]
- [[#Insert Partial]]
- [[#Insert Partial From Folder]]

##### Create File from Template
The "Create from Template" command will create a new file from a specific template file. The [[#Context]] specifies the path to the source template file to use. The location of the new file created from that template depends:
- If you are using [[Hierarchical Template Folders]], then the plugin will intelligently create the new file inside the folder at the equivalent hierarchical depth as the template. 
- If you are not using hierarchical template folders, the new file will be created in the [[General Settings#Templates Root Folder|Templates Root Folder]]. 
- If the command is issued by right clicking on a folder in the file list, then it will override the destination folder to be the one specified. 

> [!DevNote] Emerson
> Note: the implementation should always assume hierarchical, and if it is flat, then it will automatically insert into the root folder visible to templates ([[General Settings#Templates Root Folder|Templates Root Folder]].)

#####  Create File at Folder
The "Create File at Folder" command will create a new file inside a specified folder (specified in the Context field). It then will prompt which template to use given that specific location. If you are using [[Hierarchical Template Folders]], then the list of available templates will be context sensitive to that specific folder. The new file will be created in that specific folder. 

#####  Insert Partial
The "Insert Partial" command will insert a specific [[Partial Templates|Partial Template]] into the current document at the cursor location. The Context field specifies the partial template to use.

#####  Insert Partial From Folder
The "Insert Partial From Folder" command will allow you to chose a partial template from a template folder (specified in the Context field). This is of particular use with [[Hierarchical Template Folders]], in which case you would like to group a number of partials together and have the user choose from a subset of them.

---
#### Context
The Context component for a Quick Command varies according to the command:
- **Command**: [[#Create File from Template]]
	- **Context**: Specifies the name of a Template file to use
- **Command**: [[#Create File at Folder]]
	- **Context**: Specifies the folder to hold the new file. 
- **Command**: [[#Insert Partial]]
	- **Context**: Specifies the name of a Partial Template file to use
- **Command:** [[#Insert Partial From Folder]]
	- **Context**: Specifies the folder of partials to use to prompt the user which one to use. 

---
#### Name
The Name component for a Quick Command simply is the displayed text of the command as it will appear in Obsidian's Command List. 

---
### Sample Quick Commands

Create New Thought
- Command: Create File At Folder
- Context: /Z2K/Thoughts

## Prioritization
TODO: Talk about how the ordering is used (its not currently used to order them in the command list - just for visual organization )



### Creating HotKeys for Quick Commands

