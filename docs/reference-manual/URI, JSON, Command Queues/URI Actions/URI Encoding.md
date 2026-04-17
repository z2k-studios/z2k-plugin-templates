---
sidebar_position: 40
aliases:
- URI Encoding
- URL Encoding
- Percent Encoding
---
# URI Encoding
A URI – from its parameters to its data – cannot contain raw special characters. Spaces, commas, slashes, and other reserved characters must be percent-encoded. The plugin applies `decodeURIComponent()` to every parameter before processing.

## Common Encodings

| Character | Encoded | Example                |
| --------- | ------- | ---------------------- |
| space     | `%20`   | `Meeting%20Notes`      |
| `/`       | `%2F`   | `Templates%2FNote.md`  |
| `,`       | `%2C`   | `Alice%2C%20Bob`       |
| `#`       | `%23`   | `%23%23%20Heading`     |
| `"`       | `%22`   | (rarely needed)        |
| `{`       | `%7B`   | (see [[URIs with JSON Data]]) |

> [!WARNING]
> When constructing URIs by hand or through string concatenation, be careful with vault-relative paths. A path like `Templates/Sub Folder/Note.md` requires encoding both the spaces and the slashes: `Templates%2FSub%20Folder%2FNote.md`. Missing a single encoding can cause the plugin to receive a truncated path.

## When Encoding Gets Visually Unwieldy
When field data contains many special characters, the percent-encoded URI becomes difficult to read and debug. Several approaches can help:

### Write Data to a File
Store the field data in a JSON file in your vault and pass the file path via the `fieldData` directive:
```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FNote.md&fieldData=Data%2Fmy-fields.json
```

The plugin loads the JSON file and uses its contents as field data. No complex encoding needed in the URI itself.

### Use Automation Tools
Most automation environments provide encoding utilities:
- **Apple Shortcuts** – The "URL Encode" action handles encoding automatically
- **Python** – `urllib.parse.quote()` encodes strings for URIs
- **JavaScript** – `encodeURIComponent()` encodes strings for URIs

These tools can also convert key-value pairs into a JSON object, which you can then pass via the `fieldData` directive.

## When URIs Run Out of Space
URIs have practical length limits. Most browsers and operating systems support URIs up to ~2,000 characters, though some environments impose stricter limits (~500 characters on older iOS versions). When your data exceeds these limits, consider:

### Base64 Encoding
Gather the data as a JSON package, Base64-encode it, and pass it via the `jsonData64` directive with the `fromJson` command:
```
obsidian://z2k-templates?vault=MyVault&cmd=fromJson&jsonData64=eyJjbWQiOiJuZXciLCJ0ZW1wbGF0ZVBhdGgiOiJUZW1wbGF0ZXMvTm90ZS5tZCIsInRpdGxlIjoiSGVsbG8ifQ==
```

Base64 encoding is more compact than percent-encoding for data with many special characters. You still have the same upper bound in characters, but you can fit a little more in. 

### Store Data in a File
Write the field data to a JSON file in your vault and pass the file path via the `fieldData` directive:
```
obsidian://z2k-templates?vault=MyVault&cmd=new&templatePath=Templates%2FNote.md&fieldData=Data%2Fmy-fields.json
```

### Store the Full Command in a File
For complex commands, write the entire [[JSON Packages|JSON Package]] to a file and pass the filename via the `jsonData` directive with the `fromJson` command:
```
obsidian://z2k-templates?vault=MyVault&cmd=fromJson&jsonData=Commands%2Fmy-command.json
```

See [[URIs with JSON Data]] for details on these approaches.

> [!DANGER] INTERNAL NOTES
> - The plugin applies `decodeURIComponent()` to each parameter value (line 1227 of main.tsx).
