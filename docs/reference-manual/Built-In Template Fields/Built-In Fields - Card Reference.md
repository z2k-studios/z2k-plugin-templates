---
sidebar_position: 46
---
# Card References

You can also specify references to other well known cards in the Z2K vault. 

*Note: these cards have particular meaning within the [[Z2K System]], but may have limited value when used outside of an installed Z2K System.*

| Field                  | Value to be inserted                              | Example *(assuming today is 2026-01-09)* |
| ---------------------- | ------------------------------------------------- | ---------------------------------------- |
| `{{todayLog}}`         | The name of today's log file                      | `2026-01-09 - Log`                       |
| `{{yesterdayLog}}`     | The name of yesterday's log file                  | `2026-01-08 - Log`                       |
| `{{tomorrowLog}}`      | The name of tomorrow's log file                   | `2026-01-10 - Log`                       |
|                        |                                                   |                                          |
| `{{todayJournal}}`     | The name of today's journal file                  | `2026-01-09`                             |
| `{{yesterdayJournal}}` | The name of yesterday's journal file              | `2026-01-08`                             |
| `{{tomorrowJournal}}`  | The name of tomorrow's journal file               | `2026-01-10`                             |
|                        |                                                   |                                          |
| `{{creatorRootCard}}`  | The name of the root creator card                 | `Your Name`                              |
| `{{inboxCard}}`        | The name of the inbox card                        | `~Inbox`                                 |
| `{{templateName}}`     | The name of the template used to create this card |                                          |


## Wikilinking Card References

Note: these will not be wikilinked unless you use the `wikilink` helper (see [[Built-In Helper Functions|Predefined Helpers]]).

For example, a template with the following text:
```md
Please see {{wikilink todayJournal}} for more information about the date {{todayJournal}}. 
```

will result in the final card text (assuming today is 1776-07-04)
```md
Please see [[1776-07-04]] for more information about the date 1776-07-04.
```