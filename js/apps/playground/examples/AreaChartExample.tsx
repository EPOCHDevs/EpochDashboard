import React, { useState } from 'react'
import { AreaChart } from '@epochlab/epoch-dashboard'
import {
  createBasicAreaChart,
  createMultipleAreaChart,
  createStackedAreaChart,
  createPercentageStackedAreaChart,
  createStyledAreaChart,
  createAreaWithReferenceLinesChart,
  createAreaWithPlotBandsChart,
  createCategoryAreaChart,
  createLogarithmicAreaChart,
  createNegativeAreaChart
} from '../utils/areaChartMocks'

const AreaChartExample: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState(0)

  const chartConfigs = [
    { name: 'Basic Area', data: createBasicAreaChart() },
    { name: 'Multiple Areas', data: createMultipleAreaChart() },
    { name: 'Stacked Area', data: createStackedAreaChart() },
    { name: 'Percentage Stacked', data: createPercentageStackedAreaChart() },
    { name: 'Styled Areas', data: createStyledAreaChart() },
    { name: 'With Reference Lines', data: createAreaWithReferenceLinesChart() },
    { name: 'With Plot Bands', data: createAreaWithPlotBandsChart() },
    { name: 'Category Axis', data: createCategoryAreaChart() },
    { name: 'Logarithmic Scale', data: createLogarithmicAreaChart() },
    { name: 'Negative Values', data: createNegativeAreaChart() }
  ]

  return (
    <div className="min-h-screen bg-secondary-mildCementGrey p-8">
      <h1 className="text-3xl font-bold text-primary-white mb-2">
        Area Chart Examples
      </h1>
      <p className="text-secondary-ashGrey mb-8">
        Comprehensive test cases for area charts with various configurations
      </p>

      {/* Chart Selection */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {chartConfigs.map((config, index) => (
            <button
              key={index}
              onClick={() => setSelectedChart(index)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedChart === index
                  ? 'bg-primary-white/20 text-primary-white'
                  : 'bg-primary-white/5 text-secondary-ashGrey hover:bg-primary-white/10'
              }`}
            >
              {config.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Chart */}
      <div className="bg-primary-white/2 border border-primary-white/10 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-primary-white mb-4">
          {chartConfigs[selectedChart].name}
        </h2>
        <AreaChart
          data={chartConfigs[selectedChart].data}
          height={500}
          className="w-full"
        />
      </div>

      {/* Chart Details */}
      <div className="bg-primary-white/2 border border-primary-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-primary-white mb-4">
          Chart Configuration Details
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Chart Definition</h4>
            <pre className="bg-black/20 p-4 rounded text-xs text-primary-white overflow-x-auto">
              {JSON.stringify(chartConfigs[selectedChart].data.chartDef, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Area Series</h4>
            <pre className="bg-black/20 p-4 rounded text-xs text-primary-white overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(
                chartConfigs[selectedChart].data.areas?.map(area => ({
                  ...area,
                  data: `[${area.data?.length || 0} points]`
                })),
                null,
                2
              )}
            </pre>
          </div>


          <div>
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Features</h4>
            <div className="flex flex-wrap gap-2">
              {chartConfigs[selectedChart].data.stacked && (
                <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                  Stacked: {chartConfigs[selectedChart].data.stackType || 'normal'}
                </span>
              )}
              <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                {chartConfigs[selectedChart].data.areas?.length || 0} Series
              </span>
              {chartConfigs[selectedChart].data.chartDef?.xAxis?.type === 3 && (
                <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                  DateTime X-Axis
                </span>
              )}
              {chartConfigs[selectedChart].data.chartDef?.yAxis?.type === 2 && (
                <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                  Logarithmic Y-Axis
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AreaChartExample