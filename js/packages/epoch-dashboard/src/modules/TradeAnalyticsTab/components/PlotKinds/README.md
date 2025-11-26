# PlotKind Handlers - Complete Documentation

## Overview

PlotKinds are the fundamental building blocks for rendering different types of chart visualizations in the EpochDashboard. Each plotkind handler is responsible for transforming Apache Arrow columnar data into Highcharts series configurations, annotations, and plot bands.

## Architecture

### Core Pattern

All plotkind handlers follow a consistent interface pattern:

```typescript
interface PlotKindHandler {
  // Extract required data columns
  PLOT_KIND_DATA_KEYS: string[]

  // Generate visual elements
  generatePlotElements: ({
    data: Table,
    seriesConfig: SeriesConfig
  }) => PlotElements
}

interface PlotElements {
  series: SeriesOptionsType[]           // Highcharts series
  annotations?: AnnotationsOptions      // Shapes, labels, lines
  plotBands?: YAxisPlotBandsOptions[]  // Background highlights
}
```

### Data Flow

```
Backend (C++) → Apache Arrow Table → PlotKind Handler → Highcharts Config
```

1. **Backend**: C++ generates Apache Arrow tables with specific column schemas per plotkind
2. **Data Extraction**: Handler extracts columns using `PLOT_KIND_DATA_KEYS`
3. **Transformation**: Handler converts Arrow data to Highcharts format
4. **Rendering**: Highcharts renders the visual elements

## PlotKind Categories

### 1. Core Chart Types

#### `candlestick`
**Purpose**: OHLC candlestick chart for price action
**Columns**: `open`, `high`, `low`, `close`, `index`
**Visual Output**: Candlestick series with configurable colors
**Location**: `Candlestick.ts`

```typescript
// Data mapping example
dataMapping: {
  index: "timestamp",
  open: "open",
  high: "high",
  low: "low",
  close: "close"
}
```

#### `line`
**Purpose**: Simple line chart
**Columns**: `value`, `index`
**Visual Output**: Line series
**Location**: `Line.ts`

#### `column`
**Purpose**: Vertical bar/column chart
**Columns**: `value`, `index`
**Visual Output**: Column series
**Location**: `Column.ts`

#### `panel_line` / `panel_line_percent`
**Purpose**: Line chart in separate pane
**Columns**: `value`, `index`
**Visual Output**: Line series with dedicated y-axis
**Location**: `PanelLine.ts`

---

### 2. Technical Indicators

#### `rsi` (Relative Strength Index)
**Purpose**: Momentum oscillator (0-100 range)
**Columns**: `value`, `index`
**Visual Output**: Line series with 30/70 plot lines
**Location**: `RSI.ts`

#### `cci` (Commodity Channel Index)
**Purpose**: Momentum oscillator
**Columns**: `value`, `index`
**Visual Output**: Line series with 0/±100 plot lines
**Location**: `CCI.ts`

#### `aroon`
**Purpose**: Trend direction indicator
**Columns**: `aroon_up`, `aroon_down`, `index`
**Visual Output**: Two line series (up=green, down=red)
**Location**: `Aroon.ts`

#### `fisher` (Fisher Transform)
**Purpose**: Normalized price oscillator
**Columns**: `fisher`, `signal`, `index`
**Visual Output**: Two line series
**Location**: `Fisher.ts`

#### `qqe` (Quantitative Qualitative Estimation)
**Purpose**: Trend-following oscillator
**Columns**: `qqe`, `qqe_signal`, `index`
**Visual Output**: Two line series
**Location**: `QQE.ts`

#### `elders` (Elder's Force Index)
**Purpose**: Volume-weighted momentum
**Columns**: `value`, `index`
**Visual Output**: Column series
**Location**: `Elders.ts`

#### `fosc` (Forecast Oscillator)
**Purpose**: Momentum indicator
**Columns**: `value`, `index`
**Visual Output**: Line series with 0 plot line
**Location**: `FOSC.ts`

#### `stoch` (Stochastic Oscillator)
**Purpose**: Momentum oscillator
**Columns**: `k`, `d`, `index`
**Visual Output**: Two line series with 20/80 zones
**Location**: `Stochastic.ts`

#### `atr` (Average True Range)
**Purpose**: Volatility indicator
**Columns**: `value`, `index`
**Visual Output**: Line series
**Location**: `ATR.ts`

#### `ao` (Awesome Oscillator)
**Purpose**: Momentum indicator
**Columns**: `value`, `index`
**Visual Output**: Column series (green/red based on direction)
**Location**: `AO.ts`

#### `qstick`
**Purpose**: Candlestick momentum
**Columns**: `value`, `index`
**Visual Output**: Column series
**Location**: `QStick.ts`

#### `macd` (Moving Average Convergence Divergence)
**Purpose**: Trend-following momentum
**Columns**: `macd`, `signal`, `histogram`, `index`
**Visual Output**: Two lines + histogram columns
**Location**: `MACD.ts`

#### `vortex`
**Purpose**: Trend direction
**Columns**: `vi_plus`, `vi_minus`, `index`
**Visual Output**: Two line series
**Location**: `Vortex.ts`

#### `bb_percent_b` (Bollinger %B)
**Purpose**: Position within Bollinger Bands
**Columns**: `value`, `index`
**Visual Output**: Line series with 0/1 zones
**Location**: `BBPercentB.ts`

---

### 3. Overlay Indicators

#### `bbands` (Bollinger Bands)
**Purpose**: Volatility bands around price
**Columns**: `upper`, `middle`, `lower`, `index`
**Visual Output**: Three line series (fills between bands)
**Location**: `BollingerBands.ts`

#### `ichimoku`
**Purpose**: Multi-component trend system
**Columns**: `tenkan`, `kijun`, `senkou_a`, `senkou_b`, `chikou`, `index`
**Visual Output**: Five lines + cloud (area fill between senkou lines)
**Location**: `Ichimoku.ts`

#### `chande_kroll_stop`
**Purpose**: Trailing stop levels
**Columns**: `long_stop`, `short_stop`, `index`
**Visual Output**: Two line series
**Location**: `ChandeKrollStop.ts`

#### `psar` (Parabolic SAR)
**Purpose**: Trailing stop and reverse
**Columns**: `value`, `index`
**Visual Output**: Scatter markers (dots above/below price)
**Location**: `PSAR.ts`

#### `vwap` (Volume Weighted Average Price)
**Purpose**: Intraday benchmark
**Columns**: `value`, `index`
**Visual Output**: Line series
**Location**: `VWAP.ts`

#### `h_line` (Horizontal Line)
**Purpose**: Static price level
**Columns**: `value`, `index`
**Visual Output**: Horizontal line at fixed price
**Location**: `HLine.ts`

#### `pivot_point_sr` ⭐ NEW
**Purpose**: Support/Resistance levels based on pivot points
**Columns**: `pivot`, `resist_1`, `resist_2`, `resist_3`, `support_1`, `support_2`, `support_3`, `index`
**Visual Output**: 7 horizontal lines (1 pivot, 3 resistance, 3 support)
**Color Scheme**:
- Pivot: Gray
- Resistances: Red gradient (darkening)
- Supports: Green gradient (darkening)

**Location**: `PivotPointSR.ts`

#### `pivot_point_detector` ⭐ NEW
**Purpose**: Marks swing high/low pivot points
**Columns**: `pivot_type`, `price`, `index`
**Visual Output**: Scatter markers
- Pivot Highs (+1): Red triangle-down markers
- Pivot Lows (-1): Green triangle-up markers

**Location**: `PivotPointDetector.ts`

#### `close_line` ⭐ NEW
**Purpose**: Simple close price overlay
**Columns**: `value`, `index`
**Visual Output**: Blue line overlaying price pane
**Location**: `CloseLine.ts`

---

### 4. Market Structure

#### `shl` (Swing Highs/Lows)
**Purpose**: Structural pivot points
**Columns**: `swing_high`, `swing_low`, `index`
**Visual Output**: Scatter markers at swing points
**Location**: `SHL.ts`

#### `bos_choch` (Break of Structure / Change of Character)
**Purpose**: Smart Money Concepts structure breaks
**Columns**: `event_type`, `price`, `index`
**Visual Output**: Annotations with labels
**Location**: `BOS_CHOCH.ts`

#### `order_blocks`
**Purpose**: Supply/demand zones
**Columns**: `block_detected`, `top`, `bottom`, `block_type`, `index`
**Visual Output**: Rectangle annotations (bullish=green, bearish=red)
**Location**: `OrderBlocks.ts`

#### `fvg` (Fair Value Gaps)
**Purpose**: Imbalance zones
**Columns**: `gap_detected`, `top`, `bottom`, `gap_type`, `index`
**Visual Output**: Semi-transparent rectangles
**Location**: `FVG.ts`

#### `liquidity`
**Purpose**: Liquidity pools/sweeps
**Columns**: `liquidity_event`, `price`, `event_type`, `index`
**Visual Output**: Markers + horizontal lines
**Location**: `Liquidity.ts`

---

### 5. Calendar & Sessions

#### `gap`
**Purpose**: Price gaps (e.g., overnight)
**Columns**: `gap_detected`, `gap_high`, `gap_low`, `index`
**Visual Output**: Rectangle annotations highlighting gaps
**Location**: `Gap.ts`

#### `sessions`
**Purpose**: Trading session highlights (Asia, London, NewYork)
**Columns**: `session_active`, `index`
**Visual Output**: PlotBands with session-specific colors
**Location**: `Sessions.ts`

#### `previous_high_low`
**Purpose**: Previous period high/low levels
**Columns**: `prev_high`, `prev_low`, `index`
**Visual Output**: Two horizontal lines
**Location**: `PreviousHighLow.ts`

#### `zone` ⭐ NEW
**Purpose**: Time-based background highlighting (e.g., FOMC, earnings)
**Columns**: `value` (boolean), `index`
**Configuration**: `name`, `position`, `color` via `configOptions`
**Visual Output**: Semi-transparent vertical plotBands for contiguous `true` ranges
**Location**: `Zone.ts`

**Implementation Pattern**:
```typescript
// Find contiguous true ranges
let rangeStart: number | null = null
for (let i = 0; i < valueColumn.length; i++) {
  if (value === true && rangeStart === null) {
    rangeStart = timestamp
  } else if (value === false && rangeStart !== null) {
    plotBands.push({
      from: rangeStart,
      to: previousTimestamp,
      color: getTailwindColorRgbaFromString(color, 0.15)
    })
    rangeStart = null
  }
}
```

---

### 6. Signals & Events

#### `flag` (Enhanced) ⭐ UPDATED
**Purpose**: Event markers with customizable icons and text
**Columns**: `flag_detected`, `price`, `...dynamic columns`, `index`
**Configuration**:
- `flagTitle`: Display name
- `flagText`: Text (supports template substitution)
- `flagTextIsTemplate`: Enable `{column_name}` substitution
- `flagIcon`: LucideIcon enum value (227 options)
- `flagColor`: TailwindColor enum value (42 options)

**Visual Output**: Flags with dynamic icons/colors
**Location**: `Flag.ts`

**Template Substitution Example**:
```typescript
// Backend sends:
configOptions: {
  flagText: "Pattern: {pattern_type} ({confidence}%)",
  flagTextIsTemplate: true
}
dataMapping: {
  pattern_type: "column_A",
  confidence: "column_B"
}

// Runtime: "Pattern: Head and Shoulders (87%)"
```

#### `trade_signal`
**Purpose**: Entry/exit signals
**Columns**: `signal_type`, `price`, `index`
**Visual Output**: Arrows (buy=up/green, sell=down/red)
**Location**: `TradeSignal.ts`

#### `exit_levels`
**Purpose**: Take profit / stop loss levels
**Columns**: `tp_level`, `sl_level`, `index`
**Visual Output**: Horizontal lines (TP=green, SL=red)
**Location**: `ExitLevels.ts`

#### `position`
**Purpose**: Active position visualization
**Columns**: `position_active`, `entry_price`, `position_type`, `index`
**Visual Output**: Shaded area from entry to current
**Location**: `Position.ts`

---

### 7. Pattern Detection ⭐ NEW

All pattern detection plotkinds use **Highcharts Annotations** to draw shapes and labels.

#### `flag_pattern`
**Purpose**: Bull/bear flag consolidations
**Columns**: `pattern_detected`, `flag_top`, `flag_bottom`, `pole_start`, `pole_end`, `stop_loss`, `index`
**Visual Output**:
- Rectangle for flag consolidation
- Line for pole (impulse move)
- Dashed line for stop loss
- Labels: "Bull Flag" / "Bear Flag"

**Location**: `FlagPattern.ts`

#### `pennant_pattern`
**Purpose**: Converging trendlines forming pennant
**Columns**: `pattern_detected`, `upper_trendline_start`, `upper_trendline_end`, `lower_trendline_start`, `lower_trendline_end`, `stop_loss`, `index`
**Visual Output**:
- Two converging trendlines
- Dashed stop loss line

**Location**: `PennantPattern.ts`

#### `triangle_patterns`
**Purpose**: Ascending/Descending/Symmetrical triangles
**Columns**: `pattern_detected`, `upper_start`, `upper_end`, `lower_start`, `lower_end`, `pattern_type`, `upper_slope`, `lower_slope`, `index`
**Visual Output**:
- Two trendlines forming triangle
- Labels showing slopes and pattern type

**Location**: `TrianglePatterns.ts`

#### `consolidation_box`
**Purpose**: Horizontal price consolidation zones
**Columns**: `box_detected`, `top`, `bottom`, `box_height`, `touch_count`, `upper_slope`, `lower_slope`, `target_up`, `target_down`, `index`
**Visual Output**:
- Rectangle for consolidation box
- Labels showing touch count
- Dashed lines for upside/downside targets

**Location**: `ConsolidationBox.ts`

**State Machine Pattern**:
```typescript
let activeBoxStart: number | null = null
let activeBoxData: BoxData | null = null

// Track contiguous box_detected=true ranges
if (boxDetected) {
  if (!activeBoxStart) {
    activeBoxStart = timestamp
    activeBoxData = { top, bottom, touchCount, ... }
  } else {
    // Update active box data
    activeBoxData = { ...newData }
  }
} else if (activeBoxStart && activeBoxData) {
  // Box ended - draw annotation
  shapes.push({ type: "rect", points: [...] })
  activeBoxStart = null
}
```

#### `double_top_bottom`
**Purpose**: Double top/bottom reversal patterns
**Columns**: `pattern_detected`, `breakout_level`, `target`, `index`
**Visual Output**:
- Path connecting two peaks/troughs
- Horizontal neckline (breakout level)
- Dashed target line

**Location**: `DoubleTopBottom.ts`

#### `head_and_shoulders`
**Purpose**: Bearish reversal pattern (head with two shoulders)
**Columns**: `pattern_detected`, `left_shoulder`, `head`, `right_shoulder`, `neckline`, `target`, `index`
**Visual Output**:
- Path connecting three peaks (LS-H-RS)
- Labels: "LS", "H", "RS"
- Solid neckline + dashed target
- Color: Red (bearish)

**Location**: `HeadAndShoulders.ts`

**Peak Detection**:
```typescript
// Find 3 peaks where head is highest
const peaks = extractedData
  .filter(row => row[1] === 1) // pattern_detected
  .map(row => ({ x: row[0], y: row[2] })) // timestamp, price

const head = peaks.reduce((max, p) => p.y > max.y ? p : max)
const leftShoulder = peaks.filter(p => p.x < head.x)[0]
const rightShoulder = peaks.filter(p => p.x > head.x)[0]
```

#### `inverse_head_and_shoulders`
**Purpose**: Bullish reversal pattern (inverted H&S)
**Columns**: Same as `head_and_shoulders`
**Visual Output**: Same structure, but:
- Finds 3 troughs (lowest is head)
- Color: Green (bullish)
- Labels: "LT" (left trough), "H" (head), "RT" (right trough)

**Location**: `InverseHeadAndShoulders.ts`

---

### 8. ML & Advanced ⭐ NEW

#### `sentiment`
**Purpose**: NLP-based market sentiment visualization
**Columns**: `sentiment`, `confidence`, `index`
**Visual Output**: Column series with color-coded sentiment
- Positive: Green (#10B981)
- Neutral: Gray (#6B7280)
- Negative: Red (#EF4444)
- Height: Confidence score

**Location**: `Sentiment.ts`

```typescript
const colors = data.map((row, i) => {
  const sentiment = sentimentColumn.get(i)
  switch (sentiment?.toLowerCase()) {
    case 'positive': return '#10B981'
    case 'negative': return '#EF4444'
    default: return '#6B7280'
  }
})
```

#### `hmm` (Hidden Markov Model)
**Purpose**: State-based regime detection
**Columns**: `state`, `probability`, `index`
**Visual Output**: Column series with rotating 6-color palette
- States: 0, 1, 2, 3, 4, 5+ (cycles colors)
- Colors: Blue, Green, Amber, Red, Violet, Pink

**Location**: `HMM.ts`

```typescript
const STATE_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899'  // pink
]
const color = STATE_COLORS[state % 6]
```

---

### 9. Fibonacci & Analysis

#### `retracements`
**Purpose**: Fibonacci retracement levels
**Columns**: `fib_236`, `fib_382`, `fib_500`, `fib_618`, `fib_786`, `index`
**Visual Output**: Five horizontal lines at Fib levels
**Location**: `Retracements.ts`

---

## Standardization: Enums & Color Mapping

### LucideIcon Enum (227 Icons)

```typescript
export enum LucideIcon {
  // Charts & Analysis
  BarChart = 'BarChart',
  LineChart = 'LineChart',
  CandlestickChart = 'CandlestickChart',
  TrendingUp = 'TrendingUp',
  TrendingDown = 'TrendingDown',

  // Signals & Alerts
  Flag = 'Flag',
  Zap = 'Zap',
  AlertTriangle = 'AlertTriangle',

  // ... 220 more icons
}
```

**Usage in Flag PlotKind**:
```typescript
import { getLucideIconNameFromString } from '../../../../constants/iconMapping'

const flagIcon = seriesConfig.configOptions?.flagIcon as string || "Flag"
const iconName = getLucideIconNameFromString(flagIcon) // "flag"
```

**Location**: `src/types/LucideIcons.ts`
**Mapping**: `src/constants/iconMapping.ts`

### TailwindColor Enum (42 Colors)

Organized by category:
- **Semantic** (9): Default, Primary, Secondary, Success, Warning, Error, Info, Muted, Accent
- **Grayscale** (7): Slate, Gray, Zinc, Neutral, Stone, Black, White
- **Cool** (7): Blue, Sky, Cyan, Teal, Indigo, Violet, Purple
- **Warm** (8): Red, Rose, Pink, Fuchsia, Orange, Amber, Yellow, Lime
- **Green** (2): Green, Emerald
- **Metallic** (3): Gold, Silver, Bronze

```typescript
export enum TailwindColor {
  Primary = 'Primary',
  Success = 'Success',
  Error = 'Error',
  // ... 39 more
}
```

**Color Mapping Functions**:
```typescript
// Get hex color
getTailwindColorHex(TailwindColor.Primary) // "#3B82F6"

// Get RGBA with transparency (for zones, backgrounds)
getTailwindColorRgba(TailwindColor.Success, 0.15)
// "rgba(16, 185, 129, 0.15)"

// Case-insensitive string lookup (from C++ backend)
getTailwindColorHexFromString("Blue") // "#3B82F6"
```

**Location**: `src/types/TailwindColors.ts`
**Mapping**: `src/constants/colorMapping.ts`

---

## How PlotKinds Are Built

### Step 1: Define Data Schema

```typescript
// Example: RSI
export const RSI_PLOT_KIND_DATA_KEYS = [
  "value",  // RSI value (0-100)
  "index"   // Timestamp
]
```

### Step 2: Extract Data from Arrow Table

```typescript
import { extractPlotKindData } from '../config/seriesConfig'

const extractedData = extractPlotKindData({
  seriesConfig,
  data,
  columnNames: RSI_PLOT_KIND_DATA_KEYS
})
// Returns: Array<[timestamp, value]>
```

### Step 3: Transform to Highcharts Format

```typescript
const seriesData = extractedData.map((row) => {
  const [timestamp, value] = row
  return [timestamp, value]
})
```

### Step 4: Create Series Configuration

```typescript
const series: SeriesOptionsType[] = [{
  ...getSharedPlotKindSeriesOptions(seriesConfig),
  type: 'line',
  data: seriesData,
  color: '#3B82F6',
  yAxis: seriesConfig.yAxis
}]
```

### Step 5: Add Plot Lines/Annotations (Optional)

```typescript
const yAxisOptions = {
  plotLines: [
    { value: 70, color: 'red', width: 1, dashStyle: 'Dash' },
    { value: 30, color: 'green', width: 1, dashStyle: 'Dash' }
  ]
}
```

### Step 6: Return PlotElements

```typescript
return {
  series,
  annotations: { shapes: [...], labels: [...] },
  plotBands: [...]
}
```

---

## Integration Points

### 1. Route Registration

All plotkinds are registered in `EpochPlotKindOptions.ts`:

```typescript
import { RSI_PLOT_KIND_DATA_KEYS, generateRSIPlotElements } from './RSI'

// In generatePlotElements()
switch (seriesConfig.type) {
  case PLOT_KIND.RSI:
    return generateRSIPlotElements({ data, seriesConfig })
  // ... other cases
}

// In extractPlotKindSeriesData()
switch (plotKind) {
  case PLOT_KIND.RSI:
    return RSI_PLOT_KIND_DATA_KEYS
  // ... other cases
}
```

### 2. Backend Configuration

Backend sends `ChartInfoType` with series configs:

```typescript
{
  "yAxis": [
    { "top": 0, "height": 70 },      // Price pane
    { "top": 70, "height": 30 }      // RSI pane
  ],
  "series": [
    {
      "id": "candlestick-1",
      "type": "candlestick",
      "name": "Price",
      "dataMapping": {
        "index": "timestamp",
        "open": "open",
        "high": "high",
        "low": "low",
        "close": "close"
      },
      "yAxis": 0,
      "zIndex": 1
    },
    {
      "id": "rsi-1",
      "type": "rsi",
      "name": "RSI(14)",
      "dataMapping": {
        "index": "timestamp",
        "value": "rsi_14"
      },
      "yAxis": 1,
      "zIndex": 2
    }
  ]
}
```

### 3. Indicator Visibility Integration

All plotkinds automatically integrate with the indicator visibility panel:

```typescript
const indicatorVisibility = useIndicatorVisibility({
  jobId: campaignId,
  selectedTimeframe,
  timeframeConfig
})

// Filter series based on visibility state
const visibleSeries = allSeries.filter(s =>
  !s.id || indicatorVisibility.visibilityState[s.id] !== false
)
```

**Max Visible Indicators**: 5 (enforced by `useIndicatorVisibility` hook)
**Persistence**: Stored in localStorage per `jobId` and `timeframe`

---

## Adding a New PlotKind

### 1. Define the Handler

Create `MyIndicator.ts`:

```typescript
import type { Table } from 'apache-arrow'
import type { SeriesConfig } from '../../../../types/TradeAnalyticsTypes'
import type { PlotElements } from '../config/seriesConfig'
import { extractPlotKindData, getSharedPlotKindSeriesOptions } from '../config/seriesConfig'

export const MY_INDICATOR_PLOT_KIND_DATA_KEYS = [
  "value",
  "signal",
  "index"
]

export const generateMyIndicatorPlotElements = ({
  data,
  seriesConfig,
}: {
  data?: Table
  seriesConfig: SeriesConfig
}): PlotElements => {
  // 1. Extract data
  const extractedData = extractPlotKindData({
    seriesConfig,
    data,
    columnNames: MY_INDICATOR_PLOT_KIND_DATA_KEYS
  })

  // 2. Transform to series
  const series = [{
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: 'line',
    data: extractedData.map(row => [row[2], row[0]]), // [timestamp, value]
    color: '#3B82F6'
  }]

  // 3. Return
  return { series }
}
```

### 2. Add PLOT_KIND Enum

In `src/types/TradeAnalyticsTypes.ts`:

```typescript
export enum PLOT_KIND {
  // ... existing
  MY_INDICATOR = "my_indicator",
}
```

### 3. Register in Router

In `EpochPlotKindOptions.ts`:

```typescript
import {
  MY_INDICATOR_PLOT_KIND_DATA_KEYS,
  generateMyIndicatorPlotElements
} from "./MyIndicator"

// In generatePlotElements switch:
case PLOT_KIND.MY_INDICATOR:
  return generateMyIndicatorPlotElements({ data, seriesConfig })

// In extractPlotKindSeriesData switch:
case PLOT_KIND.MY_INDICATOR:
  return MY_INDICATOR_PLOT_KIND_DATA_KEYS
```

### 4. Backend Implementation

Update C++ backend to generate Arrow table with required columns and include in metadata:

```cpp
// In strategy results
auto my_indicator_series = SeriesConfig{
  .id = "my-indicator-1",
  .type = PlotKind::MY_INDICATOR,
  .name = "My Indicator",
  .data_mapping = {
    {"index", "timestamp"},
    {"value", "my_indicator_value"},
    {"signal", "my_indicator_signal"}
  },
  .y_axis = 1,
  .z_index = 10
};
```

---

## Best Practices

### 1. Data Extraction
- Always use `extractPlotKindData()` helper
- Define `DATA_KEYS` array for type safety
- Handle missing/null data gracefully

### 2. Performance
- Avoid expensive computations in render loop
- Use `useMemo` for derived data
- Filter large datasets before mapping

### 3. Type Safety
- Use `SeriesOptionsType` for series
- Use `AnnotationsOptions` for shapes/labels
- Cast data carefully when using Apache Arrow
- Use type assertions when needed: `as SeriesLineOptions`
- Use `NonNullable<>` for optional arrays: `NonNullable<AnnotationsOptions["shapes"]>`

### 4. Styling
- Use TailwindColor enum for consistency
- Provide configurable colors via `configOptions`
- Follow Highcharts theme integration

### 5. Annotations
- Use `NonNullable<AnnotationsOptions["shapes"]>` to avoid type errors
- Add type assertions for series: `as SeriesLineOptions`
- Clean up state after drawing (reset tracking variables)

### 6. State Management
- Use state machines for contiguous range detection
- Track active patterns across data iteration
- Finalize patterns when flag goes false or data ends

---

## Testing PlotKinds

### 1. Visual Testing
Run the playground:
```bash
npm run dev:playground
```

Navigate to `/trade-analytics?campaignId=test&userId=test`

### 2. Data Validation
Verify Arrow table columns match `DATA_KEYS`:
```typescript
console.log(data.schema.fields.map(f => f.name))
```

### 3. Series Validation
Check generated series in browser console:
```typescript
const elements = generateMyIndicatorPlotElements({ data, seriesConfig })
console.log(elements.series)
```

---

## Migration Notes

### From Pre-Standardization (Before Enums)

**Old Flag Implementation**:
```typescript
// Hardcoded logic for long/short/crossover
if (signalType === "long") {
  shape: "flag"
  fillColor: "green"
}
```

**New Flag Implementation**:
```typescript
// Flexible schema-driven
const flagIcon = configOptions?.flagIcon || "Flag"
const flagColor = getTailwindColorHexFromString(
  configOptions?.flagColor || "Blue"
)
```

**Migration**: Update backend to send `configOptions` with `flagIcon`, `flagColor`, `flagText`, `flagTextIsTemplate`.

---

## Summary

**Total PlotKinds**: 50+
**New in Latest Update**: 14 (1 enhanced, 13 new)
**Categories**: 9 (Core, Indicators, Overlays, Structure, Calendar, Signals, Patterns, ML, Fibonacci)
**Architecture**: Consistent interface with `generatePlotElements()` pattern
**Integration**: Automatic visibility toggle, localStorage persistence, type-safe enums

All plotkinds follow the same data flow and rendering pattern, making the system extensible and maintainable.
