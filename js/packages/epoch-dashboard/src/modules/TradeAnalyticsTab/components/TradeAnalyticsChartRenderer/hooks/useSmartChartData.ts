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
      setShouldFetchBaseline(true)
      setLastAssetTimeframe(currentKey)
      // Clear the global cache to ensure fresh data
      globalDataCacheManager.clearCache()
    }
  }, [assetId, timeframe, lastAssetTimeframe])

  // Calculate API parameters based on selected round trips
  const dataFetchRequest = useMemo((): DataFetchRequest | null => {
    if (!enabled || !strategyId || !assetId || !timeframe) return null

    const baseParams = { strategyId, assetId, timeframe }

    // Priority 1: Handle range expansion for lazy loading
    if (expansionRange) {
      return {
        ...baseParams,
        from_ms: expansionRange.from,
        to_ms: expansionRange.to
      }
    }

    // Priority 2: If fetchEntireCandleStickData is true, always fetch baseline
    if (fetchEntireCandleStickData) {
      return calculateBaselineApiParams(baseParams)
    }

    // Priority 3: If no round trips selected, ALWAYS return baseline params to keep query alive
    // The cache manager will prevent unnecessary fetches by returning cached data
    if (selectedRoundTrips.length === 0) {
      // Always return baseline params - this keeps the query enabled
      // If we have cached data, queryFn will return it immediately
      // If not, it will fetch fresh data
      return calculateBaselineApiParams(baseParams)
    }

    // Priority 4: Convert round trips to the format expected by the utility function
    const roundTripTimes = selectedRoundTrips.map((rt) => ({
      openTime: new Date(rt.open_datetime).getTime(),
      closeTime: rt.close_datetime ? new Date(rt.close_datetime).getTime() : Date.now(),
    }))

    // Use multi-round trip calculation for optimal backend padding
    const apiParams = calculateMultiRoundTripApiParams(baseParams, roundTripTimes, paddingConfig)

    // Always return the apiParams to trigger fetch
    // (React Query will handle caching)
    return apiParams
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
  // Use ONLY strategyId, assetId, timeframe - no request hash
  // This prevents React Query from entering fetching state on every zoom
  // Cache manager handles all range checking and merging internally
  const queryKey = useMemo(() => {
    if (!enabled || !strategyId || !assetId || !timeframe) return ["no-fetch"] as const

    return [
      "TRADE_ANALYTICS_CHART_DATA",
      strategyId,
      assetId,
      timeframe,
    ] as const
  }, [enabled, strategyId, assetId, timeframe])

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

      // ALWAYS check cache first - prevents unnecessary fetches
      const cachedData = globalDataCacheManager.getCachedData({ strategyId, assetId, timeframe })

      // Check if we need to fetch based on range expansion logic
      // This is only relevant when expansionRange is set
      if (expansionRange) {
        const missingRanges = globalDataCacheManager.needsRangeExpansion(
          { strategyId, assetId, timeframe },
          { from: expansionRange.from, to: expansionRange.to }
        )

        if (missingRanges.length === 0 && cachedData) {
          return cachedData
        } else {
          setIsActuallyFetching(true) // Set flag for actual network fetch
        }
        // For now, fetch the entire requested range if there are missing ranges
        // TODO: Implement fetching only missing ranges (requires multiple requests or backend support)
      } else if (cachedData) {
        // If we have cached data and no expansion request, return cached data immediately
        return cachedData
      } else {
        // Initial fetch - no cached data yet
        setIsActuallyFetching(true)
      }

      // Format API parameters for the HTTP request
      const queryParams = formatApiParamsForRequest(dataFetchRequest)
      const queryString = new URLSearchParams(queryParams).toString()

      // Use provided apiEndpoint and userId, or fall back to defaults
      const finalApiEndpoint = apiEndpoint || 'http://localhost:9000'
      const finalUserId = userId || 'guest'

      // Check if we're in a Next.js environment (has /api routes)
      const isNextJsEnv = typeof window !== 'undefined' && window.location.pathname.includes('/api')

      let response
      if (isNextJsEnv || !apiEndpoint) {
        // Use local proxy endpoint (Next.js API route)
        response = await axios.get(
          `/api/backend-server/dashboard/trade-analytics-chart-data/${dataFetchRequest.strategyId}?${queryString}`,
          {
            headers: {
              'X-API-URL': finalApiEndpoint,
              'X-User-Id': finalUserId,
            },
            responseType: 'arraybuffer',
            validateStatus: () => true // Don't throw on non-2xx status
          }
        )
      } else {
        // Direct API call (for standalone usage)
        response = await axios.get(
          `${finalApiEndpoint}/api/v1/dashboard/analytics/${dataFetchRequest.strategyId}?${queryString}`,
          {
            headers: {
              'X-User-Id': finalUserId,
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
            console.error('📊 Chart data API error:', {
              status: response.status,
              error: errorMessage,
              details: errorDetails,
              url: errorData.url
            })
          } else if (text.startsWith('<!DOCTYPE')) {
            errorMessage = 'Server returned HTML error page'
            errorDetails = text.substring(0, 500) // First 500 chars of HTML
            console.error('📊 Chart data HTML error:', errorMessage)
          }
        } catch (e) {
          console.error('📊 Error parsing response:', e)
        }

        // Clear fetching flag before throwing error
        setIsActuallyFetching(false)

        // Include both error and details in the thrown error
        const fullError = errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage
        throw new Error(fullError)
      }

      // Parse Arrow data with error handling
      let table
      try {
        table = tableFromIPC(new Uint8Array(response.data))
      } catch (parseError) {
        console.error('📊 Failed to parse Arrow data:', parseError)
        // Clear fetching flag before throwing error
        setIsActuallyFetching(false)
        throw new Error(`Failed to parse chart data: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
      }

      // Cache the fetched data
      globalDataCacheManager.cacheData(dataFetchRequest, table)

      // Clear the actually fetching flag now that fetch is complete
      setIsActuallyFetching(false)

      return table
    },
    enabled: Boolean(dataFetchRequest && enabled),
    staleTime: Infinity, // Never mark as stale - we manage freshness via cache
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

  // Get the appropriate data (from cache or fresh fetch)
  // CRITICAL: Always return cached data to prevent "No data found" flashing
  const finalData = useMemo((): Table<Record<string | number | symbol, DataType>> | undefined => {
    // ALWAYS check cache first - this is our source of truth
    if (strategyId && assetId && timeframe) {
      const cachedData = globalDataCacheManager.getCachedData({
        strategyId,
        assetId,
        timeframe
      })

      if (cachedData) {
        return cachedData
      }
    }

    // Only use fetchedData if cache is completely empty (initial load only)
    if (fetchedData) {
      return fetchedData
    }

    return undefined
  }, [fetchedData, strategyId, assetId, timeframe, isFetching])

  return {
    data: finalData,
    isLoading,
    isFetching,
    isActuallyFetching, // True only when making real network request
    error,
  }
}

export default useSmartChartData