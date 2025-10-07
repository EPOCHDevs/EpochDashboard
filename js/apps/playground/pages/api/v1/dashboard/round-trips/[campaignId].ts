import { NextApiRequest, NextApiResponse } from 'next'

/**
 * Proxy for trade analytics round trips
 * Forwards requests to backend API specified in X-Backend-URL header
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { campaignId } = req.query
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

  try {
    // Backend uses singular round_trip with page parameter
    const targetUrl = `${backendUrl}/api/v1/dashboard/round_trip/${campaignId}?page=1`
    console.log(`[Proxy] Fetching round trips from: ${targetUrl}`)

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
