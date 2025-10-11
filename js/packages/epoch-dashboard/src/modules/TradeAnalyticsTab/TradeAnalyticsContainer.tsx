import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { QueryClient, QueryClientProvider, InfiniteData } from '@tanstack/react-query'
import clsx from 'clsx'
import TradeAnalyticsChartRenderer from './components/TradeAnalyticsChartRenderer'
import DefaultTopToolbar from './components/DefaultTopToolbar'
import type { GetTradeAnalyticsMetadataResponseType, IRoundTrip } from '../../types/TradeAnalyticsTypes'
import { getMsPerBar } from './components/TradeAnalyticsChartRenderer/utils/BackendPaddingUtils'
import { globalDataCacheManager } from './components/TradeAnalyticsChartRenderer/utils/DataCacheManager'
import HighchartsReact from 'highcharts-react-official'

// Create a query client for React Query (exported for use in UnifiedDashboardContainer)
export const tradeAnalyticsQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
      retry: 1,
    },
  },
})

// Props interface for the container
export interface TradeAnalyticsContainerProps {
  campaignId: string
  userId?: string
  apiEndpoint: string
  // Optional UI customization
  showHeader?: boolean
  className?: string
  rightControls?: React.ReactNode
}

// Hook for fetching metadata (exported for use in UnifiedDashboardContainer)
export function useTradeMetadata(apiEndpoint: string, campaignId: string, userId: string) {
  const [data, setData] = useState<GetTradeAnalyticsMetadataResponseType | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      // Allow empty apiEndpoint (means use relative URLs for Next.js proxy)
      if (!campaignId) {
        setError('Missing Campaign ID')
        setIsLoading(false)
        return
      }

      try {
        setError(null)
        // Construct the full URL to the metadata endpoint
        const response = await fetch(`${apiEndpoint}/api/v1/dashboard/metadata/${campaignId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-USER-ID': userId,
          },
        })

        if (!response.ok) {
          let errorMessage = `Failed to fetch metadata: ${response.status}`
          try {
            const errorData = await response.json()
            errorMessage = errorData.details || errorData.error || errorMessage
          } catch (e) {
            errorMessage = `${errorMessage} ${response.statusText}`
          }
          throw new Error(errorMessage)
        }
        const metadata = await response.json()
        setData(metadata)
      } catch (error) {
        console.error('Failed to fetch metadata:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch metadata'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [apiEndpoint, campaignId, userId])

  return { data, isLoading, error }
}

// Hook for fetching round trips (exported for use in UnifiedDashboardContainer)
export function useGetTradeAnalyticsRoundTrips({
  campaignId,
  apiEndpoint,
  userId,
}: {
  campaignId: string
  apiEndpoint: string
  userId: string
}) {
  const [data, setData] = useState<any>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      // Allow empty apiEndpoint (means use relative URLs for Next.js proxy)
      if (!campaignId) {
        setError('Missing Campaign ID')
        setIsLoading(false)
        return
      }

      try {
        setError(null)
        const response = await fetch(`${apiEndpoint}/api/v1/dashboard/round-trips/${campaignId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-USER-ID': userId,
          },
        })

        if (!response.ok) {
          let errorMessage = `Failed to fetch round trips: ${response.status}`
          try {
            const errorData = await response.json()
            errorMessage = errorData.details || errorData.error || errorMessage
          } catch (e) {
            errorMessage = `${errorMessage} ${response.statusText}`
          }
          throw new Error(errorMessage)
        }
        const roundTripsResponse = await response.json()

        // Format to match expected InfiniteData structure
        // Extract items array from the response object
        setData({
          pages: [{ items: roundTripsResponse.items || [] }],
          pageParams: [undefined],
        })
      } catch (error) {
        console.error('Failed to fetch round trips:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch round trips'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [apiEndpoint, campaignId, userId])

  return {
    data,
    isLoading,
    error,
    fetchNextPage: () => {},
    hasNextPage: false,
    isFetchingNextPage: false,
  }
}

// Main container component (exported for use in UnifiedDashboardContainer)
export function TradeAnalyticsContent({
  campaignId,
  userId = 'guest',
  apiEndpoint,
  showHeader = true,
  className,
  rightControls,
}: TradeAnalyticsContainerProps) {
  // State for interface
  const [selectedAssetId, setSelectedAssetId] = useState('')
  const [selectedTimeframe, setSelectedTimeframe] = useState('5m')
  const [isEventsSidebarOpen, setIsEventsSidebarOpen] = useState(false)
  const [selectedTradeIds, setSelectedTradeIds] = useState<number[]>([])
  const [expandedCardIds, setExpandedCardIds] = useState<number[]>([])
  const [selectedRoundTripForChart, setSelectedRoundTripForChart] = useState<IRoundTrip | null>(null)
  const [loadedDataRange, setLoadedDataRange] = useState<{ min: number; max: number } | null>(null)
  const [isLazyLoading, setIsLazyLoading] = useState(false)
  const [expansionRequest, setExpansionRequest] = useState<{ from: number; to: number } | null>(null)

  // Refs for sidebar and chart
  const triggerRef = useRef<HTMLButtonElement>(null)
  const eventsSectionRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HighchartsReact.RefObject>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Chart focus handler - zooms to trade time range
  const focusOnTrade = (roundTrip: IRoundTrip) => {
    const chart = chartRef.current?.chart
    if (!chart) return

    const xAxis = chart.xAxis[0]
    if (!xAxis) return

    const msPerBar = getMsPerBar(selectedTimeframe)
    const paddingBars = 50
    const paddingMs = paddingBars * msPerBar

    const openTime = new Date(roundTrip.open_datetime).getTime()
    const closeTime = roundTrip.close_datetime
      ? new Date(roundTrip.close_datetime).getTime()
      : openTime

    let startTime = openTime - paddingMs
    let endTime = closeTime + paddingMs

    const dataMin = (xAxis as any).dataMin
    const dataMax = (xAxis as any).dataMax

    if (dataMin !== undefined && dataMax !== undefined) {
      if (openTime < dataMin || openTime > dataMax) return

      startTime = Math.max(startTime, dataMin)
      endTime = Math.min(endTime, dataMax)
    }

    if (startTime >= endTime) return

    xAxis.setExtremes(startTime, endTime, true, true)
  }

  // Toggle card expansion
  const toggleCardExpansion = (cardId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setExpandedCardIds(prev =>
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  // Handle range expansion for lazy loading
  const handleRangeExpansion = useCallback((range: { from: number; to: number }) => {
    setExpansionRequest(range)
    setIsLazyLoading(true)
  }, [])

  // Fetch metadata
  const {
    data: tradeAnalyticsMetadata,
    isLoading: isLoadingTradeAnalyticsMetadata,
    error: tradeAnalyticsMetadataError
  } = useTradeMetadata(apiEndpoint, campaignId, userId)

  // Fetch round trips data
  const {
    data: roundTripsData,
    isLoading: isLoadingRoundTripsData,
    error: roundTripsDataError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetTradeAnalyticsRoundTrips({
    campaignId,
    apiEndpoint,
    userId,
  })

  // Flatten round trips for selected asset
  const flattenedRoundTrips = useMemo(() => {
    if (!roundTripsData || !selectedAssetId) return []

    const allRoundTrips = (roundTripsData as unknown as InfiniteData<any>).pages.flatMap((page) => page.items)
    const roundTripsOfSelectedAsset = allRoundTrips.filter((val) => val.asset_id === selectedAssetId)

    return roundTripsOfSelectedAsset
  }, [roundTripsData, selectedAssetId])

  // Check if we should hide the sidebar - hide when no trades for selected asset
  const shouldHideSidebar = useMemo(() => {
    return flattenedRoundTrips.length === 0
  }, [flattenedRoundTrips])

  // Set the initial asset and timeframe selection
  useEffect(() => {
    if (tradeAnalyticsMetadata?.asset_info && !selectedAssetId) {
      const firstAssetId = Object.keys(tradeAnalyticsMetadata.asset_info)[0]
      setSelectedAssetId(firstAssetId)

      const assetInfo = tradeAnalyticsMetadata.asset_info[firstAssetId]
      if (assetInfo?.timeframes?.length > 0) {
        const firstTimeframe = assetInfo.timeframes[0].timeframe
        setSelectedTimeframe(firstTimeframe)
      }
    }
  }, [tradeAnalyticsMetadata, selectedAssetId])

  // When asset changes, update timeframe to first available for that asset
  const handleAssetChange = (assetId: string) => {
    setSelectedAssetId(assetId)

    if (tradeAnalyticsMetadata?.asset_info[assetId]) {
      const assetInfo = tradeAnalyticsMetadata.asset_info[assetId]
      if (assetInfo?.timeframes?.length > 0) {
        const newTimeframe = assetInfo.timeframes[0].timeframe
        setSelectedTimeframe(newTimeframe)
      }
    }
  }

  // Memoize selectedRoundTrips array to prevent re-renders
  const selectedRoundTripsArray = useMemo(() => {
    return selectedRoundTripForChart ? [selectedRoundTripForChart] : []
  }, [selectedRoundTripForChart])

  // Set absolute bounds from metadata when available
  useEffect(() => {
    if (!tradeAnalyticsMetadata || !selectedAssetId || !selectedTimeframe || !campaignId) {
      return
    }

    const assetInfo = tradeAnalyticsMetadata.asset_info[selectedAssetId]
    if (!assetInfo) return

    const tfInfo = assetInfo.timeframes.find(tf => tf.timeframe === selectedTimeframe)
    if (!tfInfo) return

    const dataFetchRequest = {
      strategyId: campaignId, // Internal cache uses strategyId key
      assetId: selectedAssetId,
      timeframe: selectedTimeframe,
    }

    globalDataCacheManager.setAbsoluteBounds(dataFetchRequest, {
      from: tfInfo.absolute_start_ms,
      to: tfInfo.absolute_end_ms,
    })
  }, [tradeAnalyticsMetadata, selectedAssetId, selectedTimeframe, campaignId])

  // Add resize observer to trigger chart reflow when container size changes
  useEffect(() => {
    if (!chartContainerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      // Trigger chart reflow when container is resized
      if (chartRef.current?.chart) {
        setTimeout(() => {
          chartRef.current?.chart.reflow()
        }, 100)
      }
    })

    resizeObserver.observe(chartContainerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Trigger reflow when sidebar opens/closes
  useEffect(() => {
    if (chartRef.current?.chart) {
      // Trigger multiple reflows to ensure proper resizing
      setTimeout(() => {
        chartRef.current?.chart.reflow()
      }, 50) // Quick initial reflow

      setTimeout(() => {
        chartRef.current?.chart.reflow()
      }, 350) // After transition completes (300ms + buffer)
    }
  }, [isEventsSidebarOpen])

  // Clear isLazyLoading when expansion request changes
  // We set isLazyLoading=true when requesting, and clear it after a short delay
  // to allow the next expansion request to be processed
  useEffect(() => {
    if (isLazyLoading) {
      // Clear the loading flag after a short delay to allow request to process
      const timeoutId = setTimeout(() => {
        setIsLazyLoading(false)
      }, 2000) // 2 second delay to ensure fetch has started

      return () => clearTimeout(timeoutId)
    }
  }, [isLazyLoading])

  // Clear expansion request after it's been processed
  useEffect(() => {
    if (expansionRequest) {
      // Clear the expansion request after a delay to prevent re-triggering
      const timeoutId = setTimeout(() => {
        setExpansionRequest(null)
      }, 3000) // 3 seconds

      return () => clearTimeout(timeoutId)
    }
  }, [expansionRequest])

  // Show error state if no campaign ID is provided
  if (!campaignId) {
    return (
      <div className={clsx("relative h-full bg-background", className)}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-card border border-warning/50 rounded-lg p-8 max-w-md">
            <h2 className="text-xl font-bold text-warning mb-4">Missing Configuration</h2>
            <p className="text-muted-foreground mb-6">
              No Campaign ID provided. Please provide a valid campaign ID.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (tradeAnalyticsMetadataError) {
    return (
      <div className={clsx("relative h-full bg-background", className)}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-card border border-destructive/50 rounded-lg p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-destructive mb-4">Error Loading Data</h2>
            <p className="text-muted-foreground mb-4">
              {tradeAnalyticsMetadataError || "Unable to load the campaign! please try again later."}
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Campaign ID: <span className="font-mono text-accent">{campaignId}</span></p>
              <p>User: <span className="font-mono text-accent ml-2">{userId}</span></p>
              <p>API: <span className="font-mono text-accent ml-2">{apiEndpoint}</span></p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx("h-full bg-background flex flex-col overflow-hidden", className)}>
      {showHeader && (
        <div className="bg-card border-b border-border px-6 py-2 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Trade Analytics Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Campaign ID: <span className="text-accent font-mono">{campaignId}</span> |
              User: <span className="text-accent font-mono ml-2">{userId}</span> |
              API: <span className="text-accent font-mono ml-2">{apiEndpoint}</span>
            </p>
          </div>
        </div>
      )}

      {/* Top Toolbar - Asset & Timeframe Selectors */}
      <DefaultTopToolbar
        metadata={tradeAnalyticsMetadata}
        selectedAssetId={selectedAssetId}
        selectedTimeframe={selectedTimeframe}
        onAssetChange={handleAssetChange}
        onTimeframeChange={setSelectedTimeframe}
        rightControls={rightControls}
      />

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 w-full flex-row overflow-hidden bg-background">
        {/* Sidebar - Always visible, changes width when collapsed */}
        {!shouldHideSidebar && (
          <div
            ref={eventsSectionRef}
            className={clsx(
              "h-full flex-shrink-0 transition-[width] duration-200 ease-in-out will-change-[width]",
              isEventsSidebarOpen ? "w-[349px]" : "w-14"
            )}
          >
            <div className="h-full w-full bg-card border-r-2 border-border shadow-xl flex flex-col">
            {/* Collapsed Toolbar View */}
            {!isEventsSidebarOpen ? (
              <div className="flex flex-col items-center py-4 gap-4">
                <button
                  onClick={() => setIsEventsSidebarOpen(true)}
                  className="relative p-2.5 rounded-lg hover:bg-muted/30 transition-all group"
                  title={`${flattenedRoundTrips.length} trades`}
                >
                  <svg
                    className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {/* Trade count badge */}
                  {flattenedRoundTrips.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-accent text-accent-foreground text-[10px] font-bold rounded-full px-1">
                      {flattenedRoundTrips.length}
                    </span>
                  )}
                </button>
              </div>
            ) : (
              <>
                {/* Expanded Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-accent/80 rounded-full" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Trades</h3>
                      <p className="text-xs text-muted-foreground">
                        {flattenedRoundTrips.length} {flattenedRoundTrips.length === 1 ? 'trade' : 'trades'}
                      </p>
                    </div>
                  </div>
                  <button
                    ref={triggerRef}
                    onClick={() => setIsEventsSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted/30 transition-all group"
                    title="Collapse sidebar"
                  >
                    <svg
                      className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
              </>
            )}

            {/* Content Section - Shows for both collapsed and expanded states */}
            {isEventsSidebarOpen && (isLoadingTradeAnalyticsMetadata || isLoadingRoundTripsData ? (
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-accent" />
                  <p className="text-xs text-muted-foreground">Loading trades...</p>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col flex-1 overflow-hidden">
                <div
                  className="hide-scrollbar relative w-full flex-1 overflow-y-auto overflow-x-hidden px-5 py-4"
                  ref={parentRef}
                  style={{
                    transform: "none",
                    WebkitTransform: "none",
                    willChange: "scroll-position",
                  }}>
                  <div
                    className="relative flex w-full flex-col gap-3"
                    style={{
                      transform: "none",
                      WebkitTransform: "none",
                    }}>
                    {flattenedRoundTrips.length ? (
                      flattenedRoundTrips.map((roundTrip) => {
                        const formattedDate = new Date(roundTrip.open_datetime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                          timeZone: 'UTC'
                        })

                        const formattedReturn = roundTrip.net_return >= 0
                          ? `$${roundTrip.net_return.toLocaleString()}`
                          : `-$${Math.abs(roundTrip.net_return).toLocaleString()}`

                        const isExpanded = expandedCardIds.includes(roundTrip.index)
                        const isSelected = selectedTradeIds.includes(roundTrip.index)

                        return (
                          <button
                            key={roundTrip.index}
                            className={clsx(
                              "relative flex flex-col gap-4 overflow-hidden rounded-lg transition-all duration-200 ease-out w-full px-4 py-3 text-left group border",
                              isSelected
                                ? "bg-accent/20 border-accent shadow-lg ring-1 ring-accent"
                                : "bg-background border-border hover:bg-muted hover:border-accent/50 hover:shadow-lg"
                            )}
                            onClick={() => {
                              setSelectedTradeIds([roundTrip.index])
                              setSelectedRoundTripForChart(roundTrip)
                              setTimeout(() => focusOnTrade(roundTrip), 500)
                            }}>
                            {/* Card Header */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="text-base font-semibold text-foreground">{roundTrip.asset}</h4>
                                  {roundTrip.status === 'WIN' ? (
                                    <span className="px-2 py-0.5 rounded-md bg-territory-success/20 text-territory-success text-xs font-medium">WIN</span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-md bg-territory-alert/20 text-territory-alert text-xs font-medium">LOSS</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={clsx(
                                    "px-2 py-0.5 rounded-md text-xs font-medium",
                                    roundTrip.side === 'Long' ? "bg-territory-success/10 text-territory-success" : "bg-territory-warning/10 text-territory-warning"
                                  )}>
                                    {roundTrip.side?.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">{formattedDate}</span>
                                </div>
                              </div>
                              <div
                                onClick={(e) => toggleCardExpansion(roundTrip.index, e)}
                                className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors shrink-0 cursor-pointer"
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    toggleCardExpansion(roundTrip.index, e as any)
                                  }
                                }}
                              >
                                <svg
                                  className={clsx(
                                    "w-4 h-4 text-muted-foreground transition-transform duration-300",
                                    isExpanded && "rotate-180"
                                  )}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>

                            {/* Return Info */}
                            <div className="flex items-baseline gap-2">
                              <span className={clsx(
                                "text-2xl font-bold",
                                roundTrip.net_return >= 0 ? "text-territory-success" : "text-territory-alert"
                              )}>
                                {formattedReturn}
                              </span>
                              <span className={clsx(
                                "text-sm font-medium",
                                roundTrip.net_return >= 0 ? "text-territory-success/80" : "text-territory-alert/80"
                              )}>
                                ({roundTrip.return_percent.toFixed(2)}%)
                              </span>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="overflow-hidden">
                                <div className="pt-3 border-t border-border/50">
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                    {roundTrip.close_datetime && (
                                      <div>
                                        <p className="text-xs text-muted-foreground mb-1">Close Date</p>
                                        <p className="text-sm text-foreground">
                                          {new Date(roundTrip.close_datetime).toLocaleString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true,
                                            timeZone: 'UTC'
                                          })}
                                        </p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Size</p>
                                      <p className="text-sm text-foreground font-medium">{roundTrip.size.toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Avg Entry</p>
                                      <p className="text-sm text-foreground font-medium">${roundTrip.avg_entry_price.toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Avg Exit</p>
                                      <p className="text-sm text-foreground font-medium">${roundTrip.avg_exit_price.toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground mb-1">Duration</p>
                                      <p className="text-sm text-foreground font-medium">{roundTrip.duration} days</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </button>
                        )
                      })
                    ) : (
                      <div className="flex h-full items-center justify-center py-12">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <p className="text-sm text-muted-foreground">No trades found</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        )}

        {/* Chart Area - Flexible Width */}
        <div
          ref={chartContainerRef}
          className="flex-1 h-full overflow-hidden transition-all duration-300 ease-out"
        >
          <div className="h-full w-full text-foreground p-2">
            <TradeAnalyticsChartRenderer
              isLoading={isLoadingTradeAnalyticsMetadata || isLazyLoading}
              tradeAnalyticsMetadata={tradeAnalyticsMetadata}
              selectedRoundTrips={selectedRoundTripsArray}
              campaignId={campaignId}
              assetId={selectedAssetId}
              fetchEntireCandleStickData={!selectedRoundTripForChart && !expansionRequest}
              paddingProfile="STANDARD"
              timeframe={selectedTimeframe}
              chartRef={chartRef}
              onRangeExpansionNeeded={handleRangeExpansion}
              expansionRange={expansionRequest}
              isLazyLoading={isLazyLoading}
              apiEndpoint={apiEndpoint}
              userId={userId}
            />
          </div>
        </div>

      </div>
    </div>
  )
}

// Wrapper component that provides QueryClient
export function TradeAnalyticsContainer(props: TradeAnalyticsContainerProps) {
  return (
    <QueryClientProvider client={tradeAnalyticsQueryClient}>
      <TradeAnalyticsContent {...props} />
    </QueryClientProvider>
  )
}

export default TradeAnalyticsContainer