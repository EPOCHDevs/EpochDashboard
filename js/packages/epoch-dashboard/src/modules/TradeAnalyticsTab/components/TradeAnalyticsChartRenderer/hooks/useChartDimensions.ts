import { useEffect, useState, RefObject } from 'react'

export interface ChartDimensions {
  height: number
  width: number
}

/**
 * Custom hook to track chart container dimensions using ResizeObserver
 * Provides real-time dimension updates for responsive chart rendering
 */
export const useChartDimensions = (
  containerRef: RefObject<HTMLDivElement>
): ChartDimensions => {
  const [height, setHeight] = useState(0)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const newHeight = containerRef.current.clientHeight
        const newWidth = containerRef.current.clientWidth

        // Only update if dimensions actually changed to avoid unnecessary rerenders
        if (newHeight !== height || newWidth !== width) {
          setHeight(newHeight)
          setWidth(newWidth)
        }
      }
    }

    // Initial dimension update
    updateDimensions()

    // Use ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions()
    })

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    // Also listen to window resize as fallback
    window.addEventListener('resize', updateDimensions)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateDimensions)
    }
  }, [containerRef, height, width])

  return { height, width }
}
