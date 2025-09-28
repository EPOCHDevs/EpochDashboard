import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractColumn,
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import { AnnotationsOptions, SeriesArearangeOptions } from "highcharts"

export const ORDER_BLOCKS_PLOT_KIND_DATA_KEYS = [
  "index",
  "ob",
  "top",
  "bottom",
  "mitigated_index",
  "ob_volume",
  "percentage",
]

export interface OrderBlocksStyleOptions {
  orderBlockColor?: string
  orderBlockOpacity?: number
  borderColor?: string
}

interface generateOrderBlocksPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: OrderBlocksStyleOptions
}
const generateOrderBlocksPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateOrderBlocksPlotKindSeriesOptionsProps): SeriesArearangeOptions[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })
  const indexColumn = extractColumn({
    data,
    columnName: "index",
  }) as number[]

  const areaRangeData: SeriesArearangeOptions["data"] = []
  const labels: AnnotationsOptions["labels"] = []

  extractedData.forEach((row, i) => {
    const [timestamp, ob, top, bottom, mitigatedIndex, obVolume, percentage] = row as [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ]

    if (ob !== 0 && top !== null && bottom !== null) {
      const endIndex =
        mitigatedIndex !== null && mitigatedIndex > 0
          ? Math.min(mitigatedIndex, indexColumn.length - 1)
          : Math.min(i + 50, indexColumn.length - 1) // Default duration if not mitigated

      const endTimestamp = indexColumn[endIndex]

      // Create area range data for order block zone
      areaRangeData.push([timestamp, bottom, top])
      if (endTimestamp !== timestamp) {
        areaRangeData.push([endTimestamp, bottom, top])
      }

      // Add null to separate zones
      areaRangeData.push([null, null, null])

      // Store annotation data for volume/percentage labels
      if (obVolume !== null || percentage !== null) {
        labels.push({
          x: timestamp,
          y: (top + bottom) / 2,
          text: `Vol: ${obVolume || "N/A"}\n${percentage ? `${percentage}%` : ""}`,
          point: {
            xAxis: 0,
            yAxis: seriesConfig.yAxis || 0,
            x: 0,
            y: 0,
          },
        })
      }
    }
  })

  return [
    {
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "arearange",
      data: areaRangeData,
      fillColor: styleOptions?.orderBlockColor || "rgba(138, 43, 226, 0.3)",
      fillOpacity: styleOptions?.orderBlockOpacity || 0.3,
      lineColor: "rgba(138, 43, 226, 0.3)",
      lineWidth: 0,
      marker: {
        enabled: false,
      },
      connectNulls: false,
      // Store annotations data
      _annotations: labels,
    } as unknown as SeriesArearangeOptions,
  ]
}

interface generateOrderBlocksPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: OrderBlocksStyleOptions
}
export const generateOrderBlocksPlotElements = ({
  data,
  seriesConfig,
  styleOptions,
}: generateOrderBlocksPlotElementsProps): PlotElements => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })
  const indexColumn = extractColumn({
    data,
    columnName: "index",
  }) as number[]

  const formatVolume = (volume: number): string => {
    if (!volume) return "N/A"
    if (volume >= 1e12) {
      return `${(volume / 1e12).toFixed(3)}T`
    } else if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(3)}B`
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(3)}M`
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(3)}k`
    }
    return volume.toFixed(2)
  }

  const shapes: AnnotationsOptions["shapes"] = []
  const labels: AnnotationsOptions["labels"] = []
  extractedData.forEach((row, i) => {
    const [timestamp, ob, top, bottom, mitigatedIndex, obVolume, percentage] = row as [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ]

    if (ob !== 0 && top !== null && bottom !== null) {
      const endIndex =
        mitigatedIndex !== null && mitigatedIndex > 0
          ? Math.min(mitigatedIndex, indexColumn.length - 1)
          : Math.min(i + 50, indexColumn.length - 1) // Default duration if not mitigated

      const endTimestamp = indexColumn[endIndex]

      // Create shape for order block rectangle
      shapes.push({
        type: "rect",
        points: [
          {
            x: timestamp,
            y: bottom,
            xAxis: 0,
            yAxis: seriesConfig.yAxis || 0,
          },
          {
            x: endTimestamp,
            y: top,
            xAxis: 0,
            yAxis: seriesConfig.yAxis || 0,
          },
        ],
        fill: styleOptions?.orderBlockColor || "rgba(138, 43, 226, 0.3)",
        yAxis: seriesConfig.yAxis,
      })

      // Add annotation for volume/percentage
      if (obVolume !== null || percentage !== null) {
        const centerX = (timestamp + endTimestamp) / 2
        const centerY = (top + bottom) / 2

        const volumeText = formatVolume(obVolume)
        const annotationText = `OB: ${volumeText} (${percentage || 0}%)`

        labels.push({
          point: {
            x: centerX,
            y: centerY,
            yAxis: seriesConfig.yAxis,
            xAxis: 0,
          },
          text: annotationText,
          style: {
            color: "rgba(255, 255, 255, 0.4)",
            fontSize: "8px",
          },
        })
      }
    }
  })

  // Also keep the series for backward compatibility
  const series = generateOrderBlocksPlotKindSeriesOptions({
    seriesConfig,
    data,
    styleOptions,
  })

  return {
    series,
    annotations: [
      {
        shapes,
        labels,
      },
    ],
  }
}
