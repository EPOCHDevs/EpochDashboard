import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesLineOptions, SeriesOptionsType } from "highcharts"

export const RSI_PLOT_KIND_DATA_KEYS = ["index", "value"]
export interface RSIStyleOptions {
  rsiColor?: string
  overboughtColor?: string
  oversoldColor?: string
  midlineColor?: string
  overboughtLevel?: number
  oversoldLevel?: number
}

interface generateRSIPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: RSIStyleOptions
}
export const generateRSIPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateRSIPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const rsiData: SeriesLineOptions["data"] = []
  const overbought = styleOptions?.overboughtLevel || 70
  const oversold = styleOptions?.oversoldLevel || 30

  extractedData.forEach((row) => {
    const [timestamp, rsi] = row as [number, number]

    if (rsi !== null && !isNaN(rsi)) {
      rsiData.push([timestamp, rsi])
    }
  })

  const series: SeriesOptionsType[] = []

  // Main RSI line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: seriesConfig.name,
    id: seriesConfig.id,
    data: rsiData,
    color: styleOptions?.rsiColor || "#8b5cf6",
    lineWidth: 2,
    marker: {
      enabled: false,
    },
  } as SeriesLineOptions)

  // Overbought line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `Overbought (${overbought})`,
    id: `${seriesConfig.id}_overbought`,
    data: rsiData.map((point) => {
      if (Array.isArray(point) && point[0] !== undefined) {
        return [point[0], overbought]
      }
      return [null, overbought]
    }),
    color: styleOptions?.overboughtColor || "#ef4444",
    lineWidth: 1,
    dashStyle: "Dash",
    linkedTo: seriesConfig.id,
    marker: {
      enabled: false,
    },
    enableMouseTracking: false,
  } as SeriesLineOptions)

  // Oversold line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `Oversold (${oversold})`,
    id: `${seriesConfig.id}_oversold`,
    data: rsiData.map((point) => {
      if (Array.isArray(point) && point[0] !== undefined) {
        return [point[0], oversold]
      }
      return [null, oversold]
    }),
    color: styleOptions?.oversoldColor || "#10b981",
    lineWidth: 1,
    dashStyle: "Dash",
    linkedTo: seriesConfig.id,
    marker: {
      enabled: false,
    },
    enableMouseTracking: false,
  } as SeriesLineOptions)

  // Midline
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: "Midline (50)",
    id: `${seriesConfig.id}_midline`,
    data: rsiData.map((point) => {
      if (Array.isArray(point) && point[0] !== undefined) {
        return [point[0], 50]
      }
      return [null, 50]
    }),
    color: styleOptions?.midlineColor || "#6b7280",
    lineWidth: 1,
    dashStyle: "Dot",
    linkedTo: seriesConfig.id,
    marker: {
      enabled: false,
    },
    enableMouseTracking: false,
  } as SeriesLineOptions)

  return series
}
