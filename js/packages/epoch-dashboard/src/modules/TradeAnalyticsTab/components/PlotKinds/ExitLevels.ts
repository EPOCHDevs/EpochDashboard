import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import { extractColumn, PlotElements } from "./EpochPlotKindOptions"
import { SeriesLineOptions, AnnotationsOptions } from "highcharts"
import { tailwindColors } from "../../../../utils/tailwindHelpers"

export const EXIT_LEVELS_PLOT_KIND_DATA_KEYS = ["index", "take_profit", "stop_loss"]

interface generateExitLevelsPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
}

export const generateExitLevelsPlotElements = ({
  data,
  seriesConfig,
}: generateExitLevelsPlotElementsProps): PlotElements => {
  // Extract data columns
  const indexData = extractColumn({
    columnName: seriesConfig.dataMapping.index || "index",
    data,
  })
  const takeProfitData = extractColumn({
    columnName: seriesConfig.dataMapping.take_profit || "take_profit",
    data,
  })
  const stopLossData = extractColumn({
    columnName: seriesConfig.dataMapping.stop_loss || "stop_loss",
    data,
  })

  // Prepare take profit data
  const takeProfitSeriesData = indexData
    .map((timestamp, i) => [timestamp, takeProfitData[i]])
    .filter(([, value]) => value !== null) // Filter out null values

  // Prepare stop loss data
  const stopLossSeriesData = indexData
    .map((timestamp, i) => [timestamp, stopLossData[i]])
    .filter(([, value]) => value !== null) // Filter out null values

  const series: SeriesLineOptions[] = []
  const annotations: AnnotationsOptions[] = []

  // Create Take Profit line series
  if (takeProfitSeriesData.length > 0) {
    const takeProfitOptions: SeriesLineOptions = {
      type: "line",
      id: `${seriesConfig.id}_take_profit`,
      name: "Take Profit",
      yAxis: seriesConfig.yAxis,
      zIndex: seriesConfig.zIndex || 0,
      lineWidth: 2,
      color: tailwindColors.territory.success,
      dashStyle: "Dash",
      opacity: 0.8,
      step: "left", // Step line for take profit levels
      data: takeProfitSeriesData as SeriesLineOptions["data"],
      marker: {
        enabled: false,
      },
    }
    series.push(takeProfitOptions)

    // Add annotation for Take Profit at the start
    const firstPoint = takeProfitSeriesData[0]
    const xValue = Array.isArray(firstPoint) ? Number(firstPoint[0]) : Number(firstPoint)
    const yValue = Array.isArray(firstPoint) ? Number(firstPoint[1]) : Number(firstPoint)

    annotations.push({
      labels: [
        {
          point: {
            x: xValue,
            y: yValue,
            xAxis: 0,
            yAxis: seriesConfig.yAxis || 0,
          },
          text: "Take Profit",
          backgroundColor: tailwindColors.territory.success,
          borderColor: tailwindColors.territory.success,
          borderWidth: 1,
          style: {
            color: tailwindColors.primary.white,
            fontSize: "11px",
            fontWeight: "bold",
          },
          padding: 4,
          borderRadius: 3,
          x: 10, // Offset from the point
          y: -15, // Above the line
        },
      ],
      zIndex: 10,
    })
  }

  // Create Stop Loss line series
  if (stopLossSeriesData.length > 0) {
    const stopLossOptions: SeriesLineOptions = {
      type: "line",
      id: `${seriesConfig.id}_stop_loss`,
      name: "Stop Loss",
      yAxis: seriesConfig.yAxis,
      zIndex: seriesConfig.zIndex || 0,
      lineWidth: 2,
      color: tailwindColors.secondary.red,
      dashStyle: "Dash",
      opacity: 0.8,
      step: "left", // Step line for stop loss levels
      data: stopLossSeriesData as SeriesLineOptions["data"],
      marker: {
        enabled: false,
      },
    }
    series.push(stopLossOptions)

    // Add annotation for Stop Loss at the start
    const firstPoint = stopLossSeriesData[0]
    const xValue = Array.isArray(firstPoint) ? Number(firstPoint[0]) : Number(firstPoint)
    const yValue = Array.isArray(firstPoint) ? Number(firstPoint[1]) : Number(firstPoint)

    annotations.push({
      labels: [
        {
          point: {
            x: xValue,
            y: yValue,
            xAxis: 0,
            yAxis: seriesConfig.yAxis || 0,
          },
          text: "Stop Loss",
          backgroundColor: tailwindColors.secondary.red,
          borderColor: tailwindColors.secondary.red,
          borderWidth: 1,
          style: {
            color: tailwindColors.primary.white,
            fontSize: "11px",
            fontWeight: "bold",
          },
          padding: 4,
          borderRadius: 3,
          x: 10, // Offset from the point
          y: 15, // Below the line
        },
      ],
      zIndex: 10,
    })
  }

  return {
    series,
    annotations,
  }
}
