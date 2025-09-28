import { AxisType, BoxPlotDef, BoxPlotDataPoint, BoxPlotOutlier } from '../types/proto'

// Helper to create BoxPlotDataPoint
const createDataPoint = (low: number, q1: number, median: number, q3: number, high: number): BoxPlotDataPoint => ({
  low,
  q1,
  median,
  q3,
  high
})

// Helper to create BoxPlotOutlier
const createOutlier = (categoryIndex: number, value: number): BoxPlotOutlier => ({
  categoryIndex,
  value
})

// Sample dataset with performance metrics
export const performanceBoxPlotData: BoxPlotDef = {
  chartDef: {
    id: 'performance-boxplot-1',
    title: 'Performance Metrics Distribution',
    xAxis: {
      type: AxisType.AxisCategory,
      label: 'Metrics',
      categories: ['Response Time', 'CPU Usage', 'Memory Usage', 'Network Latency', 'Disk I/O']
    },
    yAxis: {
      type: AxisType.AxisLinear,
      label: 'Values'
    }
  },
  data: {
    points: [
      createDataPoint(50, 120, 180, 250, 320), // Response Time
      createDataPoint(10, 25, 45, 65, 85), // CPU Usage
      createDataPoint(200, 350, 500, 720, 950), // Memory Usage
      createDataPoint(1, 5, 12, 25, 45), // Network Latency
      createDataPoint(100, 200, 300, 450, 600) // Disk I/O
    ],
    outliers: [
      // Response Time outliers (category 0)
      createOutlier(0, 400),
      createOutlier(0, 450),
      createOutlier(0, 35),
      createOutlier(0, 25),
      // CPU Usage outliers (category 1)
      createOutlier(1, 95),
      createOutlier(1, 98),
      createOutlier(1, 5),
      // Memory Usage outliers (category 2)
      createOutlier(2, 1200),
      createOutlier(2, 1350),
      createOutlier(2, 150),
      createOutlier(2, 100),
      // Network Latency outliers (category 3)
      createOutlier(3, 60),
      createOutlier(3, 75),
      createOutlier(3, 80),
      createOutlier(3, 0.5),
      // Disk I/O outliers (category 4)
      createOutlier(4, 750),
      createOutlier(4, 800),
      createOutlier(4, 50),
      createOutlier(4, 40)
    ]
  }
}

// Simple dataset without outliers
export const simpleBoxPlotData: BoxPlotDef = {
  chartDef: {
    id: 'simple-boxplot-1',
    title: 'Simple Box Plot Example',
    xAxis: {
      type: AxisType.AxisCategory,
      label: 'Categories',
      categories: ['A', 'B', 'C', 'D']
    },
    yAxis: {
      type: AxisType.AxisLinear,
      label: 'Values'
    }
  },
  data: {
    points: [
      createDataPoint(10, 15, 20, 25, 30), // Category A
      createDataPoint(5, 12, 18, 22, 28), // Category B
      createDataPoint(8, 14, 19, 24, 32), // Category C
      createDataPoint(12, 16, 21, 26, 35) // Category D
    ]
  }
}

// Financial data example
export const financialBoxPlotData: BoxPlotDef = {
  chartDef: {
    id: 'financial-boxplot-1',
    title: 'Stock Price Analysis',
    xAxis: {
      type: AxisType.AxisCategory,
      label: 'Stocks',
      categories: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']
    },
    yAxis: {
      type: AxisType.AxisLinear,
      label: 'Price ($)'
    }
  },
  data: {
    points: [
      createDataPoint(145, 152, 158, 165, 172), // AAPL
      createDataPoint(2150, 2200, 2280, 2350, 2420), // GOOGL
      createDataPoint(285, 295, 305, 315, 325), // MSFT
      createDataPoint(620, 650, 680, 720, 760), // TSLA
      createDataPoint(3050, 3100, 3150, 3200, 3280) // AMZN
    ],
    outliers: [
      // AAPL outliers (category 0)
      createOutlier(0, 140),
      createOutlier(0, 178),
      createOutlier(0, 182),
      // GOOGL outliers (category 1)
      createOutlier(1, 2100),
      createOutlier(1, 2480),
      createOutlier(1, 2520),
      // MSFT outliers (category 2)
      createOutlier(2, 270),
      createOutlier(2, 340),
      createOutlier(2, 345),
      // TSLA outliers (category 3)
      createOutlier(3, 580),
      createOutlier(3, 820),
      createOutlier(3, 850),
      // AMZN outliers (category 4)
      createOutlier(4, 2950),
      createOutlier(4, 3350),
      createOutlier(4, 3400)
    ]
  }
}

// Temperature data over months
export const temperatureBoxPlotData: BoxPlotDef = {
  chartDef: {
    id: 'temperature-boxplot-1',
    title: 'Monthly Temperature Distribution (°C)',
    xAxis: {
      type: AxisType.AxisCategory,
      label: 'Month',
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yAxis: {
      type: AxisType.AxisLinear,
      label: 'Temperature (°C)'
    }
  },
  data: {
    points: [
      createDataPoint(-5, 0, 3, 7, 12), // Jan
      createDataPoint(-3, 2, 5, 9, 14), // Feb
      createDataPoint(2, 6, 10, 14, 18), // Mar
      createDataPoint(5, 10, 15, 19, 24), // Apr
      createDataPoint(10, 15, 20, 24, 28), // May
      createDataPoint(15, 20, 25, 29, 33), // Jun
      createDataPoint(18, 23, 28, 32, 36), // Jul
      createDataPoint(17, 22, 27, 31, 35), // Aug
      createDataPoint(12, 17, 22, 26, 30), // Sep
      createDataPoint(7, 12, 17, 21, 25), // Oct
      createDataPoint(2, 7, 11, 15, 19), // Nov
      createDataPoint(-3, 2, 5, 9, 13) // Dec
    ],
    outliers: [
      // Extreme cold in Jan
      createOutlier(0, -10),
      createOutlier(0, -8),
      // Heat wave in Jul
      createOutlier(6, 40),
      createOutlier(6, 42),
      // Heat wave in Aug
      createOutlier(7, 39),
      createOutlier(7, 41)
    ]
  }
}

// Test score distribution by subject
export const testScoreBoxPlotData: BoxPlotDef = {
  chartDef: {
    id: 'test-score-boxplot-1',
    title: 'Student Test Score Distribution by Subject',
    xAxis: {
      type: AxisType.AxisCategory,
      label: 'Subject',
      categories: ['Math', 'Science', 'English', 'History', 'Art', 'Music']
    },
    yAxis: {
      type: AxisType.AxisLinear,
      label: 'Score (%)'
    }
  },
  data: {
    points: [
      createDataPoint(45, 60, 72, 85, 95), // Math
      createDataPoint(50, 65, 75, 88, 96), // Science
      createDataPoint(55, 68, 78, 87, 94), // English
      createDataPoint(48, 62, 73, 82, 92), // History
      createDataPoint(60, 70, 80, 90, 98), // Art
      createDataPoint(58, 69, 79, 89, 97) // Music
    ],
    outliers: [
      // Math outliers (category 0)
      createOutlier(0, 30),
      createOutlier(0, 35),
      createOutlier(0, 100),
      // Science outliers (category 1)
      createOutlier(1, 40),
      createOutlier(1, 100),
      // English outliers (category 2)
      createOutlier(2, 42),
      createOutlier(2, 100),
      // History outliers (category 3)
      createOutlier(3, 38),
      createOutlier(3, 40),
      // Art outliers (category 4)
      createOutlier(4, 50),
      createOutlier(4, 100),
      // Music outliers (category 5)
      createOutlier(5, 48),
      createOutlier(5, 100)
    ]
  }
}

// Create all boxplot test cases
export const createAllBoxPlotTests = (): BoxPlotDef[] => {
  return [
    performanceBoxPlotData,
    simpleBoxPlotData,
    financialBoxPlotData,
    temperatureBoxPlotData,
    testScoreBoxPlotData
  ]
}