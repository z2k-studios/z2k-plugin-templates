# Plugin API

Public surface for other Obsidian plugins to query and (eventually) extend Z2K Templates.

## Access

```ts
const api = app.plugins.getPlugin('z2k-plugin-templates')?.api;
if (!api) { return; /* plugin not installed or not loaded */ }
const version = api.meta.getVersion();
```

Re-fetch on each use rather than caching at startup. Two reasons: plugin load order is not guaranteed (the api may not exist yet during your `onload()`), and if the templates plugin is reloaded, any cached reference closes over a dead instance.

## Shape

Methods are grouped into namespaced sub-objects (e.g. `api.meta.*`). Groupings are organizational only — "namespace" just means a nested object.

Current namespaces:
- `meta` — plugin identity (version, nomenclature)

## Feature detection

Callers use standard JS presence checks rather than a capability API:

```ts
if (typeof api.meta?.getVersion === 'function') {
	const v = api.meta.getVersion();
}
```

A `hasCapability()` mechanism was considered and rejected for v1 — it would duplicate `typeof` checks without adding information. If a future method needs to signal state beyond "method exists" (e.g. "registered but disabled by user"), revisit.

## Stability

Additive by default. Breaking changes go through a deprecation cycle:
1. Ship the new method alongside the old.
2. Mark the old one deprecated in release notes.
3. Remove in a later release.

Don't casually rename or remove anything already shipped — external callers may depend on it.

## State-holding methods (future)

Methods that register state on behalf of the caller (custom helpers in issue #169, system blocks in #79) must return a disposer function. Callers pass it to `this.register(dispose)` so Obsidian cleans up on unload:

```ts
const dispose = api.helpers.register({ id: 'foo', fn: myFn });
this.register(dispose);
```

Without this, stale registrations accumulate across reloads.

## Consent / awareness

The api is not an access-control boundary. Sibling plugins share the process and can bypass anything we add. The user-facing settings UI that lists registered plugins and lets the user toggle them is tracked separately in issue #195 — frame it as consent + awareness, not authentication.

## Adding a new method

1. Pick or create a namespace. Add methods to `src/api/index.ts`.
2. If the namespace grows past ~50 lines or gains internal state, split into `src/api/<namespace>.ts` and compose it in `index.ts`.
3. If the method registers state for the caller, return a disposer (see above).
4. Document with a JSDoc block so callers get IntelliSense.
5. Methods should read live state (close over `plugin`), not capture values at api-creation time — settings can change at runtime.
