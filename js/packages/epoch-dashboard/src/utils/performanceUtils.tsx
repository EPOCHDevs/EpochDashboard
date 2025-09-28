/**
 * Performance Utilities
 * Optimization utilities for charts and data processing
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'

// Debounce hook for performance optimization
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Throttle hook for performance optimization
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef<number>(0)
  const timeout = useRef<NodeJS.Timeout>()

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRan.current >= delay) {
        callback(...args)
        lastRan.current = Date.now()
      } else {
        clearTimeout(timeout.current)
        timeout.current = setTimeout(() => {
          callback(...args)
          lastRan.current = Date.now()
        }, delay - (Date.now() - lastRan.current))
      }
    }) as T,
    [callback, delay]
  )
}

// Virtual scrolling hook
export interface VirtualScrolling {
  containerHeight: number
  itemHeight: number
  itemCount: number
  overscan?: number
}

export interface VirtualScrollResult {
  startIndex: number
  endIndex: number
  visibleItems: number[]
  containerProps: {
    style: React.CSSProperties
    onScroll: (event: React.UIEvent<HTMLDivElement>) => void
  }
  itemProps: (index: number) => {
    style: React.CSSProperties
    key: string | number
  }
}

export function useVirtualScrolling({
  containerHeight,
  itemHeight,
  itemCount,
  overscan = 5
}: VirtualScrolling): VirtualScrollResult {
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = Array.from(
    { length: endIndex - startIndex + 1 },
    (_, i) => startIndex + i
  )

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop)
  }, [])

  const containerProps = {
    style: {
      height: containerHeight,
      overflow: 'auto' as const
    },
    onScroll: handleScroll
  }

  const itemProps = useCallback((index: number) => ({
    style: {
      position: 'absolute' as const,
      top: index * itemHeight,
      left: 0,
      right: 0,
      height: itemHeight
    },
    key: index
  }), [itemHeight])

  return {
    startIndex,
    endIndex,
    visibleItems,
    containerProps,
    itemProps
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  private maxSamples: number = 100

  constructor(maxSamples: number = 100) {
    this.maxSamples = maxSamples
  }

  // Start timing an operation
  startTiming(operation: string): () => void {
    const startTime = performance.now()

    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      this.recordMetric(operation, duration)
    }
  }

  // Record a metric value
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    const values = this.metrics.get(name)!
    values.push(value)

    // Keep only the most recent samples
    if (values.length > this.maxSamples) {
      values.shift()
    }
  }

  // Get metric statistics
  getMetricStats(name: string): {
    count: number
    average: number
    min: number
    max: number
    p50: number
    p95: number
    p99: number
  } | null {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) return null

    const sorted = [...values].sort((a, b) => a - b)
    const count = sorted.length
    const sum = sorted.reduce((a, b) => a + b, 0)

    return {
      count,
      average: sum / count,
      min: sorted[0],
      max: sorted[count - 1],
      p50: sorted[Math.floor(count * 0.5)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)]
    }
  }

  // Get all metrics
  getAllMetrics(): Record<string, ReturnType<typeof this.getMetricStats>> {
    const result: Record<string, ReturnType<typeof this.getMetricStats>> = {}

    for (const name of this.metrics.keys()) {
      result[name] = this.getMetricStats(name)
    }

    return result
  }

  // Clear metrics
  clear(): void {
    this.metrics.clear()
  }
}

// Global performance monitor
export const performanceMonitor = new PerformanceMonitor()

// Memory usage utilities
export function getMemoryUsage(): {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
} | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    }
  }
  return null
}

// Frame rate monitoring
export class FrameRateMonitor {
  private frameCount = 0
  private lastTime = 0
  private fps = 0
  private isRunning = false

  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.lastTime = performance.now()
    this.frameCount = 0
    this.tick()
  }

  stop(): void {
    this.isRunning = false
  }

  getFPS(): number {
    return this.fps
  }

  private tick = (): void => {
    if (!this.isRunning) return

    this.frameCount++
    const currentTime = performance.now()
    const elapsed = currentTime - this.lastTime

    if (elapsed >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / elapsed)
      this.frameCount = 0
      this.lastTime = currentTime
    }

    requestAnimationFrame(this.tick)
  }
}

// Data processing optimization utilities
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

// Async processing with yielding
export async function processDataAsync<T, R>(
  data: T[],
  processor: (item: T, index: number) => R,
  chunkSize: number = 1000
): Promise<R[]> {
  const result: R[] = []
  const chunks = chunkArray(data, chunkSize)

  for (const chunk of chunks) {
    // Process chunk
    const chunkResults = chunk.map(processor)
    result.push(...chunkResults)

    // Yield to browser
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  return result
}

// Worker pool for heavy computations
export class WorkerPool {
  private workers: Worker[] = []
  private activeWorkers = 0
  private queue: Array<{
    data: any
    resolve: (value: any) => void
    reject: (error: any) => void
  }> = []

  constructor(
    private workerScript: string,
    private maxWorkers: number = navigator.hardwareConcurrency || 4
  ) {}

  async execute<T, R>(data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ data, resolve, reject })
      this.processQueue()
    })
  }

  private processQueue(): void {
    if (this.queue.length === 0 || this.activeWorkers >= this.maxWorkers) {
      return
    }

    const task = this.queue.shift()!
    let worker = this.getAvailableWorker()

    if (!worker) {
      worker = this.createWorker()
    }

    this.activeWorkers++

    worker.postMessage(task.data)

    const handleMessage = (event: MessageEvent) => {
      this.activeWorkers--
      worker.removeEventListener('message', handleMessage)
      worker.removeEventListener('error', handleError)
      task.resolve(event.data)
      this.processQueue()
    }

    const handleError = (error: ErrorEvent) => {
      this.activeWorkers--
      worker.removeEventListener('message', handleMessage)
      worker.removeEventListener('error', handleError)
      task.reject(error)
      this.processQueue()
    }

    worker.addEventListener('message', handleMessage)
    worker.addEventListener('error', handleError)
  }

  private getAvailableWorker(): Worker | null {
    return this.workers.find(() => this.activeWorkers < this.maxWorkers) || null
  }

  private createWorker(): Worker {
    const worker = new Worker(this.workerScript)
    this.workers.push(worker)
    return worker
  }

  destroy(): void {
    this.workers.forEach(worker => worker.terminate())
    this.workers = []
    this.queue = []
    this.activeWorkers = 0
  }
}

// Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefCallback<Element>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const observer = useRef<IntersectionObserver>()

  const ref = useCallback((element: Element | null) => {
    if (observer.current) {
      observer.current.disconnect()
    }

    if (element) {
      observer.current = new IntersectionObserver(([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      }, options)

      observer.current.observe(element)
    }
  }, [options])

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [])

  return [ref, isIntersecting]
}

// Performance-aware component wrapper
export function withPerformanceMonitoring<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
): React.ComponentType<T> {
  return function PerformanceMonitoredComponent(props: T) {
    const renderStart = useRef<number>()

    useEffect(() => {
      renderStart.current = performance.now()
    })

    useEffect(() => {
      if (renderStart.current) {
        const renderTime = performance.now() - renderStart.current
        performanceMonitor.recordMetric(`${componentName}_render`, renderTime)
      }
    })

    return <Component {...props} />
  }
}

// Batch state updates
export function useBatchedUpdates() {
  const [, forceUpdate] = useState({})
  const pendingUpdates = useRef<(() => void)[]>([])
  const isScheduled = useRef(false)

  const batchUpdate = useCallback((updateFn: () => void) => {
    pendingUpdates.current.push(updateFn)

    if (!isScheduled.current) {
      isScheduled.current = true

      requestAnimationFrame(() => {
        const updates = pendingUpdates.current
        pendingUpdates.current = []
        isScheduled.current = false

        updates.forEach(update => update())
        forceUpdate({})
      })
    }
  }, [])

  return batchUpdate
}

// Resource pooling for reusable objects
export class ObjectPool<T> {
  private available: T[] = []
  private createFn: () => T
  private resetFn?: (obj: T) => void

  constructor(createFn: () => T, resetFn?: (obj: T) => void, initialSize = 10) {
    this.createFn = createFn
    this.resetFn = resetFn

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.createFn())
    }
  }

  acquire(): T {
    const obj = this.available.pop()
    if (obj) {
      return obj
    }
    return this.createFn()
  }

  release(obj: T): void {
    if (this.resetFn) {
      this.resetFn(obj)
    }
    this.available.push(obj)
  }

  clear(): void {
    this.available = []
  }

  size(): { available: number; total: number } {
    return {
      available: this.available.length,
      total: this.available.length // Note: total would need tracking in a real implementation
    }
  }
}

export default {
  useDebounce,
  useThrottle,
  useVirtualScrolling,
  useIntersectionObserver,
  useBatchedUpdates,
  PerformanceMonitor,
  FrameRateMonitor,
  WorkerPool,
  ObjectPool,
  performanceMonitor,
  withPerformanceMonitoring,
  processDataAsync,
  chunkArray,
  getMemoryUsage
}