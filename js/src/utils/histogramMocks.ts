import { AxisType } from '../types/proto'

// Test Case 1: Basic Histogram with Normal Distribution
export const createBasicHistogram = () => {
  // Generate normal distribution data
  const generateNormalData = (count: number, mean: number, stdDev: number) => {
    const data = []
    for (let i = 0; i < count; i++) {
      // Box-Muller transform for normal distribution
      let u = 0, v = 0
      while (u === 0) u = Math.random()
      while (v === 0) v = Math.random()
      const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v)
      data.push(z * stdDev + mean)
    }
    return data
  }

  return {
    chartDef: {
      id: 'histogram-test-1',
      title: 'Student Test Scores Distribution',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Score Range'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Number of Students'
      }
    },
    data: [
      {
        name: 'Test Scores',
        values: generateNormalData(500, 75, 12)
      }
    ],
    binsCount: 15,
    showStatistics: true,
    color: '#1E88E5'
  }
}

// Test Case 2: Histogram with Custom Bins
export const createCustomBinHistogram = () => {
  // Generate bimodal distribution
  const data1 = Array.from({ length: 200 }, () => Math.random() * 20 + 10) // 10-30
  const data2 = Array.from({ length: 300 }, () => Math.random() * 20 + 60) // 60-80
  const combinedData = [...data1, ...data2]

  return {
    chartDef: {
      id: 'histogram-test-2',
      title: 'Age Distribution (Bimodal)',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Age Groups'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Count'
      }
    },
    data: [
      {
        name: 'Age Data',
        values: combinedData
      }
    ],
    binsCount: 20,
    showStatistics: true,
    color: '#4CAF50'
  }
}

// Test Case 3: Histogram with Reference Lines
export const createHistogramWithReferenceLines = () => {
  // Generate skewed data
  const generateSkewedData = (count: number) => {
    return Array.from({ length: count }, () => {
      const base = Math.random()
      return Math.pow(base, 2) * 100 // Right-skewed
    })
  }

  const data = generateSkewedData(1000)
  // const mean = data.reduce((a, b) => a + b, 0) / data.length
  // const median = [...data].sort((a, b) => a - b)[Math.floor(data.length / 2)]

  return {
    chartDef: {
      id: 'histogram-test-3',
      title: 'Response Time Distribution',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Response Time (ms)'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Frequency'
      }
    },
    data: [
      {
        name: 'Response Times',
        values: data
      }
    ],
    binsCount: 16,
    straightLines: [
      {
        title: 'SLA Threshold',
        value: 50,
        vertical: true
      },
      {
        title: 'Critical Threshold',
        value: 90,
        vertical: true
      }
    ],
    showStatistics: true,
    color: '#FF5722'
  }
}

// Test Case 4: Sales Performance Histogram
export const createSalesHistogram = () => {
  // Generate realistic sales data
  const generateSalesData = () => {
    const data = []
    // Add some low performers
    for (let i = 0; i < 50; i++) {
      data.push(Math.random() * 50000 + 10000) // 10k-60k
    }
    // Add average performers
    for (let i = 0; i < 150; i++) {
      data.push(Math.random() * 80000 + 60000) // 60k-140k
    }
    // Add high performers
    for (let i = 0; i < 30; i++) {
      data.push(Math.random() * 60000 + 140000) // 140k-200k
    }
    // Add top performers
    for (let i = 0; i < 10; i++) {
      data.push(Math.random() * 100000 + 200000) // 200k-300k
    }
    return data
  }

  return {
    chartDef: {
      id: 'histogram-test-4',
      title: 'Annual Sales Performance Distribution',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Annual Sales ($)'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Number of Sales Reps'
      }
    },
    data: [
      {
        name: 'Sales Performance',
        values: generateSalesData()
      }
    ],
    binsCount: 12,
    straightLines: [
      {
        title: 'Target: $100K',
        value: 100000,
        vertical: true
      },
      {
        title: 'Bonus Threshold: $150K',
        value: 150000,
        vertical: true
      }
    ],
    showStatistics: true,
    color: '#9C27B0'
  }
}

// Test Case 5: Website Load Time Histogram
export const createLoadTimeHistogram = () => {
  // Generate realistic load time data with some outliers
  const generateLoadTimes = () => {
    const data = []
    // Most pages load quickly
    for (let i = 0; i < 800; i++) {
      data.push(Math.random() * 2 + 0.5) // 0.5-2.5 seconds
    }
    // Some pages load slower
    for (let i = 0; i < 150; i++) {
      data.push(Math.random() * 3 + 2.5) // 2.5-5.5 seconds
    }
    // Few pages are very slow
    for (let i = 0; i < 40; i++) {
      data.push(Math.random() * 5 + 5.5) // 5.5-10.5 seconds
    }
    // Rare extremely slow pages
    for (let i = 0; i < 10; i++) {
      data.push(Math.random() * 10 + 10.5) // 10.5-20.5 seconds
    }
    return data
  }

  return {
    chartDef: {
      id: 'histogram-test-5',
      title: 'Website Page Load Time Distribution',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Load Time (seconds)'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Number of Page Loads'
      }
    },
    data: [
      {
        name: 'Page Load Times',
        values: generateLoadTimes()
      }
    ],
    binsCount: 25,
    straightLines: [
      {
        title: 'Good: 3s',
        value: 3,
        vertical: true
      },
      {
        title: 'Needs Improvement: 5s',
        value: 5,
        vertical: true
      },
      {
        title: 'Poor: 10s',
        value: 10,
        vertical: true
      }
    ],
    showStatistics: true,
    color: '#FF9800'
  }
}

// Test Case 6: Financial Returns Histogram
export const createReturnsHistogram = () => {
  // Generate realistic investment return data
  const generateReturns = () => {
    const data = []
    for (let i = 0; i < 1000; i++) {
      // Normal distribution with some fat tails
      let u = 0, v = 0
      while (u === 0) u = Math.random()
      while (v === 0) v = Math.random()
      let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v)

      // Add some fat tail events
      if (Math.random() < 0.05) {
        z = z * 3 // 5% chance of extreme events
      }

      data.push(z * 0.15 + 0.08) // 8% mean return, 15% volatility
    }
    return data
  }

  return {
    chartDef: {
      id: 'histogram-test-6',
      title: 'Monthly Investment Returns Distribution',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Monthly Return (%)'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Frequency'
      }
    },
    data: [
      {
        name: 'Monthly Returns',
        values: generateReturns().map(x => x * 100) // Convert to percentage
      }
    ],
    binsCount: 20,
    straightLines: [
      {
        title: 'Risk-free Rate: 2%',
        value: 2,
        vertical: true
      },
      {
        title: 'Target Return: 8%',
        value: 8,
        vertical: true
      }
    ],
    showStatistics: true,
    color: '#607D8B'
  }
}

// Test Case 7: Temperature Distribution
export const createTemperatureHistogram = () => {
  // Generate temperature data for different seasons
  const generateTemperatureData = () => {
    const data = []
    // Winter temperatures
    for (let i = 0; i < 90; i++) {
      data.push(Math.random() * 40 + 20) // 20-60°F
    }
    // Spring temperatures
    for (let i = 0; i < 90; i++) {
      data.push(Math.random() * 30 + 50) // 50-80°F
    }
    // Summer temperatures
    for (let i = 0; i < 90; i++) {
      data.push(Math.random() * 25 + 70) // 70-95°F
    }
    // Fall temperatures
    for (let i = 0; i < 95; i++) {
      data.push(Math.random() * 35 + 45) // 45-80°F
    }
    return data
  }

  return {
    chartDef: {
      id: 'histogram-test-7',
      title: 'Annual Temperature Distribution',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Temperature (°F)'
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Days'
      }
    },
    data: [
      {
        name: 'Daily Temperatures',
        values: generateTemperatureData()
      }
    ],
    binsCount: 18,
    straightLines: [
      {
        title: 'Freezing: 32°F',
        value: 32,
        vertical: true
      },
      {
        title: 'Comfortable: 72°F',
        value: 72,
        vertical: true
      }
    ],
    showStatistics: true,
    color: '#2196F3'
  }
}

// Create all histogram test cases
export const createAllHistogramTests = () => {
  return [
    createBasicHistogram(),
    createCustomBinHistogram(),
    createHistogramWithReferenceLines(),
    createSalesHistogram(),
    createLoadTimeHistogram(),
    createReturnsHistogram(),
    createTemperatureHistogram()
  ]
}