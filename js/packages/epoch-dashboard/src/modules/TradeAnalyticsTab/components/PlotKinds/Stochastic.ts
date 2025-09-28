import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesLineOptions, SeriesOptionsType } from "highcharts"

export const STOCHASTIC_PLOT_KIND_DATA_KEYS = ["index", "stoch_k", "stoch_d"]
export interface StochasticStyleOptions {
  kLineColor?: string
  dLineColor?: string
  overboughtColor?: string
  oversoldColor?: string
  overboughtLevel?: number
  oversoldLevel?: number
}

interface generateStochasticPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: StochasticStyleOptions
}
export const generateStochasticPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateStochasticPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const kLineData: SeriesLineOptions["data"] = []
  const dLineData: SeriesLineOptions["data"] = []
  const overbought = styleOptions?.overboughtLevel || 80
  const oversold = styleOptions?.oversoldLevel || 20

  extractedData.forEach((row) => {
    const [timestamp, kValue, dValue] = row as [number, number, number]

    if (kValue !== null && !isNaN(kValue)) {
      kLineData.push([timestamp, kValue])
    }

    if (dValue !== null && !isNaN(dValue)) {
      dLineData.push([timestamp, dValue])
    }
  })

  const series: SeriesOptionsType[] = []

  // %K line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} %K`,
    id: seriesConfig.id,
    data: kLineData,
    color: styleOptions?.kLineColor || "#3b82f6",
    lineWidth: 2,
    marker: {
      enabled: false,
    },
    tooltip: {
      pointFormat: '<span style="color:{point.color}">\u25CF</span> <b>%K</b>: {point.y:.2f}<br/>',
    },
  } as SeriesLineOptions)

  // %D line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} %D`,
    id: `${seriesConfig.id}_d`,
    data: dLineData,
    color: styleOptions?.dLineColor || "#f59e0b",
    lineWidth: 2,
    dashStyle: "Dash",
    linkedTo: seriesConfig.id,
    marker: {
      enabled: false,
    },
    tooltip: {
      pointFormat: '<span style="color:{point.color}">\u25CF</span> <b>%D</b>: {point.y:.2f}<br/>',
    },
  } as SeriesLineOptions)

  // Overbought line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `Overbought (${overbought})`,
    id: `${seriesConfig.id}_overbought`,
    data: kLineData.map((point) => {
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
    data: kLineData.map((point) => {
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

  return series
}
