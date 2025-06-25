import React, { useEffect, useRef } from 'react'
import { useCalendar } from '../contexts/CalendarContext'
import dayjs from 'dayjs'

const EventListPopup = ({ date, position, onClose, onEventClick }) => {
  const { getEventsForDate } = useCalendar()
  const popupRef = useRef(null)
  
  const events = getEventsForDate(date)
  const sortedEvents = events.sort((a, b) => {
    const aStart = a.startTime || '00:00'
    const bStart = b.startTime || '00:00'
    return aStart.localeCompare(bStart)
  })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  if (events.length === 0) return null

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-4 max-w-sm w-80"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
        maxHeight: '400px',
        overflowY: 'auto'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">
          {date.format('MMM D, YYYY')}
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-2">
        {sortedEvents.map((event, index) => {
          const now = dayjs()
          const currentTime = now.format('HH:mm')
          const isHappeningNow = event.startTime && event.endTime && 
                                currentTime >= event.startTime && currentTime <= event.endTime
          const isUpcoming = event.startTime && event.startTime > currentTime
          const isPast = event.endTime && event.endTime < currentTime

          return (
            <div
              key={event.id}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                isHappeningNow 
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-300 hover:from-emerald-100 hover:to-teal-100'
                  : isUpcoming
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300 hover:from-blue-100 hover:to-indigo-100'
                  : isPast
                  ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 hover:from-gray-100 hover:to-gray-200 opacity-75'
                  : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 hover:from-purple-100 hover:to-pink-100'
              }`}
              onClick={() => {
                onEventClick(event)
                onClose()
              }}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                  isHappeningNow 
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 animate-pulse'
                    : isUpcoming
                    ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                    : isPast
                    ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                    : 'bg-gradient-to-r from-purple-400 to-pink-500'
                }`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {event.title}
                    </h4>
                    {isHappeningNow && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Now
                      </span>
                    )}
                  </div>
                  
                  {(event.startTime || event.endTime) && (
                    <div className="flex items-center space-x-1 text-xs text-gray-600 mb-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">
                        {event.startTime || 'All day'}
                        {event.endTime && ` - ${event.endTime}`}
                      </span>
                    </div>
                  )}
                  
                  {event.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    {event.group && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {event.group}
                      </span>
                    )}
                    
                    {event.repeat?.type !== 'none' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        {event.repeat.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          {events.length} event{events.length !== 1 ? 's' : ''} on this day
        </p>
      </div>
    </div>
  )
}

export default EventListPopup