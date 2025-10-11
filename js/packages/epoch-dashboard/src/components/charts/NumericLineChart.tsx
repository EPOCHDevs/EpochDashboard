'use client'

import React, { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { NumericLinesDef } from '../../types/proto'
import { useChartOptions } from '../../hooks/useChartOptions'
import { convertNumericLineToSeries, getStackingConfig } from '../../utils/protoToHighcharts'

interface NumericLineChartProps {
  data: NumericLinesDef
  height?: number
  className?: string
  enableTooltip?: boolean
}

const NumericLineChart: React.FC<NumericLineChartProps> = ({
  data,
  height = 500,
  className = '',
  enableTooltip = true
}) => {
  const chartOptions = useMemo(() => {
    // Handle empty data
    if (!data || !data.lines || data.lines.length === 0) {
      return {
        title: { text: 'No data available' },
        series: [],
        plotOptions: {}
      }
    }

    // Convert numeric lines to series
    const series = data.lines.map((line: any, index: number) =>
      convertNumericLineToSeries(line, index)
    )

    // Add overlay if exists
    if (data.overlay && data.overlay.data) {
      series.push(convertNumericLineToSeries(
        data.overlay,
        series.length
      ))
    }

    // Get stacking configuration
    const stacking = getStackingConfig(data.stacked || false, undefined)

    // Custom plot options for line charts
    const customOptions = {
      plotOptions: {
        series: {
          marker: {
            enabled: false
          },
          animation: false,
          stacking
        },
        line: {
          animation: false,
          crisp: true
        }
      },
      series
    }

    return customOptions
  }, [data])

  // Use the common hook for base options
  const baseOptions = useChartOptions({
    chartDef: data?.chartDef || undefined,
    chartType: 'line',
    height,
    enableZoom: true,
    zoomType: 'xy', // Enable zoom on both axes for numeric x-axis
    enableTooltip,
    seriesCount: chartOptions.series?.length || 0,
    xPlotBands: data?.xPlotBands || undefined,
    yPlotBands: data?.yPlotBands || undefined,
    straightLines: data?.straightLines || undefined
  })

  // Merge base options with chart-specific options
  const finalOptions = useMemo(() => ({
    ...baseOptions,
    ...chartOptions,
    xAxis: baseOptions.xAxis,  // Keep xAxis from baseOptions which has plotBands
    yAxis: baseOptions.yAxis,  // Keep yAxis from baseOptions which has plotBands
    plotOptions: {
      ...baseOptions.plotOptions,
      ...chartOptions.plotOptions
    }
  }), [baseOptions, chartOptions])

  // Use a unique key based on chart ID to force re-render when switching charts
  const chartKey = data?.chartDef?.id || `numeric-line-chart-${JSON.stringify(data?.chartDef?.title || '')}`

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

export default NumericLineChart
