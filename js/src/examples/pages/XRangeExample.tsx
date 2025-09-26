import React, { useState } from 'react'
import { XRangeChart } from '../../components/charts'
import {
  createProjectTimelineXRange,
  createResourceAllocationXRange,
  createTemperatureRangeXRange,
  createStockPriceRangeXRange,
  createMachineUtilizationXRange,
  createEventScheduleXRange,
  createAgeRangeDemographicsXRange,
  createMultiLevelXRange
} from '../../utils/xRangeMocks'

const XRangeExample: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState(0)

  const chartConfigs = [
    { name: 'Project Timeline', data: createProjectTimelineXRange() },
    { name: 'Resource Allocation', data: createResourceAllocationXRange() },
    { name: 'Temperature Ranges', data: createTemperatureRangeXRange() },
    { name: 'Stock Price Range', data: createStockPriceRangeXRange() },
    { name: 'Machine Utilization', data: createMachineUtilizationXRange() },
    { name: 'Event Schedule', data: createEventScheduleXRange() },
    { name: 'Age Demographics', data: createAgeRangeDemographicsXRange() },
    { name: 'Multi-level Phases', data: createMultiLevelXRange() }
  ]

  return (
    <div className="min-h-screen bg-secondary-mildCementGrey p-8">
      <h1 className="text-3xl font-bold text-primary-white mb-2">
        XRange Chart Examples
      </h1>
      <p className="text-secondary-ashGrey mb-8">
        Comprehensive test cases for XRange charts showing ranges, timelines, and intervals
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
        {/* Debug info */}
        <div className="text-xs text-secondary-ashGrey mb-2">
          Debug: Rendering chart {selectedChart} - {chartConfigs[selectedChart]?.name}
        </div>
        <XRangeChart
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
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">XRange Series</h4>
            <pre className="bg-black/20 p-4 rounded text-xs text-primary-white overflow-x-auto max-h-64 overflow-y-auto">
              {JSON.stringify(
                chartConfigs[selectedChart].data.data?.map(series => ({
                  name: series.name,
                  dataPoints: series.data?.length || 0,
                  samplePoint: series.data?.[0] || null
                })),
                null,
                2
              )}
            </pre>
          </div>

          {(chartConfigs[selectedChart].data as any).straightLines && (
            <div>
              <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Reference Lines</h4>
              <pre className="bg-black/20 p-4 rounded text-xs text-primary-white overflow-x-auto">
                {JSON.stringify((chartConfigs[selectedChart].data as any).straightLines, null, 2)}
              </pre>
            </div>
          )}

          {((chartConfigs[selectedChart].data as any).xPlotBands || (chartConfigs[selectedChart].data as any).yPlotBands) && (
            <div>
              <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Plot Bands</h4>
              <pre className="bg-black/20 p-4 rounded text-xs text-primary-white overflow-x-auto">
                {JSON.stringify({
                  xPlotBands: (chartConfigs[selectedChart].data as any).xPlotBands,
                  yPlotBands: (chartConfigs[selectedChart].data as any).yPlotBands
                }, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-secondary-ashGrey mb-2">Features</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                {chartConfigs[selectedChart].data.data?.length || 0} Series
              </span>
              <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                {chartConfigs[selectedChart].data.data?.reduce((total, series) => total + (series.data?.length || 0), 0)} Total Ranges
              </span>
              {chartConfigs[selectedChart].data.chartDef?.xAxis?.type === 3 && (
                <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                  DateTime X-Axis
                </span>
              )}
              {chartConfigs[selectedChart].data.chartDef?.xAxis?.type === 1 && (
                <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                  Linear X-Axis
                </span>
              )}
              {chartConfigs[selectedChart].data.chartDef?.yAxis?.type === 4 && (
                <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                  Category Y-Axis
                </span>
              )}
              {(chartConfigs[selectedChart].data as any).straightLines && (
                <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                  Reference Lines
                </span>
              )}
              {(chartConfigs[selectedChart].data as any).xPlotBands && (
                <span className="px-2 py-1 bg-primary-white/10 text-xs text-primary-white rounded">
                  X Plot Bands
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default XRangeExample