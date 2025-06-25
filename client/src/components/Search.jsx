import React, { useState } from 'react'
import { useCalendar } from '../contexts/CalendarContext'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import LoadingSpinner from './LoadingSpinner'

const Search = () => {
  const { searchEvents } = useCalendar()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    group: ''
  })

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim() && !filters.startDate && !filters.endDate && !filters.group) return

    setLoading(true)
    try {
      const result = await searchEvents(query, filters)
      if (result.success) {
        setResults(result.results)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (event) => {
    // Navigate to Events tab and potentially open the event for editing
    navigate('/dashboard/events', { state: { selectedEvent: event } })
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setFilters({
      startDate: '',
      endDate: '',
      group: ''
    })
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Search Events</h1>
        <p className="text-sm text-gray-600 mt-1">
          Find events by title, date, or group
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Main search input */}
          <div>
            <label className="form-label">Search Query</label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="form-input pl-10"
                placeholder="Search by event title..."
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Group</label>
              <input
                type="text"
                value={filters.group}
                onChange={(e) => handleFilterChange('group', e.target.value)}
                className="form-input"
                placeholder="Filter by group..."
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={clearSearch}
              className="btn-tertiary"
            >
              Clear All
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Searching...</span>
                </div>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {query || Object.values(filters).some(f => f) ? 'No results found' : 'Start searching'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {query || Object.values(filters).some(f => f) 
                ? 'Try adjusting your search criteria'
                : 'Enter a search query or apply filters to find events'
              }
            </p>
          </div>
        ) : (
          <div>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Search Results ({results.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {results.map((event) => (
                <div
                  key={event.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                  onClick={() => handleResultClick(event)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {event.title}
                        </h4>
                        {event.group && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {event.group}
                          </span>
                        )}
                        {event.repeat?.type !== 'none' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Repeats {event.repeat.type}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6 0h6" />
                          </svg>
                          {dayjs(event.date).format('MMM D, YYYY')}
                        </span>
                        {event.startTime && (
                          <span className="flex items-center">
                            <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {event.startTime}
                            {event.endTime && ` - ${event.endTime}`}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="mt-1 text-sm text-gray-600 truncate">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <button className="text-ocean-blue-start hover:text-ocean-blue-end font-medium text-sm">
                        Edit Event →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Search