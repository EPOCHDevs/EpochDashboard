import React from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { Download } from 'lucide-react'
import { TearsheetDashboard, TearSheet, downloadTearsheet } from '@epochlab/epoch-dashboard'

interface DashboardPageProps {
  tearsheet: TearSheet
  strategyId: string
}

export default function DashboardPage({
  tearsheet,
  strategyId
}: DashboardPageProps) {
  const router = useRouter()

  // Show loading state if fallback
  if (router.isFallback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading dashboard...</div>
      </div>
    )
  }

  const handleDownload = () => {
    // Proto only - no JSON option!
    downloadTearsheet(tearsheet, 'proto', `tearsheet-${strategyId}`)
  }

  return (
    <div className="min-h-screen bg-primary-bluishDarkGray">
      <div className="max-w-[1920px] mx-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary-white mb-2">
              Strategy Dashboard
            </h1>
            <p className="text-secondary-ashGrey">
              Strategy ID: {strategyId}
            </p>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-secondary-darkGray border border-secondary-mildCementGrey text-secondary-ashGrey rounded-lg hover:bg-secondary-mildCementGrey/30 hover:text-primary-white transition-all duration-200"
            title="Download as Protobuf"
          >
            <Download className="w-4 h-4" />
            <span>Download .pb</span>
          </button>
        </div>

        <div className="h-[calc(100vh-200px)]">
          <TearsheetDashboard
            tearsheet={tearsheet}
            className="h-full"
          />
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<DashboardPageProps> = async ({
  params
}) => {
  const strategyId = params?.id as string

  if (!strategyId) {
    return {
      notFound: true
    }
  }

  try {
    // Fetch tearsheet data from API
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const response = await fetch(`${baseUrl}/api/tearsheet/${strategyId}`, {
      headers: {
        'Accept': 'application/json' // Request JSON for SSR
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch tearsheet: ${response.status}`)
    }

    const tearsheet = await response.json() as TearSheet

    return {
      props: {
        tearsheet,
        strategyId
      }
    }
  } catch (error) {
    console.error('Error fetching tearsheet:', error)
    return {
      notFound: true
    }
  }
}