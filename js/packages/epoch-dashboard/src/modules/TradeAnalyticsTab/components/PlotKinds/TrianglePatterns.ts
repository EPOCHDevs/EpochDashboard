import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractColumn,
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import { AnnotationsOptions, SeriesLineOptions, SeriesOptionsType } from "highcharts"

export const TRIANGLE_PATTERNS_PLOT_KIND_DATA_KEYS = [
  "index",
  "pattern_detected",
  "upper_slope",
  "lower_slope",
  "triangle_type",
]

export interface TrianglePatternsStyleOptions {
  ascendingColor?: string
  descendingColor?: string
  symmetricalColor?: string
  opacity?: number
}

// Triangle type constants
const TRIANGLE_TYPE = {
  ASCENDING: 1,
  DESCENDING: 2,
  SYMMETRICAL: 3,
} as const

interface generateTrianglePatternsPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: TrianglePatternsStyleOptions
}

export const generateTrianglePatternsPlotElements = ({
  data,
  seriesConfig,
  styleOptions,
}: generateTrianglePatternsPlotElementsProps): PlotElements => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })
  const indexColumn = extractColumn({
    data,
    columnName: "index",
  }) as number[]

  // Try to get OHLC data for better price context
  const highColumn = data?.getChild("h")
  const lowColumn = data?.getChild("l")

  const ascendingColor = styleOptions?.ascendingColor ?? "#10B981" // green
  const descendingColor = styleOptions?.descendingColor ?? "#EF4444" // red
  const symmetricalColor = styleOptions?.symmetricalColor ?? "#3B82F6" // blue
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
    const [timestamp, patternDetected, upperSlope, lowerSlope, triangleType] = row as [
      number, // index/timestamp
      number, // pattern_detected (integer pattern type ID)
      number, // upper_slope (decimal)
      number, // lower_slope (decimal)
      number, // triangle_type (1=ascending, 2=descending, 3=symmetrical)
    ]

    // Check if a triangle pattern is detected
    if (
      !patternDetected ||
      upperSlope === null ||
      upperSlope === undefined ||
      lowerSlope === null ||
      lowerSlope === undefined ||
      triangleType === null ||
      triangleType === undefined
    ) {
      return
    }

    // Determine color and label based on triangle type
    let color: string
    let triangleLabel: string

    switch (triangleType) {
      case TRIANGLE_TYPE.ASCENDING:
        color = ascendingColor
        triangleLabel = "Ascending Triangle"
        break
      case TRIANGLE_TYPE.DESCENDING:
        color = descendingColor
        triangleLabel = "Descending Triangle"
        break
      case TRIANGLE_TYPE.SYMMETRICAL:
        color = symmetricalColor
        triangleLabel = "Symmetrical Triangle"
        break
      default:
        // Unknown triangle type, skip
        return
    }

    // Get current high and low for starting point
    const currentHigh = highColumn ? (highColumn.get(i) as number) : null
    const currentLow = lowColumn ? (lowColumn.get(i) as number) : null

    if (currentHigh === null || currentLow === null) {
      return
    }

    // Calculate end timestamp for pattern visualization
    const patternDuration = 15 // bars
    const endIndex = Math.min(i + patternDuration, indexColumn.length - 1)
    const endTimestamp = indexColumn[endIndex]
    const timeDelta = endTimestamp - timestamp

    // Calculate trendline endpoints based on slopes
    // Upper trendline: y = currentHigh + upperSlope * time
    // Lower trendline: y = currentLow + lowerSlope * time
    const upperEndPrice = currentHigh + upperSlope * timeDelta
    const lowerEndPrice = currentLow + lowerSlope * timeDelta

    // Draw upper trendline
    shapes.push({
      type: "path",
      points: [
        point(timestamp, currentHigh),
        point(endTimestamp, upperEndPrice),
      ],
      stroke: color,
      strokeWidth: 2,
      dashStyle: "Solid",
    })

    // Draw lower trendline
    shapes.push({
      type: "path",
      points: [
        point(timestamp, currentLow),
        point(endTimestamp, lowerEndPrice),
      ],
      stroke: color,
      strokeWidth: 2,
      dashStyle: "Solid",
    })

    // Fill the triangle area
    shapes.push({
      type: "path",
      points: [
        point(timestamp, currentHigh),
        point(timestamp, currentLow),
        point(endTimestamp, lowerEndPrice),
        point(endTimestamp, upperEndPrice),
        point(timestamp, currentHigh), // Close the path
      ],
      fill: toRgba(color, opacity),
      stroke: "transparent",
      strokeWidth: 0,
    })

    // Add pattern label
    const centerX = timestamp + timeDelta * 0.5
    const centerY = (currentHigh + currentLow) / 2

    labels.push({
      point: point(centerX, centerY),
      text: triangleLabel,
      backgroundColor: toRgba(color, 0.95),
      borderColor: color,
      borderWidth: 2,
      borderRadius: 4,
      padding: 7,
      style: {
        color: "#ffffff",
        fontSize: "11px",
        fontWeight: "700",
        textOutline: "none",
      },
      align: "center",
      verticalAlign: "middle",
      crop: false,
      overflow: "allow" as any,
      useHTML: false,
    })

    // Add slope information labels
    const slopeInfoX = timestamp + timeDelta * 0.15

    labels.push({
      point: point(slopeInfoX, currentHigh),
      text: `Upper: ${upperSlope > 0 ? "+" : ""}${upperSlope.toFixed(4)}`,
      style: {
        color: color,
        fontSize: "9px",
        fontWeight: "500",
      },
      align: "left",
      verticalAlign: "bottom",
      x: 5,
      y: -5,
    })

    labels.push({
      point: point(slopeInfoX, currentLow),
      text: `Lower: ${lowerSlope > 0 ? "+" : ""}${lowerSlope.toFixed(4)}`,
      style: {
        color: color,
        fontSize: "9px",
        fontWeight: "500",
      },
      align: "left",
      verticalAlign: "top",
      x: 5,
      y: 5,
    })

    // Add directional indicator based on pattern type
    let directionIndicator = ""
    if (triangleType === TRIANGLE_TYPE.ASCENDING) {
      directionIndicator = "↑ Bullish Breakout Expected"
    } else if (triangleType === TRIANGLE_TYPE.DESCENDING) {
      directionIndicator = "↓ Bearish Breakout Expected"
    } else if (triangleType === TRIANGLE_TYPE.SYMMETRICAL) {
      directionIndicator = "↔ Breakout Direction Uncertain"
    }

    if (directionIndicator) {
      labels.push({
        point: point(endTimestamp, (upperEndPrice + lowerEndPrice) / 2),
        text: directionIndicator,
        style: {
          color: color,
          fontSize: "10px",
          fontWeight: "600",
        },
        align: "left",
        verticalAlign: "middle",
        x: 8,
        y: 0,
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
      color: symmetricalColor,
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
