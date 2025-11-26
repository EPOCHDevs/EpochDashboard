import { useCallback, useEffect, useState } from 'react'
import type { ChartInfoType } from '../../../../../types/TradeAnalyticsTypes'

/**
 * Visibility state structure: { [timeframe]: { [seriesId]: boolean } }
 * Example: { "5m": { "rsi-1": true, "macd-1": false }, "1H": { "rsi-1": false } }
 */
export type IndicatorVisibilityState = Record<string, Record<string, boolean>>

interface UseIndicatorVisibilityParams {
  jobId: string | undefined
  selectedTimeframe: string | undefined
  timeframeConfig: ChartInfoType | undefined
}

interface UseIndicatorVisibilityReturn {
  visibilityState: Record<string, boolean> // Current timeframe's visibility state
  onToggleIndicator: (seriesId: string) => boolean // Returns false if max limit reached
  setIndicatorVisible: (seriesId: string, visible: boolean) => boolean // Returns false if max limit reached
  getVisibleCount: () => { visible: number; total: number }
  canShowMore: () => boolean
}

const STORAGE_KEY_PREFIX = 'ta-indicator-visibility'

// Types that should be visible by default (candlestick is always visible separately)
const DEFAULT_VISIBLE_TYPES = ['candlestick', 'column'] // column = volume

/**
 * Hook to manage indicator visibility state per timeframe with localStorage persistence
 */
export const useIndicatorVisibility = ({
  jobId,
  selectedTimeframe,
  timeframeConfig,
}: UseIndicatorVisibilityParams): UseIndicatorVisibilityReturn => {
  const [allVisibilityState, setAllVisibilityState] = useState<IndicatorVisibilityState>({})

  // Generate storage key based on jobId
  const storageKey = jobId ? `${STORAGE_KEY_PREFIX}-${jobId}` : null

  // Load from localStorage on mount or jobId change
  useEffect(() => {
    if (!storageKey) return

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as IndicatorVisibilityState
        setAllVisibilityState(parsed)
      }
    } catch (error) {
      console.error('Failed to load indicator visibility state:', error)
    }
  }, [storageKey])

  // Sync with timeframeConfig: ensure all series have visibility state
  useEffect(() => {
    if (!selectedTimeframe || !timeframeConfig?.series) return

    setAllVisibilityState((prev) => {
      const timeframeState = prev[selectedTimeframe] || {}
      let hasChanges = false

      // Add any new series that don't have visibility state
      const updatedTimeframeState = { ...timeframeState }

      timeframeConfig.series.forEach((seriesConfig) => {
        if (seriesConfig.id && updatedTimeframeState[seriesConfig.id] === undefined) {
          // Default visibility: only candlestick and volume (column) are visible initially
          const shouldBeVisible = DEFAULT_VISIBLE_TYPES.includes(seriesConfig.type)
          updatedTimeframeState[seriesConfig.id] = shouldBeVisible
          hasChanges = true
        }
      })

      if (!hasChanges) return prev

      return {
        ...prev,
        [selectedTimeframe]: updatedTimeframeState,
      }
    })
  }, [selectedTimeframe, timeframeConfig])

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (!storageKey) return

    try {
      localStorage.setItem(storageKey, JSON.stringify(allVisibilityState))
    } catch (error) {
      console.error('Failed to save indicator visibility state:', error)
    }
  }, [allVisibilityState, storageKey])

  // Get current timeframe's visibility state
  const visibilityState = selectedTimeframe ? allVisibilityState[selectedTimeframe] || {} : {}

  // Count visible indicators in current timeframe (excluding candlestick)
  const countVisibleIndicators = useCallback(
    (state: Record<string, boolean>) => {
      if (!timeframeConfig?.series) return 0
      return timeframeConfig.series.filter((seriesConfig) => {
        // Exclude candlestick from count
        if (seriesConfig.type === 'candlestick') return false
        if (!seriesConfig.id) return true
        return state[seriesConfig.id] ?? false // Default to hidden now
      }).length
    },
    [timeframeConfig]
  )

  // Check if we can show more indicators - no limit now
  const canShowMore = useCallback(() => {
    return true // No limit
  }, [])

  // Toggle visibility for a specific indicator
  const toggleIndicator = useCallback(
    (seriesId: string): boolean => {
      if (!selectedTimeframe) return false

      // Prevent toggling candlestick (always visible)
      const series = timeframeConfig?.series.find((s) => s.id === seriesId)
      if (series?.type === 'candlestick') {
        return false
      }

      setAllVisibilityState((prev) => {
        const timeframeState = prev[selectedTimeframe] || {}
        const currentValue = timeframeState[seriesId] ?? false // Default to hidden

        return {
          ...prev,
          [selectedTimeframe]: {
            ...timeframeState,
            [seriesId]: !currentValue,
          },
        }
      })

      return true
    },
    [selectedTimeframe, timeframeConfig]
  )

  // Set visibility for a specific indicator
  const setIndicatorVisible = useCallback(
    (seriesId: string, visible: boolean): boolean => {
      if (!selectedTimeframe) return false

      // Prevent changing candlestick visibility (always visible)
      const series = timeframeConfig?.series.find((s) => s.id === seriesId)
      if (series?.type === 'candlestick') {
        return visible
      }

      setAllVisibilityState((prev) => {
        const timeframeState = prev[selectedTimeframe] || {}
        return {
          ...prev,
          [selectedTimeframe]: {
            ...timeframeState,
            [seriesId]: visible,
          },
        }
      })

      return true
    },
    [selectedTimeframe, timeframeConfig]
  )

  // Get count of visible vs total indicators (excluding candlestick)
  const getVisibleCount = useCallback(() => {
    if (!timeframeConfig?.series) {
      return { visible: 0, total: 0 }
    }

    // Filter out candlestick from total count
    const allIndicators = timeframeConfig.series.filter((s) => s.type !== 'candlestick')
    const total = allIndicators.length

    const visible = allIndicators.filter((seriesConfig) => {
      if (!seriesConfig.id) return false
      return visibilityState[seriesConfig.id] ?? false // Default to hidden
    }).length

    return { visible, total }
  }, [timeframeConfig, visibilityState])

  return {
    visibilityState,
    onToggleIndicator: toggleIndicator,
    setIndicatorVisible,
    getVisibleCount,
    canShowMore,
  }
}
