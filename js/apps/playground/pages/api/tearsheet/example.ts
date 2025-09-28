import { NextApiRequest, NextApiResponse } from 'next'
import { createMockTearsheet, TearSheetClass } from '@epochlab/epoch-dashboard'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Create example tearsheet data
    const tearsheet = createMockTearsheet('example-strategy')

    // ALWAYS return as protobuf binary - NO JSON!
    const buffer = TearSheetClass.encode(tearsheet).finish()
    res.setHeader('Content-Type', 'application/x-protobuf')
    res.status(200).send(Buffer.from(buffer))
  } catch (error) {
    console.error('Error generating example tearsheet:', error)
    res.status(500).json({
      error: 'Failed to generate example tearsheet',
      details: error instanceof Error ? error.message : String(error)
    })
  }
}