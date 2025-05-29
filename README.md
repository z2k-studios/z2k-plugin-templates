

# Z2K Obsidian Plugin

An Obsidian plugin using the Z2K Template Engine.

## Development Setup

### Prerequisites
- Node.js (version 14 or later recommended)
- npm or yarn
- Obsidian (for testing)

### Installation
```bash
# Clone the repository
git clone [repository-url]
cd z2k-plugin-new-card

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
