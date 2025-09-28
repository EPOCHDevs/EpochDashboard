import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesOptionsType, SeriesLineOptions } from "highcharts"
import { tailwindColors } from "../../../../utils/tailwindHelpers"

export const FISHER_PLOT_KIND_DATA_KEYS = ["index", "fisher", "fisher_signal"]

interface FisherStyleOptions {
  fisherColor?: string
  fisherSignalColor?: string
  overboughtLevel?: number
  oversoldLevel?: number
  overboughtColor?: string
  oversoldColor?: string
}

interface generateFisherPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: FisherStyleOptions
}

export const generateFisherPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateFisherPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const fisherData: SeriesLineOptions["data"] = []
  const fisherSignalData: SeriesLineOptions["data"] = []
  const overbought = styleOptions?.overboughtLevel || 2
  const oversold = styleOptions?.oversoldLevel || -2

  extractedData.forEach((row) => {
    const [timestamp, fisher, fisherSignal] = row as [number, number, number]

    if (fisher !== null && !isNaN(fisher)) {
      fisherData.push([timestamp, fisher])
    }

    if (fisherSignal !== null && !isNaN(fisherSignal)) {
      fisherSignalData.push([timestamp, fisherSignal])
    }
  })

  const series: SeriesOptionsType[] = []

  // Fisher line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} Fisher`,
    id: seriesConfig.id,
    data: fisherData,
    color: styleOptions?.fisherColor || tailwindColors.territory.cyan,
    lineWidth: 2,
    marker: {
      enabled: false,
    },
    tooltip: {
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b>Fisher</b>: {point.y:.4f}<br/>',
    },
  } as SeriesLineOptions)

  // Fisher Signal line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} Signal`,
    id: `${seriesConfig.id}_signal`,
    data: fisherSignalData,
    color: styleOptions?.fisherSignalColor || tailwindColors.secondary.yellow,
    lineWidth: 2,
    dashStyle: "Dash",
    linkedTo: seriesConfig.id,
    marker: {
      enabled: false,
    },
    tooltip: {
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b>Fisher Signal</b>: {point.y:.4f}<br/>',
    },
  } as SeriesLineOptions)

  // Overbought line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `Overbought (${overbought})`,
    id: `${seriesConfig.id}_overbought`,
    data: fisherData.map((point) => {
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
    data: fisherData.map((point) => {
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

  // Zero line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: "Zero Line",
    id: `${seriesConfig.id}_zero`,
    data: fisherData.map((point) => {
      if (Array.isArray(point) && point[0] !== undefined) {
        return [point[0], 0]
      }
      return [null, 0]
    }),
    color: "#6b7280",
    lineWidth: 1,
    dashStyle: "Solid",
    linkedTo: seriesConfig.id,
    marker: {
      enabled: false,
    },
    enableMouseTracking: false,
  } as SeriesLineOptions)

  return series
}
