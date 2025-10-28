import React from 'react'

interface ChartLoadingStateProps {
  isLoading: boolean
  isTimeframeSwitching: boolean
  isAssetSwitching: boolean
  hasData: boolean
  assetId: string
  error?: Error | null
  children: React.ReactNode
}

/**
 * Handles different loading and error states for the chart
 * Shows appropriate UI for loading, switching, errors, or no data
 */
export const ChartLoadingState: React.FC<ChartLoadingStateProps> = ({
  isLoading,
  isTimeframeSwitching,
  isAssetSwitching,
  hasData,
  assetId,
  error,
  children,
}) => {
  // Error state
  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-red-500">Unable to fetch trade data! Please try again later.</div>
      </div>
    )
  }

  // Initial loading state (no data yet)
  if ((isLoading || isTimeframeSwitching) && !hasData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent mb-4" />
          <p className="text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    )
  }

  // Asset switching state
  if (isAssetSwitching) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-accent border-r-transparent mb-4" />
          <p className="text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    )
  }

  // Timeframe switching state
  if (isTimeframeSwitching) {
    return (
      <div className="h-full w-full rounded-3xl">
        <div className="flex h-full items-center justify-center text-gray-500">Switching timeframe...</div>
      </div>
    )
  }

  // No asset selected
  if (!assetId) {
    return (
      <div className="h-full w-full rounded-3xl">
        <div className="flex h-full items-center justify-center text-gray-500">Please select an asset</div>
      </div>
    )
  }

  // No data found
  if (!hasData) {
    return (
      <div className="h-full w-full rounded-3xl">
        <div className="flex h-full items-center justify-center text-gray-500">No data found!</div>
      </div>
    )
  }

  // Render chart
  return <>{children}</>
}
