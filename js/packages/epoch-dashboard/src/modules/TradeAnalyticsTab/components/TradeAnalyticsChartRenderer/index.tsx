/* eslint-disable new-cap */
import React, { useRef, useMemo } from 'react'
import {
  GetTradeAnalyticsMetadataResponseType,
  IRoundTrip,
} from '../../../../types/TradeAnalyticsTypes'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts/highstock'
import HighchartsMore from 'highcharts/highcharts-more'
import HighchartsAnnotations from 'highcharts/modules/annotations'
import HighchartsDragPanes from 'highcharts/modules/drag-panes'
import { useHighchartsTheme } from '../../../../hooks/useHighchartsTheme'
import { getChartColors } from '../../../../constants'

// Hooks
import { useChartDimensions } from './hooks/useChartDimensions'
import { useTimeframeManager } from './hooks/useTimeframeManager'
import { usePaneManager } from './hooks/usePaneManager'
import { useLazyLoading } from './hooks/useLazyLoading'
import { useSmartChartData } from './hooks/useSmartChartData'
import { useIndicatorVisibility } from './hooks/useIndicatorVisibility'

// Config builders
import { buildYAxisOptions } from './config/yAxisConfig'
import { buildXAxisOptions } from './config/xAxisConfig'
import { buildTooltipOptions } from './config/tooltipConfig'
import { buildSeriesConfig } from './config/seriesConfig'
import { buildChartConfig } from './config/chartConfig'

// Components
import { ChartLoadingState } from './components/ChartLoadingState'
import { ChartContainer } from './components/ChartContainer'

// Utils
import { DEFAULT_PADDING_CONFIGS, getMsPerBar } from './utils/BackendPaddingUtils'
import './styles.css'

// Initialize Highcharts modules safely for SSR
if (typeof Highcharts !== 'undefined' && typeof window !== 'undefined') {
  HighchartsMore(Highcharts)
  HighchartsAnnotations(Highcharts)
  HighchartsDragPanes(Highcharts)

  // Globally disable animations
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
  paddingProfile?: 'MINIMAL' | 'CONSERVATIVE' | 'STANDARD' | 'AGGRESSIVE'
  wheelZoomMode?: 'default' | 'cursor'
  isFullScreen?: boolean
  timeframe?: string
  chartRef?: React.RefObject<HighchartsReact.RefObject>
  onRangeExpansionNeeded?: (range: { from: number; to: number }) => void
  expansionRange?: { from: number; to: number } | null
  isLazyLoading?: boolean
  apiEndpoint?: string
  userId?: string
  sidebarWidth?: number
  isAssetSwitching?: boolean
  initialDisplayBars?: number
  // Expose indicator visibility for toolbar integration
  onIndicatorVisibilityChange?: (visibility: {
    visibilityState: Record<string, boolean>
    onToggleIndicator: (seriesId: string) => boolean
    getVisibleCount: () => { visible: number; total: number }
    canShowMore: () => boolean
  }) => void
}

const TradeAnalyticsChartRenderer = ({
  isLoading = false,
  tradeAnalyticsMetadata,
  selectedRoundTrips = [],
  assetId,
  campaignId,
  fetchEntireCandleStickData = false,
  paddingProfile = 'STANDARD',
  wheelZoomMode = 'default',
  timeframe,
  chartRef: externalChartRef,
  onRangeExpansionNeeded,
  expansionRange,
  apiEndpoint,
  userId,
  sidebarWidth = 56,
  isAssetSwitching = false,
  initialDisplayBars = 500,
  onIndicatorVisibilityChange,
}: TradeAnalyticsChartRendererProps) => {
  // Refs
  const internalChartRef = React.useRef<HighchartsReact.RefObject>(null)
  const chartRef = externalChartRef || internalChartRef
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Custom hooks
  const { height, width } = useChartDimensions(chartContainerRef as React.RefObject<HTMLDivElement>)
  const { selectedTimeframe, isTimeframeSwitching, chartKey } = useTimeframeManager(
    assetId,
    timeframe,
    tradeAnalyticsMetadata
  )

  // Theme
  const highchartsTheme = useHighchartsTheme()
  const themeColors = useMemo(() => getChartColors(), [])

  // Timeframe config and pane management
  const timeframeConfig = useMemo(() => {
    if (selectedTimeframe && tradeAnalyticsMetadata?.chart_info) {
      return tradeAnalyticsMetadata.chart_info[selectedTimeframe]
    }
    return undefined
  }, [selectedTimeframe, tradeAnalyticsMetadata])

  // Indicator visibility management
  const indicatorVisibility = useIndicatorVisibility({
    jobId: campaignId,
    selectedTimeframe,
    timeframeConfig,
  })

  // Expose indicator visibility to parent via callback
  React.useEffect(() => {
    if (onIndicatorVisibilityChange && timeframeConfig) {
      onIndicatorVisibilityChange({
        visibilityState: indicatorVisibility.visibilityState,
        onToggleIndicator: indicatorVisibility.onToggleIndicator,
        getVisibleCount: indicatorVisibility.getVisibleCount,
        canShowMore: indicatorVisibility.canShowMore,
      })
    }
  }, [
    indicatorVisibility.visibilityState,
    indicatorVisibility.onToggleIndicator,
    indicatorVisibility.getVisibleCount,
    indicatorVisibility.canShowMore,
    onIndicatorVisibilityChange,
    timeframeConfig,
  ])

  // Asset details
  const selectedAssetDetails = useMemo(() => {
    if (assetId && tradeAnalyticsMetadata?.asset_info[assetId]) {
      return tradeAnalyticsMetadata.asset_info[assetId]
    }
    return undefined
  }, [assetId, tradeAnalyticsMetadata?.asset_info])

  // Data fetching
  const {
    data: tradeAnalyticsChartData,
    error: tradeAnalyticsChartDataError,
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

  // Build series configuration first to get activeYAxisIndices
  const seriesConfigResult = useMemo(() => {
    if (!timeframeConfig || !tradeAnalyticsChartData) {
      return null
    }

    return buildSeriesConfig({
      timeframeConfig,
      tradeAnalyticsChartData,
      selectedRoundTrips,
      maxYAxisIndex: timeframeConfig.yAxis?.length ? timeframeConfig.yAxis.length - 1 : 0,
      visibilityState: indicatorVisibility.visibilityState,
    })
  }, [timeframeConfig, tradeAnalyticsChartData, selectedRoundTrips, indicatorVisibility.visibilityState])

  // Use activeYAxisIndices from seriesConfigResult for pane management
  const paneStates = usePaneManager(timeframeConfig, seriesConfigResult?.activeYAxisIndices)

  // Lazy loading
  const { previousViewportRangeRef, createAfterSetExtremesHandler } = useLazyLoading()

  // Extract selected timestamp from selectedRoundTrips for visual indicator
  const selectedTimestamp = useMemo(() => {
    if (selectedRoundTrips.length > 0 && selectedRoundTrips[0]?.open_datetime) {
      return new Date(selectedRoundTrips[0].open_datetime).getTime()
    }
    return null
  }, [selectedRoundTrips])

  // Build chart configuration
  const chartOptions = useMemo(() => {
    // Guard: Check if we have all required pieces
    if (
      !timeframeConfig ||
      !selectedTimeframe ||
      !tradeAnalyticsChartData ||
      !paneStates.length ||
      !highchartsTheme
    ) {
      return undefined
    }

    // Build Y-axis configuration
    const yAxes = buildYAxisOptions({
      paneStates,
      highchartsTheme,
      themeColors,
      selectedAssetDetails,
    })

    if (yAxes.length === 0) {
      return undefined
    }

    // Use pre-computed series configuration
    if (!seriesConfigResult) {
      return undefined
    }

    // Build afterSetExtremes handler
    const afterSetExtremesHandler = createAfterSetExtremesHandler({
      campaignId,
      assetId,
      selectedTimeframe,
      isActuallyFetching: isActuallyFetchingTradeAnalyticsChartData,
      onRangeExpansionNeeded,
    })

    // Build X-axis configuration
    const barWidthMs = getMsPerBar(selectedTimeframe)
    const xAxis = buildXAxisOptions({
      highchartsTheme,
      themeColors,
      plotBands: seriesConfigResult.plotBands,
      selectedTimestamp,
      barWidthMs,
      afterSetExtremesHandler,
    })

    // Build tooltip configuration
    const tooltip = buildTooltipOptions({
      sidebarWidth,
      selectedAssetDetails,
      assetId,
    })

    // Compose final chart configuration
    return buildChartConfig({
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
    })
  }, [
    timeframeConfig,
    selectedTimeframe,
    tradeAnalyticsChartData,
    paneStates,
    highchartsTheme,
    themeColors,
    selectedAssetDetails,
    selectedRoundTrips,
    selectedTimestamp,
    height,
    width,
    sidebarWidth,
    assetId,
    campaignId,
    initialDisplayBars,
    wheelZoomMode,
    isActuallyFetchingTradeAnalyticsChartData,
    onRangeExpansionNeeded,
    createAfterSetExtremesHandler,
    seriesConfigResult,
  ])

  return (
    <div className="flex h-full w-full flex-col items-start">
      <div className="relative h-full w-full flex-1" ref={chartContainerRef}>
        <ChartLoadingState
          isLoading={isLoading || isLoadingTradeAnalyticsChartData}
          isTimeframeSwitching={isTimeframeSwitching}
          isAssetSwitching={isAssetSwitching}
          hasData={!!tradeAnalyticsChartData && !!chartOptions}
          assetId={assetId}
          error={tradeAnalyticsChartDataError as Error | null}
        >
          <div className="h-full w-full text-foreground p-2">
            <ChartContainer
              chartOptions={chartOptions}
              chartKey={chartKey}
              chartRef={chartRef as React.RefObject<HighchartsReact.RefObject>}
              assetId={assetId}
              selectedTimeframe={selectedTimeframe}
              isActuallyFetching={isActuallyFetchingTradeAnalyticsChartData}
              hasData={!!tradeAnalyticsChartData}
            />
          </div>
        </ChartLoadingState>
      </div>
    </div>
  )
}

export default TradeAnalyticsChartRenderer
