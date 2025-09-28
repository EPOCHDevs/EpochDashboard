import { NextApiRequest, NextApiResponse } from 'next'
import { TearSheetClass, createMockTearsheet } from '@epochlab/epoch-dashboard'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid strategy ID' })
  }

  try {
    // In production, this would fetch from your C++ backend
    // For now, we generate mock data
    const tearsheet = createMockTearsheet(id)

    // Option 1: Send as JSON (easier for development)
    if (req.headers.accept?.includes('application/json')) {
      return res.status(200).json(tearsheet)
    }

    // Option 2: Send as protobuf binary (production)
    const buffer = TearSheetClass.encode(tearsheet).finish()

    res.setHeader('Content-Type', 'application/x-protobuf')
    res.setHeader('Content-Length', buffer.length.toString())
    res.status(200).send(buffer)
  } catch (error) {
    console.error('Error generating tearsheet:', error)
    res.status(500).json({ error: 'Failed to generate tearsheet' })
  }
}