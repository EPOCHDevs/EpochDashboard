import {
  TearSheet,
  Chart,
  CardDef,
  Table,
  ChartList,
  CardDefList,
  TableList,
  TableData,
  TableRow,
  ColumnDef,
  EpochFolioType,
  Scalar
} from '../types/proto'

// Import existing mock data generators
import { createBasicAreaChart, createStackedAreaChart } from './areaChartMocks'
import { createBasicVerticalBarChart, createHorizontalBarChart } from './barChartMocks'
import { createBasicHistogram, createCustomBinHistogram } from './histogramMocks'
import { createBasicHeatMap, createCorrelationMatrix } from './heatMapMocks'
import { simpleBoxPlotData, performanceBoxPlotData } from './boxPlotMocks'
import { createBasicPieChart, createDonutChart } from './pieChartMocks'
import { createProjectTimelineXRange, createResourceAllocationXRange } from './xRangeMocks'
import { createMockTableData } from './tableMocks'

/**
 * Create a mock tearsheet with categorized data
 */
export function createMockTearsheet(strategyId: string = 'default'): TearSheet {
  // Define categories for organization
  const categories = {
    performance: 'Performance',
    risk: 'Risk Analysis',
    allocation: 'Asset Allocation',
    execution: 'Execution Stats'
  }

  // Create categorized charts
  const charts: Chart[] = [
    // Performance category
    wrapChartWithCategory(createBasicAreaChart(), categories.performance),
    wrapChartWithCategory(createStackedAreaChart(), categories.performance),
    wrapChartWithCategory(performanceBoxPlotData, categories.performance),

    // Risk category
    wrapChartWithCategory(createBasicHistogram(), categories.risk),
    wrapChartWithCategory(createCorrelationMatrix(), categories.risk),
    wrapChartWithCategory(simpleBoxPlotData, categories.risk),

    // Allocation category
    wrapChartWithCategory(createBasicPieChart(), categories.allocation),
    wrapChartWithCategory(createDonutChart(), categories.allocation),
    wrapChartWithCategory(createBasicVerticalBarChart(), categories.allocation),

    // Execution category
    wrapChartWithCategory(createHorizontalBarChart(), categories.execution),
    wrapChartWithCategory(createBasicHeatMap(), categories.execution),
    wrapChartWithCategory(createProjectTimelineXRange(), categories.execution)
  ]

  // Create categorized cards
  const cards: CardDef[] = [
    // Performance cards
    createMockCard('Total Return', '+125.4%', categories.performance),
    createMockCard('Sharpe Ratio', '2.34', categories.performance),
    createMockCard('Win Rate', '67.8%', categories.performance),

    // Risk cards
    createMockCard('Max Drawdown', '-8.2%', categories.risk),
    createMockCard('VaR (95%)', '-2.5%', categories.risk),
    createMockCard('Beta', '0.85', categories.risk),

    // Allocation cards
    createMockCard('Active Positions', '42', categories.allocation),
    createMockCard('Total AUM', '$125M', categories.allocation),

    // Execution cards
    createMockCard('Avg Execution', '0.23ms', categories.execution),
    createMockCard('Fill Rate', '99.2%', categories.execution)
  ]

  // Create categorized tables
  const tables: Table[] = [
    createMockTable('Performance Metrics', categories.performance, 10),
    createMockTable('Risk Metrics', categories.risk, 8),
    createMockTable('Position Breakdown', categories.allocation, 15),
    createMockTable('Recent Executions', categories.execution, 20)
  ]

  // Create the tearsheet
  const tearsheet: TearSheet = {
    charts: {
      charts
    } as ChartList,
    cards: {
      cards
    } as CardDefList,
    tables: {
      tables
    } as TableList
  }

  return tearsheet
}

/**
 * Wrap a chart definition with a category
 */
function wrapChartWithCategory(chartDef: any, category: string): Chart {
  // Set category on the chart definition
  if (chartDef.chartDef) {
    chartDef.chartDef.category = category
  }

  // Determine the chart type and wrap accordingly
  if (chartDef.areas) {
    return {
      areaDef: {
        ...chartDef,
        chartDef: { ...chartDef.chartDef, category }
      }
    }
  } else if (chartDef.data && Array.isArray(chartDef.data) && chartDef.data[0]?.values) {
    return {
      barDef: {
        ...chartDef,
        chartDef: { ...chartDef.chartDef, category }
      }
    }
  } else if (chartDef.points && chartDef.points[0]?.value !== undefined) {
    return {
      heatMapDef: {
        ...chartDef,
        chartDef: { ...chartDef.chartDef, category }
      }
    }
  } else if (chartDef.data && chartDef.data.values) {
    return {
      histogramDef: {
        ...chartDef,
        chartDef: { ...chartDef.chartDef, category }
      }
    }
  } else if (chartDef.data && chartDef.data.points) {
    return {
      boxPlotDef: {
        ...chartDef,
        chartDef: { ...chartDef.chartDef, category }
      }
    }
  } else if (chartDef.pieData) {
    return {
      pieDef: {
        ...chartDef,
        chartDef: { ...chartDef.chartDef, category }
      }
    }
  } else if (chartDef.points && chartDef.points[0]?.isLong !== undefined) {
    return {
      xRangeDef: {
        ...chartDef,
        chartDef: { ...chartDef.chartDef, category }
      }
    }
  }

  // Default to line chart
  return {
    linesDef: {
      ...chartDef,
      chartDef: { ...chartDef.chartDef, category }
    }
  }
}

/**
 * Create a mock card with proper scalar types
 */
function createMockCard(title: string, value: string, category: string): CardDef {
  // Parse value to determine proper type
  let scalar: Scalar
  let type: EpochFolioType

  if (value.includes('%')) {
    // Percentage value
    const numValue = parseFloat(value.replace('%', ''))
    scalar = { percentValue: numValue }
    type = EpochFolioType.TypePercent
  } else if (value.startsWith('$')) {
    // Monetary value
    let numStr = value.replace(/[$,]/g, '')
    let numValue = parseFloat(numStr)
    if (numStr.includes('M')) {
      numValue = parseFloat(numStr.replace('M', '')) * 1000000
    }
    scalar = { monetaryValue: numValue }
    type = EpochFolioType.TypeMonetary
  } else if (value.includes('ms')) {
    // Duration value
    const numValue = parseFloat(value.replace('ms', ''))
    scalar = { durationMs: numValue }
    type = EpochFolioType.TypeDuration
  } else if (!isNaN(parseFloat(value))) {
    // Numeric value
    const numValue = parseFloat(value)
    if (Number.isInteger(numValue)) {
      scalar = { integerValue: numValue }
      type = EpochFolioType.TypeInteger
    } else {
      scalar = { decimalValue: numValue }
      type = EpochFolioType.TypeDecimal
    }
  } else {
    // String value
    scalar = { stringValue: value }
    type = EpochFolioType.TypeString
  }

  return {
    category,
    data: [
      {
        title,
        value: scalar,
        type
      }
    ]
  }
}

/**
 * Create a mock table
 */
function createMockTable(title: string, category: string, rowCount: number): Table {
  const mockData = createMockTableData(rowCount)

  // Convert to Table structure
  const columns: ColumnDef[] = mockData.headers.map((header, i) => ({
    name: header,
    type: mockData.columnTypes[i]
  }))

  const rows: TableRow[] = mockData.rows.map(row => ({
    values: row
  }))

  const tableData: TableData = {
    rows
  }

  return {
    category,
    title,
    columns,
    data: tableData
  }
}

/**
 * Create a minimal mock tearsheet for testing
 */
export function createMinimalTearsheet(): TearSheet {
  return {
    charts: {
      charts: [
        wrapChartWithCategory(createBasicAreaChart(), 'Overview'),
        wrapChartWithCategory(createBasicHistogram(), 'Overview')
      ]
    } as ChartList,
    cards: {
      cards: [
        createMockCard('Test Metric', '123', 'Overview')
      ]
    } as CardDefList,
    tables: {
      tables: [
        createMockTable('Test Table', 'Overview', 5)
      ]
    } as TableList
  }
}