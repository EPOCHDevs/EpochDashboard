import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractPlotKindSeriesData,
  getPlotKindSeriesColor,
  getSharedPlotKindSeriesOptions,
} from "./EpochPlotKindOptions"
import { SeriesLineOptions } from "highcharts"

export const LINE_PLOT_KIND_DATA_KEYS = ["index", "value"]

interface generateLinePlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
export const generateLinePlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateLinePlotKindSeriesOptionsProps): SeriesLineOptions[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const lineOptions: SeriesLineOptions = {
    type: "line",
    lineWidth: 2,
    opacity: 1,
    ...styleOptions,
  }

  // If no color is specified, generate one based on the series name
  if (!lineOptions.color) {
    lineOptions.color = getPlotKindSeriesColor(seriesConfig.name)
  }

  const convertDashArray = (dashStyle?: string): Highcharts.DashStyleValue | undefined => {
    if (!dashStyle) return undefined
    // Convert CSS dash array to Highcharts dash style
    const dashMap: { [key: string]: Highcharts.DashStyleValue } = {
      "5,5": "Dash",
      "10,5": "DashDot",
      "15,10,5,10": "LongDashDot",
      "2,2": "Dot",
      "15,10,5,10,5,10": "LongDashDotDot",
    }
    return dashMap[dashStyle] || "Solid"
  }

  return [
    {
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      ...lineOptions,
      data: extractedData,
      color: lineOptions.color,
      lineWidth: lineOptions.lineWidth || 2,
      dashStyle: convertDashArray(lineOptions.dashStyle),
      opacity: lineOptions.opacity,
      marker: {
        enabled: false, // Disable markers by default for performance
        radius: 3,
      },
    } as SeriesLineOptions,
  ]
}
