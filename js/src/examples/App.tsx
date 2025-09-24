import React, { useState } from 'react'
import Navigation from './components/Navigation'
import CardExample from './pages/CardExample'
import '../styles/globals.css'

function App() {
  const [currentView, setCurrentView] = useState('card')

  const renderView = () => {
    switch (currentView) {
      case 'card':
        return <CardExample />
      case 'table':
        return <div className="text-secondary-ashGrey">Table component coming soon...</div>
      case 'line':
        return <div className="text-secondary-ashGrey">Line chart coming soon...</div>
      case 'bar':
        return <div className="text-secondary-ashGrey">Bar chart coming soon...</div>
      case 'heatmap':
        return <div className="text-secondary-ashGrey">Heatmap coming soon...</div>
      case 'histogram':
        return <div className="text-secondary-ashGrey">Histogram coming soon...</div>
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