import React, { useState, useEffect } from 'react'
import { useCalendar } from '../contexts/CalendarContext'
import dayjs from 'dayjs'
import LoadingSpinner from './LoadingSpinner'

const Notifications = () => {
  const { events, updateEvent } = useCalendar()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateNotifications()
  }, [events])

  const generateNotifications = () => {
    const now = dayjs()
    const upcomingEvents = events.filter(event => {
      const eventDate = dayjs(event.date)
      return eventDate.isAfter(now) && eventDate.diff(now, 'day') <= 7
    })

    const notificationList = upcomingEvents.map(event => ({
      id: event.id,
      type: 'upcoming',
      title: event.title,
      message: `Upcoming event: ${event.title}`,
      date: event.date,
      startTime: event.startTime,
      event: event,
      priority: dayjs(event.date).diff(now, 'day') <= 1 ? 'high' : 'normal'
    }))

    // Add repeat notifications
    const repeatEvents = events.filter(event => event.repeat?.type !== 'none')
    repeatEvents.forEach(event => {
      notificationList.push({
        id: `repeat-${event.id}`,
        type: 'repeat',
        title: event.title,
        message: `Repeating ${event.repeat.type}: ${event.title}`,
        date: event.date,
        startTime: event.startTime,
        event: event,
        priority: 'normal'
      })
    })

    setNotifications(notificationList.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1
      if (b.priority === 'high' && a.priority !== 'high') return 1
      return dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1
    }))
  }

  const toggleRepeat = async (event) => {
    setLoading(true)
    try {
      const updatedRepeat = event.repeat?.type === 'none' 
        ? { type: 'weekly', weekdays: [], dates: [] }
        : { type: 'none', weekdays: [], dates: [] }

      await updateEvent(event.id, {
        ...event,
        repeat: updatedRepeat
      })
    } catch (error) {
      console.error('Failed to toggle repeat:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNotificationIcon = (type, priority) => {
    if (type === 'upcoming') {
      return priority === 'high' ? (
        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      ) : (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25l2.25 2.25v.75H2.25v-.75L4.5 12V9.75a6 6 0 0 1 6-6z" />
          </svg>
        </div>
      )
    }

    return (
      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
    )
  }

  const getTimeUntilEvent = (date) => {
    const now = dayjs()
    const eventDate = dayjs(date)
    const diff = eventDate.diff(now, 'day')
    
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Tomorrow'
    if (diff <= 7) return `In ${diff} days`
    return eventDate.format('MMM D')
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-600 mt-1">
          Stay updated with your upcoming events and reminders
        </p>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25l2.25 2.25v.75H2.25v-.75L4.5 12V9.75a6 6 0 0 1 6-6z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              You're all caught up! No upcoming events or reminders.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
                notification.priority === 'high' ? 'ring-2 ring-red-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {getNotificationIcon(notification.type, notification.priority)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {getTimeUntilEvent(notification.date)}
                    </span>
                  </div>
                  
                  <p className="mt-1 text-sm text-gray-600">
                    {notification.message}
                  </p>
                  
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6 0h6" />
                      </svg>
                      {dayjs(notification.date).format('MMM D, YYYY')}
                    </span>
                    {notification.startTime && (
                      <span className="flex items-center">
                        <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {notification.startTime}
                      </span>
                    )}
                  </div>
                </div>

                {notification.type === 'repeat' && (
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => toggleRepeat(notification.event)}
                      disabled={loading}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-200 ${
                        notification.event.repeat?.type !== 'none'
                          ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {loading ? (
                        <LoadingSpinner size="small" />
                      ) : notification.event.repeat?.type !== 'none' ? (
                        'Disable Repeat'
                      ) : (
                        'Enable Repeat'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Notifications