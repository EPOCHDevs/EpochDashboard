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
}

interface SmartChartDataResult {
  data: Table<Record<string | number | symbol, DataType>> | undefined
  isLoading: boolean
  isFetching: boolean
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
}: UseSmartChartDataProps): SmartChartDataResult => {
  const [shouldFetchBaseline, setShouldFetchBaseline] = useState(true)

  // Calculate API parameters based on selected round trips
  const dataFetchRequest = useMemo((): DataFetchRequest | null => {
    if (!enabled || !strategyId || !assetId || !timeframe) return null

    const baseParams = { strategyId, assetId, timeframe }

    // If no round trips selected OR fetchEntireCandleStickData flag is set, fetch baseline data
    if (selectedRoundTrips.length === 0 || fetchEntireCandleStickData) {
      if (shouldFetchBaseline) {
        return calculateBaselineApiParams(baseParams)
      }
      return null
    }

    // Convert round trips to the format expected by the utility function
    const roundTripTimes = selectedRoundTrips.map((rt) => ({
      openTime: new Date(rt.open_datetime).getTime(),
      closeTime: rt.close_datetime ? new Date(rt.close_datetime).getTime() : Date.now(),
    }))

    // Use multi-round trip calculation for optimal backend padding
    const apiParams = calculateMultiRoundTripApiParams(baseParams, roundTripTimes, paddingConfig)

    // Check if we need to fetch this data (not in cache)
    const needsFetch = globalDataCacheManager.needsFetch(apiParams)

    return needsFetch ? apiParams : null
  }, [
    strategyId,
    assetId,
    timeframe,
    selectedRoundTrips,
    enabled,
    shouldFetchBaseline,
    paddingConfig,
    fetchEntireCandleStickData,
  ])

  // Generate query key for React Query
  const queryKey = useMemo(() => {
    if (!dataFetchRequest) return ["no-fetch"] as const
    return [
      "TRADE_ANALYTICS_CHART_DATA",
      dataFetchRequest.strategyId,
      dataFetchRequest.assetId,
      dataFetchRequest.timeframe,
      dataFetchRequest.pivot,
      dataFetchRequest.pad_front,
      dataFetchRequest.pad_back,
      "backend-padding",
    ] as const
  }, [dataFetchRequest])

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

      // Format API parameters for the HTTP request
      const queryParams = formatApiParamsForRequest(dataFetchRequest)
      const queryString = new URLSearchParams(queryParams).toString()

      // Use environment variable for API URL, fallback to localhost mock server
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ||
                        process.env.REACT_APP_API_BASE_URL ||
                        'http://localhost:3002/api'
      const { data } = await axios.get(
        `${apiBaseUrl}/backend-server/dashboard/trade-analytics-chart-data/${dataFetchRequest.strategyId}?${queryString}`
      )

      const table = tableFromIPC(new Uint8Array(data.data))

      // Cache the fetched data
      globalDataCacheManager.cacheData(dataFetchRequest, table)

      return table
    },
    enabled: Boolean(dataFetchRequest && enabled && queryKey[0] !== "no-fetch"),
    staleTime: Infinity,
    retry: 2,
  })

  // Effect to handle baseline data fetching completion
  useEffect(() => {
    if (fetchedData && shouldFetchBaseline && selectedRoundTrips.length === 0) {
      setShouldFetchBaseline(false)
    }
  }, [fetchedData, shouldFetchBaseline, selectedRoundTrips.length])

  // Get the appropriate data (from cache or fresh fetch)
  const finalData = useMemo((): Table<Record<string | number | symbol, DataType>> | undefined => {
    // If we just fetched new data, return it
    if (fetchedData) {
      return fetchedData
    }

    // Try to get from cache if we're not currently fetching
    if (enabled && strategyId && assetId && timeframe && !dataFetchRequest) {
      const baseParams = { strategyId, assetId, timeframe }

      let cacheRequest: DataFetchRequest

      if (selectedRoundTrips.length === 0 || fetchEntireCandleStickData) {
        // Try to get baseline data from cache
        cacheRequest = calculateBaselineApiParams(baseParams)
      } else {
        // Try to get round trip data from cache
        const roundTripTimes = selectedRoundTrips.map((rt) => ({
          openTime: new Date(rt.open_datetime).getTime(),
          closeTime: rt.close_datetime ? new Date(rt.close_datetime).getTime() : Date.now(),
        }))
        cacheRequest = calculateMultiRoundTripApiParams(baseParams, roundTripTimes, paddingConfig)
      }

      const cachedData = globalDataCacheManager.getCachedData(cacheRequest)
      if (cachedData) {
        return cachedData
      }
    }

    return undefined
  }, [
    fetchedData,
    enabled,
    strategyId,
    assetId,
    timeframe,
    dataFetchRequest,
    selectedRoundTrips,
    paddingConfig,
    fetchEntireCandleStickData,
  ])

  return {
    data: finalData,
    isLoading,
    isFetching,
    error,
  }
}

export default useSmartChartData