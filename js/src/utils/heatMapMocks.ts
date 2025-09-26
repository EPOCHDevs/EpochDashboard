import { AxisType } from '../types/proto'

// Helper function to generate heatmap data
const generateHeatMapData = (
  xCount: number,
  yCount: number,
  minValue: number = 0,
  maxValue: number = 100,
  pattern: 'random' | 'gradient' | 'diagonal' | 'wave' = 'random'
) => {
  const data: Array<{ x: number; y: number; value: number }> = []

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
export const createBasicHeatMap = () => {
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
    data: generateHeatMapData(7, 24, 0, 1000, 'wave'),
    colorAxis: {
      min: 0,
      max: 1000
    },
    dataLabels: {
      enabled: true,
      format: '{point.value:.0f}'
    }
  }
}

// Test Case 2: Correlation Matrix
export const createCorrelationMatrix = () => {
  const variables = [
    'Temperature', 'Humidity', 'Pressure', 'Wind Speed',
    'Precipitation', 'UV Index', 'Visibility', 'Cloud Cover'
  ]

  // Generate correlation data (-1 to 1)
  const data: Array<{ x: number; y: number; value: number }> = []
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
    data,
    colorAxis: {
      min: -1,
      max: 1,
      minColor: '#FF5722',  // Red for negative correlation
      maxColor: '#4CAF50',  // Green for positive correlation
      stops: [
        [0, '#FF5722'],     // -1: Strong negative
        [0.5, '#FFFFFF'],   // 0: No correlation
        [1, '#4CAF50']      // 1: Strong positive
      ]
    },
    dataLabels: {
      enabled: true,
      color: '#000000',
      format: '{point.value:.2f}'
    }
  }
}

// Test Case 3: Monthly Sales HeatMap
export const createMonthlySalesHeatMap = () => {
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
    data: generateHeatMapData(12, 5, 10000, 50000, 'gradient'),
    colorAxis: {
      min: 10000,
      max: 50000,
      minColor: '#FFF3E0',
      maxColor: '#E65100'
    },
    dataLabels: {
      enabled: true,
      color: '#FFFFFF',
      format: '${point.value:,.0f}'
    }
  }
}

// Test Case 4: Server Performance Grid
export const createServerPerformanceHeatMap = () => {
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
    data: generateHeatMapData(6, 20, 0, 100, 'random'),
    colorAxis: {
      min: 0,
      max: 100,
      stops: [
        [0, '#4CAF50'],     // Green: Good
        [0.5, '#FFC107'],   // Yellow: Warning
        [1, '#F44336']      // Red: Critical
      ]
    }
  }
}

// Test Case 5: Risk Assessment Matrix
export const createRiskMatrix = () => {
  const probability = ['Very Low', 'Low', 'Medium', 'High', 'Very High']
  const impact = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic']

  // Create risk scores
  const data: Array<{ x: number; y: number; value: number }> = []
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
    data,
    colorAxis: {
      min: 0,
      max: 100,
      stops: [
        [0, '#81C784'],     // Light Green: Low Risk
        [0.25, '#FFF176'],  // Yellow: Medium-Low Risk
        [0.5, '#FFB74D'],   // Orange: Medium Risk
        [0.75, '#E57373'],  // Light Red: High Risk
        [1, '#B71C1C']      // Dark Red: Critical Risk
      ]
    },
    dataLabels: {
      enabled: true,
      color: '#FFFFFF',
      format: '{point.value:.0f}'
    },
    borderWidth: 2,
    borderColor: '#000000'
  }
}

// Test Case 6: Geographic Activity Map
export const createGeographicHeatMap = () => {
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
    data: generateHeatMapData(6, 6, 0, 100, 'gradient'),
    colorAxis: {
      min: 0,
      max: 100,
      minColor: '#ECEFF1',
      maxColor: '#263238'
    }
  }
}

// Test Case 7: Time-based Activity Pattern
export const createTimeActivityHeatMap = () => {
  const days = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`)
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`)

  // Generate realistic activity pattern
  const data: Array<{ x: number; y: number; value: number }> = []
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
    data,
    colorAxis: {
      min: 0,
      max: 100,
      minColor: '#1A237E',
      maxColor: '#FFEB3B'
    }
  }
}

// Test Case 8: Feature Comparison Matrix
export const createFeatureComparisonHeatMap = () => {
  const products = ['Basic', 'Professional', 'Enterprise', 'Ultimate']
  const features = [
    'Storage', 'Users', 'API Access', 'Support', 'Analytics',
    'Custom Domain', 'SSO', 'Audit Logs', 'SLA', 'Training'
  ]

  // Generate feature availability scores
  const data: Array<{ x: number; y: number; value: number }> = []
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
    data,
    colorAxis: {
      min: 0,
      max: 100,
      stops: [
        [0, '#FFEBEE'],     // Light Red: Not Available
        [0.25, '#FFF9C4'],  // Light Yellow: Limited
        [0.5, '#FFF176'],   // Yellow: Partial
        [0.75, '#AED581'],  // Light Green: Good
        [1, '#388E3C']      // Green: Full
      ]
    },
    dataLabels: {
      enabled: true,
      color: '#000000',
      format: '{point.value:.0f}%'
    }
  }
}

// Test Case 9: Large Dataset Performance Test
export const createLargeHeatMap = () => {
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
    data: generateHeatMapData(50, 50, 0, 100, 'wave'),
    colorAxis: {
      min: 0,
      max: 100,
      minColor: '#000428',
      maxColor: '#004e92'
    },
    borderWidth: 0  // No borders for performance
  }
}

// Test Case 10: Custom Color Stops
export const createCustomColorHeatMap = () => {
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
    data: generateHeatMapData(8, 8, 0, 100, 'diagonal'),
    colorAxis: {
      min: 0,
      max: 100,
      stops: [
        [0, '#7B1FA2'],     // Purple
        [0.2, '#1976D2'],   // Blue
        [0.4, '#00ACC1'],   // Cyan
        [0.6, '#43A047'],   // Green
        [0.8, '#FFB300'],   // Amber
        [1, '#E53935']      // Red
      ]
    },
    dataLabels: {
      enabled: true,
      color: '#FFFFFF',
      format: '{point.value:.0f}'
    },
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  }
}

// Create all test heatmaps
export const createAllHeatMapTests = () => {
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