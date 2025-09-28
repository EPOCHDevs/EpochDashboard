import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractPlotKindSeriesData,
  getPlotKindSeriesColor,
  getSharedPlotKindSeriesOptions,
} from "./EpochPlotKindOptions"
import { SeriesColumnOptions } from "highcharts"
import { tailwindColors } from "../../../../utils/tailwindHelpers"

export const COLUMN_PLOT_KIND_DATA_KEYS = ["index", "value"]

interface generateColumnPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesColumnOptions
}
export const generateColumnPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateColumnPlotKindSeriesOptionsProps): SeriesColumnOptions[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const columnOptions: SeriesColumnOptions = {
    type: "column",
    borderColor: "transparent",
    borderWidth: 0,
    color: tailwindColors.territory.success,
    negativeColor: tailwindColors.secondary.red,
    ...styleOptions,
  }

  // If no color is specified, generate one based on the series name
  if (!columnOptions.color) {
    columnOptions.color = getPlotKindSeriesColor(seriesConfig.name)
  }

  return [
    {
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      ...columnOptions,
      data: extractedData,
      zones: columnOptions.negativeColor
        ? [
            {
              value: 0,
              color: columnOptions.negativeColor,
            },
            {
              color: columnOptions.color,
            },
          ]
        : undefined,
    } as SeriesColumnOptions,
  ]
}
