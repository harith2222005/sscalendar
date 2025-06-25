import React, { useState, useEffect } from 'react'
import { useCalendar } from '../contexts/CalendarContext'
import dayjs from 'dayjs'

const EventDialog = ({ isOpen, onClose, selectedDate, event = null }) => {
  const { createEvent, updateEvent, deleteEvent } = useCalendar()
  const [formData, setFormData] = useState({
    title: '',
    startDate: selectedDate ? selectedDate.format('YYYY-MM-DD') : '',
    endDate: selectedDate ? selectedDate.format('YYYY-MM-DD') : '',
    startTime: '',
    endTime: '',
    description: '',
    group: '',
    repeat: {
      type: 'none',
      weekdays: [],
      dates: []
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (event) {
      const eventStartDate = dayjs(event.startDate || event.date)
      const eventEndDate = dayjs(event.endDate || event.date)
      
      setFormData({
        title: event.title || '',
        startDate: eventStartDate.format('YYYY-MM-DD'),
        endDate: eventEndDate.format('YYYY-MM-DD'),
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        description: event.description || '',
        group: event.group || '',
        repeat: event.repeat || { type: 'none', weekdays: [], dates: [] }
      })
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        startDate: selectedDate.format('YYYY-MM-DD'),
        endDate: selectedDate.format('YYYY-MM-DD')
      }))
    }
  }, [event, selectedDate])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRepeatChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      repeat: {
        ...prev.repeat,
        [field]: value
      }
    }))
  }

  const handleWeekdayToggle = (day) => {
    const weekdays = formData.repeat.weekdays.includes(day)
      ? formData.repeat.weekdays.filter(d => d !== day)
      : [...formData.repeat.weekdays, day]
    
    handleRepeatChange('weekdays', weekdays)
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Event title is required')
      return false
    }
    
    if (!formData.startDate) {
      setError('Start date is required')
      return false
    }
    
    if (!formData.endDate) {
      setError('End date is required')
      return false
    }
    
    if (!formData.startTime) {
      setError('Start time is required')
      return false
    }
    
    if (!formData.endTime) {
      setError('End time is required')
      return false
    }
    
    // Validate date range
    const startDate = dayjs(formData.startDate)
    const endDate = dayjs(formData.endDate)
    
    if (endDate.isBefore(startDate)) {
      setError('End date cannot be before start date')
      return false
    }
    
    // Validate time range for same day events
    if (startDate.isSame(endDate, 'day')) {
      const startTime = dayjs(`2000-01-01 ${formData.startTime}`)
      const endTime = dayjs(`2000-01-01 ${formData.endTime}`)
      
      if (endTime.isBefore(startTime) || endTime.isSame(startTime)) {
        setError('End time must be after start time')
        return false
      }
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)

    try {
      const eventData = {
        ...formData,
        date: formData.startDate, // Keep for backward compatibility
        duration: formData.startTime && formData.endTime 
          ? dayjs(`2000-01-01 ${formData.endTime}`).diff(dayjs(`2000-01-01 ${formData.startTime}`), 'minute')
          : 0
      }

      const result = event 
        ? await updateEvent(event.id, eventData)
        : await createEvent(eventData)

      if (result.success) {
        onClose()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!event || !window.confirm('Are you sure you want to delete this event?')) return

    setLoading(true)
    try {
      const result = await deleteEvent(event.id)
      if (result.success) {
        onClose()
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to delete event')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const weekdays = [
    { id: 0, label: 'Sun', name: 'Sunday' },
    { id: 1, label: 'Mon', name: 'Monday' },
    { id: 2, label: 'Tue', name: 'Tuesday' },
    { id: 3, label: 'Wed', name: 'Wednesday' },
    { id: 4, label: 'Thu', name: 'Thursday' },
    { id: 5, label: 'Fri', name: 'Friday' },
    { id: 6, label: 'Sat', name: 'Saturday' }
  ]

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-3xl p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {event ? 'Edit Event' : 'Create New Event'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-medium"
                placeholder="Enter event title"
                required
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Group Name */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Group Name</label>
              <input
                type="text"
                name="group"
                value={formData.group}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Optional group name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                rows={4}
                placeholder="Optional description"
              />
            </div>

            {/* Repeat Options */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Repeat Option</label>
              <select
                value={formData.repeat.type}
                onChange={(e) => handleRepeatChange('type', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 mb-4"
              >
                <option value="none">No repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>

              {/* Weekly repeat options */}
              {formData.repeat.type === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Days</label>
                  <div className="grid grid-cols-7 gap-2">
                    {weekdays.map((day) => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleWeekdayToggle(day.id)}
                        className={`p-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                          formData.repeat.weekdays.includes(day.id)
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                        }`}
                        title={day.name}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span>{day.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                {event && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3 text-sm font-bold text-red-600 border-2 border-red-300 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-all duration-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-8 py-3 text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{event ? 'Update Event' : 'Create Event'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EventDialog