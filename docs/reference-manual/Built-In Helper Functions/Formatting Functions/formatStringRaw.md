---
sidebar_position: 170
sidebar_class_name: z2k-code
sidebar_label: "{{formatStringRaw}}"
aliases:
- formatStringRaw
---
# formatStringRaw Helper
The `formatStringRaw` helper marks a field value as a Handlebars `SafeString`, which tells Handlebars to skip its HTML escaping step when inserting the value into the output.

```handlebars
{{formatStringRaw fieldName}}
```

where:
- `formatStringRaw` is the predefined name of the helper function
- `fieldName` is the name of the field whose value should be inserted without Handlebars escaping

## How It Works
Standard Handlebars escapes seven HTML-sensitive characters (`&`, `<`, `>`, `"`, `'`, `` ` ``, `=`) when rendering a `{{field}}`. The `formatStringRaw` helper wraps the value in a `SafeString`, which tells Handlebars to skip this escaping entirely.

However, Z2K Templates already reverses all of Handlebars' HTML escaping automatically after every render pass (see [[Unescaped Expressions]] for full details). This means that for most content, `{{formatStringRaw field}}` and `{{field}}` produce **identical output**.

## When It Matters
The only scenario where `formatStringRaw` produces different output than `{{field}}` is when the incoming data itself contains HTML entity strings like `&amp;`, `&lt;`, or `&#x27;`.

### Example: Pre-Existing HTML Entities
Consider a field `rawHTML` with the value `This &amp; That`:

**Without `formatStringRaw`:**

```handlebars
{{rawHTML}}
```

1. Handlebars escapes `&` → output contains `&amp;amp;`
2. Z2K unescapes the first `&amp;` → final output: `&amp;`

The pre-existing entity survives because double-escaping leaves one layer behind.

**With `formatStringRaw`:**

```handlebars
{{formatStringRaw rawHTML}}
```

1. Handlebars skips escaping → output contains `&amp;`
2. Z2K unescapes `&amp;` → final output: `&`

Here the pre-existing entity is fully decoded.

## When to Use It
For most template work, `formatStringRaw` is unnecessary. Consider using it when:
- Your data contains pre-existing HTML entities that you want fully decoded
- You are composing output inside other helpers and want to be explicit that the value should not be escaped
- You want to document intent – signaling to other template authors that this field's value should pass through untouched

## Relationship to Triple-Mustache
Handlebars' triple-mustache syntax `{{{field}}}` achieves the same effect as `formatStringRaw`:

```handlebars
{{{rawHTML}}}
```

Both bypass Handlebars' escaping step. The difference is stylistic – `formatStringRaw` is an explicit helper call, while triple-mustache is Handlebars syntax.



> [!DANGER] INTERNAL NOTES
> - ==Needs testing==: Verify the pre-existing HTML entity edge case behaves as described. Test with values like `&amp;`, `&lt;`, and `&#x27;` in both `{{field}}` and `{{formatStringRaw field}}`.
> - ==Needs testing==: Confirm `formatStringRaw` and `{{{field}}}` produce identical results.
> - The previous version of this page incorrectly claimed that `{{field}}` escapes Markdown characters like `[[` and `*`. Handlebars only escapes 7 HTML characters – it has no knowledge of Markdown syntax.
> - The previous version also attributed `\n` → newline conversion to this helper. That conversion is performed by `processStringEscapes()` on all rendered output, regardless of whether `formatStringRaw` is used.
> - Is it even worth keeping this function around?
