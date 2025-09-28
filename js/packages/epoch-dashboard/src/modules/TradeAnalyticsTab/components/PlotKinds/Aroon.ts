import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesOptionsType, SeriesLineOptions } from "highcharts"
import { tailwindColors } from "../../../../utils/tailwindHelpers"

export const AROON_PLOT_KIND_DATA_KEYS = ["index", "aroon_up", "aroon_down"]

interface AroonStyleOptions {
  aroonUpColor?: string
  aroonDownColor?: string
  overboughtLevel?: number
  oversoldLevel?: number
  overboughtColor?: string
  oversoldColor?: string
}

interface generateAroonPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: AroonStyleOptions
}

export const generateAroonPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateAroonPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const aroonUpData: SeriesLineOptions["data"] = []
  const aroonDownData: SeriesLineOptions["data"] = []
  const overbought = styleOptions?.overboughtLevel || 70
  const oversold = styleOptions?.oversoldLevel || 30

  extractedData.forEach((row) => {
    const [timestamp, aroonUp, aroonDown] = row as [number, number, number]

    if (aroonUp !== null && !isNaN(aroonUp)) {
      aroonUpData.push([timestamp, aroonUp])
    }

    if (aroonDown !== null && !isNaN(aroonDown)) {
      aroonDownData.push([timestamp, aroonDown])
    }
  })

  const series: SeriesOptionsType[] = []

  // Aroon Up line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} Up`,
    id: seriesConfig.id,
    data: aroonUpData,
    color: styleOptions?.aroonUpColor || tailwindColors.territory.success,
    lineWidth: 2,
    marker: {
      enabled: false,
    },
    tooltip: {
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b>Aroon Up</b>: {point.y:.2f}<br/>',
    },
  } as SeriesLineOptions)

  // Aroon Down line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} Down`,
    id: `${seriesConfig.id}_down`,
    data: aroonDownData,
    color: styleOptions?.aroonDownColor || tailwindColors.secondary.red,
    lineWidth: 2,
    dashStyle: "Dash",
    linkedTo: seriesConfig.id,
    marker: {
      enabled: false,
    },
    tooltip: {
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b>Aroon Down</b>: {point.y:.2f}<br/>',
    },
  } as SeriesLineOptions)

  // Overbought line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `Overbought (${overbought})`,
    id: `${seriesConfig.id}_overbought`,
    data: aroonUpData.map((point) => {
      if (Array.isArray(point) && point[0] !== undefined) {
        return [point[0], overbought]
      }
      return [null, overbought]
    }),
    color: styleOptions?.overboughtColor || "#ef4444",
    lineWidth: 1,
    dashStyle: "Dot",
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
    data: aroonUpData.map((point) => {
      if (Array.isArray(point) && point[0] !== undefined) {
        return [point[0], oversold]
      }
      return [null, oversold]
    }),
    color: styleOptions?.oversoldColor || "#10b981",
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
