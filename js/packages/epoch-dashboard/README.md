# @epochlab/epoch-dashboard

A powerful, customizable React dashboard component for visualizing TearSheet protobuf data with Tailwind CSS styling.

![EpochLab Epoch Dashboard](https://img.shields.io/badge/EpochLab-Epoch%20Dashboard-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Features

- **Proto-First**: Built specifically for TearSheet protobuf objects
- **Fully Customizable**: Tailwind CSS-based styling with CSS custom properties
- **Responsive Design**: Adaptive layouts for all screen sizes
- **Interactive Charts**: Powered by Highcharts with custom theming
- **File Upload**: Drag & drop protobuf (.pb) file support
- **TypeScript**: Full type safety and intellisense
- **Zero Config**: Works out of the box with sensible defaults

## 📦 Installation

```bash
npm install @epochlab/epoch-dashboard
# or
yarn add @epochlab/epoch-dashboard
# or
pnpm add @epochlab/epoch-dashboard
```

### Peer Dependencies

This package requires React 18+ and Tailwind CSS 3+:

```bash
npm install react react-dom tailwindcss
```

## 🎯 Quick Start

### Basic Usage

```tsx
import React from 'react'
import { TearsheetDashboard } from '@epochlab/epoch-dashboard'
import '@epochlab/epoch-dashboard/styles'

function App() {
  const [tearsheet, setTearsheet] = React.useState(null)

  // Load your tearsheet data
  React.useEffect(() => {
    loadTearsheetData().then(setTearsheet)
  }, [])

  if (!tearsheet) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-primary-bluishDarkGray">
      <TearsheetDashboard
        tearsheet={tearsheet}
        className="h-screen p-8"
      />
    </div>
  )
}
```

### With Custom Styling

```tsx
import { TearsheetDashboard } from '@epochlab/epoch-dashboard'

function CustomDashboard({ tearsheet }) {
  return (
    <TearsheetDashboard
      tearsheet={tearsheet}
      className="bg-slate-900 text-white" // Override default styling
      hideLayoutControls={false}
      onCategoryChange={(category) => console.log('Category:', category)}
      onLayoutChange={(layout) => console.log('Layout:', layout)}
    />
  )
}
```

## 📊 API Reference

### TearsheetDashboard Component

```tsx
interface TearsheetDashboardProps {
  tearsheet: TearSheet              // Required: Proto data
  className?: string                 // Optional: Additional CSS classes
  hideLayoutControls?: boolean       // Optional: Hide layout switcher
  onCategoryChange?: (category: string) => void  // Optional: Category callback
  onLayoutChange?: (layout: string) => void      // Optional: Layout callback
}
```

### Individual Components

```tsx
import {
  LineChart,
  BarChart,
  TearsheetTable,
  Card
} from '@epochlab/epoch-dashboard'

// Use individual components for custom layouts
<LineChart data={tearsheet.charts.charts[0].linesDef} height={400} />
<TearsheetTable table={tearsheet.tables.tables[0]} />
```

### Utility Functions

```tsx
import {
  downloadTearsheet,
  readTearsheetFile,
  groupByCategory
} from '@epochlab/epoch-dashboard'

// File handling
const data = await readTearsheetFile(file)
downloadTearsheet(tearsheet, 'my-tearsheet.pb')

// Data processing
const categoryData = groupByCategory(tearsheet)
```

## 🧪 Development & Testing

### Test Data Server

For development and testing, the package includes a test data server that provides mock tearsheet data:

```bash
# From the monorepo root (EpochDashboard/js/)
cd apps/playground

# Start the test server (runs on port 3001)
node scripts/test-server.js
```

The test server provides these endpoints:

- **GET `/api/tearsheet/:id`** - Returns tearsheet data for any strategy ID
- **GET `/api/tearsheet/example`** - Returns example tearsheet data
- **GET `/health`** - Health check endpoint

Example usage:
```bash
# Get tearsheet data for a strategy
curl http://localhost:3001/api/tearsheet/my-strategy

# Get example data
curl http://localhost:3001/api/tearsheet/example

# Health check
curl http://localhost:3001/health
```

### Using with Playground

When running the playground with the test server:

```bash
# Terminal 1: Start the test server
cd apps/playground && node scripts/test-server.js

# Terminal 2: Start the playground
npm run dev

# Visit these URLs:
# http://localhost:3000/dashboard/my-strategy
# http://localhost:3000/dashboard/minimal
# http://localhost:3000/dashboard/example
```

The playground will automatically fetch data from the test server based on the strategy ID in the URL.

## 🎨 Styling & Theming

### CSS Custom Properties

```css
/* globals.css */
:root {
  --dashboard-bg-primary: #1a202c;
  --dashboard-bg-secondary: #2d3748;
  --dashboard-text-primary: #f7fafc;
  --dashboard-accent-cyan: #38b2ac;
}
```

### Tailwind Config Extension

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'dashboard-primary': '#1a202c',
        'dashboard-accent': '#38b2ac',
      }
    }
  }
}
```

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Documentation](https://docs.epochlab.com/tearsheet-dashboard)
- [GitHub Repository](https://github.com/epochlab/tearsheet-dashboard)
- [Issues](https://github.com/epochlab/tearsheet-dashboard/issues)