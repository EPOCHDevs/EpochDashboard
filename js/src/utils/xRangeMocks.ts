import { AxisType } from '../types/proto'

// Test Case 1: Project Timeline XRange Chart
export const createProjectTimelineXRange = () => {
  return {
    chartDef: {
      id: 'xrange-test-1',
      title: 'Software Development Project Timeline',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Timeline'
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Tasks',
        categories: ['Planning', 'Backend Dev', 'Frontend Dev', 'Testing', 'Deployment', 'Documentation']
      }
    },
    data: [
      {
        name: 'Project Tasks',
        data: [
          {
            x: Date.UTC(2024, 0, 1),  // Start: Jan 1, 2024
            x2: Date.UTC(2024, 0, 15), // End: Jan 15, 2024
            y: 0, // Planning
            name: 'Project Planning',
            color: '#00D9FF'
          },
          {
            x: Date.UTC(2024, 0, 10),
            x2: Date.UTC(2024, 1, 28),
            y: 1, // Backend Dev
            name: 'Backend Development',
            color: '#FF6B6B'
          },
          {
            x: Date.UTC(2024, 1, 1),
            x2: Date.UTC(2024, 2, 15),
            y: 2, // Frontend Dev
            name: 'Frontend Development',
            color: '#4ECDC4'
          },
          {
            x: Date.UTC(2024, 2, 1),
            x2: Date.UTC(2024, 2, 30),
            y: 3, // Testing
            name: 'Quality Assurance',
            color: '#FFD93D'
          },
          {
            x: Date.UTC(2024, 2, 25),
            x2: Date.UTC(2024, 3, 5),
            y: 4, // Deployment
            name: 'Production Deployment',
            color: '#A8E6CF'
          },
          {
            x: Date.UTC(2024, 0, 20),
            x2: Date.UTC(2024, 3, 10),
            y: 5, // Documentation
            name: 'Documentation',
            color: '#C7B3FF'
          }
        ]
      }
    ]
  }
}

// Test Case 2: Resource Allocation XRange Chart
export const createResourceAllocationXRange = () => {
  return {
    chartDef: {
      id: 'xrange-test-2',
      title: 'Team Resource Allocation',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Hours (0-40 per week)'
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Team Members',
        categories: ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']
      }
    },
    data: [
      {
        name: 'Project Alpha',
        data: [
          { x: 0, x2: 20, y: 0, name: 'Alice - Alpha', color: '#00D9FF' },
          { x: 0, x2: 30, y: 1, name: 'Bob - Alpha', color: '#00D9FF' },
          { x: 0, x2: 15, y: 2, name: 'Charlie - Alpha', color: '#00D9FF' }
        ]
      },
      {
        name: 'Project Beta',
        data: [
          { x: 20, x2: 40, y: 0, name: 'Alice - Beta', color: '#FF6B6B' },
          { x: 30, x2: 40, y: 1, name: 'Bob - Beta', color: '#FF6B6B' },
          { x: 15, x2: 35, y: 2, name: 'Charlie - Beta', color: '#FF6B6B' },
          { x: 0, x2: 25, y: 3, name: 'Diana - Beta', color: '#FF6B6B' }
        ]
      },
      {
        name: 'Project Gamma',
        data: [
          { x: 35, x2: 40, y: 2, name: 'Charlie - Gamma', color: '#4ECDC4' },
          { x: 25, x2: 40, y: 3, name: 'Diana - Gamma', color: '#4ECDC4' },
          { x: 0, x2: 40, y: 4, name: 'Eve - Gamma', color: '#4ECDC4' }
        ]
      }
    ]
  }
}

// Test Case 3: Temperature Range XRange Chart
export const createTemperatureRangeXRange = () => {
  // const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  return {
    chartDef: {
      id: 'xrange-test-3',
      title: 'Monthly Temperature Ranges by City',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Temperature (°F)'
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'City',
        categories: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Seattle']
      }
    },
    data: [
      {
        name: 'January Range',
        data: [
          { x: 26, x2: 38, y: 0, name: 'New York Jan', color: '#87CEEB' },
          { x: 48, x2: 68, y: 1, name: 'Los Angeles Jan', color: '#87CEEB' },
          { x: 22, x2: 32, y: 2, name: 'Chicago Jan', color: '#87CEEB' },
          { x: 60, x2: 76, y: 3, name: 'Miami Jan', color: '#87CEEB' },
          { x: 37, x2: 47, y: 4, name: 'Seattle Jan', color: '#87CEEB' }
        ]
      },
      {
        name: 'July Range',
        data: [
          { x: 69, x2: 85, y: 0, name: 'New York Jul', color: '#FF6B6B' },
          { x: 65, x2: 84, y: 1, name: 'Los Angeles Jul', color: '#FF6B6B' },
          { x: 65, x2: 83, y: 2, name: 'Chicago Jul', color: '#FF6B6B' },
          { x: 76, x2: 91, y: 3, name: 'Miami Jul', color: '#FF6B6B' },
          { x: 57, x2: 78, y: 4, name: 'Seattle Jul', color: '#FF6B6B' }
        ]
      }
    ],
    straightLines: [
      {
        title: 'Freezing Point',
        value: 32,
        vertical: true
      }
    ]
  }
}

// Test Case 4: Stock Price Range XRange Chart
export const createStockPriceRangeXRange = () => {
  return {
    chartDef: {
      id: 'xrange-test-4',
      title: 'Daily Stock Price Ranges',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Price ($)'
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Date',
        categories: ['Mon 12/2', 'Tue 12/3', 'Wed 12/4', 'Thu 12/5', 'Fri 12/6']
      }
    },
    data: [
      {
        name: 'AAPL Daily Range',
        data: [
          { x: 189.50, x2: 195.20, y: 0, name: 'Mon: $189.50 - $195.20', color: '#00D9FF' },
          { x: 192.80, x2: 198.45, y: 1, name: 'Tue: $192.80 - $198.45', color: '#4ECDC4' },
          { x: 196.10, x2: 201.75, y: 2, name: 'Wed: $196.10 - $201.75', color: '#A8E6CF' },
          { x: 199.20, x2: 203.90, y: 3, name: 'Thu: $199.20 - $203.90', color: '#FFD93D' },
          { x: 201.50, x2: 206.80, y: 4, name: 'Fri: $201.50 - $206.80', color: '#FF8CC6' }
        ]
      }
    ],
    straightLines: [
      {
        title: 'Week Average',
        value: 198.50,
        vertical: true
      }
    ]
  }
}

// Test Case 5: Machine Utilization XRange Chart
export const createMachineUtilizationXRange = () => {
  return {
    chartDef: {
      id: 'xrange-test-5',
      title: 'Factory Machine Utilization (24-Hour Period)',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Time (24-hour format)'
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Machine',
        categories: ['Assembly Line 1', 'Assembly Line 2', 'Quality Control', 'Packaging', 'Maintenance']
      }
    },
    data: [
      {
        name: 'Production',
        data: [
          { x: 6, x2: 18, y: 0, name: 'Assembly Line 1 Production', color: '#00D9FF' },
          { x: 8, x2: 20, y: 1, name: 'Assembly Line 2 Production', color: '#00D9FF' },
          { x: 9, x2: 17, y: 2, name: 'Quality Control Active', color: '#4ECDC4' },
          { x: 10, x2: 22, y: 3, name: 'Packaging Operations', color: '#FFD93D' }
        ]
      },
      {
        name: 'Maintenance',
        data: [
          { x: 2, x2: 6, y: 0, name: 'Assembly Line 1 Maintenance', color: '#FF6B6B' },
          { x: 0, x2: 3, y: 1, name: 'Assembly Line 2 Maintenance', color: '#FF6B6B' },
          { x: 22, x2: 24, y: 2, name: 'Quality Control Maintenance', color: '#FF6B6B' },
          { x: 3, x2: 7, y: 4, name: 'General Maintenance', color: '#A8E6CF' }
        ]
      }
    ],
    xPlotBands: [
      {
        from: 18,
        to: 24,
        label: 'Night Shift'
      }
    ]
  }
}

// Test Case 6: Event Schedule XRange Chart
export const createEventScheduleXRange = () => {
  return {
    chartDef: {
      id: 'xrange-test-6',
      title: 'Conference Schedule - Day 1',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Time (24-hour)'
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Venue',
        categories: ['Main Hall', 'Room A', 'Room B', 'Workshop Space', 'Networking Area']
      }
    },
    data: [
      {
        name: 'Keynotes',
        data: [
          { x: 9, x2: 10, y: 0, name: 'Opening Keynote', color: '#00D9FF' },
          { x: 16, x2: 17, y: 0, name: 'Closing Keynote', color: '#00D9FF' }
        ]
      },
      {
        name: 'Technical Sessions',
        data: [
          { x: 10.5, x2: 12, y: 1, name: 'AI in Practice', color: '#FF6B6B' },
          { x: 10.5, x2: 12, y: 2, name: 'Web Development', color: '#FF6B6B' },
          { x: 13, x2: 14.5, y: 1, name: 'Machine Learning', color: '#FF6B6B' },
          { x: 13, x2: 14.5, y: 2, name: 'Cloud Architecture', color: '#FF6B6B' }
        ]
      },
      {
        name: 'Workshops',
        data: [
          { x: 10, x2: 15, y: 3, name: 'Hands-on Docker', color: '#4ECDC4' },
          { x: 14, x2: 16, y: 3, name: 'React Deep Dive', color: '#4ECDC4' }
        ]
      },
      {
        name: 'Networking',
        data: [
          { x: 12, x2: 13, y: 4, name: 'Lunch & Networking', color: '#A8E6CF' },
          { x: 15, x2: 16, y: 4, name: 'Coffee Break', color: '#A8E6CF' }
        ]
      }
    ]
  }
}

// Test Case 7: Age Range Demographics XRange Chart
export const createAgeRangeDemographicsXRange = () => {
  return {
    chartDef: {
      id: 'xrange-test-7',
      title: 'Customer Age Range by Product Category',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Age'
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Product Category',
        categories: ['Electronics', 'Clothing', 'Books', 'Sports Equipment', 'Home & Garden']
      }
    },
    data: [
      {
        name: 'Primary Market',
        data: [
          { x: 18, x2: 35, y: 0, name: 'Electronics Primary', color: '#00D9FF' },
          { x: 16, x2: 30, y: 1, name: 'Clothing Primary', color: '#FF6B6B' },
          { x: 25, x2: 55, y: 2, name: 'Books Primary', color: '#4ECDC4' },
          { x: 15, x2: 40, y: 3, name: 'Sports Primary', color: '#FFD93D' },
          { x: 30, x2: 65, y: 4, name: 'Home & Garden Primary', color: '#A8E6CF' }
        ]
      },
      {
        name: 'Secondary Market',
        data: [
          { x: 35, x2: 55, y: 0, name: 'Electronics Secondary', color: '#87CEEB' },
          { x: 30, x2: 50, y: 1, name: 'Clothing Secondary', color: '#FFB6C1' },
          { x: 55, x2: 75, y: 2, name: 'Books Secondary', color: '#98FB98' },
          { x: 40, x2: 60, y: 3, name: 'Sports Secondary', color: '#F0E68C' }
        ]
      }
    ]
  }
}

// Test Case 8: Multi-level XRange Chart
export const createMultiLevelXRange = () => {
  return {
    chartDef: {
      id: 'xrange-test-8',
      title: 'Software Release Phases',
      xAxis: {
        type: AxisType.AxisLinear,
        label: 'Weeks from Start'
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Phase',
        categories: ['Planning', 'Development', 'Alpha Testing', 'Beta Testing', 'Release Prep', 'Launch']
      }
    },
    data: [
      {
        name: 'Phase Duration',
        data: [
          { x: 0, x2: 2, y: 0, name: 'Planning Phase', color: '#C7B3FF' },
          { x: 1, x2: 8, y: 1, name: 'Development Phase', color: '#00D9FF' },
          { x: 6, x2: 10, y: 2, name: 'Alpha Testing', color: '#FFD93D' },
          { x: 9, x2: 14, y: 3, name: 'Beta Testing', color: '#FF8CC6' },
          { x: 12, x2: 15, y: 4, name: 'Release Preparation', color: '#4ECDC4' },
          { x: 15, x2: 16, y: 5, name: 'Launch', color: '#FF6B6B' }
        ]
      }
    ],
    straightLines: [
      {
        title: 'Milestone Review',
        value: 8,
        vertical: true
      },
      {
        title: 'Go/No-Go Decision',
        value: 14,
        vertical: true
      }
    ]
  }
}

// Create all test charts
export const createAllXRangeTests = () => {
  return [
    createProjectTimelineXRange(),
    createResourceAllocationXRange(),
    createTemperatureRangeXRange(),
    createStockPriceRangeXRange(),
    createMachineUtilizationXRange(),
    createEventScheduleXRange(),
    createAgeRangeDemographicsXRange(),
    createMultiLevelXRange()
  ]
}