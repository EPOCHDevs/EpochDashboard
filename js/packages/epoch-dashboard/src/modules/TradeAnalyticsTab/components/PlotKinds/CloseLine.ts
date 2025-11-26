import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractPlotKindSeriesData,
  getPlotKindSeriesColor,
  getSharedPlotKindSeriesOptions,
} from "./EpochPlotKindOptions"
import { SeriesLineOptions } from "highcharts"

export const CLOSE_LINE_PLOT_KIND_DATA_KEYS = ["index", "c"]

interface generateCloseLinePlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}

export const generateCloseLinePlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateCloseLinePlotKindSeriesOptionsProps): SeriesLineOptions[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const lineOptions: SeriesLineOptions = {
    type: "line",
    lineWidth: 1,
    opacity: 1,
    ...styleOptions,
  }

  // If no color is specified, use default blue
  if (!lineOptions.color) {
    lineOptions.color = "#3B82F6"
  }

  return [
    {
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      ...lineOptions,
      data: extractedData,
      color: lineOptions.color,
      lineWidth: lineOptions.lineWidth || 1,
      opacity: lineOptions.opacity,
      marker: {
        enabled: false, // Disable markers by default for performance
        radius: 3,
      },
    } as SeriesLineOptions,
  ]
}
