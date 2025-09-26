// Charts library entry point - all Highcharts modules initialized here
// Import this file to use any Epoch chart components

'use client'

// Import Highstock which includes Highcharts core plus stock features
import Highcharts from 'highcharts/highstock'
import HighchartsMore from 'highcharts/highcharts-more'
import XRange from 'highcharts/modules/xrange'
import HighchartsHeatmap from 'highcharts/modules/heatmap'
import HistogramModule from 'highcharts/modules/histogram-bellcurve'
import BoostModule from 'highcharts/modules/boost'
import AccessibilityModule from 'highcharts/modules/accessibility'

// Initialize modules safely for SSR (same as EpochWeb pattern)
if (typeof Highcharts !== 'undefined' && typeof window !== 'undefined') {
  HighchartsMore(Highcharts)
  XRange(Highcharts)
  HighchartsHeatmap(Highcharts)
  HistogramModule(Highcharts)
  BoostModule(Highcharts)
  AccessibilityModule(Highcharts)
}

// Export all chart components
export { default as LineChart } from './LineChart'
export { default as BarChart } from './BarChart'
export { default as AreaChart } from './AreaChart'
export { default as HeatMap } from './HeatMap'
export { default as Histogram } from './Histogram'
export { default as BoxPlot } from './BoxPlot'
export { default as XRangeChart } from './XRange'
export { default as PieChart } from './PieChart'

// Export configured Highcharts instance (with stock features)
export { Highcharts }