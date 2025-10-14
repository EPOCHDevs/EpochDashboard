'use client'

import React, { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { PieDef } from '../../types/proto'
import { useChartOptions } from '../../hooks/useChartOptions'
import { convertPieDataToSeries } from '../../utils/protoToHighcharts'
import { generateColorPalette } from '../../utils/colorPalette'

interface PieChartProps {
  data: PieDef
  height?: number
  className?: string
  enableTooltip?: boolean
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 600, // Increased from 500 to 600 for better visibility
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
        tooltip: {},
        colors: [],
        chart: {}
      }
    }

    // Convert pie data to series
    const series = data.data.map((pieDataDef: any, seriesIndex: number) =>
      convertPieDataToSeries(pieDataDef, seriesIndex)
    )

    // Calculate total number of points across all series for color palette
    const totalPoints = series.reduce((acc, s) => acc + (s.data?.length || 0), 0)

    // Generate beautiful color palette for all points
    const colors = generateColorPalette(Math.max(totalPoints, 50))

    // Apply colors directly to data points to ensure full opacity
    series.forEach((s, seriesIdx) => {
      if (s.data && Array.isArray(s.data)) {
        s.data = s.data.map((point: any, pointIdx: number) => {
          const colorIndex = seriesIdx * 100 + pointIdx // Ensure unique color per point
          return {
            ...point,
            color: colors[colorIndex % colors.length],
            opacity: 1,
            fillOpacity: 1
          }
        })
      }
    })

    // Determine if we should show legend (hide for 100+ items to avoid clutter)
    const showLegend = totalPoints <= 100

    // Custom plot options for pie charts
    const customOptions = {
      colors, // Apply our beautiful color palette
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          borderWidth: 0, // Remove border for more vibrant look
          borderColor: 'none',
          showInLegend: showLegend,
          size: showLegend ? '75%' : '80%', // Adjust size based on legend visibility
          center: showLegend ? ['40%', '50%'] : ['50%', '50%'], // Center properly with/without legend
          innerSize: totalPoints > 20 ? '40%' : '0%', // Donut style for many items
          opacity: 1, // Full opacity for vibrant colors
          fillOpacity: 1, // Ensure no transparency
          dataLabels: {
            enabled: totalPoints <= 30, // Only show labels for <= 30 items
            distance: 15,
            format: '<b>{point.name}</b>: {point.percentage:.1f}%',
            style: {
              fontSize: '11px',
              fontWeight: 'bold',
              textOutline: '1px contrast',
              color: '#FFFFFF'
            }
          },
          states: {
            hover: {
              halo: {
                size: 0 // Remove halo effect
              },
              brightness: 0.2, // Brighter on hover
              opacity: 1
            },
            inactive: {
              opacity: 1, // Keep full opacity even when other slices are selected
              brightness: 0 // No dimming
            },
            normal: {
              opacity: 1
            }
          }
        }
      },
      series,
      chart: {
        // Center the pie chart properly
        marginTop: 20,
        marginBottom: 20,
        spacingTop: 10,
        spacingBottom: 10,
      },
      legend: {
        enabled: showLegend,
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        itemMarginTop: 4,
        itemMarginBottom: 4,
        maxHeight: height - 100, // Prevent legend from overflowing
        width: showLegend && totalPoints <= 100 ? '30%' : undefined, // Give legend fixed width
        navigation: {
          enabled: true, // Enable pagination for large legends
          activeColor: '#1E88E5',
          inactiveColor: '#888888'
        },
        itemStyle: {
          color: '#CCCCCC',
          fontSize: '11px',
          fontWeight: 'normal'
        },
        itemHoverStyle: {
          color: '#FFFFFF'
        }
      },
      tooltip: {
        headerFormat: '<span style="font-size: 11px">{series.name}</span><br/>',
        pointFormat: '<b>{point.name}</b>: {point.percentage:.2f}%<br/>Value: <b>{point.y:,.0f}</b>',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: '#666666',
        borderRadius: 8,
        style: {
          color: '#FFFFFF',
          fontSize: '12px'
        }
      }
    }

    return customOptions
  }, [data, height])

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
  // IMPORTANT: Use explicit overrides for nested objects to ensure our vibrant colors and opacity settings take precedence
  const finalOptions = useMemo(() => {
    const basePlotOptions = baseOptions.plotOptions || {}
    const chartPlotOptions = chartOptions.plotOptions || {}

    return {
      ...baseOptions,
      ...chartOptions,
      chart: {
        ...baseOptions.chart,
        ...chartOptions.chart, // Apply centering and spacing
      },
      plotOptions: {
        ...basePlotOptions,
        ...chartPlotOptions,
        // Explicitly deep merge pie settings to ensure our vibrant colors and opacity settings take precedence
        pie: {
          ...(basePlotOptions as any)?.pie,
          ...(chartPlotOptions as any)?.pie
        }
      },
      legend: {
        ...baseOptions.legend,
        ...chartOptions.legend
      },
      tooltip: {
        ...baseOptions.tooltip,
        ...chartOptions.tooltip
      },
      // Apply vibrant colors LAST to ensure they override any defaults
      colors: chartOptions.colors
    }
  }, [baseOptions, chartOptions])

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