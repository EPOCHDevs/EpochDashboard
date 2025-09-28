import React from 'react'
import { TearsheetDashboard, type TearSheet } from '@epochlab/epoch-dashboard'
import '@epochlab/epoch-dashboard/styles'

interface CustomThemingExampleProps {
  tearsheet: TearSheet
}

export default function CustomThemingExample({ tearsheet }: CustomThemingExampleProps) {
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8">
          Custom Themed Dashboard
        </h1>

        <div className="h-[calc(100vh-200px)]">
          <TearsheetDashboard
            tearsheet={tearsheet}
            className="h-full bg-slate-800 border border-cyan-500/20 rounded-lg"
            onCategoryChange={(category) => console.log('Category changed:', category)}
            onLayoutChange={(layout) => console.log('Layout changed:', layout)}
          />
        </div>
      </div>

      <style jsx global>{`
        :root {
          --dashboard-bg-primary: #0f172a;
          --dashboard-bg-secondary: #1e293b;
          --dashboard-text-primary: #06b6d4;
          --dashboard-accent-cyan: #06b6d4;
        }
      `}</style>
    </div>
  )
}