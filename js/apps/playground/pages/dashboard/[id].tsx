import React from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { Download } from 'lucide-react'
import { TearsheetDashboard, TearSheet, downloadTearsheet, createMockTearsheet } from '@epochlab/epoch-dashboard'

interface DashboardPageProps {
  tearsheet: TearSheet
  campaignId: string
}

export default function DashboardPage({
  tearsheet,
  campaignId
}: DashboardPageProps) {
  const router = useRouter()

  // Show loading state if fallback
  if (router.isFallback) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-2xl">Loading dashboard...</div>
      </div>
    )
  }

  const handleDownload = () => {
    // Proto only - no JSON option!
    downloadTearsheet(tearsheet, 'proto', `tearsheet-${campaignId}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1920px] mx-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Campaign Dashboard
            </h1>
            <p className="text-muted-foreground">
              Campaign ID: {campaignId}
            </p>
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-muted-foreground rounded-lg hover:bg-card/70 hover:text-foreground transition-all duration-200"
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
  const campaignId = params?.id as string

  if (!campaignId) {
    return {
      notFound: true
    }
  }

  try {
    // In production, this would fetch from your C++ backend
    // For now, we generate mock data directly
    const tearsheet = createMockTearsheet(campaignId)

    // Serialize tearsheet to remove undefined values (Next.js requirement)
    const serializedTearsheet = JSON.parse(JSON.stringify(tearsheet))

    return {
      props: {
        tearsheet: serializedTearsheet,
        campaignId
      }
    }
  } catch (error) {
    console.error('Error generating tearsheet:', error)
    return {
      notFound: true
    }
  }
}