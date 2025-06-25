import React from 'react'
import { useCalendar } from '../contexts/CalendarContext'
import dayjs from 'dayjs'

const DayView = ({ onEventClick, onDateClick }) => {
  const { currentDate, getEventsForDate } = useCalendar()
  const events = getEventsForDate(currentDate)
  
  // Generate hourly time slots
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0')
    return `${hour}:00`
  })

  const sortedEvents = events.sort((a, b) => {
    const aStart = a.startTime || '00:00'
    const bStart = b.startTime || '00:00'
    return aStart.localeCompare(bStart)
  })

  const getEventPosition = (event) => {
    if (!event.startTime) return { top: 0, height: 60 }
    
    const [startHour, startMinute] = event.startTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMinute
    
    let endMinutes = startMinutes + 60 // Default 1 hour
    if (event.endTime) {
      const [endHour, endMinute] = event.endTime.split(':').map(Number)
      endMinutes = endHour * 60 + endMinute
    }
    
    const duration = endMinutes - startMinutes
    const top = (startMinutes / 60) * 60 // 60px per hour
    const height = Math.max((duration / 60) * 60, 30) // Minimum 30px height
    
    return { top, height }
  }

  const now = dayjs()
  const currentHour = now.hour()
  const currentMinute = now.minute()
  const currentTimePosition = (currentHour + currentMinute / 60) * 60

  return (
    <div className="day-view bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b-2 border-gray-300 p-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {currentDate.format('dddd, MMMM D, YYYY')}
            </h2>
            <p className="text-sm text-gray-600">
              {events.length} event{events.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          <button
            onClick={() => onDateClick(currentDate)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Add Event
          </button>
        </div>
      </div>

      {/* Time grid */}
      <div className="relative">
        {/* Time slots */}
        <div className="flex">
          {/* Time labels */}
          <div className="w-20 flex-shrink-0">
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className="h-15 border-b border-gray-200 flex items-start justify-end pr-2 pt-1"
                style={{ height: '60px' }}
              >
                <span className="text-xs text-gray-500 font-medium">{time}</span>
              </div>
            ))}
          </div>

          {/* Event area */}
          <div className="flex-1 relative border-l-2 border-gray-300">
            {/* Hour lines */}
            {timeSlots.map((time, index) => (
              <div
                key={time}
                className="h-15 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                style={{ height: '60px' }}
                onClick={() => {
                  const eventDate = currentDate.hour(index).minute(0)
                  onDateClick(eventDate)
                }}
              />
            ))}

            {/* Current time indicator */}
            {currentDate.isSame(now, 'day') && (
              <div
                className="absolute left-0 right-0 z-20 pointer-events-none"
                style={{ top: `${currentTimePosition}px` }}
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                  <div className="flex-1 h-0.5 bg-red-500"></div>
                </div>
              </div>
            )}

            {/* Events */}
            {sortedEvents.map((event, index) => {
              const position = getEventPosition(event)
              const colors = [
                'from-blue-400 to-blue-600',
                'from-purple-400 to-purple-600',
                'from-emerald-400 to-emerald-600',
                'from-orange-400 to-orange-600',
                'from-pink-400 to-pink-600',
                'from-indigo-400 to-indigo-600',
                'from-teal-400 to-teal-600',
                'from-rose-400 to-rose-600'
              ]
              const colorClass = colors[index % colors.length]

              return (
                <div
                  key={event.id}
                  className={`absolute left-2 right-2 bg-gradient-to-r ${colorClass} text-white rounded-lg p-2 shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl z-10`}
                  style={{
                    top: `${position.top}px`,
                    height: `${position.height}px`,
                    minHeight: '30px'
                  }}
                  onClick={() => onEventClick(event)}
                >
                  <div className="h-full flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm truncate">{event.title}</h3>
                      {event.startTime && event.endTime && (
                        <p className="text-xs opacity-90">
                          {event.startTime} - {event.endTime}
                        </p>
                      )}
                    </div>
                    {event.description && position.height > 50 && (
                      <p className="text-xs opacity-80 line-clamp-2 mt-1">
                        {event.description}
                      </p>
                    )}
                    {event.group && position.height > 70 && (
                      <span className="inline-block bg-white bg-opacity-20 text-xs px-2 py-1 rounded mt-1 self-start">
                        {event.group}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DayView