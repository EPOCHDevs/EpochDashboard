import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { getSharedPlotKindSeriesOptions, PlotElements } from "./EpochPlotKindOptions"
import { SeriesArearangeOptions, SeriesOptionsType, AnnotationsOptions } from "highcharts"

export const HMM_PLOT_KIND_DATA_KEYS = ["index", "state"]

// State color palette - vibrant colors for different states
const STATE_COLORS = [
  "#3B82F6", // blue - State 0
  "#10B981", // green - State 1
  "#F59E0B", // amber - State 2
  "#EF4444", // red - State 3
  "#8B5CF6", // violet - State 4
  "#EC4899", // pink - State 5
]

interface HMMStyleOptions {
  stateColors?: string[]
}

interface generateHMMPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: HMMStyleOptions
}

export const generateHMMPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateHMMPlotKindSeriesOptionsProps): PlotElements => {
  // Extract columns from Arrow table
  const indexColumn = data?.getChild(seriesConfig.dataMapping["index"] as string)
  const stateColumn = data?.getChild(seriesConfig.dataMapping["state"] as string)

  if (!indexColumn || !stateColumn) {
    return { series: [] }
  }

  // Use custom state colors if provided, otherwise use default palette
  const stateColors = styleOptions?.stateColors || STATE_COLORS

  // Group consecutive states into bands
  interface StateBand {
    from: number
    to: number
    state: number
    color: string
  }

  const bands: StateBand[] = []
  const annotations: AnnotationsOptions[] = []

  let currentState: number | null = null
  let bandStart: number | null = null

  for (let i = 0; i < (data?.numRows ?? 0); i++) {
    const timestamp = indexColumn.get(i)
    const state = stateColumn.get(i)

    if (timestamp === null || state === null) continue

    const stateNum = Number(state) // Convert BigInt to number

    if (currentState === null) {
      // Start first band
      currentState = stateNum
      bandStart = timestamp
    } else if (stateNum !== currentState) {
      // State changed - close current band and start new one
      if (bandStart !== null) {
        bands.push({
          from: bandStart,
          to: timestamp,
          state: currentState,
          color: stateColors[currentState % stateColors.length],
        })
      }
      currentState = stateNum
      bandStart = timestamp
    }
  }

  // Close the last band
  if (currentState !== null && bandStart !== null) {
    const lastTimestamp = indexColumn.get((data?.numRows ?? 1) - 1)
    if (lastTimestamp !== null) {
      bands.push({
        from: bandStart,
        to: lastTimestamp,
        state: currentState,
        color: stateColors[currentState % stateColors.length],
      })
    }
  }

  // Convert hex color to rgba with very low opacity (8%)
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // Create arearange series for each band (confined to this pane)
  const series: SeriesOptionsType[] = []

  bands.forEach((band, index) => {
    // Create data points for this band - fill the entire Y-axis range (0 to 1)
    const bandData: Array<[number, number, number]> = [
      [band.from, 0, 1], // Start of band, spans full height
      [band.to, 0, 1], // End of band, spans full height
    ]

    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "arearange",
      id: `${seriesConfig.id}_band_${index}`,
      name: `STATE ${band.state}`,
      data: bandData,
      color: hexToRgba(band.color, 0.08),
      fillColor: hexToRgba(band.color, 0.08),
      lineWidth: 0,
      marker: {
        enabled: false,
      },
      enableMouseTracking: false,
      zIndex: -1, // Behind everything else
      states: {
        inactive: {
          enabled: false,
        },
      },
    } as SeriesArearangeOptions)

    // Add text annotation for this band
    const bandWidth = band.to - band.from
    const midpoint = (band.from + band.to) / 2

    // Only add label if band is wide enough
    if (bandWidth > 0) {
      annotations.push({
        labels: [
          {
            point: {
              x: midpoint,
              y: 0.5, // Middle of the pane vertically
              xAxis: 0,
              yAxis: seriesConfig.yAxis ?? 0,
            },
            text: `STATE ${band.state}`,
            style: {
              color: "#FFFFFF",
              fontSize: "11px",
              fontWeight: "600",
              textOutline: "2px contrast",
            },
            backgroundColor: "transparent",
            borderWidth: 0,
            padding: 4,
            allowOverlap: false,
            crop: true,
            overflow: "justify",
          },
        ],
        zIndex: 5,
      } as AnnotationsOptions)
    }
  })

  return {
    series,
    annotations,
  }
}
