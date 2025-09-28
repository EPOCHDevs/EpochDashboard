import React, { useState } from 'react'
import Navigation from './components/Navigation'
import CardExample from './pages/CardExample'
import TableExample from './pages/TableExample'
import LineChartExample from './pages/LineChartExample'
import HistogramExample from './pages/HistogramExample'
import BarChartExample from './pages/BarChartExample'
import AreaChartExample from './pages/AreaChartExample'
import HeatMapExample from './pages/HeatMapExample'
import BoxPlotExample from './pages/BoxPlotExample'
import XRangeExample from './pages/XRangeExample'
import PieChartExample from './pages/PieChartExample'
import DashboardExample from './pages/DashboardExample'
import TestDashboard from './pages/TestDashboard'
import '../styles/globals.css'

function App() {
  const [currentView, setCurrentView] = useState('card')

  const renderView = () => {
    console.log('Current view:', currentView)
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
      case 'dashboard':
        console.log('Rendering DashboardExample')
        return <TestDashboard />
        // return <DashboardExample />
      default:
        return <CardExample />
    }
  }

  return (
    <div className="flex min-h-screen bg-secondary-darkGray">
      <Navigation currentView={currentView} onNavigate={(view) => {
        console.log('Navigation clicked:', view)
        setCurrentView(view)
      }} />

      <main className="flex-1 p-8">
        <div className="max-w-6xl">
          {renderView()}
        </div>
      </main>
    </div>
  )
}

export default App