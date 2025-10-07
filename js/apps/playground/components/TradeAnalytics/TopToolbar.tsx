import React from 'react'
import AssetSelector from './AssetSelector'
import TimeframeDropdown from './TimeframeDropdown'
import { GetTradeAnalyticsMetadataResponseType } from '../../../../packages/epoch-dashboard/src/types/TradeAnalyticsTypes'

interface TopToolbarProps {
  metadata?: GetTradeAnalyticsMetadataResponseType
  selectedAssetId: string
  selectedTimeframe: string
  onAssetChange: (assetId: string) => void
  onTimeframeChange: (timeframe: string) => void
  // Optional right controls (e.g., view switcher from UnifiedDashboard)
  rightControls?: React.ReactNode
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  metadata,
  selectedAssetId,
  selectedTimeframe,
  onAssetChange,
  onTimeframeChange,
  rightControls,
}) => {
  return (
    <div className="w-full bg-card border-b border-border">
      <div className="flex items-center gap-2 px-4 py-2">
        {/* Asset Selector */}
        <AssetSelector
          metadata={metadata}
          selectedAssetId={selectedAssetId}
          onAssetChange={onAssetChange}
        />

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Timeframe Dropdown */}
        <TimeframeDropdown
          metadata={metadata}
          selectedAssetId={selectedAssetId}
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={onTimeframeChange}
        />

        {/* Divider */}
        <div className="w-px h-6 bg-border" />

        {/* Indicators Button (Placeholder - Future Feature) */}
        <button
          onClick={() => {
            // Future implementation
            console.log('Indicators clicked - Feature coming soon')
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-muted/50 border border-border rounded text-foreground text-sm font-medium transition-all opacity-50 cursor-not-allowed"
          disabled
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span>Indicators</span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Optional right controls (e.g., view switcher) */}
        {rightControls && (
          <>
            <div className="w-px h-6 bg-border" />
            {rightControls}
          </>
        )}
      </div>
    </div>
  )
}

export default TopToolbar