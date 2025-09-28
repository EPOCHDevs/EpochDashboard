import { AxisType } from '@epochlab/epoch-dashboard'

// Test Case 1: Basic Vertical Bar Chart (Column)
export const createBasicVerticalBarChart = () => {
  return {
    chartDef: {
      id: 'bar-test-1',
      title: 'Monthly Revenue Comparison',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Month',
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Revenue ($M)'
      }
    },
    data: [
      {
        name: '2023',
        values: [4.2, 4.5, 5.1, 4.8, 5.5, 6.2, 6.8, 7.1, 6.5, 6.9, 7.3, 8.1]
      },
      {
        name: '2024',
        values: [5.1, 5.3, 5.8, 5.5, 6.2, 6.9, 7.5, 7.9, 7.2, 7.6, 8.0, 8.8]
      }
    ],
    vertical: true,
    barWidth: undefined,  // Let Highcharts auto-calculate
    stacked: false,
    grouped: true
  }
}

// Test Case 2: Horizontal Bar Chart
export const createHorizontalBarChart = () => {
  return {
    chartDef: {
      id: 'bar-test-2',
      title: 'Product Performance Rankings',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Product',
        categories: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E', 'Product F']
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Sales (Units)'
      }
    },
    data: [
      {
        name: 'Q1 Sales',
        values: [1250, 980, 1560, 890, 1890, 1420]
      },
      {
        name: 'Q2 Sales',
        values: [1450, 1120, 1680, 920, 2100, 1580]
      }
    ],
    vertical: false,  // Horizontal bars
    stacked: false,
    grouped: true
  }
}

// Test Case 3: Stacked Vertical Bar Chart
export const createStackedVerticalBarChart = () => {
  return {
    chartDef: {
      id: 'bar-test-3',
      title: 'Portfolio Allocation by Quarter',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Quarter',
        categories: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024']
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Allocation (%)'
      }
    },
    data: [
      {
        name: 'Stocks',
        values: [40, 42, 38, 45, 50, 48]
      },
      {
        name: 'Bonds',
        values: [30, 28, 32, 25, 20, 22]
      },
      {
        name: 'Real Estate',
        values: [15, 15, 18, 20, 18, 20]
      },
      {
        name: 'Commodities',
        values: [10, 10, 8, 7, 9, 8]
      },
      {
        name: 'Cash',
        values: [5, 5, 4, 3, 3, 2]
      }
    ],
    vertical: true,
    stacked: true,
    grouped: false
  }
}

// Test Case 4: Stacked Horizontal Bar Chart
export const createStackedHorizontalBarChart = () => {
  return {
    chartDef: {
      id: 'bar-test-4',
      title: 'Team Task Distribution',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Team Member',
        categories: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Hours'
      }
    },
    data: [
      {
        name: 'Development',
        values: [120, 150, 90, 110, 140]
      },
      {
        name: 'Testing',
        values: [40, 30, 60, 45, 35]
      },
      {
        name: 'Documentation',
        values: [20, 15, 30, 25, 20]
      },
      {
        name: 'Meetings',
        values: [15, 20, 10, 15, 18]
      }
    ],
    vertical: false,
    stacked: true,
    grouped: false
  }
}

// Test Case 5: Single Series with Reference Lines
export const createBarChartWithReferenceLines = () => {
  return {
    chartDef: {
      id: 'bar-test-5',
      title: 'Daily Trading Volume',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Day',
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Volume (M shares)'
      }
    },
    data: [
      {
        name: 'Trading Volume',
        values: [45.2, 38.5, 52.1, 48.8, 61.3]
      }
    ],
    straightLines: [
      {
        title: 'Average Volume',
        value: 49.2,
        vertical: false  // Horizontal line on Y-axis
      },
      {
        title: 'Peak Threshold',
        value: 60,
        vertical: false
      },
      {
        title: 'Mid-Week',
        value: 2,  // Wednesday (index 2)
        vertical: true  // Vertical line on X-axis
      }
    ],
    vertical: true,
    stacked: false
  }
}

// Test Case 6: Negative Values Bar Chart
export const createNegativeValuesBarChart = () => {
  return {
    chartDef: {
      id: 'bar-test-6',
      title: 'Profit/Loss by Department',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Department',
        categories: ['Sales', 'Marketing', 'R&D', 'Operations', 'HR', 'Finance']
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'P&L ($K)'
      }
    },
    data: [
      {
        name: 'Q3 2024',
        values: [850, -120, -450, 320, -80, 190]
      },
      {
        name: 'Q4 2024',
        values: [920, -90, -380, 410, -60, 230]
      }
    ],
    vertical: true,
    stacked: false,
    grouped: true
  }
}

// Test Case 7: Large Dataset Bar Chart
export const createLargeDatasetBarChart = () => {
  const categories = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`)
  const values1 = Array.from({ length: 50 }, () => Math.random() * 100 + 50)
  const values2 = Array.from({ length: 50 }, () => Math.random() * 100 + 50)

  return {
    chartDef: {
      id: 'bar-test-7',
      title: 'Large Dataset Performance Metrics',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Items',
        categories
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Score'
      }
    },
    data: [
      {
        name: 'Metric A',
        values: values1
      },
      {
        name: 'Metric B',
        values: values2
      }
    ],
    vertical: true,
    stacked: false,
    barWidth: 15  // Fixed width for many bars
  }
}

// Test Case 8: Percentage Stacked Bar Chart
export const createPercentageStackedBarChart = () => {
  return {
    chartDef: {
      id: 'bar-test-8',
      title: 'Market Share Distribution',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Year',
        categories: ['2019', '2020', '2021', '2022', '2023', '2024']
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Market Share (%)'
      }
    },
    data: [
      {
        name: 'Company A',
        values: [350, 380, 400, 420, 410, 430]
      },
      {
        name: 'Company B',
        values: [280, 270, 250, 240, 260, 250]
      },
      {
        name: 'Company C',
        values: [200, 190, 180, 170, 180, 190]
      },
      {
        name: 'Others',
        values: [170, 160, 170, 170, 150, 130]
      }
    ],
    vertical: true,
    stacked: true,
    stackType: 'percent',  // Add this to indicate percentage stacking
    grouped: false
  }
}

// Test Case 9: Horizontal Bar with Many Categories
export const createManyCategorieslHorizontalBarChart = () => {
  const countries = [
    'United States', 'China', 'Japan', 'Germany', 'India', 'United Kingdom',
    'France', 'Brazil', 'Italy', 'Canada', 'South Korea', 'Spain',
    'Mexico', 'Australia', 'Russia', 'Indonesia', 'Netherlands', 'Saudi Arabia',
    'Turkey', 'Switzerland'
  ]

  return {
    chartDef: {
      id: 'bar-test-9',
      title: 'GDP by Country (2024)',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Country',
        categories: countries
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'GDP (Trillion $)'
      }
    },
    data: [
      {
        name: 'GDP',
        values: [25.4, 17.9, 4.2, 4.3, 3.7, 3.1, 2.9, 2.1, 2.1, 2.0,
                1.8, 1.4, 1.4, 1.6, 1.8, 1.3, 1.0, 0.83, 1.1, 0.88]
      }
    ],
    vertical: false,  // Horizontal for better readability with many categories
    stacked: false
  }
}

// Test Case 10: Mixed Positive/Negative Stacked
export const createMixedStackedBarChart = () => {
  return {
    chartDef: {
      id: 'bar-test-10',
      title: 'Revenue vs Expenses',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Month',
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Amount ($K)'
      }
    },
    data: [
      {
        name: 'Product Revenue',
        values: [120, 135, 145, 155, 165, 180]
      },
      {
        name: 'Service Revenue',
        values: [80, 85, 90, 95, 100, 110]
      },
      {
        name: 'Operating Expenses',
        values: [-150, -160, -155, -165, -170, -175]
      },
      {
        name: 'Marketing Expenses',
        values: [-30, -35, -40, -45, -50, -55]
      }
    ],
    straightLines: [
      {
        title: 'Break-even',
        value: 0,
        vertical: false
      }
    ],
    vertical: true,
    stacked: true,
    grouped: false
  }
}

// Test Case 11: Stack Groups Example
export const createStackGroupsBarChart = () => {
  return {
    chartDef: {
      id: 'bar-test-11',
      title: 'Sales by Region and Product Category',
      xAxis: {
        type: AxisType.AxisCategory,
        label: 'Quarter',
        categories: ['Q1', 'Q2', 'Q3', 'Q4']
      },
      yAxis: {
        type: AxisType.AxisLinear,
        label: 'Sales ($M)'
      }
    },
    data: [
      {
        name: 'North - Electronics',
        values: [120, 135, 145, 155],
        stack: 'North'
      },
      {
        name: 'North - Clothing',
        values: [80, 85, 90, 95],
        stack: 'North'
      },
      {
        name: 'South - Electronics',
        values: [100, 110, 105, 115],
        stack: 'South'
      },
      {
        name: 'South - Clothing',
        values: [70, 75, 72, 78],
        stack: 'South'
      }
    ],
    vertical: true,
    stacked: true,
    stackLabels: true,
    grouped: false
  }
}

// Create all test charts
export const createAllBarChartTests = () => {
  return [
    createBasicVerticalBarChart(),
    createHorizontalBarChart(),
    createStackedVerticalBarChart(),
    createStackedHorizontalBarChart(),
    createBarChartWithReferenceLines(),
    createNegativeValuesBarChart(),
    createLargeDatasetBarChart(),
    createPercentageStackedBarChart(),
    createManyCategorieslHorizontalBarChart(),
    createMixedStackedBarChart(),
    createStackGroupsBarChart()
  ]
}