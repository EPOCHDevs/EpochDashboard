import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractPlotKindSeriesData,
  getPlotKindSeriesColor,
  getSharedPlotKindSeriesOptions,
} from "./EpochPlotKindOptions"
import { SeriesLineOptions } from "highcharts"
import { tailwindColors } from "../../../../utils/tailwindHelpers"

export const PANEL_LINE_PERCENT_PLOT_KIND_DATA_KEYS = ["index", "value"]

interface generatePanelLinePercentPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
export const generatePanelLinePercentPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generatePanelLinePercentPlotKindSeriesOptionsProps): SeriesLineOptions[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const lineOptions: SeriesLineOptions = {
    type: "line",
    color: tailwindColors.territory.success,
    ...styleOptions,
  }

  // If no color is specified, generate one based on the series name
  if (!lineOptions.color) {
    lineOptions.color = getPlotKindSeriesColor(seriesConfig.name)
  }

  return [
    {
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      ...lineOptions,
      data: extractedData,
      zones: lineOptions.negativeColor
        ? [
            {
              value: 0,
              color: lineOptions.negativeColor,
            },
            {
              color: lineOptions.color,
            },
          ]
        : undefined,
    } as SeriesLineOptions,
  ]
}
