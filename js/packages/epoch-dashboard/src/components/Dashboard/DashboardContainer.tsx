'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import clsx from 'clsx'
import TearsheetDashboard from './TearsheetDashboard'
import { TearSheet, TearSheetClass } from '../../types/proto'
import { DashboardModeSelector, DashboardViewMode } from './DashboardModeSelector'
import { AssetSelectorDialog } from '../../modules/TradeAnalyticsTab/components/AssetSelectorDialog'
import { useTradeMetadata } from '../../modules/TradeAnalyticsTab/TradeAnalyticsContainer'
import type { GetTradeAnalyticsMetadataResponseType } from '../../types/TradeAnalyticsTypes'

// Create a query client for React Query (exported for use in UnifiedDashboardContainer)
export const dashboardQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes - reduced for better memory management
      gcTime: 5 * 60 * 1000, // 5 minutes - reduced to free memory faster
      retry: 1,
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
    },
  },
})

// View Mode Types
export type ViewMode = 'tabs' | 'unified'

// Props interface for the container
export interface DashboardContainerProps {
  campaignId: string
  userId?: string
  apiEndpoint: string
  // Optional UI customization
  showHeader?: boolean
  className?: string
  hideLayoutControls?: boolean
  defaultViewMode?: ViewMode
  // Optional controls to render after category tabs
  rightControls?: React.ReactNode
}

// Metadata response structure
interface TearsheetMetadata {
  tearsheet_metadata: Record<string, {
    cards_count: number
    charts_count: number
    tables_count: number
  }>
}

// Hook for fetching tearsheet metadata
export function useTearsheetMetadata(apiEndpoint: string, campaignId: string, userId: string) {
  const [data, setData] = useState<TearsheetMetadata | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!campaignId) {
        setError('Missing Campaign ID')
        setIsLoading(false)
        return
      }

      try {
        setError(null)
        const response = await fetch(`${apiEndpoint}/api/v1/dashboard/perf-metadata/${campaignId}`, {
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

        // Check if the response contains an error object instead of valid metadata
        // This can happen when the API returns 200 OK but with an error in the body
        if (metadata.error === 'DataNotFound' || (metadata.error && !metadata.tearsheet_metadata)) {
          // Treat DataNotFound as empty metadata rather than an error
          // This allows the UI to show "No Data Available" instead of an error state
          setData({ tearsheet_metadata: {} })
        } else {
          setData(metadata)
        }
      } catch (error) {
        console.error('Failed to fetch tearsheet metadata:', error)
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

// Hook for fetching tearsheet data for a specific category
export function useTearsheetData(
  apiEndpoint: string,
  campaignId: string,
  userId: string,
  category: string | null
) {
  const [data, setData] = useState<TearSheet | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!campaignId || !category) {
        setIsLoading(false)
        return
      }

      try {
        setError(null)
        setIsLoading(true)
        const response = await fetch(
          `${apiEndpoint}/api/v1/dashboard/perf/${campaignId}?category=${encodeURIComponent(category)}&raw=true&all=true`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/octet-stream',
              'X-USER-ID': userId,
            },
          }
        )

        if (!response.ok) {
          let errorMessage = `Failed to fetch tearsheet: ${response.status}`
          try {
            const errorData = await response.json()
            errorMessage = errorData.details || errorData.error || errorMessage
          } catch (e) {
            errorMessage = `${errorMessage} ${response.statusText}`
          }
          throw new Error(errorMessage)
        }

        // Parse protobuf response
        const arrayBuffer = await response.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)
        const tearsheet = TearSheetClass.decode(uint8Array)
        setData(tearsheet)
      } catch (error) {
        console.error('Failed to fetch tearsheet data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tearsheet'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [apiEndpoint, campaignId, userId, category])

  return { data, isLoading, error }
}

// Main container component (exported for use in UnifiedDashboardContainer)
export function DashboardContent({
  campaignId,
  userId = 'guest',
  apiEndpoint,
  showHeader = true,
  className,
  hideLayoutControls = false,
  defaultViewMode = 'tabs',
  rightControls,
}: DashboardContainerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<DashboardViewMode>('overview')

  // Fetch Dashboard metadata to get available categories
  const {
    data: metadata,
    isLoading: isLoadingMetadata,
    error: metadataError
  } = useTearsheetMetadata(apiEndpoint, campaignId, userId)

  // Fetch Charts metadata to get asset_info (for AssetSelectorDialog)
  const {
    data: chartsMetadata,
    isLoading: isLoadingChartsMetadata,
    error: chartsMetadataError
  } = useTradeMetadata(apiEndpoint, campaignId, userId)

  // Get available categories from metadata
  const categories = useMemo(() => {
    if (!metadata?.tearsheet_metadata) return []
    return Object.keys(metadata.tearsheet_metadata)
  }, [metadata])

  // Extract asset categories (non-ALL categories) for filtering
  const assetCategories = useMemo(() => {
    return categories.filter(cat => cat !== 'ALL')
  }, [categories])

  // Check if Overview mode is available (ALL category exists)
  const hasOverview = useMemo(() => {
    return categories.includes('ALL')
  }, [categories])

  // Check if By Asset mode is available (asset categories exist)
  const hasByAsset = useMemo(() => {
    return assetCategories.length > 0
  }, [assetCategories])

  // Filter Charts metadata to only include assets that exist in Dashboard
  const filteredChartsMetadata = useMemo<GetTradeAnalyticsMetadataResponseType | undefined>(() => {
    if (!chartsMetadata?.asset_info) return undefined

    // Filter asset_info to only include assets that have categories in Dashboard
    const filteredAssetInfo = Object.keys(chartsMetadata.asset_info)
      .filter(assetId => assetCategories.includes(assetId))
      .reduce((acc, assetId) => {
        acc[assetId] = chartsMetadata.asset_info![assetId]
        return acc
      }, {} as Record<string, any>)

    return {
      ...chartsMetadata,
      asset_info: filteredAssetInfo
    }
  }, [chartsMetadata, assetCategories])

  // Set initial category when metadata loads
  // Auto-select the available mode based on what data exists
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      if (hasOverview) {
        // Overview (ALL) is available - default to it
        setSelectedCategory('ALL')
        setViewMode('overview')
      } else if (hasByAsset) {
        // Only By Asset mode is available
        setSelectedCategory(assetCategories[0])
        setViewMode('by_asset')
      }
    }
  }, [categories, selectedCategory, hasOverview, hasByAsset, assetCategories])

  // Handle view mode changes
  const handleViewModeChange = (mode: DashboardViewMode) => {
    // Prevent switching to unavailable modes
    if (mode === 'overview' && !hasOverview) return
    if (mode === 'by_asset' && !hasByAsset) return

    setViewMode(mode)

    if (mode === 'overview') {
      // Switch to ALL category
      setSelectedCategory('ALL')
    } else {
      // Switch to first asset category
      const firstAsset = assetCategories[0]
      if (firstAsset) {
        setSelectedCategory(firstAsset)
      }
    }
  }

  // Handle asset selection from AssetSelectorDialog
  const handleAssetChange = (assetId: string) => {
    setSelectedCategory(assetId)
  }

  // Determine if "By Asset" mode should be disabled
  // Disable if: no asset categories OR Charts metadata not loaded OR Charts metadata has errors
  const isByAssetDisabled = !hasByAsset || !filteredChartsMetadata || isLoadingChartsMetadata

  // Fetch tearsheet data for selected category
  const {
    data: tearsheet,
    isLoading: isLoadingTearsheet,
    error: tearsheetError
  } = useTearsheetData(apiEndpoint, campaignId, userId, selectedCategory)

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

  if (metadataError || tearsheetError || chartsMetadataError) {
    return (
      <div className={clsx("relative h-full bg-background", className)}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-card border border-destructive/50 rounded-lg p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-destructive mb-4">Error Loading Data</h2>
            <p className="text-muted-foreground mb-4">
              {metadataError || tearsheetError || chartsMetadataError || "Unable to load the dashboard! Please try again later."}
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

  // Check if metadata has loaded but contains no categories (empty tearsheet_metadata)
  if (!isLoadingMetadata && metadata && categories.length === 0) {
    return (
      <div className={clsx("relative h-full bg-background", className)}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30">
              <svg
                className="w-8 h-8 text-muted-foreground/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No Data Available</h2>
            <p className="text-sm text-muted-foreground/70 leading-relaxed">
              No trades or performance data found for this campaign.<br />
              Data will appear here once trades are executed.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoadingMetadata || isLoadingTearsheet || !tearsheet) {
    return (
      <div className={clsx("relative h-full bg-background", className)}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Create view mode controls
  const viewModeControls = (
    <div className="flex items-center gap-2">
      {/* Mode Selector: Overview vs By Asset - auto-hides when only one mode available */}
      <DashboardModeSelector
        mode={viewMode}
        onModeChange={handleViewModeChange}
        disabled={isByAssetDisabled}
        hasOverview={hasOverview}
        hasByAsset={hasByAsset}
      />

      {/* Asset Selector: Only show in By Asset mode */}
      {viewMode === 'by_asset' && filteredChartsMetadata && (
        <AssetSelectorDialog
          metadata={filteredChartsMetadata}
          selectedAssetId={selectedCategory || assetCategories[0] || ''}
          onAssetChange={handleAssetChange}
        />
      )}
    </div>
  )

  // Combine view mode controls with user-provided rightControls
  const combinedRightControls = (
    <>
      {!showHeader && viewModeControls}
      {rightControls}
    </>
  )

  return (
    <div className={clsx("flex flex-col h-full w-full", className)}>
      {showHeader && (
        <div className="bg-card border-b border-border px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Performance Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Campaign ID: <span className="text-accent font-mono">{campaignId}</span> |
              User: <span className="text-accent font-mono ml-2">{userId}</span>
            </p>
          </div>

          {/* View Mode Controls (Overview vs By Asset) */}
          {viewModeControls}
        </div>
      )}

      {/* Main Dashboard Content - TearsheetDashboard will render its own toolbar */}
      <div className="flex-1 overflow-hidden">
        <TearsheetDashboard
          tearsheet={tearsheet}
          hideLayoutControls={hideLayoutControls}
          defaultViewMode={defaultViewMode}
          rightControls={combinedRightControls}
          highLevelCategory={selectedCategory || undefined}
          onCategoryChange={(category) => {
            // This is for internal category changes within the tearsheet
          }}
        />
      </div>
    </div>
  )
}

// Wrapper component that provides QueryClient
export function DashboardContainer(props: DashboardContainerProps) {
  return (
    <QueryClientProvider client={dashboardQueryClient}>
      <DashboardContent {...props} />
    </QueryClientProvider>
  )
}

export default DashboardContainer
