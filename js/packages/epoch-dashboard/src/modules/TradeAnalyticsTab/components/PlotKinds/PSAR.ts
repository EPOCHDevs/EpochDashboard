import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesOptionsType, SeriesScatterOptions } from "highcharts"
import { tailwindColors } from "../../../../utils/tailwindHelpers"

export const PSAR_PLOT_KIND_DATA_KEYS = ["index", "value"]

interface PSARStyleOptions {
  psarColor?: string
  pointSize?: number
}

interface generatePSARPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: PSARStyleOptions
}

export const generatePSARPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generatePSARPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const psarPoints: SeriesScatterOptions["data"] = []

  extractedData.forEach((row) => {
    const [timestamp, value] = row as [number, number]

    if (value !== null && !isNaN(value)) {
      psarPoints.push([timestamp, value])
    }
  })

  const series: SeriesOptionsType[] = []

  // PSAR points
  if (psarPoints.length > 0) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "scatter",
      name: seriesConfig.name,
      id: seriesConfig.id,
      data: psarPoints,
      color: styleOptions?.psarColor || tailwindColors.territory.cyan,
      marker: {
        symbol: "circle",
        radius: styleOptions?.pointSize || 3,
        enabled: true,
        states: {
          hover: {
            enabled: true,
            radiusPlus: 2,
          },
        },
      },
      tooltip: {
        pointFormat:
          '<span style="color:{point.color}">\u25CF</span> <b>PSAR</b>: {point.y:.4f}<br/>',
      },
      enableMouseTracking: true,
    } as SeriesScatterOptions)
  }

  return series
}
