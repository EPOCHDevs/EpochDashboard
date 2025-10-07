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
    baselineUnits: 500, // Reduced from 1500 for faster initial render
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

/**
 * Approximate milliseconds per bar from timeframe strings like "5m", "1h", "1D", "1W"
 * Supports: 5m, 5min, 1H, 1hour, 1D, 1day, 1W, 1M, 3M, 1Q, 1Y, etc.
 * @param timeframe - Timeframe string (e.g., "5m", "1H", "1D")
 * @returns Milliseconds per bar
 */
export function getMsPerBar(timeframe: string): number {
  const tf = (timeframe || "").trim()

  // Extract number and unit: "5m" -> num=5, unit="m"
  const match = tf.match(/^(\d+)?\s*([a-zA-Z]+)$/)
  if (!match) return 60_000 // default 1 minute

  const num = parseInt(match[1] || "1", 10)
  const unit = match[2]
  const unitUpper = unit.toUpperCase()

  // Determine multiplier by first character(s)
  let msPerUnit: number

  if (unit === 'm' || unitUpper.startsWith('MIN')) {
    // lowercase 'm' or starts with MIN -> minutes
    msPerUnit = 60_000
  } else if (unitUpper.startsWith('H')) {
    msPerUnit = 3_600_000
  } else if (unitUpper.startsWith('D')) {
    msPerUnit = 86_400_000
  } else if (unitUpper.startsWith('W')) {
    msPerUnit = 7 * 86_400_000
  } else if (unitUpper.startsWith('MO') || unit === 'M') {
    // Starts with MO or uppercase 'M' alone -> months
    msPerUnit = 30 * 86_400_000
  } else if (unitUpper.startsWith('Q')) {
    msPerUnit = 91 * 86_400_000
  } else if (unitUpper.startsWith('Y')) {
    msPerUnit = 365 * 86_400_000
  } else {
    msPerUnit = 60_000 // fallback to minutes
  }

  return num * msPerUnit
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
    asset: params.assetId,  // Backend expects 'asset', not 'assetId'
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