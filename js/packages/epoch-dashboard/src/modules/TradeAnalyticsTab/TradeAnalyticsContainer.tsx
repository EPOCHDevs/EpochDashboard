import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { QueryClient, QueryClientProvider, InfiniteData } from '@tanstack/react-query'
import clsx from 'clsx'
import TradeAnalyticsChartRenderer from './components/TradeAnalyticsChartRenderer'
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
  TopToolbarComponent?: React.ComponentType<{
    metadata?: GetTradeAnalyticsMetadataResponseType
    selectedAssetId: string
    selectedTimeframe: string
    onAssetChange: (assetId: string) => void
    onTimeframeChange: (timeframe: string) => void
    rightControls?: React.ReactNode
  }>
  showHeader?: boolean
  className?: string
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
  TopToolbarComponent,
  showHeader = true,
  className,
}: TradeAnalyticsContainerProps) {
  // State for interface
  const [selectedAssetId, setSelectedAssetId] = useState('')
  const [selectedTimeframe, setSelectedTimeframe] = useState('5m')
  const [isEventsSidebarOpen, setIsEventsSidebarOpen] = useState(true)
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

    setTimeout(() => {
      setExpansionRequest(null)
      setIsLazyLoading(false)
    }, 1000)
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
    <div className={clsx("h-full bg-background flex flex-col", className)}>
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
      {TopToolbarComponent && (
        <TopToolbarComponent
          metadata={tradeAnalyticsMetadata}
          selectedAssetId={selectedAssetId}
          selectedTimeframe={selectedTimeframe}
          onAssetChange={handleAssetChange}
          onTimeframeChange={setSelectedTimeframe}
        />
      )}

      {/* Main Content Area with Sidebar */}
      <div className="relative flex flex-1 w-full flex-row overflow-hidden bg-background">
        {/* Chart Area - Full Width */}
        <div
          ref={chartContainerRef}
          className={clsx(
            "h-full w-full transition-all duration-300 ease-out",
            !shouldHideSidebar && isEventsSidebarOpen ? "pl-[349px]" : "pl-0"
          )}
        >
          <div className="h-full w-full text-foreground">
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

        {/* Sidebar Overlay */}
        {!shouldHideSidebar && (
          <div
            ref={eventsSectionRef}
            className={clsx(
              "absolute left-0 top-0 z-50 h-full w-[349px] transition-all duration-300 ease-out",
              isEventsSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
            <div className="h-full w-[349px] bg-gradient-to-br from-card via-card/98 to-card/95 backdrop-blur-xl border-r-2 border-accent/20 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col">
            {/* Sidebar Header */}
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
                onClick={() => setIsEventsSidebarOpen((prev) => !prev)}
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

            {isLoadingTradeAnalyticsMetadata || isLoadingRoundTripsData ? (
              <div className="hide-scrollbar flex h-full w-full flex-col items-center justify-start gap-4 overflow-y-auto overflow-x-hidden px-5 py-4">
                <div className="h-32 w-full animate-pulse rounded-2xl bg-muted/50" />
                <div className="h-32 w-full animate-pulse rounded-2xl bg-muted/50" />
                <div className="h-32 w-full animate-pulse rounded-2xl bg-muted/50" />
              </div>
            ) : (
              <div className="flex h-full flex-col flex-1 overflow-hidden">
                <div
                  className="sidebar-scrollbar relative w-full flex-1 overflow-y-auto overflow-x-hidden px-5 py-4"
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
                              "relative flex flex-col gap-4 overflow-hidden rounded-2xl transition-all duration-200 ease-out w-full px-5 py-4 text-left group border",
                              isSelected
                                ? "bg-accent/20 border-accent/50 shadow-lg shadow-accent/10 ring-2 ring-accent/40 scale-[1.02]"
                                : "bg-background/60 border-border/30 hover:bg-accent/15 hover:border-accent/30 hover:shadow-xl shadow-md hover:-translate-y-1 hover:scale-[1.01]"
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
                            <div className={clsx(
                              "grid gap-3 overflow-hidden transition-all duration-300",
                              isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            )}>
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
                            </div>
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
            )}
          </div>
          </div>
        )}

        {/* Floating Toggle Button (when sidebar is closed) */}
        {!shouldHideSidebar && !isEventsSidebarOpen && (
          <button
            onClick={() => setIsEventsSidebarOpen(true)}
            className="fixed left-5 top-1/2 -translate-y-1/2 z-40 p-3 bg-card/95 backdrop-blur-md border border-border/50 rounded-r-xl shadow-xl hover:shadow-2xl hover:bg-muted/80 transition-all group"
            title="Open sidebar"
          >
            <svg
              className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
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