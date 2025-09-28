import React, { useState } from 'react'
import { BarChart } from '@epochlab/epoch-dashboard'
import {
  createBasicVerticalBarChart,
  createHorizontalBarChart,
  createStackedVerticalBarChart,
  createStackedHorizontalBarChart,
  createBarChartWithReferenceLines,
  createNegativeValuesBarChart,
  createLargeDatasetBarChart,
  createPercentageStackedBarChart,
  createManyCategorieslHorizontalBarChart,
  createMixedStackedBarChart,
  createStackGroupsBarChart
} from '../utils/barChartMocks'

const BarChartExample: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState(0)

  const chartConfigs = [
    { name: 'Vertical Bar Chart', data: createBasicVerticalBarChart() },
    { name: 'Horizontal Bar Chart', data: createHorizontalBarChart() },
    { name: 'Stacked Vertical', data: createStackedVerticalBarChart() },
    { name: 'Stacked Horizontal', data: createStackedHorizontalBarChart() },
    { name: 'With Reference Lines', data: createBarChartWithReferenceLines() },
    { name: 'Negative Values', data: createNegativeValuesBarChart() },
    { name: 'Large Dataset', data: createLargeDatasetBarChart() },
    { name: 'Percentage Stacked', data: createPercentageStackedBarChart() },
    { name: 'Many Categories', data: createManyCategorieslHorizontalBarChart() },
    { name: 'Mixed Positive/Negative', data: createMixedStackedBarChart() },
    { name: 'Stack Groups', data: createStackGroupsBarChart() }
  ]

  return (
    <div className="min-h-screen bg-secondary-mildCementGrey p-8">
      <h1 className="text-3xl font-bold text-primary-white mb-2">
        Bar Chart Examples
      </h1>
      <p className="text-secondary-ashGrey mb-8">
        Comprehensive test cases for vertical (column) and horizontal bar charts with various configurations
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
        <BarChart
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
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Data Series</h4>
            <pre className="bg-black/20 p-4 rounded text-xs text-primary-white overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(
                chartConfigs[selectedChart].data.data?.map(series => ({
                  ...series,
                  values: `[${series.values?.length || 0} values]`
                })),
                null,
                2
              )}
            </pre>
          </div>


          <div>
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Features</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                Orientation: {chartConfigs[selectedChart].data.vertical !== false ? 'Vertical' : 'Horizontal'}
              </span>
              {chartConfigs[selectedChart].data.stacked && (
                <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                  Stacked
                </span>
              )}
              <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                {chartConfigs[selectedChart].data.data?.length || 0} Series
              </span>
              <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                Categories: {chartConfigs[selectedChart].data.chartDef?.xAxis?.categories?.length || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BarChartExample