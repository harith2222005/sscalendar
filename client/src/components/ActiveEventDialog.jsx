import React, { useState, useEffect } from 'react'
import { useCalendar } from '../contexts/CalendarContext'
import dayjs from 'dayjs'

const ActiveEventDialog = () => {
  const { events } = useCalendar()
  const [activeEvent, setActiveEvent] = useState(null)
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    const checkActiveEvents = () => {
      const now = dayjs()
      const currentTime = now.format('HH:mm')
      const today = now.format('YYYY-MM-DD')

      // Find events happening right now
      const currentEvents = events.filter(event => {
        const eventDate = dayjs(event.date).format('YYYY-MM-DD')
        if (eventDate !== today) return false

        if (event.startTime && event.endTime) {
          return currentTime >= event.startTime && currentTime <= event.endTime
        }
        return false
      })

      // Find upcoming events (within next 30 minutes)
      const upcomingEvents = events.filter(event => {
        const eventDate = dayjs(event.date).format('YYYY-MM-DD')
        if (eventDate !== today) return false

        if (event.startTime) {
          const eventStart = dayjs(`${today} ${event.startTime}`)
          const timeDiff = eventStart.diff(now, 'minute')
          return timeDiff > 0 && timeDiff <= 30
        }
        return false
      })

      if (currentEvents.length > 0) {
        setActiveEvent({ ...currentEvents[0], status: 'active' })
        setShowDialog(true)
      } else if (upcomingEvents.length > 0) {
        setActiveEvent({ ...upcomingEvents[0], status: 'upcoming' })
        setShowDialog(true)
      } else {
        setShowDialog(false)
      }
    }

    // Check immediately
    checkActiveEvents()

    // Check every minute
    const interval = setInterval(checkActiveEvents, 60000)

    return () => clearInterval(interval)
  }, [events])

  if (!showDialog || !activeEvent) return null

  const getStatusColor = () => {
    return activeEvent.status === 'active' 
      ? 'from-emerald-400 to-teal-500' 
      : 'from-orange-400 to-amber-500'
  }

  const getStatusIcon = () => {
    if (activeEvent.status === 'active') {
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    } else {
      return (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    }
  }

  const getTimeUntilEvent = () => {
    if (activeEvent.status === 'active') {
      const endTime = dayjs(`${dayjs().format('YYYY-MM-DD')} ${activeEvent.endTime}`)
      const now = dayjs()
      const minutesLeft = endTime.diff(now, 'minute')
      return `${minutesLeft} minutes remaining`
    } else {
      const startTime = dayjs(`${dayjs().format('YYYY-MM-DD')} ${activeEvent.startTime}`)
      const now = dayjs()
      const minutesUntil = startTime.diff(now, 'minute')
      return `Starting in ${minutesUntil} minutes`
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className={`bg-gradient-to-r ${getStatusColor()} rounded-3xl shadow-2xl border-2 border-white p-6 max-w-sm transform transition-all duration-500 hover:scale-105`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white">
              {getStatusIcon()}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white truncate">
                {activeEvent.title}
              </h3>
              <button
                onClick={() => setShowDialog(false)}
                className="text-white hover:text-gray-200 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2 text-white text-opacity-90">
              <div className="flex items-center space-x-2 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">
                  {activeEvent.startTime} - {activeEvent.endTime}
                </span>
              </div>
              
              <div className="text-sm font-medium">
                {getTimeUntilEvent()}
              </div>
              
              {activeEvent.description && (
                <p className="text-sm text-white text-opacity-80 line-clamp-2">
                  {activeEvent.description}
                </p>
              )}
              
              {activeEvent.group && (
                <div className="inline-flex items-center px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                  {activeEvent.group}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Pulse animation for active events */}
        {activeEvent.status === 'active' && (
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-3xl opacity-30 animate-pulse" />
        )}
      </div>
    </div>
  )
}

export default ActiveEventDialog