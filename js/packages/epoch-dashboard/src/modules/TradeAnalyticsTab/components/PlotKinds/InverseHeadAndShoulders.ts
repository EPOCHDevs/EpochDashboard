import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractColumn,
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import { AnnotationsOptions, SeriesLineOptions } from "highcharts"

export const INVERSE_HEAD_AND_SHOULDERS_PLOT_KIND_DATA_KEYS = [
  "index",
  "pattern_detected",
  "neckline_level",
  "target",
]

interface InverseHeadAndShouldersStyleOptions {
  patternColor?: string
  necklineColor?: string
  targetColor?: string
  opacity?: number
}

interface generateInverseHeadAndShouldersPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: InverseHeadAndShouldersStyleOptions
}

export const generateInverseHeadAndShouldersPlotElements = ({
  data,
  seriesConfig,
  styleOptions,
}: generateInverseHeadAndShouldersPlotElementsProps): PlotElements => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })
  const indexColumn = extractColumn({
    data,
    columnName: "index",
  }) as number[]

  // Get high/low data for pattern outline
  const highArray = data?.getChild("h")?.toArray()
  const lowArray = data?.getChild("l")?.toArray()

  // Default colors - green for bullish pattern
  const patternColor = styleOptions?.patternColor || "#10B981"
  const necklineColor = styleOptions?.necklineColor || "#10B981"
  const targetColor = styleOptions?.targetColor || "#10B981"
  const opacity = styleOptions?.opacity || 0.3

  const shapes: AnnotationsOptions["shapes"] = []
  const labels: AnnotationsOptions["labels"] = []

  // Track detected patterns to draw horizontal lines
  let necklineLevel: number | null = null
  let targetLevel: number | null = null
  let patternStartIndex: number | null = null
  let patternEndIndex: number | null = null

  extractedData.forEach((row, i) => {
    const [timestamp, patternDetected, neckline, target] = row as [
      number,
      number,
      number,
      number,
    ]

    if (patternDetected && neckline !== null && target !== null) {
      necklineLevel = neckline
      targetLevel = target

      // Find the pattern range - look back to find shoulders and head
      // We'll use a window approach to identify the pattern bounds
      const lookbackWindow = 20 // Look back up to 20 bars
      const startIdx = Math.max(0, i - lookbackWindow)

      // Find local troughs in the lookback window for inverse head and shoulders
      const troughs: { index: number; price: number; timestamp: number }[] = []
      for (let j = startIdx + 1; j < i; j++) {
        const prevLow = lowArray?.[j - 1] || Infinity
        const currentLow = lowArray?.[j] || Infinity
        const nextLow = lowArray?.[j + 1] || Infinity

        // Identify local troughs (lows)
        if (currentLow < prevLow && currentLow < nextLow) {
          troughs.push({
            index: j,
            price: currentLow as number,
            timestamp: indexColumn[j],
          })
        }
      }

      // Inverse head and shoulders pattern requires at least 3 troughs
      // Left shoulder, Head (lowest), Right shoulder
      if (troughs.length >= 3) {
        // Sort by price to find the head (lowest trough)
        const sortedByPrice = [...troughs].sort((a, b) => a.price - b.price)
        const head = sortedByPrice[0]

        // Find shoulders - troughs before and after the head
        const leftShoulders = troughs.filter((t) => t.index < head.index)
        const rightShoulders = troughs.filter((t) => t.index > head.index)

        if (leftShoulders.length > 0 && rightShoulders.length > 0) {
          const leftShoulder = leftShoulders[leftShoulders.length - 1] // Closest to head
          const rightShoulder = rightShoulders[0] // Closest to head

          patternStartIndex = leftShoulder.index
          patternEndIndex = rightShoulder.index

          // Draw the pattern outline as connected lines
          // Left shoulder to head
          shapes.push({
            type: "path",
            points: [
              {
                x: leftShoulder.timestamp,
                y: leftShoulder.price,
                xAxis: 0,
                yAxis: seriesConfig.yAxis || 0,
              },
              {
                x: head.timestamp,
                y: head.price,
                xAxis: 0,
                yAxis: seriesConfig.yAxis || 0,
              },
            ],
            stroke: patternColor,
            strokeWidth: 2,
            yAxis: seriesConfig.yAxis,
          })

          // Head to right shoulder
          shapes.push({
            type: "path",
            points: [
              {
                x: head.timestamp,
                y: head.price,
                xAxis: 0,
                yAxis: seriesConfig.yAxis || 0,
              },
              {
                x: rightShoulder.timestamp,
                y: rightShoulder.price,
                xAxis: 0,
                yAxis: seriesConfig.yAxis || 0,
              },
            ],
            stroke: patternColor,
            strokeWidth: 2,
            yAxis: seriesConfig.yAxis,
          })

          // Add circles at trough points
          ;[leftShoulder, head, rightShoulder].forEach((trough, idx) => {
            shapes.push({
              type: "circle",
              point: {
                x: trough.timestamp,
                y: trough.price,
                xAxis: 0,
                yAxis: seriesConfig.yAxis || 0,
              },
              r: 4,
              fill: patternColor,
              yAxis: seriesConfig.yAxis,
            })

            // Label the troughs
            const troughLabel = idx === 1 ? "H" : idx === 0 ? "LS" : "RS"
            labels.push({
              point: {
                x: trough.timestamp,
                y: trough.price,
                xAxis: 0,
                yAxis: seriesConfig.yAxis || 0,
              },
              text: troughLabel,
              style: {
                color: patternColor,
                fontSize: "10px",
                fontWeight: "bold",
              },
              backgroundColor: "transparent",
              borderWidth: 0,
              y: 15, // Position below the point for inverse pattern
            })
          })

          // Add pattern label
          labels.push({
            point: {
              x: head.timestamp,
              y: neckline,
              xAxis: 0,
              yAxis: seriesConfig.yAxis || 0,
            },
            text: "Inverse Head & Shoulders",
            style: {
              color: patternColor,
              fontSize: "11px",
              fontWeight: "bold",
            },
            backgroundColor: `rgba(16, 185, 129, ${opacity})`,
            borderColor: patternColor,
            borderWidth: 1,
            padding: 4,
            borderRadius: 3,
            y: -20, // Position above neckline for inverse pattern
          })
        }
      }
    }
  })

  // Create line series for neckline and target levels
  const series: SeriesLineOptions[] = []

  if (necklineLevel !== null && patternStartIndex !== null && patternEndIndex !== null) {
    // Neckline - solid line
    const necklineData = [
      [indexColumn[patternStartIndex], necklineLevel],
      [indexColumn[Math.min(patternEndIndex + 10, indexColumn.length - 1)], necklineLevel],
    ]

    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      id: `${seriesConfig.id}_neckline`,
      name: `${seriesConfig.name} - Neckline`,
      data: necklineData as SeriesLineOptions["data"],
      color: necklineColor,
      lineWidth: 2,
      dashStyle: "Solid",
      marker: {
        enabled: false,
      },
      enableMouseTracking: false,
      showInLegend: false,
    } as SeriesLineOptions)
  }

  if (targetLevel !== null && patternStartIndex !== null && patternEndIndex !== null) {
    // Target - dashed line
    const targetData = [
      [indexColumn[patternStartIndex], targetLevel],
      [indexColumn[Math.min(patternEndIndex + 10, indexColumn.length - 1)], targetLevel],
    ]

    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "line",
      id: `${seriesConfig.id}_target`,
      name: `${seriesConfig.name} - Target`,
      data: targetData as SeriesLineOptions["data"],
      color: targetColor,
      lineWidth: 2,
      dashStyle: "Dash",
      marker: {
        enabled: false,
      },
      enableMouseTracking: false,
      showInLegend: false,
    } as SeriesLineOptions)
  }

  // Add a dummy series for legend/visibility toggle
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    data: [], // Empty data - just for the legend
    color: patternColor,
    showInLegend: true,
    enableMouseTracking: false,
  } as SeriesLineOptions)

  return {
    series,
    annotations:
      shapes.length > 0 || labels.length > 0
        ? [
            {
              shapes,
              labels,
              zIndex: 5,
            },
          ]
        : [],
  }
}
