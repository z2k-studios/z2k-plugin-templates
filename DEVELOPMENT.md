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

Produces a bundled `main.js` at `release/main.js`.

## Build outputs

The dev watcher writes to `dev/main.js` (used by the testing-vault sync). Production builds write to `release/main.js`. Both directories are gitignored. `manifest.json` and `styles.css` (also released artifacts) live at the plugin root and are tracked. The two outputs live in separate folders so they never collide — you can leave `npm run dev` running during a release.

## Testing

A testing vault is included in the repository and can be opened directly in Obsidian. The `update-plugins.sh` script in the testing-vaults repo watches `dev/main.js`, `manifest.json`, and `styles.css` and copies them into the vault as the dev watcher rebuilds.

## Releasing

The `scripts/release.mjs` script handles version bumping, building, committing, tagging, and pushing.

```bash
# Show current version
npm run release

# Cut a release at a new version
npm run release <version>
```

After the script pushes the tag, the GitHub Actions workflow at `.github/workflows/release.yml` automatically creates a draft GitHub release with `release/main.js`, `manifest.json`, and `styles.css` attached. Open the release on GitHub, fill in the changelog notes, and publish it.

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
