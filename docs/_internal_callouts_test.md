

# Callout Testing

This file demonstrates different flavors of Obsidian callouts for remark → rehype → Docusaurus processing.

---

## Basic Callouts

> [!note]
> This is a simple **note** callout.

> [!info]
> This is an **info** callout with some _italics_ and **bold**.

> [!tip]
> A tip callout.  
> Multiline works too.  
> Here’s another line.

> [!warning]
> A warning callout with `inline code`.

> [!danger]
> A danger callout with a [markdown link](https://example.com).

---

## Titles and Aliases

> [!note] Custom Title
> This note has a custom title.

> [!tip]+ Expandable Title
> By default, this one is **collapsed** but expandable.

> [!info]- Collapsed By Default
> This callout is collapsed. You should test if remark/rehype toggles persist.

---

## Mixed Content Inside

> [!question]
> Can callouts contain lists?
>
> - Yes, they can.
> - Here’s an item
>   - Sub-item
>
> ```js
> // They can also contain code blocks
> console.log("hello from inside a callout");
> ```

---

## Obsidian Flavors

> [!quote]
> A quote-style callout.

> [!abstract]
> A summary/abstract style.

> [!todo]
> A callout styled as a task list:
> - [ ] Unchecked task
> - [x] Completed task

> [!example]
> An example callout with math:  
> $E = mc^2$

---

## Edge Cases

> [!note]
> Line with **trailing spaces**  

> [!bug]
> Callout with unusual keyword.

> [!note] |
> Title with a pipe symbol (alias-style edge case).

> [!note] #header-anchor
> Callout pointing to a header alias.



