import { useState } from 'react'
import Link from 'next/link'
import Navigation from '../components/Navigation'
import CardExample from '../examples/CardExample'
import TableExample from '../examples/TableExample'
import LineChartExample from '../examples/LineChartExample'
import BarChartExample from '../examples/BarChartExample'
import AreaChartExample from '../examples/AreaChartExample'
import HeatMapExample from '../examples/HeatMapExample'
import PieChartExample from '../examples/PieChartExample'
import XRangeExample from '../examples/XRangeExample'
import HistogramExample from '../examples/HistogramExample'
import BoxPlotExample from '../examples/BoxPlotExample'

export default function HomePage() {
  const [currentView, setCurrentView] = useState('card')

  const renderView = () => {
    switch (currentView) {
      case 'card':
        return <CardExample />
      case 'table':
        return <TableExample />
      case 'line':
        return <LineChartExample />
      case 'bar':
        return <BarChartExample />
      case 'area':
        return <AreaChartExample />
      case 'heatmap':
        return <HeatMapExample />
      case 'histogram':
        return <HistogramExample />
      case 'boxplot':
        return <BoxPlotExample />
      case 'xrange':
        return <XRangeExample />
      case 'pie':
        return <PieChartExample />
      case 'full':
        return <div className="text-muted-foreground">Full dashboard coming soon...</div>
      default:
        return <CardExample />
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-primary">
      <Navigation currentView={currentView} onNavigate={setCurrentView} />

      <main className="flex-1 p-8">
        <div className="max-w-6xl">
          <div className="mb-4 flex flex-wrap gap-4">
            <Link href="/dashboard">
              <button className="bg-card border border-border text-foreground px-6 py-3 rounded-lg hover:bg-card/70 transition-all duration-200">
                Old Dashboard →
              </button>
            </Link>
            <Link href="/dashboard/test-strategy">
              <button className="bg-success/20 border border-success/30 text-success px-6 py-3 rounded-lg hover:bg-success/30 transition-all duration-200">
                Tearsheet Dashboard →
              </button>
            </Link>
            <Link href="/test-tearsheet">
              <button className="bg-accent/20 border border-accent/30 text-accent px-6 py-3 rounded-lg hover:bg-accent/30 transition-all duration-200">
                📊 Test Your Tearsheet →
              </button>
            </Link>
            <Link href="/analytics-form">
              <button className="bg-warning/20 border border-warning/30 text-warning px-6 py-3 rounded-lg hover:bg-warning/30 transition-all duration-200">
                Trade Analytics Debug →
              </button>
            </Link>
          </div>
          {renderView()}
        </div>
      </main>
    </div>
  )
}