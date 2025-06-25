import React, { useState } from 'react'
import { useCalendar } from '../contexts/CalendarContext'
import CalendarGrid from './CalendarGrid'
import EventDialog from './EventDialog'
import dayjs from 'dayjs'

const Home = () => {
  const { currentDate, navigateMonth, selectedDate, setSelectedDate } = useCalendar()
  const [showEventDialog, setShowEventDialog] = useState(false)

  const handleDateClick = (date) => {
    setSelectedDate(date)
    setShowEventDialog(true)
  }

  const handleCloseDialog = () => {
    setShowEventDialog(false)
    setSelectedDate(null)
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            {currentDate.format('MMMM YYYY')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Today is {dayjs().format('dddd, MMMM D, YYYY')}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => setCurrentDate(dayjs())}
            className="px-4 py-2 text-sm font-medium text-ocean-blue-start border border-ocean-blue-start rounded-lg hover:bg-ocean-blue-start hover:text-white transition-colors duration-200"
          >
            Today
          </button>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <CalendarGrid onDateClick={handleDateClick} />
      </div>

      {/* Event Dialog */}
      {showEventDialog && (
        <EventDialog
          isOpen={showEventDialog}
          onClose={handleCloseDialog}
          selectedDate={selectedDate}
        />
      )}
    </div>
  )
}

export default Home