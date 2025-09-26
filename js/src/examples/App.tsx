import React, { useState } from 'react'
import Navigation from './components/Navigation'
import CardExample from './pages/CardExample'
import TableExample from './pages/TableExample'
import LineChartExample from './pages/LineChartExample'
import HistogramExample from './pages/HistogramExample'
import BarChartExample from './pages/BarChartExample'
import AreaChartExample from './pages/AreaChartExample'
import HeatMapExample from './pages/HeatMapExample'
import '../styles/globals.css'

function App() {
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
        return <div className="text-secondary-ashGrey">Box plot coming soon...</div>
      case 'xrange':
        return <div className="text-secondary-ashGrey">X-Range coming soon...</div>
      case 'pie':
        return <div className="text-secondary-ashGrey">Pie chart coming soon...</div>
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

export default App