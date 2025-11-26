import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractPlotKindSeriesData, getSharedPlotKindSeriesOptions } from "./EpochPlotKindOptions"
import { SeriesOptionsType, SeriesScatterOptions } from "highcharts"

export const PIVOT_POINT_DETECTOR_PLOT_KIND_DATA_KEYS = [
  "index",
  "pivot_type",
  "pivot_level",
  "pivot_index",
]

interface PivotPointDetectorStyleOptions {
  highPivotColor?: string
  lowPivotColor?: string
  markerSize?: number
}

interface generatePivotPointDetectorPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: PivotPointDetectorStyleOptions
}

export const generatePivotPointDetectorPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generatePivotPointDetectorPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const highPivots: SeriesScatterOptions["data"] = []
  const lowPivots: SeriesScatterOptions["data"] = []

  extractedData.forEach((row) => {
    const [timestamp, pivotType, pivotLevel, pivotIndex] = row as [
      number,
      number,
      number,
      number,
    ]

    // Only process rows where pivot_type is not null
    if (pivotType !== null && !isNaN(pivotType) && pivotLevel !== null && !isNaN(pivotLevel)) {
      // Use pivot_index for x-coordinate, pivot_level for y-coordinate
      const xCoord = pivotIndex !== null && !isNaN(pivotIndex) ? pivotIndex : timestamp

      if (pivotType === 1) {
        // High pivot: red triangle-down
        highPivots.push([xCoord, pivotLevel])
      } else if (pivotType === -1) {
        // Low pivot: green triangle-up
        lowPivots.push([xCoord, pivotLevel])
      }
    }
  })

  const series: SeriesOptionsType[] = []

  // High pivots (red triangle-down markers)
  if (highPivots.length > 0) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "scatter",
      name: `${seriesConfig.name} High`,
      id: `${seriesConfig.id}_high`,
      data: highPivots,
      color: styleOptions?.highPivotColor || "#EF4444",
      marker: {
        symbol: "triangle-down",
        radius: styleOptions?.markerSize || 8,
        enabled: true,
        states: {
          hover: {
            enabled: true,
            radiusPlus: 2,
          },
        },
      },
      tooltip: {
        pointFormat:
          '<span style="color:{point.color}">\u25CF</span> <b>Pivot High</b>: {point.y:.4f}<br/>',
      },
      enableMouseTracking: true,
    } as SeriesScatterOptions)
  }

  // Low pivots (green triangle-up markers)
  if (lowPivots.length > 0) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "scatter",
      name: `${seriesConfig.name} Low`,
      id: `${seriesConfig.id}_low`,
      data: lowPivots,
      color: styleOptions?.lowPivotColor || "#10B981",
      marker: {
        symbol: "triangle",
        radius: styleOptions?.markerSize || 8,
        enabled: true,
        states: {
          hover: {
            enabled: true,
            radiusPlus: 2,
          },
        },
      },
      tooltip: {
        pointFormat:
          '<span style="color:{point.color}">\u25CF</span> <b>Pivot Low</b>: {point.y:.4f}<br/>',
      },
      enableMouseTracking: true,
      linkedTo: `${seriesConfig.id}_high`,
    } as SeriesScatterOptions)
  }

  return series
}
