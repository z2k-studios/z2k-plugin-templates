---
sidebar_position: 60
aliases:
- duration format
- duration value
- queue duration format
---
# Duration Format
Several [[Command Queue Settings]] accept a **duration value** – a number followed by a time unit suffix. The format is case-insensitive.

| Suffix | Unit | Example |
|--------|------|---------|
| `ms` | Milliseconds | `500ms` |
| `s` | Seconds | `30s` |
| `m` | Minutes | `5m` |
| `h` | Hours | `12h` |
| `d` | Days | `3d` |
| `w` | Weeks | `1w` |
| `mo` | Months | `6mo` |
| `y` | Years | `1y` |

Only one unit per value – `1h30m` is not valid. Use `90m` instead.

> [!DANGER] INTERNAL NOTES
> - Confirm whether `mo` and `y` are valid in the parser or if they are theoretical. The `DURATION_FORMAT_ERROR` constant in `src/main.tsx` (line 100) lists them, but verify against the `parseDuration` implementation.
