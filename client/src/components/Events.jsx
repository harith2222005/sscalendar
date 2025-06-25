import React, { useState } from 'react'
import { useCalendar } from '../contexts/CalendarContext'
import EventDialog from './EventDialog'
import LoadingSpinner from './LoadingSpinner'
import dayjs from 'dayjs'

const Events = () => {
  const { events, loading, uploadEventsJSON } = useCalendar()
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setShowEventDialog(true)
  }

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setShowEventDialog(true)
  }

  const handleCloseDialog = () => {
    setShowEventDialog(false)
    setSelectedEvent(null)
  }

  const handleUploadJSON = async () => {
    if (!jsonInput.trim()) {
      setUploadError('Please enter JSON data')
      return
    }

    setUploadLoading(true)
    setUploadError('')

    try {
      const jsonData = JSON.parse(jsonInput)
      const eventsArray = Array.isArray(jsonData) ? jsonData : [jsonData]
      
      const result = await uploadEventsJSON(eventsArray)
      if (result.success) {
        setShowUploadDialog(false)
        setJsonInput('')
      } else {
        setUploadError(result.error)
      }
    } catch (err) {
      setUploadError('Invalid JSON format')
    } finally {
      setUploadLoading(false)
    }
  }

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = dayjs(a.date)
    const dateB = dayjs(b.date)
    if (dateA.isSame(dateB, 'day')) {
      return (a.startTime || '').localeCompare(b.startTime || '')
    }
    return dateA.isAfter(dateB) ? 1 : -1
  })

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your calendar events
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => setShowUploadDialog(true)}
            className="btn-secondary"
          >
            Upload JSON
          </button>
          <button
            onClick={handleCreateEvent}
            className="btn-primary"
          >
            Create Event
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6 0h6" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first event.</p>
            <div className="mt-6">
              <button onClick={handleCreateEvent} className="btn-primary">
                Create Event
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={() => handleEditEvent(event)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </h3>
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
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Dialog */}
      {showEventDialog && (
        <EventDialog
          isOpen={showEventDialog}
          onClose={handleCloseDialog}
          event={selectedEvent}
        />
      )}

      {/* Upload JSON Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowUploadDialog(false)} />

            <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upload Events JSON</h3>
                <button
                  onClick={() => setShowUploadDialog(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {uploadError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {uploadError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="form-label">JSON Data</label>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="form-input"
                    rows={10}
                    placeholder='[{"title": "Event Title", "date": "2024-01-01", "startTime": "10:00", "endTime": "11:00"}]'
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter an array of event objects or a single event object
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowUploadDialog(false)}
                    className="btn-secondary"
                    disabled={uploadLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadJSON}
                    className="btn-primary"
                    disabled={uploadLoading}
                  >
                    {uploadLoading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Events