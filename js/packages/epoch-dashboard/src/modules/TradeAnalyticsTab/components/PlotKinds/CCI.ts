import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesOptionsType, SeriesLineOptions } from "highcharts"
import { tailwindColors } from "../../../../utils/tailwindHelpers"

export const CCI_PLOT_KIND_DATA_KEYS = ["index", "value"]

interface CCIStyleOptions {
  cciColor?: string
  overboughtLevel?: number
  oversoldLevel?: number
  zeroLineColor?: string
  overboughtColor?: string
  oversoldColor?: string
}

interface generateCCIPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: CCIStyleOptions
}

export const generateCCIPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateCCIPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const cciData: SeriesLineOptions["data"] = []
  const overbought = styleOptions?.overboughtLevel || 100
  const oversold = styleOptions?.oversoldLevel || -100

  extractedData.forEach((row) => {
    const [timestamp, value] = row as [number, number]

    if (value !== null && !isNaN(value)) {
      cciData.push([timestamp, value])
    }
  })

  const series: SeriesOptionsType[] = []

  // CCI main line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: seriesConfig.name,
    id: seriesConfig.id,
    data: cciData,
    color: styleOptions?.cciColor || tailwindColors.territory.cyan,
    lineWidth: 2,
    marker: {
      enabled: false,
    },
    tooltip: {
      pointFormat: '<span style="color:{point.color}">\u25CF</span> <b>CCI</b>: {point.y:.2f}<br/>',
    },
  } as SeriesLineOptions)

  // Overbought line (+100)
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `Overbought (${overbought})`,
    id: `${seriesConfig.id}_overbought`,
    data: cciData.map((point) => {
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

  // Oversold line (-100)
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `Oversold (${oversold})`,
    id: `${seriesConfig.id}_oversold`,
    data: cciData.map((point) => {
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
    data: cciData.map((point) => {
      if (Array.isArray(point) && point[0] !== undefined) {
        return [point[0], 0]
      }
      return [null, 0]
    }),
    color: styleOptions?.zeroLineColor || "#6b7280",
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
