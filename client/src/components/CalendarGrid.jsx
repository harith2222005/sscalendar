import React, { useState } from 'react'
import { useCalendar } from '../contexts/CalendarContext'
import EventListPopup from './EventListPopup'
import dayjs from 'dayjs'

const CalendarGrid = ({ onDateClick, onEventClick }) => {
  const { currentDate, getEventsForDate, navigateMonth, setSelectedDate } = useCalendar()
  const [showEventList, setShowEventList] = useState(false)
  const [eventListDate, setEventListDate] = useState(null)
  const [eventListPosition, setEventListPosition] = useState({ x: 0, y: 0 })
  const [zoomLevel, setZoomLevel] = useState(1.0) // Default zoom level

  // Generate calendar days
  const generateCalendarDays = () => {
    const startOfMonth = currentDate.startOf('month')
    const endOfMonth = currentDate.endOf('month')
    const startOfWeek = startOfMonth.startOf('week')
    const endOfWeek = endOfMonth.endOf('week')

    const days = []
    let day = startOfWeek

    while (day.isBefore(endOfWeek) || day.isSame(endOfWeek, 'day')) {
      days.push(day)
      day = day.add(1, 'day')
    }

    return days
  }

  const days = generateCalendarDays()
  const today = dayjs()

  const getEventChipColor = (index) => {
    const colors = [
      'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-md',
      'bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-md',
      'bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-md',
      'bg-gradient-to-r from-orange-400 to-orange-600 text-white shadow-md',
      'bg-gradient-to-r from-pink-400 to-pink-600 text-white shadow-md',
      'bg-gradient-to-r from-indigo-400 to-indigo-600 text-white shadow-md',
      'bg-gradient-to-r from-teal-400 to-teal-600 text-white shadow-md',
      'bg-gradient-to-r from-rose-400 to-rose-600 text-white shadow-md'
    ]
    return colors[index % colors.length]
  }

  const sortEventsByTime = (events) => {
    const now = dayjs()
    const currentTime = now.format('HH:mm')
    
    return events.sort((a, b) => {
      const aStart = a.startTime || '00:00'
      const aEnd = a.endTime || '23:59'
      const bStart = b.startTime || '00:00'
      const bEnd = b.endTime || '23:59'
      
      const aIsNow = currentTime >= aStart && currentTime <= aEnd
      const bIsNow = currentTime >= bStart && currentTime <= bEnd
      
      if (aIsNow && !bIsNow) return -1
      if (!aIsNow && bIsNow) return 1
      
      const aIsUpcoming = aStart > currentTime
      const bIsUpcoming = bStart > currentTime
      
      if (aIsUpcoming && !bIsUpcoming) return -1
      if (!aIsUpcoming && bIsUpcoming) return 1
      
      return aStart.localeCompare(bStart)
    })
  }

  const handleDateClick = (day) => {
    const isCurrentMonth = day.month() === currentDate.month()
    
    if (!isCurrentMonth) {
      if (day.isBefore(currentDate.startOf('month'))) {
        navigateMonth('prev')
      } else {
        navigateMonth('next')
      }
      setTimeout(() => {
        onDateClick(day)
      }, 0)
    } else {
      onDateClick(day)
    }
  }

  const handleDateTextClick = (day, event) => {
    event.stopPropagation()
    const events = getEventsForDate(day)
    if (events.length > 0) {
      const rect = event.target.getBoundingClientRect()
      setEventListPosition({
        x: (rect.left + rect.width / 2) / zoomLevel, // Adjust for zoom
        y: (rect.bottom + 5) / zoomLevel
      })
      setEventListDate(day)
      setShowEventList(true)
    }
  }

  const handlePlusClick = (day, event) => {
    event.stopPropagation()
    setSelectedDate(day)
    onDateClick(day, true)
  }

  const handleEventChipClick = (event, eventData) => {
    event.stopPropagation()
    onEventClick(eventData)
  }

  const getMultiDayEvents = (day) => {
    const events = getEventsForDate(day)
    return events.filter(event => {
      const startDate = dayjs(event.startDate || event.date)
      const endDate = dayjs(event.endDate || event.date)
      return !startDate.isSame(endDate, 'day')
    })
  }

  const getSingleDayEvents = (day) => {
    const events = getEventsForDate(day)
    return events.filter(event => {
      const startDate = dayjs(event.startDate || event.date)
      const endDate = dayjs(event.endDate || event.date)
      return startDate.isSame(endDate, 'day')
    })
  }

  // Calculate adjusted size for zoom out (inversely proportional when zoomLevel < 1)
  const getAdjustedSize = (baseSize) => (zoomLevel < 1 ? baseSize / zoomLevel : baseSize);

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 1.5)) // Max zoom 1.5
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5)) // Min zoom 0.5
  }

  return (
    <div className="relative flex flex-col bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}>
      {/* Zoom Controls */}
      <div className="flex justify-end p-2 space-x-2">
        <button
          onClick={handleZoomOut}
          className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg group"
          title="Zoom Out"
        >
          <svg className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>
        <button
          onClick={handleZoomIn}
          className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg group"
          title="Zoom In"
        >
          <svg className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m-3-3h6" />
          </svg>
        </button>
      </div>

      <div 
        className="calendar-container bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden flex flex-col flex-grow"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
      >
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b-2 border-gray-300 shrink-0">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
            <div key={day} className="px-2 py-4 text-center border-r-2 border-gray-300 last:border-r-0">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                  index === 0 || index === 6 
                    ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg' 
                    : 'bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-lg'
                }`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ width: `${getAdjustedSize(1.25)}rem`, height: `${getAdjustedSize(1.25)}rem` }}>
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-gray-700 hidden sm:inline" style={{ fontSize: `${getAdjustedSize(0.875)}rem` }}>
                  {day}
                </span>
                <span className="text-xs font-bold text-gray-700 sm:hidden" style={{ fontSize: `${getAdjustedSize(0.75)}rem` }}>
                  {day.slice(0, 3)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0 flex-grow" style={{ gridTemplateRows: 'repeat(6, minmax(0, 1fr))' }}>
          {days.map((day, index) => {
            const isCurrentMonth = day.month() === currentDate.month()
            const isToday = day.isSame(today, 'day')
            const allEvents = getEventsForDate(day)
            const sortedEvents = sortEventsByTime(allEvents)
            const multiDayEvents = getMultiDayEvents(day)
            const singleDayEvents = getSingleDayEvents(day)
            const maxVisibleEvents = 2

            return (
              <div
                key={index}
                className={`calendar-cell relative p-2 border-2 border-gray-300 transition-all duration-300 cursor-pointer group ${
                  isCurrentMonth 
                    ? isToday 
                      ? 'bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 ring-4 ring-blue-400 shadow-lg' 
                      : 'bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 opacity-60 hover:opacity-80'
                }`}
                onClick={() => handleDateClick(day)}
              >
                {/* Date number and plus icon */}
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className={`flex items-center justify-center transition-all duration-300 cursor-pointer ${
                      isCurrentMonth
                        ? isToday
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-8 h-8 rounded-full shadow-lg transform group-hover:scale-110'
                          : 'text-gray-900 font-semibold group-hover:text-indigo-600 group-hover:font-bold hover:bg-indigo-100 rounded-full w-8 h-8'
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                    onClick={(e) => handleDateTextClick(day, e)}
                    title="Click to view events for this day"
                    style={{ fontSize: `${getAdjustedSize(0.875)}rem` }}
                  >
                    <span>{day.date()}</span>
                  </div>
                  
                  <button
                    onClick={(e) => handlePlusClick(day, e)}
                    className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-md"
                    title="Add new event"
                    style={{ width: `${getAdjustedSize(1.5)}rem`, height: `${getAdjustedSize(1.5)}rem` }}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: `${getAdjustedSize(1)}rem`, height: `${getAdjustedSize(1)}rem` }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>

                {/* Multi-day events */}
                {multiDayEvents.length > 0 && (
                  <div className="mb-1">
                    {multiDayEvents.slice(0, 1).map((event, eventIndex) => (
                      <div
                        key={`multi-${event.id}`}
                        className="bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-lg px-2 py-1 mb-1 transform transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer border-l-4 border-purple-800"
                        onClick={(e) => handleEventChipClick(e, event)}
                        title={`${event.title} (Multi-day event)`}
                        style={{ fontSize: `${getAdjustedSize(0.75)}rem` }}
                      >
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ width: `${getAdjustedSize(0.75)}rem`, height: `${getAdjustedSize(0.75)}rem` }}>
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm0.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                          <span className="block truncate text-xs font-medium">
                            {event.title}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Single day events */}
                <div className="space-y-1">
                  {sortedEvents.slice(0, maxVisibleEvents).map((event, eventIndex) => {
                    const startDate = dayjs(event.startDate || event.date)
                    const endDate = dayjs(event.endDate || event.date)
                    const isMultiDay = !startDate.isSame(endDate, 'day')
                    
                    if (isMultiDay) return null
                    
                    return (
                      <div
                        key={event.id}
                        className={`event-chip ${getEventChipColor(eventIndex)} rounded-lg px-2 py-1 transform transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer`}
                        onClick={(e) => handleEventChipClick(e, event)}
                        title={`${event.title} - ${event.startTime || 'All day'}`}
                        style={{ fontSize: `${getAdjustedSize(0.75)}rem` }}
                      >
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ width: `${getAdjustedSize(0.75)}rem`, height: `${getAdjustedSize(0.75)}rem` }}>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="block truncate text-xs font-medium">
                            {event.startTime && (
                              <span className="font-bold mr-1">{event.startTime}</span>
                            )}
                            {event.title}
                          </span>
                        </div>
                      </div>
                    )
                  })}

                  {sortedEvents.length > maxVisibleEvents && (
                    <div className="bg-gradient-to-r from-gray-400 to-gray-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md flex items-center space-x-1 cursor-pointer"
                         onClick={(e) => handleDateTextClick(day, e)}
                         style={{ fontSize: `${getAdjustedSize(0.75)}rem` }}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ width: `${getAdjustedSize(0.75)}rem`, height: `${getAdjustedSize(0.75)}rem` }}>
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path d="M10 4a2 2 0 100-4 2 2 0 000 4z" />
                        <path d="M10 20a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                      <span>+{sortedEvents.length - maxVisibleEvents} more</span>
                    </div>
                  )}
                </div>

                {sortedEvents.length > 0 && (
                  <div className="absolute top-1 right-8 flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      sortedEvents.length > 3 
                        ? 'bg-gradient-to-r from-red-400 to-pink-500 shadow-md' 
                        : 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-md'
                    }`} style={{ width: `${getAdjustedSize(0.5)}rem`, height: `${getAdjustedSize(0.5)}rem` }} />
                    {sortedEvents.length > 1 && (
                      <span className="text-xs font-bold text-gray-600 bg-white rounded-full px-1.5 py-0.5 shadow-sm" style={{ fontSize: `${getAdjustedSize(0.75)}rem` }}>
                        {sortedEvents.length}
                      </span>
                    )}
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-100 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg pointer-events-none" />
              </div>
            )
          })}
        </div>
      </div>
      {showEventList && (
        <EventListPopup
          date={eventListDate}
          position={eventListPosition}
          onClose={() => setShowEventList(false)}
          onEventClick={onEventClick}
        />
      )}
    </div>
  )
}

export default CalendarGrid