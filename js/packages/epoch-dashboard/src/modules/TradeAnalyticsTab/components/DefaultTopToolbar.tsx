'use client'

import React from 'react'
import clsx from 'clsx'
import { AssetSelectorDialog } from './AssetSelectorDialog'
import type { GetTradeAnalyticsMetadataResponseType } from '../../../types/TradeAnalyticsTypes'

interface DefaultTopToolbarProps {
  metadata?: GetTradeAnalyticsMetadataResponseType
  selectedAssetId: string
  selectedTimeframe: string
  onAssetChange: (assetId: string) => void
  onTimeframeChange: (timeframe: string) => void
  rightControls?: React.ReactNode
}

export function DefaultTopToolbar({
  metadata,
  selectedAssetId,
  selectedTimeframe,
  onAssetChange,
  onTimeframeChange,
  rightControls,
}: DefaultTopToolbarProps) {
  const availableAssets = metadata?.asset_info ? Object.keys(metadata.asset_info) : []
  const selectedAssetInfo = metadata?.asset_info?.[selectedAssetId]
  const availableTimeframes = selectedAssetInfo?.timeframes || []

  return (
    <div className="relative z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-4">
        {/* Asset Selector Dialog */}
        {availableAssets.length > 0 && (
          <AssetSelectorDialog
            metadata={metadata}
            selectedAssetId={selectedAssetId}
            onAssetChange={onAssetChange}
          />
        )}

        {/* Timeframe Selector */}
        {availableTimeframes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Timeframe:</span>
            <div className="flex gap-1">
              {availableTimeframes.map((tf) => (
                <button
                  key={tf.timeframe}
                  onClick={() => onTimeframeChange(tf.timeframe)}
                  className={clsx(
                    "px-3 py-1.5 text-sm rounded-md transition-all",
                    selectedTimeframe === tf.timeframe
                      ? "bg-accent text-accent-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  )}
                >
                  {tf.timeframe}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Controls (e.g., view switcher) */}
      {rightControls && (
        <div className="flex items-center gap-2">
          {rightControls}
        </div>
      )}
    </div>
  )
}

export default DefaultTopToolbar