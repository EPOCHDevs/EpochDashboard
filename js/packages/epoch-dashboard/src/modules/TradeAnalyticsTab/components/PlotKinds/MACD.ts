import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesColumnOptions, SeriesLineOptions, SeriesOptionsType } from "highcharts"
import { tailwindColors } from "../../../../utils/tailwindHelpers"

export const MACD_PLOT_KIND_DATA_KEYS = ["index", "macd", "macd_signal", "macd_histogram"]
export interface MACDStyleOptions {
  macdColor?: string
  signalColor?: string
  histogramBullishColor?: string
  histogramBearishColor?: string
}

interface generateMACDPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: MACDStyleOptions
}
export const generateMACDPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateMACDPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const macdLineData: SeriesLineOptions["data"] = []
  const signalLineData: SeriesLineOptions["data"] = []
  const histogramData: SeriesColumnOptions["data"] = []

  extractedData.forEach((row) => {
    const [timestamp, macd, signal, histogram] = row as [number, number, number, number]

    if (macd !== null && !isNaN(macd)) {
      macdLineData.push([timestamp, macd])
    }

    if (signal !== null && !isNaN(signal)) {
      signalLineData.push([timestamp, signal])
    }

    if (histogram !== null && !isNaN(histogram)) {
      histogramData.push([timestamp, histogram])
    }
  })

  const series: SeriesOptionsType[] = []

  // MACD line - use green to match bullish candlesticks
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} MACD`,
    id: seriesConfig.id,
    data: macdLineData,
    color: styleOptions?.macdColor || tailwindColors.territory.success,
    lineWidth: 2,
    marker: {
      enabled: false,
    },
  } as SeriesLineOptions)

  // Signal line - use white/foreground color
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} Signal`,
    id: `${seriesConfig.id}_signal`,
    data: signalLineData,
    color: styleOptions?.signalColor || tailwindColors.primary.white,
    lineWidth: 2,
    dashStyle: "Dash",
    linkedTo: seriesConfig.id,
    marker: {
      enabled: false,
    },
  } as SeriesLineOptions)

  // Histogram - match candlestick colors exactly
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "column",
    name: `${seriesConfig.name} Histogram`,
    id: `${seriesConfig.id}_histogram`,
    data: histogramData,
    color: tailwindColors.secondary.red, // Default bearish
    linkedTo: seriesConfig.id,
    borderWidth: 0, // Remove white border
    zones: [
      {
        value: 0,
        color: styleOptions?.histogramBearishColor || tailwindColors.secondary.red,
      },
      {
        color: styleOptions?.histogramBullishColor || tailwindColors.territory.success,
      },
    ],
  } as SeriesColumnOptions)

  return series
}
