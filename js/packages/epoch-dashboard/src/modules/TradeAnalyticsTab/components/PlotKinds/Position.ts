import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesLineOptions } from "highcharts"
import { tailwindColors } from "../../../../utils/tailwindHelpers"

export const POSITION_PLOT_KIND_DATA_KEYS = ["index", "value"]

interface generatePositionPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
}

export const generatePositionPlotKindSeriesOptions = ({
  data,
  seriesConfig,
}: generatePositionPlotElementsProps): SeriesLineOptions[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const lineOptions: SeriesLineOptions = {
    type: "line",
    lineWidth: 2,
    opacity: 1,
    color: tailwindColors.territory.cyan,
    step: "left", // Step line for position quantity
    marker: {
      enabled: false,
    },
  }

  return [
    {
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      ...lineOptions,
      data: extractedData as SeriesLineOptions["data"],
    } as SeriesLineOptions,
  ]
}
