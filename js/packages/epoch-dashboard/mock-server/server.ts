/**
 * Mock Server for Trade Analytics API
 * Provides endpoints for candlestick chart development
 */

import express from 'express'
import cors from 'cors'
import { CandlestickDataGenerator, generateMetadata } from './dataGenerator'
import { createArrowResponse } from './arrowConverter'

const app = express()
const PORT = process.env.MOCK_SERVER_PORT || 3002

// Enable CORS for development
app.use(cors())
app.use(express.json())

// Store generated data in memory for consistency
const dataCache = new Map<string, any>()

// Initialize data generator
const generator = new CandlestickDataGenerator()

// Helper to get or generate candlestick data
function getCandlestickData(assetId: string, timeframe: string, fromMs?: number, toMs?: number) {
  const cacheKey = `${assetId}-${timeframe}`

  if (!dataCache.has(cacheKey)) {
    // Generate new data
    const now = new Date()
    const startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago

    const candlesticks = generator.generateCandlesticks({
      startTime,
      endTime: now,
      interval: timeframe,
      basePrice: assetId.includes('BTC') ? 45000 : assetId.includes('ETH') ? 3000 : 100,
      volatility: 0.5,
      trend: 'sideways',
      volumeRange: [1000000, 5000000],
    })

    dataCache.set(cacheKey, candlesticks)
  }

  let data = dataCache.get(cacheKey)

  // Filter by time range if provided
  if (fromMs || toMs) {
    data = data.filter((candle: any) => {
      if (fromMs && candle.timestamp < fromMs) return false
      if (toMs && candle.timestamp > toMs) return false
      return true
    })
  }

  return data
}

// Metadata endpoint
app.get('/api/trade-analytics/metadata/:strategyId', (req, res) => {
  const delay = parseInt(process.env.MOCK_DATA_DELAY || '0')

  setTimeout(() => {
    // Generate metadata for multiple assets
    const btcMetadata = generateMetadata('BTC-USD', 'Bitcoin USD', 'BTC')
    const ethMetadata = generateMetadata('ETH-USD', 'Ethereum USD', 'ETH')

    // Combine metadata
    const metadata = {
      asset_info: {
        ...btcMetadata.asset_info,
        ...ethMetadata.asset_info,
      },
      chart_info: btcMetadata.chart_info, // Same chart config for all assets
    }

    res.json(metadata)
  }, delay)
})

// Round trips endpoint
app.get('/api/trade-analytics/round-trips/:strategyId', (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const delay = parseInt(process.env.MOCK_DATA_DELAY || '0')

  setTimeout(() => {
    // Get candlestick data to generate realistic trades
    const candlesticks = getCandlestickData('BTC-USD', '1h')
    const trades = generator.generateRoundTrips('BTC-USD', 'Bitcoin USD', candlesticks, 50)

    // Paginate
    const startIndex = (Number(page) - 1) * Number(limit)
    const endIndex = startIndex + Number(limit)
    const paginatedTrades = trades.slice(startIndex, endIndex)

    res.json({
      items: paginatedTrades,
      page: Number(page),
      total: trades.length,
    })
  }, delay)
})

// Chart data endpoint (Apache Arrow format)
app.get('/api/backend-server/dashboard/trade-analytics-chart-data/:strategyId', (req, res) => {
  const { assetId, timeframe, from_ms, to_ms, pivot, pad_front, pad_back } = req.query
  const delay = parseInt(process.env.MOCK_DATA_DELAY || '0')

  if (!assetId || !timeframe) {
    return res.status(400).json({ error: 'assetId and timeframe are required' })
  }

  setTimeout(() => {
    try {
      // Get candlestick data
      let candlesticks = getCandlestickData(
        assetId as string,
        timeframe as string,
        from_ms ? parseInt(from_ms as string) : undefined,
        to_ms ? parseInt(to_ms as string) : undefined
      )

      // Apply padding if pivot is provided
      if (pivot) {
        const pivotTime = parseInt(pivot as string)
        const pivotIndex = candlesticks.findIndex((c: any) => c.timestamp >= pivotTime)

        if (pivotIndex >= 0) {
          const frontPad = parseInt(pad_front as string || '100')
          const backPad = parseInt(pad_back as string || '100')

          const startIndex = Math.max(0, pivotIndex - frontPad)
          const endIndex = Math.min(candlesticks.length, pivotIndex + backPad)

          candlesticks = candlesticks.slice(startIndex, endIndex)
        }
      }

      // Convert to Apache Arrow format
      const arrowBuffer = createArrowResponse(candlesticks)

      // Send as binary data
      res.setHeader('Content-Type', 'application/octet-stream')
      res.send({ data: Array.from(arrowBuffer) })
    } catch (error) {
      console.error('Error generating Arrow data:', error)
      res.status(500).json({ error: 'Failed to generate chart data' })
    }
  }, delay)
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Mock server running at http://localhost:${PORT}`)
  console.log(`
Available endpoints:
  - GET /api/trade-analytics/metadata/:strategyId
  - GET /api/trade-analytics/round-trips/:strategyId
  - GET /api/backend-server/dashboard/trade-analytics-chart-data/:strategyId
  - GET /health

Environment variables:
  - MOCK_SERVER_PORT: ${PORT}
  - MOCK_DATA_DELAY: ${process.env.MOCK_DATA_DELAY || '0'}ms
  `)
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    process.exit(0)
  })
})

// Keep the process alive
server.keepAliveTimeout = 60000

export default app