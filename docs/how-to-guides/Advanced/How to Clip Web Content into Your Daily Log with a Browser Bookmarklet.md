---
sidebar_position: 50
aliases:
- How to Clip Web Content into Your Daily Log with a Browser Bookmarklet
- Browser Bookmarklet Web Clipping
---
# How to Clip Web Content into Your Daily Log with a Browser Bookmarklet

A browser bookmarklet can capture the page URL and selected text from any webpage, then insert it into a running log in your vault — all in one click.

This guide shows how to wire up a block template, a daily log template, and a bookmarklet so that selecting text on a webpage and clicking a bookmark appends a formatted clipping to today's log entry.

## What You'll Need
- Z2K Templates installed and running
- A block template for web clippings
- A daily log note that the clipping will be inserted into
- A browser that supports bookmarklets (Chrome, Firefox, Safari, Edge)

## Step 1 — Create the Clipping Block Template

Create a block template at `Blocks/Web Clipping.md`:

```markdown
---
z2k_template_type: block
---
### {{time}}
**Source:** {{source}}

{{content}}
```

This block captures the timestamp, the source URL, and the selected text.

## Step 2 — Create (or Confirm) Your Daily Log Template

Your daily log template at `Templates/Daily Log.md` should have a section where clippings land:

```markdown
---
z2k_template_type: note
z2k_dest_folder: Journal
---
# {{date}}

## Clippings
<!-- Clippings inserted here -->
```

The bookmarklet targets the `## Clippings` header. Each clipping block is appended below the previous one.

## Step 3 — Create the Bookmarklet

Create a browser bookmark and paste the following as its URL (all on one line):

```javascript
javascript:(function(){
  const vault = "MyVault";
  const block = "Blocks/Web Clipping.md";
  const daily = "Journal/" + new Date().toISOString().slice(0,10) + ".md";
  const source = encodeURIComponent(window.location.href);
  const content = encodeURIComponent(window.getSelection().toString() || "No selection");
  const uri = "obsidian://z2k-templates?vault=" + vault
    + "&cmd=insertblock"
    + "&templatePath=" + encodeURIComponent(block)
    + "&existingFilePath=" + encodeURIComponent(daily)
    + "&location=file-bottom"
    + "&prompt=none"
    + "&finalize=true"
    + "&source=" + source
    + "&content=" + content;
  window.location.href = uri;
})();
```

Replace `MyVault` with your vault name and adjust `block` and `daily` paths to match your vault structure.

## How It Works

1. Select text on any webpage
2. Click the bookmarklet in your browser toolbar
3. The selected text and current page URL are captured
4. The clipping block is rendered with `{{time}}`, `{{source}}`, and `{{content}}` filled in
5. The block is inserted at the bottom of today's daily log file

The daily log filename is constructed dynamically using today's date — e.g., `Journal/2025-03-15.md`. If the file doesn't exist yet, Z2K Templates will not create it automatically; use a separate workflow to initialize your daily log first.

## Notes and Limitations

- **Selected text only** — `window.getSelection()` captures text you've highlighted on the page, not clipboard contents. True clipboard access requires the Clipboard API and user permission, which is unreliable in bookmarklets.
- **URL length** — Browsers typically cap bookmarklet URLs around 2000 characters. For very long selections, the URI may be truncated. Limit your selection or use the `fieldData` directive with Base64 encoding for larger content.
- **Obsidian must be open** — On some platforms, Obsidian must already be running for `obsidian://` links to route correctly.
- **Daily log must exist** — The `insertblock` command targets an existing file. It does not create the daily log if it's missing.

> [!DANGER] INTERNAL NOTES
> - The `location=file-bottom` in this example inserts at the absolute bottom of the file, below all headers. Consider whether `location=header-bottom` with `destHeader=Clippings` is a better default for precision.
> - The daily log path pattern (`Journal/YYYY-MM-DD.md`) is hardcoded in the bookmarklet. Consider whether the guide should show a configurable version or reference a companion Apple Shortcut for cross-platform use.
