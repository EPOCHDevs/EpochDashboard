import {
  IRoundTrip,
  PLOT_KIND,
  SeriesConfig,
} from "../../../../types/TradeAnalyticsTypes"
import { type DataType, type Table } from "apache-arrow"
import { TRADE_ANALYTICS_PLOT_KIND_COLOR_PALETTE, getTradeAnalyticsPlotKindColorPalette } from "../../../../constants/tradeAnalytics"
import {
  AnnotationsOptions,
  SeriesOptionsType,
  XAxisPlotBandsOptions,
  XAxisPlotLinesOptions,
  YAxisPlotLinesOptions,
} from "highcharts"
import {
  CANDLESTICK_PLOT_KIND_DATA_KEYS,
  generateCandlestickPlotKindSeriesOptions,
} from "./Candlestick"
import {
  BOLLINGER_BANDS_PLOT_KIND_DATA_KEYS,
  generateBollingerBandsPlotKindSeriesOptions,
} from "./BollingerBands"
import {
  STOCHASTIC_PLOT_KIND_DATA_KEYS,
  generateStochasticPlotKindSeriesOptions,
} from "./Stochastic"
import { LINE_PLOT_KIND_DATA_KEYS, generateLinePlotKindSeriesOptions } from "./Line"
import { COLUMN_PLOT_KIND_DATA_KEYS, generateColumnPlotKindSeriesOptions } from "./Column"
import { FVG_PLOT_KIND_DATA_KEYS, generateFVGPlotElements } from "./FVG"
import { ATR_PLOT_KIND_DATA_KEYS, generateATRPlotKindSeriesOptions } from "./ATR"
import { BOSCHOCH_PLOT_KIND_DATA_KEYS, generateBOSCHOCHPlotKindSeriesOptions } from "./BOSCHOCH"
import { ELDERS_PLOT_KIND_DATA_KEYS, generateEldersPlotElements } from "./Elders"
import { FLAG_PLOT_KIND_DATA_KEYS, generateFlagPlotKindSeriesOptions } from "./Flag"
import {
  TRADE_SIGNAL_PLOT_KIND_DATA_KEYS,
  generateTradeSignalPlotKindSeriesOptions,
} from "./TradeSignal"
import { LIGUIDITY_PLOT_KIND_DATA_KEYS, generateLiquidityPlotKindSeriesOptions } from "./Liquidity"
import { MACD_PLOT_KIND_DATA_KEYS, generateMACDPlotKindSeriesOptions } from "./MACD"
import { ORDER_BLOCKS_PLOT_KIND_DATA_KEYS, generateOrderBlocksPlotElements } from "./OrderBlocks"
import { RSI_PLOT_KIND_DATA_KEYS, generateRSIPlotKindSeriesOptions } from "./RSI"
import { SESSIONS_PLOT_KIND_DATA_KEYS, generateSessionsPlotElements } from "./Sessions"
import { AROON_PLOT_KIND_DATA_KEYS, generateAroonPlotKindSeriesOptions } from "./Aroon"
import { FISHER_PLOT_KIND_DATA_KEYS, generateFisherPlotKindSeriesOptions } from "./Fisher"
import { QQE_PLOT_KIND_DATA_KEYS, generateQQEPlotKindSeriesOptions } from "./QQE"
import { QSTICK_PLOT_KIND_DATA_KEYS, generateQStickPlotKindSeriesOptions } from "./QStick"
import { PSAR_PLOT_KIND_DATA_KEYS, generatePSARPlotKindSeriesOptions } from "./PSAR"
import { CCI_PLOT_KIND_DATA_KEYS, generateCCIPlotKindSeriesOptions } from "./CCI"
import { FOSC_PLOT_KIND_DATA_KEYS, generateFOSCPlotKindSeriesOptions } from "./FOSC"
import {
  PREVIOUS_HIGH_LOW_PLOT_KIND_DATA_KEYS,
  generatePreviousHighLowPlotElements,
} from "./PreviousHighLow"
import { RETRACEMENTS_PLOT_KIND_DATA_KEYS, generateRetracementsPlotElements } from "./Retracements"
import {
  SWING_HIGH_LOW_PLOT_KIND_DATA_KEYS,
  generateSwingHighLowPlotElements,
} from "./SwingHighLow"
import { EXIT_LEVELS_PLOT_KIND_DATA_KEYS, generateExitLevelsPlotElements } from "./ExitLevels"
import { POSITION_PLOT_KIND_DATA_KEYS, generatePositionPlotKindSeriesOptions } from "./Position"
import { VORTEX_PLOT_KIND_DATA_KEYS, generateVortexPlotKindSeriesOptions } from "./Vortex"
import { ICHIMOKU_PLOT_KIND_DATA_KEYS, generateIchimokuPlotKindSeriesOptions } from "./Ichimoku"
import {
  CHANDE_KROLL_PLOT_KIND_DATA_KEYS,
  generateChandeKrollPlotKindSeriesOptions,
} from "./ChandeKrollStop"
import { GAP_PLOT_KIND_DATA_KEYS, generateGapPlotElements } from "./Gap"

// Interface for plot elements returned by plot kind handlers
export interface PlotElements {
  series: SeriesOptionsType[]
  plotBands?: XAxisPlotBandsOptions[] // Highcharts PlotBandOptions
  plotLines?: Array<XAxisPlotLinesOptions | YAxisPlotLinesOptions> // Highcharts PlotLineOptions
  annotations?: AnnotationsOptions[] // Complete annotation objects with shapes, labels, zIndex, labelOptions etc
}

interface generatePlotElementsProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
  roundTrips?: IRoundTrip[]
}
export const generatePlotElements = ({
  data,
  seriesConfig,
  roundTrips,
}: generatePlotElementsProps): PlotElements | null => {
  switch (seriesConfig.type) {
    case PLOT_KIND.VORTEX: {
      return {
        series: generateVortexPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.ICHIMOKU: {
      return {
        series: generateIchimokuPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.CHANDE_KROLL_STOP: {
      return {
        series: generateChandeKrollPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.LINE:
    case PLOT_KIND.PANEL_LINE:
    case PLOT_KIND.PANEL_LINE_PERCENT:
    case PLOT_KIND.H_LINE:
    case PLOT_KIND.VWAP:
    case PLOT_KIND.BB_PERCENT_B: {
      return {
        series: generateLinePlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.RETRACEMENTS: {
      return generateRetracementsPlotElements({
        data,
        seriesConfig,
      })
    }
    case PLOT_KIND.SHL: {
      return generateSwingHighLowPlotElements({
        data,
        seriesConfig,
      })
    }
    case PLOT_KIND.PREVIOUS_HIGH_LOW: {
      return generatePreviousHighLowPlotElements({
        data,
        seriesConfig,
      })
    }
    case PLOT_KIND.CCI: {
      return {
        series: generateCCIPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.FOSC: {
      return {
        series: generateFOSCPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.PSAR: {
      return {
        series: generatePSARPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.QSTICK: {
      return {
        series: generateQStickPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.AROON: {
      return {
        series: generateAroonPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.FISHER: {
      return {
        series: generateFisherPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.QQE: {
      return {
        series: generateQQEPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.CANDLESTICK: {
      return generateCandlestickPlotKindSeriesOptions({
        data,
        seriesConfig,
        roundTrips,
      })
    }
    case PLOT_KIND.COLUMN:
    case PLOT_KIND.AO: {
      return {
        series: generateColumnPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.FVG: {
      return generateFVGPlotElements({
        data,
        seriesConfig,
      })
    }
    case PLOT_KIND.GAP: {
      return generateGapPlotElements({
        data,
        seriesConfig,
      })
    }
    case PLOT_KIND.ORDER_BLOCKS: {
      return generateOrderBlocksPlotElements({
        data,
        seriesConfig,
      })
    }
    case PLOT_KIND.BOS_CHOCH: {
      return {
        series: generateBOSCHOCHPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.LIQUIDITY: {
      return generateLiquidityPlotKindSeriesOptions({
        data,
        seriesConfig,
      })
    }
    case PLOT_KIND.SESSIONS: {
      return generateSessionsPlotElements({
        data,
        seriesConfig,
      })
    }
    case PLOT_KIND.ELDERS: {
      return generateEldersPlotElements({
        data,
        seriesConfig,
      })
    }
    case PLOT_KIND.MACD: {
      return {
        series: generateMACDPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.BBANDS: {
      return {
        series: generateBollingerBandsPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.RSI: {
      return {
        series: generateRSIPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.STOCH: {
      return {
        series: generateStochasticPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.ATR: {
      return {
        series: generateATRPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.FLAG: {
      return {
        series: generateFlagPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.TRADE_SIGNAL: {
      return {
        series: generateTradeSignalPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    case PLOT_KIND.EXIT_LEVELS: {
      return generateExitLevelsPlotElements({
        data,
        seriesConfig,
      })
    }
    case PLOT_KIND.POSITION: {
      return {
        series: generatePositionPlotKindSeriesOptions({
          data,
          seriesConfig,
        }),
      }
    }
    default: {
      return null
    }
  }
}

/**
 * Validate that required columns exist in the data
 */
interface validatePlotKindSeriesDataProps {
  seriesConfig: SeriesConfig
  data: Table<Record<string | number | symbol, DataType>>
}
export const validatePlotKindSeriesData = ({
  data,
  seriesConfig,
}: validatePlotKindSeriesDataProps): boolean => {
  const columns = Object.values(seriesConfig.dataMapping)
  return columns.every((columnRef) => {
    const column = data.getChild(columnRef as string)
    return column !== null && column !== undefined
  })
}

/**
 * Extract data from Apache Arrow table based on series configuration
 */
interface extractPlotKindSeriesDataProps {
  seriesConfig: SeriesConfig
  data?: Table<Record<string | number | symbol, DataType>>
}
export const extractPlotKindSeriesData = ({
  data,
  seriesConfig,
}: extractPlotKindSeriesDataProps): unknown[] => {
  const getSeriesDataKeys = () => {
    switch (seriesConfig.type) {
      case PLOT_KIND.LINE:
      case PLOT_KIND.PANEL_LINE:
      case PLOT_KIND.PANEL_LINE_PERCENT:
      case PLOT_KIND.H_LINE:
      case PLOT_KIND.VWAP:
      case PLOT_KIND.BB_PERCENT_B:
        return LINE_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.SHL:
        return SWING_HIGH_LOW_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.RETRACEMENTS:
        return RETRACEMENTS_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.PREVIOUS_HIGH_LOW:
        return PREVIOUS_HIGH_LOW_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.CCI:
        return CCI_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.FOSC:
        return FOSC_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.PSAR:
        return PSAR_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.AROON:
        return AROON_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.FISHER:
        return FISHER_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.QQE:
        return QQE_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.CANDLESTICK:
        return CANDLESTICK_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.COLUMN:
      case PLOT_KIND.AO:
        return COLUMN_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.QSTICK:
        return QSTICK_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.FVG:
        return FVG_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.GAP:
        return GAP_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.ORDER_BLOCKS:
        return ORDER_BLOCKS_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.BOS_CHOCH:
        return BOSCHOCH_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.LIQUIDITY:
        return LIGUIDITY_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.SESSIONS:
        return SESSIONS_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.ELDERS:
        return ELDERS_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.MACD:
        return MACD_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.VORTEX:
        return VORTEX_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.ICHIMOKU:
        return ICHIMOKU_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.CHANDE_KROLL_STOP:
        return CHANDE_KROLL_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.BBANDS:
        return BOLLINGER_BANDS_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.RSI:
        return RSI_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.STOCH:
        return STOCHASTIC_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.ATR:
        return ATR_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.FLAG:
        return FLAG_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.TRADE_SIGNAL:
        return TRADE_SIGNAL_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.EXIT_LEVELS:
        return EXIT_LEVELS_PLOT_KIND_DATA_KEYS
      case PLOT_KIND.POSITION:
        return POSITION_PLOT_KIND_DATA_KEYS
      default:
        return []
    }
  }

  const result = []
  const missingColumns = new Set<string>() // Track missing columns to log once

  for (let i = 0; i < (data?.numRows ?? 0); i++) {
    const row: unknown[] = []
    getSeriesDataKeys().forEach((key) => {
      const columnRef = seriesConfig.dataMapping[key]
      if (columnRef) {
        const column = data?.getChild(columnRef)
        if (column) {
          const value = column.get(i)
          row.push(value)
        } else {
          // Column mapping exists but data doesn't have this column
          if (i === 0) { // Only track on first row to avoid spam
            missingColumns.add(columnRef)
          }
          row.push(null) // Push null for missing data
        }
      } else {
        // No column mapping defined for this key - this is expected for optional fields
        row.push(null)
      }
    })
    result.push(row)
  }

  // Log missing columns once at the end if any were found
  if (missingColumns.size > 0) {
    // Optional columns missing - this is expected and not an error
  }

  return result
}

/**
 * Extract a single column from the table
 */
interface extractColumnOfPlotKindSeriesDataProps {
  data?: Table<Record<string | number | symbol, DataType>>
  columnName: string
}
export const extractColumn = ({ columnName, data }: extractColumnOfPlotKindSeriesDataProps) => {
  const column = data?.getChild(columnName)
  if (!column) return []

  const result: unknown[] = []
  for (let i = 0; i < column.length; i++) {
    result.push(column.get(i))
  }
  return result
}

// Generate a color based on a hash of the series name for consistent colors (theme-aware)
export const getPlotKindSeriesColor = (seriesName: string): string => {
  let hash = 0
  for (let i = 0; i < seriesName.length; i++) {
    const char = seriesName.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  const palette = getTradeAnalyticsPlotKindColorPalette()
  const index = Math.abs(hash) % palette.length
  return palette[index]
}

/**
 * Get common series options that apply to most plot types
 */
export const getSharedPlotKindSeriesOptions = (
  seriesConfig: SeriesConfig
): Partial<SeriesOptionsType> => {
  return {
    id: seriesConfig.id,
    name: seriesConfig.name,
    yAxis: seriesConfig.yAxis,
    zIndex: seriesConfig.zIndex,
    linkedTo: seriesConfig.linkedTo,
  }
}
