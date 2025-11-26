import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import { SeriesOptionsType, SeriesLineOptions, XAxisPlotBandsOptions } from "highcharts"
import { getTailwindColorRgbaFromString } from "../../../../constants/colorMapping"

export const ZONE_PLOT_KIND_DATA_KEYS = ["index", "value"]

interface ZoneConfigOptions {
  name?: string
  position?: string
  color?: string
}

interface generateZonePlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
}

export const generateZonePlotElements = ({
  data,
  seriesConfig,
}: generateZonePlotElementsProps): PlotElements => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  // Extract configuration options from seriesConfig
  const configOptions = (seriesConfig as unknown as { configOptions?: ZoneConfigOptions })
    ?.configOptions || {}

  const zoneName = configOptions.name || seriesConfig.name
  const zoneColor = configOptions.color || "Yellow"

  // Convert color to RGBA with 15% opacity for semi-transparent background
  const fillColor = getTailwindColorRgbaFromString(zoneColor, 0.15)

  // Generate plotBands for all contiguous true ranges
  const plotBands: XAxisPlotBandsOptions[] = []

  // Track current zone state
  let inZone = false
  let zoneStart: number | undefined

  const flushZone = (endTimestamp: number) => {
    if (!inZone || zoneStart === undefined) return

    plotBands.push({
      from: zoneStart,
      to: endTimestamp,
      color: fillColor,
      zIndex: 3,
      label: {
        text: zoneName,
        align: 'center',
        style: {
          color: '#666',
        },
      },
    })

    // Reset zone state
    inZone = false
    zoneStart = undefined
  }

  // Iterate through data to find contiguous true ranges
  extractedData.forEach((dataPoint, index) => {
    const [currentTimestamp, isActive] = dataPoint as [number, boolean]
    const nextRow = extractedData[index + 1] as [number, boolean] | undefined
    const nextTimestamp = nextRow ? Number(nextRow[0]) : undefined

    if (isActive) {
      // Start a new zone if not already in one
      if (!inZone) {
        inZone = true
        zoneStart = Number(currentTimestamp)
      }

      // If this is the last data point, close the zone
      if (index === extractedData.length - 1) {
        flushZone(Number(currentTimestamp))
      }
    } else {
      // If we were in a zone, close it at the current timestamp
      if (inZone) {
        flushZone(Number(currentTimestamp))
      }
    }
  })

  // Create a dummy series for legend/toggle functionality
  const series: SeriesOptionsType[] = [
    {
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: zoneName,
      id: seriesConfig.id,
      data: [], // Empty data - this is just for the legend/toggle
      color: getTailwindColorRgbaFromString(zoneColor, 1.0), // Full opacity for legend
      showInLegend: true,
      enableMouseTracking: false,
    } as SeriesLineOptions,
  ]

  return {
    series,
    plotBands,
  }
}
