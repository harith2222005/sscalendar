import React, { useState } from 'react'
import dayjs from 'dayjs'

const CalendarFilters = ({ currentDate, onDateChange }) => {
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(currentDate.month())
  const [selectedYear, setSelectedYear] = useState(currentDate.year())

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = dayjs().year()
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  const handleApplyFilter = () => {
    const newDate = dayjs().month(selectedMonth).year(selectedYear)
    onDateChange(newDate)
    setShowFilters(false)
  }

  const handleMonthChange = (month) => {
    setSelectedMonth(month)
    const newDate = dayjs().month(month).year(selectedYear)
    onDateChange(newDate)
  }

  const handleYearChange = (year) => {
    setSelectedYear(year)
    const newDate = dayjs().month(selectedMonth).year(year)
    onDateChange(newDate)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center space-x-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-300 transition-all duration-300 shadow-md hover:shadow-lg group"
      >
        <svg className="w-5 h-5 text-gray-600 group-hover:text-purple-600 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
        </svg>
        <span className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Filters</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showFilters && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50 min-w-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Date Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Month Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <div className="grid grid-cols-3 gap-2">
                {months.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => handleMonthChange(index)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                      selectedMonth === index
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                    }`}
                  >
                    {month.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Year Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearChange(year)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                      selectedYear === year
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const today = dayjs()
                    setSelectedMonth(today.month())
                    setSelectedYear(today.year())
                    onDateChange(today)
                    setShowFilters(false)
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Today
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarFilters