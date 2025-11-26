import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractColumn,
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import { AnnotationsOptions, SeriesLineOptions, SeriesOptionsType } from "highcharts"

export const PENNANT_PATTERN_PLOT_KIND_DATA_KEYS = [
  "index",
  "bull_pennant",
  "bear_pennant",
  "slmax",
  "slmin",
]

export interface PennantPatternStyleOptions {
  bullColor?: string
  bearColor?: string
  opacity?: number
}

interface generatePennantPatternPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: PennantPatternStyleOptions
}

export const generatePennantPatternPlotElements = ({
  data,
  seriesConfig,
  styleOptions,
}: generatePennantPatternPlotElementsProps): PlotElements => {
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
  const opacity = styleOptions?.opacity ?? 0.15

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
    const [timestamp, bullPennant, bearPennant, slmax, slmin] = row as [
      number, // index/timestamp
      number, // bull_pennant (boolean 0/1)
      number, // bear_pennant (boolean 0/1)
      number, // slmax (stop loss max price)
      number, // slmin (stop loss min price)
    ]

    // Check if a pennant pattern is detected
    const isBullPennant = Boolean(bullPennant)
    const isBearPennant = Boolean(bearPennant)

    if ((isBullPennant || isBearPennant) && slmax !== null && slmin !== null) {
      const color = isBullPennant ? bullColor : bearColor
      const patternType = isBullPennant ? "Bull Pennant" : "Bear Pennant"

      // Calculate end timestamp for pattern visualization (pennants are typically shorter)
      const endIndex = Math.min(i + 12, indexColumn.length - 1)
      const endTimestamp = indexColumn[endIndex]

      // Calculate convergence point for pennant (trendlines converge)
      const convergenceRatio = 0.7 // How much the lines converge
      const priceRange = slmax - slmin
      const convergenceRange = priceRange * convergenceRatio
      const midPrice = (slmax + slmin) / 2
      const convergenceTop = midPrice + (convergenceRange / 2)
      const convergenceBottom = midPrice - (convergenceRange / 2)

      // Draw upper converging trendline
      shapes.push({
        type: "path",
        points: [
          point(timestamp, slmax),
          point(endTimestamp, convergenceTop),
        ],
        stroke: color,
        strokeWidth: 2,
        dashStyle: "Solid",
      })

      // Draw lower converging trendline
      shapes.push({
        type: "path",
        points: [
          point(timestamp, slmin),
          point(endTimestamp, convergenceBottom),
        ],
        stroke: color,
        strokeWidth: 2,
        dashStyle: "Solid",
      })

      // Fill the pennant area with transparency
      // Create a polygon path for the pennant shape
      shapes.push({
        type: "path",
        points: [
          point(timestamp, slmax),
          point(endTimestamp, convergenceTop),
          point(endTimestamp, convergenceBottom),
          point(timestamp, slmin),
          point(timestamp, slmax), // Close the path
        ],
        fill: toRgba(color, opacity),
        stroke: "transparent",
        strokeWidth: 0,
      })

      // Draw horizontal stop loss lines
      shapes.push({
        type: "path",
        points: [
          point(timestamp, slmax),
          point(endTimestamp + (endTimestamp - timestamp) * 0.2, slmax),
        ],
        stroke: color,
        strokeWidth: 1,
        dashStyle: "Dash",
      })

      shapes.push({
        type: "path",
        points: [
          point(timestamp, slmin),
          point(endTimestamp + (endTimestamp - timestamp) * 0.2, slmin),
        ],
        stroke: color,
        strokeWidth: 1,
        dashStyle: "Dash",
      })

      // Add label for the pattern
      const centerX = timestamp + (endTimestamp - timestamp) * 0.4
      const centerY = (slmax + slmin) / 2

      labels.push({
        point: point(centerX, centerY),
        text: patternType,
        backgroundColor: toRgba(color, 0.95),
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
      const labelX = endTimestamp + (endTimestamp - timestamp) * 0.25

      labels.push({
        point: point(labelX, slmax),
        text: `SL: ${slmax.toFixed(2)}`,
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
        point: point(labelX, slmin),
        text: `SL: ${slmin.toFixed(2)}`,
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
