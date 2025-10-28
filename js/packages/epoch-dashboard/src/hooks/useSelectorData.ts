import { useState, useEffect, useCallback } from 'react'
import { CardRowData } from '../types/SelectorTypes'
import { fetchSelectorData } from '../api/selectorApi'

interface UseSelectorDataParams {
  campaignId: string
  userId: string
  assetId: string
  selectorIndex: number
  apiEndpoint: string
  enabled?: boolean // Allow conditional fetching
  infiniteScroll?: boolean // Enable infinite scroll mode (default: true)
}

interface UseSelectorDataResult {
  data: CardRowData[] | undefined
  page: number
  total: number
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean // Whether there are more pages to load
  loadMore: () => void // Function to load next page
}

export function useSelectorData({
  campaignId,
  userId,
  assetId,
  selectorIndex,
  apiEndpoint,
  enabled = true,
  infiniteScroll = true,
}: UseSelectorDataParams): UseSelectorDataResult {
  const [data, setData] = useState<CardRowData[] | undefined>()
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [itemsPerPage, setItemsPerPage] = useState<number | null>(null)

  // Reset to page 1 when asset/selector changes
  useEffect(() => {
    setCurrentPage(1)
    setData(undefined)
    setTotal(0)
  }, [assetId, selectorIndex])

  // Fetch data for current page
  useEffect(() => {
    if (!enabled || !campaignId || !assetId) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setError(null)
        // Only show main loading on first page
        if (currentPage === 1) {
          setIsLoading(true)
        } else {
          setIsLoadingMore(true)
        }

        const response = await fetchSelectorData({
          campaignId,
          userId,
          assetId,
          index: selectorIndex,
          page: currentPage,
          apiEndpoint,
        })

        // Response is paginated: { items: [...], page: number, total: number }
        if (response && response.items) {
          if (infiniteScroll && currentPage > 1) {
            // Accumulate data for infinite scroll
            setData((prev) => [...(prev || []), ...response.items])
          } else {
            // Replace data for first page or non-infinite mode
            setData(response.items)
          }
          setTotal(response.total)

          // Track items per page for hasMore calculation
          if (!itemsPerPage && response.items.length > 0) {
            setItemsPerPage(response.items.length)
          }
        } else {
          setData([])
          setTotal(0)
        }
      } catch (error) {
        console.error('Failed to fetch selector data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch selector data'
        setError(errorMessage)
        if (currentPage === 1) {
          setData(undefined)
        }
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    }

    fetchData()
  }, [campaignId, userId, assetId, selectorIndex, currentPage, apiEndpoint, enabled, infiniteScroll, itemsPerPage])

  // Calculate if there are more pages
  const loadedItemsCount = data?.length || 0
  const hasMore = loadedItemsCount < total

  // Load more function for infinite scroll
  const loadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMore) {
      setCurrentPage((prev) => prev + 1)
    }
  }, [isLoading, isLoadingMore, hasMore])

  return {
    data,
    page: currentPage,
    total,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
  }
}
