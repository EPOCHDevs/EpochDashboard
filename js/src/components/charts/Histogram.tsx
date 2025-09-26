'use client'

import React, { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { HistogramDef } from '../../types/proto'
import { useChartOptions } from '../../hooks/useChartOptions'
import { getChartColor } from '../../utils/protoToHighcharts'

interface HistogramProps {
  data: HistogramDef
  height?: number
  className?: string
  zoomType?: 'x' | 'y' | 'xy' | false
  enablePanning?: boolean
  enableTooltip?: boolean
}

const Histogram: React.FC<HistogramProps> = ({
  data,
  height = 500,
  className = '',
  zoomType = 'x',
  enablePanning = true,
  enableTooltip = true
}) => {
  const chartOptions = useMemo(() => {
    // Handle empty data
    if (!data || !data.data || data.data.length === 0) {
      return {
        title: { text: 'No data available' },
        series: [],
        plotOptions: {},
        chart: {}
      }
    }

    // Get the raw data values
    const rawData = data.data[0]?.values || []
    const numericData = rawData.filter((val: number) => !isNaN(val) && isFinite(val))

    // Create series using Highcharts native histogram
    const series: Highcharts.SeriesOptionsType[] = [
      {
        type: 'histogram',
        baseSeries: 'data',
        binsNumber: data.binsCount || 12,
        zIndex: 1,
        name: data.data[0]?.name || 'Histogram',
        color: getChartColor(0),
        borderColor: '#00D9FF',
        borderWidth: 1
      } as any,
      {
        type: 'scatter',
        id: 'data',
        visible: false,
        showInLegend: false,
        data: numericData.map((val: number) => [val, 0])
      } as any
    ]

    // Add baseline if specified
    if (data.showBaseline) {
      series.push({
        type: 'bellcurve',
        baseSeries: 'data',
        zIndex: 2,
        name: 'Bell Curve',
        color: 'rgba(255, 217, 61, 0.7)',
        lineWidth: 2,
        marker: {
          enabled: false
        }
      } as any)
    }

    // Custom plot options for histogram
    const customOptions = {
      chart: {
        type: 'histogram',
        zoomType: zoomType || undefined,
        panning: {
          enabled: enablePanning,
          type: zoomType || 'x'
        },
        panKey: 'shift'
      },
      plotOptions: {
        histogram: {
          accessibility: {
            pointDescriptionFormatter: function(point: any) {
              const ix = point.index + 1
              const x1 = point.x.toFixed(3)
              const x2 = point.x2.toFixed(3)
              const y = point.y
              return `${ix}. ${x1} to ${x2}, ${y}.`
            }
          },
          groupPadding: 0,
          grouping: false,
          pointPadding: 0,
          borderWidth: 0
        }
      },
      series
    }

    return customOptions
  }, [data, zoomType, enablePanning])

  // Use the common hook for base options
  const baseOptions = useChartOptions({
    chartDef: data?.chartDef,
    chartType: 'histogram',
    height,
    enableZoom: zoomType !== false,
    zoomType: zoomType || 'x',
    enableTooltip,
    seriesCount: chartOptions.series?.length || 0
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

  const chartKey = data?.chartDef?.id || `histogram-${JSON.stringify(data?.chartDef?.title || '')}`

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

export default Histogram