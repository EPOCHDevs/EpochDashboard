// Charts library entry point - all Highcharts modules initialized here
// Import this file to use any Epoch chart components

'use client'

// Import Highcharts core
import Highcharts from 'highcharts'

// Export all chart components
export { default as LineChart } from './LineChart'
export { default as NumericLineChart } from './NumericLineChart'
export { default as BarChart } from './BarChart'
export { default as AreaChart } from './AreaChart'
export { default as HeatMap } from './HeatMap'
export { default as Histogram } from './Histogram'
export { default as BoxPlot } from './BoxPlot'
export { default as XRangeChart } from './XRange'
export { default as PieChart } from './PieChart'

// Export configured Highcharts instance
export { Highcharts }