import { Table, DataType } from "apache-arrow"

export interface DataCacheEntry {
  data: Table<Record<string | number | symbol, DataType>>
  timeRange: { from: number; to: number }
  timestamp: number
  size: number // Estimated memory footprint in bytes
  accessCount: number
  lastAccessed: number
}

export interface DataFetchRequest {
  strategyId: string
  assetId: string
  timeframe: string
  from_ms?: number
  to_ms?: number
  pivot?: number
  pad_front?: number
  pad_back?: number
}

export interface DataRange {
  from: number
  to: number
}

export class DataCacheManager {
  private cache: Map<string, DataCacheEntry> = new Map()
  private readonly maxCacheSize: number = 50 * 1024 * 1024 // 50MB
  private readonly maxCacheEntries: number = 10
  private totalSize = 0

  /**
   * Generates a cache key for a data request
   */
  private getCacheKey(request: DataFetchRequest): string {
    const { strategyId, assetId, timeframe, from_ms, to_ms, pivot, pad_front, pad_back } = request
    return `${strategyId}_${assetId}_${timeframe}_${from_ms || "none"}_${to_ms || "none"}_${pivot || "none"}_${pad_front || "none"}_${pad_back || "none"}`
  }

  /**
   * Estimates the memory footprint of Apache Arrow table data
   */
  private estimateDataSize(data: Table<Record<string | number | symbol, DataType>>): number {
    // Rough estimation: numRows * numColumns * average bytes per cell
    const numRows = data.numRows
    const numCols = data.numCols
    const estimatedBytesPerCell = 8 // Average for mixed data types
    return numRows * numCols * estimatedBytesPerCell
  }

  /**
   * Checks if a time range is covered by existing cached data
   */
  private findCoveringEntry(
    request: DataFetchRequest,
    targetRange: DataRange
  ): DataCacheEntry | null {
    const cacheEntries = Array.from(this.cache.values()).filter((entry) => {
      // Must be same strategy, asset, and timeframe
      const entryKey = this.getCacheKey({
        strategyId: request.strategyId,
        assetId: request.assetId,
        timeframe: request.timeframe,
        from_ms: entry.timeRange.from,
        to_ms: entry.timeRange.to,
      })
      return entryKey.startsWith(`${request.strategyId}_${request.assetId}_${request.timeframe}`)
    })

    // Find entry that covers the target range
    return (
      cacheEntries.find(
        (entry) => entry.timeRange.from <= targetRange.from && entry.timeRange.to >= targetRange.to
      ) || null
    )
  }

  /**
   * Evicts least recently used entries to make space
   */
  private evictLRUEntries(requiredSpace: number): void {
    // Sort by last accessed time (ascending)
    const sortedEntries = Array.from(this.cache.entries()).sort(
      ([, a], [, b]) => a.lastAccessed - b.lastAccessed
    )

    let freedSpace = 0
    for (const [key, entry] of sortedEntries) {
      if (freedSpace >= requiredSpace && this.cache.size <= this.maxCacheEntries) {
        break
      }

      this.cache.delete(key)
      this.totalSize -= entry.size
      freedSpace += entry.size
    }
  }

  /**
   * Checks if we can cache a new entry
   */
  private canCacheNewEntry(estimatedSize: number): boolean {
    if (this.totalSize + estimatedSize > this.maxCacheSize) {
      // Try to free up space
      this.evictLRUEntries(estimatedSize)
    }

    return this.totalSize + estimatedSize <= this.maxCacheSize
  }

  /**
   * Caches data from a successful fetch
   */
  public cacheData(
    request: DataFetchRequest,
    data: Table<Record<string | number | symbol, DataType>>
  ): void {
    const key = this.getCacheKey(request)
    const size = this.estimateDataSize(data)

    if (!this.canCacheNewEntry(size)) {
      console.warn("Cannot cache data: would exceed memory limits")
      return
    }

    const entry: DataCacheEntry = {
      data,
      timeRange: {
        from: request.from_ms || request.pivot || 0,
        to: request.to_ms || request.pivot || Date.now(),
      },
      timestamp: Date.now(),
      size,
      accessCount: 1,
      lastAccessed: Date.now(),
    }

    // Remove existing entry if it exists
    if (this.cache.has(key)) {
      const existingEntry = this.cache.get(key)
      if (existingEntry) {
        this.totalSize -= existingEntry.size
      }
    }

    this.cache.set(key, entry)
    this.totalSize += size
  }

  /**
   * Retrieves cached data if available and covers the requested range
   */
  public getCachedData(
    request: DataFetchRequest,
    targetRange?: DataRange
  ): Table<Record<string | number | symbol, DataType>> | null {
    // First try exact match
    const exactKey = this.getCacheKey(request)
    if (this.cache.has(exactKey)) {
      const entry = this.cache.get(exactKey)
      if (entry) {
        entry.accessCount++
        entry.lastAccessed = Date.now()
        return entry.data
      }
    }

    // If target range is specified, look for covering entries
    if (targetRange) {
      const coveringEntry = this.findCoveringEntry(request, targetRange)
      if (coveringEntry) {
        coveringEntry.accessCount++
        coveringEntry.lastAccessed = Date.now()

        // TODO: Implement data slicing to return only the requested range
        // For now, return the full dataset (client will handle range filtering)
        return coveringEntry.data
      }
    }

    return null
  }

  /**
   * Determines if we need to fetch new data for a request
   */
  public needsFetch(request: DataFetchRequest, targetRange?: DataRange): boolean {
    if (targetRange) {
      const coveringEntry = this.findCoveringEntry(request, targetRange)
      return !coveringEntry
    }

    const exactKey = this.getCacheKey(request)
    return !this.cache.has(exactKey)
  }

  /**
   * Gets cache statistics for debugging
   */
  public getCacheStats(): {
    totalEntries: number
    totalSize: number
    maxSize: number
    hitRate: number
  } {
    const entries = Array.from(this.cache.values())
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0)
    const totalHits = entries.length > 0 ? totalAccesses - entries.length : 0 // Rough estimate

    return {
      totalEntries: this.cache.size,
      totalSize: this.totalSize,
      maxSize: this.maxCacheSize,
      hitRate: totalAccesses > 0 ? totalHits / totalAccesses : 0,
    }
  }

  /**
   * Clears all cached data
   */
  public clearCache(): void {
    this.cache.clear()
    this.totalSize = 0
  }

  /**
   * Removes cached data for a specific strategy
   */
  public clearStrategyCache(strategyId: string): void {
    const keysToRemove: string[] = []

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (key.startsWith(`${strategyId}_`)) {
        keysToRemove.push(key)
        this.totalSize -= entry.size
      }
    }

    keysToRemove.forEach((key) => this.cache.delete(key))
  }
}

// Singleton instance for global use
export const globalDataCacheManager = new DataCacheManager()