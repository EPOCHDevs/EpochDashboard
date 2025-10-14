'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { DashboardContent, dashboardQueryClient, useTearsheetMetadata } from './DashboardContainer'
import { TradeAnalyticsContent, tradeAnalyticsQueryClient } from '../../modules/TradeAnalyticsTab/TradeAnalyticsContainer'
import type { DashboardContainerProps } from './DashboardContainer'
import type { TradeAnalyticsContainerProps } from '../../modules/TradeAnalyticsTab/TradeAnalyticsContainer'
import type { GetTradeAnalyticsMetadataResponseType } from '../../types/TradeAnalyticsTypes'

// Shared query client for both views
const unifiedQueryClient = dashboardQueryClient

// View types
export type DashboardView = 'dashboard' | 'charts'
export type ViewMode = 'tabs' | 'unified'

// Props interface for the unified container
export interface UnifiedDashboardContainerProps {
  campaignId: string
  userId?: string
  apiEndpoint: string
  // Optional UI customization
  defaultView?: DashboardView
  defaultViewMode?: ViewMode
  className?: string
  hideLayoutControls?: boolean
}

// Main unified container component
function UnifiedDashboardContainerContent({
  campaignId,
  userId = 'guest',
  apiEndpoint,
  defaultView = 'dashboard',
  defaultViewMode = 'tabs',
  className,
  hideLayoutControls = false,
}: UnifiedDashboardContainerProps) {
  // Router for URL sync (optional - works without Next.js)
  let router
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = useRouter()
  } catch {
    // Not in Next.js context, that's fine
    router = null
  }

  // Fetch metadata to check if dashboard data is available
  const {
    data: metadata,
    isLoading: isLoadingMetadata,
  } = useTearsheetMetadata(apiEndpoint, campaignId, userId)

  // Check if there are any categories (trades) available
  const hasData = useMemo(() => {
    if (!metadata?.tearsheet_metadata) return false
    return Object.keys(metadata.tearsheet_metadata).length > 0
  }, [metadata])

  // Auto-switch to charts if no data available
  const initialView = useMemo(() => {
    if (isLoadingMetadata) return defaultView
    return hasData ? defaultView : 'charts'
  }, [hasData, defaultView, isLoadingMetadata])

  // View state - sync with URL if available
  const [activeView, setActiveView] = useState<DashboardView>(initialView)

  // Update active view when initial view changes (when metadata loads)
  useEffect(() => {
    if (!isLoadingMetadata) {
      setActiveView(initialView)
    }
  }, [initialView, isLoadingMetadata])

  // Sync with URL parameter on mount
  useEffect(() => {
    if (router && router.isReady) {
      const viewParam = router.query.view as DashboardView | undefined
      if (viewParam === 'dashboard' || viewParam === 'charts') {
        // Only allow dashboard view if data is available
        if (viewParam === 'dashboard' && !hasData && !isLoadingMetadata) {
          return
        }
        setActiveView(viewParam)
      }
    }
  }, [router, hasData, isLoadingMetadata])

  // Update URL when view changes
  const handleViewChange = (view: DashboardView) => {
    // Prevent switching to dashboard if no data available
    if (view === 'dashboard' && !hasData) {
      return
    }

    setActiveView(view)

    // Update URL if router is available
    if (router) {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, view: view },
        },
        undefined,
        { shallow: true }
      )
    }
  }

  // Create view switcher controls (just the buttons, no wrapper)
  const viewSwitcherControls = (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
      <div className="relative group">
        <button
          onClick={() => handleViewChange('dashboard')}
          disabled={!hasData}
          className={clsx(
            "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
            !hasData && "cursor-not-allowed opacity-50",
            activeView === 'dashboard'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            !hasData && "hover:bg-transparent hover:text-muted-foreground"
          )}
        >
          Dashboard
        </button>
        {!hasData && !isLoadingMetadata && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border border-border whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
            No trades were placed
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-border"></div>
          </div>
        )}
      </div>
      <button
        onClick={() => handleViewChange('charts')}
        className={clsx(
          "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          activeView === 'charts'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
        )}
      >
        Charts
      </button>
    </div>
  )

  return (
    <div className={clsx("h-full bg-background flex flex-col overflow-hidden", className)}>
      {/* Main Content Area - Only mount active view for better performance */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeView === 'dashboard' ? (
          <DashboardContent
            key="dashboard"
            campaignId={campaignId}
            userId={userId}
            apiEndpoint={apiEndpoint}
            showHeader={false}
            hideLayoutControls={hideLayoutControls}
            defaultViewMode={defaultViewMode}
            rightControls={viewSwitcherControls}
            className="h-full overflow-auto"
          />
        ) : (
          <TradeAnalyticsContent
            key="charts"
            campaignId={campaignId}
            userId={userId}
            apiEndpoint={apiEndpoint}
            showHeader={false}
            rightControls={viewSwitcherControls}
            className="h-full overflow-hidden"
          />
        )}
      </div>
    </div>
  )
}

// Wrapper component that provides QueryClient
export function UnifiedDashboardContainer(props: UnifiedDashboardContainerProps) {
  return (
    <QueryClientProvider client={unifiedQueryClient}>
      <UnifiedDashboardContainerContent {...props} />
    </QueryClientProvider>
  )
}

export default UnifiedDashboardContainer
