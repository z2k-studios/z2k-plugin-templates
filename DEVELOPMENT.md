# Development

Setup, build, test, and release instructions for contributors.

## Prerequisites

- Node.js (version 14 or later recommended)
- npm
- Obsidian (for testing)

## Setup

```bash
git clone https://github.com/z2k-studios/z2k-plugin-templates.git
cd z2k-plugin-templates
npm install
```

The template engine source lives in `src/template-engine/` and is bundled into the plugin build — no separate dependency or `npm link` step.

## Development build

```bash
npm run dev
```

Runs an esbuild watcher that rebuilds on source changes. Output is copied into the testing vault automatically so the plugin appears live in Obsidian.

## Production build

```bash
npm run build
```

Produces a bundled `main.js` in the repo root.

## Testing

A testing vault is included in the repository and can be opened directly in Obsidian. Plugin files are copied into the vault on each `npm run build` or `npm run dev`.

## Releasing

The `release.mjs` script handles version bumping, building, committing, tagging, and pushing.

```bash
# Show current version
npm run release

# Cut a release at a new version
npm run release <version>
```

The dev watcher writes to `main.js` (used by the testing vault), and production builds write to `release/main.js` — they don't collide, so you can leave `npm run dev` running during a release.

After the script completes:

1. Open the GitHub repository.
2. Create a new release on the right.
3. Fill out the changelog.
4. Upload these files as loose release assets:
   - `release/main.js`
   - `manifest.json`
   - `styles.css`

## License

Copyright 2025 Z2K Studios, LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
