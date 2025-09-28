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
        return <div className="text-secondary-ashGrey">Full dashboard coming soon...</div>
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
              <button className="bg-secondary-darkGray border border-secondary-mildCementGrey text-primary-white px-6 py-3 rounded-lg hover:bg-secondary-mildCementGrey/30 transition-all duration-200">
                Old Dashboard →
              </button>
            </Link>
            <Link href="/dashboard/test-strategy">
              <button className="bg-territory-success/20 border border-territory-success/30 text-territory-success px-6 py-3 rounded-lg hover:bg-territory-success/30 transition-all duration-200">
                Tearsheet Dashboard →
              </button>
            </Link>
            <Link href="/test-tearsheet">
              <button className="bg-territory-blue/20 border border-territory-blue/30 text-territory-blue px-6 py-3 rounded-lg hover:bg-territory-blue/30 transition-all duration-200">
                📊 Test Your Tearsheet →
              </button>
            </Link>
            <Link href="/trade-analytics">
              <button className="bg-territory-warning/20 border border-territory-warning/30 text-territory-warning px-6 py-3 rounded-lg hover:bg-territory-warning/30 transition-all duration-200">
                📈 Trade Analytics Chart →
              </button>
            </Link>
          </div>
          {renderView()}
        </div>
      </main>
    </div>
  )
}