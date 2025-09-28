import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesColumnOptions, SeriesLineOptions, SeriesOptionsType } from "highcharts"

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

  // MACD line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} MACD`,
    id: seriesConfig.id,
    data: macdLineData,
    color: styleOptions?.macdColor || "#2563eb",
    lineWidth: 2,
    marker: {
      enabled: false,
    },
  } as SeriesLineOptions)

  // Signal line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} Signal`,
    id: `${seriesConfig.id}_signal`,
    data: signalLineData,
    color: styleOptions?.signalColor || "#f59e0b",
    lineWidth: 2,
    dashStyle: "Dash",
    linkedTo: seriesConfig.id,
    marker: {
      enabled: false,
    },
  } as SeriesLineOptions)

  // Histogram
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "column",
    name: `${seriesConfig.name} Histogram`,
    id: `${seriesConfig.id}_histogram`,
    data: histogramData,
    color: "#6b7280", // Default gray
    linkedTo: seriesConfig.id,
    zones: [
      {
        value: 0,
        color: styleOptions?.histogramBearishColor || "#ef4444",
      },
      {
        color: styleOptions?.histogramBullishColor || "#10b981",
      },
    ],
  } as SeriesColumnOptions)

  return series
}
