/**
 * @epochlab/tearsheet-dashboard
 *
 * React component library for TearSheet protobuf visualization
 * Built with Tailwind CSS for maximum customization
 */

// ============================================================================
// PRIMARY EXPORT - Main TearsheetDashboard Component
// ============================================================================

export { default as TearsheetDashboard } from './components/Dashboard/TearsheetDashboard'

// High-level container that fetches tearsheet data automatically
export { DashboardContainer } from './components/Dashboard/DashboardContainer'
export type { DashboardContainerProps } from './components/Dashboard/DashboardContainer'

// Unified container that combines Performance Overview + Trade Analytics
export { UnifiedDashboardContainer } from './components/Dashboard/UnifiedDashboardContainer'
export type { UnifiedDashboardContainerProps, DashboardView } from './components/Dashboard/UnifiedDashboardContainer'

// ============================================================================
// CORE UTILITIES
// ============================================================================

// File handling utilities
export {
  downloadTearsheet,
  readTearsheetFile
} from './utils/downloadTearsheet'

// TearSheet data processing utilities
export {
  groupByCategory,
  formatCategoryLabel,
  extractCategories,
  filterByCategory,
  getChartTitle,
  getChartId
} from './utils/tearsheetHelpers'

// Mock data generation
export {
  createMockTearsheet,
  createMinimalTearsheet
} from './utils/mockTearsheet'

// Proto value extraction utilities
export {
  getScalarValue,
  getScalarNumericValue,
  getScalarStringValue,
  getScalarDatetimeValue,
  formatScalarByType
} from './utils/protoHelpers'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// Core protobuf types
export type {
  TearSheet,
  Chart,
  Table,
  CardDef,
  CardData,
  Scalar,
  // Chart type definitions
  LinesDef,
  BarDef,
  AreaDef,
  PieDef,
  HeatMapDef,
  HeatMapPoint,
  HistogramDef,
  BoxPlotDef,
  XRangeDef,
  XRangePoint,
  BoxPlotDataPoint,
  BoxPlotOutlier,
  ProtoArray
} from './types/proto'

// Proto enums and classes (exported as values, not just types)
export {
  AxisType,
  EpochFolioType,
  EpochFolioDashboardWidget,
  DashStyle,
  StackType,
  TearSheetClass
} from './types/proto'

// Dashboard component types
export type {
  DashboardProps,
  CategoryContentProps,
  DashboardTheme,
  ChartOptions,
  TableOptions,
  CardOptions
} from './types/dashboard'

export { DashboardLayout } from './types/dashboard'

// ============================================================================
// SECONDARY EXPORTS - Individual Components (Advanced Usage)
// ============================================================================

// Chart components for custom layouts
export { default as LineChart } from './components/charts/LineChart'
export { default as BarChart } from './components/charts/BarChart'
export { default as AreaChart } from './components/charts/AreaChart'
export { default as PieChart } from './components/charts/PieChart'
export { default as HeatMap } from './components/charts/HeatMap'
export { default as BoxPlot } from './components/charts/BoxPlot'
export { default as Histogram } from './components/charts/Histogram'
export { default as XRangeChart } from './components/charts/XRange'


// Table and Card components
export { default as TearsheetTable } from './components/Dashboard/TearsheetTable'
export { default as Card } from './components/Card'

// Category content component for custom dashboard layouts
export { default as TearsheetCategoryContent } from './components/Dashboard/TearsheetCategoryContent'

// ============================================================================
// THEME AND STYLING
// ============================================================================

// Theme configuration and utilities
export {
  applyHighchartsTheme,
  createThemedChartOptions
} from './utils/chartTheme'

// Constants and color configurations
export {
  DASHBOARD_THEME,
  CHART_COLOR_CONFIG,
  HEATMAP_CHART_COLOR_CONFIG,
  PIE_CHART_COLOR_PALETTE,
  BOXPLOT_COLOR_CONFIG,
  HISTOGRAM_COLOR_CONFIG,
  XRANGE_COLOR_PALETTE,
  ChartDataSeriesType,
  SERIES_NAME_MAPPING
} from './constants'

// Legacy theme export for backward compatibility
export { defaultTheme } from './config/theme'

// ============================================================================
// TRADE ANALYTICS COMPONENTS
// ============================================================================

// Main chart renderer component (low-level, requires data to be passed in)
export { default as TradeAnalyticsChartRenderer } from './modules/TradeAnalyticsTab/components/TradeAnalyticsChartRenderer'

// Container component (high-level, fetches data automatically)
export { TradeAnalyticsContainer } from './modules/TradeAnalyticsTab'
export type { TradeAnalyticsContainerProps } from './modules/TradeAnalyticsTab'

// Badge components
export { default as RenderTradePositionBadge } from './modules/TradeAnalyticsTab/components/RenderTradePositionBadge'
export { default as RenderTradeResultBadge } from './modules/TradeAnalyticsTab/components/RenderTradeResultBadge'

// Types for Trade Analytics
export * from './types/TradeAnalyticsTypes'
export * from './types/AssetsTypes'

// Constants and utilities
export * from './constants/tradeAnalytics'
export * from './utils/tailwindHelpers'
export * from './utils/formatters'