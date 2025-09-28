# CandleStick Chart Migration Plan

## Overview
Migrating EpochWeb's CandleStick chart to EpochDashboard as a specialized backtest insights dashboard, NOT a general trading platform.

## Current Status
Currently working with a standalone HTML test file (`test-candlestick-backtest.html`) for rapid prototyping. This needs to be properly integrated into the Next.js EpochDashboard application.

## Completed Phases

### Phase 1: Basic CandleStick Component ✅
**Completed Tasks:**
- Created basic CandleStick chart structure with TypeScript
- Integrated Highcharts/Highstock for charting
- Built initial selector bar with asset and timeframe selectors
- Set up mock data generation

**Issues Fixed:**
- Chart had fixed height instead of filling available space
- Implemented ResizeObserver for dynamic sizing
- Disabled Highcharts navigator that was incorrectly positioned
- Adjusted yAxis heights after navigator removal (80% price, 18% volume)

### Phase 2: Dynamic Selector Framework ✅
**Completed Tasks:**
- Created DynamicSelector component for reusable selector patterns
- Implemented dropdown, dialog, and sidebar display modes
- Added expandable card system for showing trade details
- Built server configuration structure for dynamic UI

**Issues Fixed:**
- Removed hardcoded trades - made them dynamic
- Added server-driven configuration support
- Implemented card expand/collapse functionality

### Phase 3: Backtest Focus (Partial) 🔄
**Completed Tasks:**
- Refocused from general trading platform to backtest insights
- Created sidebar with tabs (Trades, Indicators, Insights)
- Implemented collapsible sidebar with proper positioning
- Added trade selection that focuses chart on trade period
- Created expandable cards showing indicator values

**Issues Fixed:**
- Removed unnecessary header row
- Moved sidebar collapse button from right to left side
- Fixed collapse button icon direction
- Removed unnecessary footer/status bar
- Added asset selector dialog with search functionality
- Fixed chart height filling issues
- Made chart responsive with ResizeObserver
- Removed search from sidebar (not useful for small datasets)

## Current Issues

### 1. Architecture Problem
- **Issue**: Working in standalone HTML file instead of Next.js components
- **Impact**: Not integrated with main application, no TypeScript, no proper component structure
- **Solution**: Need to migrate to proper React components in Next.js app

### 2. Chart Integration
- **Issue**: Chart fills height but needs better integration with layout
- **Current State**: Works but using inline styles and absolute positioning

### 3. Missing Features from Requirements
- **Trade datetime selectors**: Need to add date range selection for focusing on specific periods
- **Strategy metadata display**: Currently showing mock data, needs real integration
- **Arrow data integration**: No actual Apache Arrow data processing yet

## Next Phases

### Phase 4: Next.js Integration 🔜
**Tasks:**
1. Convert HTML prototype to proper React components
2. Create file structure:
   ```
   src/components/charts/CandleStick/
   ├── CandleStickChart.tsx (main component)
   ├── components/
   │   ├── SelectorBar.tsx
   │   ├── AssetDialog.tsx
   │   ├── Sidebar/
   │   │   ├── SidebarContainer.tsx
   │   │   ├── TradeCard.tsx
   │   │   ├── IndicatorCard.tsx
   │   │   └── InsightCard.tsx
   │   └── ChartContainer.tsx
   ├── hooks/
   │   ├── useBacktestData.ts
   │   └── useChartResize.ts
   ├── types/
   │   └── backtest.types.ts
   └── utils/
       └── chartConfig.ts
   ```
3. Implement TypeScript interfaces for all data types
4. Add proper state management (Context or Redux)
5. Create proper CSS modules or styled-components

### Phase 5: Data Integration 🔜
**Tasks:**
1. Integrate with actual backend endpoints
2. Implement Apache Arrow data processing
3. Connect to real backtest results
4. Add WebSocket support for live updates
5. Implement caching strategy (React Query + IndexedDB)

### Phase 6: Enhanced Features 🔜
**Tasks:**
1. Add datetime range selectors
2. Implement trade annotations on chart
3. Add indicator overlays (MA, Bollinger Bands, etc.)
4. Create performance metrics dashboard
5. Add export functionality (PNG, CSV, PDF)

### Phase 7: Advanced Selectors 🔜
**Tasks:**
1. Reuse EpochWeb's AssetSelectionModal component
2. Add strategy selector with metadata
3. Implement indicator configuration panels
4. Add comparison mode (multiple strategies)
5. Create custom time range selector

### Phase 8: Testing & Optimization 🔜
**Tasks:**
1. Add unit tests for all components
2. Implement E2E tests for user workflows
3. Optimize chart rendering performance
4. Add proper error boundaries
5. Implement loading states

## Technical Debt to Address

1. **Component Structure**: Move from monolithic HTML to modular components
2. **Type Safety**: Add proper TypeScript types throughout
3. **State Management**: Implement proper state management solution
4. **Testing**: No tests currently exist
5. **Documentation**: Need proper component documentation
6. **Accessibility**: Add ARIA labels and keyboard navigation

## Migration Strategy

### Step 1: Create Component Structure
```bash
# Create proper component files
src/components/charts/CandleStick/
├── index.ts (exports)
├── CandleStickChart.tsx
└── [other components]
```

### Step 2: Extract Styles
- Move inline styles to CSS modules
- Create theme variables for consistent styling
- Implement dark/light theme support

### Step 3: Add to Dashboard
- Create new page: `pages/backtest/[id].tsx`
- Add navigation from main dashboard
- Implement routing with backtest ID

### Step 4: Connect to Backend
- Define API endpoints
- Implement data fetching hooks
- Add error handling

## Current Look & Feel
- Dark theme with transparent backgrounds
- Collapsible sidebar on left with trade/indicator/insight tabs
- Asset selector with dialog and search
- Timeframe buttons in top bar
- Responsive candlestick chart with volume
- Expandable cards showing trade details and indicators
- Color coding: Green (wins), Red (losses), Blue (selected), Purple (indicators)

## Notes
- System is specifically for backtest analysis, not live trading
- Focus on insights and trade analysis from completed backtests
- All data comes from backend after processing with Apache Arrow
- Strategy-scoped metadata, not global metadata
- Must maintain TradingView-like professional appearance