import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import { SeriesOptionsType, SeriesLineOptions, AnnotationsOptions } from "highcharts"
import { isNull } from "lodash"

export const SWING_HIGH_LOW_PLOT_KIND_DATA_KEYS = ["index", "high_low", "level"]

interface generateSwingHighLowPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
}

export const generateSwingHighLowPlotElements = ({
  data,
  seriesConfig,
}: generateSwingHighLowPlotElementsProps): PlotElements => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  // Extract indices and levels where HighLow is not NaN
  const swingPoints: Array<{ index: number; timestamp: number; level: number; highLow: number }> =
    []

  extractedData.forEach((dataPoint, index) => {
    const [timestamp, highLow, level] = dataPoint as [number, number, number]
    if (!isNull(highLow)) {
      swingPoints.push({
        index,
        timestamp,
        level,
        highLow,
      })
    }
  })

  // Build shapes (lines) using Highcharts path approach
  const shapes: AnnotationsOptions["shapes"] = []

  // Create line segments between consecutive swing points
  swingPoints.forEach((swingPoint, index) => {
    const nextPoint = swingPoints[index + 1]

    // Determine color based on HighLow value
    const color =
      Number(swingPoint.highLow) === -1
        ? "rgba(0, 128, 0, 0.8)" // Green for -1
        : "rgba(255, 0, 0, 0.8)" // Red for other values

    // Create path shape for the line segment
    shapes.push({
      type: "path",
      points: [
        {
          x: swingPoint.timestamp,
          y: swingPoint.level,
          xAxis: 0,
          yAxis: 0,
        },
        {
          x: nextPoint.timestamp,
          y: nextPoint.level,
          xAxis: 0,
          yAxis: 0,
        },
      ],
      stroke: color,
      strokeWidth: 2,
    })
  })

  // Create a single main series for toggling visibility
  const series: SeriesOptionsType[] = [
    {
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: seriesConfig.name,
      id: seriesConfig.id,
      data: [], // Empty data - this is just for the legend
      color: "rgba(128, 128, 128, 0.5)",
      showInLegend: true,
      enableMouseTracking: false,
    } as SeriesLineOptions,
  ]

  return {
    series,
    annotations:
      shapes.length > 0
        ? [
            {
              shapes,
              zIndex: 2,
            },
          ]
        : [],
  }
}
