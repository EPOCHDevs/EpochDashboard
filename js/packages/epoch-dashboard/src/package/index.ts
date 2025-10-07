/**
 * @epochlab/tearsheet-dashboard
 *
 * Advanced dashboard components
 */

// Main Dashboard Component
export { default as TearsheetDashboard } from '../components/Dashboard/TearsheetDashboard'

// Advanced Chart Components
export { default as LineChart } from '../components/charts/LineChart'
export { default as BarChart } from '../components/charts/BarChart'
export { default as AreaChart } from '../components/charts/AreaChart'
export { default as PieChart } from '../components/charts/PieChart'
export { default as HeatMap } from '../components/charts/HeatMap'
export { default as BoxPlot } from '../components/charts/BoxPlot'
export { default as Histogram } from '../components/charts/Histogram'
export { default as XRangeChart } from '../components/charts/XRange'




// Performance Utilities
export {
  useDebounce,
  useThrottle,
  useVirtualScrolling,
  useIntersectionObserver,
  useBatchedUpdates,
  PerformanceMonitor,
  FrameRateMonitor,
  WorkerPool,
  ObjectPool,
  performanceMonitor,
  withPerformanceMonitoring,
  processDataAsync,
  chunkArray,
  getMemoryUsage
} from '../utils/performanceUtils'

// Table and Card Components
export { default as TearsheetTable } from '../components/Dashboard/TearsheetTable'
export { default as Card } from '../components/Card'

// Utilities for working with TearSheet proto
export {
  downloadTearsheet,
  readTearsheetFile
} from '../utils/downloadTearsheet'

// Helper functions (kept minimal - proto is source of truth)
export {
  groupByCategory,
  formatCategoryLabel,
  extractCategories
} from '../utils/tearsheetHelpers'

// Constants
export {
  DASHBOARD_THEME,
  CHART_COLOR_CONFIG
} from '../constants'


// Proto types
export type {
  TearSheet,
  Chart,
  Table,
  CardDef,
  LinesDef,
  BarDef,
  AreaDef,
  PieDef,
  HeatMapDef,
  HistogramDef,
  BoxPlotDef,
  XRangeDef
} from '../types/proto'

