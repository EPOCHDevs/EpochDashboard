import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesLineOptions, SeriesOptionsType } from "highcharts"

export const CHANDE_KROLL_PLOT_KIND_DATA_KEYS = ["index", "long_stop", "short_stop"]

export interface ChandeKrollStyleOptions {
  longColor?: string
  shortColor?: string
}

interface GenerateChandeKrollPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: ChandeKrollStyleOptions
}

export const generateChandeKrollPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: GenerateChandeKrollPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const longStopData: SeriesLineOptions["data"] = []
  const shortStopData: SeriesLineOptions["data"] = []

  extractedData.forEach((row) => {
    const [timestamp, longStop, shortStop] = row as [number, number, number]
    if (longStop !== null && !isNaN(longStop)) longStopData.push([timestamp, longStop])
    if (shortStop !== null && !isNaN(shortStop)) shortStopData.push([timestamp, shortStop])
  })

  const series: SeriesOptionsType[] = []

  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    id: `${seriesConfig.id}_long_stop`,
    name: `${seriesConfig.name} Long Stop`,
    data: longStopData,
    color: styleOptions?.longColor ?? "#1d4ed8",
    lineWidth: 2,
    marker: { enabled: false },
  } as SeriesLineOptions)

  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    id: `${seriesConfig.id}_short_stop`,
    name: `${seriesConfig.name} Short Stop`,
    data: shortStopData,
    color: styleOptions?.shortColor ?? "#ea580c",
    lineWidth: 2,
    marker: { enabled: false },
  } as SeriesLineOptions)

  return series
}
