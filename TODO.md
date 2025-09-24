# EpochDashboard - 5 Day Sprint Plan

## Project Overview
Build a generic dashboard system with two core components:
1. **C++ Dashboard Library** - Pure data transformation library
   - Accepts DataFrames/Series as input
   - Outputs dashboard components as protobuf
   - No networking, no domain-specific logic

2. **JavaScript Package** - Modular React components
   - Renders dashboard components from protobuf data
   - Supports multiple data sources (direct data, URLs, files)
   - Built on HighCharts

## 5-Day Sprint Plan

### Day 1-2: C++ Dashboard Library

#### Day 1: Core Library Setup
- [ ] Morning: Define generic dashboard interfaces
  ```cpp
  class IDashboardFactory {
    virtual DashboardData Generate(DataFrame data) = 0;
    virtual ChartProto GetChart(size_t index) = 0;
    virtual TableProto GetTable(size_t index) = 0;
    virtual CardProto GetCard(size_t index) = 0;
  };
  ```
- [ ] Afternoon: Implement chart builders
  - Line, Bar, Histogram, Scatter, Area charts
  - Heatmap, Box plot, Pie chart
- [ ] Evening: Implement table and card builders

#### Day 2: Complete Library Features
- [ ] Morning: Create aggregation utilities
  - Time series resampling
  - Statistical calculations (mean, percentiles, etc.)
  - Rolling window operations
- [ ] Afternoon: Build factory implementations
  - TimeSeriesFactory (for temporal data)
  - DistributionFactory (for statistical analysis)
  - ComparisonFactory (for A/B comparisons)
- [ ] Evening: Package as shared library with clean API

### Day 3-4: JavaScript/React Package

#### Day 3: Package Foundation
- [ ] Morning: Initialize package structure
  ```
  /js
    /src
      /components
        /charts
        /tables
        /cards
        /layouts
      /utils
        /protobuf
        /data-loaders
    /dist
  ```
- [ ] Morning: TypeScript + build setup (Rollup/Vite)
- [ ] Afternoon: Core component interface
  ```tsx
  interface DashboardComponentProps {
    data?: Uint8Array;        // Direct protobuf
    url?: string;             // Fetch from URL
    filePath?: string;        // Load from file
    options?: RenderOptions;
  }
  ```
- [ ] Afternoon: Protobuf deserializer
- [ ] Evening: First chart component (LineChart)

#### Day 4: Complete Components
- [ ] Morning: Implement all chart components
  ```tsx
  <LineChart data={protobufData} />
  <BarChart url="/api/chart/1" />
  <Heatmap filePath="/data/heat.pb" />
  // ... etc
  ```
- [ ] Morning: Table component with sorting/pagination
- [ ] Afternoon: Card components for metrics
- [ ] Afternoon: Layout system
  ```tsx
  <DashboardGrid columns={3}>
    <ChartComponent />
    <TableComponent />
    <CardComponent />
  </DashboardGrid>
  ```
- [ ] Evening: Loading states, error boundaries

### Day 5: Polish & Documentation

- [ ] Morning: Data loading optimizations
  - Request batching
  - Caching layer
  - Progressive loading
- [ ] Afternoon: Build examples
  - Basic usage
  - Advanced layouts
  - Custom styling
- [ ] Evening: Package for distribution
  - NPM package setup
  - README with examples
  - API documentation

## Technical Requirements

### C++ Library
- **Input**: Generic DataFrames/Series
- **Output**: Protobuf messages
- **Dependencies**:
  - Protobuf
  - EpochFrame (for DataFrame)
- **No Dependencies On**:
  - HTTP/networking libraries
  - Domain-specific code

### JavaScript Package
- **Framework**: React + TypeScript
- **Charts**: HighCharts
- **Data**: Protobuf support
- **Bundle**: ESM + CommonJS
- **Size**: < 200KB gzipped (excluding HighCharts)

## Success Criteria

1. **C++ Library**
   - [ ] Generates valid protobuf for all component types
   - [ ] Clean API with no domain coupling
   - [ ] Compiles as shared library

2. **JS Package**
   - [ ] All components render from protobuf
   - [ ] Support 3 data source types
   - [ ] Works in React 16.8+
   - [ ] Published to NPM

## Example Usage

### C++ Library
```cpp
auto factory = CreateTimeSeriesFactory();
auto dashboard = factory->Generate(dataframe);
auto chart = factory->GetChart(0);  // Returns protobuf
```

### JavaScript Package
```tsx
import { Dashboard, LineChart, Table } from '@epoch/dashboard';

// Direct protobuf data
<LineChart data={chartProtobuf} />

// From URL
<Table url="/api/table/1" />

// Custom layout
<Dashboard.Grid columns={2}>
  <LineChart url="/api/chart/1" />
  <Table data={tableProtobuf} />
</Dashboard.Grid>
```

## Deliverables

1. **C++ shared library** (.so/.dll) with headers
2. **NPM package** with TypeScript definitions
3. **Basic documentation** with usage examples
4. **Sample application** demonstrating integration

---
*Sprint Start: Day 1*
*Sprint End: Day 5*
*Focus: Core functionality only - defer advanced features*