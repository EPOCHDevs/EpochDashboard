import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractColumn,
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import { AnnotationsOptions, SeriesLineOptions, SeriesOptionsType } from "highcharts"

export const DOUBLE_TOP_BOTTOM_PLOT_KIND_DATA_KEYS = [
  "index",
  "pattern_detected",
  "breakout_level",
  "target",
]

export interface DoubleTopBottomStyleOptions {
  doubleTopColor?: string
  doubleBottomColor?: string
  breakoutLineWidth?: number
  targetLineWidth?: number
}

interface generateDoubleTopBottomPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: DoubleTopBottomStyleOptions
}

export const generateDoubleTopBottomPlotElements = ({
  data,
  seriesConfig,
  styleOptions,
}: generateDoubleTopBottomPlotElementsProps): PlotElements => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })
  const indexColumn = extractColumn({
    data,
    columnName: "index",
  }) as number[]

  const shapes: NonNullable<AnnotationsOptions["shapes"]> = []
  const labels: NonNullable<AnnotationsOptions["labels"]> = []
  const series: SeriesOptionsType[] = []

  // Track active patterns
  let activePatternStart: number | null = null
  let activePatternType: number = 0
  let activeBreakoutLevel: number | null = null
  let activeTarget: number | null = null

  extractedData.forEach((row, i) => {
    const [timestamp, patternDetected, breakoutLevel, target] = row as [
      number,
      number,
      number,
      number,
    ]

    if (patternDetected !== 0 && patternDetected !== null) {
      // Start new pattern or continue existing one
      if (activePatternStart === null) {
        activePatternStart = timestamp
        activePatternType = patternDetected
        activeBreakoutLevel = breakoutLevel
        activeTarget = target
      } else if (patternDetected === activePatternType) {
        // Continue tracking the same pattern type
        activeBreakoutLevel = breakoutLevel || activeBreakoutLevel
        activeTarget = target || activeTarget
      } else {
        // Pattern type changed, finalize the previous pattern
        finalizePattern(
          activePatternStart,
          i > 0 ? indexColumn[i - 1] : timestamp,
          activePatternType,
          activeBreakoutLevel,
          activeTarget
        )

        // Start new pattern
        activePatternStart = timestamp
        activePatternType = patternDetected
        activeBreakoutLevel = breakoutLevel
        activeTarget = target
      }
    } else if (activePatternStart !== null) {
      // Pattern ended, finalize it
      finalizePattern(
        activePatternStart,
        i > 0 ? indexColumn[i - 1] : timestamp,
        activePatternType,
        activeBreakoutLevel,
        activeTarget
      )

      // Reset active pattern
      activePatternStart = null
      activePatternType = 0
      activeBreakoutLevel = null
      activeTarget = null
    }
  })

  // Handle case where pattern extends to the end of data
  if (activePatternStart !== null) {
    finalizePattern(
      activePatternStart,
      indexColumn[indexColumn.length - 1],
      activePatternType,
      activeBreakoutLevel,
      activeTarget
    )
  }

  function finalizePattern(
    startTimestamp: number,
    endTimestamp: number,
    patternType: number,
    breakoutLevel: number | null,
    target: number | null
  ) {
    const isDoubleTop = patternType > 0
    const patternColor = isDoubleTop
      ? styleOptions?.doubleTopColor || "rgba(255, 0, 0, 0.8)"
      : styleOptions?.doubleBottomColor || "rgba(0, 255, 0, 0.8)"
    const patternName = isDoubleTop ? "Double Top" : "Double Bottom"

    // Draw breakout level (neckline)
    if (breakoutLevel !== null && !isNaN(breakoutLevel)) {
      shapes.push({
        type: "path",
        points: [
          {
            x: startTimestamp,
            y: breakoutLevel,
            xAxis: 0,
            yAxis: seriesConfig.yAxis || 0,
          },
          {
            x: endTimestamp,
            y: breakoutLevel,
            xAxis: 0,
            yAxis: seriesConfig.yAxis || 0,
          },
        ],
        stroke: patternColor,
        strokeWidth: styleOptions?.breakoutLineWidth || 2,
        yAxis: seriesConfig.yAxis,
      })

      // Label for breakout level
      labels.push({
        point: {
          x: startTimestamp,
          y: breakoutLevel,
          yAxis: seriesConfig.yAxis,
          xAxis: 0,
        },
        text: patternName,
        style: {
          color: "rgba(255, 255, 255, 1)",
          fontSize: "10px",
          fontWeight: "bold",
        },
        backgroundColor: patternColor,
        borderWidth: 1,
        borderColor: patternColor,
        padding: 4,
        borderRadius: 3,
        x: 5,
        y: isDoubleTop ? 10 : -20,
      })
    }

    // Draw target level (dashed)
    if (target !== null && !isNaN(target)) {
      shapes.push({
        type: "path",
        points: [
          {
            x: startTimestamp,
            y: target,
            xAxis: 0,
            yAxis: seriesConfig.yAxis || 0,
          },
          {
            x: endTimestamp,
            y: target,
            xAxis: 0,
            yAxis: seriesConfig.yAxis || 0,
          },
        ],
        stroke: patternColor,
        strokeWidth: styleOptions?.targetLineWidth || 2,
        dashStyle: "Dash",
        yAxis: seriesConfig.yAxis,
      })

      // Label for target
      labels.push({
        point: {
          x: (startTimestamp + endTimestamp) / 2,
          y: target,
          yAxis: seriesConfig.yAxis,
          xAxis: 0,
        },
        text: `Target: ${target.toFixed(2)}`,
        style: {
          color: patternColor,
          fontSize: "9px",
          fontWeight: "bold",
        },
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        borderWidth: 0,
        padding: 3,
        borderRadius: 2,
        y: isDoubleTop ? -10 : 10,
      })
    }

    // Draw pattern outline annotation (connecting the peaks/troughs)
    // This creates a visual outline of the pattern shape
    if (breakoutLevel !== null && !isNaN(breakoutLevel)) {
      const highArray = data?.getChild("h")?.toArray()
      const lowArray = data?.getChild("l")?.toArray()

      if (highArray && lowArray) {
        // Find the two peaks/troughs for the double top/bottom
        const startIndex = indexColumn.indexOf(startTimestamp)
        const endIndex = indexColumn.indexOf(endTimestamp)

        if (startIndex >= 0 && endIndex >= 0 && endIndex > startIndex) {
          const relevantHighs: number[] = []
          const relevantLows: number[] = []
          const relevantTimestamps: number[] = []

          for (let idx = startIndex; idx <= endIndex; idx++) {
            if (highArray[idx] != null && lowArray[idx] != null) {
              relevantHighs.push(highArray[idx] as number)
              relevantLows.push(lowArray[idx] as number)
              relevantTimestamps.push(indexColumn[idx])
            }
          }

          if (relevantHighs.length > 0) {
            if (isDoubleTop) {
              // For double top, find the two highest points
              const peak1Idx = relevantHighs.indexOf(Math.max(...relevantHighs))
              const tempHighs = [...relevantHighs]
              tempHighs[peak1Idx] = -Infinity
              const peak2Idx = tempHighs.indexOf(Math.max(...tempHighs))

              if (peak1Idx !== peak2Idx && peak2Idx >= 0) {
                const peak1X = relevantTimestamps[peak1Idx]
                const peak1Y = relevantHighs[peak1Idx]
                const peak2X = relevantTimestamps[peak2Idx]
                const peak2Y = relevantHighs[peak2Idx]

                // Draw lines connecting the pattern
                shapes.push({
                  type: "path",
                  points: [
                    { x: peak1X, y: peak1Y, xAxis: 0, yAxis: seriesConfig.yAxis || 0 },
                    { x: peak2X, y: peak2Y, xAxis: 0, yAxis: seriesConfig.yAxis || 0 },
                  ],
                  stroke: patternColor,
                  strokeWidth: 1,
                  dashStyle: "Dot",
                  yAxis: seriesConfig.yAxis,
                })
              }
            } else {
              // For double bottom, find the two lowest points
              const trough1Idx = relevantLows.indexOf(Math.min(...relevantLows))
              const tempLows = [...relevantLows]
              tempLows[trough1Idx] = Infinity
              const trough2Idx = tempLows.indexOf(Math.min(...tempLows))

              if (trough1Idx !== trough2Idx && trough2Idx >= 0) {
                const trough1X = relevantTimestamps[trough1Idx]
                const trough1Y = relevantLows[trough1Idx]
                const trough2X = relevantTimestamps[trough2Idx]
                const trough2Y = relevantLows[trough2Idx]

                // Draw lines connecting the pattern
                shapes.push({
                  type: "path",
                  points: [
                    { x: trough1X, y: trough1Y, xAxis: 0, yAxis: seriesConfig.yAxis || 0 },
                    { x: trough2X, y: trough2Y, xAxis: 0, yAxis: seriesConfig.yAxis || 0 },
                  ],
                  stroke: patternColor,
                  strokeWidth: 1,
                  dashStyle: "Dot",
                  yAxis: seriesConfig.yAxis,
                })
              }
            }
          }
        }
      }
    }
  }

  // Create a dummy series for legend/toggle control
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    data: [],
    showInLegend: true,
    enableMouseTracking: false,
    color: "rgba(150, 150, 150, 0.8)",
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
