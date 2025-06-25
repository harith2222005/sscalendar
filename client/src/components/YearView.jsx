import React from 'react'
import { useCalendar } from '../contexts/CalendarContext'
import dayjs from 'dayjs'

const YearView = ({ onDateClick }) => {
  const { currentDate, getEventsForDate } = useCalendar()
  
  const months = Array.from({ length: 12 }, (_, i) => {
    return currentDate.month(i).startOf('month')
  })

  const generateMonthDays = (monthDate) => {
    const startOfMonth = monthDate.startOf('month')
    const endOfMonth = monthDate.endOf('month')
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

  const today = dayjs()

  return (
    <div className="year-view bg-white p-6">
      {/* Year header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {currentDate.format('YYYY')}
        </h1>
      </div>

      {/* Months grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {months.map((monthDate) => {
          const days = generateMonthDays(monthDate)
          
          return (
            <div key={monthDate.month()} className="month-mini bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
              {/* Month header */}
              <div className="text-center mb-3">
                <h3 className="text-lg font-bold text-gray-900">
                  {monthDate.format('MMMM')}
                </h3>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={index} className="text-center text-xs font-medium text-gray-500 p-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const isCurrentMonth = day.month() === monthDate.month()
                  const isToday = day.isSame(today, 'day')
                  const events = getEventsForDate(day)
                  const hasEvents = events.length > 0

                  return (
                    <div
                      key={index}
                      className={`aspect-square flex items-center justify-center text-xs cursor-pointer transition-all duration-200 rounded ${
                        isCurrentMonth
                          ? isToday
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold shadow-md'
                            : hasEvents
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-medium hover:from-emerald-500 hover:to-teal-600'
                            : 'text-gray-900 hover:bg-blue-100 hover:text-blue-700'
                          : 'text-gray-400'
                      }`}
                      onClick={() => isCurrentMonth && onDateClick(day)}
                      title={isCurrentMonth && hasEvents ? `${events.length} event${events.length !== 1 ? 's' : ''}` : ''}
                    >
                      <span className="relative">
                        {day.date()}
                        {hasEvents && isCurrentMonth && !isToday && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"></div>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Month stats */}
              <div className="mt-3 text-center">
                <span className="text-xs text-gray-600">
                  {getEventsForDate(monthDate).length + 
                   Array.from({ length: monthDate.daysInMonth() }, (_, i) => 
                     getEventsForDate(monthDate.date(i + 1))
                   ).reduce((total, dayEvents) => total + dayEvents.length, 0)} events
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default YearView