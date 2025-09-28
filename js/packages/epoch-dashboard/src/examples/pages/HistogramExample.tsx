import React, { useState } from 'react'
import { Histogram } from '../../components/charts'
import {
  createBasicHistogram,
  createCustomBinHistogram,
  createHistogramWithReferenceLines,
  createSalesHistogram,
  createLoadTimeHistogram,
  createReturnsHistogram,
  createTemperatureHistogram
} from '../../utils/histogramMocks'

const HistogramExample: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState(0)

  const chartConfigs = [
    { name: 'Normal Distribution', data: createBasicHistogram() },
    { name: 'Bimodal Distribution', data: createCustomBinHistogram() },
    { name: 'With Reference Lines', data: createHistogramWithReferenceLines() },
    { name: 'Sales Performance', data: createSalesHistogram() },
    { name: 'Load Time Analysis', data: createLoadTimeHistogram() },
    { name: 'Financial Returns', data: createReturnsHistogram() },
    { name: 'Temperature Data', data: createTemperatureHistogram() }
  ]

  return (
    <div className="min-h-screen bg-secondary-mildCementGrey p-8">
      <h1 className="text-3xl font-bold text-primary-white mb-2">
        Histogram Examples
      </h1>
      <p className="text-secondary-ashGrey mb-8">
        Comprehensive test cases for histogram charts with various distributions and statistical analysis
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
        <Histogram
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
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Histogram Data</h4>
            <pre className="bg-black/20 p-4 rounded text-xs text-primary-white overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(
                {
                  dataPoints: chartConfigs[selectedChart].data.data?.values?.length || 0,
                  binsCount: chartConfigs[selectedChart].data.binsCount || 'Auto'
                },
                null,
                2
              )}
            </pre>
          </div>

          {chartConfigs[selectedChart].data.straightLines && (
            <div>
              <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Reference Lines</h4>
              <pre className="bg-black/20 p-4 rounded text-xs text-primary-white overflow-x-auto">
                {JSON.stringify(chartConfigs[selectedChart].data.straightLines, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Features</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                Data Points: {chartConfigs[selectedChart].data.data?.values?.length || 0}
              </span>
              {chartConfigs[selectedChart].data.binsCount && (
                <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                  Bins: {chartConfigs[selectedChart].data.binsCount}
                </span>
              )}
              {chartConfigs[selectedChart].data.straightLines && (
                <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                  Reference Lines: {chartConfigs[selectedChart].data.straightLines.length}
                </span>
              )}
            </div>
          </div>

          {/* Statistical Summary */}
          {chartConfigs[selectedChart].data.data?.values && (
            <div>
              <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Statistical Summary</h4>
              <div className="bg-black/20 p-4 rounded">
                {(() => {
                  const values = chartConfigs[selectedChart].data.data?.values || []
                  if (values.length === 0) return null

                  // Extract numeric values from Scalar array
                  const numericValues = values.map(v =>
                    Number(v.decimalValue || v.integerValue || v.monetaryValue || 0)
                  )
                  const sorted = [...numericValues].sort((a, b) => a - b)
                  const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length
                  const median = sorted[Math.floor(numericValues.length / 2)]
                  const min = sorted[0]
                  const max = sorted[sorted.length - 1]
                  const variance = numericValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / numericValues.length
                  const stdDev = Math.sqrt(variance)

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-primary-white">
                      <div>
                        <div className="text-secondary-ashGrey">Mean</div>
                        <div>{mean.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-secondary-ashGrey">Median</div>
                        <div>{median.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-secondary-ashGrey">Std Dev</div>
                        <div>{stdDev.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-secondary-ashGrey">Range</div>
                        <div>{min.toFixed(2)} - {max.toFixed(2)}</div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HistogramExample