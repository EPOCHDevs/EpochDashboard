import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractColumn,
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import { AnnotationsOptions, SeriesArearangeOptions, SeriesOptionsType } from "highcharts"

export const FVG_PLOT_KIND_DATA_KEYS = ["index", "fvg", "top", "bottom", "mitigated_index"]

interface generateFVGPPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesArearangeOptions
}
const generateFVGPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateFVGPPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })
  const fvgOptions: SeriesArearangeOptions = {
    type: "arearange",
    fillColor: "rgba(255, 255, 0, 0.2)", // Yellow with transparency
    fillOpacity: 0.2,
    lineColor: "rgba(255, 255, 0, 0.2)",
    marker: {
      enabled: false,
    },
    connectNulls: false,
    ...styleOptions,
  }
  const indexColumn = extractColumn({
    data,
    columnName: "index",
  })

  const areaRangeData: SeriesArearangeOptions["data"] = []
  extractedData.forEach((row, i) => {
    const [timestamp, fvg, top, bottom, mitigatedIndex] = row as [
      number,
      number,
      number,
      number,
      number,
    ]

    if (fvg !== 0 && top !== null && bottom !== null) {
      const endIndex =
        mitigatedIndex && mitigatedIndex > 0 && mitigatedIndex < indexColumn.length
          ? mitigatedIndex
          : Math.min(i + 10, indexColumn.length - 1)
      const endTimestamp = indexColumn[endIndex]

      // Create area range data for FVG zone
      areaRangeData.push([timestamp, bottom, top])
      if (endTimestamp !== timestamp) {
        areaRangeData.push([endTimestamp, bottom, top])
      }

      // Add null to separate zones
      areaRangeData.push([null, null, null])
    }
  })

  return [
    {
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      ...fvgOptions,
      data: areaRangeData,
    } as SeriesOptionsType,
  ]
}

interface generateFVGPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesArearangeOptions
}
export const generateFVGPlotElements = ({
  data,
  seriesConfig,
  styleOptions,
}: generateFVGPlotElementsProps): PlotElements => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })
  const indexColumn = extractColumn({
    data,
    columnName: "index",
  })

  const shapes: AnnotationsOptions["shapes"] = []
  const labels: AnnotationsOptions["labels"] = []
  extractedData.forEach((row, i) => {
    const [timestamp, fvg, top, bottom, mitigatedIndex] = row as [
      number,
      number,
      number,
      number,
      number,
    ]

    if (fvg !== 0 && top !== null && bottom !== null) {
      const endIndex =
        mitigatedIndex && mitigatedIndex > 0 && mitigatedIndex < indexColumn.length
          ? mitigatedIndex
          : Math.min(i + 10, indexColumn.length - 1)
      const endTimestamp = indexColumn[endIndex] as number

      // Create shape for FVG rectangle
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
        fill: "rgba(255, 255, 0, 0.2)", // Yellow with transparency
        yAxis: seriesConfig.yAxis,
      })

      // Add annotation for FVG label
      const midX = (timestamp + endTimestamp) / 2
      const midY = (top + bottom) / 2
      labels.push({
        point: {
          x: midX,
          y: midY,
          yAxis: seriesConfig.yAxis,
          xAxis: 0,
        },
        text: "FVG",
        style: {
          color: "rgba(255, 255, 255, 0.4)",
          fontSize: "8px",
        },
      })
    }
  })

  // Also keep the series for backward compatibility
  const series = generateFVGPlotKindSeriesOptions({
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
