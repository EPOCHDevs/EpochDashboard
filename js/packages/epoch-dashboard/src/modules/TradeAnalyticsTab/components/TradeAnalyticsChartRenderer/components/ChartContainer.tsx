import React from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts, { Chart, Options } from 'highcharts/highstock'

interface ChartContainerProps {
  chartOptions: Options | undefined
  chartKey: string
  chartRef: React.RefObject<HighchartsReact.RefObject>
  assetId: string
  selectedTimeframe: string
  isActuallyFetching: boolean
  hasData: boolean
  onChartRendered?: () => void
}

/**
 * Wrapper for HighchartsReact component
 * Handles chart initialization, key-based recreation, and loading states
 */
export const ChartContainer: React.FC<ChartContainerProps> = ({
  chartOptions,
  chartKey,
  chartRef,
  assetId,
  selectedTimeframe,
  isActuallyFetching,
  hasData,
  onChartRendered,
}) => {
  if (!chartOptions) {
    return null
  }

  return (
    <>
      {/* Network fetch loading indicator */}
      {isActuallyFetching && hasData && (
        <div className="absolute inset-0 z-40 skeleton-chart-loader">
          <div className="skeleton-shimmer" />
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur-md rounded-lg border border-territory-blue/30">
            <div className="w-2 h-2 bg-territory-blue rounded-full animate-pulse" />
            <span className="text-xs font-medium text-primary-white/80">Loading data...</span>
          </div>
        </div>
      )}

      {/* Highcharts chart - use immutable=false to allow smooth updates */}
      <HighchartsReact
        key={chartKey || `${selectedTimeframe}-${assetId}`}
        highcharts={Highcharts}
        options={chartOptions}
        ref={chartRef}
        immutable={false}
        updateArgs={[true, true, true]}
        style={{
          opacity: 1,
          height: '100%',
          width: '100%',
        }}
        callback={(chart: Chart) => {
          try {
            if (chart) {
              chart.reflow()
            }
            if (onChartRendered) {
              onChartRendered()
            }
          } catch (error) {
            console.warn('Chart callback error:', error)
            if (onChartRendered) {
              onChartRendered()
            }
          }
        }}
      />
    </>
  )
}
