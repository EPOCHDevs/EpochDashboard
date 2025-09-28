import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractColumn,
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
} from "./EpochPlotKindOptions"
import { SeriesLineOptions, SeriesOptionsType } from "highcharts"

export const BOSCHOCH_PLOT_KIND_DATA_KEYS = ["index", "bos", "choch", "level", "broken_index"]
export interface BOSCHOCHStyleOptions {
  bosColor?: string
  chochColor?: string
  lineWidth?: number
}

interface generateBOSCHOCHPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: BOSCHOCHStyleOptions
}
export const generateBOSCHOCHPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateBOSCHOCHPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })
  const indexColumn = extractColumn({
    data,
    columnName: "index",
  })

  const bosLineData: SeriesLineOptions["data"] = []
  const chochLineData: SeriesLineOptions["data"] = []

  extractedData.forEach((row) => {
    const [timestamp, bos, choch, level, brokenIndex] = row as [
      number,
      number,
      number,
      number,
      number,
    ]

    // Handle BOS (Break of Structure)
    if (bos !== null && !isNaN(bos)) {
      const endTimestamp = (indexColumn[brokenIndex] as number) || timestamp

      // Add line data points
      bosLineData.push({
        x: timestamp,
        y: level,
        marker: {
          enabled: false,
        },
      })
      bosLineData.push({
        x: endTimestamp,
        y: level,
        marker: {
          enabled: false,
        },
      })

      // Add a null point to break the line
      bosLineData.push({
        x: undefined,
        y: undefined,
      })
    }

    // Handle CHOCH (Change of Character)
    if (choch !== null && !isNaN(choch)) {
      const endTimestamp = (indexColumn[brokenIndex] as number) || timestamp

      // Add line data points
      chochLineData.push({
        x: timestamp,
        y: level,
        marker: {
          enabled: false,
        },
      })
      chochLineData.push({
        x: endTimestamp,
        y: level,
        marker: {
          enabled: false,
        },
      })

      // Add a null point to break the line
      chochLineData.push({
        x: undefined,
        y: undefined,
      })
    }
  })

  const series: SeriesOptionsType[] = []

  // BOS line series
  if (bosLineData.length > 0) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: `${seriesConfig.name} BOS`,
      id: seriesConfig.id,
      data: bosLineData,
      color: styleOptions?.bosColor ?? "rgba(255, 165, 0, 0.4)",
      lineWidth: styleOptions?.lineWidth || 2,
      marker: {
        enabled: false,
      },
      connectNulls: false,
    } as SeriesLineOptions)
  }

  // CHOCH line series
  if (chochLineData.length > 0) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: `${seriesConfig.name} CHOCH`,
      id: `${seriesConfig.id}_choch`,
      data: chochLineData,
      color: styleOptions?.chochColor ?? "rgba(0, 0, 255, 0.4)",
      lineWidth: styleOptions?.lineWidth || 2,
      dashStyle: "Dot",
      linkedTo: bosLineData.length > 0 ? seriesConfig.id : undefined,
      marker: {
        enabled: false,
      },
      connectNulls: false,
    } as SeriesLineOptions)
  }

  // If neither BOS nor CHOCH data exists, return an empty line series
  if (series.length === 0) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: seriesConfig.name,
      id: seriesConfig.id,
      data: [],
      color: styleOptions?.bosColor ?? "rgba(255, 165, 0, 0.4)",
    } as SeriesLineOptions)
  }

  return series
}
