'use client'

import React, { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import XRangeModule from 'highcharts/modules/xrange'
import { XRangeDef } from '../../types/proto'
import { useChartOptions } from '../../hooks/useChartOptions'
import { getChartColor } from '../../utils/protoToHighcharts'
import { DASHBOARD_THEME } from '../../constants'

// Initialize Highcharts module safely for SSR
if (typeof Highcharts !== 'undefined' && typeof window !== 'undefined') {
  XRangeModule(Highcharts)
}

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

    // Use position colors from theme

    // Create series data
    const series = [{
      name: 'X-Range Data',
      type: 'xrange' as const,
      data: (data.points || []).map((point: any) => {
        // Base color with reduced opacity for professional appearance
        const baseColor = point.isLong !== undefined
          ? (point.isLong ? DASHBOARD_THEME.position.long : DASHBOARD_THEME.position.short)
          : (point.color || getChartColor(point.y || 0))

        // Convert hex color to rgba with 0.7 opacity
        const getRgbaColor = (hex: string, opacity: number = 0.7) => {
          const r = parseInt(hex.slice(1, 3), 16)
          const g = parseInt(hex.slice(3, 5), 16)
          const b = parseInt(hex.slice(5, 7), 16)
          return `rgba(${r}, ${g}, ${b}, ${opacity})`
        }

        return {
          x: point.x,
          x2: point.x2,
          y: point.y,
          color: getRgbaColor(baseColor, 0.65),
          partialFill: point.partialFill
            ? {
                fill: point.partialFillColor || '#FFD93D',
                amount: point.partialFill
              }
            : undefined
        }
      }),
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
    chartDef: data?.chartDef || undefined,
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