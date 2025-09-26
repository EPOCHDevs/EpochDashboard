'use client'

import React, { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { BoxPlotDef } from '../../types/proto'
import { useChartOptions } from '../../hooks/useChartOptions'
import { getChartColor } from '../../utils/protoToHighcharts'

interface BoxPlotProps {
  data: BoxPlotDef
  height?: number
  className?: string
  enableTooltip?: boolean
}

const BoxPlot: React.FC<BoxPlotProps> = ({
  data,
  height = 500,
  className = '',
  enableTooltip = true
}) => {
  const chartOptions = useMemo(() => {
    // Handle empty data
    if (!data || !data.data?.points || data.data.points.length === 0) {
      return {
        title: { text: 'No data available' },
        series: [],
        plotOptions: {}
      }
    }

    // Create box plot series data
    const boxPlotData = (data.data?.points || []).map((point: any) => [
      point.low,
      point.q1,
      point.median,
      point.q3,
      point.high
    ])

    // Create outlier series if any
    const outlierData: any[] = []
    if (data.data?.outliers && data.data.outliers.length > 0) {
      data.data.outliers.forEach((outlier: any) => {
        outlierData.push([outlier.x, outlier.y])
      })
    }

    const series: any[] = [
      {
        name: data.data?.name || 'Box Plot',
        type: 'boxplot',
        data: boxPlotData,
        color: getChartColor(0),
        fillColor: 'rgba(0, 217, 255, 0.1)',
        lineWidth: 2,
        medianWidth: 3,
        stemWidth: 1,
        whiskerLength: '75%'
      }
    ]

    // Add outliers series if exists
    if (outlierData.length > 0) {
      series.push({
        name: 'Outliers',
        type: 'scatter',
        data: outlierData,
        color: 'rgba(255, 107, 107, 0.8)',
        marker: {
          radius: 4,
          symbol: 'circle'
        }
      })
    }

    // Custom plot options for boxplot
    const customOptions = {
      plotOptions: {
        boxplot: {
          fillColor: 'rgba(0, 217, 255, 0.1)',
          lineWidth: 2,
          medianColor: '#FFD93D',
          medianWidth: 3,
          stemColor: '#00D9FF',
          stemDashStyle: 'solid',
          stemWidth: 1,
          whiskerColor: '#00D9FF',
          whiskerLength: '75%',
          whiskerWidth: 2
        }
      },
      series
    }

    return customOptions
  }, [data])

  // Use the common hook for base options
  const baseOptions = useChartOptions({
    chartDef: data?.chartDef,
    chartType: 'boxplot',
    height,
    enableZoom: false,
    enableTooltip,
    seriesCount: chartOptions.series?.length || 0
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

  const chartKey = data?.chartDef?.id || `boxplot-${JSON.stringify(data?.chartDef?.title || '')}`

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

export default BoxPlot