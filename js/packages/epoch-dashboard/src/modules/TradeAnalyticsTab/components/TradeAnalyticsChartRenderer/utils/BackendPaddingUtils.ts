/**
 * Utility functions for backend padding calculations
 * Uses the backend's pad_front and pad_back parameters for reliable padding
 */

export interface PaddingConfig {
  frontPadUnits: number // Number of units to pad before the trade
  backPadUnits: number // Number of units to pad after the trade
  baselineUnits: number // Number of units for baseline data when no trades selected
}

/**
 * Default padding configurations for different use cases
 */
export const DEFAULT_PADDING_CONFIGS = {
  // Conservative padding - good for most cases
  CONSERVATIVE: {
    frontPadUnits: 50,
    backPadUnits: 50,
    baselineUnits: 800,
  },
  // Standard padding - balanced approach with more context
  STANDARD: {
    frontPadUnits: 100,
    backPadUnits: 100,
    baselineUnits: 1500,
  },
  // Aggressive padding - maximum context
  AGGRESSIVE: {
    frontPadUnits: 200,
    backPadUnits: 200,
    baselineUnits: 3000,
  },
  // Minimal padding - for performance-critical scenarios
  MINIMAL: {
    frontPadUnits: 25,
    backPadUnits: 25,
    baselineUnits: 400,
  },
} as const

/**
 * Backend API parameters for trade analytics data request
 */
export interface TradeAnalyticsApiParams {
  strategyId: string
  assetId: string
  timeframe: string
  from_ms?: number
  to_ms?: number
  pivot?: number
  pad_front?: number
  pad_back?: number
}

// Approximate milliseconds per bar from timeframe strings like "5m", "1h", "1D", "1W"
function getMsPerBar(timeframe: string): number {
  const tf = (timeframe || "").toLowerCase().trim()
  const match = tf.match(/^(\d+)?\s*([a-z]+)/)
  if (!match) return 60_000 // default 1 minute
  const num = parseInt(match[1] || "1", 10)
  const unit = match[2]
  switch (unit) {
    case "m":
    case "min":
    case "mins":
    case "minute":
    case "minutes":
      return num * 60_000
    case "h":
    case "hr":
    case "hour":
    case "hours":
      return num * 3_600_000
    case "d":
    case "day":
    case "days":
      return num * 86_400_000
    case "w":
    case "wk":
    case "week":
    case "weeks":
      return num * 7 * 86_400_000
    case "q": // quarter (approximate 91 days)
    case "quarter":
      return num * 91 * 86_400_000
    case "mo":
    case "mon":
    case "month":
    case "months":
      return num * 30 * 86_400_000
    case "y":
    case "yr":
    case "year":
    case "years":
      return num * 365 * 86_400_000
    default:
      return 60_000
  }
}

/**
 * Calculates API parameters for round trip focused data request
 * Uses backend padding instead of frontend calculations
 */
export function calculateRoundTripApiParams(
  baseParams: {
    strategyId: string
    assetId: string
    timeframe: string
  },
  roundTripTimes: {
    openTime: number // milliseconds
    closeTime: number // milliseconds
  },
  paddingConfig: PaddingConfig = DEFAULT_PADDING_CONFIGS.STANDARD
): TradeAnalyticsApiParams {
  const msPerBar = getMsPerBar(baseParams.timeframe)

  const { openTime, closeTime } = roundTripTimes
  // Pivot must always be the trade open time (works for both open and closed trades)
  const pivot = openTime

  // Compute required bars after pivot to include the close (or zero if still open)
  const backDurationMs = Math.max(0, (closeTime ?? openTime) - openTime)
  const backUnits = msPerBar > 0 ? Math.ceil(backDurationMs / msPerBar) : 0

  return {
    ...baseParams,
    pivot,
    pad_front: paddingConfig.frontPadUnits,
    pad_back: backUnits + paddingConfig.backPadUnits,
  }
}

/**
 * Calculates API parameters for baseline data request (no specific round trip)
 * Uses previous behavior: fetch entire candlestick data (no time constraints)
 */
export function calculateBaselineApiParams(baseParams: {
  strategyId: string
  assetId: string
  timeframe: string
}): TradeAnalyticsApiParams {
  // Previous behavior: no time constraints = fetch entire dataset
  // Don't set pivot, pad_front, pad_back, from_ms, or to_ms
  // This tells the backend to return all available data for the asset/timeframe
  return {
    ...baseParams,
    // No time parameters = fetch entire candlestick data
  }
}

/**
 * Calculates API parameters for multiple round trips
 * Finds the optimal pivot and padding to cover all trades
 */
export function calculateMultiRoundTripApiParams(
  baseParams: {
    strategyId: string
    assetId: string
    timeframe: string
  },
  roundTrips: Array<{
    openTime: number
    closeTime: number | null
  }>,
  paddingConfig: PaddingConfig = DEFAULT_PADDING_CONFIGS.STANDARD
): TradeAnalyticsApiParams {
  if (roundTrips.length === 0) {
    return calculateBaselineApiParams(baseParams)
  }

  // Always pivot at the earliest open time across the selection
  const pivot = Math.min(...roundTrips.map((rt) => rt.openTime))

  // Compute how many bars we need after pivot to cover the farthest end (latest close/open)
  const msPerBar = getMsPerBar(baseParams.timeframe)
  const farthestEnd = Math.max(...roundTrips.map((rt) => rt.closeTime ?? rt.openTime))
  const backDurationMs = Math.max(0, farthestEnd - pivot)
  const backUnits = msPerBar > 0 ? Math.ceil(backDurationMs / msPerBar) : 0

  return {
    ...baseParams,
    pivot,
    pad_front: paddingConfig.frontPadUnits,
    pad_back: backUnits + paddingConfig.backPadUnits,
  }
}

/**
 * Creates a cache key for API parameters
 * Used by the caching system to identify unique requests
 */
export function createApiParamsCacheKey(params: TradeAnalyticsApiParams): string {
  const { strategyId, assetId, timeframe, from_ms, to_ms, pivot, pad_front, pad_back } = params
  return `${strategyId}_${assetId}_${timeframe}_${from_ms || "none"}_${to_ms || "none"}_${pivot || "none"}_${pad_front || "none"}_${pad_back || "none"}`
}

/**
 * Formats API parameters for the HTTP request
 */
export function formatApiParamsForRequest(params: TradeAnalyticsApiParams): Record<string, string> {
  const queryParams: Record<string, string> = {
    assetId: params.assetId,
    timeframe: params.timeframe,
  }

  if (params.from_ms !== undefined) queryParams.from_ms = params.from_ms.toString()
  if (params.to_ms !== undefined) queryParams.to_ms = params.to_ms.toString()
  if (params.pivot !== undefined) queryParams.pivot = params.pivot.toString()
  if (params.pad_front !== undefined) queryParams.pad_front = params.pad_front.toString()
  if (params.pad_back !== undefined) queryParams.pad_back = params.pad_back.toString()

  return queryParams
}

/**
 * Helper function to get padding description for debugging
 */
export function getPaddingDescription(config: PaddingConfig): string {
  return `Front: ${config.frontPadUnits} units, Back: ${config.backPadUnits} units, Baseline: ${config.baselineUnits} units`
}