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
import { globalDataCacheManager } from "./utils/DataCacheManager"
import { useHighchartsTheme } from "../../../../hooks/useHighchartsTheme"
import { getChartColors } from "../../../../constants"
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
  timeframe?: string // Optional timeframe override from parent
  chartRef?: React.RefObject<HighchartsReact.RefObject> // Optional external chart ref
  onRangeExpansionNeeded?: (range: { from: number; to: number }) => void // Callback when lazy loading is needed
  expansionRange?: { from: number; to: number } | null // Range to expand/fetch for lazy loading
  isLazyLoading?: boolean // Flag to prevent duplicate expansion requests
  apiEndpoint?: string // API endpoint for fetching data
  userId?: string // User ID for authentication
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
  timeframe,
  chartRef: externalChartRef,
  onRangeExpansionNeeded,
  expansionRange,
  isLazyLoading = false,
  apiEndpoint,
  userId,
}: TradeAnalyticsChartRendererProps) => {
  const internalChartRef = React.useRef<HighchartsReact.RefObject>(null)
  const chartRef = externalChartRef || internalChartRef
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  const [width, setWidth] = useState(0)
  const previousViewportRangeRef = useRef<number | null>(null) // Track previous viewport size to detect zoom in vs out

  // Update dimensions on resize - use ResizeObserver for container changes
  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const newHeight = chartContainerRef.current.clientHeight
        const newWidth = chartContainerRef.current.clientWidth

        // Only update if dimensions actually changed to avoid unnecessary rerenders
        if (newHeight !== height || newWidth !== width) {
          setHeight(newHeight)
          setWidth(newWidth)
        }
      }
    }

    // Initial dimension update
    updateDimensions()

    // Use ResizeObserver to detect container size changes (more reliable than window resize)
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions()
    })

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current)
    }

    // Also listen to window resize as fallback
    window.addEventListener("resize", updateDimensions)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", updateDimensions)
    }
  }, [height, width])

  const [visibleSeriesIds, setVisibleSeriesIds] = useState<string[]>([])
  const [paneStates, setPaneStates] = useState<PaneState[]>([])

  // Debug paneStates changes
  useEffect(() => {
  }, [paneStates])
  const [isChartRendered, setIsChartRendered] = useState(false)
  const [internalTimeframe, setInternalTimeframe] = useState<string>("")
  const [chartKey, setChartKey] = useState<string>("")
  const [isTimeframeSwitching, setIsTimeframeSwitching] = useState(false)
  const baselineAppliedRef = useRef<string>("")

  // Get theme-aware Highcharts configuration
  const highchartsTheme = useHighchartsTheme()
  const themeColors = useMemo(() => getChartColors(), [])

  // Use the prop timeframe if provided, otherwise use internal state
  const selectedTimeframe = timeframe || internalTimeframe

  // Initialize or reset timeframe from metadata whenever asset changes
  useEffect(() => {
    // Only manage internal timeframe if no prop is provided
    if (!timeframe && assetId && tradeAnalyticsMetadata?.asset_info?.[assetId]) {
      const assetInfo = tradeAnalyticsMetadata.asset_info[assetId]
      const defaultTf = assetInfo.timeframes[0]?.timeframe
      const currentTfValid = internalTimeframe && tradeAnalyticsMetadata.chart_info?.[internalTimeframe]

      // Only update if we don't have a valid timeframe
      if (defaultTf && !currentTfValid) {
        setInternalTimeframe(defaultTf)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId, tradeAnalyticsMetadata, timeframe])

  // Ensure timeframe matches the selected asset; update if not present in new asset
  useEffect(() => {
    // Only manage internal timeframe if no prop is provided
    if (!timeframe && assetId && tradeAnalyticsMetadata?.asset_info?.[assetId] && internalTimeframe) {
      const tfs = tradeAnalyticsMetadata.asset_info[assetId].timeframes
      const isValidForAsset = tfs.some(tf => tf.timeframe === internalTimeframe)

      // Only update if current timeframe is invalid for this asset
      if (!isValidForAsset && tfs[0]?.timeframe) {
        setInternalTimeframe(tfs[0].timeframe)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetId, tradeAnalyticsMetadata, timeframe])

  // Smart data loading with caching and lazy loading
  const {
    data: tradeAnalyticsChartData,
    error: tradeAnalyticsChartDataError,
    isFetching: isFetchingTradeAnalyticsChartData,
    isActuallyFetching: isActuallyFetchingTradeAnalyticsChartData,
    isLoading: isLoadingTradeAnalyticsChartData,
  } = useSmartChartData({
    strategyId: campaignId,
    assetId: assetId,
    timeframe: selectedTimeframe,
    selectedRoundTrips: selectedRoundTrips,
    enabled: Boolean(campaignId && assetId && selectedTimeframe),
    paddingConfig: DEFAULT_PADDING_CONFIGS[paddingProfile],
    fetchEntireCandleStickData: fetchEntireCandleStickData,
    expansionRange: expansionRange,
    apiEndpoint: apiEndpoint,
    userId: userId,
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
    if (timeframeConfig?.yAxis && timeframeConfig.yAxis.length > 0) {
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

        const height = axis.height || 70 // Default height if not specified
        const top = axis.top !== undefined ? axis.top : (index * 35) // Default top if not specified

        // Only keep Price (index 0) and Volume (index 1) panes expanded by default
        // All other panes (TradeSignal, etc.) should be collapsed by default
        const shouldCollapse = index > 1

        return {
          id: `pane-${index}`,
          name: paneName,
          collapsed: shouldCollapse,
          height,
          top,
          originalHeight: height,
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
    try {
      // CRITICAL: Only skip rendering on TRUE initial load (no config/data yet)
      // NEVER skip if we have data - even if we're fetching more data in background
      if (
        !timeframeConfig ||
        !selectedTimeframe ||
        !tradeAnalyticsChartData ||
        !paneStates.length ||
        !highchartsTheme
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
            color: highchartsTheme?.yAxis?.labels?.style?.color || tailwindColors.secondary.cementGrey,
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
        gridLineColor: highchartsTheme?.yAxis?.gridLineColor || `${tailwindColors.primary.white}05`,
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
        gridLineColor: highchartsTheme?.xAxis?.gridLineColor || `${tailwindColors.primary.white}05`,
        gridLineDashStyle: "Solid",
        labels: {
          style: {
            ...tailwindTypography.desktopL14Regular.css,
            color: highchartsTheme?.xAxis?.labels?.style?.color || tailwindColors.secondary.cementGrey,
          },
        },
        crosshair: {
          dashStyle: "Dash",
          label: {
            enabled: true,
            format: "{value:%Y-%m-%d %H:%M}",
            backgroundColor: `${themeColors.foreground}E6`,
            borderColor: themeColors.foreground,
            borderWidth: 1,
            borderRadius: 4,
            padding: 6,
            style: {
              color: themeColors.background,
              fontWeight: "bold",
              fontSize: "11px",
            },
          },
        },
        plotBands: allSeriesPlotBands?.map((band) => ({
          ...band,
          color: band.color ? band.color : `${themeColors.foreground}0D`,
        })),
        events: {
          afterSetExtremes: function (e) {
            // Guard 1: Only respond to user-initiated zoom actions
            // e.trigger can be: 'zoom', 'navigator', 'mousewheel', 'rangeSelectorButton', etc.
            // undefined means programmatic setExtremes calls
            const userTriggers = ['zoom', 'navigator', 'mousewheel', 'rangeSelectorButton']
            if (!e.trigger || !userTriggers.includes(e.trigger)) {
              return
            }

            // Guard 2: Don't trigger expansion if already fetching data from network
            if (isActuallyFetchingTradeAnalyticsChartData) {
              return
            }

            // Guard 3: Must have expansion callback
            if (!onRangeExpansionNeeded) {
              return
            }

            const axis = this
            const viewMin = e.min
            const viewMax = e.max
            const currentViewportRange = viewMax - viewMin

            // Detect zoom direction: zoom IN = smaller viewport, zoom OUT = larger viewport
            const previousRange = previousViewportRangeRef.current

            // Only process if we have a previous range to compare
            if (previousRange === null) {
              // First zoom - just record the range, don't trigger expansion
              previousViewportRangeRef.current = currentViewportRange
              return
            }

            const isZoomingOut = currentViewportRange > previousRange
            const isZoomingIn = currentViewportRange < previousRange
            const isPanning = Math.abs(currentViewportRange - previousRange) < 1 // Almost same size = panning

            // Update ref for next comparison
            previousViewportRangeRef.current = currentViewportRange

            // ONLY trigger expansion when zooming OUT (or panning) and approaching data boundaries
            // Never trigger on zoom IN - we already have that data cached
            if (isZoomingIn) {
              return
            }

            // Get cached data bounds from the cache manager (not chart's dataMin/dataMax)
            // This is crucial - we need to check against what's in cache, not what's displayed
            const cacheRequest = {
              strategyId: campaignId,
              assetId: assetId,
              timeframe: selectedTimeframe
            }
            const loadedRanges = globalDataCacheManager.getLoadedRanges(cacheRequest)

            if (loadedRanges.length === 0) {
              return
            }

            // Get the overall cached data bounds (earliest from and latest to)
            const cachedMin = Math.min(...loadedRanges.map(r => r.from))
            const cachedMax = Math.max(...loadedRanges.map(r => r.to))

            // Now check if we're zooming out or panning
            if (isZoomingOut || isPanning) {
              // Calculate how close we are to the CACHED data boundaries
              // Use 50% threshold for VERY aggressive prefetching to avoid hitting limits
              // This triggers fetch much earlier, preventing freeze when user reaches boundary
              const cachedRange = cachedMax - cachedMin
              const frontBuffer = cachedRange * 0.5
              const backBuffer = cachedRange * 0.5

              const approachingStart = viewMin < (cachedMin + frontBuffer)
              const approachingEnd = viewMax > (cachedMax - backBuffer)
              const needsExpansion = approachingStart || approachingEnd

              if (needsExpansion) {

                // Calculate expansion range: extend beyond viewport by 200% on each side
                // VERY aggressive prefetching to ensure we NEVER hit the limit
                // This fetches way more data than currently visible to prevent freeze
                const viewportRange = viewMax - viewMin
                const expansionBuffer = viewportRange * 2.0

                // Expand beyond current viewport (not just current data bounds)
                const expansionFrom = viewMin - expansionBuffer
                const expansionTo = viewMax + expansionBuffer

                // Trigger data fetch - with ordinal:false, chart will naturally show gaps
                // No need to manually extend axis - Highcharts handles it automatically
                onRangeExpansionNeeded({
                  from: expansionFrom,
                  to: expansionTo
                })
              }
            }
          }
        }
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
                        class="flex flex-row items-center justify-start gap-3 absolute px-3 py-2 rounded-lg backdrop-blur-md"
                        style="top:${
                          point.series.type === "candlestick"
                            ? -25
                            : points.length > 1
                              ? point.series.yAxis.pos + index * 20
                              : point.series.yAxis.pos
                        }px; background: rgba(0, 0, 0, 0.85); border: 1px solid rgba(255, 255, 255, 0.1);">
                        ${Object.entries(point.point?.options ?? {})
                          ?.map(([key, value]) => {
                            return key !== "x"
                              ? `
                                <div class="flex flex-row items-center justify-start gap-2">
                                  <span class="text-xs font-medium ${point.series.type === "candlestick" ? "text-foreground" : "text-muted-foreground"} capitalize">${key === "y" ? point.series.name : key}:</span>
                                  <span class="text-xs font-semibold lining-nums tabular-nums" style="color:${point.color};">${formatDollarAmount(
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
          dataGrouping: (() => {
            // Enable data grouping for all intraday timeframes (ending with Min/m/H/h)
            // This automatically resamples data as you zoom out for better performance
            const isIntraday = /^[0-9]+(Min|m|H|h)$/i.test(selectedTimeframe)
            const isHourly = /^[0-9]+(H|h)$/i.test(selectedTimeframe)
            const isMinute = /^[0-9]+(Min|m)$/i.test(selectedTimeframe)

            // Different grouping units based on timeframe
            let units: any[] = []
            if (isMinute) {
              // For minute charts: allow grouping into minutes, hours, days, weeks, months
              units = [
                ['minute', [1, 2, 5, 10, 15, 30]],
                ['hour', [1, 2, 3, 4, 6, 8, 12]],
                ['day', [1]],
                ['week', [1]],
                ['month', [1]],
              ]
            } else if (isHourly) {
              // For hourly charts: skip minutes, start with hours
              units = [
                ['hour', [1, 2, 3, 4, 6, 8, 12]],
                ['day', [1]],
                ['week', [1]],
                ['month', [1, 3, 6]],
              ]
            }

            return {
              enabled: isIntraday,
              forced: isIntraday,
              units: units,
            }
          })(),
          states: {
            inactive: {
              enabled: false,
            },
          },
          turboThreshold: 5000, // Optimal threshold for candlestick performance with lazy loading
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
    } catch (error) {
      console.error("Error creating chart options:", error)
      return undefined
    }
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
    onRangeExpansionNeeded, // Include callback in deps so event handler has fresh reference
    highchartsTheme, // Update chart when theme changes
    themeColors, // Update chart when theme colors change
    isActuallyFetchingTradeAnalyticsChartData, // Include so event handler can check if fetch is in progress
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

  // Trigger reflow when dimensions change (but don't force size to allow resize handles to work)
  useEffect(() => {
    const chart = chartRef.current?.chart
    if (chart) {
      try {
        // Just trigger reflow, don't force size - this allows resize handles to work
        chart.reflow()
      } catch (error) {
        // Silently skip reflow errors
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
    <div className="flex h-full w-full flex-col items-start">
      <div className="relative h-full w-full flex-1" ref={chartContainerRef}>
        {/* Show loading skeleton on INITIAL load or when data is being fetched */}
        {(isLoading || isTimeframeSwitching || isLoadingTradeAnalyticsChartData) && !tradeAnalyticsChartData ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent mb-4" />
              <p className="text-muted-foreground">Loading chart...</p>
            </div>
          </div>
        ) : typeof chartOptions === "undefined" || !assetId ? (
          <div className="h-full w-full rounded-3xl">
            <div className="flex h-full items-center justify-center text-gray-500">
              {!assetId ? "Please select an asset" : "No data found!"}
            </div>
          </div>
        ) : (
          <>
            {/* Skeleton loader - ONLY shown when actually fetching from network */}
            {isActuallyFetchingTradeAnalyticsChartData && tradeAnalyticsChartData && (
              <div className="absolute inset-0 z-40 skeleton-chart-loader">
                {/* Shimmer effect */}
                <div className="skeleton-shimmer" />

                {/* Chart structure skeleton */}
                <div className="relative w-full h-full flex flex-col p-4">
                  {/* Price chart area (70% height) */}
                  <div className="relative flex-1 flex items-end gap-1 px-8 py-4">
                    {/* Horizontal grid lines */}
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={`grid-h-${i}`}
                        className="absolute left-0 right-0 h-px skeleton-grid-line"
                        style={{
                          bottom: `${i * 20}%`,
                          background: 'rgba(255, 255, 255, 0.05)',
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}

                    {/* Candlestick skeletons */}
                    {[...Array(20)].map((_, i) => {
                      // Random heights for realistic candlestick appearance
                      const height = 20 + Math.random() * 60
                      const wickTop = Math.random() * 20
                      const wickBottom = Math.random() * 20
                      const isGreen = Math.random() > 0.5

                      return (
                        <div
                          key={`candle-${i}`}
                          className="flex-1 flex flex-col items-center justify-end skeleton-candle"
                          style={{ animationDelay: `${i * 0.05}s` }}
                        >
                          {/* Upper wick */}
                          <div
                            className="w-0.5 bg-primary-white/20"
                            style={{ height: `${wickTop}%` }}
                          />
                          {/* Candle body */}
                          <div
                            className="w-full rounded-sm"
                            style={{
                              height: `${height}%`,
                              background: isGreen
                                ? 'rgba(34, 197, 94, 0.15)'
                                : 'rgba(239, 68, 68, 0.15)',
                              border: `1px solid ${isGreen ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                            }}
                          />
                          {/* Lower wick */}
                          <div
                            className="w-0.5 bg-primary-white/20"
                            style={{ height: `${wickBottom}%` }}
                          />
                        </div>
                      )
                    })}
                  </div>

                  {/* Volume bars area (30% height) */}
                  <div className="relative h-32 flex items-end gap-1 px-8 py-4 border-t border-primary-white/5">
                    {[...Array(20)].map((_, i) => {
                      const volumeHeight = 20 + Math.random() * 80
                      return (
                        <div
                          key={`volume-${i}`}
                          className="flex-1 skeleton-volume-bar rounded-t-sm"
                          style={{
                            height: `${volumeHeight}%`,
                            background: 'rgba(34, 197, 94, 0.1)',
                            animationDelay: `${i * 0.05 + 0.5}s`,
                          }}
                        />
                      )
                    })}
                  </div>

                  {/* Loading indicator badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur-md rounded-lg border border-territory-blue/30">
                    <div className="w-2 h-2 bg-territory-blue rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-primary-white/80">Loading data...</span>
                  </div>
                </div>
              </div>
            )}
            <HighchartsReact
              key={chartKey || `${selectedTimeframe}-${assetId}`} // Force complete reinitialization on timeframe/asset change
              highcharts={Highcharts}
              options={chartOptions}
              ref={chartRef}
              style={{
                opacity: 1, // Always visible, no fade animation
                height: "100%",
                width: "100%",
              }}
            callback={(chart: Chart) => {
              try {
                // Trigger reflow to ensure proper sizing
                if (chart) {
                  chart.reflow()
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
          </>
        )}
      </div>
      {/* Only show bottom timeframe selector if no timeframe prop is provided */}
      {!timeframe && (
        <div className="flex min-h-11.5 w-full flex-row items-center justify-between gap-4 pt-3.75">
          <div className="flex flex-1 flex-row items-center justify-start gap-2">
            {selectedAssetDetails?.timeframes && (
              <>
                <p className="typography-desktopL14Regular shrink-0 text-primary-white/50">
                  Time frame:
                </p>
                <div className="flex w-full flex-row items-center justify-start gap-1.5 lg:gap-2">
                  {selectedAssetDetails?.timeframes?.map((tfInfo, index) => (
                    <button
                      className={`typography-desktopL14Regular flex h-7.5 w-10 items-center justify-center rounded ${
                        tfInfo.timeframe === selectedTimeframe
                          ? "pointer-events-none bg-primary-white/10 text-primary-white/50"
                          : "cursor-pointer bg-transparent text-primary-white/30"
                      }`}
                      key={index}
                      onClick={() => !timeframe && setInternalTimeframe(tfInfo.timeframe)}>
                      {tfInfo.timeframe}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TradeAnalyticsChartRenderer