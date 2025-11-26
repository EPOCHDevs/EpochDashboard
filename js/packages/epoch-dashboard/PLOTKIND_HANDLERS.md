# PlotKind Handlers Reference

Complete documentation for all 37 PlotKind handlers in the EpochDashboard Trade Analytics system.

## Overview

PlotKind handlers transform data into chart visualizations using Highcharts. Each handler processes Apache Arrow table data and generates appropriate series configurations with optional annotations, shapes, and labels.

**Handler Registry Location:** `src/modules/TradeAnalyticsTab/components/PlotKinds/EpochPlotKindOptions.ts`

**Main Function:** `generatePlotElements()` - Routes to appropriate handler based on PLOT_KIND type

## Architecture

### SeriesConfig Interface
```typescript
interface SeriesConfig {
  id: string
  type: PLOT_KIND
  name: string
  dataMapping: { index: string; [key: string]: string }
  zIndex: number
  yAxis: number
  linkedTo?: string
  configOptions?: Record<string, unknown>
}
```

### Data Type
All handlers use Apache Arrow `Table<Record<string | number | symbol, DataType>>` for efficient data handling.

### Shared Utilities
- `extractPlotKindSeriesData()` - Extracts data from Apache Arrow table
- `validatePlotKindSeriesData()` - Validates required columns exist
- `getSharedPlotKindSeriesOptions()` - Returns common series props
- `getPlotKindSeriesColor()` - Hash-based color generation
- `extractColumn()` - Extracts single column from data

---

## Handler Categories

### 📈 Price Charts
- [Candlestick](#1-candlestick)
- [Line](#2-line)

### 📊 Oscillators
- [RSI](#3-rsi-relative-strength-index)
- [MACD](#4-macd-moving-average-convergence-divergence)
- [Stochastic](#5-stochastic)
- [CCI](#6-cci-commodity-channel-index)
- [Fisher](#7-fisher-transform)
- [QQE](#8-qqe-quantitative-qualitative-estimation)
- [Aroon](#9-aroon)
- [Elders](#10-elders-force-index)
- [FOSC](#11-fosc-forecast-oscillator)
- [AO](#12-ao-awesome-oscillator)
- [QStick](#13-qstick)

### 📐 Overlays & Bands
- [Bollinger Bands](#14-bollinger-bands)
- [BB Percent B](#15-bb-percent-b)
- [Ichimoku](#16-ichimoku-cloud)
- [Chande Kroll Stop](#17-chande-kroll-stop)
- [PSAR](#18-psar-parabolic-sar)
- [VWAP](#19-vwap-volume-weighted-average-price)

### 📉 Volatility
- [ATR](#20-atr-average-true-range)
- [Vortex](#21-vortex-indicator)

### 🎯 Market Structure
- [BOS/CHOCH](#22-boschoch-break-of-structurechange-of-character)
- [Swing High/Low](#23-shl-swing-highlow)
- [Order Blocks](#24-order-blocks)
- [FVG](#25-fvg-fair-value-gap)
- [Liquidity](#26-liquidity)

### 🚦 Signals & Annotations
- [Trade Signal](#27-trade-signal)
- [Flag](#28-flag)
- [Previous High/Low](#29-previous-highlow)
- [Retracements](#30-retracements-fibonacci)
- [Exit Levels](#31-exit-levels)

### 📅 Time-based
- [Sessions](#32-sessions-trading-sessions)
- [Gap](#33-gap)

### 📊 Position & Performance
- [Position](#34-position)
- [Column](#35-column)
- [Panel Line](#36-panel-line)
- [Panel Line Percent](#37-panel-line-percent)
- [H Line](#38-h-line-horizontal-line)

---

## Complete Handler Reference

### 1. CANDLESTICK
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Candlestick.ts`

**Enum Value:** `PLOT_KIND.CANDLESTICK = "candlestick"`

**Handler Function:** `generateCandlestickPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `open` - Opening price
- `high` - High price
- `low` - Low price
- `close` - Closing price

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesCandlestickOptions
  roundTrips?: IRoundTrip[]
}
```

**Style Options:**
- Standard Highcharts `SeriesCandlestickOptions`
- Default up color: `territory.success` (green)
- Default down color: `secondary.red` (red)

**Output:** `PlotElements` (includes series + optional annotations)

**Features:**
- Buy/sell point markers with SVG arrows
- Round trip annotations support
- Entry/exit point visualization

---

### 2. LINE
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Line.ts`

**Enum Value:** `PLOT_KIND.LINE = "line"`

**Handler Function:** `generateLinePlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `value` - Y-axis value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Style Options:**
- Standard Highcharts `SeriesLineOptions`
- Default lineWidth: `2`
- Default marker: `{ enabled: false }`
- Auto-color generation based on series name

**Output:** `SeriesLineOptions[]`

**Variants:** Also used for:
- `PANEL_LINE`
- `PANEL_LINE_PERCENT`
- `H_LINE`
- `VWAP`
- `BB_PERCENT_B`

---

### 3. RSI (Relative Strength Index)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/RSI.ts`

**Enum Value:** `PLOT_KIND.RSI = "rsi"`

**Handler Function:** `generateRSIPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `value` - RSI value (0-100)

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: RSIStyleOptions
}
```

**Style Options:**
```typescript
interface RSIStyleOptions {
  rsiColor?: string          // Default: "#8b5cf6" (purple)
  overboughtColor?: string   // Default: "#ef4444" (red)
  oversoldColor?: string     // Default: "#10b981" (green)
  midlineColor?: string      // Default: "#6b7280" (gray)
  overboughtLevel?: number   // Default: 70
  oversoldLevel?: number     // Default: 30
}
```

**Output:** `SeriesOptionsType[]` (4 series)

**Series Generated:**
1. RSI line (main indicator)
2. Overbought line (horizontal reference)
3. Oversold line (horizontal reference)
4. Midline at 50 (horizontal reference)

---

### 4. MACD (Moving Average Convergence Divergence)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/MACD.ts`

**Enum Value:** `PLOT_KIND.MACD = "macd"`

**Handler Function:** `generateMACDPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `macd` - MACD line value
- `macd_signal` - Signal line value
- `macd_histogram` - Histogram value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: MACDStyleOptions
}
```

**Style Options:**
```typescript
interface MACDStyleOptions {
  macdColor?: string              // Default: territory.success (green)
  signalColor?: string            // Default: primary.white
  histogramBullishColor?: string  // Default: territory.success
  histogramBearishColor?: string  // Default: secondary.red
}
```

**Output:** `SeriesOptionsType[]` (3 series)

**Series Generated:**
1. MACD line (solid)
2. Signal line (dashed)
3. Histogram (column with color zones at 0)

---

### 5. STOCHASTIC
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Stochastic.ts`

**Enum Value:** `PLOT_KIND.STOCH = "stoch"`

**Handler Function:** `generateStochasticPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `stoch_k` - %K line value
- `stoch_d` - %D line value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: StochasticStyleOptions
}
```

**Style Options:**
```typescript
interface StochasticStyleOptions {
  kLineColor?: string        // Default: "#3b82f6" (blue)
  dLineColor?: string        // Default: "#f59e0b" (amber)
  overboughtColor?: string   // Default: "#ef4444" (red)
  oversoldColor?: string     // Default: "#10b981" (green)
  overboughtLevel?: number   // Default: 80
  oversoldLevel?: number     // Default: 20
}
```

**Output:** `SeriesOptionsType[]` (4 series)

**Series Generated:**
1. %K line (fast stochastic)
2. %D line (slow stochastic, dashed)
3. Overbought line (horizontal reference)
4. Oversold line (horizontal reference)

---

### 6. CCI (Commodity Channel Index)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/CCI.ts`

**Enum Value:** `PLOT_KIND.CCI = "cci"`

**Handler Function:** `generateCCIPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `value` - CCI value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `SeriesLineOptions[]`

**Features:**
- Line series with zero line reference
- Color zones for positive/negative values

---

### 7. FISHER (Transform)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Fisher.ts`

**Enum Value:** `PLOT_KIND.FISHER = "fisher"`

**Handler Function:** `generateFisherPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `fisher` - Fisher transform value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `SeriesLineOptions[]`

---

### 8. QQE (Quantitative Qualitative Estimation)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/QQE.ts`

**Enum Value:** `PLOT_KIND.QQE = "qqe"`

**Handler Function:** `generateQQEPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `qqe` - QQE line value
- `qqe_signal` - QQE signal line value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `SeriesLineOptions[]` (2 lines with optional bands)

---

### 9. AROON
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Aroon.ts`

**Enum Value:** `PLOT_KIND.AROON = "aroon"`

**Handler Function:** `generateAroonPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `aroon_up` - Aroon Up value
- `aroon_down` - Aroon Down value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `SeriesLineOptions[]` (2 lines)

**Series Generated:**
1. Aroon Up line
2. Aroon Down line

---

### 10. ELDERS (Force Index)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Elders.ts`

**Enum Value:** `PLOT_KIND.ELDERS = "elders"`

**Handler Function:** `generateEldersPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `ema` - EMA value
- `rsi` - RSI value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `SeriesLineOptions[]`

---

### 11. FOSC (Forecast Oscillator)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/FOSC.ts`

**Enum Value:** `PLOT_KIND.FOSC = "fosc"`

**Handler Function:** `generateFOSCPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `fosc` - FOSC value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `SeriesLineOptions[]`

---

### 12. AO (Awesome Oscillator)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Column.ts`

**Enum Value:** `PLOT_KIND.AO = "ao"`

**Handler Function:** `generateColumnPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `value` - AO value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesColumnOptions
}
```

**Output:** `SeriesColumnOptions[]`

**Features:**
- Column chart with color zones
- Positive values: green
- Negative values: red
- Zone threshold: 0

---

### 13. QSTICK
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/QStick.ts`

**Enum Value:** `PLOT_KIND.QSTICK = "qstick"`

**Handler Function:** `generateQStickPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `qstick` - QStick value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesColumnOptions
}
```

**Output:** `SeriesColumnOptions[]`

---

### 14. BOLLINGER BANDS
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/BollingerBands.ts`

**Enum Value:** `PLOT_KIND.BBANDS = "bbands"`

**Handler Function:** `generateBollingerBandsPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `bbands_upper` - Upper band value
- `bbands_middle` - Middle band value (SMA)
- `bbands_lower` - Lower band value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: BollingerBandsStyleOptions
}
```

**Style Options:**
```typescript
interface BollingerBandsStyleOptions {
  upperBandColor?: string   // Default: "#2563eb" (blue)
  middleBandColor?: string  // Default: "#64748b" (slate)
  lowerBandColor?: string   // Default: "#2563eb" (blue)
  fillColor?: string        // Default: "rgba(37, 99, 235, 0.1)"
}
```

**Output:** `SeriesOptionsType[]` (4 series)

**Series Generated:**
1. Area range fill (between upper and lower)
2. Upper band line
3. Middle band line (dashed)
4. Lower band line

---

### 15. BB PERCENT B
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Line.ts`

**Enum Value:** `PLOT_KIND.BB_PERCENT_B = "bb_percent_b"`

**Handler Function:** `generateLinePlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `value` - %B value (0-1 range, where 0.5 = middle band)

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `SeriesLineOptions[]`

**Features:**
- Shows position within Bollinger Bands
- Values > 1 = above upper band
- Values < 0 = below lower band
- Value = 0.5 = at middle band

---

### 16. ICHIMOKU (Cloud)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Ichimoku.ts`

**Enum Value:** `PLOT_KIND.ICHIMOKU = "ichimoku"`

**Handler Function:** `generateIchimokuPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `tenkan` - Tenkan-sen (Conversion Line)
- `kijun` - Kijun-sen (Base Line)
- `senkou_a` - Senkou Span A (Leading Span A)
- `senkou_b` - Senkou Span B (Leading Span B)

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `SeriesLineOptions[]`

**Features:**
- Multiple line series
- Cloud area between Senkou Span A & B
- Color-coded based on cloud direction

---

### 17. CHANDE KROLL STOP
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/ChandeKrollStop.ts`

**Enum Value:** `PLOT_KIND.CHANDE_KROLL_STOP = "chande_kroll_stop"`

**Handler Function:** `generateChandeKrollStopPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `stop_long` - Long stop level
- `stop_short` - Short stop level

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `SeriesLineOptions[]` (2 lines)

**Series Generated:**
1. Long stop line
2. Short stop line

---

### 18. PSAR (Parabolic SAR)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/PSAR.ts`

**Enum Value:** `PLOT_KIND.PSAR = "psar"`

**Handler Function:** `generatePSARPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `psar` - Parabolic SAR value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesScatterOptions
}
```

**Output:** `SeriesScatterOptions[]`

**Features:**
- Scatter plot with small circular markers
- Dots appear above/below price

---

### 19. VWAP (Volume Weighted Average Price)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Line.ts`

**Enum Value:** `PLOT_KIND.VWAP = "vwap"`

**Handler Function:** `generateLinePlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `value` - VWAP value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `SeriesLineOptions[]`

---

### 20. ATR (Average True Range)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/ATR.ts`

**Enum Value:** `PLOT_KIND.ATR = "atr"`

**Handler Function:** `generateATRPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `value` - ATR value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Style Options:**
- Default color: green
- Default lineWidth: 2
- Default marker: disabled

**Output:** `SeriesLineOptions[]`

---

### 21. VORTEX (Indicator)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Vortex.ts`

**Enum Value:** `PLOT_KIND.VORTEX = "vortex"`

**Handler Function:** `generateVortexPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `vortex_plus` - VI+ (Positive Vortex)
- `vortex_minus` - VI- (Negative Vortex)

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `SeriesLineOptions[]` (2 lines)

**Series Generated:**
1. VI+ line
2. VI- line

---

### 22. BOS/CHOCH (Break of Structure/Change of Character)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/BOSCHOCH.ts`

**Enum Value:** `PLOT_KIND.BOS_CHOCH = "bos_choch"`

**Handler Function:** `generateBOSCHOCHPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `bos` - Break of Structure indicator
- `choch` - Change of Character indicator
- `level` - Price level

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `SeriesLineOptions[]`

---

### 23. SHL (Swing High/Low)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/SwingHighLow.ts`

**Enum Value:** `PLOT_KIND.SHL = "shl"`

**Handler Function:** `generateSwingHighLowPlotElements()`

**Required Columns:**
- `index` - Time/date index
- `swing_high` - Swing high value
- `swing_low` - Swing low value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesScatterOptions
}
```

**Output:** `PlotElements`

**Features:**
- Scatter markers at swing points
- Different markers for highs vs lows

---

### 24. ORDER BLOCKS
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/OrderBlocks.ts`

**Enum Value:** `PLOT_KIND.ORDER_BLOCKS = "order_blocks"`

**Handler Function:** `generateOrderBlocksPlotElements()`

**Required Columns:**
- `index` - Time/date index
- `ob` - Order block type (+1 bullish, -1 bearish)
- `top` - Top price of block
- `bottom` - Bottom price of block
- `mitigated_index` - Index where block was mitigated (optional)
- `ob_volume` - Volume of order block
- `percentage` - Percentage strength

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: OrderBlocksStyleOptions
}
```

**Style Options:**
```typescript
interface OrderBlocksStyleOptions {
  orderBlockColor?: string     // Default: "rgba(138, 43, 226, 0.3)" (purple)
  orderBlockOpacity?: number   // Default: 0.3
  borderColor?: string
}
```

**Output:** `PlotElements`

**Features:**
- Area range zones for order blocks
- Rectangular annotations with labels
- Volume and percentage information displayed
- Shows mitigated vs active blocks

---

### 25. FVG (Fair Value Gap)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/FVG.ts`

**Enum Value:** `PLOT_KIND.FVG = "fvg"`

**Handler Function:** `generateFVGPlotElements()`

**Required Columns:**
- `index` - Time/date index
- `fvg` - FVG type (+1 bullish, -1 bearish)
- `top` - Top price of gap
- `bottom` - Bottom price of gap
- `mitigated_index` - Index where gap was filled (optional)

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesArearangeOptions
}
```

**Output:** `PlotElements`

**Features:**
- Yellow area range zones (opacity 0.2)
- Rectangular annotations with "FVG" labels
- Shows gap extent from creation to mitigation

---

### 26. LIQUIDITY
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Liquidity.ts`

**Enum Value:** `PLOT_KIND.LIQUIDITY = "liquidity"`

**Handler Function:** `generateLiquidityPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `liquidity` - Liquidity level indicator
- `h` - High price (from OHLC)
- `l` - Low price (from OHLC)

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `PlotElements`

**Features:**
- Complex shape-based rendering
- Identifies liquidity zones
- Uses high/low data for zone placement

---

### 27. TRADE SIGNAL
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/TradeSignal.ts`

**Enum Value:** `PLOT_KIND.TRADE_SIGNAL = "trade_signal"`

**Handler Function:** `generateTradeSignalPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `enter_long` - Long entry signal price (optional)
- `enter_short` - Short entry signal price (optional)
- `exit_long` - Long exit signal price (optional)
- `exit_short` - Short exit signal price (optional)

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
}
```

**Output:** `SeriesFlagsOptions[]` (up to 4 series)

**Series Generated:**
1. **Enter Long** - Green fill (#26a69a), black border, "L" title
2. **Enter Short** - Red fill (#f23645), black border, "S" title
3. **Exit Long** - Black fill, white border, "XL" title
4. **Exit Short** - Black fill, white border, "XS" title

**Features:**
- Flag markers on price chart
- Only generates series for signals present in data
- Distinct colors and titles for each signal type

---

### 28. FLAG
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Flag.ts`

**Enum Value:** `PLOT_KIND.FLAG = "flag"`

**Handler Function:** `generateFlagPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `flag` - Flag value/price level

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
}
```

**Output:** `SeriesFlagsOptions[]`

**Features:**
- Square pin shape
- 16px width
- Accent color

---

### 29. PREVIOUS HIGH/LOW
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/PreviousHighLow.ts`

**Enum Value:** `PLOT_KIND.PREVIOUS_HIGH_LOW = "previous_high_low"`

**Handler Function:** `generatePreviousHighLowPlotElements()`

**Required Columns:**
- `index` - Time/date index
- `prev_high` - Previous high price
- `prev_low` - Previous low price

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
}
```

**Output:** `PlotElements`

**Features:**
- Horizontal plot lines
- Shows previous period's high/low levels
- Useful for support/resistance

---

### 30. RETRACEMENTS (Fibonacci)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Retracements.ts`

**Enum Value:** `PLOT_KIND.RETRACEMENTS = "retracements"`

**Handler Function:** `generateRetracementsPlotElements()`

**Required Columns:**
- Fibonacci level columns (0%, 23.6%, 38.2%, 50%, 61.8%, 100%)

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
}
```

**Output:** `PlotElements`

**Features:**
- Horizontal plot lines at Fibonacci levels
- Labels showing percentage levels
- Useful for retracement analysis

---

### 31. EXIT LEVELS
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/ExitLevels.ts`

**Enum Value:** `PLOT_KIND.EXIT_LEVELS = "exit_levels"`

**Handler Function:** `generateExitLevelsPlotElements()`

**Required Columns:**
- Multiple exit level columns

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
}
```

**Output:** `PlotElements`

**Features:**
- Plot bands showing exit zones
- Multiple level support
- Visual target areas

---

### 32. SESSIONS (Trading Sessions)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Sessions.ts`

**Enum Value:** `PLOT_KIND.SESSIONS = "sessions"`

**Handler Function:** `generateSessionsPlotElements()`

**Required Columns:**
- `index` - Time/date index
- `active` - Session active indicator
- `high` - Session high price
- `low` - Session low price

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SessionsStyleOptions
}
```

**Style Options:**
```typescript
interface SessionsStyleOptions {
  fillColor?: string
  opacity?: number  // Default: 0.08
}
```

**Config Options:**
```typescript
configOptions: {
  session: "Sydney" | "Tokyo" | "London" | "NewYork" | CustomRange
}
```

**Session Colors:**
- **Sydney** - #F59E0B (amber)
- **Tokyo** - #3B82F6 (blue)
- **London** - #8B5CF6 (violet)
- **NewYork** - #6366F1 (indigo)
- **Kill Zones** - Lighter variants of main colors

**Output:** `PlotElements`

**Features:**
- Dashed rectangle paths
- Session name labels
- Highlights active trading sessions
- Configurable via `configOptions.session`

---

### 33. GAP
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Gap.ts`

**Enum Value:** `PLOT_KIND.GAP = "gap"`

**Handler Function:** `generateGapPlotElements()`

**Required Columns:**
- `index` - Time/date index
- `gap` - Gap type indicator
- `top` - Top price of gap
- `bottom` - Bottom price of gap
- `gap_points` - Gap magnitude

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
}
```

**Output:** `PlotElements`

**Features:**
- Highlights price gaps
- Shows gap extent
- Displays gap magnitude

---

### 34. POSITION
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Position.ts`

**Enum Value:** `PLOT_KIND.POSITION = "position"`

**Handler Function:** `generatePositionPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `position` - Position value (+1 long, -1 short, 0 flat)

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesColumnOptions
}
```

**Output:** `SeriesColumnOptions[]`

**Features:**
- Column chart showing position state
- Color-coded by position type
- Useful for strategy visualization

---

### 35. COLUMN
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Column.ts`

**Enum Value:** `PLOT_KIND.COLUMN = "column"`

**Handler Function:** `generateColumnPlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `value` - Column value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesColumnOptions
}
```

**Output:** `SeriesColumnOptions[]`

**Features:**
- Color zones at 0
- Positive values: green (territory.success)
- Negative values: red (secondary.red)
- General-purpose column chart

---

### 36. PANEL LINE
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Line.ts`

**Enum Value:** `PLOT_KIND.PANEL_LINE = "panel_line"`

**Handler Function:** `generateLinePlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `value` - Y-axis value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `SeriesLineOptions[]`

**Note:** Uses same handler as LINE - intended for separate panel display

---

### 37. PANEL LINE PERCENT
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/PanelLinePercent.ts`

**Enum Value:** `PLOT_KIND.PANEL_LINE_PERCENT = "panel_line_percent"`

**Handler Function:** `generateLinePlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `value` - Percentage value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `SeriesLineOptions[]`

**Note:** Uses same handler as LINE - typically for percentage-based indicators in separate panels

---

### 38. H LINE (Horizontal Line)
**File:** `src/modules/TradeAnalyticsTab/components/PlotKinds/Line.ts`

**Enum Value:** `PLOT_KIND.H_LINE = "h_line"`

**Handler Function:** `generateLinePlotKindSeriesOptions()`

**Required Columns:**
- `index` - Time/date index
- `value` - Horizontal level value

**Props:**
```typescript
{
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
```

**Output:** `SeriesLineOptions[]`

**Note:** Uses same handler as LINE - renders as horizontal reference line

---

## Common Patterns

### Output Types

#### SeriesOptions
Most basic indicators return `SeriesLineOptions[]` or `SeriesColumnOptions[]`:
- Single series configuration
- Direct data mapping
- Simple styling

#### PlotElements
Complex visualizations return `PlotElements`:
```typescript
interface PlotElements {
  series: SeriesOptionsType[]
  annotations?: Highcharts.AnnotationsOptions[]
}
```
- Multiple series support
- Shapes, labels, and annotations
- Advanced visualizations (FVG, Order Blocks, Sessions)

### Color Schemes

**Default Colors:**
- Success/Bullish: `territory.success` (green)
- Danger/Bearish: `secondary.red` (red)
- Primary: `primary.white`
- Neutral: `#64748b` (slate)

**Auto Color Generation:**
Many handlers use `getPlotKindSeriesColor()` for consistent hash-based color assignment per series name.

### Data Validation

All handlers use:
1. `extractPlotKindSeriesData()` - Extract columns from Arrow table
2. `validatePlotKindSeriesData()` - Validate required columns exist
3. Error handling for missing/invalid data

---

## Usage Example

```typescript
import { generatePlotElements } from './EpochPlotKindOptions';
import { PLOT_KIND } from '../types/TradeAnalyticsTypes';

const seriesConfig: SeriesConfig = {
  id: 'rsi-1',
  type: PLOT_KIND.RSI,
  name: 'RSI(14)',
  dataMapping: { index: 'time', value: 'rsi_14' },
  zIndex: 1,
  yAxis: 1
};

const plotElements = generatePlotElements({
  data: arrowTable,
  seriesConfig,
  styleOptions: {
    rsiColor: '#8b5cf6',
    overboughtLevel: 70,
    oversoldLevel: 30
  }
});

// Returns PlotElements with 4 series: RSI line + 3 reference lines
```

---

## Data Format

All handlers expect Apache Arrow `Table` format with specific column names:

**Time Column:**
- `index` - Timestamp or sequential index

**Value Columns:**
- Named according to indicator (e.g., `macd`, `stoch_k`, `bbands_upper`)
- Type: `Float32` or `Float64`

**Example Arrow Schema:**
```typescript
{
  index: Int32Array | Float64Array,
  value: Float32Array,
  // ... other indicator-specific columns
}
```

---

## Registry Implementation

The main router function in `EpochPlotKindOptions.ts`:

```typescript
export const generatePlotElements = ({
  data,
  seriesConfig,
  roundTrips,
}: generatePlotElementsProps): PlotElements | null => {
  switch (seriesConfig.type) {
    case PLOT_KIND.LINE:
    case PLOT_KIND.PANEL_LINE:
    case PLOT_KIND.H_LINE:
    case PLOT_KIND.VWAP:
    case PLOT_KIND.BB_PERCENT_B:
      return generateLinePlotKindSeriesOptions({ data, seriesConfig });

    case PLOT_KIND.RSI:
      return generateRSIPlotKindSeriesOptions({ data, seriesConfig });

    // ... all 37 cases

    default:
      return null;
  }
};
```

---

## File Structure

```
src/modules/TradeAnalyticsTab/components/PlotKinds/
├── EpochPlotKindOptions.ts    # Main registry
├── ATR.ts
├── RSI.ts
├── MACD.ts
├── BollingerBands.ts
├── Stochastic.ts
├── Candlestick.ts
├── Line.ts
├── Column.ts
├── FVG.ts
├── OrderBlocks.ts
├── Sessions.ts
├── TradeSignal.ts
├── ... (25+ more handlers)
└── utils/
    ├── extractPlotKindSeriesData.ts
    ├── validatePlotKindSeriesData.ts
    └── getPlotKindSeriesColor.ts
```

---

## Version Information

**Package:** `@epoch/dashboard`
**Current Version:** 1.5.20+
**Last Updated:** 2025

For the latest updates and changes, check the git history:
```bash
git log -- src/modules/TradeAnalyticsTab/components/PlotKinds/
```

---

## Contributing

When adding new PlotKind handlers:

1. Create handler file in `PlotKinds/` directory
2. Add enum value to `PLOT_KIND` in `TradeAnalyticsTypes.ts`
3. Register in `generatePlotElements()` switch statement
4. Document required columns and style options
5. Add to this README under appropriate category
6. Include tests for data validation

---

## Support

For questions or issues:
- Check handler source files for implementation details
- Review TypeScript interfaces for option types
- Consult Highcharts documentation for series options
- Refer to Apache Arrow docs for data format details
