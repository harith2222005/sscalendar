import React from 'react'

const CalendarViewToggle = ({ currentView, onViewChange }) => {
  const views = [
    { 
      id: 'day', 
      label: 'Day', 
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v18m9-9H3" />
        </svg>
      )
    },
    { 
      id: 'month', 
      label: 'Month', 
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6 0h6" />
        </svg>
      )
    },
    { 
      id: 'year', 
      label: 'Year', 
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    }
  ]

  return (
    <div className="flex items-center bg-white rounded-xl border-2 border-gray-200 shadow-md overflow-hidden">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-300 ${
            currentView === view.id
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
              : 'text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700'
          }`}
        >
          <span className={`transition-transform duration-300 ${currentView === view.id ? 'scale-110' : ''}`}>
            {view.icon}
          </span>
          <span className="hidden sm:inline">{view.label}</span>
        </button>
      ))}
    </div>
  )
}

export default CalendarViewToggle