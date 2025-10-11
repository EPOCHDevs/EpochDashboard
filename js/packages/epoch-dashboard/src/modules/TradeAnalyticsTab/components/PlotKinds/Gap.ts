import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import {
  AnnotationsOptions,
  SeriesArearangeOptions,
  SeriesOptionsType,
  SeriesLineOptions,
} from "highcharts"

// Data mapping keys expected from backend
// Based on the Gap Analysis Report inputs:
// - gap_filled: Boolean indicating if gap was filled
// - gap_retrace: Decimal showing retrace percentage (can be used to determine direction)
// - gap_size: Decimal size of the gap
// - psc: Prior Session Close price
// - psc_timestamp: Integer timestamp of prior session close
export const GAP_PLOT_KIND_DATA_KEYS = [
  "index",
  "gap_retrace",      // Using gap_retrace instead of gap_up (positive = gap up, negative = gap down)
  "gap_filled",
  "gap_size",         // Already correct
  "psc_timestamp",    // Already correct
  "psc",             // Already correct
]

interface generateGapPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: Pick<SeriesArearangeOptions, "fillColor" | "fillOpacity" | "lineColor"> & {
    upColor?: string
    downColor?: string
  }
}

// Render up/down gap rectangles using annotation shapes like Sessions
export const generateGapPlotElements = ({
  data,
  seriesConfig,
  styleOptions,
}: generateGapPlotElementsProps): PlotElements => {
  const extractedData = extractPlotKindSeriesData({ data, seriesConfig })

  // Try to leverage OHLC columns if present to render full rectangles
  const openCol = data?.getChild("o")

  const upColor = styleOptions?.upColor ?? "#22C55E" // green
  const downColor = styleOptions?.downColor ?? "#EF4444" // red
  const opacity = 0.15

  const toRgba = (hex: string, alpha: number) =>
    `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(
      hex.slice(5, 7),
      16
    )}, ${alpha})`

  // Create shapes and labels for gaps
  const shapes: AnnotationsOptions["shapes"] = []
  const labels: NonNullable<AnnotationsOptions["labels"]> = []

  // Helper function to create point objects
  const point = (x: number, y: number) => ({
    x: Number(x),
    y,
    xAxis: 0,
    yAxis: seriesConfig.yAxis || 0,
  })

  extractedData.forEach((row, i) => {
    const [ts, gapRetrace, gapFilledVal, gapSize, pscTimestamp, psc] = row as [
      number,      // index/timestamp
      number,      // gap_retrace (positive = up, negative = down)
      number,      // gap_filled (boolean 0/1)
      number,      // gap_size
      number,      // psc_timestamp
      number,      // psc (prior session close)
    ]

    // Skip if no gap detected (gap_retrace is null or gap_size is null/zero)
    if (gapRetrace === null || gapRetrace === undefined || !gapSize) {
      return
    }

    const openNow = openCol ? (openCol.get(i) as number) : undefined

    // Determine gap direction from gap_size (positive = gap up, negative = gap down)
    // Or from gap_retrace if gap_size is always positive
    const isGapUp = gapSize > 0 // Assuming gap_size is positive for gap up, negative for gap down
    const isGapFilled = Boolean(gapFilledVal)

    // PSC timestamp and value are provided directly
    const pscTs = pscTimestamp
    const pscClose = psc

    if (pscTs && pscClose && openNow) {
      const color = isGapUp ? upColor : downColor

      // Add horizontal dashed line at prior session close
      // This is the main visual indicator of the gap
      const pscLine = {
        type: "path" as const,
        points: [
          point(pscTs, pscClose),
          point(ts, pscClose),
        ],
        stroke: color,
        strokeWidth: 1,
        dashStyle: "Dash" as const,
      }
      shapes.push(pscLine as any)

      // Add gap size label positioned ON TOP of the horizontal line (at pscClose price level)
      const gapSizePercent = ((Math.abs(gapSize) / pscClose) * 100).toFixed(2)
      const centerX = (pscTs + ts) / 2 // Midpoint between prior close time and current open time

      labels.push({
        point: point(centerX, pscClose), // Position at the prior session close price level
        text: isGapFilled
          ? `${isGapUp ? '↑' : '↓'} ${gapSizePercent}% • FILLED ✓`
          : `${isGapUp ? '↑' : '↓'} ${gapSizePercent}%`,
        backgroundColor: toRgba(color, isGapFilled ? 0.95 : 0.9),
        borderColor: color,
        borderWidth: 2,
        borderRadius: 6,
        padding: isGapFilled ? 8 : 6,
        style: {
          color: "#ffffff",
          fontSize: isGapFilled ? "13px" : "12px",
          fontWeight: "700",
          textOutline: "none",
        },
        align: "center",
        verticalAlign: "middle",
        y: isGapUp ? 15 : -15, // Offset further from line for better visibility
        crop: false, // Don't crop label when zoomed
        overflow: "allow" as any, // Allow label to overflow chart bounds
        useHTML: false,
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
      color: upColor,
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
        zIndex: 10, // Higher z-index to ensure labels appear on top
        visible: true,
        crop: false, // Don't crop annotations
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
