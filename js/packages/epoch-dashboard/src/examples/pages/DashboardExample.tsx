'use client'

import React from 'react'
import Dashboard from '../../components/Dashboard'
import type { DashboardMetadata, DashboardCategory } from '../../components/Dashboard'
import { Chart, CardDef, CardData, EpochFolioType } from '../../types/proto'

// Import all mock data creators
import {
  createBasicAreaChart,
  createStackedAreaChart
} from '../../utils/areaChartMocks'
import {
  createBasicVerticalBarChart,
  createMixedStackedBarChart,
  createHorizontalBarChart
} from '../../utils/barChartMocks'
import {
  createBasicHistogram,
  createCustomBinHistogram
} from '../../utils/histogramMocks'
import {
  createBasicHeatMap,
  createCorrelationMatrix
} from '../../utils/heatMapMocks'
import {
  simpleBoxPlotData,
  performanceBoxPlotData
} from '../../utils/boxPlotMocks'
import {
  createBasicPieChart,
  createDonutChart
} from '../../utils/pieChartMocks'
import {
  createProjectTimelineXRange,
  createResourceAllocationXRange
} from '../../utils/xRangeMocks'
import {
  createMockTableData
} from '../../utils/tableMocks'
import { Scalar } from '../../types/proto'

// Create sample card data
const createCardData = (title: string, value: number | string): CardData => ({
  title,
  value: typeof value === 'number'
    ? { double: value } as Scalar
    : { string: value } as Scalar,
  type: typeof value === 'number' ? EpochFolioType.TypeDecimal : EpochFolioType.TypeString
})

// Create sample cards
const createMetricCards = (): CardDef[] => [
  {
    category: 'Performance Metrics',
    data: [
      createCardData('Total P&L', '+$125,432'),
      createCardData('Month Change', '+12.4%')
    ]
  },
  {
    category: 'Win Rate',
    data: [
      createCardData('Rate', '67.8%'),
      createCardData('Wins/Trades', '145/214')
    ]
  },
  {
    category: 'Risk Metrics',
    data: [
      createCardData('Sharpe Ratio', 2.34),
      createCardData('Max Drawdown', -8.2)
    ]
  }
]

const createAnalyticsCards = (): CardDef[] => [
  {
    category: 'System Metrics',
    data: [
      createCardData('Active Users', 42381),
      createCardData('Daily Change', '+5.2%')
    ]
  },
  {
    category: 'API Performance',
    data: [
      createCardData('API Calls', '1.2M'),
      createCardData('Error Rate', '0.02%')
    ]
  }
]

// Helper to wrap chart definitions in Chart type
const wrapChart = (chartDef: any): Chart => {
  // Determine the chart type and wrap accordingly
  if (chartDef.areas) {
    return { areaDef: chartDef }
  } else if (chartDef.data && Array.isArray(chartDef.data) && chartDef.data[0]?.values) {
    return { barDef: chartDef }
  } else if (chartDef.points && chartDef.points[0]?.value !== undefined) {
    return { heatMapDef: chartDef }
  } else if (chartDef.data && chartDef.data.values) {
    return { histogramDef: chartDef }
  } else if (chartDef.data && chartDef.data.points) {
    return { boxPlotDef: chartDef }
  } else if (chartDef.pieData) {
    return { pieDef: chartDef }
  } else if (chartDef.points && chartDef.points[0]?.isLong !== undefined) {
    return { xRangeDef: chartDef }
  }
  // Default to line chart
  return { linesDef: chartDef }
}

// Create dashboard categories with different types of content
const createDashboardCategories = (): DashboardCategory[] => [
  {
    id: 'overview',
    label: 'Overview',
    value: 'overview',
    description: 'Key metrics and performance summary',
    cards: createMetricCards(),
    charts: [
      wrapChart(createBasicAreaChart()),
      wrapChart(createMixedStackedBarChart()),
      wrapChart(createBasicHeatMap()),
      wrapChart(performanceBoxPlotData)
    ],
    tables: [createMockTableData()]
  },
  {
    id: 'performance',
    label: 'Performance',
    value: 'performance',
    description: 'Detailed performance analytics',
    cards: createMetricCards(),
    charts: [
      wrapChart(createStackedAreaChart()),
      wrapChart(createBasicHistogram()),
      wrapChart(simpleBoxPlotData),
      wrapChart(createCorrelationMatrix())
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics',
    value: 'analytics',
    description: 'System analytics and metrics',
    cards: createAnalyticsCards(),
    charts: [
      wrapChart(createHorizontalBarChart()),
      wrapChart(createCustomBinHistogram()),
      wrapChart(createDonutChart()),
      wrapChart(createProjectTimelineXRange())
    ],
    tables: [createMockTableData()]
  },
  {
    id: 'distribution',
    label: 'Distribution',
    value: 'distribution',
    description: 'Data distribution analysis',
    charts: [
      wrapChart(createBasicPieChart()),
      wrapChart(createBasicHistogram()),
      wrapChart(performanceBoxPlotData),
      wrapChart(createBasicVerticalBarChart())
    ]
  },
  {
    id: 'timeline',
    label: 'Timeline',
    value: 'timeline',
    description: 'Time-based analysis',
    charts: [
      wrapChart(createProjectTimelineXRange()),
      wrapChart(createResourceAllocationXRange()),
      wrapChart(createBasicAreaChart())
    ],
    tables: [createMockTableData()]
  }
]

const DashboardExample: React.FC = () => {
  console.log('DashboardExample rendering')

  const dashboardMetadata: DashboardMetadata = {
    categories: createDashboardCategories(),
    defaultCategory: 'overview',
    defaultLayout: 'columns_2'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <h1 style={{color: 'white', fontSize: '2rem'}}>DASHBOARD TEST</h1>
      <div className="max-w-[1920px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Epoch Dashboard
          </h1>
          <p className="text-gray-400">
            Comprehensive analytics and performance monitoring
          </p>
        </div>

        <div className="h-[calc(100vh-200px)]">
          <Dashboard
            metadata={dashboardMetadata}
            className="h-full"
            onCategoryChange={(category) => {
              console.log('Category changed to:', category)
            }}
            onLayoutChange={(layout) => {
              console.log('Layout changed to:', layout)
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default DashboardExample