import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesLineOptions, SeriesOptionsType } from "highcharts"

export const PIVOT_POINT_SR_PLOT_KIND_DATA_KEYS = [
  "index",
  "pivot",
  "resist_1",
  "support_1",
  "resist_2",
  "support_2",
  "resist_3",
  "support_3",
]

export interface PivotPointSRStyleOptions {
  pivotColor?: string
  support1Color?: string
  support2Color?: string
  support3Color?: string
  resist1Color?: string
  resist2Color?: string
  resist3Color?: string
}

interface generatePivotPointSRPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: PivotPointSRStyleOptions
}

export const generatePivotPointSRPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generatePivotPointSRPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  // Prepare data for different series
  const pivotData: SeriesLineOptions["data"] = []
  const resist1Data: SeriesLineOptions["data"] = []
  const support1Data: SeriesLineOptions["data"] = []
  const resist2Data: SeriesLineOptions["data"] = []
  const support2Data: SeriesLineOptions["data"] = []
  const resist3Data: SeriesLineOptions["data"] = []
  const support3Data: SeriesLineOptions["data"] = []

  extractedData.forEach((row) => {
    const [timestamp, pivot, resist1, support1, resist2, support2, resist3, support3] = row as [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ]

    if (pivot !== null && !isNaN(pivot)) {
      pivotData.push([timestamp, pivot])
    }
    if (resist1 !== null && !isNaN(resist1)) {
      resist1Data.push([timestamp, resist1])
    }
    if (support1 !== null && !isNaN(support1)) {
      support1Data.push([timestamp, support1])
    }
    if (resist2 !== null && !isNaN(resist2)) {
      resist2Data.push([timestamp, resist2])
    }
    if (support2 !== null && !isNaN(support2)) {
      support2Data.push([timestamp, support2])
    }
    if (resist3 !== null && !isNaN(resist3)) {
      resist3Data.push([timestamp, resist3])
    }
    if (support3 !== null && !isNaN(support3)) {
      support3Data.push([timestamp, support3])
    }
  })

  const series: SeriesOptionsType[] = []

  // Pivot line (neutral gray)
  if (pivotData.length > 0) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: `${seriesConfig.name} Pivot`,
      id: `${seriesConfig.id}_pivot`,
      data: pivotData,
      color: styleOptions?.pivotColor ?? "#6B7280",
      lineWidth: 1,
      marker: {
        enabled: false,
      },
    } as SeriesLineOptions)
  }

  // Support 1 (green)
  if (support1Data.length > 0) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: `${seriesConfig.name} Support 1`,
      id: `${seriesConfig.id}_support_1`,
      data: support1Data,
      color: styleOptions?.support1Color ?? "#10B981",
      lineWidth: 1,
      marker: {
        enabled: false,
      },
      linkedTo: `${seriesConfig.id}_pivot`,
    } as SeriesLineOptions)
  }

  // Resistance 1 (red)
  if (resist1Data.length > 0) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: `${seriesConfig.name} Resistance 1`,
      id: `${seriesConfig.id}_resist_1`,
      data: resist1Data,
      color: styleOptions?.resist1Color ?? "#EF4444",
      lineWidth: 1,
      marker: {
        enabled: false,
      },
      linkedTo: `${seriesConfig.id}_pivot`,
    } as SeriesLineOptions)
  }

  // Support 2 (darker green)
  if (support2Data.length > 0) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: `${seriesConfig.name} Support 2`,
      id: `${seriesConfig.id}_support_2`,
      data: support2Data,
      color: styleOptions?.support2Color ?? "#059669",
      lineWidth: 1,
      marker: {
        enabled: false,
      },
      linkedTo: `${seriesConfig.id}_pivot`,
    } as SeriesLineOptions)
  }

  // Resistance 2 (darker red)
  if (resist2Data.length > 0) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: `${seriesConfig.name} Resistance 2`,
      id: `${seriesConfig.id}_resist_2`,
      data: resist2Data,
      color: styleOptions?.resist2Color ?? "#DC2626",
      lineWidth: 1,
      marker: {
        enabled: false,
      },
      linkedTo: `${seriesConfig.id}_pivot`,
    } as SeriesLineOptions)
  }

  // Support 3 (darkest green)
  if (support3Data.length > 0) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: `${seriesConfig.name} Support 3`,
      id: `${seriesConfig.id}_support_3`,
      data: support3Data,
      color: styleOptions?.support3Color ?? "#047857",
      lineWidth: 1,
      marker: {
        enabled: false,
      },
      linkedTo: `${seriesConfig.id}_pivot`,
    } as SeriesLineOptions)
  }

  // Resistance 3 (darkest red)
  if (resist3Data.length > 0) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: `${seriesConfig.name} Resistance 3`,
      id: `${seriesConfig.id}_resist_3`,
      data: resist3Data,
      color: styleOptions?.resist3Color ?? "#B91C1C",
      lineWidth: 1,
      marker: {
        enabled: false,
      },
      linkedTo: `${seriesConfig.id}_pivot`,
    } as SeriesLineOptions)
  }

  return series
}
