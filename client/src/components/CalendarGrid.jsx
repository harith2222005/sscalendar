import React from 'react'
import { useCalendar } from '../contexts/CalendarContext'
import dayjs from 'dayjs'

const CalendarGrid = ({ onDateClick }) => {
  const { currentDate, getEventsForDate } = useCalendar()

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
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-green-100 text-green-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="calendar-container">
      {/* Day headers */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="px-2 py-3 text-center text-sm font-semibold text-gray-700">
            <span className="hidden sm:inline">{day}day</span>
            <span className="sm:hidden">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const isCurrentMonth = day.month() === currentDate.month()
          const isToday = day.isSame(today, 'day')
          const events = getEventsForDate(day)
          const maxVisibleEvents = 3

          return (
            <div
              key={index}
              className={`calendar-cell relative ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isToday ? 'today' : ''}`}
              onClick={() => onDateClick(day)}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-medium ${
                    isCurrentMonth
                      ? isToday
                        ? 'bg-purple-gradient text-white w-6 h-6 rounded-full flex items-center justify-center text-xs'
                        : 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {day.date()}
                </span>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {events.slice(0, maxVisibleEvents).map((event, eventIndex) => (
                  <div
                    key={event.id}
                    className={`event-chip ${getEventChipColor(eventIndex)}`}
                    title={`${event.title} - ${event.startTime || 'All day'}`}
                  >
                    <span className="block truncate text-xs">
                      {event.startTime && (
                        <span className="font-medium mr-1">{event.startTime}</span>
                      )}
                      {event.title}
                    </span>
                  </div>
                ))}

                {/* More events indicator */}
                {events.length > maxVisibleEvents && (
                  <div className="text-xs text-gray-500 font-medium px-1">
                    +{events.length - maxVisibleEvents} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarGrid