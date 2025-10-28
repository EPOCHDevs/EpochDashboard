import { useEffect, useState } from 'react'
import { GetTradeAnalyticsMetadataResponseType } from '../../../../../types/TradeAnalyticsTypes'

export interface TimeframeManagerResult {
  selectedTimeframe: string
  isTimeframeSwitching: boolean
  chartKey: string
}

/**
 * Custom hook to manage timeframe state and switching logic
 * Handles both controlled (prop) and uncontrolled (internal) timeframe state
 */
export const useTimeframeManager = (
  assetId: string,
  timeframeProp: string | undefined,
  tradeAnalyticsMetadata: GetTradeAnalyticsMetadataResponseType | undefined
): TimeframeManagerResult => {
  const [internalTimeframe, setInternalTimeframe] = useState<string>('')
  const [chartKey, setChartKey] = useState<string>('')
  const [isTimeframeSwitching, setIsTimeframeSwitching] = useState(false)

  // Use the prop timeframe if provided, otherwise use internal state
  const selectedTimeframe = timeframeProp || internalTimeframe

  // Initialize or reset timeframe from metadata whenever asset changes
  useEffect(() => {
    // Only manage internal timeframe if no prop is provided
    if (!timeframeProp && assetId && tradeAnalyticsMetadata?.asset_info?.[assetId]) {
      const assetInfo = tradeAnalyticsMetadata.asset_info[assetId]
      const defaultTf = assetInfo.timeframes[0]?.timeframe
      const currentTfValid = internalTimeframe && tradeAnalyticsMetadata.chart_info?.[internalTimeframe]

      // Only update if we don't have a valid timeframe
      if (defaultTf && !currentTfValid) {
        setInternalTimeframe(defaultTf)
      }
    }
  }, [assetId, tradeAnalyticsMetadata, timeframeProp, internalTimeframe])

  // Ensure timeframe matches the selected asset; update if not present in new asset
  useEffect(() => {
    // Only manage internal timeframe if no prop is provided
    if (!timeframeProp && assetId && tradeAnalyticsMetadata?.asset_info?.[assetId] && internalTimeframe) {
      const tfs = tradeAnalyticsMetadata.asset_info[assetId].timeframes
      const isValidForAsset = tfs.some((tf) => tf.timeframe === internalTimeframe)

      // Only update if current timeframe is invalid for this asset
      if (!isValidForAsset && tfs[0]?.timeframe) {
        setInternalTimeframe(tfs[0].timeframe)
      }
    }
  }, [assetId, tradeAnalyticsMetadata, timeframeProp, internalTimeframe])

  // Handle timeframe/asset switching with debouncing
  useEffect(() => {
    setIsTimeframeSwitching(true)

    // Force immediate chart key update to recreate chart with clean state
    setChartKey(`${selectedTimeframe}-${assetId}-${Date.now()}`)

    // Short delay before marking switching as complete
    const timeoutId = setTimeout(() => {
      setIsTimeframeSwitching(false)
    }, 50)

    return () => clearTimeout(timeoutId)
  }, [selectedTimeframe, assetId])

  return {
    selectedTimeframe,
    isTimeframeSwitching,
    chartKey,
  }
}
