---
sidebar_position: 1
sidebar_folder_position: 200
sidebar_label: Z2K System Features
aliases:
  - Z2K System Specific Features
---
The Z2K System is a framework for organizing and implementing your Second Brain in Obsidian. [[README|Z2K Templates]] was designed to be an integral part of that system, although is perfectly functional outside of it for the general Obsidian community. As a result, the Z2K Templates Plugin has additional support for features found in the Z2K System. 

While these features will likely not be used outside the Z2K System, they are nonetheless documented here for complete reference. Users are welcome to make use of of these features if they want, but be aware that they may change as the Z2K System grows.

# Overview
- TBD  
- Z2K System YAML Fields
	- z2k_card_build_state
	- z2k_card_status
	- 

# Z2K System - Card Activation
The Z2K System has a rich metadata structure to capture the state of cards as they move through development. The act of creating a card and populating it with field values changes the state of the card, and thereby Z2K Metadata YAML Fields will be updated through the process of using the Z2K Templates plugin. 

Non-Z2K users are welcome to add these YAML properties into their own system (e.g. via a `.system-block.md` file described in [[Intro to System Blocks]]), but do note that these properties are subject to change in future versions of the Z2K Templates Plugin. They can be useful for operations like using DataView to find all cards that have yet to be Finalized.


### z2k_card_build_state
The `z2k_card_build_state` property captures how far this card has moved from a template state into being a finalized card in the system

| property Value                    | Description                                                                      |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `.:Z2K/BuildState/Unknown`        | This card has an unknown BuildState status              |
| `.:Z2K/BuildState/Uninitialized`  | This card is just a template file - it has not been initialized into an actual card.                    |
| `.:Z2K/BuildState/Midstream`      | This card is in the process of being created fully - it likely has some template fields remaining  |
| `.:Z2K/BuildState/Finalized`      | This card has been finalized from its source Template. All original fields have been specified.  |

For this property, the Z2K Template Plugin will change the value of this YAML property to either `Midstream` or `Finalized`, based on whether or not fields are remaining to be filled.


### z2k_card_status tags
The `z2k_card_status` property captures the development state of this card. 

The following tags are allowed in the `z2k_status` property:

| property Value                     | Description                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `.:Z2K/Status/Unknown`        | This card has an unknown status setting (just assume it is active)               |
| `.:Z2K/Status/Template`       | This card is just a template file - it has not been activated                    |
| `.:Z2K/Status/Ongoing`        | This card is in an "ongoing" state of development (this is the default value)                                |

For this property, the Z2K Template Plugin will change the value of this YAML property to `Ongoing` (overwriting a `Template` state) to signify that the card is not an active card in the Vault. 