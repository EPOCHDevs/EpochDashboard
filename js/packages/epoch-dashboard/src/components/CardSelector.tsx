import React, { useState, useMemo, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import SelectorCard from './SelectorCard'
import { SelectorMetadata, CardRowData } from '../types/SelectorTypes'
import { useSelectorData } from '../hooks/useSelectorData'

export interface CardSelectorProps {
  campaignId: string
  userId: string
  assetId: string
  selectorIndex: number
  apiEndpoint: string
  metadata?: SelectorMetadata // Optional: pass metadata directly if already fetched
  onCardClick?: (rowData: CardRowData, index: number) => void
  className?: string
}

const CardSelector: React.FC<CardSelectorProps> = ({
  campaignId,
  userId,
  assetId,
  selectorIndex,
  apiEndpoint,
  metadata,
  onCardClick,
  className = '',
}) => {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null)
  const parentRef = useRef<HTMLDivElement>(null)

  // Fetch selector data with infinite scroll
  const { data, total, isLoading, isLoadingMore, error, hasMore, loadMore } = useSelectorData({
    campaignId,
    userId,
    assetId,
    selectorIndex,
    apiEndpoint,
    enabled: true,
    infiniteScroll: true,
  })

  // Intersection observer to trigger loading more items
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px', // Start loading 100px before reaching the bottom
  })

  // Load more when the sentinel comes into view
  React.useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      loadMore()
    }
  }, [inView, hasMore, isLoading, isLoadingMore, loadMore])

  // Use provided metadata schemas
  const schemas = useMemo(() => {
    return metadata?.schemas || []
  }, [metadata])

  const displayTitle = useMemo(() => {
    return metadata?.title || 'Cards'
  }, [metadata])

  // Handle card click
  const handleCardClick = (rowData: CardRowData, index: number) => {
    setSelectedCardIndex(index)
    if (onCardClick) {
      onCardClick(rowData, index)
    }
  }

  // Handle card expansion toggle - only allow one card expanded at a time
  const toggleCardExpansion = (index: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setExpandedCardIndex((prev) => (prev === index ? null : index))
  }

  if (isLoading) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-accent" />
          <p className="text-xs text-muted-foreground">Loading cards...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex h-full w-full items-center justify-center p-4 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-destructive mb-2">Error loading cards</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className={`flex h-full w-full items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-6 h-6 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">No cards found</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-full flex-col flex-1 overflow-hidden ${className}`}>
      {/* Cards list */}
      <div
        className="hide-scrollbar relative w-full flex-1 overflow-y-auto overflow-x-hidden px-5 py-4"
        ref={parentRef}
        style={{
          transform: 'none',
          WebkitTransform: 'none',
          willChange: 'scroll-position',
        }}
      >
        <div
          className="relative flex w-full flex-col gap-3"
          style={{
            transform: 'none',
            WebkitTransform: 'none',
          }}
        >
          {data.map((rowData, index) => (
            <SelectorCard
              key={rowData.index ?? index}
              schemas={schemas}
              rowData={rowData}
              isSelected={selectedCardIndex === index}
              isExpanded={expandedCardIndex === index}
              onClick={() => handleCardClick(rowData, index)}
              onToggleExpand={(e) => toggleCardExpansion(index, e)}
            />
          ))}

          {/* Loading more indicator */}
          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-accent" />
            </div>
          )}

          {/* Infinite scroll sentinel */}
          {hasMore && !isLoadingMore && (
            <div ref={loadMoreRef} className="h-4 w-full" />
          )}

          {/* All items loaded message */}
          {!hasMore && data && data.length > 0 && (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground">All items loaded</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CardSelector
