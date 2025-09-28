// Trade Analytics Types - extracted from PublishedStrategyServicesTypes
import { IAsset } from './AssetsTypes'

export enum TRADE_RESULT {
  WIN = "WIN",
  LOSS = "LOSS",
  OPEN = "OPEN",
  BREAK_EVEN = "BREAK EVEN",
}

export enum TRADE_POSITION {
  LONG = "Long",
  SHORT = "Short",
}

export enum PLOT_KIND {
  LINE = "line",
  CANDLESTICK = "candlestick",
  COLUMN = "column",
  PANEL_LINE = "panel_line",
  PANEL_LINE_PERCENT = "panel_line_percent",
  RSI = "rsi",
  CCI = "cci",
  AROON = "aroon",
  FISHER = "fisher",
  QQE = "qqe",
  ELDERS = "elders",
  FOSC = "fosc",
  STOCH = "stoch",
  ATR = "atr",
  AO = "ao",
  QSTICK = "qstick",
  BBANDS = "bbands",
  BB_PERCENT_B = "bb_percent_b",
  MACD = "macd",
  VORTEX = "vortex",
  ICHIMOKU = "ichimoku",
  CHANDE_KROLL_STOP = "chande_kroll_stop",
  PSAR = "psar",
  FLAG = "flag",
  TRADE_SIGNAL = "trade_signal",
  SHL = "shl",
  BOS_CHOCH = "bos_choch",
  ORDER_BLOCKS = "order_blocks",
  FVG = "fvg",
  LIQUIDITY = "liquidity",
  GAP = "gap",
  SESSIONS = "sessions",
  PREVIOUS_HIGH_LOW = "previous_high_low",
  RETRACEMENTS = "retracements",
  H_LINE = "h_line",
  VWAP = "vwap",
  EXIT_LEVELS = "exit_levels",
  POSITION = "position",
}

export interface SeriesConfig {
  id: string
  type: PLOT_KIND
  name: string
  dataMapping: {
    index: string // Always present, maps to timestamp column
    [key: string]: string // Other mappings specific to each plot type
  }
  zIndex: number
  yAxis: number
  linkedTo?: string // Reference to another series' id
  // Arbitrary configuration options passed from backend per-series
  // Example for Sessions: { session: "NewYork" | { start: {...}, end: {...} } }
  configOptions?: Record<string, unknown>
}

export interface ChartInfoType {
  yAxis: {
    top: number // Percentage from top
    height: number // Percentage height
  }[]
  series: SeriesConfig[]
}

export type TradeAnalyticsMetadataChartInfoType = Record<string, ChartInfoType>

export interface TradeAnalyticsMetadataAssetInfoType {
  asset: IAsset
  start_date: string // Start date of the data
  end_date: string // End date of the data
  timeframes: string[]
}

export interface GetTradeAnalyticsMetadataResponseType {
  asset_info: Record<string, TradeAnalyticsMetadataAssetInfoType>
  chart_info?: TradeAnalyticsMetadataChartInfoType
}

export interface IRoundTrip {
  asset: string
  asset_id: string
  asset_root_id: string
  avg_entry_price: number
  avg_exit_price: number
  close_datetime?: string // 2024-07-31 00:00:00.000000000Z
  cost: number
  duration: number
  entry_cost: number
  entry_trade_sizes: number
  exit_cost: number
  exit_trade_sizes: number
  highest_price: number
  index: number
  lowest_price: number
  net_return: number
  open_datetime: string // "2024-07-30 00:00:00.000000000Z"
  opening_price: number
  closing_price: number
  position: number
  return_nominal: number
  return_percent: number
  return_size: number
  side: TRADE_POSITION
  size: number
  status: TRADE_RESULT
  stop_loss: number | null
  take_profit: number | null
  total_commissions: number | null
}

export interface GetTradeAnalyticsRoundTripsResponseType {
  items: Array<IRoundTrip>
  page: number
  total: number
}