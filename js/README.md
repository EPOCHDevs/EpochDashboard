# Epoch Dashboard Monorepo

A professional React dashboard component library for visualizing TearSheet protobuf data, organized as a monorepo with package and development apps.

![EpochLab Epoch Dashboard](https://img.shields.io/badge/EpochLab-Epoch%20Dashboard-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🏗️ Project Structure

This repository follows the modern monorepo pattern used by popular open-source libraries:

```
EpochDashboard/js/
├── packages/
│   └── epoch-dashboard/               # 📦 Main exportable package
│       ├── src/                      # Package source code
│       ├── dist/                     # Built package output
│       ├── package.json              # Package configuration
│       └── README.md                 # Package documentation
├── apps/
│   ├── playground/                   # 🎮 Next.js development playground
│   │   ├── pages/                   # Playground pages
│   │   ├── components/              # Playground components
│   │   └── package.json             # Playground dependencies
│   └── examples/                     # 📚 Standalone usage examples
│       ├── basic-usage/
│       ├── custom-theming/
│       └── file-upload/
├── package.json                      # 🏠 Root workspace configuration
└── README.md                         # This file
```

## 🚀 Quick Start

### For Package Users

Install the published package:

```bash
npm install @epochlab/epoch-dashboard
```

Basic usage:

```tsx
import { TearsheetDashboard } from '@epochlab/epoch-dashboard'
import '@epochlab/epoch-dashboard/styles'

function App({ tearsheet }) {
  return (
    <TearsheetDashboard tearsheet={tearsheet} />
  )
}
```

📖 **[Full Package Documentation →](packages/epoch-dashboard/README.md)**

### For Developers

Clone and set up the development environment:

```bash
git clone <repository>
cd EpochDashboard/js

# Install dependencies for all packages
npm install

# Start the development playground
npm run dev

# Or specifically run playground
npm run dev:playground
```

Visit **http://localhost:3000** to see the playground.

## 🎯 What's Included

### 📦 Package (`packages/epoch-dashboard/`)

The main React component library including:

- **TearsheetDashboard** - Complete dashboard component
- **Individual Charts** - LineChart, BarChart, HeatMap, etc.
- **Data Tables** - Sortable, filterable tables
- **Card Components** - Metric display cards
- **Utility Functions** - File handling, data processing
- **TypeScript Support** - Full type definitions
- **Tailwind Styling** - Customizable themes

### 🎮 Playground (`apps/playground/`)

Next.js development app featuring:

- Live component testing
- File upload interface
- Multiple layout options
- Real-time chart interactions
- Development examples

### 📚 Examples (`apps/examples/`)

Standalone usage examples:

- **Basic Usage** - Minimal setup example
- **Custom Theming** - Styling customization
- **File Upload** - Drag & drop integration

## 🛠️ Development Commands

### Root Commands

```bash
# Development
npm run dev                    # Start playground
npm run dev:playground         # Start playground explicitly

# Building
npm run build                  # Build package + playground
npm run build:package          # Build package only
npm run build:playground       # Build playground only

# Quality Checks
npm run type-check             # TypeScript checking
npm run lint                   # ESLint checking
npm run clean                  # Clean build artifacts

# Publishing
npm run publish:package        # Publish package to npm
```

### Package Commands

```bash
cd packages/epoch-dashboard

npm run build                  # Build package
npm run build:types            # Generate TypeScript definitions
npm run build:watch            # Watch mode building
npm run type-check             # Type checking
npm run clean                  # Clean dist folder
```

### Playground Commands

```bash
cd apps/playground

npm run dev                    # Development server
npm run build                  # Production build
npm run start                  # Start production server
npm run type-check             # Type checking
npm run lint                   # Linting
```

## 🎨 Features

### Package Features

- **Proto-First Architecture** - Built specifically for TearSheet protobuf data
- **Zero Configuration** - Works out of the box with sensible defaults
- **Fully Customizable** - Tailwind CSS-based styling system
- **Responsive Design** - Adaptive layouts for all screen sizes
- **Interactive Charts** - Powered by Highcharts with custom theming
- **File Support** - Drag & drop protobuf (.pb) and JSON file handling
- **TypeScript Native** - Complete type safety and IntelliSense support

### Development Features

- **Live Playground** - Real-time component testing and development
- **Hot Reloading** - Instant feedback during development
- **Example Gallery** - Multiple usage patterns and implementations
- **Workspace Setup** - Professional monorepo structure
- **Build Optimization** - Separate package and app builds

## 📖 Documentation

### Package Documentation
- **[Package README](packages/epoch-dashboard/README.md)** - Installation, API, examples
- **[TypeScript Definitions](packages/epoch-dashboard/dist/index.d.ts)** - Generated after build

### Example Documentation
- **[Examples README](apps/examples/README.md)** - Usage examples and patterns
- **[Playground](apps/playground/)** - Interactive examples and testing

### Development Documentation
- **Architecture** - Package/apps separation following industry standards
- **Build System** - Rollup for package, Next.js for playground
- **Workspace** - npm workspaces for dependency management

## 🔄 Development Workflow

### Making Changes to the Package

1. **Edit package source**: `packages/epoch-dashboard/src/`
2. **Test in playground**: `npm run dev` (auto-reloads)
3. **Build package**: `npm run build:package`
4. **Type check**: `npm run type-check`
5. **Publish**: `npm run publish:package`

### Adding New Examples

1. **Create example**: `apps/examples/my-example/`
2. **Add to README**: Update examples documentation
3. **Test standalone**: Ensure example works independently

### Testing Changes

1. **Playground**: Live testing at `http://localhost:3000`
2. **Examples**: Static examples in `apps/examples/`
3. **Build validation**: `npm run build` to ensure everything compiles

## 🚀 Deployment

### Package Deployment

The package is published to npm:

```bash
npm run publish:package
```

### Playground Deployment

The playground can be deployed to any Next.js-compatible platform:

```bash
npm run build:playground
```

## 🏆 Benefits of This Structure

### For Package Users
- ✅ **Clean Installation** - Only get the package, no example bloat
- ✅ **Professional API** - Well-defined exports and TypeScript support
- ✅ **Smaller Bundle** - Optimized package size
- ✅ **Clear Documentation** - Focused package docs

### For Developers
- ✅ **Better Development** - Live testing with playground
- ✅ **Organized Code** - Clear separation of concerns
- ✅ **Easier Maintenance** - Independent versioning and updates
- ✅ **Example Collection** - Reference implementations

### For the Ecosystem
- ✅ **Industry Standard** - Follows patterns from React, Chakra UI, etc.
- ✅ **Contribution Friendly** - Clear structure for contributors
- ✅ **Professional Quality** - Enterprise-ready organization
- ✅ **Scalable** - Easy to add new packages or apps

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes in appropriate package/app
4. Test in playground (`npm run dev`)
5. Ensure builds pass (`npm run build`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines

- **Package changes**: Update in `packages/epoch-dashboard/`
- **Example additions**: Add to `apps/examples/`
- **Playground improvements**: Update `apps/playground/`
- **Documentation**: Update relevant README files

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **[Package Documentation](packages/epoch-dashboard/README.md)** - Full API and usage docs
- **[Live Playground](http://localhost:3000)** - Interactive examples (when running)
- **[GitHub Repository](https://github.com/EPOCHDevs/EpochDashboard)**
- **[NPM Package](https://www.npmjs.com/package/@epochlab/epoch-dashboard)**
- **[Issues](https://github.com/EPOCHDevs/EpochDashboard/issues)**

---

Built with ❤️ by [EpochLab](https://epochlab.com) using the same patterns as leading open-source libraries.