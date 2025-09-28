import React, { useState } from 'react'
import { LineChart } from '@epochlab/epoch-dashboard'
import {
  createBasicTimeSeriesChart,
  createMultiStyleChart,
  createLinearWithReferenceLinesChart,
  createLogarithmicChart,
  createCategoryChart,
  createStackedChart,
  createChartWithHorizontalPlotBands,
  createChartWithVerticalPlotBands,
  createChartWithOverlay,
  createHighFrequencyChart,
  createVariableLineWidthChart
} from '../utils/chartMocks'

const LineChartExample: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState(0)

  const chartConfigs = [
    { name: 'Basic Time Series', data: createBasicTimeSeriesChart() },
    { name: 'Multiple Dash Styles', data: createMultiStyleChart() },
    { name: 'Linear with Reference Lines', data: createLinearWithReferenceLinesChart() },
    { name: 'Logarithmic Scale', data: createLogarithmicChart() },
    { name: 'Category Axis', data: createCategoryChart() },
    { name: 'Stacked Lines', data: createStackedChart() },
    { name: 'Horizontal Plot Bands', data: createChartWithHorizontalPlotBands() },
    { name: 'Vertical Plot Bands', data: createChartWithVerticalPlotBands() },
    { name: 'With Overlay', data: createChartWithOverlay() },
    { name: 'High Frequency Data', data: createHighFrequencyChart() },
    { name: 'Variable Line Widths', data: createVariableLineWidthChart() }
  ]

  return (
    <div className="min-h-screen bg-secondary-mildCementGrey p-8">
      <h1 className="text-3xl font-bold text-primary-white mb-2">
        Line Chart Examples
      </h1>
      <p className="text-secondary-ashGrey mb-8">
        Comprehensive test cases demonstrating various line chart configurations with different
        axis types, dash styles, and features
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
        <LineChart
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
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Lines Configuration</h4>
            <pre className="bg-black/20 p-4 rounded text-xs text-primary-white overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(
                chartConfigs[selectedChart].data.lines?.map(line => ({
                  ...line,
                  data: `${line.data?.length || 0} points`
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
                X-Axis: {getAxisTypeName(chartConfigs[selectedChart].data.chartDef?.xAxis?.type)}
              </span>
              <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                Y-Axis: {getAxisTypeName(chartConfigs[selectedChart].data.chartDef?.yAxis?.type)}
              </span>
              <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                {chartConfigs[selectedChart].data.lines?.length || 0} Series
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get axis type name
const getAxisTypeName = (type?: number): string => {
  switch (type) {
    case 1: return 'Linear'
    case 2: return 'Logarithmic'
    case 3: return 'DateTime'
    case 4: return 'Category'
    default: return 'Unspecified'
  }
}

export default LineChartExample