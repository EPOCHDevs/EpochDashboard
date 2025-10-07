import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { campaignId } = req.query
  const page = req.query.page || '1'
  const apiUrl = req.headers['x-api-url'] || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
  const userId = req.headers['x-user-id'] || 'guest'

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await fetch(`${apiUrl}/api/v1/dashboard/round_trip/${campaignId}?page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId as string,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({
        error: `Backend error: ${response.status}`,
        details: errorText
      })
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({
      error: 'Failed to fetch round trips',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
