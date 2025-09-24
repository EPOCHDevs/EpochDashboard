import React from 'react'

interface NavItemProps {
  id: string
  label: string
  status: 'done' | 'building' | 'pending'
  onClick: () => void
  active: boolean
}

const NavItem: React.FC<NavItemProps> = ({ label, status, onClick, active }) => {
  const statusColor = {
    done: 'text-territory-success',
    building: 'text-secondary-yellow',
    pending: 'text-secondary-ashGrey'
  }[status]

  const statusIcon = {
    done: '✓',
    building: '⚙',
    pending: '○'
  }[status]

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-primary-white/10 text-primary-white'
          : 'text-secondary-ashGrey hover:bg-primary-white/5'
      }`}
    >
      <span className={`${statusColor} mr-2`}>{statusIcon}</span>
      {label}
    </button>
  )
}

interface NavigationProps {
  currentView: string
  onNavigate: (view: string) => void
}

export default function Navigation({ currentView, onNavigate }: NavigationProps) {
  const routes = [
    { id: 'card', label: 'Card', status: 'done' as const },
    { id: 'table', label: 'Table', status: 'pending' as const },
    { id: 'line', label: 'Line Chart', status: 'pending' as const },
    { id: 'bar', label: 'Bar Chart', status: 'pending' as const },
    { id: 'heatmap', label: 'Heatmap', status: 'pending' as const },
    { id: 'histogram', label: 'Histogram', status: 'pending' as const },
    { id: 'boxplot', label: 'Box Plot', status: 'pending' as const },
    { id: 'xrange', label: 'X-Range', status: 'pending' as const },
    { id: 'pie', label: 'Pie Chart', status: 'pending' as const },
    { id: 'full', label: 'Full Dashboard', status: 'pending' as const },
  ]

  return (
    <nav className="w-64 h-screen bg-secondary-mildCementGrey border-r border-primary-white/10 p-4">
      <h1 className="text-xl font-bold text-primary-white mb-6">
        Dashboard Components
      </h1>

      <div className="space-y-2">
        {routes.map((route) => (
          <NavItem
            key={route.id}
            id={route.id}
            label={route.label}
            status={route.status}
            onClick={() => onNavigate(route.id)}
            active={currentView === route.id}
          />
        ))}
      </div>

      <div className="mt-8 pt-4 border-t border-primary-white/10">
        <p className="text-xs text-secondary-ashGrey">
          ✓ Done &nbsp; ⚙ Building &nbsp; ○ Pending
        </p>
      </div>
    </nav>
  )
}