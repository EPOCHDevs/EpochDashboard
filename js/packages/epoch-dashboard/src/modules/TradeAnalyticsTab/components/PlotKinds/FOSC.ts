import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesOptionsType, SeriesLineOptions } from "highcharts"
import { tailwindColors } from "../../../../utils/tailwindHelpers"

export const FOSC_PLOT_KIND_DATA_KEYS = ["index", "value"]

interface FOSCStyleOptions {
  foscColor?: string
  zeroLineColor?: string
}

interface generateFOSCPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: FOSCStyleOptions
}

export const generateFOSCPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateFOSCPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const foscData: SeriesLineOptions["data"] = []

  extractedData.forEach((row) => {
    const [timestamp, value] = row as [number, number]

    if (value !== null && !isNaN(value)) {
      foscData.push([timestamp, value * 100])
    }
  })

  const series: SeriesOptionsType[] = []

  // FOSC main line with conditional coloring
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: seriesConfig.name,
    id: seriesConfig.id,
    data: foscData,
    color: tailwindColors.territory.success, // Default color for positive values
    lineWidth: 2,
    marker: {
      enabled: false,
    },
    zones: [
      {
        value: 0, // Values below 0 use this color
        color: styleOptions?.foscColor || tailwindColors.secondary.red,
      },
      {
        // Values above 0 use the default color (green)
        color: tailwindColors.territory.success,
      },
    ],
    tooltip: {
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> <b>FOSC</b>: {point.y:.2f}<br/>',
    },
  } as SeriesLineOptions)

  // Zero line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: "Zero Line",
    id: `${seriesConfig.id}_zero`,
    data: foscData.map((point) => {
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
