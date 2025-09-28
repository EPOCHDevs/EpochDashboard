import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesArearangeOptions, SeriesLineOptions, SeriesOptionsType } from "highcharts"

export const BOLLINGER_BANDS_PLOT_KIND_DATA_KEYS = [
  "index",
  "bbands_upper",
  "bbands_middle",
  "bbands_lower",
]
export interface BollingerBandsStyleOptions {
  upperBandColor?: string
  middleBandColor?: string
  lowerBandColor?: string
  fillColor?: string
}
interface generateBollingerBandsPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: BollingerBandsStyleOptions
}
export const generateBollingerBandsPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateBollingerBandsPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  // Prepare data for different series
  const areaRangeData: SeriesArearangeOptions["data"] = []
  const upperLineData: SeriesLineOptions["data"] = []
  const middleLineData: SeriesLineOptions["data"] = []
  const lowerLineData: SeriesLineOptions["data"] = []

  extractedData.forEach((row) => {
    const [timestamp, upper, middle, lower] = row as [number, number, number, number]

    if (upper !== null && !isNaN(upper) && lower !== null && !isNaN(lower)) {
      areaRangeData.push([timestamp, lower, upper])
      upperLineData.push([timestamp, upper])
      lowerLineData.push([timestamp, lower])
    }

    if (middle !== null && !isNaN(middle)) {
      middleLineData.push([timestamp, middle])
    }
  })

  const series: SeriesOptionsType[] = []

  // Area range series
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "arearange",
    name: `${seriesConfig.name} Range`,
    id: `${seriesConfig.id}_range`,
    data: areaRangeData,
    fillColor: styleOptions?.fillColor ?? "rgba(37, 99, 235, 0.1)",
    lineWidth: 0,
    marker: {
      enabled: false,
    },
  } as SeriesArearangeOptions)

  // Upper band line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} Upper`,
    id: `${seriesConfig.id}_upper`,
    data: upperLineData,
    color: styleOptions?.upperBandColor ?? "#2563eb",
    lineWidth: 1.5,
    marker: {
      enabled: false,
    },
    linkedTo: `${seriesConfig.id}_range`,
  } as SeriesLineOptions)

  // Middle band line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} Middle`,
    id: `${seriesConfig.id}_middle`,
    data: middleLineData,
    color: styleOptions?.middleBandColor ?? "#64748b",
    lineWidth: 1.5,
    dashStyle: "Dash",
    marker: {
      enabled: false,
    },
    linkedTo: `${seriesConfig.id}_range`,
  } as SeriesLineOptions)

  // Lower band line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} Lower`,
    id: `${seriesConfig.id}_lower`,
    data: lowerLineData,
    color: styleOptions?.lowerBandColor ?? "#2563eb",
    lineWidth: 1.5,
    marker: {
      enabled: false,
    },
    linkedTo: `${seriesConfig.id}_range`,
  } as SeriesLineOptions)

  return series
}
