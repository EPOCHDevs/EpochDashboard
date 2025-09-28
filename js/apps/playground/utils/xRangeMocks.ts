import { AxisType, XRangeDef, XRangePoint } from '@epochlab/epoch-dashboard'

// Helper to create XRangePoint
// Proto: XRangePoint { x: int64, x2: int64, y: uint64, is_long: bool }
const createXRangePoint = (x: number, x2: number, y: number, isLong: boolean = false): XRangePoint => ({
  x,
  x2,
  y,
  isLong
})

// Test Case 1: Project Timeline XRange Chart
export const createProjectTimelineXRange = (): XRangeDef => {
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
    points: [
      createXRangePoint(Date.UTC(2024, 0, 1), Date.UTC(2024, 0, 15), 0), // Planning
      createXRangePoint(Date.UTC(2024, 0, 10), Date.UTC(2024, 1, 28), 1, true), // Backend Dev (long)
      createXRangePoint(Date.UTC(2024, 1, 1), Date.UTC(2024, 2, 15), 2, true), // Frontend Dev (long)
      createXRangePoint(Date.UTC(2024, 2, 1), Date.UTC(2024, 2, 30), 3), // Testing
      createXRangePoint(Date.UTC(2024, 2, 25), Date.UTC(2024, 3, 5), 4), // Deployment
      createXRangePoint(Date.UTC(2024, 0, 20), Date.UTC(2024, 3, 10), 5, true) // Documentation (long)
    ]
  }
}

// Test Case 2: Resource Allocation XRange Chart
export const createResourceAllocationXRange = (): XRangeDef => {
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
    points: [
      // Project Alpha allocations
      createXRangePoint(0, 20, 0), // Alice - Alpha
      createXRangePoint(0, 30, 1, true), // Bob - Alpha (long)
      createXRangePoint(0, 15, 2), // Charlie - Alpha
      // Project Beta allocations
      createXRangePoint(20, 40, 0), // Alice - Beta
      createXRangePoint(30, 40, 1), // Bob - Beta
      createXRangePoint(15, 35, 2), // Charlie - Beta
      createXRangePoint(0, 25, 3, true), // Diana - Beta (long)
      // Project Gamma allocations
      createXRangePoint(35, 40, 2), // Charlie - Gamma
      createXRangePoint(25, 40, 3), // Diana - Gamma
      createXRangePoint(0, 40, 4, true) // Eve - Gamma (full allocation - long)
    ]
  }
}

// Test Case 3: Temperature Range XRange Chart
export const createTemperatureRangeXRange = (): XRangeDef => {
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
    points: [
      // January temperatures
      createXRangePoint(26, 38, 0), // New York Jan
      createXRangePoint(48, 68, 1), // Los Angeles Jan
      createXRangePoint(22, 32, 2), // Chicago Jan
      createXRangePoint(60, 76, 3), // Miami Jan
      createXRangePoint(37, 47, 4), // Seattle Jan
      // July temperatures (offset y by 0.3 for visual separation)
      createXRangePoint(69, 85, 0), // New York Jul
      createXRangePoint(65, 84, 1), // Los Angeles Jul
      createXRangePoint(71, 83, 2), // Chicago Jul
      createXRangePoint(82, 89, 3), // Miami Jul
      createXRangePoint(58, 77, 4) // Seattle Jul
    ]
  }
}

// Test Case 4: Machine Availability XRange Chart
export const createMachineAvailabilityXRange = (): XRangeDef => {
  const now = Date.now()
  const dayMs = 86400000

  return {
    chartDef: {
      id: 'xrange-test-4',
      title: 'Production Line Machine Availability',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Time Period'
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Machine',
        categories: ['Machine A', 'Machine B', 'Machine C', 'Machine D', 'Machine E']
      }
    },
    points: [
      // Machine A - mostly available with short maintenance
      createXRangePoint(now, now + 6 * dayMs, 0, true),
      createXRangePoint(now + 6.5 * dayMs, now + 14 * dayMs, 0, true),
      // Machine B - regular maintenance schedule
      createXRangePoint(now, now + 3 * dayMs, 1),
      createXRangePoint(now + 3.5 * dayMs, now + 7 * dayMs, 1),
      createXRangePoint(now + 7.5 * dayMs, now + 11 * dayMs, 1),
      createXRangePoint(now + 11.5 * dayMs, now + 14 * dayMs, 1),
      // Machine C - long maintenance period
      createXRangePoint(now, now + 5 * dayMs, 2, true),
      createXRangePoint(now + 9 * dayMs, now + 14 * dayMs, 2),
      // Machine D - sporadic availability
      createXRangePoint(now + 1 * dayMs, now + 2 * dayMs, 3),
      createXRangePoint(now + 4 * dayMs, now + 5 * dayMs, 3),
      createXRangePoint(now + 8 * dayMs, now + 10 * dayMs, 3),
      createXRangePoint(now + 12 * dayMs, now + 13 * dayMs, 3),
      // Machine E - full availability
      createXRangePoint(now, now + 14 * dayMs, 4, true)
    ]
  }
}

// Test Case 5: Meeting Room Schedule XRange Chart
export const createMeetingRoomSchedule = (): XRangeDef => {
  const baseTime = Date.UTC(2024, 0, 15, 8, 0) // Jan 15, 2024, 8:00 AM
  const hour = 3600000 // milliseconds

  return {
    chartDef: {
      id: 'xrange-test-5',
      title: 'Meeting Room Schedule',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Time'
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Room',
        categories: ['Conference A', 'Conference B', 'Board Room', 'Training Room', 'Small Room 1']
      }
    },
    points: [
      // Conference A schedule
      createXRangePoint(baseTime, baseTime + 2 * hour, 0),
      createXRangePoint(baseTime + 3 * hour, baseTime + 5 * hour, 0),
      createXRangePoint(baseTime + 6 * hour, baseTime + 8 * hour, 0),
      // Conference B schedule
      createXRangePoint(baseTime + 0.5 * hour, baseTime + 3.5 * hour, 1, true),
      createXRangePoint(baseTime + 4 * hour, baseTime + 6 * hour, 1),
      createXRangePoint(baseTime + 7 * hour, baseTime + 9 * hour, 1),
      // Board Room schedule (sparse)
      createXRangePoint(baseTime + 2 * hour, baseTime + 4 * hour, 2),
      createXRangePoint(baseTime + 6 * hour, baseTime + 7 * hour, 2),
      // Training Room (all day event)
      createXRangePoint(baseTime, baseTime + 8 * hour, 3, true),
      // Small Room 1 schedule
      createXRangePoint(baseTime, baseTime + 1 * hour, 4),
      createXRangePoint(baseTime + 1.5 * hour, baseTime + 2.5 * hour, 4),
      createXRangePoint(baseTime + 3 * hour, baseTime + 4 * hour, 4),
      createXRangePoint(baseTime + 5 * hour, baseTime + 7 * hour, 4),
      createXRangePoint(baseTime + 7.5 * hour, baseTime + 9 * hour, 4)
    ]
  }
}

// Test Case 6: Vehicle Fleet Utilization
export const createVehicleFleetUtilization = (): XRangeDef => {
  const startTime = Date.UTC(2024, 0, 1, 6, 0) // 6:00 AM
  const hour = 3600000

  return {
    chartDef: {
      id: 'xrange-test-6',
      title: 'Daily Fleet Vehicle Utilization',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Time of Day'
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Vehicle',
        categories: ['Truck 001', 'Truck 002', 'Van 101', 'Van 102', 'Car 201', 'Car 202']
      }
    },
    points: [
      // Truck 001 - multiple short trips
      createXRangePoint(startTime, startTime + 2 * hour, 0),
      createXRangePoint(startTime + 3 * hour, startTime + 5 * hour, 0),
      createXRangePoint(startTime + 6 * hour, startTime + 7.5 * hour, 0),
      createXRangePoint(startTime + 8 * hour, startTime + 10 * hour, 0),
      // Truck 002 - fewer long trips
      createXRangePoint(startTime + 0.5 * hour, startTime + 4 * hour, 1, true),
      createXRangePoint(startTime + 5 * hour, startTime + 9 * hour, 1, true),
      // Van 101 - morning heavy use
      createXRangePoint(startTime, startTime + 1.5 * hour, 2),
      createXRangePoint(startTime + 2 * hour, startTime + 3 * hour, 2),
      createXRangePoint(startTime + 3.5 * hour, startTime + 5 * hour, 2),
      createXRangePoint(startTime + 5.5 * hour, startTime + 6.5 * hour, 2),
      // Van 102 - afternoon heavy use
      createXRangePoint(startTime + 6 * hour, startTime + 7 * hour, 3),
      createXRangePoint(startTime + 7.5 * hour, startTime + 9 * hour, 3),
      createXRangePoint(startTime + 9.5 * hour, startTime + 11 * hour, 3),
      // Car 201 - continuous use
      createXRangePoint(startTime, startTime + 12 * hour, 4, true),
      // Car 202 - sporadic use
      createXRangePoint(startTime + 1 * hour, startTime + 2 * hour, 5),
      createXRangePoint(startTime + 4 * hour, startTime + 5 * hour, 5),
      createXRangePoint(startTime + 7 * hour, startTime + 8 * hour, 5),
      createXRangePoint(startTime + 10 * hour, startTime + 11 * hour, 5)
    ]
  }
}

// Test Case 7: Server Maintenance Windows
export const createServerMaintenanceWindows = (): XRangeDef => {
  const now = Date.now()
  const day = 86400000
  const week = 7 * day

  return {
    chartDef: {
      id: 'xrange-test-7',
      title: 'Server Maintenance Schedule (3 Months)',
      xAxis: {
        type: AxisType.AxisDateTime,
        label: 'Date'
      },
      yAxis: {
        type: AxisType.AxisCategory,
        label: 'Server',
        categories: ['Web Server 1', 'Web Server 2', 'DB Primary', 'DB Replica', 'Cache Server', 'Load Balancer']
      }
    },
    points: [
      // Web Server 1 - weekly maintenance
      createXRangePoint(now, now + 4 * 3600000, 0),
      createXRangePoint(now + week, now + week + 4 * 3600000, 0),
      createXRangePoint(now + 2 * week, now + 2 * week + 4 * 3600000, 0),
      createXRangePoint(now + 3 * week, now + 3 * week + 4 * 3600000, 0),
      // Web Server 2 - offset weekly maintenance
      createXRangePoint(now + 3 * day, now + 3 * day + 4 * 3600000, 1),
      createXRangePoint(now + week + 3 * day, now + week + 3 * day + 4 * 3600000, 1),
      createXRangePoint(now + 2 * week + 3 * day, now + 2 * week + 3 * day + 4 * 3600000, 1),
      // DB Primary - monthly maintenance
      createXRangePoint(now + 15 * day, now + 15 * day + 8 * 3600000, 2, true),
      createXRangePoint(now + 45 * day, now + 45 * day + 8 * 3600000, 2, true),
      createXRangePoint(now + 75 * day, now + 75 * day + 8 * 3600000, 2, true),
      // DB Replica - offset monthly
      createXRangePoint(now + 20 * day, now + 20 * day + 8 * 3600000, 3, true),
      createXRangePoint(now + 50 * day, now + 50 * day + 8 * 3600000, 3, true),
      createXRangePoint(now + 80 * day, now + 80 * day + 8 * 3600000, 3, true),
      // Cache Server - bi-weekly
      createXRangePoint(now + 7 * day, now + 7 * day + 2 * 3600000, 4),
      createXRangePoint(now + 21 * day, now + 21 * day + 2 * 3600000, 4),
      createXRangePoint(now + 35 * day, now + 35 * day + 2 * 3600000, 4),
      createXRangePoint(now + 49 * day, now + 49 * day + 2 * 3600000, 4),
      // Load Balancer - quarterly
      createXRangePoint(now + 30 * day, now + 30 * day + 12 * 3600000, 5, true)
    ]
  }
}

// Create all XRange test cases
export const createAllXRangeTests = (): XRangeDef[] => {
  return [
    createProjectTimelineXRange(),
    createResourceAllocationXRange(),
    createTemperatureRangeXRange(),
    createMachineAvailabilityXRange(),
    createMeetingRoomSchedule(),
    createVehicleFleetUtilization(),
    createServerMaintenanceWindows()
  ]
}