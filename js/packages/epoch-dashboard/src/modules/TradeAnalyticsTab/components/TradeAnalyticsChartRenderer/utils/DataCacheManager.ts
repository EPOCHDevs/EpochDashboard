import { Table, DataType } from "apache-arrow"

export interface DataRange {
  from: number
  to: number
}

export interface DataCacheEntry {
  data: Table<Record<string | number | symbol, DataType>>
  loadedRanges: DataRange[] // Track all loaded time ranges (can be non-contiguous)
  absoluteBounds?: DataRange // Hard limits from backend metadata
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

export class DataCacheManager {
  private cache: Map<string, DataCacheEntry> = new Map()
  private readonly maxCacheSize: number = 50 * 1024 * 1024 // 50MB
  private readonly maxCacheEntries: number = 10
  private totalSize = 0

  /**
   * Generates a cache key for a data request
   * Single cache entry per strategy/asset/timeframe combination
   */
  private getCacheKey(request: DataFetchRequest): string {
    return `${request.strategyId}_${request.assetId}_${request.timeframe}`
  }

  /**
   * Merges overlapping or adjacent ranges and sorts them
   */
  private mergeRanges(ranges: DataRange[]): DataRange[] {
    if (ranges.length === 0) return []

    // Sort by start time
    const sorted = [...ranges].sort((a, b) => a.from - b.from)
    const merged: DataRange[] = [sorted[0]]

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i]
      const last = merged[merged.length - 1]

      // Check if ranges overlap or are adjacent (within 1ms)
      if (current.from <= last.to + 1) {
        // Merge by extending the last range
        last.to = Math.max(last.to, current.to)
      } else {
        // No overlap, add as new range
        merged.push(current)
      }
    }

    return merged
  }

  /**
   * Checks if a target range is fully covered by loaded ranges
   */
  private isRangeCovered(loadedRanges: DataRange[], targetRange: DataRange): boolean {
    for (const loaded of loadedRanges) {
      if (loaded.from <= targetRange.from && loaded.to >= targetRange.to) {
        return true
      }
    }
    return false
  }

  /**
   * Finds missing ranges that need to be fetched
   */
  private findMissingRanges(loadedRanges: DataRange[], targetRange: DataRange): DataRange[] {
    if (loadedRanges.length === 0) {
      return [targetRange]
    }

    const missing: DataRange[] = []
    let currentFrom = targetRange.from

    // Sort loaded ranges by start time
    const sorted = [...loadedRanges].sort((a, b) => a.from - b.from)

    for (const loaded of sorted) {
      // Check if there's a gap before this loaded range
      if (currentFrom < loaded.from) {
        missing.push({
          from: currentFrom,
          to: Math.min(loaded.from - 1, targetRange.to)
        })
      }

      // Move current pointer past this loaded range
      currentFrom = Math.max(currentFrom, loaded.to + 1)

      // If we've covered the entire target range, we're done
      if (currentFrom > targetRange.to) {
        break
      }
    }

    // Check if there's a gap after all loaded ranges
    if (currentFrom <= targetRange.to) {
      missing.push({
        from: currentFrom,
        to: targetRange.to
      })
    }

    return missing
  }

  /**
   * Merges two Arrow tables by combining rows and sorting by index column
   */
  private mergeArrowTables(
    existing: Table<Record<string | number | symbol, DataType>>,
    newData: Table<Record<string | number | symbol, DataType>>
  ): Table<Record<string | number | symbol, DataType>> {
    try {
      // Get the index column (timestamp)
      const existingIndex = existing.getChild('index')
      const newIndex = newData.getChild('index')

      if (!existingIndex || !newIndex) {
        return newData
      }

      // Create a map to store unique rows by timestamp
      const rowMap = new Map<number, any>()

      // Add existing data
      for (let i = 0; i < existing.numRows; i++) {
        const timestamp = existingIndex.get(i)
        const timestampNum = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp as number

        const row: any = {}
        for (const field of existing.schema.fields) {
          const column = existing.getChild(field.name)
          row[field.name] = column?.get(i)
        }
        rowMap.set(timestampNum, row)
      }

      // Add/overwrite with new data
      for (let i = 0; i < newData.numRows; i++) {
        const timestamp = newIndex.get(i)
        const timestampNum = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp as number

        const row: any = {}
        for (const field of newData.schema.fields) {
          const column = newData.getChild(field.name)
          row[field.name] = column?.get(i)
        }
        rowMap.set(timestampNum, row)
      }

      // Sort by timestamp
      const sortedEntries = Array.from(rowMap.entries()).sort((a, b) => a[0] - b[0])


      // Build columnar data from sorted rows
      const columnData: Record<string, any[]> = {}
      const fields = newData.schema.fields

      // Initialize column arrays
      for (const field of fields) {
        columnData[field.name] = []
      }

      // Fill columns with sorted row data
      for (const [_, row] of sortedEntries) {
        for (const field of fields) {
          columnData[field.name].push(row[field.name])
        }
      }

      // Use Apache Arrow's tableFromArrays to create new table
      const { tableFromArrays } = require('apache-arrow')
      const mergedTable = tableFromArrays(columnData)

      return mergedTable
    } catch (error) {
      console.error('Error merging Arrow tables:', error)
      console.error('Falling back to concatenation without deduplication')

      // Fallback: just concatenate the tables
      // This may result in duplicate timestamps but at least preserves all data
      try {
        const { tableFromIPC, tableToIPC } = require('apache-arrow')
        // Simple concatenation - convert both to batches and combine
        const combined = [...existing.batches, ...newData.batches]
        // Create new table from combined batches with the existing schema
        const concatenated = new (require('apache-arrow').Table)(existing.schema, combined)
        return concatenated
      } catch (concatError) {
        console.error('Concatenation also failed:', concatError)
        return newData
      }
    }
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
   * Caches data from a successful fetch, merging with existing data if present
   */
  public cacheData(
    request: DataFetchRequest,
    data: Table<Record<string | number | symbol, DataType>>
  ): void {
    const key = this.getCacheKey(request)
    const existingEntry = this.cache.get(key)

    // Calculate the time range of the new data
    const indexColumn = data.getChild('index')
    if (!indexColumn || data.numRows === 0) {
      return
    }

    const firstIndex = indexColumn.get(0)
    const lastIndex = indexColumn.get(data.numRows - 1)
    const newDataRange: DataRange = {
      from: typeof firstIndex === 'bigint' ? Number(firstIndex) : firstIndex as number,
      to: typeof lastIndex === 'bigint' ? Number(lastIndex) : lastIndex as number
    }

    let finalData = data
    let finalLoadedRanges: DataRange[] = [newDataRange]
    let finalSize = this.estimateDataSize(data)

    if (existingEntry && existingEntry.loadedRanges.length > 0) {
      // Merge with existing data (skip if existing entry is just a placeholder with no data)
      finalData = this.mergeArrowTables(existingEntry.data, data)
      finalLoadedRanges = this.mergeRanges([...existingEntry.loadedRanges, newDataRange])
      finalSize = this.estimateDataSize(finalData)

      // Update total size (remove old, add new)
      this.totalSize -= existingEntry.size
    }

    // Check if we can cache the final data
    if (!this.canCacheNewEntry(finalSize)) {
      if (existingEntry) {
        this.totalSize += existingEntry.size // Restore old size
      }
      return
    }

    const entry: DataCacheEntry = {
      data: finalData,
      loadedRanges: finalLoadedRanges,
      absoluteBounds: existingEntry?.absoluteBounds, // Preserve absolute bounds
      timestamp: Date.now(),
      size: finalSize,
      accessCount: existingEntry ? existingEntry.accessCount + 1 : 1,
      lastAccessed: Date.now(),
    }

    this.cache.set(key, entry)
    this.totalSize += finalSize
  }

  /**
   * Retrieves cached data if available
   * Returns null if no data exists or if entry is just a placeholder
   */
  public getCachedData(
    request: DataFetchRequest
  ): Table<Record<string | number | symbol, DataType>> | null {
    const key = this.getCacheKey(request)
    const entry = this.cache.get(key)

    if (entry && entry.loadedRanges.length > 0) {
      // Only return data if we have actual loaded ranges (not just a placeholder)
      entry.accessCount++
      entry.lastAccessed = Date.now()
      return entry.data
    }

    return null
  }

  /**
   * Gets the loaded ranges for a cached entry
   */
  public getLoadedRanges(request: DataFetchRequest): DataRange[] {
    const key = this.getCacheKey(request)
    const entry = this.cache.get(key)
    return entry ? entry.loadedRanges : []
  }

  /**
   * Determines if we need to fetch new data for a request
   * Returns true if we have no cached data at all
   */
  public needsFetch(request: DataFetchRequest): boolean {
    const key = this.getCacheKey(request)
    return !this.cache.has(key)
  }

  /**
   * Checks if a target range needs data to be fetched (range expansion)
   * Returns the missing ranges that need to be fetched
   */
  public needsRangeExpansion(request: DataFetchRequest, targetRange: DataRange): DataRange[] {
    const key = this.getCacheKey(request)
    const entry = this.cache.get(key)

    // Clamp target range to absolute bounds if they exist
    let clampedRange = targetRange
    if (entry?.absoluteBounds) {
      clampedRange = {
        from: Math.max(targetRange.from, entry.absoluteBounds.from),
        to: Math.min(targetRange.to, entry.absoluteBounds.to)
      }
    }

    const loadedRanges = this.getLoadedRanges(request)

    if (loadedRanges.length === 0) {
      // No data cached, need to fetch the entire range
      return [clampedRange]
    }

    // Check if the target range is fully covered
    if (this.isRangeCovered(loadedRanges, clampedRange)) {
      return [] // No expansion needed
    }

    // Find the missing ranges
    return this.findMissingRanges(loadedRanges, clampedRange)
  }

  /**
   * Sets the absolute bounds for a cached entry (from backend metadata)
   * Creates a placeholder cache entry if one doesn't exist yet
   */
  public setAbsoluteBounds(request: DataFetchRequest, bounds: DataRange): void {
    const key = this.getCacheKey(request)
    let entry = this.cache.get(key)

    if (!entry) {
      // Create a placeholder entry with bounds but no data yet
      // This will be populated when data is fetched

      // Create empty table placeholder
      const { tableFromArrays } = require('apache-arrow')
      const emptyTable = tableFromArrays({ index: [] })

      entry = {
        data: emptyTable,
        loadedRanges: [],
        absoluteBounds: bounds,
        timestamp: Date.now(),
        size: 0,
        accessCount: 0,
        lastAccessed: Date.now(),
      }
      this.cache.set(key, entry)
    } else {
      entry.absoluteBounds = bounds
    }
  }

  /**
   * Gets the absolute bounds for a cached entry
   */
  public getAbsoluteBounds(request: DataFetchRequest): DataRange | undefined {
    const key = this.getCacheKey(request)
    const entry = this.cache.get(key)
    return entry?.absoluteBounds
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