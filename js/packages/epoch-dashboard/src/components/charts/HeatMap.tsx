'use client'

import React, { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HeatmapModule from 'highcharts/modules/heatmap'
import { HeatMapDef } from '../../types/proto'
import { DASHBOARD_THEME } from '../../constants'

// Initialize Highcharts module safely for SSR
if (typeof Highcharts !== 'undefined' && typeof window !== 'undefined') {
  HeatmapModule(Highcharts)
}

interface HeatMapProps {
  data: HeatMapDef
  height?: number
  className?: string
}

const HeatMap: React.FC<HeatMapProps> = ({
  data,
  height = 500,
  className = ''
}) => {
  const chartOptions = useMemo(() => {
    // Handle empty data
    if (!data || !data.points || data.points.length === 0) {
      return {
        title: { text: 'No data available' },
        series: [],
        plotOptions: {},
        chart: {},
        xAxis: {},
        yAxis: {},
        colorAxis: {}
      }
    }

    // Get categories
    const xCategories = data.chartDef?.xAxis?.categories || []
    const yCategories = data.chartDef?.yAxis?.categories || []

    // Calculate min/max from data if not provided
    const dataValues = data.points.map((point: any) => point.value).filter((v: any) => v !== null && !isNaN(v))
    const calculatedMin = dataValues.length > 0 ? Math.min(...dataValues) : 0
    const calculatedMax = dataValues.length > 0 ? Math.max(...dataValues) : 100

    // For better color representation, use symmetric range when data spans positive and negative
    const shouldUseSymmetricRange = calculatedMin < 0 && calculatedMax > 0
    // colorAxis not in HeatMapDef proto, use calculated values
    let colorMin = calculatedMin
    let colorMax = calculatedMax

    if (shouldUseSymmetricRange) {
      const maxAbsValue = Math.max(Math.abs(calculatedMin), Math.abs(calculatedMax))
      colorMin = -maxAbsValue
      colorMax = maxAbsValue
    }

    // Process heatmap data - use array format [x, y, value]
    const heatmapData = data.points.map((point: any) => [
      Number(point.x),
      Number(point.y),
      Number(point.value)
    ])


    const series: Highcharts.SeriesOptionsType[] = [{
      type: 'heatmap',
      name: 'Heat Map',
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.3)',
      data: heatmapData,
      colsize: 1,
      rowsize: 1,
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '11px',
          fontWeight: 'bold',
          textOutline: 'none',
          textShadow: 'none'
        },
        formatter: function(this: any) {
          // Dynamic color based on background intensity
          const value = this.point.value || 0
          const min = this.series.colorAxis.min
          const max = this.series.colorAxis.max
          const normalizedValue = (value - min) / (max - min)
          // Use white text for dark/red backgrounds (low values), black for light/green backgrounds (high values)
          const textColor = normalizedValue < 0.5 ? '#FFFFFF' : '#000000'
          return `<span style="color: ${textColor}">${Math.round(value)}</span>`
        }
      },
      turboThreshold: Number.MAX_VALUE
    } as any]

    // Custom options for heatmap
    const customOptions = {
      chart: {
        type: 'heatmap',
        marginTop: 40,
        marginBottom: 80,
        marginRight: 140, // Make room for color axis legend
        plotBorderWidth: 1,
        plotBorderColor: 'rgba(255, 255, 255, 0.1)'
      },
      xAxis: {
        categories: xCategories,
        opposite: false,
        labels: {
          style: {
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '12px',
            fontWeight: '500'
          }
        },
        title: {
          style: {
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px',
            fontWeight: '500'
          }
        }
      },
      yAxis: {
        categories: yCategories,
        reversed: true,
        labels: {
          style: {
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '12px',
            fontWeight: '500'
          }
        },
        title: {
          style: {
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px',
            fontWeight: '500'
          }
        }
      },
      colorAxis: {
        min: colorMin,
        max: colorMax,
        stops: [
          [0.0, DASHBOARD_THEME.position.short], // Bright red
          [0.1, '#C9355D'], // Red
          [0.2, '#9C2E4E'], // Dark red
          [0.3, '#702740'], // Darker red
          [0.4, '#432031'], // Very dark red
          [0.5, '#161923'], // Dark neutral
          [0.6, '#124724'], // Dark green
          [0.7, '#0D7526'], // Green
          [0.8, '#09A227'], // Bright green
          [0.9, '#04D029'], // Brighter green
          [1.0, DASHBOARD_THEME.position.long]  // Bright green
        ] as [number, string][],
        labels: {
          style: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px'
          }
        },
        gridLineColor: 'transparent'
      },
      series,
      plotOptions: {
        heatmap: {
          nullColor: 'rgba(0, 0, 0, 0.1)'
        }
      },
      legend: {
        align: 'right',
        layout: 'vertical',
        margin: 0,
        verticalAlign: 'middle',
        symbolHeight: 280
      }
    }

    return customOptions
  }, [data])

  // Don't use the common hook that might override our colorAxis
  // Just use our custom options directly
  const finalOptions = useMemo(() => ({
    ...chartOptions,
    title: {
      text: data?.chartDef?.title || '',
      style: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: '16px'
      }
    },
    credits: { enabled: false },
    chart: {
      ...chartOptions.chart,
      height,
      backgroundColor: 'transparent'
    }
  }), [chartOptions, data, height])

  const chartKey = data?.chartDef?.id || `heatmap-${JSON.stringify(data?.chartDef?.title || '')}`

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

export default HeatMap