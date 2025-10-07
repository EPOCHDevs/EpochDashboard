import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { campaignId } = req.query
    const queryString = req.url?.split('?')[1] || ''

    // Get API URL from headers or environment
    const apiUrl = req.headers['x-api-url'] as string || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
    // Get user ID from headers, cookies, or default
    const userId = req.headers['x-user-id'] as string || req.cookies['X-User-Id'] || 'guest'

    console.log(`[Chart Data Proxy] Request for campaignId: ${campaignId}`)
    console.log(`[Chart Data Proxy] API URL: ${apiUrl}`)
    console.log(`[Chart Data Proxy] User ID: ${userId}`)
    console.log(`[Chart Data Proxy] Query String: ${queryString}`)

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    // Validate campaignId
    if (!campaignId || campaignId === 'undefined') {
      console.error('[Chart Data Proxy] Invalid campaignId:', campaignId)
      return res.status(400).json({
        error: 'Invalid campaign ID',
        details: 'Campaign ID is missing or undefined'
      })
    }

    const targetUrl = `${apiUrl}/api/v1/dashboard/analytics/${campaignId}?${queryString}`
    console.log(`[Chart Data Proxy] Fetching from: ${targetUrl}`)

    // Forward the request to the actual backend
    const response = await fetch(
      targetUrl,
      {
        method: 'GET',
        headers: {
          'X-User-Id': userId,
          'Accept': 'application/octet-stream, application/json',
        },
      }
    )

    if (!response.ok) {
      // For error responses, read as text
      const errorText = await response.text()
      console.error(`[Chart Data Proxy] Backend error: ${response.status}`)
      console.error(`[Chart Data Proxy] Error details:`, errorText)

      // Parse error message if it's JSON
      let errorMessage = `Backend returned ${response.status}`
      try {
        if (errorText.startsWith('{')) {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.message || errorMessage
        }
      } catch {
        // Not JSON, use raw text
        errorMessage = errorText || errorMessage
      }

      // Return error as JSON
      return res.status(response.status).json({
        error: errorMessage,
        details: errorText,
        url: targetUrl,
        status: response.status
      })
    }

    // For success responses, read as array buffer to preserve binary data
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log(`[Chart Data Proxy] Successfully fetched ${buffer.length} bytes of data`)

    // Send as binary data
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Length', buffer.length.toString())
    res.status(200).send(buffer)
  } catch (error) {
    console.error('[Chart Data Proxy] Unexpected error:', error)
    console.error('[Chart Data Proxy] Stack trace:', error instanceof Error ? error.stack : 'No stack trace')

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    // Always return JSON for errors
    return res.status(500).json({
      error: 'Internal proxy error',
      details: errorMessage,
      type: error instanceof Error ? error.constructor.name : 'Unknown'
    })
  }
}