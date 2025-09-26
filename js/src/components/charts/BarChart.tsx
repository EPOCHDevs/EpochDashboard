'use client'

import React, { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { BarDef } from '../../types/proto'
import { useChartOptions } from '../../hooks/useChartOptions'
import { convertBarDataToSeries, getStackingConfig } from '../../utils/protoToHighcharts'

interface BarChartProps {
  data: BarDef
  height?: number
  className?: string
  enableTooltip?: boolean
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 500,
  className = '',
  enableTooltip = true
}) => {
  const chartOptions = useMemo(() => {
    // Handle empty data
    if (!data || !data.data || data.data.length === 0) {
      return {
        title: { text: 'No data available' },
        series: [],
        plotOptions: {}
      }
    }

    const isVertical = data.vertical !== false  // Default to vertical (column chart)
    const chartType = isVertical ? 'column' : 'bar'

    // Convert bar data to series
    const series = data.data.map((dataset: any, index: number) => {
      const seriesData = convertBarDataToSeries(dataset, index, chartType as 'column' | 'bar')
      if (data.barWidth) {
        seriesData.pointWidth = data.barWidth
      }
      return seriesData
    })

    // Get stacking configuration
    const stacking = getStackingConfig(data.stacked, data.stackType)

    // Custom plot options for bar charts
    const customOptions = {
      plotOptions: {
        column: {
          borderWidth: 0,
          borderRadius: 2,
          groupPadding: 0.1,
          pointPadding: 0.05,
          stacking
        },
        bar: {
          borderWidth: 0,
          borderRadius: 2,
          groupPadding: 0.1,
          pointPadding: 0.05,
          stacking
        },
        series: {
          dataLabels: {
            enabled: false
          },
          animation: false
        }
      },
      series
    }

    return { chartType, customOptions }
  }, [data])

  // Use the common hook for base options
  const baseOptions = useChartOptions({
    chartDef: data?.chartDef,
    chartType: chartOptions.chartType || 'column',
    height,
    enableZoom: false,  // Bar charts typically don't need zoom
    enableTooltip,
    seriesCount: chartOptions.customOptions?.series?.length || 0,
    straightLines: data?.straightLines
  })

  // Merge base options with chart-specific options
  const finalOptions = useMemo(() => ({
    ...baseOptions,
    ...(chartOptions.customOptions || {}),
    chart: {
      ...baseOptions.chart,
      type: chartOptions.chartType || 'column'
    },
    plotOptions: {
      ...baseOptions.plotOptions,
      ...(chartOptions.customOptions?.plotOptions || {})
    }
  }), [baseOptions, chartOptions])

  // Use a unique key based on chart ID to force re-render when switching charts
  const chartKey = data?.chartDef?.id || `bar-chart-${JSON.stringify(data?.chartDef?.title || '')}`

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

export default BarChart