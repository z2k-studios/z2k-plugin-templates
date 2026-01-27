---
sidebar_position: 60
doc_state: initial_ai_draft
---
# Deferred Field Resolution
One of the features that makes Z2K Templates unique (including from its underlying [[Handlebars Support|Handlebars implementation]]), is its ability to defer the resolution of fields for which no data is yet available. 

Most templating solutions assume that the [[Instantiation|instantiation]] of a template into a content file is done in one fell swoop. Z2K Templates, however, introduces the concept of "deferred field resolution", that is, the ability to keep fields around in your content files so that they may be filled in at a later time. 

## Why Do We Need Deferred Field Resolution?
In a perfect world, one knows all the data that goes into a content file the moment when it is instantiated. But reality is messy and time is short, and thus Z2K Templates is designed to allow for fields to remain in a content file in an unfilled state. Then you can [[WIP Stage#WIP Iterating|iterate on a work-in-progress (WIP) file]] until you have all data filled in, at which time you [[Finalization|finalize]] the file. 

### Example: Daily Logs for Quantified Self
Take for instance a Daily Log for a Quantified Self. This daily log may be created one minute after midnight and uses fields to populate all *a priori* known data, from [[today]] wikilinks and weather forecasts. Then as the day progresses, the user can use tools to insert additional data (meals eaten, exercises performed, hourly mood updates) - these all go into the WIP file for that day's daily logs. Then after the day is completed, additional routines may export data from sources like step counts, completed tasks, locations visited. The actual finalization of that day's logs may not be for a full day or two later as new data arrives. 

### Example: Meeting Notes
Another example may be for a "Meeting Notes" template. Here, you want to use a template file to quickly create a new content file for a meeting. At that point you may only have at most the intended meeting title. Be separating the [[Finalization|finalization]] of a content file from the initial [[Instantiation|instantiation]] you allow for later data entry of fields like `{{MeetingSummary}}` and `{{MeetingAttendees}}`, and in the mean time, have full access to the file to record content into the note as the meeting unfolds. 

## Handlebars and Deferred Resolution
For users familiar with Handlebars, this additional "[[WIP Stage]]" may take some getting use to. It introduces new concepts around it, e.g. [[Miss Handling]] and deferred helper function execution. Handlebars was written explicitly for the case where either data is known or unknown, but never deferred.

## More Details
Deferred Field Resolution is the central concept behind the [[WIP Stage]] in the [[Lifecycle of a Template]]. Please see that page for more details on how deferred field resolution is actually implemented and how it fits into a [[Typical Templates Workflow]].

## How Do I Defer Field Resolution?
Deferring field resolution is simply clicking the "Save For Now" button on the [[Prompting Interface]]. This causes the current content file to be flagged as a [[WIP Stage|WIP Content File]].

## Can I Skip Straight to Finalizing?
Of course. Simply click the "Finalize" button in the [[Prompting Interface]], or use the [[Continue filling note]] to display the [[Prompting Interface]] once again. 

## Downsides of Deferred Field Resolution
There are a few downsides of using deferred field resolution:
- The segregation between a template file and content files becomes blurred. Inherently, [[WIP Stage|WIP Content Files]] are half template files (having unresolved [[Template Fields]] and [[Helper Functions]]), and half content files (having likely had some data already inserted and are stored outside of. Templates Folder). This lack of a clean segregation may be too "messy" for some, and thus for those who don't embrace the ambiguity, we recommend always [[#Can I Skip Straight to Finalizing?|going straight to finalization]].
- Template fields and helpers can begin to be perceived as valid "data" by various Obsidian tools. This is called "[[Template Pollution]]". While there are a number of ways to [[Template Pollution#How To Minimize Template Pollution|mitigate]] this, it does require some additional design skill to build your templates to minimize template pollution, as WIP Content files proliferate.