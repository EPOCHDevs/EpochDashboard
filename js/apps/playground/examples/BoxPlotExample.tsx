import React, { useState } from 'react'
import { BoxPlot } from '@epochlab/epoch-dashboard'
import {
  performanceBoxPlotData,
  simpleBoxPlotData,
  financialBoxPlotData,
  temperatureBoxPlotData,
  testScoreBoxPlotData
} from '../utils/boxPlotMocks'

const BoxPlotExample: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState(0)

  const chartConfigs = [
    { name: 'Performance Metrics', data: performanceBoxPlotData },
    { name: 'Simple Box Plot', data: simpleBoxPlotData },
    { name: 'Financial Analysis', data: financialBoxPlotData },
    { name: 'Temperature Distribution', data: temperatureBoxPlotData },
    { name: 'Test Scores', data: testScoreBoxPlotData }
  ]

  return (
    <div className="min-h-screen bg-secondary-mildCementGrey p-8">
      <h1 className="text-3xl font-bold text-primary-white mb-2">
        Box Plot Examples
      </h1>
      <p className="text-secondary-ashGrey mb-8">
        Comprehensive test cases demonstrating various box plot configurations with outliers,
        quartiles, and statistical distributions
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
        <BoxPlot
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
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Box Plot Data</h4>
            <pre className="bg-black/20 p-4 rounded text-xs text-primary-white overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(
                {
                  points: chartConfigs[selectedChart].data.data?.points?.length || 0,
                  outliers: chartConfigs[selectedChart].data.data?.outliers?.length || 0
                },
                null,
                2
              )}
            </pre>
          </div>



          <div>
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Features</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                X-Axis: {getAxisTypeName(chartConfigs[selectedChart].data.chartDef?.xAxis?.type || undefined)}
              </span>
              <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                Y-Axis: {getAxisTypeName(chartConfigs[selectedChart].data.chartDef?.yAxis?.type || undefined)}
              </span>
              {chartConfigs[selectedChart].data.data?.outliers && chartConfigs[selectedChart].data.data.outliers.length > 0 && (
                <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                  Has Outliers
                </span>
              )}
              <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                {chartConfigs[selectedChart].data.data?.points?.length || 0} Data Points
              </span>
              <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                {chartConfigs[selectedChart].data.data?.outliers?.length || 0} Total Outliers
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Statistical Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {chartConfigs[selectedChart].data.data?.points?.map((point, index) => (
                <div key={index} className="bg-black/20 p-3 rounded">
                  <div className="font-medium text-primary-white mb-2">
                    {chartConfigs[selectedChart].data.chartDef?.xAxis?.categories?.[index] || `Series ${index + 1}`}
                  </div>
                  <div className="space-y-1 text-secondary-ashGrey">
                    <div>Min: {point.low}</div>
                    <div>Q1: {point.q1}</div>
                    <div>Median: {point.median}</div>
                    <div>Q3: {point.q3}</div>
                    <div>Max: {point.high}</div>
                    <div>Range: {(point.high || 0) - (point.low || 0)}</div>
                    <div>IQR: {(point.q3 || 0) - (point.q1 || 0)}</div>
                  </div>
                </div>
              ))}
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

export default BoxPlotExample