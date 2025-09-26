'use client'

import React, { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { XRangeDef } from '../../types/proto'
import { useChartOptions } from '../../hooks/useChartOptions'
import { getChartColor } from '../../utils/protoToHighcharts'

interface XRangeChartProps {
  data: XRangeDef
  height?: number
  className?: string
  zoomType?: 'x' | 'y' | 'xy' | false
  enablePanning?: boolean
  enableTooltip?: boolean
}

const XRangeChart: React.FC<XRangeChartProps> = ({
  data,
  height = 500,
  className = '',
  zoomType = 'x',
  enablePanning = true,
  enableTooltip = true
}) => {
  const chartOptions = useMemo(() => {
    // Handle empty data
    if (!data || !data.points || data.points.length === 0) {
      return {
        title: { text: 'No data available' },
        series: [],
        plotOptions: {},
        chart: {}
      }
    }

    // Create series data
    const series = [{
      name: 'X-Range Data',
      type: 'xrange' as const,
      data: (data.points || []).map((point: any) => ({
        x: point.x,
        x2: point.x2,
        y: point.y,
        color: point.color || getChartColor(point.y || 0),
        partialFill: point.partialFill
          ? {
              fill: point.partialFillColor || '#FFD93D',
              amount: point.partialFill
            }
          : undefined
      })),
      dataLabels: {
        enabled: false
      },
      borderRadius: 3,
      borderWidth: 0
    }]

    // Custom options for x-range chart
    const customOptions = {
      chart: {
        type: 'xrange',
        zoomType: zoomType || undefined,
        panning: {
          enabled: enablePanning,
          type: zoomType || 'x'
        },
        panKey: 'shift'
      },
      plotOptions: {
        xrange: {
          borderRadius: 3,
          borderWidth: 0,
          grouping: false,
          dataLabels: {
            enabled: false
          },
          colorByPoint: false,
          colors: undefined
        }
      },
      series
    }

    return customOptions
  }, [data, zoomType, enablePanning])

  // Use the common hook for base options
  const baseOptions = useChartOptions({
    chartDef: data?.chartDef,
    chartType: 'xrange',
    height,
    enableZoom: zoomType !== false,
    zoomType: zoomType || 'x',
    enableTooltip,
    seriesCount: 1
  })

  // Merge base options with chart-specific options
  const finalOptions = useMemo(() => ({
    ...baseOptions,
    ...chartOptions,
    chart: {
      ...baseOptions.chart,
      ...chartOptions.chart
    },
    plotOptions: {
      ...baseOptions.plotOptions,
      ...chartOptions.plotOptions
    }
  }), [baseOptions, chartOptions])

  const chartKey = data?.chartDef?.id || `xrange-chart-${JSON.stringify(data?.chartDef?.title || '')}`

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

export default XRangeChart