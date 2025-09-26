'use client'

import React, { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { LinesDef } from '../../types/proto'
import { useChartOptions } from '../../hooks/useChartOptions'
import { convertLineToSeries, getStackingConfig } from '../../utils/protoToHighcharts'

interface LineChartProps {
  data: LinesDef
  height?: number
  className?: string
  enableTooltip?: boolean
}

const LineChart: React.FC<LineChartProps> = ({
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

    // Convert lines to series
    const series = data.lines.map((line: any, index: number) =>
      convertLineToSeries(line, index, data.chartDef?.xAxis?.type)
    )

    // Add overlay if exists
    if (data.overlay && data.overlay.data) {
      series.push(convertLineToSeries(
        data.overlay,
        series.length,
        data.chartDef?.xAxis?.type,
        data.overlay.name || 'Overlay'
      ))
    }

    // Get stacking configuration
    const stacking = getStackingConfig(data.stacked, data.stackType)

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
    chartDef: data?.chartDef,
    chartType: 'line',
    height,
    enableZoom: true,
    zoomType: 'x',
    enableTooltip,
    seriesCount: chartOptions.series?.length || 0,
    xPlotBands: data?.xPlotBands,
    yPlotBands: data?.yPlotBands,
    straightLines: data?.straightLines
  })

  // Merge base options with chart-specific options
  const finalOptions = useMemo(() => ({
    ...baseOptions,
    ...chartOptions,
    plotOptions: {
      ...baseOptions.plotOptions,
      ...chartOptions.plotOptions
    }
  }), [baseOptions, chartOptions])

  // Use a unique key based on chart ID to force re-render when switching charts
  const chartKey = data?.chartDef?.id || `line-chart-${JSON.stringify(data?.chartDef?.title || '')}`

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

export default LineChart