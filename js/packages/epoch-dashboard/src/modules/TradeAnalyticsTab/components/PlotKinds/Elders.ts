import { SeriesConfig } from "../../../../types/TradeAnalyticsTypes"
import { DataType, Table } from "apache-arrow"
import {
  extractPlotKindSeriesData,
  getSharedPlotKindSeriesOptions,
  PlotElements,
} from "./EpochPlotKindOptions"
import {
  SeriesColumnOptions,
  SeriesLineOptions,
  SeriesOptionsType,
  XAxisPlotBandsOptions,
} from "highcharts"

export const ELDERS_PLOT_KIND_DATA_KEYS = ["index", "result", "ema", "buy_signal", "sell_signal"]

export interface EldersStyleOptions {
  thermometerColor?: string
  emaColor?: string
  buySignalColor?: string
  sellSignalColor?: string
}

interface generateEldersPPlotKindSeriesOptionsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: EldersStyleOptions
}
const generateEldersPlotKindSeriesOptions = ({
  data,
  seriesConfig,
  styleOptions,
}: generateEldersPPlotKindSeriesOptionsProps): SeriesOptionsType[] => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })

  const thermometerData: SeriesColumnOptions["data"] = []
  const emaData: SeriesLineOptions["data"] = []

  extractedData.forEach((row) => {
    const [timestamp, result, ema] = row as [number, number, number]

    // Thermometer line
    if (result !== null && !isNaN(result)) {
      thermometerData.push([timestamp, result])
    }

    // EMA line
    if (ema !== null && !isNaN(ema)) {
      emaData.push([timestamp, ema])
    }
  })

  const series: SeriesOptionsType[] = []

  // Thermometer line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "column",
    name: `${seriesConfig.name} Thermometer`,
    id: seriesConfig.id,
    data: thermometerData,
    color: styleOptions?.thermometerColor || "#06b6d4",
    borderColor: "transparent",
  } as SeriesColumnOptions)

  // EMA line
  series.push({
    ...getSharedPlotKindSeriesOptions(seriesConfig),
    type: "line",
    name: `${seriesConfig.name} EMA`,
    id: `${seriesConfig.id}_ema`,
    data: emaData,
    color: styleOptions?.emaColor || "#f59e0b",
    lineWidth: 2,
    linkedTo: seriesConfig.id,
    marker: {
      enabled: false,
    },
  } as SeriesLineOptions)

  return series
}

interface generateEldersPlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  styleOptions?: EldersStyleOptions
}
export const generateEldersPlotElements = ({
  data,
  seriesConfig,
  styleOptions,
}: generateEldersPlotElementsProps): PlotElements => {
  const extractedData = extractPlotKindSeriesData({
    seriesConfig,
    data,
  })
  const plotBands: XAxisPlotBandsOptions[] = []

  let buyStartIndex = -1
  let sellStartIndex = -1

  extractedData.forEach((row, i) => {
    const [timestamp, buySignal, sellSignal] = row as [number, number, number, number, number]

    // Handle buy signal bands
    if (buySignal && buyStartIndex === -1) {
      buyStartIndex = i
    } else if (!buySignal && buyStartIndex !== -1) {
      // End of buy signal zone
      plotBands.push({
        from: (extractedData[buyStartIndex] as number[])[0], // start timestamp
        to: timestamp, // end timestamp
        color: "rgba(16, 185, 129, 0.1)", // green with low opacity
        label: {
          text: "Buy Zone",
          style: {
            color: "rgba(16, 185, 129, 0.5)",
            fontSize: "10px",
          },
        },
      })
      buyStartIndex = -1
    }

    // Handle sell signal bands
    if (sellSignal && sellStartIndex === -1) {
      sellStartIndex = i
    } else if (!sellSignal && sellStartIndex !== -1) {
      // End of sell signal zone
      plotBands.push({
        from: (extractedData[sellStartIndex] as number[])[0], // start timestamp
        to: timestamp, // end timestamp
        color: "rgba(239, 68, 68, 0.1)", // red with low opacity
        label: {
          text: "Sell Zone",
          style: {
            color: "rgba(239, 68, 68, 0.5)",
            fontSize: "10px",
          },
        },
      })
      sellStartIndex = -1
    }
  })

  // Handle any open zones at the end
  const lastRow = extractedData[extractedData.length - 1]
  if (lastRow) {
    const lastTimestamp = (lastRow as number[])[0]

    if (buyStartIndex !== -1) {
      plotBands.push({
        from: (extractedData[buyStartIndex] as number[])[0],
        to: lastTimestamp,
        color: "rgba(16, 185, 129, 0.1)",
        label: {
          text: "Buy Zone",
          style: {
            color: "rgba(16, 185, 129, 0.5)",
            fontSize: "10px",
          },
        },
      })
    }

    if (sellStartIndex !== -1) {
      plotBands.push({
        from: (extractedData[sellStartIndex] as number[])[0],
        to: lastTimestamp,
        color: "rgba(239, 68, 68, 0.1)",
        label: {
          text: "Sell Zone",
          style: {
            color: "rgba(239, 68, 68, 0.5)",
            fontSize: "10px",
          },
        },
      })
    }
  }

  // Also keep the series for backward compatibility
  const series = generateEldersPlotKindSeriesOptions({
    seriesConfig,
    data,
    styleOptions,
  })

  return {
    series,
  }
}
