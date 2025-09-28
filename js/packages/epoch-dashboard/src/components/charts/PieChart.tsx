'use client'

import React, { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { PieDef } from '../../types/proto'
import { useChartOptions } from '../../hooks/useChartOptions'
import { convertPieDataToSeries } from '../../utils/protoToHighcharts'

interface PieChartProps {
  data: PieDef
  height?: number
  className?: string
  enableTooltip?: boolean
}

const PieChart: React.FC<PieChartProps> = ({
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
        plotOptions: {},
        legend: {},
        tooltip: {}
      }
    }

    // Convert pie data to series
    const series = data.data.map((pieDataDef: any, seriesIndex: number) =>
      convertPieDataToSeries(pieDataDef, seriesIndex)
    )

    // Custom plot options for pie charts
    const customOptions = {
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          borderWidth: 2,
          borderColor: '#2D2D2D',
          showInLegend: true,
          states: {
            hover: {
              halo: {
                size: 10,
                opacity: 0.25
              }
            }
          }
        }
      },
      series,
      legend: {
        enabled: true,
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'bottom',
        itemMarginTop: 10,
        itemStyle: {
          color: '#FFFFFF',
          fontSize: '12px'
        },
        itemHoverStyle: {
          color: '#1E88E5'
        }
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b><br/>Value: <b>{point.y}</b>'
      }
    }

    return customOptions
  }, [data])

  // Use the common hook for base options
  const baseOptions = useChartOptions({
    chartDef: data?.chartDef || undefined,
    chartType: 'pie',
    height,
    enableZoom: false,  // Pie charts don't need zoom
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
    },
    legend: {
      ...baseOptions.legend,
      ...chartOptions.legend
    },
    tooltip: {
      ...baseOptions.tooltip,
      ...chartOptions.tooltip
    }
  }), [baseOptions, chartOptions])

  const chartKey = data?.chartDef?.id || `pie-chart-${JSON.stringify(data?.chartDef?.title || '')}`

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

export default PieChart