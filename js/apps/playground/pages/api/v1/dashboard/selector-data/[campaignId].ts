import { NextApiRequest, NextApiResponse } from 'next'

/**
 * Proxy for selector data (paginated)
 * Forwards requests to backend API specified in X-Backend-URL header
 * Query params: asset, index, page
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { campaignId } = req.query
  const { asset, index, page } = req.query
  const backendUrl = req.headers['x-backend-url'] as string || process.env.BACKEND_API_URL
  const userId = req.headers['x-user-id'] as string || 'guest'

  if (!backendUrl) {
    return res.status(400).json({
      error: 'No backend URL configured',
      details: 'Please provide X-Backend-URL header or set BACKEND_API_URL environment variable'
    })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!asset || !index) {
    return res.status(400).json({
      error: 'Missing required parameters',
      details: 'asset and index query parameters are required'
    })
  }

  try {
    // Build query string
    const queryParams = new URLSearchParams({
      asset: asset as string,
      index: index as string,
      ...(page && { page: page as string })
    })

    const targetUrl = `${backendUrl}/api/v1/dashboard/selector-data/${campaignId}?${queryParams}`
    console.log(`[Proxy] Fetching selector data from: ${targetUrl}`)

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-USER-ID': userId,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({
        error: `Backend returned ${response.status}`,
        details: errorText
      })
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Proxy] Error:', errorMessage)

    res.status(500).json({
      error: 'Proxy error',
      details: errorMessage
    })
  }
}
