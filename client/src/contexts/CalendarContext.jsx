import React, { createContext, useContext, useState, useEffect } from 'react'
import dayjs from 'dayjs'
import axios from 'axios'
import { useAuth } from './AuthContext'

const CalendarContext = createContext()

export const useCalendar = () => {
  const context = useContext(CalendarContext)
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider')
  }
  return context
}

export const CalendarProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents()
    }
  }, [isAuthenticated, currentDate])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const startDate = currentDate.startOf('month').subtract(7, 'day')
      const endDate = currentDate.endOf('month').add(7, 'day')
      
      const response = await axios.get('/api/events', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      })
      
      setEvents(response.data.events || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (eventData) => {
    try {
      const response = await axios.post('/api/events', eventData)
      const newEvent = response.data.event
      setEvents(prev => [...prev, newEvent])
      return { success: true, event: newEvent }
    } catch (error) {
      console.error('Failed to create event:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to create event' }
    }
  }

  const updateEvent = async (eventId, eventData) => {
    try {
      const response = await axios.put(`/api/events/${eventId}`, eventData)
      const updatedEvent = response.data.event
      setEvents(prev => prev.map(event => 
        event.id === eventId ? updatedEvent : event
      ))
      return { success: true, event: updatedEvent }
    } catch (error) {
      console.error('Failed to update event:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to update event' }
    }
  }

  const deleteEvent = async (eventId) => {
    try {
      await axios.delete(`/api/events/${eventId}`)
      setEvents(prev => prev.filter(event => event.id !== eventId))
      return { success: true }
    } catch (error) {
      console.error('Failed to delete event:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to delete event' }
    }
  }

  const searchEvents = async (query, filters = {}) => {
    try {
      const response = await axios.get('/api/search', {
        params: { query, ...filters }
      })
      return { success: true, results: response.data.results || [] }
    } catch (error) {
      console.error('Search failed:', error)
      return { success: false, error: error.response?.data?.message || 'Search failed' }
    }
  }

  const uploadEventsJSON = async (jsonData) => {
    try {
      const response = await axios.post('/api/events/upload', { events: jsonData })
      const newEvents = response.data.events || []
      setEvents(prev => [...prev, ...newEvents])
      return { success: true, events: newEvents }
    } catch (error) {
      console.error('Failed to upload events:', error)
      return { success: false, error: error.response?.data?.message || 'Failed to upload events' }
    }
  }

  const getEventsForDate = (date) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD')
    return events.filter(event => {
      const eventDate = dayjs(event.date).format('YYYY-MM-DD')
      return eventDate === dateStr
    })
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => 
      direction === 'next' ? prev.add(1, 'month') : prev.subtract(1, 'month')
    )
  }

  const value = {
    currentDate,
    setCurrentDate,
    events,
    loading,
    selectedDate,
    setSelectedDate,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    searchEvents,
    uploadEventsJSON,
    getEventsForDate,
    navigateMonth
  }

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  )
}