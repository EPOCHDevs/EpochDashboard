import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import { SeriesOptionsType, SeriesLineOptions, AnnotationsOptions } from "highcharts"

export const PREVIOUS_HIGH_LOW_PLOT_KIND_DATA_KEYS = [
  "index",
  "previous_high",
  "previous_low",
  "broken_high",
  "broken_low",
]

interface PreviousHighLowStyleOptions {
  highLineColor?: string
  lowLineColor?: string
  highTextColor?: string
  lowTextColor?: string
  lineOpacity?: number
  textOpacity?: number
}

interface generatePreviousHighLowPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: PreviousHighLowStyleOptions
}

export const generatePreviousHighLowPlotElements = ({
  data,
  seriesConfig,
  styleOptions,
}: generatePreviousHighLowPlotElementsProps): PlotElements => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  // Default styling
  const highLineColor =
    styleOptions?.highLineColor || `rgba(255, 255, 255, ${styleOptions?.lineOpacity || 0.2})`
  const lowLineColor =
    styleOptions?.lowLineColor || `rgba(255, 255, 255, ${styleOptions?.lineOpacity || 0.2})`
  const highTextColor =
    styleOptions?.highTextColor || `rgba(255, 255, 255, ${styleOptions?.textOpacity || 0.4})`
  const lowTextColor =
    styleOptions?.lowTextColor || `rgba(255, 255, 255, ${styleOptions?.textOpacity || 0.4})`

  // Create lists of all different high levels and their indexes (following Python logic)
  const highLevels: number[] = []
  const highIndexes: number[] = []
  const lowLevels: number[] = []
  const lowIndexes: number[] = []

  extractedData.forEach((dataPoint, index) => {
    const [, previousHigh, previousLow] = dataPoint as [number, number, number]

    if (
      previousHigh !== null &&
      !isNaN(previousHigh) &&
      previousHigh !== (highLevels.length > 0 ? highLevels[highLevels.length - 1] : null)
    ) {
      highLevels.push(previousHigh)
      highIndexes.push(index)
    }

    if (
      previousLow !== null &&
      !isNaN(previousLow) &&
      previousLow !== (lowLevels.length > 0 ? lowLevels[lowLevels.length - 1] : null)
    ) {
      lowLevels.push(previousLow)
      lowIndexes.push(index)
    }
  })

  // Build shapes (lines) and labels using Highcharts path approach
  const shapes: AnnotationsOptions["shapes"] = []
  const labels: AnnotationsOptions["labels"] = []

  // Helper function to create point objects
  const point = (x: number, y: number) => ({
    x,
    y,
    xAxis: 0,
    yAxis: 0,
  })

  // Create horizontal lines for high levels - draw lines between level changes
  highIndexes.forEach((currentIndex, index) => {
    const nextIndex = highIndexes[index + 1]
    const currentLevel = highLevels[index]

    const currentTimestamp = (extractedData[currentIndex] as [number, number, number])[0]
    const nextTimestamp = (extractedData[nextIndex] as [number, number, number])[0]

    // Create horizontal line shape
    shapes.push({
      type: "path",
      points: [point(currentTimestamp, currentLevel), point(nextTimestamp, currentLevel)],
      stroke: highLineColor,
      strokeWidth: 1,
    })

    // Create label at end of line
    labels.push({
      point: point(nextTimestamp, currentLevel),
      text: "PH",
      y: -10, // Offset above line
      style: {
        color: highTextColor,
        fontSize: "8px",
        fontWeight: "normal",
      },
      backgroundColor: "transparent",
      borderWidth: 0,
    })
  })

  // Create horizontal lines for low levels - draw lines between level changes
  lowIndexes.forEach((currentIndex, index) => {
    const nextIndex = lowIndexes[index + 1]
    const currentLevel = lowLevels[index]

    const currentTimestamp = (extractedData[currentIndex] as [number, number, number])[0]
    const nextTimestamp = (extractedData[nextIndex] as [number, number, number])[0]

    // Create horizontal line shape
    shapes.push({
      type: "path",
      points: [point(currentTimestamp, currentLevel), point(nextTimestamp, currentLevel)],
      stroke: lowLineColor,
      strokeWidth: 1,
    })

    // Create label at end of line
    labels.push({
      point: point(nextTimestamp, currentLevel),
      text: "PL",
      y: 10, // Offset below line
      style: {
        color: lowTextColor,
        fontSize: "8px",
        fontWeight: "normal",
      },
      backgroundColor: "transparent",
      borderWidth: 0,
    })
  })

  // Create a single main series for toggling visibility
  const series: SeriesOptionsType[] = [
    {
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: seriesConfig.name,
      id: seriesConfig.id,
      data: [], // Empty data - this is just for the legend/toggle
      color: highLineColor,
      showInLegend: true,
      enableMouseTracking: false,
    } as SeriesLineOptions,
  ]

  return {
    series,
    annotations: [
      {
        labels,
        shapes,
        zIndex: 2,
        labelOptions: {
          allowOverlap: true,
          backgroundColor: "transparent",
          borderWidth: 0,
          style: {
            fontSize: "8px",
            fontWeight: "normal",
          },
        },
      },
    ],
  }
}
