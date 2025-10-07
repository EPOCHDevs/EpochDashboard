# Trade Analytics Data Flow & Architecture

> **Complete documentation of the Trade Analytics data fetching, caching, lazy loading, and rendering pipeline**

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Data Flow Diagram](#data-flow-diagram)
3. [Component Responsibilities](#component-responsibilities)
4. [Data Fetching Process](#data-fetching-process)
5. [Intelligent Caching System](#intelligent-caching-system)
6. [Lazy Loading Mechanism](#lazy-loading-mechanism)
7. [Loading States & UI](#loading-states--ui)
8. [Backend Padding System](#backend-padding-system)
9. [Performance Optimizations](#performance-optimizations)
10. [Debugging Guide](#debugging-guide)

---

## System Architecture Overview

The Trade Analytics system is built with a multi-layered architecture designed for performance and user experience:

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                      │
│  ┌────────────────────┐    ┌──────────────────────────┐    │
│  │ trade-analytics.tsx│───►│TradeAnalyticsChartRenderer│    │
│  │   (Page Component) │    │     (Chart Component)     │    │
│  └────────────────────┘    └──────────────────────────┘    │
└───────────────────────────────────┬─────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────┐
│                     Data Layer                               │
│  ┌──────────────────────┐   ┌──────────────────────────┐   │
│  │ useSmartChartData    │───│  DataCacheManager        │   │
│  │   (React Query Hook) │   │  (Global Singleton)      │   │
│  └──────────────────────┘   └──────────────────────────┘   │
└───────────────────────────────────┬─────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────┐
│                    API Proxy Layer                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ /api/backend-server/dashboard/trade-analytics-chart- │   │
│  │ data/[strategyId].ts  (Next.js API Route)            │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────┬─────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────┐
│                   Backend API Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ GET /api/v1/dashboard/analytics/{strategyId}         │   │
│  │ Returns: Apache Arrow IPC binary data                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Key Technologies:**
- **React Query** (`@tanstack/react-query`) - Server state management & caching
- **Apache Arrow** - Efficient columnar data format
- **Highcharts** - Interactive charting library
- **Next.js API Routes** - CORS proxy for backend API

---

## Data Flow Diagram

### Initial Load Sequence

```
┌─────────┐
│  User   │
│ Visits  │
│  Page   │
└────┬────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 1. Page Component Initializes           │
│    - Fetch metadata                     │
│    - Fetch round trips                  │
│    - Set first asset & timeframe        │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 2. TradeAnalyticsChartRenderer Mount    │
│    - Initialize pane states             │
│    - Calculate padding config           │
│    - Trigger useSmartChartData hook     │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 3. useSmartChartData Hook               │
│    - Calculate API parameters           │
│    - Check DataCacheManager for cache   │
│    - No cache? Fetch from API           │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 4. API Proxy (Next.js Route)            │
│    - Forward request to backend         │
│    - Add authentication headers         │
│    - Stream binary response             │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 5. Backend API                          │
│    - Apply padding calculations         │
│    - Return Apache Arrow binary         │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 6. Data Processing                      │
│    - Parse Arrow IPC format             │
│    - Cache in DataCacheManager          │
│    - Return to hook                     │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 7. Chart Rendering                      │
│    - Generate plot elements             │
│    - Build Highcharts config            │
│    - Render chart (no animation)        │
└─────────────────────────────────────────┘
```

### Lazy Loading / Range Expansion Sequence

```
┌──────────┐
│   User   │
│  Zooms   │
│   Out    │
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 1. Highcharts afterSetExtremes Event    │
│    - User zooms/pans chart              │
│    - Detect zoom OUT (viewport grows)   │
│    - Check if near data boundaries      │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 2. Range Expansion Check                │
│    - Calculate viewport range           │
│    - Compare with cached data bounds    │
│    - Need more data? Trigger expansion  │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 3. onRangeExpansionNeeded Callback      │
│    - Calculate expansion buffer (50%)   │
│    - Set expansionRequest state         │
│    - Set isLazyLoading = true           │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 4. useSmartChartData Re-triggers        │
│    - New expansionRange in params       │
│    - Check DataCacheManager gaps        │
│    - Fetch missing time ranges          │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 5. Data Merge                           │
│    - Fetch new Arrow data               │
│    - Merge with existing cached data    │
│    - Deduplicate by timestamp           │
│    - Update loadedRanges array          │
└────┬────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────┐
│ 6. Chart Update                         │
│    - Return merged dataset              │
│    - Chart re-renders with new data     │
│    - User sees expanded time range      │
│    - Loading indicator disappears       │
└─────────────────────────────────────────┘
```

---

## Component Responsibilities

### 1. **Page Component** (`pages/trade-analytics.tsx`)

**File:** `/apps/playground/pages/trade-analytics.tsx`

**Responsibilities:**
- Fetch metadata from backend (asset info, timeframes, chart configs)
- Fetch round trips data (trade history)
- Manage UI state (selected asset, timeframe, sidebar visibility)
- Handle user interactions (asset selection, trade card clicks)
- Set absolute bounds in cache manager from metadata
- Coordinate range expansion requests

**Key State:**
```typescript
- selectedAssetId: string
- selectedTimeframe: string
- selectedRoundTripForChart: IRoundTrip | null
- expansionRequest: { from: number; to: number } | null
- isLazyLoading: boolean
```

**Key Functions:**
- `handleRangeExpansion()` - Triggered when user zooms near data boundaries
- `focusOnTrade()` - Zoom chart to specific trade time range

---

### 2. **TradeAnalyticsChartRenderer** (`TradeAnalyticsChartRenderer/index.tsx`)

**File:** `/packages/epoch-dashboard/src/modules/TradeAnalyticsTab/components/TradeAnalyticsChartRenderer/index.tsx`

**Responsibilities:**
- Manage chart configuration and state
- Initialize pane states from timeframe config
- Trigger data fetching via `useSmartChartData` hook
- Build Highcharts options from Arrow data
- Handle zoom/pan events for lazy loading
- Manage loading states and skeleton UI

**Key Props:**
```typescript
interface TradeAnalyticsChartRendererProps {
  isLoading?: boolean                    // External loading flag
  tradeAnalyticsMetadata?: Metadata      // Chart configuration
  selectedRoundTrips?: IRoundTrip[]      // Trades to display
  campaignId: string                     // Strategy ID
  assetId: string                        // Asset to display
  fetchEntireCandleStickData?: boolean   // Full dataset mode
  paddingProfile?: "STANDARD" | ...      // Padding config
  timeframe?: string                     // Selected timeframe
  onRangeExpansionNeeded?: (range) => void  // Lazy load callback
  expansionRange?: { from, to } | null   // Expansion request
  isLazyLoading?: boolean                // Prevents duplicate requests
}
```

**Loading State Logic:**
```typescript
// INITIAL LOAD: Show skeleton
(isLoading || isTimeframeSwitching || isLoadingChartData) && !chartData
  → Display skeleton loader

// BACKGROUND FETCH: Show subtle indicator
isFetchingChartData && chartData
  → Display small "Loading data..." badge

// NO DATA: Show error message
chartOptions === undefined || !assetId
  → Display "No data found!" or "Please select an asset"
```

**Zoom Detection (afterSetExtremes):**
```typescript
1. Guard: Only respond to user triggers ('zoom', 'mousewheel', etc.)
2. Guard: Don't trigger if already lazy loading
3. Detect zoom direction:
   - Zoom OUT: viewport grows (fetch more data)
   - Zoom IN: viewport shrinks (use cached data)
   - Panning: viewport moves (may need more data)
4. Check if near boundaries (20% threshold)
5. Trigger expansion with 50% buffer on each side
```

---

### 3. **useSmartChartData Hook** (`hooks/useSmartChartData.ts`)

**File:** `/packages/epoch-dashboard/src/modules/TradeAnalyticsTab/components/TradeAnalyticsChartRenderer/hooks/useSmartChartData.ts`

**Responsibilities:**
- Calculate API parameters based on context (baseline, trade-focused, expansion)
- Manage React Query for data fetching
- Coordinate with DataCacheManager
- Handle data merging and deduplication
- Return appropriate data (cached or freshly fetched)

**Priority System for Data Requests:**

```typescript
Priority 1: Range Expansion (Lazy Loading)
  if (expansionRange) {
    → Fetch: { from_ms: range.from, to_ms: range.to }
  }

Priority 2: Fetch Entire Dataset Mode
  if (fetchEntireCandleStickData) {
    → Fetch: baseline (no time constraints)
  }

Priority 3: No Trades Selected (Baseline)
  if (selectedRoundTrips.length === 0) {
    → Fetch: baseline (initial N units)
    → Cache prevents duplicate fetches
  }

Priority 4: Trade-Focused (Specific Trades)
  if (selectedRoundTrips.length > 0) {
    → Calculate: pivot, pad_front, pad_back
    → Fetch: data around selected trades
  }
```

**Cache-First Strategy:**
```typescript
finalData = useMemo(() => {
  // 1. ALWAYS check cache first (source of truth)
  const cachedData = globalDataCacheManager.getCachedData(...)
  if (cachedData) return cachedData

  // 2. Use fetched data only if cache is empty (initial load)
  if (fetchedData) return fetchedData

  // 3. No data available
  return undefined
})
```

**React Query Configuration:**
```typescript
{
  staleTime: Infinity,           // Never mark as stale
  gcTime: 10 * 60 * 1000,       // 10min garbage collection
  refetchOnWindowFocus: false,   // Don't refetch on focus
  retry: 2,                      // Retry failed requests 2x
  keepPreviousData: true,        // Prevent UI flashing
}
```

---

### 4. **DataCacheManager** (`utils/DataCacheManager.ts`)

**File:** `/packages/epoch-dashboard/src/modules/TradeAnalyticsTab/components/TradeAnalyticsChartRenderer/utils/DataCacheManager.ts`

**Responsibilities:**
- Global singleton for caching Apache Arrow tables
- Track loaded time ranges per asset/timeframe
- Merge new data with existing cached data
- Detect missing time ranges for lazy loading
- Enforce memory limits with LRU eviction
- Deduplicate data by timestamp

**Cache Structure:**

```typescript
interface DataCacheEntry {
  data: Table<...>                    // Apache Arrow table
  loadedRanges: DataRange[]           // All loaded time ranges
  absoluteBounds?: DataRange          // Hard limits from metadata
  timestamp: number                   // Cache entry creation time
  size: number                        // Memory footprint (bytes)
  accessCount: number                 // Usage tracking
  lastAccessed: number                // LRU eviction
}

// Cache Key Format: "{strategyId}_{assetId}_{timeframe}"
```

**Memory Management:**
- Max Cache Size: 50 MB
- Max Entries: 10
- Eviction Strategy: LRU (Least Recently Used)

**Key Methods:**

1. **cacheData(request, data)**
   - Extracts time range from data
   - Merges with existing data if present
   - Deduplicates by timestamp
   - Updates loadedRanges array
   - Enforces memory limits

2. **getCachedData(request)**
   - Returns cached Arrow table
   - Updates access statistics
   - Returns null if no data or placeholder only

3. **needsRangeExpansion(request, targetRange)**
   - Clamps to absolute bounds
   - Checks if range is covered
   - Returns missing ranges to fetch

4. **mergeArrowTables(existing, newData)**
   - Combines two Arrow tables
   - Deduplicates by timestamp
   - Sorts by time
   - Returns new merged table

5. **setAbsoluteBounds(request, bounds)**
   - Sets hard limits from metadata
   - Creates placeholder entry if needed
   - Prevents fetching beyond available data

**Range Merging Logic:**

```typescript
// Example: Merging overlapping ranges
Input Ranges:
  [100, 200], [150, 250], [300, 400]

After Merge:
  [100, 250], [300, 400]

// Overlapping or adjacent ranges (within 1ms) are merged
```

---

### 5. **BackendPaddingUtils** (`utils/BackendPaddingUtils.ts`)

**File:** `/packages/epoch-dashboard/src/modules/TradeAnalyticsTab/components/TradeAnalyticsChartRenderer/utils/BackendPaddingUtils.ts`

**Responsibilities:**
- Calculate API parameters for different scenarios
- Convert timeframe strings to milliseconds
- Compute optimal padding for trades
- Format requests for backend API

**Padding Profiles:**

```typescript
DEFAULT_PADDING_CONFIGS = {
  MINIMAL: {
    frontPadUnits: 25,
    backPadUnits: 25,
    baselineUnits: 400,
  },
  CONSERVATIVE: {
    frontPadUnits: 50,
    backPadUnits: 50,
    baselineUnits: 800,
  },
  STANDARD: {
    frontPadUnits: 100,
    backPadUnits: 100,
    baselineUnits: 500,  // Default
  },
  AGGRESSIVE: {
    frontPadUnits: 200,
    backPadUnits: 200,
    baselineUnits: 3000,
  },
}
```

**Timeframe Parsing:**

```typescript
getMsPerBar("5m")   → 300,000      (5 minutes)
getMsPerBar("1H")   → 3,600,000    (1 hour)
getMsPerBar("1D")   → 86,400,000   (1 day)
getMsPerBar("1W")   → 604,800,000  (1 week)
```

**API Parameter Calculation:**

1. **Baseline (No Trades):**
```typescript
calculateBaselineApiParams(baseParams)
→ { strategyId, assetId, timeframe }
// No time constraints = fetch entire dataset
```

2. **Single Round Trip:**
```typescript
calculateRoundTripApiParams(baseParams, roundTripTimes, paddingConfig)
→ {
  strategyId,
  assetId,
  timeframe,
  pivot: openTime,           // Trade open timestamp
  pad_front: 100,           // Units before trade
  pad_back: duration + 100, // Units after trade + padding
}
```

3. **Multiple Round Trips:**
```typescript
calculateMultiRoundTripApiParams(baseParams, roundTrips, paddingConfig)
→ {
  strategyId,
  assetId,
  timeframe,
  pivot: min(openTimes),         // Earliest trade
  pad_front: 100,                // Units before first trade
  pad_back: maxDuration + 100,   // Units to cover all trades
}
```

4. **Range Expansion (Lazy Loading):**
```typescript
expansionRequest: { from: timestamp, to: timestamp }
→ {
  strategyId,
  assetId,
  timeframe,
  from_ms: expansionFrom,    // Explicit time range
  to_ms: expansionTo,
}
```

---

## Data Fetching Process

### Backend API Request Format

**Endpoint:** `GET /api/v1/dashboard/analytics/{strategyId}`

**Query Parameters:**
```
asset={assetId}          - Required: Asset symbol
timeframe={timeframe}    - Required: "5m", "1H", "1D", etc.
from_ms={timestamp}      - Optional: Start time (milliseconds)
to_ms={timestamp}        - Optional: End time (milliseconds)
pivot={timestamp}        - Optional: Pivot point for padding
pad_front={units}        - Optional: Units to fetch before pivot
pad_back={units}         - Optional: Units to fetch after pivot
```

**Backend Logic:**
```python
# Pseudocode
if pivot and pad_front and pad_back:
    # Focused mode: Return data around pivot
    start = pivot - (pad_front * bar_duration)
    end = pivot + (pad_back * bar_duration)
    return data[start:end]

elif from_ms and to_ms:
    # Range mode: Return specific time range
    return data[from_ms:to_ms]

else:
    # Baseline mode: Return entire dataset
    return all_data
```

**Response Format:**
- Content-Type: `application/octet-stream`
- Format: Apache Arrow IPC (columnar binary format)
- Columns: `index` (timestamp), `open`, `high`, `low`, `close`, `volume`, indicators...

### API Proxy Layer

**File:** `/apps/playground/pages/api/backend-server/dashboard/trade-analytics-chart-data/[strategyId].ts`

**Purpose:**
- Avoid CORS issues by proxying through Next.js
- Add authentication headers (`X-User-Id`)
- Stream binary data without parsing
- Provide detailed error messages

**Flow:**
```typescript
1. Extract strategyId from URL params
2. Extract query string (asset, timeframe, etc.)
3. Get API URL from request headers or env
4. Forward request to backend:
   GET {apiUrl}/api/v1/dashboard/analytics/{strategyId}?{queryString}
5. Stream binary response back to client
6. On error: Return JSON with error details
```

---

## Intelligent Caching System

### Cache Key Strategy

**Single Entry Per Asset/Timeframe:**
```typescript
cacheKey = `${strategyId}_${assetId}_${timeframe}`

// Example:
"strategy-123_AAPL-Stocks_5m"
"strategy-123_AAPL-Stocks_1H"
"strategy-456_TSLA-Stocks_1D"
```

**Why Not Include Time Range in Key?**
- Single entry accumulates all fetched data for that asset/timeframe
- Avoids cache fragmentation
- Enables efficient range merging
- Simplifies cache invalidation

### Data Merging Process

**Scenario:** User zooms out, needs data from [T1, T2], but cache only has [T3, T4]

```typescript
1. Detect Missing Range
   needsRangeExpansion([T1, T2])
   → Missing: [T1, T3) and (T4, T2]

2. Fetch Missing Data
   fetch(from_ms: T1, to_ms: T2)
   → Returns Arrow table with [T1, T2] data

3. Merge Tables
   mergeArrowTables(existingData, newData)

   Step 1: Extract all rows from both tables
   Step 2: Create map keyed by timestamp
   Step 3: Deduplicate (new data overwrites)
   Step 4: Sort by timestamp
   Step 5: Convert back to Arrow table

4. Update Cache Entry
   loadedRanges: [[T3, T4]] → [[T1, T2], [T3, T4]] → [[T1, T4]]
                                                       (merged)
```

**Example:**

```typescript
// Initial cache: 100 rows from 10:00 - 10:05
loadedRanges: [{ from: 10:00, to: 10:05 }]

// User zooms out to 09:55 - 10:10
targetRange: { from: 09:55, to: 10:10 }

// Missing ranges detected:
missing: [
  { from: 09:55, to: 09:59 },  // Before cached data
  { from: 10:06, to: 10:10 }   // After cached data
]

// Fetch entire range (simplified)
fetch({ from_ms: 09:55, to_ms: 10:10 })

// Merge with cache
mergeArrowTables(cached100rows, fetched300rows)
→ 300 unique rows (duplicates removed)

// Updated cache
loadedRanges: [{ from: 09:55, to: 10:10 }]
```

### Absolute Bounds

**Purpose:** Prevent fetching beyond available data

**Source:** Metadata endpoint provides absolute time bounds

```typescript
// From metadata
metadata.asset_info[assetId].timeframes[i] = {
  timeframe: "5m",
  absolute_start_ms: 1609459200000,  // 2021-01-01 00:00:00
  absolute_end_ms: 1640995200000,    // 2022-01-01 00:00:00
  total_bars: 105120,
}

// Set in cache manager
globalDataCacheManager.setAbsoluteBounds(request, {
  from: absolute_start_ms,
  to: absolute_end_ms,
})
```

**Effect on Range Expansion:**
```typescript
// User zooms to request data from 2020
requestedRange: { from: 2020-01-01, to: 2021-06-01 }

// Clamped to absolute bounds
clampedRange: { from: 2021-01-01, to: 2021-06-01 }

// Only valid range is fetched
```

---

## Lazy Loading Mechanism

### Trigger Conditions

**Lazy loading activates when:**
1. User zooms OUT (viewport grows)
2. Viewport approaches data boundaries (within 20%)
3. Not already loading data
4. Callback is registered (`onRangeExpansionNeeded`)

**Does NOT activate when:**
- Zooming IN (data already cached)
- Panning within loaded range
- Already fetching data
- Programmatic zoom (e.g., focusing on trade)

### Zoom Direction Detection

```typescript
// Track viewport size to detect zoom direction
const previousViewportRangeRef = useRef<number | null>(null)

afterSetExtremes(event) {
  const currentRange = event.max - event.min
  const previousRange = previousViewportRangeRef.current

  // First interaction - record baseline
  if (previousRange === null) {
    previousViewportRangeRef.current = currentRange
    return  // Don't trigger on first zoom
  }

  // Detect direction
  const isZoomingOut = currentRange > previousRange
  const isZoomingIn = currentRange < previousRange
  const isPanning = Math.abs(currentRange - previousRange) < 1

  // Update for next comparison
  previousViewportRangeRef.current = currentRange

  // Only expand on zoom OUT or panning
  if (isZoomingIn) return  // Skip - data already cached

  if (isZoomingOut || isPanning) {
    checkForExpansion()
  }
}
```

### Boundary Detection (20% Threshold)

```typescript
const dataRange = dataMax - dataMin
const frontBuffer = dataRange * 0.2
const backBuffer = dataRange * 0.2

const needsExpansion =
  viewMin < (dataMin + frontBuffer) ||  // Near start
  viewMax > (dataMax - backBuffer)       // Near end
```

**Visual:**
```
Data Range: [========================================] 100%
            ↑        ↑                      ↑        ↑
         dataMin   +20%                   -20%    dataMax

Viewport:              [===========]
                       ↑           ↑
                     viewMin    viewMax

Is viewMin < dataMin + 20%? → YES → Expand backward
Is viewMax > dataMax - 20%? → NO  → Don't expand forward
```

### Expansion Buffer (50%)

**Why 50%?** Pre-fetch extra data so user can zoom further without waiting

```typescript
const viewportRange = viewMax - viewMin
const expansionBuffer = viewportRange * 0.5

const expansionFrom = viewMin - expansionBuffer
const expansionTo = viewMax + expansionBuffer
```

**Example:**
```
Current Viewport: [10:00 ────────► 10:10]  (10 minutes)
Expansion Buffer: 5 minutes each side

Expansion Request: [09:55 ────────────────────► 10:15]
                    ←──→                        ←──→
                    50%                          50%
```

### State Management

```typescript
// In page component
const [isLazyLoading, setIsLazyLoading] = useState(false)
const [expansionRequest, setExpansionRequest] = useState<Range | null>(null)

// On expansion needed
const handleRangeExpansion = (range) => {
  console.log('📊 Range expansion requested:', range)

  setExpansionRequest(range)        // Triggers data fetch
  setIsLazyLoading(true)            // Prevents duplicate requests

  // Reset after fetch completes
  setTimeout(() => {
    setExpansionRequest(null)
    setIsLazyLoading(false)
  }, 1000)
}
```

**Flow:**
```
1. User zooms out near boundary
2. afterSetExtremes fires
3. Checks: !isLazyLoading && needsExpansion
4. Calls: onRangeExpansionNeeded({ from, to })
5. Parent sets: expansionRequest state
6. useSmartChartData detects expansion request
7. Fetches missing data with from_ms/to_ms
8. Merges with cache
9. Returns updated dataset
10. Chart re-renders with expanded data
11. Parent resets: expansionRequest = null
```

---

## Loading States & UI

### State Hierarchy

```typescript
┌─────────────────────────────────────────────────────┐
│ 1. INITIAL LOAD                                     │
│    Condition: No data fetched yet                   │
│    UI: Full skeleton loader (pulsing gray box)      │
│    Trigger: isLoadingChartData && !chartData        │
└─────────────────────────────────────────────────────┘
          │
          ▼ Data arrives
┌─────────────────────────────────────────────────────┐
│ 2. CHART RENDERED                                   │
│    Condition: Data loaded, chart visible            │
│    UI: Normal chart display                         │
│    Trigger: chartData && chartOptions               │
└─────────────────────────────────────────────────────┘
          │
          ▼ User zooms out
┌─────────────────────────────────────────────────────┐
│ 3. BACKGROUND FETCH                                 │
│    Condition: Fetching more data while showing chart│
│    UI: Small badge "Loading data..." (top-right)    │
│    Trigger: isFetchingChartData && chartData        │
└─────────────────────────────────────────────────────┘
          │
          ▼ Fetch complete
┌─────────────────────────────────────────────────────┐
│ 4. UPDATED CHART                                    │
│    Condition: New data merged into chart            │
│    UI: Chart updates seamlessly, badge disappears   │
│    Trigger: chartData updated, isFetching = false   │
└─────────────────────────────────────────────────────┘
```

### Implementation

**File:** `TradeAnalyticsChartRenderer/index.tsx:986-1004`

```tsx
<div className="relative h-full w-full flex-1" ref={chartContainerRef}>
  {/* INITIAL LOAD: Show skeleton */}
  {(isLoading || isTimeframeSwitching || isLoadingTradeAnalyticsChartData) && !tradeAnalyticsChartData ? (
    <div className="h-full w-full rounded-3xl bg-gray-200 animate-pulse" />
  ) : typeof chartOptions === "undefined" || !assetId ? (
    /* NO DATA: Show message */
    <div className="h-full w-full rounded-3xl">
      <div className="flex h-full items-center justify-center text-gray-500">
        {!assetId ? "Please select an asset" : "No data found!"}
      </div>
    </div>
  ) : (
    <>
      {/* BACKGROUND FETCH: Show subtle indicator */}
      {isFetchingTradeAnalyticsChartData && tradeAnalyticsChartData && (
        <div className="absolute top-2 right-2 z-50 flex items-center gap-2 px-3 py-1.5 bg-primary-white/10 backdrop-blur-sm rounded-lg border border-primary-white/20">
          <div className="w-2 h-2 bg-territory-blue rounded-full animate-pulse" />
          <span className="text-xs text-primary-white/70">Loading data...</span>
        </div>
      )}
      {/* CHART: Render Highcharts */}
      <HighchartsReact ... />
    </>
  )}
</div>
```

### Why This Approach?

**Before (❌ Bad UX):**
```
User zooms out
  → Chart disappears (shows "No data")
  → Fetch new data
  → Chart reappears
  → Jarring experience
```

**After (✅ Good UX):**
```
User zooms out
  → Chart stays visible
  → Small loading badge appears
  → New data merges in
  → Chart updates smoothly
  → Badge disappears
```

**Key Principle:** Never hide the chart once data is loaded

---

## Backend Padding System

### Why Padding?

**Problem:** Fetching entire candlestick datasets is slow and wasteful

**Solution:** Fetch only relevant data around the area of interest

**Benefits:**
- ✅ Faster initial load
- ✅ Reduced bandwidth usage
- ✅ Better perceived performance
- ✅ Still allows exploration via lazy loading

### Padding Modes

#### Mode 1: Baseline (No Trades Selected)

**Use Case:** Initial chart view, no specific trade focused

**Parameters:**
```typescript
{
  strategyId: "strategy-123",
  assetId: "AAPL-Stocks",
  timeframe: "5m",
  // NO other parameters
}
```

**Backend Behavior:**
```python
# Return first N bars (based on baselineUnits config)
# For STANDARD profile: 500 bars
# For 5m timeframe: ~42 hours of data
```

**Example:**
- Total available data: 100,000 bars (1 year)
- Initial fetch: 500 bars (2 days)
- User can still access all 100k bars via lazy loading

#### Mode 2: Trade-Focused (Pivot + Padding)

**Use Case:** User clicks on a trade card to view that specific trade

**Parameters:**
```typescript
{
  strategyId: "strategy-123",
  assetId: "AAPL-Stocks",
  timeframe: "5m",
  pivot: 1635724800000,      // Trade open time (Oct 31, 2021)
  pad_front: 100,            // 100 bars before trade
  pad_back: 150,             // 50 bars trade duration + 100 padding
}
```

**Backend Behavior:**
```python
pivot_time = 1635724800000  # Oct 31, 2021 10:00:00
bar_duration = 300000       # 5 minutes

start_time = pivot_time - (pad_front * bar_duration)
           = pivot_time - (100 * 300000)
           = pivot_time - 30,000,000ms
           = Oct 31, 2021 01:40:00

end_time = pivot_time + (pad_back * bar_duration)
         = pivot_time + (150 * 300000)
         = pivot_time + 45,000,000ms
         = Nov 1, 2021 22:30:00

return data[start_time : end_time]  # 250 bars total
```

**Visual:**
```
Time:     01:40     10:00          12:30         22:30
          ↓         ↓              ↓             ↓
Data:     [═════════▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓═══════════════]
          ←────────→←──────────────→←────────────→
          100 bars  50 bars (trade) 100 bars
          (front)   (duration)      (back)

          └─────────▲─────────────────────────────┘
                  pivot
```

#### Mode 3: Range Expansion (from_ms, to_ms)

**Use Case:** Lazy loading when user zooms out

**Parameters:**
```typescript
{
  strategyId: "strategy-123",
  assetId: "AAPL-Stocks",
  timeframe: "5m",
  from_ms: 1635600000000,    // Oct 30, 2021 00:00:00
  to_ms: 1635800000000,      // Nov 1, 2021 07:33:20
}
```

**Backend Behavior:**
```python
# Simple range query
return data[from_ms : to_ms]
```

### Multi-Trade Optimization

**Scenario:** User selects multiple trades

**Strategy:** Calculate single pivot/padding to cover all trades

```typescript
const roundTrips = [
  { openTime: 10:00, closeTime: 10:30 },
  { openTime: 12:00, closeTime: 12:45 },
  { openTime: 15:00, closeTime: 15:20 },
]

// Pivot = earliest open
pivot = min(10:00, 12:00, 15:00) = 10:00

// pad_back = duration to cover all trades
latest_end = max(10:30, 12:45, 15:20) = 15:20
duration_ms = 15:20 - 10:00 = 320 minutes = 64 bars (5m)
pad_back = 64 + 100 (padding) = 164 bars

// Final request
{
  pivot: 10:00,
  pad_front: 100,    // Before first trade
  pad_back: 164,     // Cover all trades + padding
}
```

---

## Performance Optimizations

### 1. **Disabled Animations**

**Why?** Animations delay chart rendering and cause perceived lag

**Implementation:**
```typescript
// Global Highcharts setting
Highcharts.setOptions({
  chart: { animation: false },
  plotOptions: { series: { animation: false } },
})

// Also in chart options
chart: { animation: false },
plotOptions: {
  candlestick: { animation: false },
  column: { animation: false },
  line: { animation: false },
  // ...
}
```

**Result:** Instant chart rendering

### 2. **React Query Infinite Stale Time**

**Why?** Prevent unnecessary refetches

**Implementation:**
```typescript
{
  staleTime: Infinity,  // Data never becomes stale
  gcTime: 10 * 60 * 1000,  // Keep in memory for 10 minutes
}
```

**Effect:** Data only fetches when parameters change, not when component remounts

### 3. **keepPreviousData**

**Why?** Prevent chart from disappearing during refetch

**Implementation:**
```typescript
{
  keepPreviousData: true,
}
```

**Effect:** Old data stays visible while new data loads

### 4. **Memoization**

**Critical useMemo calls:**
- `chartOptions` - Prevents rebuilding Highcharts config on every render
- `finalData` - Prevents recalculating merged data
- `timeframeConfig` - Prevents re-parsing metadata
- `queryKey` - Stable query key for React Query

### 5. **Debounced Timeframe Switching**

**Why?** Rapid timeframe changes can cause multiple fetches

**Implementation:**
```typescript
useEffect(() => {
  setIsTimeframeSwitching(true)

  const timeoutId = setTimeout(() => {
    setChartKey(`${selectedTimeframe}-${assetId}-${Date.now()}`)
    setIsTimeframeSwitching(false)
  }, 150)  // 150ms debounce

  return () => clearTimeout(timeoutId)
}, [selectedTimeframe, assetId])
```

### 6. **Ref Instead of State for isLazyLoading**

**Why?** Prevent unnecessary re-renders

**Implementation:**
```typescript
const isLazyLoadingRef = useRef(isLazyLoading)

// In afterSetExtremes
if (isLazyLoadingRef.current) return  // Check ref, not state
```

### 7. **Chart Key for Force Reinitialization**

**Why?** Ensure clean slate when switching assets/timeframes

**Implementation:**
```typescript
<HighchartsReact
  key={chartKey || `${selectedTimeframe}-${assetId}`}
  // ...
/>
```

**Effect:** Completely destroys and recreates chart, preventing stale state

---

## Debugging Guide

### Enable Debug Logging

The codebase has extensive console.log statements prefixed with `📊`

**Search for:** `console.log('📊`

**Key Log Points:**

1. **Data Fetch Status** (`useSmartChartData.ts:193`)
   ```typescript
   console.log('📊 Data fetch status:', {
     strategyId, assetId, timeframe,
     hasData, dataRows, dataColumns,
     error, isLoading, isFetching
   })
   ```

2. **Range Expansion** (`index.tsx:704`)
   ```typescript
   console.log('📊 Range expansion needed:', {
     trigger, viewRange, dataRange,
     expansionRange, expandFront, expandBack
   })
   ```

3. **Cache Operations** (`DataCacheManager.ts:299`)
   ```typescript
   console.log('📊 Merging new data range:', ...)
   console.log('📊 Merged ranges:', ...)
   ```

4. **Zoom Detection** (`index.tsx:668`)
   ```typescript
   console.log('📊 Zoom detection:', {
     trigger, currentRange, previousRange,
     isZoomingOut, isZoomingIn, isPanning
   })
   ```

### Common Issues

#### Issue 1: "No data found!" flashing on initial load

**Symptom:** Skeleton loader not showing, goes straight to error

**Cause:** `isLoadingTradeAnalyticsChartData` not checked in loading condition

**Fix:** Line 988 in `index.tsx`
```typescript
// Before (broken)
{(isLoading || isTimeframeSwitching) && !tradeAnalyticsChartData ? (

// After (fixed)
{(isLoading || isTimeframeSwitching || isLoadingTradeAnalyticsChartData) && !tradeAnalyticsChartData ? (
```

#### Issue 2: Lazy loading triggers on zoom IN

**Symptom:** Unnecessary fetches when zooming into cached data

**Cause:** Not detecting zoom direction

**Fix:** Lines 661-682 in `index.tsx` - Check `isZoomingIn` and return early

#### Issue 3: Infinite expansion requests

**Symptom:** Continuous fetching even when data is loaded

**Cause:** Not blocking requests when already loading

**Fix:** Check `isLazyLoadingRef.current` before triggering expansion

#### Issue 4: Duplicate data in chart

**Symptom:** Chart shows duplicate timestamps

**Cause:** Merge function not deduplicating properly

**Fix:** `DataCacheManager.ts:128` - Use Map to deduplicate by timestamp

### Cache Inspection

```typescript
// In browser console
globalDataCacheManager.getCacheStats()
// Returns: { totalEntries, totalSize, maxSize, hitRate }

globalDataCacheManager.getLoadedRanges({
  strategyId: "...",
  assetId: "...",
  timeframe: "..."
})
// Returns: [{ from: timestamp, to: timestamp }, ...]

globalDataCacheManager.clearCache()
// Clears all cached data
```

### Network Inspection

**Check API calls in DevTools:**

1. **Metadata:** `/api/trade-analytics/metadata/{jobId}`
   - Response: JSON with asset info, chart configs

2. **Chart Data:** `/api/backend-server/dashboard/trade-analytics-chart-data/{strategyId}?asset=...`
   - Response: Binary (application/octet-stream)
   - Size: Check if reasonable based on time range

3. **Round Trips:** `/api/backend-server/dashboard/round-trips/{strategyId}`
   - Response: JSON with trade history

---

## Summary

The Trade Analytics system implements a sophisticated multi-layered architecture:

1. **Smart Fetching** - Only fetch data when needed, use cache when available
2. **Intelligent Caching** - Single cache entry per asset/timeframe, merge new data seamlessly
3. **Lazy Loading** - On-demand fetching when user explores beyond loaded data
4. **Backend Padding** - Efficient windowing reduces initial payload
5. **Optimized UX** - No flashing, smooth transitions, instant rendering

**Key Files:**
- `pages/trade-analytics.tsx` - Page orchestration
- `TradeAnalyticsChartRenderer/index.tsx` - Chart rendering
- `hooks/useSmartChartData.ts` - Data fetching logic
- `utils/DataCacheManager.ts` - Cache management
- `utils/BackendPaddingUtils.ts` - API parameter calculations

**Performance Targets:**
- Initial load: <1s (500 bars)
- Lazy load expansion: <500ms
- Cache hit: Instant (0ms)
- Chart re-render: <100ms (no animations)

---

**Last Updated:** 2025-10-05
**Version:** 1.0
**Maintained by:** Dashboard Team