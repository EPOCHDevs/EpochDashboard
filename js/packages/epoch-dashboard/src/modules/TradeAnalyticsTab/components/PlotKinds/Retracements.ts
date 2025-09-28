import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import { SeriesOptionsType, SeriesLineOptions, AnnotationsOptions } from "highcharts"
import { isNull } from "lodash"

export const RETRACEMENTS_PLOT_KIND_DATA_KEYS = [
  "index",
  "direction",
  "current_retracement",
  "deepest_retracement",
]

interface RetracementsStyleOptions {
  textColor?: string
  fontSize?: string
  fontWeight?: string
}

interface generateRetracementsPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: RetracementsStyleOptions
}

export const generateRetracementsPlotElements = ({
  data,
  seriesConfig,
  styleOptions,
}: generateRetracementsPlotElementsProps): PlotElements => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  // Default styling
  const textColor = styleOptions?.textColor || "rgba(255, 255, 255, 0.8)"
  const fontSize = styleOptions?.fontSize || "20px"
  const fontWeight = styleOptions?.fontWeight || "bold"

  const highArray = data?.getChild("h")?.toArray()
  const lowArray = data?.getChild("l")?.toArray()

  // Build labels for direction changes
  const labels: AnnotationsOptions["labels"] = []

  extractedData.forEach((dataPoint, index) => {
    const [timestamp, direction, currentRetracement, deepestRetracement] = dataPoint as [
      number,
      number,
      number,
      number,
    ]

    if (!isNull(direction)) {
      const high = highArray?.[index]
      const low = lowArray?.[index]

      const cond1 =
        (index < extractedData.length - 1
          ? (extractedData[index + 1] as [number, number, number, number])[1]
          : 0) !== direction || index === extractedData.length - 1

      const cond2 = direction !== 0

      const cond3 =
        (index < extractedData.length - 1
          ? (extractedData[index + 1] as [number, number, number, number])[1]
          : direction) !== 0

      if (cond1 && cond2 && cond3) {
        // Position at high if direction is -1, at low otherwise
        const yPosition = Number(direction) === -1 ? high : low

        labels.push({
          point: {
            x: timestamp,
            y: yPosition,
            xAxis: 0,
            yAxis: 0,
          },
          text: `C:${currentRetracement}%<br/>D:${deepestRetracement}%`,
          useHTML: true,
          style: {
            color: textColor,
            fontSize: fontSize,
            fontWeight: fontWeight,
          },
          backgroundColor: "transparent",
          borderWidth: 0,
          allowOverlap: true,
        })
      }
    }
  })

  // Create a single main series for toggling visibility
  const series: SeriesOptionsType[] = [
    {
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: seriesConfig.name,
      id: seriesConfig.id,
      data: [], // Empty data - this is just for the legend/toggle
      color: textColor,
      showInLegend: true,
      enableMouseTracking: false,
    } as SeriesLineOptions,
  ]

  return {
    series,
    annotations:
      labels.length > 0
        ? [
            {
              labels,
              zIndex: 3,
              labelOptions: {
                allowOverlap: true,
                backgroundColor: "transparent",
                borderWidth: 0,
                style: {
                  fontSize: fontSize,
                  fontWeight: fontWeight,
                  color: textColor,
                },
              },
            },
          ]
        : [],
  }
}
