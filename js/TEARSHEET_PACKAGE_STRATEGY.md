# EpochLab Tearsheet Dashboard - Package Strategy

## Overview

This document outlines the strategy for packaging the EpochLab Dashboard as a focused, reusable React component library centered around TearSheet visualization with customizable Tailwind CSS styling.

## Core Philosophy

- **Proto-First**: TearSheet protobuf objects are the single source of truth for all data
- **Minimal API**: Expose only TearsheetDashboard component with simple customization options
- **Tailwind-Native**: All styling done through Tailwind CSS for maximum flexibility
- **Playground Included**: Keep development/testing environment for protobuf upload

## Package Structure

### Main Export: TearsheetDashboard

The package exposes a single main component:

```typescript
interface TearsheetDashboardProps {
  tearsheet: TearSheet                    // Proto object (required)
  className?: string                      // Custom styling
  hideLayoutControls?: boolean            // Hide layout picker
  onCategoryChange?: (category: string) => void
  onLayoutChange?: (layout: string) => void
}
```

### Supporting Exports

1. **Type Definitions**:
   - All proto types (TearSheet, Chart, Table, CardDef, etc.)
   - Layout and theme types

2. **Utility Functions**:
   - `downloadTearsheet()` - Export functionality
   - `readTearsheetFile()` - File upload helper
   - `groupByCategory()` - Data organization
   - Theme helpers

3. **Individual Components** (optional):
   - Chart components (LineChart, BarChart, etc.)
   - TearsheetTable
   - Card components

## Tailwind CSS Styling Strategy

### 1. Pre-built Theme Classes

Package includes comprehensive Tailwind classes for:

```css
/* Primary color palette */
.bg-primary-bluishDarkGray    /* #131722 - Main background */
.bg-secondary-darkGray        /* #161a25 - Card background */
.text-primary-white           /* #FFFFFF - Primary text */
.text-secondary-ashGrey       /* #787b86 - Secondary text */

/* Territory colors */
.text-territory-cyan          /* #00bcd4 - Accent */
.bg-territory-success         /* #26a69a - Success */
.border-territory-alert       /* #f23645 - Error */

/* Glass morphism utilities */
.glass                        /* Semi-transparent backdrop */
.glass-border                 /* Subtle border styling */

/* Chart-specific colors */
.chart-strategy               /* Cyan theme for strategy data */
.chart-benchmark              /* Blue theme for benchmark data */
.chart-long                   /* Green theme for long positions */
.chart-short                  /* Red theme for short positions */
```

### 2. Customization Approach

Users can override styling in three ways:

#### A. CSS Custom Properties (Recommended)
```css
:root {
  --dashboard-bg: #131722;
  --dashboard-card-bg: #161a25;
  --dashboard-text: #ffffff;
  --dashboard-accent: #00bcd4;
}
```

#### B. Tailwind Config Extension
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'dashboard-primary': '#131722',
        'dashboard-accent': '#00bcd4',
      }
    }
  }
}
```

#### C. Direct className Override
```tsx
<TearsheetDashboard
  tearsheet={data}
  className="bg-slate-900 text-slate-100"
/>
```

### 3. Responsive Design

Built-in responsive classes:
- `xl:grid-cols-3` - 3 columns on large screens
- `lg:grid-cols-2` - 2 columns on medium screens
- `sm:grid-cols-1` - Single column on mobile

## File Structure

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── TearsheetDashboard.tsx      # Main component
│   │   ├── TearsheetCategoryContent.tsx
│   │   ├── TearsheetTable.tsx
│   │   └── index.tsx
│   ├── charts/                         # Individual chart components
│   └── Card.tsx
├── styles/
│   ├── dashboard.css                   # Pre-built Tailwind classes
│   └── globals.css                     # Base styles
├── utils/
│   ├── tearsheetHelpers.ts            # Core utilities
│   ├── downloadTearsheet.ts           # Export functionality
│   ├── chartTheme.ts                  # Highcharts theme
│   └── protoHelpers.ts                # Proto utilities
├── types/
│   ├── proto.ts                       # Proto type definitions
│   └── dashboard.ts                   # Component interfaces
├── constants/
│   └── index.ts                       # Color schemes & themes
└── index.ts                           # Main package export
```

## Package Exports

### Primary Export
```typescript
// Main component
export { default as TearsheetDashboard } from './components/Dashboard/TearsheetDashboard'

// Utility functions
export {
  downloadTearsheet,
  readTearsheetFile,
  groupByCategory,
  formatCategoryLabel
} from './utils'

// Type definitions
export type {
  TearSheet,
  Chart,
  Table,
  CardDef
} from './types/proto'
```

### Secondary Exports (Advanced Usage)
```typescript
// Individual components for custom layouts
export { default as LineChart } from './components/charts/LineChart'
export { default as TearsheetTable } from './components/Dashboard/TearsheetTable'

// Theme utilities
export { applyHighchartsTheme } from './utils/chartTheme'
export { DASHBOARD_THEME } from './constants'
```

## Protobuf Integration Strategy

### 1. File Upload Support

Include utilities for handling .pb files:

```typescript
// Handle protobuf binary files
const handleFileUpload = async (file: File) => {
  if (file.name.endsWith('.pb')) {
    const buffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(buffer)
    const tearsheet = TearSheetClass.decode(uint8Array)
    return tearsheet
  }
}
```

### 2. Server Integration Examples

Provide Next.js API route examples:

```typescript
// pages/api/tearsheet/upload.ts
export default async function handler(req, res) {
  const tearsheet = TearSheetClass.decode(req.body)
  // Process and return
  res.json({ success: true, data: tearsheet })
}
```

## Playground Environment

### Development Setup

Keep existing test page structure:
- `/pages/test-tearsheet.tsx` - Main testing interface
- `/pages/api/tearsheet/example` - Sample data endpoint
- Drag & drop protobuf upload
- Example data loading

### Features

1. **File Upload Interface**:
   - Drag & drop .pb files
   - Visual feedback during processing
   - Error handling for malformed files

2. **Layout Testing**:
   - Switch between column layouts
   - Responsive preview
   - Category filtering

3. **Export Testing**:
   - Download functionality
   - Different format options

## Package Distribution

### 1. NPM Package Structure

```json
{
  "name": "@epochlab/tearsheet-dashboard",
  "version": "1.0.0",
  "description": "React dashboard component for TearSheet protobuf visualization",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "styles"],
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "tailwindcss": "^3.0.0"
  }
}
```

### 2. CSS Distribution

Include pre-compiled CSS for users without Tailwind:

```
dist/
├── index.js                 # Main component bundle
├── index.esm.js            # ES module bundle
├── index.d.ts              # TypeScript definitions
└── styles/
    ├── dashboard.css       # Full Tailwind classes
    └── dashboard.min.css   # Minified version
```

## Implementation Priority

1. **Phase 1**: Core TearsheetDashboard component with basic styling
2. **Phase 2**: Tailwind CSS integration and theme system
3. **Phase 3**: Protobuf upload utilities and playground
4. **Phase 4**: Advanced customization and individual component exports
5. **Phase 5**: Documentation and examples

## Success Metrics

- Single import for most use cases: `import { TearsheetDashboard } from '@epochlab/tearsheet-dashboard'`
- Easy styling customization through Tailwind classes
- Protobuf-first approach with zero JSON conversion
- Playground environment for rapid development
- Comprehensive documentation with Next.js examples

This strategy ensures the package is focused, easy to use, and provides maximum flexibility for customization while maintaining the power of the protobuf-driven data model.