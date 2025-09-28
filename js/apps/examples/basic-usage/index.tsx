import React from 'react'
import { TearsheetDashboard, type TearSheet } from '@epochlab/epoch-dashboard'
import '@epochlab/epoch-dashboard/styles'

interface BasicUsageExampleProps {
  tearsheet: TearSheet
}

export default function BasicUsageExample({ tearsheet }: BasicUsageExampleProps) {
  return (
    <div className="min-h-screen bg-primary-bluishDarkGray">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          Basic TearSheet Dashboard
        </h1>

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