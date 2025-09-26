// Mock data for BoxPlot component testing

export interface BoxPlotPoint {
  name?: string
  low: number
  q1: number
  median: number
  q3: number
  high: number
  outliers?: number[]
}

export interface BoxPlotDef {
  chartDef?: {
    id?: string
    title?: string
    xAxis?: {
      type?: number
      label?: string
      categories?: string[]
    }
    yAxis?: {
      type?: number
      label?: string
    }
  }
  data?: BoxPlotPoint[]
  straightLines?: Array<{
    title?: string
    value?: number
    vertical?: boolean
  }>
  showOutliers?: boolean
  boxWidth?: number
  whiskerLength?: number | string
  medianColor?: string
  fillColor?: string
}

// Sample dataset with performance metrics
export const performanceBoxPlotData: BoxPlotDef = {
  chartDef: {
    id: 'performance-boxplot-1',
    title: 'Performance Metrics Distribution',
    xAxis: {
      label: 'Metrics',
      categories: ['Response Time', 'CPU Usage', 'Memory Usage', 'Network Latency', 'Disk I/O']
    },
    yAxis: {
      label: 'Values'
    }
  },
  data: [
    {
      name: 'Response Time',
      low: 50,
      q1: 120,
      median: 180,
      q3: 250,
      high: 320,
      outliers: [400, 450, 35, 25]
    },
    {
      name: 'CPU Usage',
      low: 10,
      q1: 25,
      median: 45,
      q3: 65,
      high: 85,
      outliers: [95, 98, 5]
    },
    {
      name: 'Memory Usage',
      low: 200,
      q1: 350,
      median: 500,
      q3: 720,
      high: 950,
      outliers: [1200, 1350, 150, 100]
    },
    {
      name: 'Network Latency',
      low: 1,
      q1: 5,
      median: 12,
      q3: 25,
      high: 45,
      outliers: [60, 75, 80, 0.5]
    },
    {
      name: 'Disk I/O',
      low: 100,
      q1: 200,
      median: 300,
      q3: 450,
      high: 600,
      outliers: [750, 800, 50, 40]
    }
  ],
  straightLines: [
    {
      title: 'Critical Threshold',
      value: 500,
      vertical: false
    }
  ],
  showOutliers: true
}

// Simple dataset without outliers
export const simpleBoxPlotData: BoxPlotDef = {
  chartDef: {
    id: 'simple-boxplot-1',
    title: 'Simple Box Plot Example',
    xAxis: {
      label: 'Categories',
      categories: ['A', 'B', 'C', 'D']
    },
    yAxis: {
      label: 'Values'
    }
  },
  data: [
    {
      name: 'Category A',
      low: 10,
      q1: 15,
      median: 20,
      q3: 25,
      high: 30
    },
    {
      name: 'Category B',
      low: 5,
      q1: 12,
      median: 18,
      q3: 22,
      high: 28
    },
    {
      name: 'Category C',
      low: 8,
      q1: 14,
      median: 19,
      q3: 24,
      high: 32
    },
    {
      name: 'Category D',
      low: 12,
      q1: 16,
      median: 21,
      q3: 26,
      high: 35
    }
  ],
  showOutliers: false
}

// Financial data example
export const financialBoxPlotData: BoxPlotDef = {
  chartDef: {
    id: 'financial-boxplot-1',
    title: 'Stock Price Analysis',
    xAxis: {
      label: 'Stocks',
      categories: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']
    },
    yAxis: {
      label: 'Price ($)'
    }
  },
  data: [
    {
      name: 'AAPL',
      low: 145,
      q1: 152,
      median: 158,
      q3: 165,
      high: 172,
      outliers: [140, 178, 182]
    },
    {
      name: 'GOOGL',
      low: 2150,
      q1: 2200,
      median: 2280,
      q3: 2350,
      high: 2420,
      outliers: [2100, 2480, 2520]
    },
    {
      name: 'MSFT',
      low: 285,
      q1: 295,
      median: 305,
      q3: 315,
      high: 325,
      outliers: [270, 340, 345]
    },
    {
      name: 'TSLA',
      low: 680,
      q1: 720,
      median: 780,
      q3: 840,
      high: 900,
      outliers: [620, 950, 980, 1020]
    },
    {
      name: 'AMZN',
      low: 3100,
      q1: 3200,
      median: 3300,
      q3: 3400,
      high: 3500,
      outliers: [2950, 3600, 3650]
    }
  ],
  straightLines: [
    {
      title: 'Market Average',
      value: 1500,
      vertical: false
    }
  ],
  showOutliers: true,
  medianColor: '#FFD700',
  fillColor: '#1E88E5'
}

// Temperature data example
export const temperatureBoxPlotData: BoxPlotDef = {
  chartDef: {
    id: 'temperature-boxplot-1',
    title: 'Monthly Temperature Distribution',
    xAxis: {
      label: 'Months',
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yAxis: {
      label: 'Temperature (°F)'
    }
  },
  data: [
    { name: 'Jan', low: 25, q1: 32, median: 38, q3: 45, high: 52, outliers: [18, 58] },
    { name: 'Feb', low: 28, q1: 35, median: 42, q3: 48, high: 55, outliers: [20, 62] },
    { name: 'Mar', low: 35, q1: 42, median: 50, q3: 58, high: 65, outliers: [28, 72] },
    { name: 'Apr', low: 45, q1: 52, median: 60, q3: 68, high: 75, outliers: [38, 82] },
    { name: 'May', low: 55, q1: 62, median: 70, q3: 78, high: 85, outliers: [48, 92] },
    { name: 'Jun', low: 65, q1: 72, median: 80, q3: 88, high: 95, outliers: [58, 102] },
    { name: 'Jul', low: 70, q1: 77, median: 85, q3: 93, high: 100, outliers: [63, 108] },
    { name: 'Aug', low: 68, q1: 75, median: 83, q3: 91, high: 98, outliers: [60, 105] },
    { name: 'Sep', low: 60, q1: 67, median: 75, q3: 83, high: 90, outliers: [52, 97] },
    { name: 'Oct', low: 48, q1: 55, median: 63, q3: 71, high: 78, outliers: [40, 85] },
    { name: 'Nov', low: 38, q1: 45, median: 53, q3: 61, high: 68, outliers: [30, 75] },
    { name: 'Dec', low: 28, q1: 35, median: 42, q3: 49, high: 56, outliers: [20, 63] }
  ],
  straightLines: [
    {
      title: 'Freezing Point',
      value: 32,
      vertical: false
    }
  ],
  showOutliers: true
}

// All mock data exports
export const boxPlotMockData = {
  performance: performanceBoxPlotData,
  simple: simpleBoxPlotData,
  financial: financialBoxPlotData,
  temperature: temperatureBoxPlotData
}