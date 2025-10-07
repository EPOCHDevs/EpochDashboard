import React, { useState } from 'react'
import { GetTradeAnalyticsMetadataResponseType } from '../../../../packages/epoch-dashboard/src/types/TradeAnalyticsTypes'
import AssetSelectionModal from './AssetSelectionModal'

interface AssetSelectorProps {
  metadata?: GetTradeAnalyticsMetadataResponseType
  selectedAssetId: string
  onAssetChange: (assetId: string) => void
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  metadata,
  selectedAssetId,
  onAssetChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Get current asset info
  const currentAsset = metadata?.asset_info[selectedAssetId]
  const displayName = currentAsset?.asset?.ticker || currentAsset?.asset?.name || selectedAssetId

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-muted/50 border border-border rounded text-foreground text-sm font-medium transition-all"
      >
        <span>{displayName}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isModalOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Asset Selection Modal */}
      <AssetSelectionModal
        show={isModalOpen}
        metadata={metadata}
        selectedAssetId={selectedAssetId}
        onAssetSelect={onAssetChange}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default AssetSelector