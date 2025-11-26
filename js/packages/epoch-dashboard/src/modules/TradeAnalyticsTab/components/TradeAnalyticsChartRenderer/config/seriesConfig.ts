import { Table, DataType } from 'apache-arrow'
import {
  SeriesOptionsType,
  SeriesFlagsOptions,
  SeriesLineOptions,
  XAxisPlotBandsOptions,
  AnnotationsOptions,
} from 'highcharts'
import { generatePlotElements } from '../../PlotKinds/EpochPlotKindOptions'
import {
  GetTradeAnalyticsMetadataResponseType,
  IRoundTrip,
  PLOT_KIND,
  ChartInfoType,
} from '../../../../../types/TradeAnalyticsTypes'

const UNHANDLED_PLOT_KINDS = [
  PLOT_KIND.ORDER_BLOCKS,
  PLOT_KIND.BOS_CHOCH,
  PLOT_KIND.FVG,
  PLOT_KIND.LIQUIDITY,
]

export interface SeriesConfigResult {
  series: SeriesOptionsType[]
  plotBands: XAxisPlotBandsOptions[]
  annotations: AnnotationsOptions[]
  activeYAxisIndices: Set<number> // Track which yAxis indices have visible series
}

interface BuildSeriesConfigParams {
  timeframeConfig: ChartInfoType | undefined
  tradeAnalyticsChartData: Table<Record<string | number | symbol, DataType>> | undefined
  selectedRoundTrips: IRoundTrip[]
  maxYAxisIndex: number
  visibilityState?: Record<string, boolean> // Indicator visibility state
}

/**
 * Build series configuration from metadata
 * Generates series, plot bands, and annotations
 * Validates yAxis references and data integrity
 * Filters series based on visibility state
 */
export const buildSeriesConfig = ({
  timeframeConfig,
  tradeAnalyticsChartData,
  selectedRoundTrips,
  maxYAxisIndex,
  visibilityState,
}: BuildSeriesConfigParams): SeriesConfigResult | null => {
  const allSeries: Array<SeriesOptionsType> = []
  const allSeriesPlotBands: XAxisPlotBandsOptions[] = []
  const allAnnotations: AnnotationsOptions[] = []
  const activeYAxisIndices = new Set<number>()

  // Safety check for timeframeConfig.series
  if (!timeframeConfig?.series || !Array.isArray(timeframeConfig.series)) {
    return null
  }

  // Generate series from metadata
  timeframeConfig.series.forEach((seriesConfig: any) => {
    if (!seriesConfig || !seriesConfig.type) {
      return
    }

    // Skip unhandled plot kinds
    if (UNHANDLED_PLOT_KINDS.includes(seriesConfig.type)) {
      return
    }

    // Check visibility state - don't skip, just mark as hidden
    // Candlestick is always visible regardless of state
    const isVisible = seriesConfig.type === 'candlestick'
      ? true
      : visibilityState && seriesConfig.id
        ? (visibilityState[seriesConfig.id] ?? true)
        : true

    try {
      const plotElements = generatePlotElements({
        seriesConfig,
        data: tradeAnalyticsChartData,
        roundTrips: selectedRoundTrips,
      })

      if (!plotElements) return

      // Process series
      if (plotElements.series && Array.isArray(plotElements.series) && plotElements.series.length > 0) {
        plotElements.series.forEach((seriesOptions, index) => {
          if (!seriesOptions) return

          const options: SeriesOptionsType = { ...seriesOptions }

          // First series gets the original ID
          if (index === 0) {
            options.id = seriesConfig.id
          }

          // Set visibility based on state
          options.visible = isVisible

          // Preserve yAxis assignment
          let yAxisIndex = 0
          if (seriesConfig.yAxis !== undefined && seriesConfig.yAxis !== null) {
            yAxisIndex = seriesConfig.yAxis
            ;(options as any).yAxis = seriesConfig.yAxis
          } else if (!(options as any).yAxis && seriesConfig.yAxis === 0) {
            // Handle yAxis = 0 (falsy but valid)
            yAxisIndex = 0
            ;(options as any).yAxis = 0
          }

          // Track active yAxis indices (only for visible series)
          if (isVisible) {
            activeYAxisIndices.add(yAxisIndex)
          }

          // Handle linkedTo
          if (seriesConfig.linkedTo) {
            if (seriesConfig.type === 'flag') {
              ;(options as SeriesFlagsOptions).onSeries = seriesConfig.linkedTo
            } else {
              ;(options as SeriesLineOptions).linkedTo = seriesConfig.linkedTo
            }
          }

          allSeries.push(options)
        })
      }

      // Process plot bands (only if visible)
      if (isVisible && plotElements.plotBands && Array.isArray(plotElements.plotBands) && plotElements.plotBands.length > 0) {
        allSeriesPlotBands.push(...plotElements.plotBands)
      }

      // Process annotations (only if visible)
      if (isVisible && plotElements.annotations && Array.isArray(plotElements.annotations) && plotElements.annotations.length > 0) {
        allAnnotations.push(...plotElements.annotations)
      }
    } catch (error) {
      // Silently skip invalid plot elements
      console.warn('Failed to generate plot elements for', seriesConfig.type, error)
    }
  })

  // Validate that we have at least some data
  if (allSeries.length === 0) {
    return null
  }

  // CRITICAL: Validate that all series yAxis references are within bounds
  // This prevents Highcharts Error #18 when switching timeframes
  const validatedSeries = allSeries.map((series) => {
    const seriesYAxis = (series as any).yAxis
    if (typeof seriesYAxis === 'number' && seriesYAxis > maxYAxisIndex) {
      console.warn(
        `Series "${series.id}" references yAxis ${seriesYAxis} but only ${maxYAxisIndex + 1} axes exist. Clamping to ${maxYAxisIndex}`
      )
      return {
        ...series,
        yAxis: maxYAxisIndex,
      }
    }
    return series
  })

  // Validate that all series have valid data (where applicable)
  const validSeries = validatedSeries.filter((series) => {
    const hasDataProperty = 'data' in series
    if (hasDataProperty) {
      const seriesData = (series as { data?: unknown }).data
      if (!seriesData || !Array.isArray(seriesData)) {
        return false
      }
      // Keep flag series (identified by onSeries property) even if empty
      // Flag series are annotation-based and should persist without data
      const isLinkedSeries = 'onSeries' in series && series.onSeries
      if ((seriesData as unknown[]).length === 0 && !isLinkedSeries) {
        return false
      }
    }
    return true
  }) as SeriesOptionsType[]

  return {
    series: validSeries,
    plotBands: allSeriesPlotBands,
    annotations: allAnnotations,
    activeYAxisIndices,
  }
}
