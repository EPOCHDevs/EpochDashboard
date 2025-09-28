'use client'

import React, { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HistogramModule from 'highcharts/modules/histogram-bellcurve'
import { HistogramDef } from '../../types/proto'
import { useChartOptions } from '../../hooks/useChartOptions'

// Initialize Highcharts module safely for SSR
if (typeof Highcharts !== 'undefined' && typeof window !== 'undefined') {
  HistogramModule(Highcharts)
}

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
    if (!data || !data.data || !data.data.values || data.data.values.length === 0) {
      return {
        title: { text: 'No data available' },
        series: [],
        plotOptions: {},
        chart: {}
      }
    }

    // Get the raw data values from ProtoArray - values are Scalars in proto
    const rawData = (data.data.values || []).map((scalar: any) => {
      // Extract numeric value from Scalar
      if (typeof scalar === 'number') return scalar
      return scalar?.decimalValue || scalar?.integerValue || scalar?.percentValue || 0
    })
    const numericData = rawData.filter((val: number) => !isNaN(val) && isFinite(val))

    // Create series using Highcharts native histogram
    const series: Highcharts.SeriesOptionsType[] = [
      {
        type: 'histogram',
        baseSeries: 'data',
        binsNumber: data.binsCount || undefined, // Let Highcharts auto-calculate if not specified
        zIndex: 1,
        name: 'Frequency', // Array proto doesn't have name field
        color: 'rgba(0, 217, 255, 0.7)', // Semi-transparent cyan
        borderColor: '#00D9FF',
        borderWidth: 1,
        fillOpacity: 0.7
      } as any,
      {
        type: 'scatter',
        id: 'data',
        visible: false,
        showInLegend: false,
        data: numericData // Just the raw values array, not [x,y] pairs
      } as any
    ]

    // Note: Bell curve/baseline feature not supported in proto
    // Would need to extend HistogramDef proto to add this feature

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
    chartDef: data?.chartDef || undefined,
    chartType: 'histogram',
    height,
    enableZoom: zoomType !== false,
    zoomType: zoomType || 'x',
    enableTooltip,
    seriesCount: chartOptions.series?.length || 0,
    straightLines: data?.straightLines || []
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