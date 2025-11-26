import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { QueryClient, QueryClientProvider, InfiniteData } from '@tanstack/react-query'
import clsx from 'clsx'
import TradeAnalyticsChartRenderer from './components/TradeAnalyticsChartRenderer'
import DefaultTopToolbar from './components/DefaultTopToolbar'
import type { GetTradeAnalyticsMetadataResponseType, IRoundTrip } from '../../types/TradeAnalyticsTypes'
import { TRADE_POSITION, TRADE_RESULT } from '../../types/TradeAnalyticsTypes'
import { getMsPerBar } from './components/TradeAnalyticsChartRenderer/utils/BackendPaddingUtils'
import { globalDataCacheManager } from './components/TradeAnalyticsChartRenderer/utils/DataCacheManager'
import HighchartsReact from 'highcharts-react-official'
import CardSelector from '../../components/CardSelector'
import type { CardRowData } from '../../types/SelectorTypes'
import { useSelectorMetadata } from '../../hooks/useSelectorMetadata'
import { useSelectorCounts } from '../../hooks/useSelectorCounts'
import { SelectorIcon } from '../../utils/iconHelpers'

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
  const [isAssetSwitching, setIsAssetSwitching] = useState(false)
  const [selectedRoundTripForChart, setSelectedRoundTripForChart] = useState<IRoundTrip | null>(null)
  const [loadedDataRange, setLoadedDataRange] = useState<{ min: number; max: number } | null>(null)
  const [isLazyLoading, setIsLazyLoading] = useState(false)
  const [expansionRequest, setExpansionRequest] = useState<{ from: number; to: number } | null>(null)
  const [debouncedSidebarWidth, setDebouncedSidebarWidth] = useState(56)
  const [activeSelectorIndex, setActiveSelectorIndex] = useState(0)
  const [indicatorVisibility, setIndicatorVisibility] = useState<{
    visibilityState: Record<string, boolean>
    onToggleIndicator: (seriesId: string) => boolean
    getVisibleCount: () => { visible: number; total: number }
    canShowMore: () => boolean
  } | null>(null)

  // Refs for sidebar and chart
  const triggerRef = useRef<HTMLButtonElement>(null)
  const eventsSectionRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<HighchartsReact.RefObject>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)

  // Chart focus handler - zooms to trade time range and price range
  const focusOnTrade = (roundTrip: IRoundTrip) => {
    const chart = chartRef.current?.chart
    if (!chart) return

    const xAxis = chart.xAxis[0]
    const yAxis = chart.yAxis[0]
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

    // Set X-axis extremes (time range)
    // Let Highcharts automatically determine the Y-axis range based on visible data
    xAxis.setExtremes(startTime, endTime, true, true)
  }


  // Handle range expansion for lazy loading
  const handleRangeExpansion = useCallback((range: { from: number; to: number }) => {
    console.log('📊 [Lazy Loading] Container received expansion request:', {
      from: new Date(range.from).toISOString(),
      to: new Date(range.to).toISOString(),
      currentExpansionRequest: expansionRequest
    })
    setExpansionRequest(range)
    setIsLazyLoading(true)
  }, [expansionRequest])

  // Fetch metadata
  const {
    data: tradeAnalyticsMetadata,
    isLoading: isLoadingTradeAnalyticsMetadata,
    error: tradeAnalyticsMetadataError
  } = useTradeMetadata(apiEndpoint, campaignId, userId)

  // Fetch selector metadata from separate endpoint
  const {
    data: selectorMetadata,
    isLoading: isLoadingSelectorMetadata,
    error: selectorMetadataError
  } = useSelectorMetadata({
    campaignId,
    userId,
    apiEndpoint,
    enabled: true,
  })

  // Get available selectors for the current asset
  const availableSelectors = useMemo(() => {
    if (!selectorMetadata || !selectedAssetId) return []
    return selectorMetadata[selectedAssetId] || []
  }, [selectorMetadata, selectedAssetId])

  // Reset active selector index when asset changes
  useEffect(() => {
    if (availableSelectors.length > 0 && activeSelectorIndex >= availableSelectors.length) {
      setActiveSelectorIndex(0)
    }
  }, [availableSelectors, activeSelectorIndex])

  // Fetch counts for all selectors dynamically
  const { counts: selectorCounts } = useSelectorCounts({
    campaignId,
    userId,
    assetId: selectedAssetId,
    selectorCount: availableSelectors.length,
    apiEndpoint,
    enabled: !!selectedAssetId,
  })

  // Note: Round trips data is now fetched inside CardSelector via the selector endpoint
  // No longer fetching round trips directly in this component

  // Debounce sidebar width changes to prevent chart re-renders during animation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSidebarWidth(isEventsSidebarOpen ? 349 : 56)
    }, 250) // Wait for animation to complete

    return () => clearTimeout(timeoutId)
  }, [isEventsSidebarOpen])


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
    // Immediately set loading state for instant visual feedback
    setIsAssetSwitching(true)
    setSelectedAssetId(assetId)

    // CRITICAL: Clear any selected trade from previous asset
    // This prevents fetching with invalid pivot timestamps that are outside
    // the new asset's data range, which would cause fetch failures and infinite loading
    setSelectedRoundTripForChart(null)

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

  // Clear asset switching state when data loads for the new asset
  useEffect(() => {
    if (isAssetSwitching && !isLoadingTradeAnalyticsMetadata) {
      // Short delay to ensure data has fully rendered before clearing loading state
      const timeoutId = setTimeout(() => {
        setIsAssetSwitching(false)
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [isAssetSwitching, isLoadingTradeAnalyticsMetadata])

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

  // No need for resize observer or reflow since sidebar is now an overlay

  // Clear isLazyLoading when expansion request changes
  // We set isLazyLoading=true when requesting, and clear it after a short delay
  // to allow the next expansion request to be processed
  useEffect(() => {
    if (isLazyLoading) {
      // Clear the loading flag after a longer delay to allow fetch to complete
      const timeoutId = setTimeout(() => {
        setIsLazyLoading(false)
      }, 5000) // 5 second delay to ensure fetch has completed

      return () => clearTimeout(timeoutId)
    }
  }, [isLazyLoading])

  // Clear expansion request after it's been processed
  // Don't clear too quickly - wait for data to actually be fetched
  useEffect(() => {
    if (expansionRequest) {
      // Clear the expansion request after a longer delay to allow fetch to complete
      // This prevents the request from being cleared before the data hook can process it
      const timeoutId = setTimeout(() => {
        setExpansionRequest(null)
      }, 10000) // 10 seconds - enough time for fetch to complete

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
        timeframeConfig={tradeAnalyticsMetadata?.chart_info?.[selectedTimeframe]}
        indicatorVisibility={indicatorVisibility || undefined}
      />

      {/* Main Content Area with Sidebar Overlay */}
      <div className="flex flex-1 w-full flex-row overflow-hidden bg-background relative">
        {/* Sidebar - Overlay positioned absolutely */}
        {(
          <div
            ref={eventsSectionRef}
            className={clsx(
              "absolute left-0 top-0 h-full z-50 transform-gpu",
              isEventsSidebarOpen ? "w-[349px]" : "w-14"
            )}
            style={{
              transition: 'width 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'width'
            }}
          >
            <div className="h-full w-full bg-card border-r border-border shadow-lg flex flex-col">
            {/* Collapsed Toolbar View */}
            {!isEventsSidebarOpen ? (
              <div className="flex flex-col items-center py-4 gap-4">
                {availableSelectors.map((selector, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveSelectorIndex(index)
                      setIsEventsSidebarOpen(true)
                    }}
                    className="relative p-2.5 rounded-lg hover:bg-muted/30 group"
                    title={selector.title || 'View cards'}
                  >
                    <SelectorIcon
                      icon={selector.icon}
                      count={selectorCounts[index]}
                      size={24}
                    />
                  </button>
                ))}
                {availableSelectors.length === 0 && (
                  <button
                    onClick={() => setIsEventsSidebarOpen(true)}
                    className="relative p-2.5 rounded-lg hover:bg-muted/30 group"
                    title="View cards"
                  >
                    <svg
                      className="w-6 h-6 text-muted-foreground group-hover:text-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Expanded Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-accent/80 rounded-full" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {availableSelectors[activeSelectorIndex]?.title || 'Cards'}
                      </h3>
                    </div>
                  </div>
                  <button
                    ref={triggerRef}
                    onClick={() => setIsEventsSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted/30 group"
                    title="Collapse sidebar"
                  >
                    <svg
                      className="w-4 h-4 text-muted-foreground group-hover:text-foreground"
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
            {isEventsSidebarOpen && (isLoadingSelectorMetadata ? (
              <div className="flex h-full w-full items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-accent" />
                  <p className="text-xs text-muted-foreground">Loading selector metadata...</p>
                </div>
              </div>
            ) : (
              // Use generic CardSelector if selector metadata exists, otherwise show message
              availableSelectors.length > 0 && availableSelectors[activeSelectorIndex] ? (
                <CardSelector
                  key={`${selectedAssetId}-${activeSelectorIndex}`} // Force re-mount on asset/selector change
                  campaignId={campaignId}
                  userId={userId}
                  assetId={selectedAssetId}
                  selectorIndex={activeSelectorIndex}
                  apiEndpoint={apiEndpoint}
                  metadata={availableSelectors[activeSelectorIndex]}
                  onCardClick={(rowData: CardRowData) => {
                    // Generic card click handler using pivot_index
                    const metadata = availableSelectors[activeSelectorIndex]
                    if (!metadata) return

                    // Use pivot_index to get the timestamp column
                    const pivotSchema = metadata.schemas[metadata.pivot_index]
                    if (!pivotSchema) return

                    const pivotColumnId = pivotSchema.column_id
                    const pivotValue = rowData[pivotColumnId]

                    if (!pivotValue) return

                    // Create a minimal round trip object for chart navigation
                    // Only populate the fields needed for focusOnTrade
                    const roundTrip: IRoundTrip = {
                      // Asset identification
                      asset: (rowData.asset as string) || selectedAssetId,
                      asset_id: (rowData.asset_id as string) || selectedAssetId,
                      asset_root_id: (rowData.asset_root_id as string) || selectedAssetId,

                      // Timestamps - use pivot value as the primary timestamp
                      open_datetime: pivotValue as string,
                      close_datetime: (rowData.close_datetime as string) || pivotValue as string,

                      // Position info - use defaults if not available
                      side: (rowData.side as TRADE_POSITION) || TRADE_POSITION.LONG,
                      status: (rowData.status as TRADE_RESULT) || TRADE_RESULT.OPEN,
                      index: (rowData.index as number) || 0,

                      // Prices - optional
                      lowest_price: rowData.lowest_price as number,
                      highest_price: rowData.highest_price as number,
                      avg_entry_price: rowData.avg_entry_price as number,
                      avg_exit_price: rowData.avg_exit_price as number,
                      opening_price: rowData.opening_price as number,
                      closing_price: rowData.closing_price as number,

                      // Other fields - use defaults
                      cost: (rowData.cost as number) || 0,
                      entry_cost: (rowData.entry_cost as number) || 0,
                      exit_cost: (rowData.exit_cost as number) || 0,
                      size: (rowData.size as number) || 0,
                      position: (rowData.position as number) || 0,
                      entry_trade_sizes: (rowData.entry_trade_sizes as number) || 0,
                      exit_trade_sizes: (rowData.exit_trade_sizes as number) || 0,
                      net_return: (rowData.net_return as number) || 0,
                      return_percent: (rowData.return_percent as number) || 0,
                      return_nominal: (rowData.return_nominal as number) || 0,
                      return_size: (rowData.return_size as number) || 0,
                      duration: (rowData.duration as number) || 0,
                      stop_loss: (rowData.stop_loss as number) || null,
                      take_profit: (rowData.take_profit as number) || null,
                      total_commissions: (rowData.total_commissions as number) || null,
                    }

                    setSelectedRoundTripForChart(roundTrip)
                    setTimeout(() => focusOnTrade(roundTrip), 100)
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">No selector data available</p>
                    {selectorMetadataError && (
                      <p className="text-xs text-destructive mt-2">{selectorMetadataError}</p>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
          </div>
        )}

        {/* Chart Area - Full Width (sidebar overlays on top) */}
        <div
          ref={chartContainerRef}
          className="w-full h-full overflow-hidden"
        >
          <div className="h-full w-full text-foreground p-2">
            <TradeAnalyticsChartRenderer
              isLoading={isLoadingTradeAnalyticsMetadata || isLazyLoading}
              tradeAnalyticsMetadata={tradeAnalyticsMetadata}
              selectedRoundTrips={selectedRoundTripsArray}
              campaignId={campaignId}
              assetId={selectedAssetId}
              fetchEntireCandleStickData={false}
              paddingProfile="STANDARD"
              timeframe={selectedTimeframe}
              chartRef={chartRef as React.RefObject<HighchartsReact.RefObject>}
              onRangeExpansionNeeded={handleRangeExpansion}
              expansionRange={expansionRequest}
              isLazyLoading={isLazyLoading}
              apiEndpoint={apiEndpoint}
              userId={userId}
              sidebarWidth={debouncedSidebarWidth}
              isAssetSwitching={isAssetSwitching}
              onIndicatorVisibilityChange={setIndicatorVisibility}
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