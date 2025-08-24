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

### Building
```bash
# Build the plugin
npm run build
```

This creates a bundled `main.js` file that includes the template engine.

Use this while developing:
```bash
npm run dev
```



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
