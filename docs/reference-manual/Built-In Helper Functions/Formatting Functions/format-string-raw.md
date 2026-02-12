---
sidebar_position: 170
sidebar_class_name: z2k-code
sidebar_label: "{{format-string-raw}}"
aliases:
- format-string-raw
---
# format-string-raw Helper
The `format-string-raw` helper marks a field value as a Handlebars `SafeString`, which tells Handlebars to skip its HTML escaping step when inserting the value into the output.

```handlebars
{{format-string-raw fieldName}}
```

where:
- `format-string-raw` is the predefined name of the helper function
- `fieldName` is the name of the field whose value should be inserted without Handlebars escaping

## How It Works
Standard Handlebars escapes seven HTML-sensitive characters (`&`, `<`, `>`, `"`, `'`, `` ` ``, `=`) when rendering a `{{field}}`. The `format-string-raw` helper wraps the value in a `SafeString`, which tells Handlebars to skip this escaping entirely.

However, Z2K Templates already reverses all of Handlebars' HTML escaping automatically after every render pass (see [[Unescaped Expressions]] for full details). This means that for most content, `{{format-string-raw field}}` and `{{field}}` produce **identical output**.

## When It Matters
The only scenario where `format-string-raw` produces different output than `{{field}}` is when the incoming data itself contains HTML entity strings like `&amp;`, `&lt;`, or `&#x27;`.

### Example: Pre-Existing HTML Entities
Consider a field `rawHTML` with the value `This &amp; That`:

**Without `format-string-raw`:**

```handlebars
{{rawHTML}}
```

1. Handlebars escapes `&` → output contains `&amp;amp;`
2. Z2K unescapes the first `&amp;` → final output: `&amp;`

The pre-existing entity survives because double-escaping leaves one layer behind.

**With `format-string-raw`:**

```handlebars
{{format-string-raw rawHTML}}
```

1. Handlebars skips escaping → output contains `&amp;`
2. Z2K unescapes `&amp;` → final output: `&`

Here the pre-existing entity is fully decoded.

## When to Use It
For most template work, `format-string-raw` is unnecessary. Consider using it when:
- Your data contains pre-existing HTML entities that you want fully decoded
- You are composing output inside other helpers and want to be explicit that the value should not be escaped
- You want to document intent – signaling to other template authors that this field's value should pass through untouched

## Relationship to Triple-Mustache
Handlebars' triple-mustache syntax `{{{field}}}` achieves the same effect as `format-string-raw`:

```handlebars
{{{rawHTML}}}
```

Both bypass Handlebars' escaping step. The difference is stylistic – `format-string-raw` is an explicit helper call, while triple-mustache is Handlebars syntax.



> [!DANGER] Notes for Review
> - ==Needs testing==: Verify the pre-existing HTML entity edge case behaves as described. Test with values like `&amp;`, `&lt;`, and `&#x27;` in both `{{field}}` and `{{format-string-raw field}}`.
> - ==Needs testing==: Confirm `format-string-raw` and `{{{field}}}` produce identical results.
> - The previous version of this page incorrectly claimed that `{{field}}` escapes Markdown characters like `[[` and `*`. Handlebars only escapes 7 HTML characters – it has no knowledge of Markdown syntax.
> - The previous version also attributed `\n` → newline conversion to this helper. That conversion is performed by `processStringEscapes()` on all rendered output, regardless of whether `format-string-raw` is used.
> - Is it even worth keeping this function around?
