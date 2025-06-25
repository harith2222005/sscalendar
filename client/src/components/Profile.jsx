import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useCalendar } from '../contexts/CalendarContext'
import dayjs from 'dayjs'

const Profile = () => {
  const { user } = useAuth()
  const { events } = useCalendar()
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    groupsManaged: 0,
    lastLogin: null
  })

  useEffect(() => {
    calculateStats()
  }, [events])

  const calculateStats = () => {
    const now = dayjs()
    const upcomingEvents = events.filter(event => dayjs(event.date).isAfter(now))
    const groups = [...new Set(events.filter(event => event.group).map(event => event.group))]

    setStats({
      totalEvents: events.length,
      upcomingEvents: upcomingEvents.length,
      groupsManaged: groups.length,
      lastLogin: user?.lastLogin || now.toISOString()
    })
  }

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() || 'U'
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-600 mt-1">
          Your account information and activity summary
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              {user?.picture ? (
                <img
                  className="mx-auto h-24 w-24 rounded-full"
                  src={user.picture}
                  alt={user.name}
                />
              ) : (
                <div className="mx-auto h-24 w-24 bg-ocean-gradient rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {getInitials(user?.name)}
                  </span>
                </div>
              )}
              
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {user?.name}
              </h3>
              <p className="text-sm text-gray-600">{user?.email}</p>
              
              <div className="mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <dl className="space-y-3">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Member since</dt>
                  <dd className="text-gray-900">
                    {user?.createdAt ? dayjs(user.createdAt).format('MMM YYYY') : 'Recently'}
                  </dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Last login</dt>
                  <dd className="text-gray-900">
                    {dayjs(stats.lastLogin).format('MMM D, YYYY')}
                  </dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-600">Account status</dt>
                  <dd className="text-green-600 font-medium">Active</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Summary</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m6-10v10m-6 0h6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-900">Total Events</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalEvents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-900">Upcoming Events</p>
                    <p className="text-2xl font-bold text-green-900">{stats.upcomingEvents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-900">Groups Managed</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.groupsManaged}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-900">This Month</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {events.filter(event => 
                        dayjs(event.date).month() === dayjs().month() &&
                        dayjs(event.date).year() === dayjs().year()
                      ).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Authentication</p>
                  <p className="text-sm text-gray-600">Signed in with Google</p>
                </div>
                <div className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Verified</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">Data Sync</p>
                  <p className="text-sm text-gray-600">Events synchronized across devices</p>
                </div>
                <div className="flex items-center text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Notifications</p>
                  <p className="text-sm text-gray-600">Email reminders for upcoming events</p>
                </div>
                <div className="flex items-center text-blue-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile