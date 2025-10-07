'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import clsx from 'clsx'
import TearsheetDashboard from './TearsheetDashboard'
import { TearSheet, TearSheetClass } from '../../types/proto'

// Create a query client for React Query (exported for use in UnifiedDashboardContainer)
export const dashboardQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
    },
  },
})

// Props interface for the container
export interface DashboardContainerProps {
  campaignId: string
  userId?: string
  apiEndpoint: string
  // Optional UI customization
  showHeader?: boolean
  className?: string
  hideLayoutControls?: boolean
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
        setData(metadata)
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
  rightControls,
}: DashboardContainerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Fetch metadata to get available categories
  const {
    data: metadata,
    isLoading: isLoadingMetadata,
    error: metadataError
  } = useTearsheetMetadata(apiEndpoint, campaignId, userId)

  // Get available categories from metadata
  const categories = useMemo(() => {
    if (!metadata?.tearsheet_metadata) return []
    return Object.keys(metadata.tearsheet_metadata)
  }, [metadata])

  // Set initial category when metadata loads
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0])
    }
  }, [categories, selectedCategory])

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

  if (metadataError || tearsheetError) {
    return (
      <div className={clsx("relative h-full bg-background", className)}>
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-card border border-destructive/50 rounded-lg p-8 max-w-2xl">
            <h2 className="text-xl font-bold text-destructive mb-4">Error Loading Data</h2>
            <p className="text-muted-foreground mb-4">
              {metadataError || tearsheetError || "Unable to load the dashboard! Please try again later."}
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
        </div>
      )}

      {/* Main Dashboard Content - TearsheetDashboard will render its own toolbar */}
      <div className="flex-1 overflow-hidden">
        <TearsheetDashboard
          tearsheet={tearsheet}
          hideLayoutControls={hideLayoutControls}
          rightControls={rightControls}
          onCategoryChange={(category) => {
            // This is for internal category changes within the tearsheet
            console.log('Internal category change:', category)
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
