/**
 * Example usage of TradeAnalyticsChartRenderer
 * Demonstrates how to use the candlestick chart with mock data
 */

import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TradeAnalyticsChartRenderer from '../modules/TradeAnalyticsTab/components/TradeAnalyticsChartRenderer'
import { GetTradeAnalyticsMetadataResponseType, IRoundTrip } from '../types/TradeAnalyticsTypes'

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
})

// Mock hooks for demonstration (in real app, these would be actual API hooks)
function useMockMetadata(strategyId: string) {
  const [data, setData] = useState<GetTradeAnalyticsMetadataResponseType | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002/api'
        const response = await fetch(`${apiUrl}/trade-analytics/metadata/${strategyId}`)
        const metadata = await response.json()
        setData(metadata)
      } catch (error) {
        console.error('Failed to fetch metadata:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [strategyId])

  return { data, isLoading }
}

function useMockRoundTrips(strategyId: string) {
  const [data, setData] = useState<IRoundTrip[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3002/api'
        const response = await fetch(`${apiUrl}/trade-analytics/round-trips/${strategyId}`)
        const result = await response.json()
        setData(result.items || [])
      } catch (error) {
        console.error('Failed to fetch round trips:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [strategyId])

  return { data, isLoading }
}

export default function TradeAnalyticsExample() {
  const strategyId = 'example-strategy-001'
  const [selectedAsset, setSelectedAsset] = useState('BTC-USD')
  const [selectedRoundTrips, setSelectedRoundTrips] = useState<IRoundTrip[]>([])

  // Fetch metadata and round trips
  const { data: metadata, isLoading: isLoadingMetadata } = useMockMetadata(strategyId)
  const { data: roundTrips, isLoading: isLoadingRoundTrips } = useMockRoundTrips(strategyId)

  // Handle round trip selection
  const handleRoundTripSelect = (roundTrip: IRoundTrip) => {
    setSelectedRoundTrips([roundTrip])
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-6 text-3xl font-bold text-white">
            Trade Analytics Candlestick Chart Example
          </h1>

          {/* Asset Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">Select Asset:</label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="mt-1 block w-48 rounded-md border-gray-600 bg-gray-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {metadata &&
                Object.keys(metadata.asset_info).map((assetId) => (
                  <option key={assetId} value={assetId}>
                    {metadata.asset_info[assetId].asset.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Chart Container */}
          <div className="rounded-lg bg-gray-800 p-4">
            <div style={{ height: '600px' }}>
              <TradeAnalyticsChartRenderer
                isLoading={isLoadingMetadata}
                tradeAnalyticsMetadata={metadata}
                selectedRoundTrips={selectedRoundTrips}
                campaignId={strategyId}
                assetId={selectedAsset}
                fetchEntireCandleStickData={true}
                paddingProfile="STANDARD"
              />
            </div>
          </div>

          {/* Round Trips List */}
          <div className="mt-6">
            <h2 className="mb-4 text-xl font-bold text-white">Trading History</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roundTrips.slice(0, 9).map((roundTrip) => (
                <div
                  key={roundTrip.index}
                  onClick={() => handleRoundTripSelect(roundTrip)}
                  className="cursor-pointer rounded-lg bg-gray-800 p-4 hover:bg-gray-700"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-white">{roundTrip.asset}</span>
                    <span
                      className={`rounded px-2 py-1 text-xs ${
                        roundTrip.status === 'WIN'
                          ? 'bg-green-600 text-white'
                          : roundTrip.status === 'LOSS'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-600 text-white'
                      }`}
                    >
                      {roundTrip.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    <div>Side: {roundTrip.side}</div>
                    <div>Entry: ${roundTrip.avg_entry_price.toFixed(2)}</div>
                    <div>Exit: ${roundTrip.avg_exit_price.toFixed(2)}</div>
                    <div>Return: {roundTrip.return_percent.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 rounded-lg bg-blue-900 p-4 text-white">
            <h3 className="mb-2 font-bold">How to use this example:</h3>
            <ol className="list-inside list-decimal space-y-1 text-sm">
              <li>Start the mock server: npm run mock:server</li>
              <li>Select an asset from the dropdown</li>
              <li>Click on a trade in the history to focus on it</li>
              <li>Use the timeframe buttons in the chart to change intervals</li>
              <li>Scroll to zoom, drag to pan</li>
            </ol>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}

// Export a standalone version for testing
export function TradeAnalyticsStandalone() {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#1a1a1a' }}>
      <TradeAnalyticsExample />
    </div>
  )
}