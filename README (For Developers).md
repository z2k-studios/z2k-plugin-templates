# Z2K Templates Plugin

An Obsidian plugin using the Z2K Template Engine to create new cards and update cards using templates and blocks.

## Development Setup

### Prerequisites
- Node.js (version 14 or later recommended)
- npm or yarn
- Obsidian (for testing)

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd z2k-plugin-templates

# Install dependencies
npm install
```

### Template Engine Integration

This plugin depends on the z2k-template-engine module.

```bash
# First, in the template engine directory
cd path/to/z2k-template-engine
npm install
npm run build
npm link

# Then, in this plugin directory
npm link z2k-template-engine
```

TODO: At some point, this should be included as a dependency by either publishing the template engine or using a git tag dep.

### Development
During development, you can keep a terminal open for both the template-engine and the plugin and in each one run:
```bash
npm run dev
```

### Building
```bash
# Build the plugin
npm run build
```

This creates a bundled `main.js` file that includes the template engine.


### Testing
A testing vault is included in the repository that can be opened in obsidian.
The plugin files are copied into here whenever `npm run build` or `npm run dev` runs so that the plugin shows up.



### Releasing
The script 'release.mjs' has been made to handle most of the steps for creating a new release. Once you have committed all changes and the plugin is ready, run the script using:
```bash
npm run release <version>
```

To see the current version before releasing:
```bash
npm run release
```

This will:
- Update the version number in the needed places
- Make a new git commit for the release with the correct tag
- Push the commit to remote (along with tags)

Once this completes,
- Go to the github repository
- Create a new release (on the right)
- Fill out the change log
- Upload main.js, manifest.json, styles.css, and z2k-plugin-templates.zip

Don't forget to update the template engine too! (if changes were made)



---
### License
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
