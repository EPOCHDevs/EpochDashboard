import { NextApiRequest, NextApiResponse } from 'next'

/**
 * Proxy for performance dashboard tearsheet data
 * Forwards requests to backend API to get protobuf tearsheet data
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { campaignId, category, raw, all } = req.query
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
    // Build query params
    const params = new URLSearchParams()
    if (category) params.append('category', category as string)
    if (raw) params.append('raw', raw as string)
    if (all) params.append('all', all as string)

    const targetUrl = `${backendUrl}/api/v1/dashboard/perf/${campaignId}${params.toString() ? '?' + params.toString() : ''}`
    console.log(`[Proxy] Fetching tearsheet from: ${targetUrl}`)

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/octet-stream',
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

    // Get the binary data
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Forward the binary response
    res.setHeader('Content-Type', 'application/octet-stream')
    res.status(200).send(buffer)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Proxy] Error:', errorMessage)

    res.status(500).json({
      error: 'Proxy error',
      details: errorMessage
    })
  }
}
