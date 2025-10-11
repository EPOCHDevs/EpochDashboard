'use client'

import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'
import type { GetTradeAnalyticsMetadataResponseType } from '../../../types/TradeAnalyticsTypes'

interface AssetSelectorDialogProps {
  metadata?: GetTradeAnalyticsMetadataResponseType
  selectedAssetId: string
  onAssetChange: (assetId: string) => void
}

export function AssetSelectorDialog({
  metadata,
  selectedAssetId,
  onAssetChange,
}: AssetSelectorDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const availableAssets = metadata?.asset_info ? Object.keys(metadata.asset_info) : []

  // Close dialog when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        dialogRef.current &&
        buttonRef.current &&
        !dialogRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const handleSelectAsset = (assetId: string) => {
    onAssetChange(assetId)
    setIsOpen(false)
  }

  if (availableAssets.length === 0) {
    return null
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center gap-2 bg-background border rounded-md px-3 py-1.5",
          "text-sm font-medium transition-all cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-accent",
          isOpen
            ? "border-accent bg-accent/10 text-foreground"
            : "border-border text-foreground hover:bg-muted hover:border-accent"
        )}
        disabled={availableAssets.length === 1}
      >
        <span className="text-muted-foreground">Asset:</span>
        <span className="font-semibold">{selectedAssetId}</span>
        {availableAssets.length > 1 && (
          <svg
            className={clsx(
              "w-4 h-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
      </button>

      {/* Dialog Dropdown */}
      {isOpen && availableAssets.length > 1 && (
        <div
          ref={dialogRef}
          className="absolute top-full mt-2 left-0 z-50 min-w-[200px] bg-card border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2"
        >
          <div className="py-1 max-h-[300px] overflow-y-auto">
            {availableAssets.map((assetId) => {
              const assetInfo = metadata?.asset_info?.[assetId]
              const isSelected = assetId === selectedAssetId

              return (
                <button
                  key={assetId}
                  onClick={() => handleSelectAsset(assetId)}
                  className={clsx(
                    "w-full px-4 py-2 text-left text-sm transition-colors",
                    "hover:bg-accent/10 focus:bg-accent/10 focus:outline-none",
                    isSelected && "bg-accent/20 font-semibold"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={isSelected ? "text-accent" : "text-foreground"}>
                      {assetId}
                    </span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-accent"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  {assetInfo?.timeframes && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {assetInfo.timeframes.length} timeframes
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default AssetSelectorDialog