
%% This is included into the [[Core Concepts of Z2K Templates]] page %%
## Data Source Types

1. **User input via [[Prompting|prompting dialogs]]** — entered interactively at runtime.
2. **[[Built-In Template Fields|Built-in fields]] and [[Helper Functions|helper functions]]** — values like `date` or computed values from helper functions.
3. **Default values stored directly in the template** — specified in field syntax using  [[field-info]]
4. **Existing files** — other vault files can be read through built-in fields such as `{{SystemData}}` and [[Block Templates]].
5. **External URI calls** — incoming data provided through [[URI and JSON Support|URI triggers]].
6. **External JSON command lists** — batches of Z2K Templates Actions written in to JSON packets
7. **Miss handling directives** — fallback behavior applied when all other sources fail.
