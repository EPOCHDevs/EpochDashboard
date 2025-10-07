import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
// Import the unified container
import { UnifiedDashboardContainer } from '@epochlab/epoch-dashboard'
// Import top toolbar component
import TopToolbar from '../components/TradeAnalytics/TopToolbar'

/**
 * Next.js playground wrapper for UnifiedDashboardContainer
 * This page demonstrates the unified dashboard with both Performance Overview and Trade Analytics
 * Backend API URL is configured via Next.js API proxy
 */
export default function UnifiedDashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Ensure we only render after client-side mount to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Extract parameters from URL
  const { campaignId, userId } = router.query
  const campaignIdParam = (campaignId as string) || ''
  const userIdParam = (userId as string) || 'guest'

  // Show loading during SSR and initial client render
  if (!mounted) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Check if we have required params
  if (!campaignIdParam) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-destructive/50 rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-destructive mb-4">Configuration Required</h2>
          <p className="text-muted-foreground mb-6">
            No Campaign ID provided.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Use the configuration form to set up your parameters, or add `?campaignId=your-id` to the URL.
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

  // Render the unified dashboard
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
   *
   * To update for production:
   * 1. Update BACKEND_API_URL in .env.local to your production backend URL
   * 2. Keep apiEndpoint="" to use the proxy, OR
   * 3. Set apiEndpoint="https://your-backend.com" to connect directly
   */
  return (
    <UnifiedDashboardContainer
      campaignId={campaignIdParam}
      userId={userIdParam}
      apiEndpoint=""  // Empty = use Next.js proxy (see comment above)
      defaultView="dashboard"  // Start with dashboard view
      TopToolbarComponent={TopToolbar}
      className="h-screen"  // For playground demo only - in production, it will fill parent container
    />
  )
}
