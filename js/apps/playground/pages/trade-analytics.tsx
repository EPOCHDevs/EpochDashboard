import React, { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Link from 'next/link'
// Import directly from source files in the monorepo
import TradeAnalyticsChartRenderer from '../../../packages/epoch-dashboard/src/modules/TradeAnalyticsTab/components/TradeAnalyticsChartRenderer'
import type { GetTradeAnalyticsMetadataResponseType, IRoundTrip } from '../../../packages/epoch-dashboard/src/types/TradeAnalyticsTypes'

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
      retry: 1,
    },
  },
})

// Mock hooks for fetching data from our API
function useMockMetadata(strategyId: string) {
  const [data, setData] = useState<GetTradeAnalyticsMetadataResponseType | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002/api'
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
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3002/api'
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

export default function TradeAnalyticsPage() {
  const strategyId = 'strategy-001'
  const [selectedAsset, setSelectedAsset] = useState('BTC-USD')
  const [selectedRoundTrips, setSelectedRoundTrips] = useState<IRoundTrip[]>([])
  const [fetchEntireData, setFetchEntireData] = useState(true)

  // Fetch metadata and round trips
  const { data: metadata, isLoading: isLoadingMetadata } = useMockMetadata(strategyId)
  const { data: roundTrips, isLoading: isLoadingRoundTrips } = useMockRoundTrips(strategyId)

  // Handle round trip selection
  const handleRoundTripSelect = (roundTrip: IRoundTrip) => {
    setSelectedRoundTrips([roundTrip])
    setFetchEntireData(false) // Focus on specific trade when selected
  }

  // Clear selection
  const handleClearSelection = () => {
    setSelectedRoundTrips([])
    setFetchEntireData(true)
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-primary p-4">
        <div className="mx-auto max-w-[1600px]">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-primary-white">
              Trade Analytics Candlestick Chart
            </h1>
            <Link href="/">
              <button className="bg-secondary-darkGray border border-secondary-mildCementGrey text-primary-white px-4 py-2 rounded-lg hover:bg-secondary-mildCementGrey/30 transition-all duration-200">
                ← Back to Playground
              </button>
            </Link>
          </div>

          {/* Controls */}
          <div className="mb-4 flex items-center gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-secondary-ashGrey mb-1">
                Select Asset:
              </label>
              <select
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
                className="block w-48 rounded-md border-secondary-mildCementGrey bg-secondary-darkGray text-primary-white px-3 py-2 focus:border-territory-blue focus:ring-territory-blue"
              >
                {metadata &&
                  Object.keys(metadata.asset_info).map((assetId) => (
                    <option key={assetId} value={assetId}>
                      {metadata.asset_info[assetId].asset.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-ashGrey mb-1">
                Data Mode:
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFetchEntireData(!fetchEntireData)}
                  className={`px-4 py-2 rounded-md transition-all ${
                    fetchEntireData
                      ? 'bg-territory-success/30 text-territory-success border border-territory-success/50'
                      : 'bg-secondary-darkGray text-secondary-ashGrey border border-secondary-mildCementGrey'
                  }`}
                >
                  {fetchEntireData ? 'Full Data' : 'Focused View'}
                </button>
                {selectedRoundTrips.length > 0 && (
                  <button
                    onClick={handleClearSelection}
                    className="px-4 py-2 rounded-md bg-territory-warning/30 text-territory-warning border border-territory-warning/50"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>

            <div className="text-sm text-secondary-ashGrey">
              {selectedRoundTrips.length > 0 && (
                <span>Selected: {selectedRoundTrips[0].asset} - {selectedRoundTrips[0].status}</span>
              )}
            </div>
          </div>

          {/* Chart Container */}
          <div className="rounded-lg bg-secondary-darkGray border border-secondary-mildCementGrey p-4 mb-6">
            <div style={{ height: '600px' }}>
              <TradeAnalyticsChartRenderer
                isLoading={isLoadingMetadata}
                tradeAnalyticsMetadata={metadata}
                selectedRoundTrips={selectedRoundTrips}
                campaignId={strategyId}
                assetId={selectedAsset}
                fetchEntireCandleStickData={fetchEntireData}
                paddingProfile="STANDARD"
              />
            </div>
          </div>

          {/* Round Trips Grid */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-primary-white">
              Trading History (Click to focus on trade)
            </h2>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {roundTrips.slice(0, 12).map((roundTrip) => (
                <div
                  key={roundTrip.index}
                  onClick={() => handleRoundTripSelect(roundTrip)}
                  className={`cursor-pointer rounded-lg border p-4 transition-all ${
                    selectedRoundTrips.some(rt => rt.index === roundTrip.index)
                      ? 'bg-territory-blue/20 border-territory-blue'
                      : 'bg-secondary-darkGray border-secondary-mildCementGrey hover:bg-secondary-mildCementGrey/30'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-primary-white font-medium">{roundTrip.asset}</span>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        roundTrip.status === 'WIN'
                          ? 'bg-territory-success/30 text-territory-success'
                          : roundTrip.status === 'LOSS'
                          ? 'bg-territory-failure/30 text-territory-failure'
                          : roundTrip.status === 'OPEN'
                          ? 'bg-territory-blue/30 text-territory-blue'
                          : 'bg-secondary-mildCementGrey text-secondary-ashGrey'
                      }`}
                    >
                      {roundTrip.status}
                    </span>
                  </div>
                  <div className="text-sm text-secondary-ashGrey space-y-1">
                    <div className="flex justify-between">
                      <span>Side:</span>
                      <span className={roundTrip.side === 'Long' ? 'text-territory-success' : 'text-territory-failure'}>
                        {roundTrip.side}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Entry:</span>
                      <span className="text-primary-white">${roundTrip.avg_entry_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Exit:</span>
                      <span className="text-primary-white">${roundTrip.avg_exit_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Return:</span>
                      <span className={roundTrip.return_percent > 0 ? 'text-territory-success' : 'text-territory-failure'}>
                        {roundTrip.return_percent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 rounded-lg bg-territory-blue/10 border border-territory-blue/30 p-4 text-primary-white">
            <h3 className="mb-2 font-bold">📊 Chart Controls:</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-secondary-ashGrey">
              <li>Use the timeframe buttons in the chart to change candle intervals</li>
              <li>Click on a trade card to focus the chart on that specific trade</li>
              <li>Toggle between "Full Data" and "Focused View" modes</li>
              <li>Scroll to zoom in/out, drag to pan across the chart</li>
              <li>Use the series toggles to show/hide different indicators</li>
            </ul>
            <div className="mt-3 text-xs text-territory-warning">
              Note: Make sure the mock server is running on port 3002 (npm run mock:server)
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  )
}