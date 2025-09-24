# @epochlab/dashboard

Headerless dashboard component for rendering HighCharts visualizations from EpochProto objects.

## Installation

```bash
npm install @epochlab/dashboard highcharts highcharts-react-official
```

## Quick Start

```tsx
import { Dashboard } from '@epochlab/dashboard'

function App() {
  const tearsheetData = // ... FullTearSheet protobuf data

  return <Dashboard data={tearsheetData} />
}
```

## Features

- 📊 **Multiple Chart Types**: Line, Bar, Heatmap, Histogram, BoxPlot, XRange, Pie
- 📋 **Data Tables**: Render tables with sorting and formatting
- 📈 **Metric Cards**: Display key metrics with formatting
- 🎨 **Customizable Layouts**: 3-column, 2-column, 2x2 grid, single column
- 📱 **Responsive**: Mobile-first design with adaptive layouts
- 🎯 **TypeScript**: Full type safety with TypeScript
- 🚀 **Performance**: Optimized rendering with React best practices

## API

### Dashboard Component

```tsx
interface DashboardProps {
  data: FullTearSheet
  category?: string
  layout?: DashboardLayout
  className?: string
  onCategoryChange?: (category: string) => void
}
```

## Development

### Setup

```bash
# Navigate to dashboard directory
cd /home/adesola/EpochLab/EpochDashboard/js

# Install dependencies
npm install

# Start development server
npm run dev
```

### Preview Components

The dev server runs a component preview app at **http://localhost:5173/**

- Navigate between components using the sidebar
- Each component has its own example page with mock data
- Verify styling and functionality before building

### Component Status

- ✓ **Card** - Done
- ○ **Table** - Pending
- ○ **Charts** (Line, Bar, Heatmap, etc.) - Pending
- ○ **Full Dashboard** - Pending

### Build for Production

```bash
# Build library
npm run build

# Run tests
npm test

# Type check
npm run type-check
```

## License

MIT