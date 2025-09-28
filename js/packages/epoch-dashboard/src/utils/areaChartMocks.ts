import { AxisType, DashStyle, AreaDef, StackType } from '../types/proto'

// Helper function to generate time series data
const generateTimeSeriesData = (
  points: number,
  startTime: number,
  interval: number,
  baseValue: number,
  volatility: number
) => {
  const data: Array<{ x: number; y: number }> = []
  let value = baseValue

  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.5) * volatility
    value = Math.max(0, value) // Ensure non-negative for area charts
    data.push({
      x: startTime + i * interval,
      y: value
    })
  }

  return data
}

// Test Case 1: Basic Area Chart
export const createBasicAreaChart = (): AreaDef => {
  const now = Date.now()
  const monthAgo = now - 30 * 86400000

  return {
    chartDef: {
      id: 'area-test-1',
      title: 'Website Traffic Over Time',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Date'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Visitors'
      }
    },
    areas: [
      {
        name: 'Daily Visitors',
        data: generateTimeSeriesData(30, monthAgo, 86400000, 5000, 500),
        lineWidth: 2
      }
    ]
  }
}

// Test Case 2: Multiple Area Series
export const createMultipleAreaChart = (): AreaDef => {
  const now = Date.now()
  const weekAgo = now - 7 * 86400000

  return {
    chartDef: {
      id: 'area-test-2',
      title: 'Cloud Service Usage',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Time'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Usage (GB)'
      }
    },
    areas: [
      {
        name: 'Storage',
        data: generateTimeSeriesData(168, weekAgo, 3600000, 100, 10),
      },
      {
        name: 'Bandwidth',
        data: generateTimeSeriesData(168, weekAgo, 3600000, 80, 15),
      },
      {
        name: 'Compute',
        data: generateTimeSeriesData(168, weekAgo, 3600000, 60, 8),
      }
    ]
  }
}

// Test Case 3: Stacked Area Chart
export const createStackedAreaChart = (): AreaDef => {
  const now = Date.now()
  const weekAgo = now - 7 * 86400000

  return {
    chartDef: {
      id: 'area-test-3',
      title: 'Revenue by Product Category',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Date'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Revenue ($K)'
      }
    },
    areas: [
      {
        name: 'Electronics',
        data: generateTimeSeriesData(7, weekAgo, 86400000, 50, 5),
      },
      {
        name: 'Clothing',
        data: generateTimeSeriesData(7, weekAgo, 86400000, 30, 3),
      },
      {
        name: 'Home & Garden',
        data: generateTimeSeriesData(7, weekAgo, 86400000, 20, 2),
      },
      {
        name: 'Sports',
        data: generateTimeSeriesData(7, weekAgo, 86400000, 15, 1.5),
      }
    ],
    stacked: true
  }
}

// Test Case 4: Percentage Stacked Area
export const createPercentageStackedAreaChart = (): AreaDef => {
  const now = Date.now()
  const monthAgo = now - 30 * 86400000

  return {
    chartDef: {
      id: 'area-test-4',
      title: 'Market Share Over Time',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Date'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Market Share (%)'
      }
    },
    areas: [
      {
        name: 'Company A',
        data: generateTimeSeriesData(30, monthAgo, 86400000, 350, 20),
      },
      {
        name: 'Company B',
        data: generateTimeSeriesData(30, monthAgo, 86400000, 280, 15),
      },
      {
        name: 'Company C',
        data: generateTimeSeriesData(30, monthAgo, 86400000, 200, 10),
      },
      {
        name: 'Others',
        data: generateTimeSeriesData(30, monthAgo, 86400000, 170, 8),
      }
    ],
    stacked: true,
    stackType: StackType.StackTypePercent
  }
}

// Test Case 5: Area with Different Styles
export const createStyledAreaChart = (): AreaDef => {
  const now = Date.now()
  const dayAgo = now - 86400000

  return {
    chartDef: {
      id: 'area-test-5',
      title: 'Network Metrics Comparison',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Time'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Mbps'
      }
    },
    areas: [
      {
        name: 'Download Speed',
        data: generateTimeSeriesData(48, dayAgo, 1800000, 100, 10),
        lineWidth: 3,
        dashStyle: DashStyle.Solid
      },
      {
        name: 'Upload Speed',
        data: generateTimeSeriesData(48, dayAgo, 1800000, 50, 5),
        lineWidth: 2,
        dashStyle: DashStyle.Dash
      },
      {
        name: 'Ping',
        data: generateTimeSeriesData(48, dayAgo, 1800000, 20, 3),
        lineWidth: 1,
        dashStyle: DashStyle.DashDot
      }
    ]
  }
}

// Test Case 6: Area with Reference Lines
export const createAreaWithReferenceLinesChart = (): AreaDef => {
  const now = Date.now()
  const weekAgo = now - 7 * 86400000

  return {
    chartDef: {
      id: 'area-test-6',
      title: 'Server CPU Usage',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Time'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'CPU Usage (%)'
      }
    },
    areas: [
      {
        name: 'CPU Usage',
        data: generateTimeSeriesData(168, weekAgo, 3600000, 45, 15),
        lineWidth: 2
      }
    ]
  }
}

// Test Case 7: Area with Plot Bands
export const createAreaWithPlotBandsChart = (): AreaDef => {
  const now = Date.now()
  const monthAgo = now - 30 * 86400000

  return {
    chartDef: {
      id: 'area-test-7',
      title: 'Temperature Monitoring',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Date'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Temperature (°C)'
      }
    },
    areas: [
      {
        name: 'Temperature',
        data: generateTimeSeriesData(720, monthAgo, 3600000, 22, 5),
        lineWidth: 2
      }
    ]
  }
}

// Test Case 8: Category Axis Area Chart
export const createCategoryAreaChart = (): AreaDef => {
  return {
    chartDef: {
      id: 'area-test-8',
      title: 'Monthly Sales by Region',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Month',
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Sales ($M)'
      }
    },
    areas: [
      {
        name: 'North America',
        // Proto Point always has x (timestamp) and y - even for category axis
        data: [4.2, 4.5, 5.1, 4.8, 5.5, 6.2, 6.8, 7.1, 6.5, 6.9, 7.3, 8.1].map((y, i) => ({
          x: Date.UTC(2024, i, 1), // Use month timestamps
          y
        })),
      },
      {
        name: 'Europe',
        data: [3.1, 3.3, 3.8, 3.5, 4.2, 4.9, 5.5, 5.9, 5.2, 5.6, 6.0, 6.8].map((y, i) => ({
          x: Date.UTC(2024, i, 1),
          y
        })),
      },
      {
        name: 'Asia',
        data: [2.5, 2.7, 3.2, 2.9, 3.6, 4.1, 4.5, 4.8, 4.3, 4.5, 4.8, 5.2].map((y, i) => ({
          x: Date.UTC(2024, i, 1),
          y
        })),
      }
    ]
  }
}

// Test Case 9: Logarithmic Scale Area
export const createLogarithmicAreaChart = (): AreaDef => {
  const now = Date.now()
  const yearAgo = now - 365 * 86400000

  // Generate exponential growth data
  const generateExponentialData = (points: number, startTime: number, interval: number) => {
    const data: Array<{ x: number; y: number }> = []
    let value = 10

    for (let i = 0; i < points; i++) {
      value *= 1.02 * (1 + (Math.random() - 0.5) * 0.1)
      data.push({
        x: startTime + i * interval,
        y: value
      })
    }

    return data
  }

  return {
    chartDef: {
      id: 'area-test-9',
      title: 'User Growth (Logarithmic Scale)',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Date'
      },
      yAxis: {
        type: AxisType.AxisLogarithmic,
        label: 'Active Users'
      }
    },
    areas: [
      {
        name: 'Total Users',
        data: generateExponentialData(365, yearAgo, 86400000),
      },
      {
        name: 'Premium Users',
        data: generateExponentialData(365, yearAgo, 86400000),
      }
    ]
  }
}

// Test Case 10: Negative Values Area
export const createNegativeAreaChart = (): AreaDef => {
  const now = Date.now()
  const weekAgo = now - 7 * 86400000

  // Generate data with negative values
  const generateProfitLossData = (points: number, startTime: number, interval: number) => {
    const data: Array<{ x: number; y: number }> = []
    let value = 0

    for (let i = 0; i < points; i++) {
      value += (Math.random() - 0.5) * 20
      data.push({
        x: startTime + i * interval,
        y: value
      })
    }

    return data
  }

  return {
    chartDef: {
      id: 'area-test-10',
      title: 'Profit/Loss Analysis',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Date'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'P&L ($K)'
      }
    },
    areas: [
      {
        name: 'Cumulative P&L',
        data: generateProfitLossData(168, weekAgo, 3600000),
        lineWidth: 2
      }
    ]
  }
}

// Create all test charts
export const createAllAreaChartTests = (): AreaDef[] => {
  return [
    createBasicAreaChart(),
    createMultipleAreaChart(),
    createStackedAreaChart(),
    createPercentageStackedAreaChart(),
    createStyledAreaChart(),
    createAreaWithReferenceLinesChart(),
    createAreaWithPlotBandsChart(),
    createCategoryAreaChart(),
    createLogarithmicAreaChart(),
    createNegativeAreaChart()
  ]
}