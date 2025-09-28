import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesLineOptions, SeriesOptionsType } from "highcharts"

export const VORTEX_PLOT_KIND_DATA_KEYS = ["index", "plus_indicator", "minus_indicator"]

export interface VortexStyleOptions {
  plusColor?: string
  minusColor?: string
}

interface GenerateVortexPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: VortexStyleOptions
}

export const generateVortexPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: GenerateVortexPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const plusData: SeriesLineOptions["data"] = []
  const minusData: SeriesLineOptions["data"] = []

  extractedData.forEach((row) => {
    const [timestamp, plus, minus] = row as [number, number, number]
    if (plus !== null && !isNaN(plus)) {
      plusData.push([timestamp, plus])
    }
    if (minus !== null && !isNaN(minus)) {
      minusData.push([timestamp, minus])
    }
  })

  const series: SeriesOptionsType[] = []

  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    id: `${seriesConfig.id}_vi_plus`,
    name: `${seriesConfig.name} VI+`,
    data: plusData,
    color: styleOptions?.plusColor ?? "#16a34a", // green
    lineWidth: 1.8,
    marker: { enabled: false },
  } as SeriesLineOptions)

  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    id: `${seriesConfig.id}_vi_minus`,
    name: `${seriesConfig.name} VI-`,
    data: minusData,
    color: styleOptions?.minusColor ?? "#dc2626", // red
    lineWidth: 1.8,
    marker: { enabled: false },
  } as SeriesLineOptions)

  return series
}
