# Headerless Dashboard Implementation Plan
## Using HighCharts + EpochProtoObjects

---

## 🎯 Project Overview
Build a standalone, headerless dashboard component that renders financial performance metrics using HighCharts and EpochProtoObjects (protobuf-based data structures). This dashboard will be embeddable and reusable across different contexts without navigation headers or UI chrome.

---

## 📋 Analysis Summary

### Current PROD Implementation
**Location:** `/home/adesola/EpochLab/EpochWeb/src/modules/strategyBuilder/ViewPublishedStrategyPage/components/StrategyPerformanceTab/`

**Key Components:**
1. **StrategyPerformanceTab** - Main orchestrator with tabs/categories
2. **StrategyPerformanceChart** - Chart wrapper extracting protobuf chart types
3. **EpochChart** - Router component dispatching to specific chart types
4. **Specific Chart Components** - LineChart, BarChart, HeatmapChart, etc.
5. **StrategyPerformanceTable** - Table renderer
6. **StrategyPerformanceInfoCard** - Card/metric renderer

**Current Features:**
- Dynamic layout switching (3-col, 2-col, 2x2 grid)
- Responsive design with mobile dropdown
- Progressive loading with React.Suspense
- Category-based organization with tabs
- Support for cards, charts, and tables
- Integration with protobuf data structures

### Current C++ Implementation (Already Built)
**Location:** `/home/adesola/EpochLab/EpochDashboard/cpp/`

**✅ Existing Infrastructure:**
1. **TearSheetBuilder** - Simplified builder pattern for constructing TearSheets
   - `setCategory()` - Set category name
   - `addCard()` - Add card components
   - `addChart()` - Add chart components
   - `addTable()` - Add table components
   - `build()` - Generate TearSheet protobuf

2. **FullTearSheetBuilder** - Builder for complete multi-category tearsheets
   - `addCategory()` - Add category with TearSheet
   - `addCategoryBuilder()` - Add category with TearSheetBuilder
   - `build()` - Generate FullTearSheet protobuf

3. **Converter Classes** (Advanced - for DataFrame/Series conversion)
   - ScalarConverter
   - SeriesConverter
   - DataFrameConverter
   - ArrowConverter

**Design Pattern (Current):**
```cpp
// Simple usage pattern
TearSheetBuilder builder;
builder.setCategory("Performance")
       .addCard(cardDef)
       .addChart(chartProto)
       .addTable(tableProto);
auto tearsheet = builder.build();

// Multi-category usage
FullTearSheetBuilder fullBuilder;
fullBuilder.addCategoryBuilder("Performance", perfBuilder)
           .addCategoryBuilder("Risk", riskBuilder);
auto fullTearsheet = fullBuilder.build();
```

**🎯 Integration Strategy:**
- C++ side generates protobuf → JS side renders
- C++ library is **already functional** with simplified API
- Focus JS implementation on consuming existing protobuf output

### Existing Design System & Utilities (EpochWeb)
**Location:** `/home/adesola/EpochLab/EpochWeb/src/`

**🎨 Chart Utilities (REUSE THESE):**
1. **chartHelpers.ts** (`utils/chartHelpers.ts`)
   - `mapAxisTypeToHighcharts()` - Maps proto AxisType to Highcharts
   - `formatDatetimeValue()` - Formats datetime values
   - `formatChartPoint()` - Transforms proto Point to Highcharts format
   - `extendDefaultEpochChartOptions()` - Base Highcharts config
   - `getCubehelixPalette()` - Color palette generator

2. **scalarHelpers.ts** (`utils/scalarHelpers.ts`)
   - `getScalarNumericValue()` - Extract numeric from Scalar
   - `getScalarDatetimeValue()` - Extract datetime from Scalar
   - `getScalarStringValue()` - Extract string from Scalar
   - Handles all EpochFolioType conversions

3. **useChartProtobufData.ts** (`hooks/useChartProtobufData.ts`)
   - Parses protobuf chart data
   - Extracts axis configurations
   - Handles plot bands and straight lines
   - Custom tooltip formatters

4. **Chart Styling** (`Charts/EpochChart/styles.css`)
   - `.chartWrapper` - Responsive width handling
   - `.highcharts-text-outline` - Text styling fixes

**📊 Design Patterns to Adopt:**
- **Dual Y-Axis Detection:** Auto-detect when ratio > 2 between line max values
- **Invalid Data Filtering:** Filter timestamps < 946684800000 (year 2000)
- **DashStyle Enum:** Now in proto (Solid, Dash, Dot, etc.) - use directly
- **Scalar Extraction:** Always use helper functions, never direct access
- **Chart Router Pattern:** Switch on `EpochFolioDashboardWidget` enum

**🎯 Updated Proto Enums (Recently Added):**
```proto
enum DashStyle {
  DashStyleUnspecified = 0;
  Solid = 1;
  ShortDash = 2;
  // ... etc (see common.proto)
}

// Updated Line message
message Line {
  repeated Point data = 1;
  string name = 2;
  optional DashStyle dash_style = 3;  // Now uses enum!
  optional uint32 line_width = 4;
}
```

### Proto Structure
**Location:** `/home/adesola/EpochLab/EpochProtos/typescript_package/proto/`

**Core Proto Files:**
1. **common.proto** - Base types, enums, Scalar values
2. **chart_def.proto** - Chart definitions (Line, Bar, Heatmap, Histogram, BoxPlot, XRange, Pie)
3. **table_def.proto** - Table and Card definitions
4. **tearsheet.proto** - Complete tearsheet structure with categories

**Key Types:**
```
FullTearSheet {
  map<string, TearSheet> categories
}

TearSheet {
  CardDefList cards
  ChartList charts
  TableList tables
}

Chart (union type):
  - LinesDef
  - HeatMapDef
  - BarDef
  - HistogramDef
  - BoxPlotDef
  - XRangeDef
  - PieDef
```

---

## 📦 Implementation Tasks

### Phase 1: Foundation & Setup
**Goal:** Set up the base infrastructure for the headerless dashboard

#### Task 1.1: Project Structure
- [ ] Create `/home/adesola/EpochLab/EpochDashboard/js/src` directory
- [ ] Set up package.json with required dependencies
  - highcharts
  - highcharts-react-official
  - @epochlab/epoch-protos (TypeScript package)
  - protobufjs
  - React/TypeScript tooling
- [ ] Create tsconfig.json for TypeScript configuration
- [ ] Set up build tooling (Vite/Webpack/Rollup)

#### Task 1.2: Proto Integration
- [ ] Install @epochlab/epoch-protos package or link local package
- [ ] Create types/proto.ts for proto type exports
- [ ] Create utils/protoHelpers.ts for decoding/parsing protobuf messages
- [ ] Test protobuf deserialization with sample data

#### Task 1.3: Core Types & Interfaces
- [ ] Create types/dashboard.ts with dashboard-specific types
- [ ] Define DashboardProps interface
- [ ] Define layout configuration types
- [ ] Define theme/styling types

---

### Phase 2: Core Components
**Goal:** Build the essential rendering components

#### Task 2.1: Chart Components
- [ ] Create components/charts/ChartRouter.tsx (similar to EpochChart)
- [ ] Implement components/charts/LineChart.tsx
  - Extract protobuf LinesDef data
  - Transform to Highcharts options
  - Handle dual Y-axis scenarios
  - Support straight lines and plot bands
- [ ] Implement components/charts/BarChart.tsx
- [ ] Implement components/charts/HeatmapChart.tsx
- [ ] Implement components/charts/HistogramChart.tsx
- [ ] Implement components/charts/BoxPlotChart.tsx
- [ ] Implement components/charts/XRangeChart.tsx
- [ ] Implement components/charts/PieChart.tsx
- [ ] Create shared chart utilities in utils/chartHelpers.ts

#### Task 2.2: Table Component
- [ ] Create components/Table.tsx
  - Parse TableDef from proto
  - Render column headers with types
  - Handle Scalar value display
  - Support sorting/filtering (optional)
- [ ] Create utils/scalarHelpers.ts for Scalar value formatting
- [ ] Handle all EpochFolioType formatting (String, Integer, Decimal, Percent, DateTime, etc.)

#### Task 2.3: Card Component
- [ ] Create components/Card.tsx
  - Parse CardDef from proto
  - Display title and Scalar values
  - Support grouping (group_size)
  - Apply appropriate formatting per type

---

### Phase 3: Layout & Orchestration
**Goal:** Build the main dashboard container and layout system

#### Task 3.1: Layout System
- [ ] Create components/DashboardLayout.tsx
  - Support 3-column layout
  - Support 2-column layout
  - Support 2x2 grid layout
  - Responsive behavior
- [ ] Create hooks/useLayout.ts for layout state management
- [ ] Create components/LayoutControls.tsx (optional - for headerless might be excluded)

#### Task 3.2: Category Renderer
- [ ] Create components/CategoryContent.tsx
  - Iterate through TearSheet.cards
  - Iterate through TearSheet.charts
  - Iterate through TearSheet.tables
  - Apply layout grid
  - Handle empty states

#### Task 3.3: Main Dashboard Component
- [ ] Create components/Dashboard.tsx
  - Accept FullTearSheet protobuf data
  - Accept category selection (optional - might render single category)
  - Render category content
  - No headers, no tabs (headerless)
  - Export as main entry point

---

### Phase 4: Data Loading & Integration
**Goal:** Handle data fetching and protobuf decoding

#### Task 4.1: Data Provider
- [ ] Create hooks/useDashboardData.ts
  - Fetch protobuf binary data from API
  - Decode using protobufjs
  - Transform to FullTearSheet
  - Handle loading/error states
- [ ] Create context/DashboardContext.tsx for global state (optional)

#### Task 4.2: API Integration
- [ ] Create services/dashboardApi.ts
  - Endpoint: `/api/v1/dashboard/tearsheet/:id`
  - Return protobuf binary or base64
  - Handle authentication/headers
- [ ] Create utils/protoDecoder.ts
  - Decode FullTearSheet from binary
  - Validate proto structure
  - Handle errors gracefully

---

### Phase 5: Styling & Theming
**Goal:** Apply consistent styling and theme support

#### Task 5.1: Chart Styling
- [ ] Create config/chartTheme.ts
  - Define Highcharts theme
  - Color palettes
  - Font styles
  - Grid/axis styling
- [ ] Create utils/applyChartTheme.ts
  - Extend default Highcharts options
  - Apply custom theme
  - Support dark/light modes (if needed)

#### Task 5.2: Component Styling
- [ ] Create styles/dashboard.css (or styled-components)
  - Grid layouts
  - Card styles
  - Table styles
  - Responsive breakpoints
- [ ] Create styles/theme.ts
  - Color variables
  - Spacing/sizing tokens
  - Typography scales

---

### Phase 6: Progressive Enhancement
**Goal:** Add loading states, error handling, and optimizations

#### Task 6.1: Loading States
- [ ] Create components/Skeleton.tsx
  - Chart skeleton
  - Table skeleton
  - Card skeleton
- [ ] Implement React.Suspense boundaries
- [ ] Add progressive rendering for large datasets

#### Task 6.2: Error Handling
- [ ] Create components/ErrorBoundary.tsx
- [ ] Create components/ErrorMessage.tsx
- [ ] Add fallback UI for failed charts/tables/cards
- [ ] Log errors appropriately

#### Task 6.3: Performance Optimization
- [ ] Implement useMemo for expensive calculations
- [ ] Virtualize large tables (react-window/react-virtual)
- [ ] Lazy load chart components
- [ ] Optimize protobuf decoding

---

### Phase 7: Testing & Documentation
**Goal:** Ensure reliability and developer experience

#### Task 7.1: Testing
- [ ] Write unit tests for proto helpers
- [ ] Write unit tests for chart transformers
- [ ] Write integration tests for Dashboard component
- [ ] Test with real protobuf data from backend
- [ ] Test all chart types
- [ ] Test responsive layouts

#### Task 7.2: Documentation
- [ ] Create README.md with usage examples
- [ ] Document prop interfaces
- [ ] Create example usage in index.tsx
- [ ] Document protobuf data requirements
- [ ] Add inline JSDoc comments

#### Task 7.3: Examples
- [ ] Create examples/basic.tsx
- [ ] Create examples/withCustomTheme.tsx
- [ ] Create examples/embedInReact.tsx
- [ ] Create examples/protoMockData.ts

---

### Phase 8: Build & Deployment
**Goal:** Package and deploy the dashboard library

#### Task 8.1: Build Configuration
- [ ] Configure build for ESM/CJS/UMD
- [ ] Set up source maps
- [ ] Configure tree-shaking
- [ ] Optimize bundle size
- [ ] Set up type declarations (.d.ts)

#### Task 8.2: Package Setup
- [ ] Configure package.json exports
- [ ] Set up NPM publishing (if standalone package)
- [ ] Create CHANGELOG.md
- [ ] Version using semantic versioning

#### Task 8.3: Integration
- [ ] Create integration guide for EpochWeb
- [ ] Test embedding in existing apps
- [ ] Document API endpoint requirements
- [ ] Document authentication/CORS considerations

---

## 🔄 Migration from PROD

### Components to Extract & Adapt
1. **Chart Components** (from EpochWeb Charts folder)
   - LineChart.tsx → Simplify, remove external dependencies
   - BarChart.tsx → Adapt for standalone use
   - HeatmapChart.tsx → Extract protobuf parsing
   - etc.

2. **Utilities**
   - chartHelpers.ts → Extract formatting utilities
   - scalarHelpers.ts → Port Scalar value handling
   - useChartProtobufData.ts → Adapt hook for proto parsing

3. **Constants**
   - CHART_COLOR_CONFIG → Port color configuration
   - AxisType → Use from proto enums

### Key Differences from PROD
- ❌ **Remove:** Tabs, navigation, headers
- ❌ **Remove:** Strategy-specific logic
- ❌ **Remove:** API hooks tied to specific endpoints
- ✅ **Keep:** Grid layouts
- ✅ **Keep:** Chart rendering logic
- ✅ **Keep:** Protobuf parsing
- ✅ **Keep:** Responsive design
- ✅ **Add:** Generic data provider
- ✅ **Add:** Standalone package structure

---

## 📊 Data Flow

```
API Endpoint (protobuf binary)
    ↓
useDashboardData (fetch & decode)
    ↓
FullTearSheet object
    ↓
Dashboard component (select category)
    ↓
TearSheet object (cards + charts + tables)
    ↓
CategoryContent (render grid)
    ↓
┌─────────────────────────────────┐
│  Card → CardDef → Display       │
│  Chart → Chart union → Router   │
│  Table → TableDef → Render      │
└─────────────────────────────────┘
    ↓
HighCharts visualization
```

---

## 🛠️ Tech Stack

### Core
- **React** 18+ (with TypeScript)
- **HighCharts** + highcharts-react-official
- **Protobuf.js** (for decoding)
- **@epochlab/epoch-protos** (TypeScript proto package)

### Build Tools
- **Vite** (or Rollup/Webpack)
- **TypeScript** 5.x
- **ESLint** + **Prettier**

### Optional
- **React Query** (for data fetching)
- **Zustand** (for state management)
- **Tailwind CSS** (for styling)
- **Storybook** (for component development)

---

## ✅ Success Criteria

1. **Functional**
   - [ ] Renders all chart types from protobuf
   - [ ] Renders tables with all Scalar types
   - [ ] Renders cards with grouping
   - [ ] Supports all layout modes
   - [ ] Handles loading/error states gracefully

2. **Performance**
   - [ ] Initial render < 2s for typical dataset
   - [ ] Smooth 60fps scrolling
   - [ ] Bundle size < 500KB (gzipped)

3. **Reusability**
   - [ ] No hardcoded strategy/user logic
   - [ ] Accepts generic protobuf data
   - [ ] Themeable and customizable
   - [ ] Works in any React app

4. **Quality**
   - [ ] Full TypeScript coverage
   - [ ] 80%+ test coverage
   - [ ] Zero console errors
   - [ ] Accessible (WCAG AA)

---

## 📝 Notes

### Protobuf Considerations
- The proto uses `oneof` for Chart types - ensure proper type narrowing
- Scalar values need careful formatting based on EpochFolioType
- Handle null values gracefully (google.protobuf.NullValue)

### HighCharts Integration
- Use `extendDefaultEpochChartOptions` pattern from PROD
- Support dual Y-axis for specific scenarios
- Implement custom tooltip formatters
- Handle plot bands and straight lines

### Responsive Design
- Breakpoints: mobile (<768px), tablet (768-1280px), desktop (>1280px)
- Mobile: Single column + dropdown for categories
- Desktop: Multi-column with layout controls

---

## 🚀 Getting Started Order

**Recommended Task Execution Order:**
1. Phase 1 (Foundation) → Critical path
2. Phase 2.1 (Chart Components) → Start with LineChart
3. Phase 2.2 (Table Component) → Parallel to charts
4. Phase 2.3 (Card Component) → Parallel to charts
5. Phase 3 (Layout & Orchestration) → After components ready
6. Phase 4 (Data Loading) → Can develop in parallel with components
7. Phase 5 (Styling) → Throughout development
8. Phase 6 (Progressive Enhancement) → After core functionality
9. Phase 7 (Testing) → Throughout + final phase
10. Phase 8 (Build & Deployment) → Final phase

---

**Last Updated:** 2025-09-23
**Status:** Planning Phase