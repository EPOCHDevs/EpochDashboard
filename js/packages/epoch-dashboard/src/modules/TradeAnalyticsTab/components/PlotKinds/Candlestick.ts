import {
  IRoundTrip,
  SeriesConfig,
  TRADE_POSITION,
} from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import { SeriesCandlestickOptions, SeriesOptionsType, AnnotationsOptions } from "highcharts"
import { tailwindColors } from "../../../../utils/tailwindHelpers"

export const CANDLESTICK_PLOT_KIND_DATA_KEYS = ["index", "open", "high", "low", "close"]

interface generateCandlestickPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: SeriesCandlestickOptions
  roundTrips?: IRoundTrip[]
}
export const generateCandlestickPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
  roundTrips,
}: generateCandlestickPlotKindSeriesOptionsProps): PlotElements => {
  const series: SeriesOptionsType[] = []
  const annotations: AnnotationsOptions[] = []

  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  // Function to generate an arrow SVG with text
  const getArrowPointSVG = (direction: "up" | "down"): string => {
    return direction === "up"
      ? `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path fill="green" d="M16,2L6,18h7v18h6V18h7L16,2z"/>
      </svg>
    `
      : `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path fill="red" d="M16,38l10-16h-7V4h-6v18H6L16,38z"/>
      </svg>
    `
  }

  if (extractedData) {
    series.push({
      ...getSharedPlotKindSeriesOptions(seriesConfig),
      type: "candlestick",
      upColor: tailwindColors.territory.success,
      upLineColor: tailwindColors.territory.success,
      color: tailwindColors.secondary.red,
      lineColor: tailwindColors.secondary.red,
      ...styleOptions,
      data: extractedData,
    } as SeriesCandlestickOptions)
  }

  if (roundTrips?.length) {
    // Separate buy and sell points based on position side
    const buyPoints: Array<{ x: number; y: number; roundTrip: IRoundTrip }> = []
    const sellPoints: Array<{ x: number; y: number; roundTrip: IRoundTrip }> = []

    // Create Take Profit and Stop Loss annotations
    const shapes: AnnotationsOptions["shapes"] = []
    const labels: AnnotationsOptions["labels"] = []

    roundTrips.forEach((roundTrip) => {
      const openTimestamp = new Date(roundTrip.open_datetime).getTime()

      if (roundTrip.side === TRADE_POSITION.LONG) {
        // For long positions: Buy at open, Sell at close
        buyPoints.push({
          x: openTimestamp,
          y: roundTrip.lowest_price, // Position at the lowest price
          roundTrip,
        })
        if (roundTrip.close_datetime) {
          const closeTimestamp = new Date(roundTrip.close_datetime).getTime()

          sellPoints.push({
            x: closeTimestamp,
            y: roundTrip.highest_price, // Position at the highest price
            roundTrip,
          })
        }
      } else if (roundTrip.side === TRADE_POSITION.SHORT) {
        // For short positions: Sell at open, Buy at close
        sellPoints.push({
          x: openTimestamp,
          y: roundTrip.highest_price, // Position at the highest price
          roundTrip,
        })
        if (roundTrip.close_datetime) {
          const closeTimestamp = new Date(roundTrip.close_datetime).getTime()

          buyPoints.push({
            x: closeTimestamp,
            y: roundTrip.lowest_price, // Position at the lowest price
            roundTrip,
          })
        }
      }
    })

    // Render Buy point series
    if (buyPoints.length) {
      series.push({
        type: "scatter",
        name: "Buy Point",
        id: "buy-point",
        data: buyPoints.map((point) => [point.x, point.y]),
        marker: {
          symbol: `url(data:image/svg+xml;base64,${btoa(getArrowPointSVG("up"))})`,
          width: 32,
          height: 40,
          enabled: true,
        },
        dataLabels: {
          enabled: true,
          format: `Bought {y:.2f}`,
          style: {
            color: "white",
            textOutline: "2px black",
            fontSize: "12px",
            fontWeight: "bold",
          },
          backgroundColor: "rgba(0, 128, 0, 0.8)",
          borderColor: "rgba(0, 128, 0, 1)",
          borderRadius: 4,
          borderWidth: 1,
          padding: 4,
          y: 50, // Move further down to avoid overlap
          x: 0,
        },
        enableMouseTracking: true,
        yAxis: 0, // Assume the first yAxis is for price
      })
    }

    // Render Sell point series
    if (sellPoints.length) {
      series.push({
        type: "scatter",
        name: "Sell Point",
        id: "sell-point",
        data: sellPoints.map((point) => [point.x, point.y]),
        marker: {
          symbol: `url(data:image/svg+xml;base64,${btoa(getArrowPointSVG("down"))})`,
          width: 32,
          height: 40,
          enabled: true,
        },
        dataLabels: {
          enabled: true,
          format: `Sold {y:.2f}`,
          style: {
            color: "white",
            textOutline: "2px black",
            fontSize: "12px",
            fontWeight: "bold",
          },
          backgroundColor: "rgba(220, 38, 38, 0.8)",
          borderColor: "rgba(220, 38, 38, 1)",
          borderRadius: 4,
          borderWidth: 1,
          padding: 4,
          y: -50, // Move further up to avoid overlap
          x: 0,
        },
        enableMouseTracking: true,
        yAxis: 0, // Assume the first yAxis is for price
      })
    }

    // Add annotations if we have any shapes
    if (shapes.length > 0) {
      annotations.push({
        labels,
        shapes,
        zIndex: 3,
        labelOptions: {
          allowOverlap: true,
          backgroundColor: "transparent",
          borderWidth: 0,
          style: {
            fontSize: "10px",
            fontWeight: "bold",
          },
        },
      })
    }
  }

  return {
    series,
    annotations,
  }
}
