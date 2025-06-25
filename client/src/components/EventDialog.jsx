import React, { useState, useEffect } from 'react'
import { useCalendar } from '../contexts/CalendarContext'
import dayjs from 'dayjs'

const EventDialog = ({ isOpen, onClose, selectedDate, event = null }) => {
  const { createEvent, updateEvent, deleteEvent } = useCalendar()
  const [formData, setFormData] = useState({
    title: '',
    date: selectedDate ? selectedDate.format('YYYY-MM-DD') : '',
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
      setFormData({
        title: event.title || '',
        date: dayjs(event.date).format('YYYY-MM-DD'),
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        description: event.description || '',
        group: event.group || '',
        repeat: event.repeat || { type: 'none', weekdays: [], dates: [] }
      })
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate.format('YYYY-MM-DD')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const eventData = {
        ...formData,
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {event ? 'Edit Event' : 'Create Event'}
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Event Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter event title"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Group</label>
                <input
                  type="text"
                  name="group"
                  value={formData.group}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Optional group name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-input"
                rows={3}
                placeholder="Optional description"
              />
            </div>

            <div>
              <label className="form-label">Repeat</label>
              <select
                value={formData.repeat.type}
                onChange={(e) => handleRepeatChange('type', e.target.value)}
                className="form-input"
              >
                <option value="none">No repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="flex justify-between pt-4">
              <div className="flex space-x-2">
                {event && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : event ? 'Update' : 'Create'}
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