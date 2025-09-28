import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesLineOptions } from "highcharts"
import { tailwindColors } from "../../../../utils/tailwindHelpers"

export const ATR_PLOT_KIND_DATA_KEYS = ["index", "value"]

interface generateATRPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesLineOptions
}
export const generateATRPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateATRPlotKindSeriesOptionsProps): SeriesLineOptions[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const atrOptions: SeriesLineOptions = {
    type: "line",
    color: tailwindColors.territory.success,
    lineWidth: 2,
    marker: {
      enabled: false,
    },
    ...styleOptions,
  }

  return [
    {
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      ...atrOptions,
      data: extractedData,
    } as SeriesLineOptions,
  ]
}
