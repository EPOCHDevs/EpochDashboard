import { useState, useEffect } from 'react'
import { fetchSelectorData } from '../api/selectorApi'

interface UseSelectorCountsParams {
  campaignId: string
  userId: string
  assetId: string
  selectorCount: number
  apiEndpoint: string
  enabled?: boolean
}

interface UseSelectorCountsResult {
  counts: (number | undefined)[]
  isLoading: boolean
  error: string | null
}

/**
 * Custom hook to fetch counts for multiple selectors dynamically
 * This avoids the Rules of Hooks violation by using a single hook call
 */
export function useSelectorCounts({
  campaignId,
  userId,
  assetId,
  selectorCount,
  apiEndpoint,
  enabled = true,
}: UseSelectorCountsParams): UseSelectorCountsResult {
  const [counts, setCounts] = useState<(number | undefined)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !campaignId || !assetId || selectorCount === 0) {
      setCounts([])
      setIsLoading(false)
      return
    }

    const fetchAllCounts = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch counts for all selectors in parallel
        const countPromises = Array.from({ length: selectorCount }, (_, index) =>
          fetchSelectorData({
            campaignId,
            userId,
            assetId,
            index,
            page: 1,
            apiEndpoint,
          })
            .then((response) => response.total)
            .catch((err) => {
              console.error(`Failed to fetch count for selector ${index}:`, err)
              return undefined
            })
        )

        const fetchedCounts = await Promise.all(countPromises)
        setCounts(fetchedCounts)
      } catch (err) {
        console.error('Failed to fetch selector counts:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch selector counts')
        setCounts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllCounts()
  }, [campaignId, userId, assetId, selectorCount, apiEndpoint, enabled])

  return {
    counts,
    isLoading,
    error,
  }
}
