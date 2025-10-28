import { useRef, useCallback } from 'react'
import { AxisSetExtremesEventObject } from 'highcharts'
import { globalDataCacheManager } from '../utils/DataCacheManager'

export interface LazyLoadingResult {
  previousViewportRangeRef: React.MutableRefObject<number | null>
  createAfterSetExtremesHandler: (params: {
    campaignId: string
    assetId: string
    selectedTimeframe: string
    isActuallyFetching: boolean
    onRangeExpansionNeeded?: (range: { from: number; to: number }) => void
  }) => (this: Highcharts.Axis, e: AxisSetExtremesEventObject) => void
}

/**
 * Custom hook to manage lazy loading logic
 * Creates the afterSetExtremes event handler for chart zoom/pan interactions
 *
 * Note: With full data fetching enabled, this hook mainly prevents unnecessary
 * expansion requests when all data is already cached.
 */
export const useLazyLoading = (): LazyLoadingResult => {
  const previousViewportRangeRef = useRef<number | null>(null)

  const createAfterSetExtremesHandler = useCallback(
    (params: {
      campaignId: string
      assetId: string
      selectedTimeframe: string
      isActuallyFetching: boolean
      onRangeExpansionNeeded?: (range: { from: number; to: number }) => void
    }) =>
      function (this: Highcharts.Axis, e: AxisSetExtremesEventObject) {
        const { campaignId, assetId, selectedTimeframe, isActuallyFetching, onRangeExpansionNeeded } = params

        // Guard 1: Only respond to user-initiated zoom actions
        const userTriggers = ['zoom', 'navigator', 'mousewheel', 'rangeSelectorButton']
        if (!e.trigger || !userTriggers.includes(e.trigger)) {
          return
        }

        // Guard 2: Don't trigger expansion if already fetching data from network
        if (isActuallyFetching) {
          return
        }

        // Guard 3: Must have expansion callback
        if (!onRangeExpansionNeeded) {
          return
        }

        const viewMin = e.min
        const viewMax = e.max
        const currentViewportRange = viewMax - viewMin

        // Track viewport size for zoom detection
        const previousRange = previousViewportRangeRef.current
        if (previousRange === null) {
          // First zoom - just record the range, don't trigger expansion
          previousViewportRangeRef.current = currentViewportRange
          return
        }

        const isZoomingIn = currentViewportRange < previousRange
        previousViewportRangeRef.current = currentViewportRange

        // Never trigger on zoom IN - we already have that data cached
        if (isZoomingIn) {
          return
        }

        // Check if full data is already loaded
        const cacheRequest = { strategyId: campaignId, assetId, timeframe: selectedTimeframe }
        const isFullyLoaded = globalDataCacheManager.isFullDataLoaded(cacheRequest)

        if (isFullyLoaded) {
          return
        }

        // If we reach here, we're zooming out and don't have full data
        // Check if we need to expand based on cached ranges
        const loadedRanges = globalDataCacheManager.getLoadedRanges(cacheRequest)

        if (loadedRanges.length === 0) {
          return
        }

        const cachedMin = Math.min(...loadedRanges.map((r) => r.from))
        const cachedMax = Math.max(...loadedRanges.map((r) => r.to))

        // Check if approaching cached data boundaries (50% threshold)
        const cachedRange = cachedMax - cachedMin
        const frontBuffer = cachedRange * 0.5
        const backBuffer = cachedRange * 0.5

        const approachingStart = viewMin < cachedMin + frontBuffer
        const approachingEnd = viewMax > cachedMax - backBuffer
        const needsExpansion = approachingStart || approachingEnd

        if (needsExpansion) {
          const viewportRange = viewMax - viewMin
          const expansionBuffer = viewportRange * 2.0
          const expansionFrom = viewMin - expansionBuffer
          const expansionTo = viewMax + expansionBuffer

          onRangeExpansionNeeded({ from: expansionFrom, to: expansionTo })
        }
      },
    []
  )

  return {
    previousViewportRangeRef,
    createAfterSetExtremesHandler,
  }
}
