import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import { SeriesOptionsType, SeriesLineOptions, AnnotationsOptions } from "highcharts"

export const SESSIONS_PLOT_KIND_DATA_KEYS = ["index", "active", "high", "low"]

interface SessionsStyleOptions {
  fillColor?: string
  opacity?: number
}

interface generateSessionsPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SessionsStyleOptions
}

export const generateSessionsPlotElements = ({
  data,
  seriesConfig,
  styleOptions,
}: generateSessionsPlotElementsProps): PlotElements => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  // Resolve session option passed from backend and color
  const sessionOption = (seriesConfig as unknown as { configOptions?: Record<string, unknown> })
    ?.configOptions?.session as unknown

  const SESSION_COLOR_MAP: Record<string, string> = {
    Sydney: "#F59E0B", // amber
    Tokyo: "#3B82F6", // blue
    London: "#8B5CF6", // violet
    NewYork: "#6366F1", // indigo
    AsianKillZone: "#FBBF24", // lighter amber
    LondonOpenKillZone: "#A78BFA", // light violet
    NewYorkKillZone: "#818CF8", // light indigo
    LondonCloseKillZone: "#94A3B8", // slate
  }

  const DEFAULT_COLOR = styleOptions?.fillColor || "#16866E"
  const isRangeObject = typeof sessionOption === "object" && sessionOption !== null
  const fillColor =
    (typeof sessionOption === "string" && SESSION_COLOR_MAP[sessionOption]) ||
    (isRangeObject ? "#8B5CF6" : DEFAULT_COLOR)
  const opacity = styleOptions?.opacity ?? 0.08

  const toRgba = (hex: string, alpha: number) =>
    `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(
      hex.slice(5, 7),
      16
    )}, ${alpha})`

  // Create shapes (dashed rectangles) and labels for active sessions
  const shapes: AnnotationsOptions["shapes"] = []
  const labels: NonNullable<AnnotationsOptions["labels"]> = []

  // Helper function to create point objects
  const point = (x: number, y: number) => ({
    x: Number(x),
    y,
    xAxis: 0,
    yAxis: 0,
  })
  // Group contiguous active rows into one dashed rectangle block
  let inBlock = false
  let blockStart: number | undefined
  let blockEnd: number | undefined
  let blockMinLow = Number.POSITIVE_INFINITY
  let blockMaxHigh = Number.NEGATIVE_INFINITY

  const flushBlock = () => {
    if (!inBlock || blockStart === undefined || blockEnd === undefined) return

    const start = Number(blockStart)
    const end = Number(blockEnd)
    const minLow = Number(blockMinLow)
    const maxHigh = Number(blockMaxHigh)

    // Rectangle with dashed border and transparent fill
    shapes.push({
      type: "path",
      points: [
        point(start, minLow),
        point(end, minLow),
        point(end, maxHigh),
        point(start, maxHigh),
      ],
      stroke: fillColor,
      dashStyle: "ShortDash",
      strokeWidth: 1,
      fill: toRgba(fillColor, opacity),
    })

    // Label text based on session option
    const labelText = (() => {
      if (typeof sessionOption === "string") return sessionOption.replace(/([A-Z])/g, " $1").trim()
      if (isRangeObject) {
        const s = (sessionOption as any).start
        const e = (sessionOption as any).end
        if (s && e) {
          const pad = (n: number) => `${n}`.padStart(2, "0")
          return `${pad(s.hour)}:${pad(s.minute)}-${pad(e.hour)}:${pad(e.minute)} UTC`
        }
        return "Custom Range"
      }
      return seriesConfig.name
    })()

    labels.push({
      point: {
        x: start + (end - start) / 2,
        y: maxHigh,
        xAxis: 0,
        yAxis: 0,
      },
      backgroundColor: "transparent",
      borderColor: "transparent",
      style: {
        color: fillColor,
        fontWeight: "bold",
        textOutline: "none",
      },
      verticalAlign: "top",
      y: -6,
      text: labelText,
    })

    // reset
    inBlock = false
    blockStart = undefined
    blockEnd = undefined
    blockMinLow = Number.POSITIVE_INFINITY
    blockMaxHigh = Number.NEGATIVE_INFINITY
  }

  extractedData.forEach((dataPoint, index) => {
    const [currentTimestamp, active, sessionHigh, sessionLow] = dataPoint as [
      number,
      boolean,
      number,
      number,
    ]
    const nextRow = extractedData[index + 1] as [number, boolean, number, number] | undefined
    const nextTimestamp = nextRow ? Number(nextRow[0]) : undefined

    if (active) {
      if (!inBlock) {
        inBlock = true
        blockStart = Number(currentTimestamp)
      }
      blockMinLow = Math.min(blockMinLow, Number(sessionLow))
      blockMaxHigh = Math.max(blockMaxHigh, Number(sessionHigh))
      blockEnd = typeof nextTimestamp === "number" ? nextTimestamp : Number(currentTimestamp)
    } else if (inBlock) {
      flushBlock()
    }

    if (index === extractedData.length - 1) {
      flushBlock()
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
      color: fillColor,
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
            color: fillColor,
            textOutline: "none",
          },
        },
      },
    ],
  }
}
