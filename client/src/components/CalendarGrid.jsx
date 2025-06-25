import React from 'react'
import { useCalendar } from '../contexts/CalendarContext'
import dayjs from 'dayjs'

const CalendarGrid = ({ onDateClick }) => {
  const { currentDate, getEventsForDate, navigateMonth } = useCalendar()

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

  const handleDateClick = (day) => {
    const isCurrentMonth = day.month() === currentDate.month()
    
    if (!isCurrentMonth) {
      // Navigate to the clicked month
      if (day.isBefore(currentDate.startOf('month'))) {
        navigateMonth('prev')
      } else {
        navigateMonth('next')
      }
      // Small delay to allow month navigation to complete
      setTimeout(() => {
        onDateClick(day)
      }, 100)
    } else {
      onDateClick(day)
    }
  }

  return (
    <div className="calendar-container bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-b border-gray-200">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
          <div key={day} className="px-2 py-4 text-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                index === 0 || index === 6 
                  ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg' 
                  : 'bg-gradient-to-br from-indigo-400 to-purple-500 text-white shadow-lg'
              }`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-700 hidden sm:inline">{day}</span>
              <span className="text-xs font-bold text-gray-700 sm:hidden">{day.slice(0, 3)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((day, index) => {
          const isCurrentMonth = day.month() === currentDate.month()
          const isToday = day.isSame(today, 'day')
          const events = getEventsForDate(day)
          const maxVisibleEvents = 2

          return (
            <div
              key={index}
              className={`calendar-cell relative min-h-[120px] sm:min-h-[140px] p-2 border border-gray-100 transition-all duration-300 cursor-pointer group ${
                isCurrentMonth 
                  ? isToday 
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 ring-2 ring-blue-400 shadow-lg' 
                    : 'bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 hover:shadow-md'
                  : 'bg-gray-50 hover:bg-gray-100 opacity-60 hover:opacity-80'
              }`}
              onClick={() => handleDateClick(day)}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-2">
                <div className={`flex items-center justify-center transition-all duration-300 ${
                  isCurrentMonth
                    ? isToday
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-8 h-8 rounded-full shadow-lg transform group-hover:scale-110'
                      : 'text-gray-900 font-semibold group-hover:text-indigo-600 group-hover:font-bold'
                    : 'text-gray-400 group-hover:text-gray-600'
                }`}>
                  <span className="text-sm">{day.date()}</span>
                </div>
                
                {/* Event count indicator */}
                {events.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${
                      events.length > 3 
                        ? 'bg-gradient-to-r from-red-400 to-pink-500 shadow-md' 
                        : 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-md'
                    }`} />
                    {events.length > 1 && (
                      <span className="text-xs font-bold text-gray-600 bg-white rounded-full px-1.5 py-0.5 shadow-sm">
                        {events.length}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {events.slice(0, maxVisibleEvents).map((event, eventIndex) => (
                  <div
                    key={event.id}
                    className={`event-chip ${getEventChipColor(eventIndex)} rounded-lg px-2 py-1 transform transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                    title={`${event.title} - ${event.startTime || 'All day'}`}
                  >
                    <div className="flex items-center space-x-1">
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                ))}

                {/* More events indicator */}
                {events.length > maxVisibleEvents && (
                  <div className="bg-gradient-to-r from-gray-400 to-gray-600 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path d="M10 4a2 2 0 100-4 2 2 0 000 4z" />
                      <path d="M10 20a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    <span>+{events.length - maxVisibleEvents} more</span>
                  </div>
                )}
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-100 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg pointer-events-none" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarGrid