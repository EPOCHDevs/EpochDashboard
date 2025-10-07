import React, { useState, useRef, useEffect } from 'react'
import { GetTradeAnalyticsMetadataResponseType } from '../../../../packages/epoch-dashboard/src/types/TradeAnalyticsTypes'

interface TimeframeDropdownProps {
  metadata?: GetTradeAnalyticsMetadataResponseType
  selectedAssetId: string
  selectedTimeframe: string
  onTimeframeChange: (timeframe: string) => void
}

export const TimeframeDropdown: React.FC<TimeframeDropdownProps> = ({
  metadata,
  selectedAssetId,
  selectedTimeframe,
  onTimeframeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Get available timeframes for current asset from metadata
  const availableTimeframes = metadata?.asset_info[selectedAssetId]?.timeframes || []

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-card hover:bg-muted/50 border border-border rounded text-foreground text-sm font-medium transition-all"
      >
        <span>{selectedTimeframe}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 mt-2 w-40 bg-card border border-border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
        >
          <div className="py-1">
            {availableTimeframes.length > 0 ? (
              availableTimeframes.map((tfInfo) => {
                const isSelected = tfInfo.timeframe === selectedTimeframe
                return (
                  <button
                    key={tfInfo.timeframe}
                    onClick={() => {
                      onTimeframeChange(tfInfo.timeframe)
                      setIsOpen(false)
                    }}
                    className={`w-full px-4 py-2 text-left hover:bg-muted/50 transition-all flex items-center justify-between ${
                      isSelected ? 'bg-accent/20' : ''
                    }`}
                  >
                    <span className="text-foreground text-sm">
                      {tfInfo.timeframe}
                    </span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-accent"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                )
              })
            ) : (
              <div className="px-4 py-2 text-muted-foreground text-sm">
                No timeframes available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeframeDropdown