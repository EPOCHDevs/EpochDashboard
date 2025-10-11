import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
// Import the exportable container component
import { TradeAnalyticsContainer } from '../../../packages/epoch-dashboard/src/modules/TradeAnalyticsTab/TradeAnalyticsContainer'

/**
 * Next.js playground wrapper for TradeAnalyticsContainer
 * This page extracts query parameters from the URL and passes them as props
 * The actual component logic is in the exportable TradeAnalyticsContainer
 * Backend API URL is configured in .env.local
 */
export default function TradeAnalyticsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Ensure we only render after client-side mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Extract parameters from URL
  const { campaignId, userId } = router.query
  const campaignIdParam = (campaignId as string) || ''
  const userIdParam = (userId as string) || ''

  // Show loading during SSR and initial client render
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  // Now router is ready, check if we have required params
  if (!campaignIdParam || !userIdParam) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="bg-card border border-destructive/50 rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-destructive mb-4">Configuration Required</h2>
          <p className="text-muted-foreground mb-6">
            {!campaignIdParam && !userIdParam
              ? 'No Campaign ID or User ID provided.'
              : !campaignIdParam
              ? 'No Campaign ID provided.'
              : 'No User ID provided.'}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Use the configuration form to set up your parameters, or add `?campaignId=your-id&userId=your-user` to the URL.
          </p>
          <Link href="/analytics-form">
            <button className="w-full bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:bg-accent/80 transition-all">
              Go to Configuration
            </button>
          </Link>
        </div>
      </div>
    )
  }

  // Render the exportable container with props from URL
  /**
   * apiEndpoint explanation:
   * - Empty string ("") = Use Next.js API proxy routes at /api/v1/dashboard/*
   *   The proxy routes are in pages/api/v1/dashboard/[campaignId].ts
   *   They forward requests to BACKEND_API_URL from .env.local (http://localhost:9000)
   *   This avoids CORS issues and allows the frontend to run on a different port
   *
   * - Direct URL ("http://localhost:9000") = Connect directly to backend
   *   Use this if backend has CORS configured or if running in production
   *   with proper CORS headers
   */
  return (
    <div className="relative">
      {/* Back button overlay */}
      <Link href="/analytics-form">
        <button className="absolute top-4 right-4 z-50 bg-card border border-border text-foreground px-4 py-1.5 rounded text-sm transition-all hover:bg-muted">
          ← Back to Configuration
        </button>
      </Link>

      {/* Render exportable component */}
      <TradeAnalyticsContainer
        campaignId={campaignIdParam}
        userId={userIdParam}
        apiEndpoint=""  // Empty = use Next.js proxy (see comment above)
        showHeader={true}
      />
    </div>
  )
}
