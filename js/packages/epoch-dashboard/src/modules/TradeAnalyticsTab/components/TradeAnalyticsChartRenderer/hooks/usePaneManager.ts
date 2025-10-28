import { useEffect, useState } from 'react'
import { ChartInfoType } from '../../../../../types/TradeAnalyticsTypes'

export interface PaneState {
  id: string
  name: string
  collapsed: boolean
  height: number
  top: number
  originalHeight?: number
}

/**
 * Custom hook to manage pane states (collapsed/expanded, heights, positions)
 * Initializes panes based on timeframe configuration
 */
export const usePaneManager = (
  timeframeConfig: ChartInfoType | undefined
): PaneState[] => {
  const [paneStates, setPaneStates] = useState<PaneState[]>([])

  // Initialize pane states from timeframe config
  useEffect(() => {
    if (timeframeConfig?.yAxis && timeframeConfig.yAxis.length > 0) {
      const initialPaneStates: PaneState[] = timeframeConfig.yAxis.map((axis: any, index: number) => {
        // Try to determine pane name from series that use this yAxis
        const seriesForThisAxis = timeframeConfig.series.filter((series: any) => series.yAxis === index)
        let paneName = `Pane ${index + 1}`

        if (seriesForThisAxis.length > 0) {
          const firstSeries = seriesForThisAxis[0]
          if (firstSeries.type === 'candlestick') {
            paneName = 'Price'
          } else if (
            firstSeries.type === 'column' &&
            firstSeries.name?.toLowerCase().includes('volume')
          ) {
            paneName = 'Volume'
          } else if (firstSeries.name) {
            paneName = firstSeries.name
          }
        }

        const height = axis.height || 70 // Default height if not specified
        const top = axis.top !== undefined ? axis.top : index * 35 // Default top if not specified

        // Only keep Price (index 0) and Volume (index 1) panes expanded by default
        // All other panes (TradeSignal, etc.) should be collapsed by default
        const shouldCollapse = index > 1

        return {
          id: `pane-${index}`,
          name: paneName,
          collapsed: shouldCollapse,
          height,
          top,
          originalHeight: height,
        }
      })

      setPaneStates(initialPaneStates)
    }
  }, [timeframeConfig])

  return paneStates
}
