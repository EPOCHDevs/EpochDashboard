import { useState } from 'react'
import Navigation from '../src/examples/components/Navigation'
import CardExample from '../src/examples/pages/CardExample'
import TableExample from '../src/examples/pages/TableExample'
import LineChartExample from '../src/examples/pages/LineChartExample'
import BarChartExample from '../src/examples/pages/BarChartExample'
import AreaChartExample from '../src/examples/pages/AreaChartExample'
import HeatMapExample from '../src/examples/pages/HeatMapExample'
import PieChartExample from '../src/examples/pages/PieChartExample'
import XRangeExample from '../src/examples/pages/XRangeExample'
import HistogramExample from '../src/examples/pages/HistogramExample'
import BoxPlotExample from '../src/examples/pages/BoxPlotExample'

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
    <div className="flex min-h-screen bg-secondary-darkGray">
      <Navigation currentView={currentView} onNavigate={setCurrentView} />

      <main className="flex-1 p-8">
        <div className="max-w-6xl">
          {renderView()}
        </div>
      </main>
    </div>
  )
}