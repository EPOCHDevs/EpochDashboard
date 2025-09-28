import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesOptionsType, SeriesLineOptions } from "highcharts"
import { tailwindColors } from "../../../../utils/tailwindHelpers"

export const QSTICK_PLOT_KIND_DATA_KEYS = ["index", "value"]

interface QStickStyleOptions {
  qstickColor?: string
  zeroLineColor?: string
}

interface generateQStickPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: QStickStyleOptions
}

export const generateQStickPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateQStickPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const qstickData: SeriesLineOptions["data"] = []

  extractedData.forEach((row) => {
    const [timestamp, value] = row as [number, number]

    if (value !== null && !isNaN(value)) {
      qstickData.push([timestamp, value])
    }
  })

  const series: SeriesOptionsType[] = []

  // QStick line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: seriesConfig.name,
    id: seriesConfig.id,
    data: qstickData,
    color: styleOptions?.qstickColor || tailwindColors.territory.cyan,
    lineWidth: 2,
    marker: {
      enabled: false,
    },
    tooltip: {
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b>QStick</b>: {point.y:.4f}<br/>',
    },
  } as SeriesLineOptions)

  // Zero line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: "Zero Line",
    id: `${seriesConfig.id}_zero`,
    data: qstickData.map((point) => {
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
