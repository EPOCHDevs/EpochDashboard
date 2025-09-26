import React, { useState } from 'react'
import { PieChart } from '../../components/charts'
import {
  createBasicPieChart,
  createDonutChart,
  createMultiplePieChart,
  createTradingPerformancePie,
  createRiskDistributionPie,
  createSmallDatasetPie,
  createLargeDatasetPie,
  createCurrencyDistributionPie,
  createPerformanceAttributionPie,
  createESGScoringPie
} from '../../utils/pieChartMocks'

const PieChartExample: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState(0)

  const chartConfigs = [
    { name: 'Basic Pie Chart', data: createBasicPieChart() },
    { name: 'Donut Chart', data: createDonutChart() },
    { name: 'Multiple Pie Charts', data: createMultiplePieChart() },
    { name: 'Trading Performance', data: createTradingPerformancePie() },
    { name: 'Risk Distribution', data: createRiskDistributionPie() },
    { name: 'Small Dataset', data: createSmallDatasetPie() },
    { name: 'Large Dataset', data: createLargeDatasetPie() },
    { name: 'Currency Distribution', data: createCurrencyDistributionPie() },
    { name: 'Performance Attribution', data: createPerformanceAttributionPie() },
    { name: 'ESG Scoring', data: createESGScoringPie() }
  ]

  return (
    <div className="min-h-screen bg-secondary-mildCementGrey p-8">
      <h1 className="text-3xl font-bold text-primary-white mb-2">
        Pie Chart Examples
      </h1>
      <p className="text-secondary-ashGrey mb-8">
        Comprehensive test cases for pie charts and donut charts with various configurations
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
        <PieChart
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
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Pie Data</h4>
            <pre className="bg-black/20 p-4 rounded text-xs text-primary-white overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(
                chartConfigs[selectedChart].data.data?.map(pieData => ({
                  name: pieData.name,
                  size: pieData.size,
                  innerSize: pieData.innerSize,
                  pointCount: pieData.points?.length || 0,
                  points: pieData.points?.map(point => ({
                    name: point.name,
                    value: point.y
                  }))
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
                Series Count: {chartConfigs[selectedChart].data.data?.length || 0}
              </span>
              {chartConfigs[selectedChart].data.data?.map((pieData, index) => (
                <React.Fragment key={index}>
                  <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                    {pieData.name}: {pieData.points?.length || 0} slices
                  </span>
                  {pieData.innerSize && pieData.innerSize !== '0%' && (
                    <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                      Donut (Inner: {pieData.innerSize})
                    </span>
                  )}
                  <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                    Size: {pieData.size || 'Auto'}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Data Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {chartConfigs[selectedChart].data.data?.map((pieData, pieIndex) => (
                <div key={pieIndex} className="bg-black/20 p-3 rounded">
                  <h5 className="text-sm font-medium text-primary-white mb-2">{pieData.name}</h5>
                  <div className="space-y-1">
                    {pieData.points?.map((point, pointIndex) => (
                      <div key={pointIndex} className="flex justify-between text-xs">
                        <span className="text-secondary-ashGrey">{point.name}:</span>
                        <span className="text-primary-white">{point.y}</span>
                      </div>
                    ))}
                    <div className="border-t border-primary-white/10 pt-1 mt-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-secondary-ashGrey">Total:</span>
                        <span className="text-primary-white">
                          {pieData.points?.reduce((sum, point) => sum + (point.y || 0), 0).toFixed(1) || 0}
                        </span>
                      </div>
                    </div>
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

export default PieChartExample