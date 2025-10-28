import { useState, useEffect } from 'react'
import { SelectorMetadataByAsset } from '../types/SelectorTypes'
import { fetchSelectorMetadata } from '../api/selectorApi'

interface UseSelectorMetadataParams {
  campaignId: string
  userId: string
  apiEndpoint: string
  enabled?: boolean
}

interface UseSelectorMetadataResult {
  data: SelectorMetadataByAsset | undefined
  isLoading: boolean
  error: string | null
}

export function useSelectorMetadata({
  campaignId,
  userId,
  apiEndpoint,
  enabled = true,
}: UseSelectorMetadataParams): UseSelectorMetadataResult {
  const [data, setData] = useState<SelectorMetadataByAsset | undefined>()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !campaignId) {
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setError(null)
        setIsLoading(true)

        const metadata = await fetchSelectorMetadata({
          campaignId,
          userId,
          apiEndpoint,
        })

        setData(metadata)
      } catch (error) {
        console.error('Failed to fetch selector metadata:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch selector metadata'
        setError(errorMessage)
        setData(undefined)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [campaignId, userId, apiEndpoint, enabled])

  return {
    data,
    isLoading,
    error,
  }
}
