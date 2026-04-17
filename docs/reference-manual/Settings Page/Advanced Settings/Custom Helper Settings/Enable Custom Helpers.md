---
sidebar_position: 10
aliases:
- enable custom helpers
- custom helpers enabled
---
# Enable Custom Helpers
Master toggle for the custom helpers feature.

- **Default:** Off
- **Type:** Toggle

When you turn this on, the plugin displays a security confirmation dialog before enabling. You must acknowledge the risk before proceeding. Once confirmed:
- The [[Edit Custom Helpers]] button appears below this toggle
- Any previously saved helper code is loaded immediately

When you turn this off:
- Custom helpers are unloaded
- The [[Edit Custom Helpers]] button is hidden

## Security

> [!WARNING]
> Custom helpers execute **arbitrary JavaScript** with full access to your vault, files, and the Obsidian API. Only enable this if you wrote the helper code yourself or fully trust its source. This is not sandboxed.

The enable toggle exists specifically to make this an opt-in decision with an explicit acknowledgment step.
