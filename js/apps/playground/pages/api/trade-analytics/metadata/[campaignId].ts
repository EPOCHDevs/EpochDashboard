import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { campaignId } = req.query
  const apiUrl = req.headers['x-api-url'] || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
  const userId = req.headers['x-user-id'] || 'guest'

  console.log(`[API Proxy] Fetching metadata for campaignId: ${campaignId} from API: ${apiUrl} with userId: ${userId}`)

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const targetUrl = `${apiUrl}/api/v1/dashboard/analytics-metadata/${campaignId}`
    console.log(`[API Proxy] Making request to: ${targetUrl}`)

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId as string,
      },
    })

    console.log(`[API Proxy] Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[API Proxy] Backend error: ${response.status} - ${errorText}`)
      return res.status(response.status).json({
        error: `Backend returned ${response.status}`,
        details: errorText || `HTTP ${response.status}: ${response.statusText}`
      })
    }

    const data = await response.json()
    console.log(`[API Proxy] Successfully fetched metadata`)
    res.status(200).json(data)
  } catch (error) {
    console.error('[API Proxy] Network/fetch error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Check if it's a network error
    if (errorMessage.includes('ECONNREFUSED')) {
      return res.status(503).json({
        error: 'Cannot connect to backend API',
        details: `Unable to reach ${apiUrl}. Please ensure the API server is running on ${apiUrl} and accessible.`
      })
    }

    res.status(500).json({
      error: 'Proxy error',
      details: errorMessage
    })
  }
}
