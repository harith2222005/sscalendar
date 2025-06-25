import React, { useState } from 'react'
import { useCalendar } from '../contexts/CalendarContext'
import CalendarGrid from './CalendarGrid'
import EventDialog from './EventDialog'
import CalendarFilters from './CalendarFilters'
import CalendarViewToggle from './CalendarViewToggle'
import ActiveEventDialog from './ActiveEventDialog'
import DayView from './DayView'
import YearView from './YearView'
import RealTimeClock from './RealTimeClock'
import dayjs from 'dayjs'

const Home = () => {
  const { currentDate, navigateMonth, selectedDate, setSelectedDate, setCurrentDate } = useCalendar()
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [calendarView, setCalendarView] = useState('month') // 'month', 'day', 'year'
  const [selectedEvent, setSelectedEvent] = useState(null)

  const handleDateClick = (date, fromPlusIcon = false) => {
    setSelectedDate(date)
    if (fromPlusIcon) {
      setSelectedEvent(null)
      setShowEventDialog(true)
    }
  }

  const handleEventClick = (event) => {
    setSelectedEvent(event)
    setSelectedDate(dayjs(event.date))
    setShowEventDialog(true)
  }

  const handleCloseDialog = () => {
    setShowEventDialog(false)
    setSelectedDate(null)
    setSelectedEvent(null)
  }

  const handleDateFilter = (date) => {
    setCurrentDate(dayjs(date))
  }

  const handleViewChange = (view) => {
    setCalendarView(view)
  }

  const renderCalendarView = () => {
    switch (calendarView) {
      case 'day':
        return <DayView onEventClick={handleEventClick} onDateClick={handleDateClick} />
      case 'year':
        return <YearView onDateClick={handleDateClick} />
      case 'month':
      default:
        return <CalendarGrid onDateClick={handleDateClick} onEventClick={handleEventClick} />
    }
  }

  return (
    <div className="p-4 lg:p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 shrink-0">
        <div className="mb-4 lg:mb-0">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6 0h6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {calendarView === 'year' ? currentDate.format('YYYY') : currentDate.format('MMMM YYYY')}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Today is {dayjs().format('dddd, MMMM D, YYYY')}</span>
                </div>
                <RealTimeClock />
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation and Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Calendar View Toggle */}
          <CalendarViewToggle currentView={calendarView} onViewChange={handleViewChange} />
          
          {/* Date Filters */}
          <CalendarFilters currentDate={currentDate} onDateChange={handleDateFilter} />
          
          {/* Navigation Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg group"
            >
              <svg className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => setCurrentDate(dayjs())}
              className="px-6 py-3 text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Today
            </button>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-3 rounded-xl bg-white border border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg group"
            >
              <svg className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="w-auto h-auto bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl overflow-hidden flex-grow">
        {renderCalendarView()}
      </div>

      {/* Event Dialog */}
      {showEventDialog && (
        <EventDialog
          isOpen={showEventDialog}
          onClose={handleCloseDialog}
          selectedDate={selectedDate}
          event={selectedEvent}
        />
      )}

      {/* Active Event Dialog */}
      <ActiveEventDialog />
    </div>
  )
}

export default Home