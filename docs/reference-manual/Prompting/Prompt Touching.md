---
sidebar_position: 40
aliases:
- touch
- touches
- touched
- untouched
- prompt touching
---
# Prompt Touching
"Touching" a field means interacting with it in the [[Prompting Interface]] – clicking into it, typing in it, or changing its value. This seemingly small act is the mechanism that separates "the user actively chose this value" from "the user hasn't gotten to this field yet."

That distinction drives everything from [[Deferred Field Resolution]] to [[Fallback Behavior]].

> [!TIP]
> By using a smart combination of [[Fallback Behavior|fallback handling]], [[fieldInfo suggest|suggestions]] and [[Deferred Field Resolution]], you can make the data entry for new files to be as optimized as possible - allowing you capture that an idea with minimal effort at the moment when an idea (or the need for a new file in your vault) occurs. 

## Contents
- [[#What Counts as Touching]]
- [[#What Changes When a Field Is Touched]]
- [[#What Happens When a Field Is Not Touched]]
- [[#The Reset Button]]
- [[#Why Touching Matters]]

## What Counts as Touching
A field becomes **touched** the moment any of the following occurs:
- The user **clicks into** (focuses) the field's input control
- The user **modifies** the field's value (typing, selecting an option, toggling a checkbox)

Once touched, the field stays touched for the remainder of the form session – unless explicitly reset.

## What Changes When a Field Is Touched
When a field transitions from untouched to touched:
- The field's left border turns **green**, indicating interaction has occurred
- The [[fieldInfo suggest|suggest]] value – previously shown as the field's pre-filled content – is now treated as a **committed value** that the user has accepted or will edit
- The **fallback preview** (the "Value if left untouched:" message below the input) disappears
- The **reset button** (⟲) becomes available on hover over the label area
- On submission, the field's current value is **written to the output** – the user has spoken

## What Happens When a Field Is Not Touched
An untouched field is interpreted as one the user has not yet addressed. The consequences depend on which button is used to submit:

### On Save for Now
The field remains **unresolved** in the output file. The raw template syntax (e.g., `{{fieldName}}`) is preserved in the note, and the file becomes a [[WIP Stage|WIP content file]]. The user can return to it later via [[Continue filling file]]. This is [[Deferred Field Resolution]] – the defining feature of Z2K Templates' iterative workflow.

### On Finalize
The plugin resolves the field using the [[Fallback Behavior]] procedure:
1. If a `fallback` value is specified on [[fieldInfo Helper|{{fieldInfo}}]], that value is used
2. If a `finalize-clear` or `finalize-preserve` [[fieldInfo directives|directive]] is specified, it determines behavior
3. If the template's YAML contains `z2k_template_default_fallback_handling`, that setting applies
4. If none of the above, the field is cleared from the output

> [!NOTE]
> Fields with the advanced `value` parameter ([[fieldInfo value|computed fields]]) are a special case. Their computed result is always written to the output regardless of touched state, provided no external data overrides them.

## The Reset Button
The **⟲** icon appears when you hover over a touched field's label. Clicking it:
- Sets the field back to **untouched**
- Restores the field's value to the [[fieldInfo suggest|suggest]] value
- Re-displays the fallback preview (if a fallback is configured)
- Removes the green left border

This lets you "un-answer" a field – useful when you've clicked into a field accidentally or want to defer it after all.

## Why Touching Matters
Most template systems treat field resolution as all-or-nothing: either you fill everything in, or you don't run the template. Z2K Templates breaks this assumption by letting you fill in *some* fields now and *the rest later*.

Touching is the mechanism that makes this possible. Without it, the system would have no way to distinguish between:
- "I want this field to be empty" (touched, left blank)
- "I haven't dealt with this field yet" (untouched, defer it)

That distinction is the foundation of [[Deferred Field Resolution]] and the [[WIP Stage|WIP workflow]].

## See Also
- [[Prompting Interface]] – The modal where touching occurs
- [[Deferred Field Resolution]] – How untouched fields are preserved for later
- [[Fallback Behavior]] – What happens to untouched fields during finalization
- [[fieldInfo suggest|suggest Parameter]] – The value restored on reset

> [!DANGER] INTERNAL NOTES
> - Touch is tracked per-field via the `touched` boolean in `FieldState` (`src/main.tsx` ~line 4395).
> - `onFocus` sets `touched=true` (~line 4190); `onChange` also sets `touched=true` (~line 4178).
> - Reset handler at ~line 4205 sets `touched=false` and restores `value` to `resolvedSuggest`.
> - The `fileTitle` field is always written to output regardless of touched state (~line 4234) because every file needs a name.
> - Currently, the suggest value in an untouched field has no visual distinction from user-typed text (no grayed-out/italic styling). See GitHub issue #147.
