'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import clsx from 'clsx'
import { Search, X } from 'lucide-react'
import type { GetTradeAnalyticsMetadataResponseType } from '../../../types/TradeAnalyticsTypes'
import { AssetClasses } from '../../../types/AssetsTypes'

interface AssetSelectorDialogProps {
  metadata?: GetTradeAnalyticsMetadataResponseType
  selectedAssetId: string
  onAssetChange: (assetId: string) => void
}

type CategoryFilter = 'All' | AssetClasses

const CATEGORY_TABS: { id: string; label: string; value: CategoryFilter }[] = [
  { id: 'all', label: 'All', value: 'All' },
  { id: 'stocks', label: 'Stocks', value: AssetClasses.STOCKS },
  { id: 'futures', label: 'Futures', value: AssetClasses.FUTURES },
  { id: 'forex', label: 'Forex', value: AssetClasses.FX },
  { id: 'crypto', label: 'Crypto', value: AssetClasses.CRYPTO },
]

export function AssetSelectorDialog({
  metadata,
  selectedAssetId,
  onAssetChange,
}: AssetSelectorDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const availableAssets = metadata?.asset_info ? Object.keys(metadata.asset_info) : []

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
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
    setSearchQuery('')
  }

  // Filter assets based on search and category
  const filteredAssets = useMemo(() => {
    if (!metadata?.asset_info) return []

    return availableAssets.filter((assetId) => {
      const assetInfo = metadata.asset_info?.[assetId]
      if (!assetInfo?.asset) return false

      const asset = assetInfo.asset

      // Category filter
      if (selectedCategory !== 'All' && asset.asset_class !== selectedCategory) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTicker = asset.ticker?.toLowerCase().includes(query)
        const matchesName = asset.name?.toLowerCase().includes(query)
        const matchesId = assetId.toLowerCase().includes(query)
        const matchesExchange = asset.exchange?.toLowerCase().includes(query)
        const matchesSector = asset.sector?.toLowerCase().includes(query)
        const matchesIndustry = asset.industry?.toLowerCase().includes(query)

        if (!matchesTicker && !matchesName && !matchesId && !matchesExchange && !matchesSector && !matchesIndustry) {
          return false
        }
      }

      return true
    })
  }, [metadata?.asset_info, availableAssets, selectedCategory, searchQuery])

  if (availableAssets.length === 0) {
    return null
  }

  return (
    <>
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
      </button>

      {/* Full-Screen Modal */}
      {isOpen && availableAssets.length > 1 && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false)
              setSearchQuery('')
            }
          }}
        >
          {/* Modal Container */}
          <div className="w-full max-w-3xl bg-card border border-border rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
            {/* Header */}
            <div className="bg-background/50 border-b border-border px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-foreground">Symbol Search</h2>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setSearchQuery('')
                  }}
                  className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ticker, name, exchange..."
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="bg-background/30 border-b border-border px-4 py-2 flex items-center gap-2 overflow-x-auto">
              {CATEGORY_TABS.map((tab) => {
                const categoryCount = tab.value === 'All'
                  ? availableAssets.length
                  : availableAssets.filter(id => metadata?.asset_info?.[id]?.asset?.asset_class === tab.value).length

                // Hide empty categories
                if (categoryCount === 0) return null

                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategory(tab.value)}
                    className={clsx(
                      "px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap",
                      selectedCategory === tab.value
                        ? "bg-accent/20 text-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Asset List */}
            <div className="max-h-[500px] overflow-y-auto">
              {filteredAssets.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">No assets found</p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-sm text-accent hover:underline"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredAssets.map((assetId) => {
                    const assetInfo = metadata?.asset_info?.[assetId]
                    const asset = assetInfo?.asset
                    const isSelected = assetId === selectedAssetId

                    if (!asset) return null

                    return (
                      <button
                        key={assetId}
                        onClick={() => handleSelectAsset(assetId)}
                        className={clsx(
                          "w-full px-4 py-2 text-left transition-colors hover:bg-accent/10",
                          isSelected && "bg-accent/20"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          {/* Asset Class Badge */}
                          <div className={clsx(
                            "px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 w-16 text-center",
                            asset.asset_class === AssetClasses.STOCKS && "bg-blue-500/20 text-blue-400",
                            asset.asset_class === AssetClasses.FUTURES && "bg-orange-500/20 text-orange-400",
                            asset.asset_class === AssetClasses.FX && "bg-green-500/20 text-green-400",
                            asset.asset_class === AssetClasses.CRYPTO && "bg-purple-500/20 text-purple-400",
                          )}>
                            {asset.asset_class === AssetClasses.FX ? 'FOREX' : asset.asset_class.toUpperCase().substring(0, 6)}
                          </div>

                          {/* Ticker */}
                          <div className="font-semibold text-foreground text-sm w-20 flex-shrink-0">
                            {asset.ticker || assetId}
                          </div>

                          {/* Name - takes remaining space */}
                          <div className="flex-1 text-sm text-muted-foreground truncate min-w-0">
                            {asset.name}
                          </div>

                          {/* Exchange */}
                          <div className="text-xs text-muted-foreground/80 w-20 flex-shrink-0 text-right">
                            {asset.exchange || '-'}
                          </div>

                          {/* Sector/Industry */}
                          {asset.sector && asset.sector !== 'N/A' && (
                            <div className="text-xs text-muted-foreground/80 w-32 flex-shrink-0 truncate text-right">
                              {asset.sector}
                            </div>
                          )}

                          {/* Selected Indicator */}
                          <div className="w-5 flex-shrink-0">
                            {isSelected && (
                              <svg
                                className="w-5 h-5 text-accent"
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
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Footer - showing result count */}
            <div className="bg-background/50 border-t border-border px-4 py-2 text-xs text-muted-foreground">
              {searchQuery ? (
                <span>Showing {filteredAssets.length} of {availableAssets.length} assets</span>
              ) : (
                <span>{filteredAssets.length} assets available</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AssetSelectorDialog
