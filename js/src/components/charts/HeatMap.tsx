'use client'

import React, { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { HeatMapDef } from '../../types/proto'
import { useChartOptions } from '../../hooks/useChartOptions'
import { HEATMAP_COLOR_CONFIG } from '../../utils/chartHelpers'

interface HeatMapProps {
  data: HeatMapDef
  height?: number
  className?: string
  enableTooltip?: boolean
}

const HeatMap: React.FC<HeatMapProps> = ({
  data,
  height = 500,
  className = '',
  enableTooltip = true
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
    let colorMin = data.colorAxis?.min ?? calculatedMin
    let colorMax = data.colorAxis?.max ?? calculatedMax

    if (shouldUseSymmetricRange && !data.colorAxis?.min && !data.colorAxis?.max) {
      const maxAbsValue = Math.max(Math.abs(calculatedMin), Math.abs(calculatedMax))
      colorMin = -maxAbsValue
      colorMax = maxAbsValue
    }

    // Process heatmap data
    const heatmapData = data.points.map((point: any) => ({
      x: point.x,
      y: point.y,
      value: point.value,
      color: point.color
    }))

    const series = [{
      type: 'heatmap',
      name: 'Heat Map',
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.3)',
      data: heatmapData,
      dataLabels: {
        enabled: false
      },
      turboThreshold: Number.MAX_VALUE
    }]

    // Custom options for heatmap
    const customOptions = {
      chart: {
        type: 'heatmap',
        marginTop: 40,
        marginBottom: 80,
        plotBorderWidth: 1,
        plotBorderColor: 'rgba(255, 255, 255, 0.1)'
      },
      xAxis: {
        categories: xCategories,
        opposite: false
      },
      yAxis: {
        categories: yCategories,
        reversed: true
      },
      colorAxis: {
        min: colorMin,
        max: colorMax,
        stops: data.colorAxis?.stops || HEATMAP_COLOR_CONFIG,
        labels: {
          style: {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px'
          }
        }
      },
      series,
      plotOptions: {
        heatmap: {
          nullColor: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }

    return customOptions
  }, [data])

  // Use the common hook for base options
  const baseOptions = useChartOptions({
    chartDef: data?.chartDef,
    chartType: 'heatmap',
    height,
    enableZoom: false,
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
    xAxis: {
      ...baseOptions.xAxis,
      ...chartOptions.xAxis
    },
    yAxis: {
      ...baseOptions.yAxis,
      ...chartOptions.yAxis
    },
    colorAxis: chartOptions.colorAxis,
    plotOptions: {
      ...baseOptions.plotOptions,
      ...chartOptions.plotOptions
    }
  }), [baseOptions, chartOptions])

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