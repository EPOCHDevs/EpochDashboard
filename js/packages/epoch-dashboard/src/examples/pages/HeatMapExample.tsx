import React, { useState } from 'react'
import { HeatMap } from '../../components/charts'
import {
  createBasicHeatMap,
  createCorrelationMatrix,
  createMonthlySalesHeatMap,
  createServerPerformanceHeatMap,
  createRiskMatrix,
  createGeographicHeatMap,
  createTimeActivityHeatMap,
  createFeatureComparisonHeatMap,
  createLargeHeatMap,
  createCustomColorHeatMap
} from '../../utils/heatMapMocks'

const HeatMapExample: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState(0)

  const chartConfigs = [
    { name: 'Basic HeatMap', data: createBasicHeatMap() },
    { name: 'Correlation Matrix', data: createCorrelationMatrix() },
    { name: 'Monthly Sales', data: createMonthlySalesHeatMap() },
    { name: 'Server Performance', data: createServerPerformanceHeatMap() },
    { name: 'Risk Matrix', data: createRiskMatrix() },
    { name: 'Geographic Activity', data: createGeographicHeatMap() },
    { name: 'Time Activity Pattern', data: createTimeActivityHeatMap() },
    { name: 'Feature Comparison', data: createFeatureComparisonHeatMap() },
    { name: 'Large Dataset', data: createLargeHeatMap() },
    { name: 'Custom Colors', data: createCustomColorHeatMap() }
  ]

  return (
    <div className="min-h-screen bg-secondary-mildCementGrey p-8">
      <h1 className="text-3xl font-bold text-primary-white mb-2">
        HeatMap Examples
      </h1>
      <p className="text-secondary-ashGrey mb-8">
        Comprehensive test cases for heat maps with various configurations and use cases
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
        <HeatMap
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
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Data Info</h4>
            <pre className="bg-black/20 p-4 rounded text-xs text-primary-white overflow-x-auto">
              {JSON.stringify({
                dataPoints: chartConfigs[selectedChart].data.points?.length || 0,
                xCategories: chartConfigs[selectedChart].data.chartDef?.xAxis?.categories?.length || 0,
                yCategories: chartConfigs[selectedChart].data.chartDef?.yAxis?.categories?.length || 0
              }, null, 2)}
            </pre>
          </div>



          <div>
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Features</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                {chartConfigs[selectedChart].data.points?.length || 0} Data Points
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeatMapExample