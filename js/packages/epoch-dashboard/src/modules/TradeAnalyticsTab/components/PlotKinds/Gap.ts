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
// down_fill_fraction, up_fill_fraction represent fraction of gap filled (0..1)
// down_filled, up_filled are booleans (0/1) indicating fully filled
// down_gap_size, up_gap_size are numeric sizes of the gap
export const GAP_PLOT_KIND_DATA_KEYS = [
  "index",
  "gap_up",
  "gap_filled",
  "fill_fraction",
  "gap_size",
  "psc_timestamp",
  "psc",
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
    const [ts, gapUpVal, gapFilledVal, fillFraction, , pscTimestamp, psc] = row as [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ]

    // Skip if no gap detected (gap_up is null)
    if (gapUpVal === null) {
      return
    }

    const openNow = openCol ? (openCol.get(i) as number) : undefined
    const isGapUp = Boolean(gapUpVal) // true = gap up, false = gap down
    const isGapFilled = Boolean(gapFilledVal)

    // PSC timestamp and value are provided directly
    const pscTs = pscTimestamp
    const pscClose = psc

    if (pscTs && pscClose && openNow) {
      const color = isGapUp ? upColor : downColor
      const fillColor = toRgba(color, opacity)

      // Rectangle using path type like Sessions
      const rect = {
        type: "path",
        points: [
          point(pscTs, pscClose),
          point(ts, pscClose),
          point(ts, openNow),
          point(pscTs, openNow),
        ],
        fill: fillColor,
        stroke: color,
        strokeWidth: 1,
      }
      shapes.push(rect)

      // Add filled label if gap is filled
      if (isGapFilled || fillFraction >= 1) {
        labels.push({
          point: point(ts, (pscClose + openNow) / 2),
          text: "gap filled",
          backgroundColor: "transparent",
          borderColor: "transparent",
          style: {
            color: color,
            fontSize: "9px",
            fontWeight: "bold",
            textOutline: "none",
          },
          verticalAlign: "middle",
        })
      }
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
        zIndex: 1,
        labelOptions: {
          backgroundColor: "transparent",
          borderColor: "transparent",
          style: {
            textOutline: "none",
          },
        },
      },
    ],
  }
}
