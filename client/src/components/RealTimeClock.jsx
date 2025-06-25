import React, { useState, useEffect } from 'react'

const RealTimeClock = () => {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="flex items-center space-x-2 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1 rounded-lg border border-emerald-200">
      <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
      <span className="text-sm font-mono font-bold text-emerald-700">
        {formatTime(time)}
      </span>
    </div>
  )
}

export default RealTimeClock