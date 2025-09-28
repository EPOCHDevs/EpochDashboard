import { AxisType, DashStyle } from '../types/proto'

// Generate time series data
const generateTimeSeriesData = (
  numPoints: number,
  startTime: number,
  intervalMs: number,
  baseValue: number,
  volatility: number
): { x: number; y: number }[] => {
  const data: { x: number; y: number }[] = []
  let value = baseValue

  for (let i = 0; i < numPoints; i++) {
    value += (Math.random() - 0.5) * volatility
    data.push({
      x: startTime + i * intervalMs,
      y: value
    })
  }

  return data
}

// Generate linear data
const generateLinearData = (
  numPoints: number,
  slope: number,
  intercept: number,
  noise: number
): { x: number; y: number }[] => {
  const data: { x: number; y: number }[] = []

  for (let i = 0; i < numPoints; i++) {
    const y = slope * i + intercept + (Math.random() - 0.5) * noise
    data.push({ x: i, y })
  }

  return data
}

// Generate logarithmic data
// const generateLogData = (
//   numPoints: number
//): { x: number; y: number }[] => {
//  const data: { x: number; y: number }[] = []
//
//  for (let i = 1; i <= numPoints; i++) {
//    data.push({
//      x: i,
//      y: Math.log10(i) * 100 + (Math.random() - 0.5) * 10
//    })
//  }
//
//  return data
//}

// Test Case 1: Basic Time Series Line Chart
export const createBasicTimeSeriesChart = () => {
  const now = Date.now()
  const hourAgo = now - 3600000

  return {
    chartDef: {
      id: 'test-1',
      title: 'Portfolio Value Over Time',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Time'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Value ($)'
      }
    },
    lines: [
      {
        name: 'Portfolio A',
        data: generateTimeSeriesData(50, hourAgo, 60000, 10000, 200),
        dashStyle: DashStyle.Solid,
        lineWidth: 2
      },
      {
        name: 'Portfolio B',
        data: generateTimeSeriesData(50, hourAgo, 60000, 12000, 300),
        dashStyle: DashStyle.Dash,
        lineWidth: 2
      }
    ]
  }
}

// Test Case 2: Multiple Lines with Different Dash Styles
export const createMultiStyleChart = () => {
  const baseTime = Date.now() - 86400000 // 1 day ago

  const dashStyles = [
    { style: DashStyle.Solid, name: 'Solid Line' },
    { style: DashStyle.Dash, name: 'Dashed Line' },
    { style: DashStyle.Dot, name: 'Dotted Line' },
    { style: DashStyle.DashDot, name: 'Dash-Dot Line' },
    { style: DashStyle.LongDash, name: 'Long Dash Line' }
  ]

  return {
    chartDef: {
      id: 'test-2',
      title: 'Comparison of Trading Strategies',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Date'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Returns (%)'
      }
    },
    lines: dashStyles.map((ds, index) => ({
      name: ds.name,
      data: generateTimeSeriesData(30, baseTime, 3600000, 100 + index * 10, 5),
      dashStyle: ds.style,
      lineWidth: 2
    }))
  }
}

// Test Case 3: Linear Chart with Reference Lines
export const createLinearWithReferenceLinesChart = () => {
  return {
    chartDef: {
      id: 'test-3',
      title: 'Performance vs Benchmark',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Trading Days'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Cumulative Return (%)'
      }
    },
    lines: [
      {
        name: 'Strategy Performance',
        data: generateLinearData(100, 0.5, 0, 2),
        dashStyle: DashStyle.Solid,
        lineWidth: 3
      },
      {
        name: 'Market Benchmark',
        data: generateLinearData(100, 0.3, 0, 1),
        dashStyle: DashStyle.ShortDash,
        lineWidth: 2
      }
    ],
    straightLines: [
      {
        title: 'Target Return',
        value: 30,
        vertical: false
      },
      {
        title: 'Risk Limit',
        value: 50,
        vertical: false
      },
      {
        title: 'Quarter End',
        value: 25,
        vertical: true
      }
    ]
  }
}

// Test Case 4: Logarithmic Y-Axis Chart
export const createLogarithmicChart = () => {
  return {
    chartDef: {
      id: 'test-4',
      title: 'Exponential Growth Analysis',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Time Period'
      },
      yAxis: {
        type: AxisType.AxisLogarithmic,
        label: 'Value (log scale)'
      }
    },
    lines: [
      {
        name: 'Compound Growth',
        data: Array.from({ length: 50 }, (_, i) => ({
          x: i,
          y: Math.pow(1.1, i) * 100
        })),
        dashStyle: DashStyle.Solid,
        lineWidth: 2
      },
      {
        name: 'Linear Growth',
        data: Array.from({ length: 50 }, (_, i) => ({
          x: i,
          y: 100 + i * 10
        })),
        dashStyle: DashStyle.Dash,
        lineWidth: 2
      }
    ]
  }
}

// Test Case 5: Category X-Axis Chart
export const createCategoryChart = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return {
    chartDef: {
      id: 'test-5',
      title: 'Monthly Performance Comparison',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Month',
        categories: months
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Returns (%)'
      }
    },
    lines: [
      {
        name: '2023 Performance',
        data: months.map((_, i) => ({
          x: i,
          y: Math.random() * 20 - 10
        })),
        dashStyle: DashStyle.Solid,
        lineWidth: 2
      },
      {
        name: '2024 Performance',
        data: months.map((_, i) => ({
          x: i,
          y: Math.random() * 25 - 5
        })),
        dashStyle: DashStyle.ShortDashDot,
        lineWidth: 2
      }
    ]
  }
}

// Test Case 6: Stacked Area Chart
export const createStackedChart = () => {
  const now = Date.now()
  const dayAgo = now - 86400000

  return {
    chartDef: {
      id: 'test-6',
      title: 'Asset Allocation Over Time',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Time'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Value ($)'
      }
    },
    lines: [
      {
        name: 'Stocks',
        data: generateTimeSeriesData(24, dayAgo, 3600000, 5000, 100),
        dashStyle: DashStyle.Solid,
        lineWidth: 2
      },
      {
        name: 'Bonds',
        data: generateTimeSeriesData(24, dayAgo, 3600000, 3000, 50),
        dashStyle: DashStyle.Solid,
        lineWidth: 2
      },
      {
        name: 'Commodities',
        data: generateTimeSeriesData(24, dayAgo, 3600000, 2000, 150),
        dashStyle: DashStyle.Solid,
        lineWidth: 2
      }
    ],
    stacked: true
  }
}

// Test Case 7: Chart with Horizontal Plot Bands (Y-axis bands)
export const createChartWithHorizontalPlotBands = () => {
  const now = Date.now()
  const weekAgo = now - 7 * 86400000

  return {
    chartDef: {
      id: 'test-7',
      title: 'Market Volatility Zones',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Date'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Volatility Index'
      }
    },
    lines: [
      {
        name: 'VIX',
        data: generateTimeSeriesData(100, weekAgo, 3600000, 20, 5),
        dashStyle: DashStyle.Solid,
        lineWidth: 2
      }
    ],
    yPlotBands: [
      {
        from: 0,
        to: 15,
        label: 'Low Volatility'
      },
      {
        from: 15,
        to: 25,
        label: 'Normal'
      },
      {
        from: 25,
        to: 40,
        label: 'High Volatility'
      }
    ],
    straightLines: [
      {
        title: 'High Volatility Threshold',
        value: 30,
        vertical: false
      },
      {
        title: 'Low Volatility Threshold',
        value: 12,
        vertical: false
      }
    ]
  }
}

// Test Case 8: Chart with Vertical Plot Bands (X-axis bands)
export const createChartWithVerticalPlotBands = () => {
  const now = Date.now()
  const weekAgo = now - 7 * 86400000
  const day = 86400000

  return {
    chartDef: {
      id: 'test-8',
      title: 'Trading Periods Analysis',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Date'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Price ($)'
      }
    },
    lines: [
      {
        name: 'Stock Price',
        data: generateTimeSeriesData(168, weekAgo, 3600000, 150, 10),
        dashStyle: DashStyle.Solid,
        lineWidth: 2
      }
    ],
    xPlotBands: [
      {
        from: weekAgo + day,
        to: weekAgo + 2 * day,
        label: 'Weekend'
      },
      {
        from: weekAgo + 3 * day,
        to: weekAgo + 3.5 * day,
        label: 'Holiday'
      },
      {
        from: weekAgo + 5 * day,
        to: weekAgo + 6 * day,
        label: 'Weekend'
      }
    ]
  }
}

// Test Case 9: Chart with Overlay
export const createChartWithOverlay = () => {
  const now = Date.now()
  const monthAgo = now - 30 * 86400000

  const mainData = generateTimeSeriesData(60, monthAgo, 12 * 3600000, 1000, 50)

  return {
    chartDef: {
      id: 'test-8',
      title: 'Price with Moving Average Overlay',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Date'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Price ($)'
      }
    },
    lines: [
      {
        name: 'Stock Price',
        data: mainData,
        dashStyle: DashStyle.Solid,
        lineWidth: 2
      }
    ],
    overlay: {
      name: '20-Day Moving Average',
      data: mainData.map((point, i) => {
        if (i < 20) return { x: point.x, y: point.y }
        const sum = mainData.slice(i - 19, i + 1).reduce((acc, p) => acc + p.y, 0)
        return { x: point.x, y: sum / 20 }
      }),
      dashStyle: DashStyle.Dash,
      lineWidth: 1
    }
  }
}

// Test Case 10: High Frequency Data (Performance Test)
export const createHighFrequencyChart = () => {
  const now = Date.now()
  const hourAgo = now - 3600000

  return {
    chartDef: {
      id: 'test-9',
      title: 'High Frequency Trading Data',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Time'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Price'
      }
    },
    lines: [
      {
        name: 'Bid Price',
        data: generateTimeSeriesData(1000, hourAgo, 3600, 100, 0.5),
        dashStyle: DashStyle.Solid,
        lineWidth: 1
      },
      {
        name: 'Ask Price',
        data: generateTimeSeriesData(1000, hourAgo, 3600, 100.5, 0.5),
        dashStyle: DashStyle.Solid,
        lineWidth: 1
      }
    ]
  }
}

// Test Case 11: Mixed Line Widths
export const createVariableLineWidthChart = () => {
  const now = Date.now()
  const dayAgo = now - 86400000

  return {
    chartDef: {
      id: 'test-10',
      title: 'Signal Strength Visualization',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Time'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Signal Value'
      }
    },
    lines: [
      {
        name: 'Strong Signal',
        data: generateTimeSeriesData(48, dayAgo, 1800000, 50, 10),
        dashStyle: DashStyle.Solid,
        lineWidth: 4
      },
      {
        name: 'Medium Signal',
        data: generateTimeSeriesData(48, dayAgo, 1800000, 30, 8),
        dashStyle: DashStyle.ShortDash,
        lineWidth: 2
      },
      {
        name: 'Weak Signal',
        data: generateTimeSeriesData(48, dayAgo, 1800000, 10, 5),
        dashStyle: DashStyle.Dot,
        lineWidth: 1
      }
    ]
  }
}

// Create all test charts
export const createAllTestCharts = () => {
  return [
    createBasicTimeSeriesChart(),
    createMultiStyleChart(),
    createLinearWithReferenceLinesChart(),
    createLogarithmicChart(),
    createCategoryChart(),
    createStackedChart(),
    createChartWithHorizontalPlotBands(),
    createChartWithVerticalPlotBands(),
    createChartWithOverlay(),
    createHighFrequencyChart(),
    createVariableLineWidthChart()
  ]
}