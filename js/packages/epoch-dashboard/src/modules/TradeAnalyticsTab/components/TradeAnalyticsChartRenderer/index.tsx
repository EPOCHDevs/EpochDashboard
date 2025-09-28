/* eslint-disable new-cap */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  GetTradeAnalyticsMetadataResponseType,
  IRoundTrip,
  PLOT_KIND,
} from "../../../../types/TradeAnalyticsTypes"
import { generatePlotElements } from "../PlotKinds/EpochPlotKindOptions"
import {
  AnnotationsOptions,
  Chart,
  SeriesFlagsOptions,
  SeriesLineOptions,
  SeriesOptionsType,
  TooltipPositionerCallbackFunction,
  XAxisPlotBandsOptions,
} from "highcharts"
import HighchartsReact from "highcharts-react-official"
import Highcharts from "highcharts/highstock"
import HighchartsMore from "highcharts/highcharts-more"
import HighchartsAnnotations from "highcharts/modules/annotations"
import HighchartsDragPanes from "highcharts/modules/drag-panes"
import { tailwindColors, tailwindTypography } from "../../../../utils/tailwindHelpers"
import { formatDollarAmount } from "../../../../utils/formatters"
import { useSmartChartData } from "./hooks/useSmartChartData"
import { DEFAULT_PADDING_CONFIGS } from "./utils/BackendPaddingUtils"
import "./styles.css"

// Initialize Highcharts modules safely for SSR
if (typeof Highcharts !== "undefined" && typeof window !== "undefined") {
  HighchartsMore(Highcharts)
  HighchartsAnnotations(Highcharts)
  HighchartsDragPanes(Highcharts)

  // Globally disable animations for instant chart appearance
  Highcharts.setOptions({
    chart: {
      animation: false,
    },
    plotOptions: {
      series: {
        animation: false,
      },
    },
  })
}

interface TradeAnalyticsChartRendererProps extends Highcharts.Options {
  isLoading?: boolean
  tradeAnalyticsMetadata?: GetTradeAnalyticsMetadataResponseType
  selectedRoundTrips?: IRoundTrip[]
  campaignId: string
  assetId: string
  fetchEntireCandleStickData?: boolean
  paddingProfile?: "MINIMAL" | "CONSERVATIVE" | "STANDARD" | "AGGRESSIVE" // Padding configuration profile
  wheelZoomMode?: "default" | "cursor" // default: Highcharts built-in; cursor: TradingView-like
  isFullScreen?: boolean
}

interface PaneState {
  id: string
  name: string
  collapsed: boolean
  height: number
  top: number
  originalHeight?: number
}

const UNHANDLED_PLOT_KINDS = [
  PLOT_KIND.ORDER_BLOCKS,
  PLOT_KIND.BOS_CHOCH,
  PLOT_KIND.FVG,
  PLOT_KIND.LIQUIDITY,
]

const TradeAnalyticsChartRenderer = ({
  isLoading = false,
  tradeAnalyticsMetadata,
  selectedRoundTrips = [],
  assetId,
  campaignId,
  fetchEntireCandleStickData = false,
  paddingProfile = "STANDARD",
  wheelZoomMode = "default",
  isFullScreen = false,
}: TradeAnalyticsChartRendererProps) => {
  const chartRef = React.useRef<HighchartsReact.RefObject>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  const [width, setWidth] = useState(0)

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        setHeight(chartContainerRef.current.clientHeight)
        setWidth(chartContainerRef.current.clientWidth)
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  const [visibleSeriesIds, setVisibleSeriesIds] = useState<string[]>([])
  const [paneStates, setPaneStates] = useState<PaneState[]>([])
  const [isChartRendered, setIsChartRendered] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("")
  const [chartKey, setChartKey] = useState<string>("")
  const [isTimeframeSwitching, setIsTimeframeSwitching] = useState(false)
  const baselineAppliedRef = useRef<string>("")

  // Initialize or reset timeframe from metadata whenever asset changes
  useEffect(() => {
    if (assetId && tradeAnalyticsMetadata?.asset_info[assetId]) {
      const defaultTf = tradeAnalyticsMetadata.asset_info[assetId].timeframes[0]
      if (!selectedTimeframe || !tradeAnalyticsMetadata.chart_info?.[selectedTimeframe]) {
        setSelectedTimeframe(defaultTf)
      }
    }
  }, [
    assetId,
    tradeAnalyticsMetadata?.asset_info,
    tradeAnalyticsMetadata?.chart_info,
    selectedTimeframe,
  ])

  // Ensure timeframe matches the selected asset; update if not present in new asset
  useEffect(() => {
    if (assetId && tradeAnalyticsMetadata?.asset_info[assetId]) {
      const tfs = tradeAnalyticsMetadata.asset_info[assetId].timeframes
      if (selectedTimeframe && !tfs.includes(selectedTimeframe)) {
        setSelectedTimeframe(tfs[0])
      }
    }
  }, [assetId, selectedTimeframe, tradeAnalyticsMetadata?.asset_info])

  // Smart data loading with caching and lazy loading
  const {
    data: tradeAnalyticsChartData,
    error: tradeAnalyticsChartDataError,
    isFetching: isFetchingTradeAnalyticsChartData,
    isLoading: isLoadingTradeAnalyticsChartData,
  } = useSmartChartData({
    strategyId: campaignId,
    assetId: assetId,
    timeframe: selectedTimeframe,
    selectedRoundTrips: selectedRoundTrips,
    enabled: Boolean(campaignId && assetId && selectedTimeframe),
    paddingConfig: DEFAULT_PADDING_CONFIGS[paddingProfile],
    fetchEntireCandleStickData: fetchEntireCandleStickData,
  })

  const selectedAssetDetails = useMemo(() => {
    if (assetId && tradeAnalyticsMetadata?.asset_info[assetId]) {
      return tradeAnalyticsMetadata.asset_info[assetId]
    }
    return undefined
  }, [assetId, tradeAnalyticsMetadata?.asset_info])

  const timeframeConfig = useMemo(() => {
    if (selectedTimeframe && tradeAnalyticsMetadata?.chart_info)
      return tradeAnalyticsMetadata.chart_info[selectedTimeframe]
    return undefined
  }, [selectedTimeframe, tradeAnalyticsMetadata])

  // Initialize pane states from timeframe config
  useEffect(() => {
    if (timeframeConfig?.yAxis) {
      setIsChartRendered(false) // Reset chart rendered state when config changes

      // Force chart cleanup when timeframe changes
      const chart = chartRef.current?.chart
      if (chart) {
        try {
          // Clear any existing extremes or zoom state
          chart.xAxis?.forEach((axis) => {
            if (axis && axis.setExtremes) {
              axis.setExtremes(undefined, undefined, false, false)
            }
          })
          chart.yAxis?.forEach((axis) => {
            if (axis && axis.setExtremes) {
              axis.setExtremes(undefined, undefined, false, false)
            }
          })
          // Reset zoom if available
          if (chart && "resetZoomButton" in chart && (chart as any).resetZoomButton) {
            ;(chart as any).resetZoomButton.destroy()
          }
        } catch (error) {
          // Silently skip cleanup errors
        }
      }

      const initialPaneStates: PaneState[] = timeframeConfig.yAxis.map((axis, index) => {
        // Try to determine pane name from series that use this yAxis
        const seriesForThisAxis = timeframeConfig.series.filter((series) => series.yAxis === index)
        let paneName = `Pane ${index + 1}`

        if (seriesForThisAxis.length > 0) {
          const firstSeries = seriesForThisAxis[0]
          if (firstSeries.type === "candlestick") {
            paneName = "Price"
          } else if (
            firstSeries.type === "column" &&
            firstSeries.name?.toLowerCase().includes("volume")
          ) {
            paneName = "Volume"
          } else if (firstSeries.name) {
            paneName = firstSeries.name
          }
        }

        return {
          id: `pane-${index}`,
          name: paneName,
          collapsed: false,
          height: axis.height,
          top: axis.top,
          originalHeight: axis.height,
        }
      })
      setPaneStates(initialPaneStates)
    }
  }, [timeframeConfig])

  // Track unimplemented series
  const unimplementedSeries = useMemo(() => {
    if (!timeframeConfig) return []

    const unimplemented: Array<{ id: string; name: string; type: string }> = []
    timeframeConfig.series.forEach((seriesConfig) => {
      if (UNHANDLED_PLOT_KINDS.includes(seriesConfig.type)) {
        unimplemented.push({
          id: seriesConfig.id,
          name: seriesConfig.name,
          type: seriesConfig.type,
        })
      }
    })
    return unimplemented
  }, [timeframeConfig])

  const chartOptions: Highcharts.Options | undefined = useMemo(() => {
    if (
      isLoading ||
      isLoadingTradeAnalyticsChartData ||
      !timeframeConfig ||
      !selectedTimeframe ||
      !tradeAnalyticsChartData ||
      !paneStates.length
    ) {
      return undefined
    }

    // Configure yAxes based on pane states with validation
    const yAxes: Highcharts.YAxisOptions[] = paneStates
      .filter((pane) => pane && typeof pane.top === "number" && typeof pane.height === "number")
      .map((pane) => ({
        top: `${Math.max(0, Math.min(100, pane.top))}%`, // Clamp between 0-100%
        height: `${Math.max(1, Math.min(100, pane.height))}%`, // Clamp between 1-100%
        offset: 0,
        labels: {
          align: "left",
          style: {
            ...tailwindTypography.desktopL14Regular.css,
            color: `${tailwindColors.primary.white}4D`,
          },
          distance: 10,
          formatter: function tooltipFormatter(this) {
            try {
              const formattedAxis = this.axis
              const isMin = this.value === formattedAxis.min

              // Get the axis position - check if this is not the first/topmost axis
              // The topmost axis (price) typically has the smallest pos value
              const axisPosition = formattedAxis.pos || 0
              const chart = formattedAxis.chart
              const allYAxisPositions = chart.yAxis.map((axis: any) => axis.pos || 0)
              const minPosition = Math.min(...allYAxisPositions)
              const isTopAxis = axisPosition === minPosition

              // For the topmost axis, show all labels
              // For other axes, hide min label to prevent overlap
              if (isMin && !isTopAxis) {
                return "" // Hide min labels for non-top axes as they overlap
              }
              return this.axis.defaultLabelFormatter.call(this)
            } catch (error) {
              return String(this.value || "")
            }
          },
        },
        title: { text: "" },
        lineWidth: 2,
        gridLineWidth: 2,
        gridLineColor: `${tailwindColors.primary.white}05`,
        gridLineDashStyle: "Solid",
        opposite: true,
        resize: {
          enabled: true,
        },
      }))

    // Create series based on metadata using our plot kind factory
    const allSeries: Array<SeriesOptionsType> = []
    const allSeriesPlotBands: XAxisPlotBandsOptions[] = []
    const allAnnotations: AnnotationsOptions[] = []

    // Add safety check for timeframeConfig.series
    if (timeframeConfig?.series && Array.isArray(timeframeConfig.series)) {
      timeframeConfig.series.forEach((seriesConfig) => {
        if (!seriesConfig || !seriesConfig.type) {
          return
        }

        if (!UNHANDLED_PLOT_KINDS.includes(seriesConfig.type)) {
          try {
            const plotElements = generatePlotElements({
              seriesConfig,
              data: tradeAnalyticsChartData,
              roundTrips: selectedRoundTrips,
            })

            if (plotElements) {
              if (
                plotElements.series &&
                Array.isArray(plotElements.series) &&
                plotElements.series.length > 0
              ) {
                plotElements.series.forEach((seriesOptions, index) => {
                  if (!seriesOptions) {
                    return
                  }

                  const options: SeriesOptionsType = { ...seriesOptions }
                  if (index === 0) {
                    // First series gets the original ID
                    options.id = seriesConfig.id
                  }
                  if (seriesConfig.linkedTo) {
                    if (seriesConfig.type === "flag") {
                      ;(options as SeriesFlagsOptions).onSeries = seriesConfig.linkedTo
                    } else {
                      ;(options as SeriesLineOptions).linkedTo = seriesConfig.linkedTo
                    }
                  }

                  allSeries.push(options)
                })
              }

              if (
                plotElements.plotBands &&
                Array.isArray(plotElements.plotBands) &&
                plotElements.plotBands.length > 0
              ) {
                allSeriesPlotBands.push(...plotElements.plotBands)
              }
              if (
                plotElements.annotations &&
                Array.isArray(plotElements.annotations) &&
                plotElements.annotations.length > 0
              ) {
                allAnnotations.push(...plotElements.annotations)
              }
            }
          } catch (error) {
            // Silently skip invalid plot elements
          }
        }
      })
    }

    // Setting default value for Series Visibility dropdown
    setVisibleSeriesIds(() => allSeries.map((series) => series.id as string))

    // Validate that we have at least some data before returning chart options
    if (allSeries.length === 0) {
      return undefined // Don't render chart with no series
    }

    // Validate yAxes configuration
    if (yAxes.length === 0) {
      return undefined
    }

    // Validate that all series have valid data (where applicable)
    const validSeries = allSeries.filter((series) => {
      // Some series types don't have data property (like annotations), so we check if it exists first
      const hasDataProperty = "data" in series
      if (hasDataProperty) {
        const seriesData = (series as { data?: unknown }).data
        if (!seriesData || !Array.isArray(seriesData)) {
          return false
        }
      }
      return true
    })

    if (validSeries.length === 0) {
      return undefined
    }

    return {
      accessibility: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      chart: {
        backgroundColor: "transparent",
        animation: false, // Disable chart animations
        zooming: {
          // Use built-in wheel zoom by default; switch off when using cursor-anchored mode
          mouseWheel: {
            enabled: wheelZoomMode === "default",
            type: "x",
            sensitivity: 1.5,
          },
        },
        panning: {
          enabled: true,
          type: "x",
        },
        panKey: "shift",
        height: height || undefined,
        width: width || undefined,
        marginBottom: 40, // Reduced bottom margin
        events: {
          load() {
            // Ensure chart fills container and disable animations
            const container = this.container
            if (container && container.parentElement) {
              const parentWidth = container.parentElement.clientWidth
              const parentHeight = container.parentElement.clientHeight
              if (parentWidth > 0 && parentHeight > 0) {
                this.setSize(parentWidth, parentHeight, false)
              }
            }

            // Disable the initial animation completely
            this.series.forEach((series) => {
              try {
                ;(series as any).update(
                  {
                    animation: false,
                  },
                  false
                )
              } catch (error) {
                // Silently skip animation disabling errors
              }
            })
            this.redraw(false)
          },
        },
        reflow: true, // Enable reflow for proper sizing
      },
      navigator: {
        enabled: false,
      },
      scrollbar: {
        enabled: false,
      },
      title: {
        text: "",
      },
      xAxis: {
        type: "datetime",
        gridLineWidth: 2,
        ordinal: true,
        gridLineColor: `${tailwindColors.primary.white}05`,
        gridLineDashStyle: "Solid",
        labels: {
          style: {
            ...tailwindTypography.desktopL14Regular.css,
            color: `${tailwindColors.primary.white}4D`,
          },
        },
        crosshair: {
          dashStyle: "Dash",
          label: {
            enabled: true,
            format: "{value:%Y-%m-%d %H:%M}",
            backgroundColor: `${tailwindColors.primary.white}E6`,
            borderColor: `${tailwindColors.primary.white}`,
            borderWidth: 1,
            borderRadius: 4,
            padding: 6,
            style: {
              color: "#000000",
              fontWeight: "bold",
              fontSize: "11px",
            },
          },
        },
        plotBands: allSeriesPlotBands?.map((band) => ({
          ...band,
          color: band.color ? band.color : `${tailwindColors.primary.white}0D`,
        })),
      },
      yAxis: yAxes,
      tooltip: {
        shared: true,
        split: true,
        enabled: true,
        outside: true,
        padding: 0,
        backgroundColor: "transparent",
        borderRadius: 0,
        borderWidth: 0,
        useHTML: true,
        style: {
          pointerEvents: "none",
        },
        positioner: function positioner() {
          return {
            x: 0,
            y: 0,
          }
        } as unknown as TooltipPositionerCallbackFunction,
        formatter: function tooltipFormatter(this: Highcharts.TooltipFormatterContextObject) {
          // Since multiple series can have same start y-position, we are grouping the series by the y-position.
          // And then adding offset (top of 20px) to the series based on the index in the group.
          const orderedPointsBasedOnPositionY = Object.values(
            (this.points ?? [])?.reduce(
              (acc, item) => {
                const key = item.series.yAxis.pos
                if (!acc[key]) {
                  acc[key] = []
                }
                acc[key].push(item)
                return acc
              },
              {} as Record<string, typeof this.points>
            )
          )
          return `
            ${orderedPointsBasedOnPositionY
              ?.map((points) => {
                return points
                  ?.map((point, index) => {
                    return `
                      <div
                        class="flex flex-row items-center justify-start gap-3.75 absolute"
                        style="top:${
                          point.series.type === "candlestick"
                            ? -25
                            : points.length > 1
                              ? point.series.yAxis.pos + index * 20
                              : point.series.yAxis.pos
                        }px;">
                        ${Object.entries(point.point?.options ?? {})
                          ?.map(([key, value]) => {
                            return key !== "x"
                              ? `
                                <div class="flex flex-row items-center justify-start gap-1">
                                  <span class="typography-dashboardL14Regular ${point.series.type === "candlestick" ? "opacity-100" : "opacity-30"} text-primary-white capitalize">${key === "y" ? point.series.name : key}</span>
                                  <span class="typography-dashboardL14Regular lining-nums tabular-nums" style="color:${point.color};">${formatDollarAmount(
                                    value as unknown as number,
                                    {
                                      style: "decimal",
                                      maximumFractionDigits: 4,
                                    }
                                  )}</span>
                                </div>
                              `
                              : ""
                          })
                          ?.join("")}
                      </div>
                    `
                  })
                  ?.join("")
              })
              ?.join("")}
          `
        } as Highcharts.TooltipFormatterCallbackFunction,
      },
      plotOptions: {
        candlestick: {
          upColor: tailwindColors.territory.success,
          upLineColor: tailwindColors.territory.success,
          color: tailwindColors.secondary.red,
          lineColor: tailwindColors.secondary.red,
          dataLabels: { enabled: false },
          enableMouseTracking: true,
          animation: false, // Disable candlestick animations
        },
        column: {
          animation: false, // Disable column animations
          zones: [
            {
              value: 0,
              color: "transparent", // for zero values
            },
            {
              color: tailwindColors.territory.success, // Positive volume
            },
          ],
        },
        scatter: {
          animation: false, // Disable scatter animations
          enableMouseTracking: true,
          states: {
            hover: {
              enabled: true,
            },
          },
        },
        line: {
          animation: false, // Disable line animations
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
          animation: false, // Disable all series animations
          dataGrouping: {
            enabled: false,
          },
          states: {
            inactive: {
              enabled: false,
            },
          },
          turboThreshold: 0, // Disable turbo mode to prevent animation artifacts
        },
      },
      series: validSeries, // Use validated series instead of allSeries
      // Ensure annotations are fixed (non-draggable) and consistent
      annotations: allAnnotations.map((annotation) => ({
        ...annotation,
        draggable: "",
        zIndex: typeof annotation.zIndex === "number" ? annotation.zIndex : 7,
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
          color: "#e0e0e0",
        },
        style: {
          backgroundColor: "rgba(33, 33, 33, 0.85)",
        },
      },
    } as Highcharts.Options
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoading,
    isLoadingTradeAnalyticsChartData,
    timeframeConfig,
    selectedTimeframe,
    tradeAnalyticsChartData,
    height,
    width,
    selectedRoundTrips,
    fetchEntireCandleStickData,
    paneStates,
  ])

  const handleSeriesVisibility = useCallback(
    (seriesId: string) => {
      const chart = chartRef.current?.chart
      if (!chart || !chartOptions?.series) return

      const seriesIndex = chartOptions.series.findIndex((series) => series.id === seriesId)
      if (seriesIndex >= 0) {
        if (chart.series[seriesIndex].visible) {
          chart.series[seriesIndex].hide()
          setVisibleSeriesIds((prev) => prev.filter((si) => si !== seriesId))
        } else {
          chart.series[seriesIndex].show()
          setVisibleSeriesIds((prev) => [...prev, seriesId])
        }
      }
    },
    [chartOptions]
  )

  // Focus on the selected round trip by default
  // Do not auto-focus or zoom; show default range provided by Highcharts
  useEffect(() => {
    // no-op: keep effect to react to data changes without adjusting extremes
    baselineAppliedRef.current = "" // reset baseline application on data change
  }, [tradeAnalyticsChartData])

  // Reset chart rendered state when data changes
  useEffect(() => {
    setIsChartRendered(false)
  }, [tradeAnalyticsChartData])

  // Additional cleanup when timeframe changes with debouncing
  useEffect(() => {
    setIsTimeframeSwitching(true)
    setIsChartRendered(false)
    // Clear visible series state to prevent stale series references
    setVisibleSeriesIds([])

    // Debounce the chart key update to prevent rapid switching issues
    const timeoutId = setTimeout(() => {
      setChartKey(`${selectedTimeframe}-${assetId}-${Date.now()}`)
      setIsTimeframeSwitching(false)
    }, 150) // 150ms debounce

    return () => clearTimeout(timeoutId)
  }, [selectedTimeframe, assetId])

  // Update chart panes when pane states change
  useEffect(() => {
    const chart = chartRef.current?.chart
    if (chart && paneStates.length > 0) {
      // Update yAxis properties dynamically
      paneStates.forEach((pane, index) => {
        if (chart.yAxis[index]) {
          chart.yAxis[index].update(
            {
              top: `${pane.top}%`,
              height: `${pane.height}%`,
            },
            false
          )
        }
      })
      chart.redraw()
    }
  }, [paneStates])

  // Ensure chart fills container when dimensions change
  useEffect(() => {
    const chart = chartRef.current?.chart
    if (chart && height && width) {
      try {
        chart.setSize(width, height, false) // No animation for instant resize
      } catch (error) {
        // Silently skip resize errors
      }
    }
  }, [height, width])

  if (tradeAnalyticsChartDataError) {
    return (
      <div className="text-red-500">
        Unable to fetch trade data! Please try again later.
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-start">
      <div className="relative h-full w-full flex-1" ref={chartContainerRef}>
        {isLoading || isFetchingTradeAnalyticsChartData || isTimeframeSwitching ? (
          <div className="h-full w-full rounded-3xl bg-gray-200 animate-pulse" />
        ) : typeof chartOptions === "undefined" || !assetId ? (
          <div className="h-full w-full rounded-3xl">
            <div className="flex h-full items-center justify-center text-gray-500">
              {!assetId ? "Please select an asset" : "No data found!"}
            </div>
          </div>
        ) : (
          <HighchartsReact
            key={chartKey || `${selectedTimeframe}-${assetId}`} // Force complete reinitialization on timeframe/asset change
            highcharts={Highcharts}
            options={{ ...chartOptions }}
            ref={chartRef}
            style={{
              opacity: 1, // Always visible, no fade animation
              height: "100%",
              width: "100%",
            }}
            callback={(chart: Chart) => {
              try {
                // Force chart to fill container immediately
                if (chart && chart.container) {
                  chart.setSize(
                    width || chart.container.offsetWidth,
                    height || chart.container.offsetHeight,
                    false
                  )
                }

                // If there are no selected round trips, apply a baseline window
                try {
                  if (!selectedRoundTrips.length && tradeAnalyticsChartData) {
                    const rawTimes = tradeAnalyticsChartData.getChild("index")?.toArray() as
                      | Array<number | bigint>
                      | undefined
                    const allTimes = (rawTimes ?? []).map((t) =>
                      typeof t === "bigint" ? Number(t) : (t as number)
                    )
                    if (allTimes && allTimes.length > 1) {
                      const baselineUnits = DEFAULT_PADDING_CONFIGS[paddingProfile].baselineUnits
                      const endIdx = Math.min(allTimes.length - 1, baselineUnits - 1)
                      const key = `${assetId}-${selectedTimeframe}-${endIdx}`
                      if (baselineAppliedRef.current !== key) {
                        chart.xAxis[0].setExtremes(allTimes[0], allTimes[endIdx], false, false)
                        baselineAppliedRef.current = key
                      }
                    }
                  }
                } catch (_) {
                  // ignore baseline setting errors
                }

                // Mark as rendered immediately since we disabled animations
                setIsChartRendered(true)
              } catch (error) {
                // Still mark as rendered to prevent infinite loading
                setIsChartRendered(true)
              }
            }}
          />
        )}
      </div>
      <div className="flex min-h-11.5 w-full flex-row items-center justify-between gap-4 pt-3.75">
        <div className="flex flex-1 flex-row items-center justify-start gap-2">
          {selectedAssetDetails?.timeframes && (
            <>
              <p className="typography-desktopL14Regular shrink-0 text-primary-white/50">
                Time frame:
              </p>
              <div className="flex w-full flex-row items-center justify-start gap-1.5 lg:gap-2">
                {selectedAssetDetails?.timeframes?.map((timeframeKey, index) => (
                  <button
                    className={`typography-desktopL14Regular flex h-7.5 w-10 items-center justify-center rounded ${
                      timeframeKey === selectedTimeframe
                        ? "pointer-events-none bg-primary-white/10 text-primary-white/50"
                        : "cursor-pointer bg-transparent text-primary-white/30"
                    }`}
                    key={index}
                    onClick={() => setSelectedTimeframe(timeframeKey)}>
                    {timeframeKey}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TradeAnalyticsChartRenderer