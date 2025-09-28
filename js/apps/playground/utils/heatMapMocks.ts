import { AxisType, HeatMapDef, HeatMapPoint } from '@epochlab/epoch-dashboard'

// Helper function to generate heatmap data
const generateHeatMapData = (
  xCount: number,
  yCount: number,
  minValue: number = 0,
  maxValue: number = 100,
  pattern: 'random' | 'gradient' | 'diagonal' | 'wave' = 'random'
): HeatMapPoint[] => {
  const data: HeatMapPoint[] = []

  for (let x = 0; x < xCount; x++) {
    for (let y = 0; y < yCount; y++) {
      let value: number

      switch (pattern) {
        case 'gradient':
          value = minValue + ((x + y) / (xCount + yCount - 2)) * (maxValue - minValue)
          break
        case 'diagonal':
          value = Math.abs(x - y) / Math.max(xCount, yCount) * (maxValue - minValue) + minValue
          break
        case 'wave':
          value = (Math.sin(x / 2) * Math.cos(y / 2) + 1) / 2 * (maxValue - minValue) + minValue
          break
        case 'random':
        default:
          value = minValue + Math.random() * (maxValue - minValue)
      }

      data.push({ x, y, value })
    }
  }

  return data
}

// Test Case 1: Basic HeatMap
export const createBasicHeatMap = (): HeatMapDef => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)

  return {
    chartDef: {
      id: 'heatmap-test-1',
      title: 'Website Traffic by Hour and Day',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Day of Week',
        categories: days
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Hour of Day',
        categories: hours
      }
    },
    points: generateHeatMapData(7, 24, 0, 1000, 'wave')
  }
}

// Test Case 2: Correlation Matrix
export const createCorrelationMatrix = (): HeatMapDef => {
  const variables = [
    'Temperature', 'Humidity', 'Pressure', 'Wind Speed',
    'Precipitation', 'UV Index', 'Visibility', 'Cloud Cover'
  ]

  // Generate correlation data (-1 to 1)
  const data: HeatMapPoint[] = []
  for (let x = 0; x < variables.length; x++) {
    for (let y = 0; y < variables.length; y++) {
      if (x === y) {
        data.push({ x, y, value: 1 }) // Perfect correlation on diagonal
      } else {
        // Generate realistic correlation values
        const correlation = (Math.random() - 0.5) * 2
        data.push({ x, y, value: correlation })
      }
    }
  }

  return {
    chartDef: {
      id: 'heatmap-test-2',
      title: 'Weather Variables Correlation Matrix',
      xAxis: {
        type: AxisType.AxisCategory,
        label: '',
        categories: variables
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: '',
        categories: variables
      }
    },
    points: data
  }
}

// Test Case 3: Monthly Sales HeatMap
export const createMonthlySalesHeatMap = (): HeatMapDef => {
  const products = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return {
    chartDef: {
      id: 'heatmap-test-3',
      title: 'Monthly Sales by Product',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Month',
        categories: months
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Product',
        categories: products
      }
    },
    points: generateHeatMapData(12, 5, 10000, 50000, 'gradient')
  }
}

// Test Case 4: Server Performance Grid
export const createServerPerformanceHeatMap = (): HeatMapDef => {
  const servers = Array.from({ length: 20 }, (_, i) => `Server-${i + 1}`)
  const metrics = ['CPU %', 'Memory %', 'Disk I/O', 'Network', 'Response Time', 'Error Rate']

  return {
    chartDef: {
      id: 'heatmap-test-4',
      title: 'Server Performance Metrics',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Metric',
        categories: metrics
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Server',
        categories: servers
      }
    },
    points: generateHeatMapData(6, 20, 0, 100, 'random')
  }
}

// Test Case 5: Risk Assessment Matrix
export const createRiskMatrix = (): HeatMapDef => {
  const probability = ['Very Low', 'Low', 'Medium', 'High', 'Very High']
  const impact = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic']

  // Create risk scores
  const data: HeatMapPoint[] = []
  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
      // Risk score increases with both probability and impact
      const riskScore = (x + 1) * (y + 1) * 4 // Scale to 0-100
      data.push({ x, y, value: riskScore })
    }
  }

  return {
    chartDef: {
      id: 'heatmap-test-5',
      title: 'Risk Assessment Matrix',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Probability',
        categories: probability
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Impact',
        categories: impact
      }
    },
    points: data
  }
}

// Test Case 6: Geographic Activity Map
export const createGeographicHeatMap = (): HeatMapDef => {
  const regions = ['North America', 'Europe', 'Asia', 'Africa', 'South America', 'Oceania']
  const activities = ['Sales', 'Support Tickets', 'New Users', 'Active Sessions', 'Revenue', 'Churn']

  return {
    chartDef: {
      id: 'heatmap-test-6',
      title: 'Global Business Activity',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Activity Type',
        categories: activities
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Region',
        categories: regions
      }
    },
    points: generateHeatMapData(6, 6, 0, 100, 'gradient')
  }
}

// Test Case 7: Time-based Activity Pattern
export const createTimeActivityHeatMap = (): HeatMapDef => {
  const days = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)

  // Generate realistic activity pattern
  const data: HeatMapPoint[] = []
  for (let d = 0; d < 30; d++) {
    for (let h = 0; h < 24; h++) {
      // Higher activity during business hours (9-17)
      const businessHourBonus = (h >= 9 && h <= 17) ? 50 : 0
      // Weekend reduction
      const weekendPenalty = ((d % 7 === 0) || (d % 7 === 6)) ? -30 : 0
      const baseValue = 20 + Math.random() * 30
      const value = Math.max(0, baseValue + businessHourBonus + weekendPenalty)
      data.push({ x: d, y: h, value })
    }
  }

  return {
    chartDef: {
      id: 'heatmap-test-7',
      title: 'User Activity Pattern (30 Days)',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Day',
        categories: days
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Hour',
        categories: hours
      }
    },
    points: data
  }
}

// Test Case 8: Feature Comparison Matrix
export const createFeatureComparisonHeatMap = (): HeatMapDef => {
  const products = ['Basic', 'Professional', 'Enterprise', 'Ultimate']
  const features = [
    'Storage', 'Users', 'API Access', 'Support', 'Analytics',
    'Custom Domain', 'SSO', 'Audit Logs', 'SLA', 'Training'
  ]

  // Generate feature availability scores
  const data: HeatMapPoint[] = []
  for (let p = 0; p < products.length; p++) {
    for (let f = 0; f < features.length; f++) {
      // Higher tier products have more features
      const tierBonus = p * 25
      const baseAvailability = Math.random() * 25
      const value = Math.min(100, tierBonus + baseAvailability)
      data.push({ x: f, y: p, value })
    }
  }

  return {
    chartDef: {
      id: 'heatmap-test-8',
      title: 'Product Feature Comparison',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Feature',
        categories: features
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Product Tier',
        categories: products
      }
    },
    points: data
  }
}

// Test Case 9: Large Dataset Performance Test
export const createLargeHeatMap = (): HeatMapDef => {
  const xCategories = Array.from({ length: 50 }, (_, i) => `X${i}`)
  const yCategories = Array.from({ length: 50 }, (_, i) => `Y${i}`)

  return {
    chartDef: {
      id: 'heatmap-test-9',
      title: 'Large Dataset HeatMap (50x50)',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'X Axis',
        categories: xCategories
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Y Axis',
        categories: yCategories
      }
    },
    points: generateHeatMapData(50, 50, 0, 100, 'wave')
  }
}

// Test Case 10: Custom Color Stops
export const createCustomColorHeatMap = (): HeatMapDef => {
  const categories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

  return {
    chartDef: {
      id: 'heatmap-test-10',
      title: 'Custom Color Scale HeatMap',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Category X',
        categories
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Category Y',
        categories
      }
    },
    points: generateHeatMapData(8, 8, 0, 100, 'diagonal')
  }
}

// Create all test heatmaps
export const createAllHeatMapTests = (): HeatMapDef[] => {
  return [
    createBasicHeatMap(),
    createCorrelationMatrix(),
    createMonthlySalesHeatMap(),
    createServerPerformanceHeatMap(),
    createRiskMatrix(),
    createGeographicHeatMap(),
    createTimeActivityHeatMap(),
    createFeatureComparisonHeatMap(),
    createLargeHeatMap(),
    createCustomColorHeatMap()
  ]
}