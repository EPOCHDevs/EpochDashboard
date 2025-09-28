import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { SeriesFlagsOptions } from "highcharts"
import { tailwindColors } from "../../../../utils/tailwindHelpers"
import { TRADE_ANALYTICS_PLOT_STYLES } from "../../../../constants/tradeAnalytics"

export const FLAG_PLOT_KIND_DATA_KEYS = ["index", "value"]

interface generateFlagPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
}
export const generateFlagPlotKindSeriesOptions = ({
  data,
  seriesConfig,
}: generateFlagPlotKindSeriesOptionsProps): SeriesFlagsOptions[] => {
  // Get the boolean values and timestamps from data
  const valueColumn = data?.getChild(seriesConfig.dataMapping.value || "value")
  const indexColumn = data?.getChild(seriesConfig.dataMapping.index || "index")

  if (!valueColumn || !indexColumn) {
    console.warn("FlagPlotKindHandler: Missing required columns")
    return [
      {
        type: "flags",
        name: seriesConfig.name,
        data: [],
      } as SeriesFlagsOptions,
    ]
  }

  // Convert boolean data to flag data points
  const flagData: SeriesFlagsOptions["data"] = []

  // Determine flag appearance based on series ID
  let flagTitle: string
  let flagText: string
  let flagColor: string
  let textColor: string

  if (seriesConfig.id.toLowerCase() === "long") {
    flagTitle = "L"
    flagText = "LONG"
    flagColor = tailwindColors.territory.success
    textColor = tailwindColors.primary.white
  } else if (seriesConfig.id.toLowerCase() === "short") {
    flagTitle = "S"
    flagText = "SHORT"
    flagColor = tailwindColors.secondary.red
    textColor = tailwindColors.primary.white
  } else {
    flagTitle = "C"
    flagText = "CrossOver"
    flagColor = tailwindColors.territory.cyan
    textColor = tailwindColors.primary.white
  }

  // Track the first flag value to avoid adding multiple flags for the same value
  let lastFlag = null
  for (let i = 0; i < valueColumn.length; i++) {
    const value = valueColumn.get(i)
    const timestamp = indexColumn.get(i)

    // Add a flag where value is true
    if (value === true && lastFlag !== true) {
      flagData.push({
        x: timestamp,
        title: flagTitle,
        text: flagText,
      })
    }
    lastFlag = value
  }

  // Get default flag styles
  const styles = TRADE_ANALYTICS_PLOT_STYLES.flag

  const seriesOptions: SeriesFlagsOptions = {
    type: "flags",
    name: seriesConfig.name,
    id: seriesConfig.id,
    data: flagData,
    yAxis: seriesConfig.yAxis,
    zIndex: seriesConfig.zIndex,
    shape: styles.shape,
    width: styles.width,
    fillColor: flagColor,
    color: flagColor,
    lineWidth: styles.lineWidth,
    style: {
      color: textColor,
    },
    states: {
      hover: {
        fillColor: flagColor,
        brightness: 0.3,
      },
    },
    accessibility: {
      exposeAsGroupOnly: true,
      description: `${seriesConfig.name} flags`,
    },
  }

  return [seriesOptions]
}
