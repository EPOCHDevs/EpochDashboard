'use client'

import React, { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { AreaDef } from '../../types/proto'
import { useChartOptions } from '../../hooks/useChartOptions'
import { convertAreaToSeries, getStackingConfig } from '../../utils/protoToHighcharts'

interface AreaChartProps {
  data: AreaDef
  height?: number
  className?: string
  enableTooltip?: boolean
}

const AreaChart: React.FC<AreaChartProps> = ({
  data,
  height = 500,
  className = '',
  enableTooltip = true
}) => {
  const chartOptions = useMemo(() => {
    // Handle empty data
    if (!data || !data.areas || data.areas.length === 0) {
      return {
        title: { text: 'No data available' },
        series: [],
        plotOptions: {}
      }
    }

    // Convert areas to series
    const xAxisType = data.chartDef?.xAxis?.type || undefined
    const series = data.areas.map((area: any, index: number) =>
      convertAreaToSeries(area, index, xAxisType)
    )

    // Get stacking configuration
    const stacking = getStackingConfig(data.stacked || false, data.stackType || undefined)

    // Custom plot options for area charts
    const customOptions = {
      plotOptions: {
        area: {
          stacking,
          lineColor: undefined,
          lineWidth: 2,
          marker: {
            enabled: false,
            radius: 3,
            states: {
              hover: {
                enabled: true,
                radius: 5
              }
            }
          },
          states: {
            hover: {
              lineWidth: 3
            }
          }
        },
        series: {
          animation: false
        }
      },
      series
    }

    return customOptions
  }, [data])

  // Use the common hook for base options
  const baseOptions = useChartOptions({
    chartDef: data?.chartDef || undefined,
    chartType: 'area',
    height,
    enableZoom: true,
    zoomType: 'x',
    enableTooltip,
    seriesCount: chartOptions.series?.length || 0,
    // Plot bands and straight lines not in AreaDef proto
    xPlotBands: undefined,
    yPlotBands: undefined,
    straightLines: undefined
  })

  // Merge base options with chart-specific options
  const finalOptions = useMemo(() => ({
    ...baseOptions,
    ...chartOptions,
    xAxis: baseOptions.xAxis,  // Keep xAxis from baseOptions
    yAxis: baseOptions.yAxis,  // Keep yAxis from baseOptions
    plotOptions: {
      ...baseOptions.plotOptions,
      ...chartOptions.plotOptions
    }
  }), [baseOptions, chartOptions])

  // Use a unique key based on chart ID to force re-render when switching charts
  const chartKey = data?.chartDef?.id || `area-chart-${JSON.stringify(data?.chartDef?.title || '')}`

  return (
    <div className={`w-full ${className}`}>
      <HighchartsReact
        key={chartKey}
        highcharts={Highcharts}
        options={finalOptions}
        immutable={true}
      />
    </div>
  )
}

export default AreaChart