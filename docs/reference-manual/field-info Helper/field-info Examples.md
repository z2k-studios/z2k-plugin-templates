---
sidebar_position: 60
doc_state: initial_ai_draft
title: field-info Examples
sidebar_label: field-info Examples
---
# field-info Examples
The `field-info` built-in helper makes templates come alive, so it is worth stepping through some sample usages of the helper function in the content of a larger template.

Sample Templates include:
- [[#Template for People Entries]] in a vault
- [[#Work Out Log Template]]

For fully fleshed out complete template files, please see out [[template-library|Template Library]].


## Template for People Entries
This simple example handles automatic naming of a file based on fields located in the template. Take for instance a template for people that you know:

```md title="Template - Person.md"
{{field-info fileTitle default="{{FullName}}" miss="{{FullName}}"}}
{{field-info FullName default="{{FirstName}} {{LastName}}"}}
# Person: {{FullName}}
- First Name :: {{LastName}}
- Last Name  :: {{FirstName}}
- Relationship :: {{fo Relationship type="multiselect" opts=['#Friend','#Family','#Acquaintance','#Colleague'] }}
```

**Behavior Breakdown**:
- The template has fields for the person First and Last Names. These will just use default prompting interfaces.
- The template creates a Header that inserts a Full Name. By default this will combine the First and Last Names, but can be override
- Then lastly, the template sets the default name for the resultant file to be the Full Name (which in turn is built on the First and Last Names unless otherwise overriden). This uses `{{field-info}}` on a [[Built-In Fields|Built-In Field]] named [[Built-In Fields - File Title Variants|fileTitle]].
- ==Does the fileTitle built-in Field need an extension?==


## Work Out Log Template
This "Workout Log" example demonstrates the most basic example of using embedded `{{field-output}}` commands (in its abbreviated `{{fo}}` [[fo Helper|form]]). It uses `{{fo}}` to directly embed the prompting information into the summary list. 

```md title="Template - Workout Log.md"
{{field-info fileTitle default="{{today}} - {{Duration}} min workout - {{WorkoutType}}" directives="finalize-default" ~}}

## Summary
**Date**:: {{fo WorkoutDate default="{{today}}" directives="finalize-default"}}
**Workout Type**:: {{fo WorkoutType "What types of workouts did you have today?" "Strength" "multiSelect" opts=["Strength","Cardio","Mobility"] miss="Unspecified"}}  
**Duration**:: {{fo Duration "Duration in Minutes:" type="number"}}  
**Intensity**:: {{fo Intensity type="singleSelect" opts=["Low","Moderate","High"]}}  
**Location**:: {{fo Location "Where?" "Home Gym" "text"}}  
```

**Behavior Breakdown**:
- The template asks for a number of fields:
	- Date - Asks for a workout date and then uses a builtin to automatically suggest today. If the user fails to recommend one then it uses the default answer
	- Workout Type - a multi select dropdown of workout types, defaulting to Strength. 
		- ==Notice that the miss is not a valid entry for the multiselect. Is that ok?==
	- Duration  - a numeric field
	- Intensity - a single select dropdown field
	- Location - the location of the exercise
