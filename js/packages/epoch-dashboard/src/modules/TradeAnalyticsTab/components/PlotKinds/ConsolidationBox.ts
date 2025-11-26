import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractColumn,
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import { AnnotationsOptions, SeriesLineOptions, SeriesOptionsType } from "highcharts"

export const CONSOLIDATION_BOX_PLOT_KIND_DATA_KEYS = [
  "index",
  "box_detected",
  "box_top",
  "box_bottom",
  "box_height",
  "touch_count",
  "upper_slope",
  "lower_slope",
  "target_up",
  "target_down",
]

export interface ConsolidationBoxStyleOptions {
  boxColor?: string
  boxOpacity?: number
  borderColor?: string
  targetUpColor?: string
  targetDownColor?: string
}

interface generateConsolidationBoxPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: ConsolidationBoxStyleOptions
}

export const generateConsolidationBoxPlotElements = ({
  data,
  seriesConfig,
  styleOptions,
}: generateConsolidationBoxPlotElementsProps): PlotElements => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })
  const indexColumn = extractColumn({
    data,
    columnName: "index",
  }) as number[]

  const shapes: AnnotationsOptions["shapes"] = []
  const labels: AnnotationsOptions["labels"] = []
  const series: SeriesOptionsType[] = []

  // Track active consolidation boxes
  let activeBoxStart: number | null = null
  type BoxData = {
    top: number
    bottom: number
    touchCount: number
    targetUp: number
    targetDown: number
  }
  let activeBoxData: BoxData | null = null

  extractedData.forEach((row, i) => {
    const [
      timestamp,
      boxDetected,
      boxTop,
      boxBottom,
      boxHeight,
      touchCount,
      upperSlope,
      lowerSlope,
      targetUp,
      targetDown,
    ] = row as [number, number, number, number, number, number, number, number, number, number]

    if (boxDetected && boxTop !== null && boxBottom !== null) {
      // Start new box or continue existing one
      if (activeBoxStart === null) {
        activeBoxStart = timestamp
        activeBoxData = {
          top: boxTop,
          bottom: boxBottom,
          touchCount: touchCount || 0,
          targetUp: targetUp,
          targetDown: targetDown,
        }
      } else if (activeBoxData !== null) {
        // Update active box data
        activeBoxData = {
          top: boxTop,
          bottom: boxBottom,
          touchCount: touchCount || activeBoxData.touchCount,
          targetUp: targetUp || activeBoxData.targetUp,
          targetDown: targetDown || activeBoxData.targetDown,
        }
      }
    } else if (activeBoxStart !== null && activeBoxData !== null) {
      // Box ended, draw the consolidated box
      const endTimestamp = i > 0 ? indexColumn[i - 1] : timestamp

      // Create rectangle shape for the consolidation box
      shapes.push({
        type: "rect",
        points: [
          {
            x: activeBoxStart,
            y: activeBoxData.bottom,
            xAxis: 0,
            yAxis: seriesConfig.yAxis || 0,
          },
          {
            x: endTimestamp,
            y: activeBoxData.top,
            xAxis: 0,
            yAxis: seriesConfig.yAxis || 0,
          },
        ],
        fill: styleOptions?.boxColor || "rgba(100, 100, 100, 0.1)",
        stroke: styleOptions?.borderColor || "rgba(0, 100, 255, 0.8)",
        strokeWidth: 2,
        yAxis: seriesConfig.yAxis,
      })

      // Add label showing touch count
      const midX = (activeBoxStart + endTimestamp) / 2
      const midY = (activeBoxData.top + activeBoxData.bottom) / 2
      labels.push({
        point: {
          x: midX,
          y: midY,
          yAxis: seriesConfig.yAxis,
          xAxis: 0,
        },
        text: `Touches: ${activeBoxData.touchCount}`,
        style: {
          color: "rgba(255, 255, 255, 0.8)",
          fontSize: "10px",
          fontWeight: "bold",
        },
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderWidth: 0,
        padding: 4,
        borderRadius: 3,
      })

      // Draw target lines extending from the end of the box
      if (activeBoxData.targetUp !== null && !isNaN(activeBoxData.targetUp)) {
        // Target up line (green dashed)
        shapes.push({
          type: "path",
          points: [
            {
              x: endTimestamp,
              y: activeBoxData.targetUp,
              xAxis: 0,
              yAxis: seriesConfig.yAxis || 0,
            },
            {
              x: Math.min(endTimestamp + (endTimestamp - activeBoxStart), indexColumn[indexColumn.length - 1]),
              y: activeBoxData.targetUp,
              xAxis: 0,
              yAxis: seriesConfig.yAxis || 0,
            },
          ],
          stroke: styleOptions?.targetUpColor || "rgba(0, 255, 0, 0.8)",
          strokeWidth: 2,
          dashStyle: "Dash",
          yAxis: seriesConfig.yAxis,
        })

        // Label for target up
        labels.push({
          point: {
            x: endTimestamp,
            y: activeBoxData.targetUp,
            yAxis: seriesConfig.yAxis,
            xAxis: 0,
          },
          text: `T↑: ${activeBoxData.targetUp.toFixed(2)}`,
          style: {
            color: styleOptions?.targetUpColor || "rgba(0, 255, 0, 1)",
            fontSize: "9px",
            fontWeight: "bold",
          },
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderWidth: 0,
          padding: 3,
          borderRadius: 2,
          x: 5,
          y: -10,
        })
      }

      if (activeBoxData.targetDown !== null && !isNaN(activeBoxData.targetDown)) {
        // Target down line (red dashed)
        shapes.push({
          type: "path",
          points: [
            {
              x: endTimestamp,
              y: activeBoxData.targetDown,
              xAxis: 0,
              yAxis: seriesConfig.yAxis || 0,
            },
            {
              x: Math.min(endTimestamp + (endTimestamp - activeBoxStart), indexColumn[indexColumn.length - 1]),
              y: activeBoxData.targetDown,
              xAxis: 0,
              yAxis: seriesConfig.yAxis || 0,
            },
          ],
          stroke: styleOptions?.targetDownColor || "rgba(255, 0, 0, 0.8)",
          strokeWidth: 2,
          dashStyle: "Dash",
          yAxis: seriesConfig.yAxis,
        })

        // Label for target down
        labels.push({
          point: {
            x: endTimestamp,
            y: activeBoxData.targetDown,
            yAxis: seriesConfig.yAxis,
            xAxis: 0,
          },
          text: `T↓: ${activeBoxData.targetDown.toFixed(2)}`,
          style: {
            color: styleOptions?.targetDownColor || "rgba(255, 0, 0, 1)",
            fontSize: "9px",
            fontWeight: "bold",
          },
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          borderWidth: 0,
          padding: 3,
          borderRadius: 2,
          x: 5,
          y: 10,
        })
      }

      // Reset active box
      activeBoxStart = null
      activeBoxData = null
    }
  })

  // Handle case where box extends to the end of data
  if (activeBoxStart !== null && activeBoxData !== null) {
    const endTimestamp = indexColumn[indexColumn.length - 1]
    const boxData: BoxData = activeBoxData // Type narrowing helper

    shapes.push({
      type: "rect",
      points: [
        {
          x: activeBoxStart,
          y: boxData.bottom,
          xAxis: 0,
          yAxis: seriesConfig.yAxis || 0,
        },
        {
          x: endTimestamp,
          y: boxData.top,
          xAxis: 0,
          yAxis: seriesConfig.yAxis || 0,
        },
      ],
      fill: styleOptions?.boxColor || "rgba(100, 100, 100, 0.1)",
      stroke: styleOptions?.borderColor || "rgba(0, 100, 255, 0.8)",
      strokeWidth: 2,
      yAxis: seriesConfig.yAxis,
    })

    const midX = (activeBoxStart + endTimestamp) / 2
    const midY = (boxData.top + boxData.bottom) / 2
    labels.push({
      point: {
        x: midX,
        y: midY,
        yAxis: seriesConfig.yAxis,
        xAxis: 0,
      },
      text: `Touches: ${boxData.touchCount}`,
      style: {
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: "10px",
        fontWeight: "bold",
      },
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      borderWidth: 0,
      padding: 4,
      borderRadius: 3,
    })
  }

  // Create a dummy series for legend/toggle control
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    data: [],
    showInLegend: true,
    enableMouseTracking: false,
    color: styleOptions?.borderColor || "rgba(0, 100, 255, 0.8)",
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
