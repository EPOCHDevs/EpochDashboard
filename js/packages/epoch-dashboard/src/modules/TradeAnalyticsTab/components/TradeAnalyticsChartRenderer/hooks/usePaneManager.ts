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
 * Filters panes based on activeYAxisIndices and redistributes space
 */
export const usePaneManager = (
  timeframeConfig: ChartInfoType | undefined,
  activeYAxisIndices?: Set<number>
): PaneState[] => {
  const [paneStates, setPaneStates] = useState<PaneState[]>([])

  // Initialize pane states from timeframe config
  useEffect(() => {
    if (timeframeConfig?.yAxis && timeframeConfig.yAxis.length > 0) {
      // First, create all panes
      const allPaneStates: PaneState[] = timeframeConfig.yAxis.map((axis: any, index: number) => {
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

      // Instead of filtering panes, mark them as hidden by making them very small
      // This prevents Highcharts Error #18 by keeping yAxis indices stable
      let updatedPanes: PaneState[]

      if (activeYAxisIndices && activeYAxisIndices.size > 0) {
        // Calculate visible panes and hidden panes
        const visiblePanes = allPaneStates.filter((pane, index) => {
          return index === 0 || activeYAxisIndices.has(index)
        })
        const hiddenPanes = allPaneStates.filter((pane, index) => {
          return index !== 0 && !activeYAxisIndices.has(index)
        })

        // Calculate total height available for visible panes (leave 1% per hidden pane)
        const totalOriginalHeight = allPaneStates.reduce((sum, pane) => sum + pane.height, 0)
        const hiddenPaneReservedHeight = hiddenPanes.length * 1 // 1% per hidden pane
        const availableHeight = totalOriginalHeight - hiddenPaneReservedHeight

        // Redistribute available height among visible panes
        const totalVisibleOriginalHeight = visiblePanes.reduce((sum, pane) => sum + pane.height, 0)

        updatedPanes = allPaneStates.map((pane, index) => {
          const isVisible = index === 0 || activeYAxisIndices.has(index)

          if (!isVisible) {
            // Hidden pane: make it 0% height (completely invisible)
            return {
              ...pane,
              height: 0,
            }
          } else {
            // Visible pane: redistribute full height proportionally
            if (totalVisibleOriginalHeight > 0) {
              const proportion = pane.height / totalVisibleOriginalHeight
              return {
                ...pane,
                height: totalOriginalHeight * proportion,
              }
            }
            return pane
          }
        })

        // Recalculate top positions to stack all panes (including hidden ones)
        let currentTop = 0
        updatedPanes = updatedPanes.map((pane) => {
          const updatedPane = {
            ...pane,
            top: currentTop,
          }
          currentTop += pane.height
          return updatedPane
        })
      } else {
        // If no activeYAxisIndices provided, show all panes with original heights
        updatedPanes = allPaneStates
      }

      setPaneStates(updatedPanes)
    }
  }, [timeframeConfig, activeYAxisIndices])

  return paneStates
}
