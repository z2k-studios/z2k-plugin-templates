---
sidebar_position: 60
sidebar_label: Built-In & Field-Info
aliases:
- Field-Info for Built-In Fields
- Built-In Fields and Field-Info
---

There are some amazingly cool things you can do with Built-In Fields, like using the [[reference-manual/field-info Helper/field-info Helper]] to modify how they operate.

Let's step through some examples - get ready to blow your mind on what's possible.

# Field-Info Modifications

## fileTitle and field-info
By using the [[reference-manual/field-info Helper/field-info Helper]] on the `{{fileTitle}}` (and other [[Built-In Fields - File Data#Destination File Fields|title variants]]), you can specify how any resulting file created from the template is to be named.

==todo - flesh in what is possible. Is it just prompt and default? miss? value?==


DO NOT MODIFY now
## what else

==step through every other built-in. Does it make sense to override them?
e.g. the `{{today}}` is probably a no-prompt directive, but can we force a prompt for it?
e.g. can you override the miss for `{{today}}` to change the format of a date from YYYY-MM-DD to MM-DD-YYYY?
e.g. see example for changing yesterday format value, or creating your own "DayAfterTomorrow" fields
e.g. can someone put that field-info entry into system yaml at the root and then make it universally changed?==






## Dates

Chat: 2025-11-13
`{{field-info today value=(format-date now "M/D/YY")}}`
Just can't self reference

> I tried  
> `{{field-info today suggest=(format-date "M/D/YY") directives="finalize-suggest"}}`  
> and it aborted because of a circular dependency
> 
> I tried  
> `{{field-info today suggest=(format-date "M/D/YY") directives="finalize-suggest"}}`  
> and it took it fine, but didn't work as expected - I think it's because the today field already is given a value, so when it created the card it already filled out the today field so the finalize-suggest never triggered
> 
> I tried doing  
> `{{field-info today value=(format-date "M/D/YY")}}`  
> and instead of putting the current date where `{{today}}` was, it put `{{format-date "M/D/YY"}}`  
> I think this is wrong though, I think it should have put `11/13/25`
> 
> 


