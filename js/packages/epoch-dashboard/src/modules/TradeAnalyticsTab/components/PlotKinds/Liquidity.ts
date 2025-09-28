import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import { SeriesLineOptions, SeriesOptionsType, AnnotationsOptions } from "highcharts"
import { isNull } from "lodash"

export const LIGUIDITY_PLOT_KIND_DATA_KEYS = ["index", "liquidity", "level", "end", "swept"]

interface LiquidityStyleOptions {
  liquidityLineColor?: string
  sweptLineColor?: string
  liquidityTextColor?: string
  sweptTextColor?: string
  lineOpacity?: number
  textOpacity?: number
}

interface generateLiquidityPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: LiquidityStyleOptions
}

export const generateLiquidityPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateLiquidityPlotKindSeriesOptionsProps): PlotElements => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  // Extract high and low prices from main data if available
  const highPrices = data?.getChild("h")?.toArray()
  const lowPrices = data?.getChild("l")?.toArray()
  const timestamps = data?.getChild("index")?.toArray() as number[]

  // Default styling
  const liquidityLineColor =
    styleOptions?.liquidityLineColor || `rgba(255, 165, 0, ${styleOptions?.lineOpacity || 0.2})`
  const sweptLineColor =
    styleOptions?.sweptLineColor || `rgba(255, 0, 0, ${styleOptions?.lineOpacity || 0.2})`
  const liquidityTextColor =
    styleOptions?.liquidityTextColor || `rgba(255, 165, 0, ${styleOptions?.textOpacity || 0.4})`
  const sweptTextColor =
    styleOptions?.sweptTextColor || `rgba(255, 0, 0, ${styleOptions?.textOpacity || 0.4})`

  const shapes: AnnotationsOptions["shapes"] = []
  const labels: AnnotationsOptions["labels"] = []

  // Helper function to create data point objects
  const point = (x: number, y: number) => ({
    x: Number(x),
    y,
    xAxis: 0,
    yAxis: 0,
  })

  // Process each liquidity level
  const timestampsLength = timestamps?.length
  extractedData.forEach((dataPoint, index) => {
    // TODO: THis was added to fix the issue where the end and swept indexes were out of bounds
    // This is a temporary fix and should be removed once the issue is fixed in the backend
    const [timestamp, liquidity, level, endIndex, sweptIndex] = dataPoint as [
      number,
      number,
      number,
      number,
      number,
    ]
    const end = endIndex > timestampsLength ? timestampsLength - 1 : endIndex
    const swept = sweptIndex > timestampsLength ? timestampsLength - 1 : sweptIndex

    // Draw horizontal line for liquidity level
    if (!(isNull(liquidity) || isNaN(liquidity))) {
      const endTimestamp = timestamps[end]

      // Create horizontal liquidity line
      shapes.push({
        type: "path",
        points: [point(timestamp, level), point(endTimestamp, level)],
        stroke: liquidityLineColor,
        strokeWidth: 1,
      })

      // Add "Liquidity" label at midpoint
      const mid_x = Math.floor((index + end) / 2)
      labels.push({
        point: point(timestamps[mid_x], level),
        text: "Liquidity",
        y: liquidity === 1 ? -10 : 10, // Above if liquidity=1, below otherwise
        style: {
          color: liquidityTextColor,
          fontSize: "8px",
          fontWeight: "normal",
        },
        backgroundColor: "transparent",
        borderWidth: 0,
      })
    }

    // Draw swept line if applicable
    if (!(isNull(swept) || isNaN(swept) || swept === 0)) {
      const endTimestamp = timestamps[end]
      const sweptTimestamp = timestamps[swept]

      // Get the appropriate price (high if liquidity=1, low otherwise)
      const sweptPrice =
        liquidity === 1 ? (highPrices[swept] as number) : (lowPrices[swept] as number)

      // Create diagonal swept line
      shapes.push({
        type: "path",
        points: [point(endTimestamp, level), point(sweptTimestamp, sweptPrice)],
        stroke: sweptLineColor,
        strokeWidth: 1,
      })

      // Add "Liquidity Swept" label at midpoint
      const midX = Math.floor((index + swept) / 2)
      const midY = (level + sweptPrice) / 2

      labels.push({
        point: point(timestamps[midX], midY),
        text: "Liquidity Swept",
        y: liquidity === 1 ? -10 : 10,
        style: {
          color: sweptTextColor,
          fontSize: "8px",
          fontWeight: "normal",
        },
        backgroundColor: "transparent",
        borderWidth: 0,
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
      color: liquidityLineColor,
      showInLegend: true,
      enableMouseTracking: false,
    } as SeriesLineOptions,
  ]

  return {
    series,
    annotations: [
      {
        labels,
        shapes,
        zIndex: 2,
        labelOptions: {
          allowOverlap: true,
          backgroundColor: "transparent",
          borderWidth: 0,
          style: {
            fontSize: "8px",
            fontWeight: "normal",
          },
        },
      },
    ],
  }
}
