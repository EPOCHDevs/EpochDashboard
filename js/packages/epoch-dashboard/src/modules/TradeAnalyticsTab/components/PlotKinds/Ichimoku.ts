import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesArearangeOptions, SeriesLineOptions, SeriesOptionsType } from "highcharts"

export const ICHIMOKU_PLOT_KIND_DATA_KEYS = [
  "index",
  "tenkan",
  "kijun",
  "senkou_a",
  "senkou_b",
  "chikou",
]

export interface IchimokuStyleOptions {
  tenkanColor?: string
  kijunColor?: string
  senkouAColor?: string
  senkouBColor?: string
  chikouColor?: string
  cloudBullishFill?: string
  cloudBearishFill?: string
}

interface GenerateIchimokuPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: IchimokuStyleOptions
}

export const generateIchimokuPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: GenerateIchimokuPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const tenkanData: SeriesLineOptions["data"] = []
  const kijunData: SeriesLineOptions["data"] = []
  const senkouAData: SeriesLineOptions["data"] = []
  const senkouBData: SeriesLineOptions["data"] = []
  const chikouData: SeriesLineOptions["data"] = []
  const cloudRangeData: SeriesArearangeOptions["data"] = []

  extractedData.forEach((row) => {
    const [timestamp, tenkan, kijun, senkouA, senkouB, chikou] = row as [
      number,
      number,
      number,
      number,
      number,
      number,
    ]

    if (tenkan !== null && !isNaN(tenkan)) tenkanData.push([timestamp, tenkan])
    if (kijun !== null && !isNaN(kijun)) kijunData.push([timestamp, kijun])
    if (senkouA !== null && !isNaN(senkouA)) senkouAData.push([timestamp, senkouA])
    if (senkouB !== null && !isNaN(senkouB)) senkouBData.push([timestamp, senkouB])
    if (chikou !== null && !isNaN(chikou)) chikouData.push([timestamp, chikou])

    if (senkouA !== null && !isNaN(senkouA) && senkouB !== null && !isNaN(senkouB)) {
      const lower = Math.min(senkouA, senkouB)
      const upper = Math.max(senkouA, senkouB)
      cloudRangeData.push([timestamp, lower, upper])
    }
  })

  const series: SeriesOptionsType[] = []

  // Tenkan-sen
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    id: `${seriesConfig.id}_tenkan`,
    name: `${seriesConfig.name} Tenkan-sen`,
    data: tenkanData,
    color: styleOptions?.tenkanColor ?? "#2563eb",
    lineWidth: 1.5,
    marker: { enabled: false },
  } as SeriesLineOptions)

  // Kijun-sen
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    id: `${seriesConfig.id}_kijun`,
    name: `${seriesConfig.name} Kijun-sen`,
    data: kijunData,
    color: styleOptions?.kijunColor ?? "#f59e0b",
    lineWidth: 1.5,
    marker: { enabled: false },
  } as SeriesLineOptions)

  // Senkou A
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    id: `${seriesConfig.id}_senkou_a`,
    name: `${seriesConfig.name} Senkou A`,
    data: senkouAData,
    color: styleOptions?.senkouAColor ?? "#10b981",
    lineWidth: 1.2,
    marker: { enabled: false },
  } as SeriesLineOptions)

  // Senkou B
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    id: `${seriesConfig.id}_senkou_b`,
    name: `${seriesConfig.name} Senkou B`,
    data: senkouBData,
    color: styleOptions?.senkouBColor ?? "#ef4444",
    lineWidth: 1.2,
    marker: { enabled: false },
  } as SeriesLineOptions)

  // Chikou span
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    id: `${seriesConfig.id}_chikou`,
    name: `${seriesConfig.name} Chikou Span`,
    data: chikouData,
    color: styleOptions?.chikouColor ?? "#8b5cf6",
    lineWidth: 1,
    dashStyle: "Dash",
    marker: { enabled: false },
  } as SeriesLineOptions)

  // Cloud as arearange between Senkou A and B
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "arearange",
    id: `${seriesConfig.id}_cloud`,
    name: `${seriesConfig.name} Cloud`,
    data: cloudRangeData,
    color: styleOptions?.cloudBullishFill ?? "rgba(16, 185, 129, 0.12)",
    lineWidth: 0,
    marker: { enabled: false },
    enableMouseTracking: false,
    zIndex: (seriesConfig.zIndex ?? 0) - 1,
  } as SeriesArearangeOptions)

  return series
}
