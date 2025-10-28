import { SelectorMetadataByAsset, SelectorDataResponse } from '../types/SelectorTypes'

export interface FetchSelectorDataParams {
  campaignId: string
  userId: string
  assetId: string
  index: number
  page?: number // Optional page number for pagination (default: 1)
  apiEndpoint: string
}

export interface FetchSelectorMetadataParams {
  campaignId: string
  userId: string
  apiEndpoint: string
}

export interface FetchSelectorFilterMetadataParams {
  campaignId: string
  userId: string
  assetId: string
  index: number
  apiEndpoint: string
}

// Fetch selector data for a specific asset and index (paginated)
export async function fetchSelectorData({
  campaignId,
  userId,
  assetId,
  index,
  page = 1,
  apiEndpoint,
}: FetchSelectorDataParams): Promise<SelectorDataResponse> {
  const url = `${apiEndpoint}/api/v1/dashboard/selector-data/${campaignId}?asset=${assetId}&index=${index}&page=${page}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-USER-ID': userId,
    },
  })

  if (!response.ok) {
    let errorMessage = `Failed to fetch selector data: ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.details || errorData.error || errorMessage
    } catch (e) {
      errorMessage = `${errorMessage} ${response.statusText}`
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

// Fetch selector metadata from the dedicated selector-metadata endpoint
export async function fetchSelectorMetadata({
  campaignId,
  userId,
  apiEndpoint,
}: FetchSelectorMetadataParams): Promise<SelectorMetadataByAsset> {
  const url = `${apiEndpoint}/api/v1/dashboard/selector-metadata/${campaignId}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-USER-ID': userId,
    },
  })

  if (!response.ok) {
    let errorMessage = `Failed to fetch selector metadata: ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.details || errorData.error || errorMessage
    } catch (e) {
      errorMessage = `${errorMessage} ${response.statusText}`
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

// Fetch selector filter metadata (column definitions, operators, options)
export async function fetchSelectorFilterMetadata({
  campaignId,
  userId,
  assetId,
  index,
  apiEndpoint,
}: FetchSelectorFilterMetadataParams): Promise<any> {
  const url = `${apiEndpoint}/api/v1/dashboard/selector-filter-metadata/${campaignId}?asset=${assetId}&index=${index}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-USER-ID': userId,
    },
  })

  if (!response.ok) {
    let errorMessage = `Failed to fetch selector filter metadata: ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.details || errorData.error || errorMessage
    } catch (e) {
      errorMessage = `${errorMessage} ${response.statusText}`
    }
    throw new Error(errorMessage)
  }

  return response.json()
}
