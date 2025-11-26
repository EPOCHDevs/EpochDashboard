import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Table, DataType } from "apache-arrow"
import axios from "axios"
import { tableFromIPC } from "apache-arrow"
import { globalDataCacheManager, DataFetchRequest } from "../utils/DataCacheManager"
import {
  calculateBaselineApiParams,
  calculateMultiRoundTripApiParams,
  formatApiParamsForRequest,
  DEFAULT_PADDING_CONFIGS,
  getMsPerBar,
  type PaddingConfig,
} from "../utils/BackendPaddingUtils"
import { IRoundTrip } from "../../../../../types/TradeAnalyticsTypes"

interface UseSmartChartDataProps {
  strategyId: string
  assetId: string
  timeframe: string
  selectedRoundTrips: IRoundTrip[]
  enabled?: boolean
  paddingConfig?: PaddingConfig // Padding configuration (defaults to STANDARD)
  fetchEntireCandleStickData?: boolean // Use previous behavior: fetch entire dataset
  expansionRange?: { from: number; to: number } | null // Range expansion for lazy loading
  apiEndpoint?: string // API endpoint for fetching data
  userId?: string // User ID for authentication
}

interface SmartChartDataResult {
  data: Table<Record<string | number | symbol, DataType>> | undefined
  isLoading: boolean
  isFetching: boolean
  isActuallyFetching: boolean // True only when making a real network request
  error: unknown
}

/**
 * Smart chart data hook that implements intelligent caching and lazy loading
 */
export const useSmartChartData = ({
  strategyId,
  assetId,
  timeframe,
  selectedRoundTrips,
  enabled = true,
  paddingConfig = DEFAULT_PADDING_CONFIGS.STANDARD,
  fetchEntireCandleStickData = false,
  expansionRange,
  apiEndpoint,
  userId,
}: UseSmartChartDataProps): SmartChartDataResult => {
  const [shouldFetchBaseline, setShouldFetchBaseline] = useState(true)
  const [lastAssetTimeframe, setLastAssetTimeframe] = useState<string>('')
  const [isActuallyFetching, setIsActuallyFetching] = useState(false)

  // Reset shouldFetchBaseline when asset or timeframe changes
  useEffect(() => {
    const currentKey = `${assetId}-${timeframe}`
    if (currentKey !== lastAssetTimeframe && assetId && timeframe) {
      const [oldAsset, oldTimeframe] = lastAssetTimeframe.split('-')
      const assetChanged = oldAsset !== assetId

      setShouldFetchBaseline(true)
      setLastAssetTimeframe(currentKey)

      if (assetChanged && strategyId && oldAsset) {
        globalDataCacheManager.clearAssetCache(strategyId, oldAsset)
      }
    }
  }, [assetId, timeframe, lastAssetTimeframe, strategyId])

  // Calculate API parameters based on selected round trips
  const dataFetchRequest = useMemo((): DataFetchRequest | null => {
    if (!enabled || !strategyId || !assetId || !timeframe) return null

    const baseParams = { strategyId, assetId, timeframe }

    // Priority 1: Handle range expansion for lazy loading (user zoomed/panned)
    if (expansionRange) {
      return {
        ...baseParams,
        from_ms: expansionRange.from,
        to_ms: expansionRange.to
      }
    }

    // Priority 2: If round trips are selected, fetch focused range around trade(s)
    if (selectedRoundTrips.length > 0) {
      // Simple approach: fetch from open_datetime with padding
      const msPerBar = getMsPerBar(timeframe)
      const openTime = new Date(selectedRoundTrips[0].open_datetime).getTime()

      // Calculate padding in milliseconds
      const padBars = paddingConfig.frontPadUnits + paddingConfig.backPadUnits
      const padMs = padBars * msPerBar

      const from_ms = openTime - (paddingConfig.frontPadUnits * msPerBar)
      const to_ms = openTime + (paddingConfig.backPadUnits * msPerBar)

      return {
        ...baseParams,
        from_ms,
        to_ms
      }
    }

    // Priority 3: Check if we already have full data loaded in cache
    const isFullyLoaded = globalDataCacheManager.isFullDataLoaded(baseParams)
    if (isFullyLoaded) {
      return baseParams
    }

    // Priority 4: If fetchEntireCandleStickData is true, always fetch baseline
    if (fetchEntireCandleStickData) {
      return calculateBaselineApiParams(baseParams)
    }

    // Priority 5: If no cache exists and no trade selected, fetch ALL data (no time params)
    const hasCachedData = globalDataCacheManager.getCachedData(baseParams) !== null
    if (!hasCachedData) {
      return baseParams
    }

    // Priority 6: Default to baseline if we have cache but no specific request
    return calculateBaselineApiParams(baseParams)
  }, [
    strategyId,
    assetId,
    timeframe,
    selectedRoundTrips,
    enabled,
    shouldFetchBaseline,
    paddingConfig,
    fetchEntireCandleStickData,
    expansionRange,
  ])

  // Generate query key for React Query
  // Include the fetch request parameters so React Query knows when to refetch
  const queryKey = useMemo(() => {
    if (!enabled || !strategyId || !assetId || !timeframe || !dataFetchRequest) return ["no-fetch"] as const

    // Include time range in key to trigger refetch when trade selection changes
    const timeRangeKey = dataFetchRequest.from_ms && dataFetchRequest.to_ms
      ? `${dataFetchRequest.from_ms}-${dataFetchRequest.to_ms}`
      : 'all'

    return [
      "TRADE_ANALYTICS_CHART_DATA",
      strategyId,
      assetId,
      timeframe,
      timeRangeKey,
    ] as const
  }, [enabled, strategyId, assetId, timeframe, dataFetchRequest])

  // React Query for actual data fetching
  const {
    data: fetchedData,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<Table<Record<string | number | symbol, DataType>>> => {
      if (!dataFetchRequest) throw new Error("No fetch request")

      setIsActuallyFetching(true)

      const queryParams = formatApiParamsForRequest(dataFetchRequest)
      const queryString = new URLSearchParams(queryParams).toString()

      // Use provided apiEndpoint and userId, or fall back to defaults
      const finalUserId = userId || 'guest'

      // Check if we're in a Next.js environment (has /api routes)
      const isNextJsEnv = typeof window !== 'undefined' && window.location.pathname.includes('/api')

      let response
      if (isNextJsEnv || !apiEndpoint) {
        // Use local proxy endpoint (Next.js API route)
        // Don't send X-API-URL header - let the proxy use its own BACKEND_SERVER_URL
        response = await axios.get(
          `/api/backend-server/dashboard/trade-analytics-chart-data/${dataFetchRequest.strategyId}?${queryString}`,
          {
            headers: {
              'X-User-Id': finalUserId,
            },
            responseType: 'arraybuffer',
            validateStatus: () => true // Don't throw on non-2xx status
          }
        )
      } else {
        // Direct API call (for standalone usage)
        response = await axios.get(
          `${apiEndpoint}/api/v1/dashboard/analytics/${dataFetchRequest.strategyId}?${queryString}`,
          {
            headers: {
              'X-User-Id': userId || 'guest',
            },
            responseType: 'arraybuffer',
            validateStatus: () => true // Don't throw on non-2xx status
          }
        )
      }

      // Check if response is an error (HTML/JSON) instead of binary data
      if (response.status !== 200) {
        let errorMessage = `HTTP ${response.status}`
        let errorDetails = ''

        try {
          // Try to parse as JSON first (our proxy returns JSON errors)
          const text = new TextDecoder().decode(response.data)
          if (text.startsWith('{')) {
            const errorData = JSON.parse(text)
            errorMessage = errorData.error || `HTTP ${response.status}`
            errorDetails = errorData.details || ''
          } else if (text.startsWith('<!DOCTYPE')) {
            errorMessage = 'Server returned HTML error page'
            errorDetails = text.substring(0, 500)
          }
        } catch (e) {
          // Silently handle parsing error
        }

        // Clear fetching flag before throwing error
        setIsActuallyFetching(false)

        // Include both error and details in the thrown error
        const fullError = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage
        throw new Error(fullError)
      }

      let table
      try {
        table = tableFromIPC(new Uint8Array(response.data))
      } catch (parseError) {
        setIsActuallyFetching(false)
        throw new Error(`Failed to parse chart data: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
      }

      setIsActuallyFetching(false)

      return table
    },
    enabled: Boolean(dataFetchRequest && enabled),
    staleTime: 5 * 60 * 1000, // 5 minutes - rely on Next.js caching
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time
    refetchOnWindowFocus: false,
    retry: 2,
  })

  // Effect to handle baseline data fetching completion
  useEffect(() => {
    if (fetchedData && shouldFetchBaseline && selectedRoundTrips.length === 0) {
      setShouldFetchBaseline(false)
    }
  }, [fetchedData, shouldFetchBaseline, selectedRoundTrips.length])

  // Effect to clear isActuallyFetching when there's an error
  useEffect(() => {
    if (error) {
      setIsActuallyFetching(false)
    }
  }, [error])

  return {
    data: fetchedData, // Use React Query data directly - rely on Next.js for caching
    isLoading,
    isFetching,
    isActuallyFetching, // True only when making real network request
    error,
  }
}

export default useSmartChartData