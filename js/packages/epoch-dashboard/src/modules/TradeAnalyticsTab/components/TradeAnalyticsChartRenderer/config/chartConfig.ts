import { Options, YAxisOptions, XAxisOptions, TooltipOptions, AnnotationsOptions } from 'highcharts'
import { SeriesConfigResult } from './seriesConfig'
import { tailwindColors } from '../../../../../utils/tailwindHelpers'
import { IRoundTrip } from '../../../../../types/TradeAnalyticsTypes'

interface BuildChartConfigParams {
  yAxes: YAxisOptions[]
  xAxis: XAxisOptions
  tooltip: TooltipOptions
  seriesConfigResult: SeriesConfigResult | null
  height: number
  width: number
  selectedTimeframe: string
  selectedRoundTrips: IRoundTrip[]
  initialDisplayBars: number
  wheelZoomMode: 'default' | 'cursor'
  highchartsTheme: any
}

/**
 * Compose final Highcharts chart configuration
 * Brings together all config pieces into a complete Options object
 */
export const buildChartConfig = ({
  yAxes,
  xAxis,
  tooltip,
  seriesConfigResult,
  height,
  width,
  selectedTimeframe,
  selectedRoundTrips,
  initialDisplayBars,
  wheelZoomMode,
  highchartsTheme,
}: BuildChartConfigParams): Options | undefined => {
  if (!seriesConfigResult) {
    return undefined
  }

  try {
    const { series, plotBands, annotations } = seriesConfigResult

    // Data grouping configuration
    const isIntraday = /^[0-9]+(Min|m|H|h)$/i.test(selectedTimeframe)
    const isHourly = /^[0-9]+(H|h)$/i.test(selectedTimeframe)
    const isMinute = /^[0-9]+(Min|m)$/i.test(selectedTimeframe)

    let dataGroupingUnits: any[] = []
    if (isMinute) {
      dataGroupingUnits = [
        ['minute', [1, 2, 5, 10, 15, 30]],
        ['hour', [1, 2, 3, 4, 6, 8, 12]],
        ['day', [1]],
        ['week', [1]],
        ['month', [1]],
      ]
    } else if (isHourly) {
      dataGroupingUnits = [
        ['hour', [1, 2, 3, 4, 6, 8, 12]],
        ['day', [1]],
        ['week', [1]],
        ['month', [1, 3, 6]],
      ]
    }

    return {
      accessibility: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      chart: {
        backgroundColor: 'transparent',
        animation: false,
        zooming: {
          mouseWheel: {
            enabled: wheelZoomMode === 'default',
            type: 'x',
            sensitivity: 1.5,
          },
        },
        panning: {
          enabled: true,
          type: 'x',
        },
        panKey: 'shift',
        height: height || undefined,
        width: width || undefined,
        marginLeft: 0,
        marginRight: 120,
        marginBottom: 40,
        events: {
          load() {
            const chart = this

            // Disable initial animation
            try {
              if (chart.series && Array.isArray(chart.series) && chart.series.length > 0) {
                chart.series.forEach((seriesItem) => {
                  if (seriesItem && typeof seriesItem === 'object') {
                    try {
                      ;(seriesItem as any).options.animation = false
                    } catch (error) {
                      // Silently skip
                    }
                  }
                })
              }
            } catch (error) {
              // Silently handle errors
            }

            // Apply initial zoom to show only last N bars
            try {
              if (
                !selectedRoundTrips.length &&
                chart &&
                chart.xAxis &&
                Array.isArray(chart.xAxis) &&
                chart.xAxis[0]
              ) {
                const chartXAxis = chart.xAxis[0] as any

                // Get timestamps from first series
                let allTimes: number[] = []
                if (chart.series && chart.series.length > 0) {
                  const firstSeries = chart.series[0] as any

                  if (firstSeries.xData && firstSeries.xData.length > 0) {
                    allTimes = firstSeries.xData as number[]
                  } else if (firstSeries.options && firstSeries.options.data) {
                    const seriesData = firstSeries.options.data as any[]
                    allTimes = seriesData
                      .map((point: any) => {
                        if (Array.isArray(point)) {
                          return point[0]
                        } else if (point && typeof point === 'object' && 'x' in point) {
                          return point.x
                        }
                        return 0
                      })
                      .filter((t: number) => t > 0)
                  }
                }

                if (allTimes && allTimes.length > 1) {
                  const validTimes = allTimes.filter((t) => t > 0).sort((a, b) => a - b)
                  const barsToShow = Math.min(initialDisplayBars, validTimes.length)
                  const startIdx = Math.max(0, validTimes.length - barsToShow)
                  const endIdx = validTimes.length - 1

                  chartXAxis.setExtremes(validTimes[startIdx], validTimes[endIdx], false, false)
                }
              }
            } catch (error) {
              // Silently handle zoom errors
            }

            chart.redraw(false)
          },
        },
        reflow: true,
      },
      navigator: {
        enabled: false,
      },
      scrollbar: {
        enabled: false,
      },
      title: {
        text: '',
      },
      xAxis,
      yAxis: yAxes,
      tooltip,
      plotOptions: {
        candlestick: {
          upColor: tailwindColors.territory.success,
          upLineColor: tailwindColors.territory.success,
          color: tailwindColors.secondary.red,
          lineColor: tailwindColors.secondary.red,
          dataLabels: { enabled: false },
          enableMouseTracking: true,
          animation: false,
        },
        column: {
          animation: false,
          zones: [
            {
              value: 0,
              color: 'transparent',
            },
            {
              color: tailwindColors.territory.success,
            },
          ],
        },
        scatter: {
          animation: false,
          enableMouseTracking: true,
          states: {
            hover: {
              enabled: true,
            },
          },
        },
        flags: {
          animation: false,
          // Flags need mouse tracking for tooltip, but no visual interaction feedback
          enableMouseTracking: true,
          allowPointSelect: false,
          cursor: 'default',
          states: {
            hover: {
              enabled: false, // No visual hover effect
            },
          },
        },
        line: {
          animation: false,
          enableMouseTracking: true,
          states: {
            hover: {
              enabled: true,
            },
          },
          marker: {
            enabled: false,
          },
        },
        series: {
          animation: false,
          dataGrouping: {
            enabled: isIntraday,
            forced: isIntraday,
            units: dataGroupingUnits,
          },
          states: {
            inactive: {
              enabled: false,
            },
          },
          turboThreshold: 5000,
        },
      },
      series,
      annotations: annotations.map((annotation) => ({
        ...annotation,
        draggable: '',
        zIndex: typeof annotation.zIndex === 'number' ? annotation.zIndex : 7,
        labelOptions: {
          ...(annotation.labelOptions || {}),
          allowOverlap: true,
        },
      })),
      credits: {
        enabled: false,
      },
      loading: {
        labelStyle: {
          color: '#e0e0e0',
        },
        style: {
          backgroundColor: 'rgba(33, 33, 33, 0.85)',
        },
      },
    } as Options
  } catch (error) {
    console.error('Error creating chart options:', error)
    return undefined
  }
}
