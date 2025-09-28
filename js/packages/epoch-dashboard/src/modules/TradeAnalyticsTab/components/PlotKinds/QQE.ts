import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesOptionsType, SeriesLineOptions } from "highcharts"
import { tailwindColors } from "../../../../utils/tailwindHelpers"

export const QQE_PLOT_KIND_DATA_KEYS = ["index", "short_line", "long_line", "rsi_ma", "result"]

interface QQEStyleOptions {
  shortLineColor?: string
  longLineColor?: string
  rsiMaColor?: string
  resultColor?: string
  overboughtLevel?: number
  oversoldLevel?: number
  overboughtColor?: string
  oversoldColor?: string
  midlineColor?: string
}

interface generateQQEPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: QQEStyleOptions
}

export const generateQQEPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateQQEPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const shortLineData: SeriesLineOptions["data"] = []
  const longLineData: SeriesLineOptions["data"] = []
  const rsiMaData: SeriesLineOptions["data"] = []
  const resultData: SeriesLineOptions["data"] = []
  const overbought = styleOptions?.overboughtLevel || 70
  const oversold = styleOptions?.oversoldLevel || 30

  extractedData.forEach((row) => {
    const [timestamp, shortLine, longLine, rsiMa, result] = row as [
      number,
      number,
      number,
      number,
      number,
    ]

    if (shortLine !== null && !isNaN(shortLine)) {
      shortLineData.push([timestamp, shortLine])
    }

    if (longLine !== null && !isNaN(longLine)) {
      longLineData.push([timestamp, longLine])
    }

    if (rsiMa !== null && !isNaN(rsiMa)) {
      rsiMaData.push([timestamp, rsiMa])
    }

    if (result !== null && !isNaN(result)) {
      resultData.push([timestamp, result])
    }
  })

  const series: SeriesOptionsType[] = []

  // QQE Short Line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} Short`,
    id: seriesConfig.id,
    data: shortLineData,
    color: styleOptions?.shortLineColor || tailwindColors.territory.cyan,
    lineWidth: 2,
    marker: {
      enabled: false,
    },
    tooltip: {
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b>QQE Short</b>: {point.y:.2f}<br/>',
    },
  } as SeriesLineOptions)

  // QQE Long Line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} Long`,
    id: `${seriesConfig.id}_long`,
    data: longLineData,
    color: styleOptions?.longLineColor || tailwindColors.secondary.yellow,
    lineWidth: 2,
    dashStyle: "Dash",
    linkedTo: seriesConfig.id,
    marker: {
      enabled: false,
    },
    tooltip: {
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b>QQE Long</b>: {point.y:.2f}<br/>',
    },
  } as SeriesLineOptions)

  // QQE RSI MA
  if (rsiMaData.length > 0) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: `${seriesConfig.name} RSI MA`,
      id: `${seriesConfig.id}_rsi_ma`,
      data: rsiMaData,
      color: styleOptions?.rsiMaColor || tailwindColors.secondary.purple,
      lineWidth: 1.5,
      dashStyle: "Dot",
      linkedTo: seriesConfig.id,
      marker: {
        enabled: false,
      },
      tooltip: {
        pointFormat:
          '<span style="color:{point.color}">\u25CF</span> <b>QQE RSI MA</b>: {point.y:.2f}<br/>',
      },
    } as SeriesLineOptions)
  }

  // QQE Result
  if (resultData.length > 0) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: `${seriesConfig.name} Result`,
      id: `${seriesConfig.id}_result`,
      data: resultData,
      color: styleOptions?.resultColor || tailwindColors.territory.success,
      lineWidth: 2,
      dashStyle: "DashDot",
      linkedTo: seriesConfig.id,
      marker: {
        enabled: false,
      },
      tooltip: {
        pointFormat:
          '<span style="color:{point.color}">\u25CF</span> <b>QQE Result</b>: {point.y:.2f}<br/>',
      },
    } as SeriesLineOptions)
  }

  // Overbought line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `Overbought (${overbought})`,
    id: `${seriesConfig.id}_overbought`,
    data: shortLineData.map((point) => {
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
    data: shortLineData.map((point) => {
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

  // Midline
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: "Midline (50)",
    id: `${seriesConfig.id}_midline`,
    data: shortLineData.map((point) => {
      if (Array.isArray(point) && point[0] !== undefined) {
        return [point[0], 50]
      }
      return [null, 50]
    }),
    color: styleOptions?.midlineColor || "#6b7280",
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
