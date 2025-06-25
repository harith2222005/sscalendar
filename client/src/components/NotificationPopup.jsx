import React, { useState, useEffect } from 'react'
import { useCalendar } from '../contexts/CalendarContext'
import dayjs from 'dayjs'

const NotificationPopup = () => {
  const { events } = useCalendar()
  const [notifications, setNotifications] = useState([])
  const [dismissedNotifications, setDismissedNotifications] = useState(new Set())

  useEffect(() => {
    const checkNotifications = () => {
      const now = dayjs()
      const today = now.format('YYYY-MM-DD')
      
      // Get today's events
      const todayEvents = events.filter(event => {
        const eventDate = dayjs(event.date).format('YYYY-MM-DD')
        return eventDate === today
      })

      // Create notifications for events that haven't been dismissed today
      const newNotifications = todayEvents
        .filter(event => !dismissedNotifications.has(`${event.id}-${today}`))
        .map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          startTime: event.startTime,
          endTime: event.endTime,
          group: event.group,
          date: today,
          isRepeating: event.repeat?.type !== 'none'
        }))

      setNotifications(newNotifications)
    }

    // Check immediately
    checkNotifications()

    // Check every minute
    const interval = setInterval(checkNotifications, 60000)

    return () => clearInterval(interval)
  }, [events, dismissedNotifications])

  const dismissNotification = (notificationId, date) => {
    const dismissKey = `${notificationId}-${date}`
    setDismissedNotifications(prev => new Set([...prev, dismissKey]))
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={`${notification.id}-${notification.date}`}
          className="bg-white rounded-xl shadow-2xl border-2 border-blue-200 p-4 transform transition-all duration-500 animate-slide-in"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse"></div>
                <h3 className="text-sm font-bold text-gray-900 truncate">
                  Event Reminder
                </h3>
                {notification.isRepeating && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Repeating
                  </span>
                )}
              </div>
              
              <h4 className="text-lg font-bold text-gray-900 mb-1">
                {notification.title}
              </h4>
              
              {notification.startTime && (
                <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>
                    {notification.startTime}
                    {notification.endTime && ` - ${notification.endTime}`}
                  </span>
                </div>
              )}
              
              {notification.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {notification.description}
                </p>
              )}
              
              {notification.group && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {notification.group}
                </span>
              )}
            </div>
            
            <button
              onClick={() => dismissNotification(notification.id, notification.date)}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
              title="Dismiss notification"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationPopup