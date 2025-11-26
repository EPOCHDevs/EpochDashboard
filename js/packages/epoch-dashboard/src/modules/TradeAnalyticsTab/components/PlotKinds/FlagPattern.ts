import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractColumn,
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import { AnnotationsOptions, SeriesLineOptions, SeriesOptionsType } from "highcharts"

export const FLAG_PATTERN_PLOT_KIND_DATA_KEYS = [
  "index",
  "bull_flag",
  "bear_flag",
  "slmax",
  "slmin",
]

export interface FlagPatternStyleOptions {
  bullColor?: string
  bearColor?: string
  opacity?: number
}

interface generateFlagPatternPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: FlagPatternStyleOptions
}

export const generateFlagPatternPlotElements = ({
  data,
  seriesConfig,
  styleOptions,
}: generateFlagPatternPlotElementsProps): PlotElements => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })
  const indexColumn = extractColumn({
    data,
    columnName: "index",
  }) as number[]

  const bullColor = styleOptions?.bullColor ?? "#10B981" // green
  const bearColor = styleOptions?.bearColor ?? "#EF4444" // red
  const opacity = styleOptions?.opacity ?? 0.2

  const toRgba = (hex: string, alpha: number) =>
    `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(
      hex.slice(5, 7),
      16
    )}, ${alpha})`

  const shapes: AnnotationsOptions["shapes"] = []
  const labels: AnnotationsOptions["labels"] = []

  // Helper function to create point objects
  const point = (x: number, y: number) => ({
    x: Number(x),
    y,
    xAxis: 0,
    yAxis: seriesConfig.yAxis || 0,
  })

  extractedData.forEach((row, i) => {
    const [timestamp, bullFlag, bearFlag, slmax, slmin] = row as [
      number, // index/timestamp
      number, // bull_flag (boolean 0/1)
      number, // bear_flag (boolean 0/1)
      number, // slmax (stop loss max price)
      number, // slmin (stop loss min price)
    ]

    // Check if a flag pattern is detected
    const isBullFlag = Boolean(bullFlag)
    const isBearFlag = Boolean(bearFlag)

    if ((isBullFlag || isBearFlag) && slmax !== null && slmin !== null) {
      const color = isBullFlag ? bullColor : bearColor
      const patternType = isBullFlag ? "Bull Flag" : "Bear Flag"

      // Calculate end timestamp for pattern visualization (extend for 10-20 bars)
      const endIndex = Math.min(i + 15, indexColumn.length - 1)
      const endTimestamp = indexColumn[endIndex]

      // Draw the flag pattern boundary rectangle
      shapes.push({
        type: "rect",
        points: [
          point(timestamp, slmin),
          point(endTimestamp, slmax),
        ],
        fill: toRgba(color, opacity),
        stroke: color,
        strokeWidth: 1,
        yAxis: seriesConfig.yAxis,
      })

      // Draw horizontal line at slmax (stop loss max)
      shapes.push({
        type: "path",
        points: [
          point(timestamp, slmax),
          point(endTimestamp, slmax),
        ],
        stroke: color,
        strokeWidth: 2,
        dashStyle: "Dash",
      })

      // Draw horizontal line at slmin (stop loss min)
      shapes.push({
        type: "path",
        points: [
          point(timestamp, slmin),
          point(endTimestamp, slmin),
        ],
        stroke: color,
        strokeWidth: 2,
        dashStyle: "Dash",
      })

      // Add label for the pattern
      const centerX = (timestamp + endTimestamp) / 2
      const centerY = (slmax + slmin) / 2

      labels.push({
        point: point(centerX, centerY),
        text: patternType,
        backgroundColor: toRgba(color, 0.9),
        borderColor: color,
        borderWidth: 2,
        borderRadius: 4,
        padding: 6,
        style: {
          color: "#ffffff",
          fontSize: "10px",
          fontWeight: "600",
          textOutline: "none",
        },
        align: "center",
        verticalAlign: "middle",
        crop: false,
        overflow: "allow" as any,
        useHTML: false,
      })

      // Add SL labels
      labels.push({
        point: point(endTimestamp, slmax),
        text: `SL Max: ${slmax.toFixed(2)}`,
        style: {
          color: color,
          fontSize: "9px",
          fontWeight: "500",
        },
        align: "left",
        verticalAlign: "middle",
        x: 5,
        y: -2,
      })

      labels.push({
        point: point(endTimestamp, slmin),
        text: `SL Min: ${slmin.toFixed(2)}`,
        style: {
          color: color,
          fontSize: "9px",
          fontWeight: "500",
        },
        align: "left",
        verticalAlign: "middle",
        x: 5,
        y: 2,
      })
    }
  })

  // Create a main series for toggling visibility
  const series: SeriesOptionsType[] = [
    {
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      name: seriesConfig.name,
      id: seriesConfig.id,
      data: [], // Empty data - this is just for the legend/toggle
      color: bullColor,
      showInLegend: true,
      enableMouseTracking: false,
    } as SeriesLineOptions,
  ]

  return {
    series,
    annotations: [
      {
        shapes,
        labels,
        zIndex: 10,
        visible: true,
        crop: false,
        labelOptions: {
          backgroundColor: "transparent",
          borderColor: "transparent",
          crop: false,
          overflow: "allow" as any,
          style: {
            textOutline: "none",
          },
        },
      },
    ],
  }
}
