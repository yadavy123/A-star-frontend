/** Student notifications page - view and mark notifications as read. */
import React, { useState } from 'react'
import Pagination from '../ui/Pagination'

export default function Notifications() {
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 100
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'assignment',
      title: 'New Assignment Posted',
      message: 'Calculus Problem Set 3 has been posted. Due date: Jan 25, 2026',
      time: '2 hours ago',
      icon: '📝',
      color: '#1e3a8a',
      read: false
    },
    {
      id: 3,
      type: 'class',
      title: 'Class Reminder',
      message: 'Mathematics class starting in 30 minutes at 4:00 PM',
      time: '6 hours ago',
      icon: '⏰',
      color: '#f59e0b',
      read: false
    },
    {
      id: 4,
      type: 'material',
      title: 'New Study Material',
      message: 'Chemistry notes for Chapter 5 have been uploaded',
      time: '1 day ago',
      icon: '📄',
      color: '#1e3a8a',
      read: true
    },
    {
      id: 5,
      type: 'announcement',
      title: 'Important Announcement',
      message: 'Physics Midterm exam scheduled for Jan 28, 2026 at 2:00 PM',
      time: '1 day ago',
      icon: '📢',
      color: '#dc3545',
      read: true
    },
    {
      id: 6,
      type: 'class',
      title: 'Class Cancelled',
      message: 'Computer Science class on Jan 18 has been cancelled',
      time: '3 days ago',
      icon: '🚫',
      color: '#ffc107',
      read: true
    },
    {
      id: 7,
      type: 'event',
      title: 'Upcoming Workshop',
      message: 'Join our Python Programming workshop on Jan 30, 2026',
      time: '3 days ago',
      icon: '🛠️',
      color: '#f59e0b',
      read: true
    }
  ])
  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter)

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + itemsPerPage)

  const unreadCount = notifications.filter(n => !n.read).length
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id 
        ? { ...notification, read: true }
        : notification
    ))
  }
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })))
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-normal text-[#0a0b0d]" style={{ lineHeight: 1.15, letterSpacing: '-0.5px' }}>Notifications</h2>
          <p className="text-[#7c828a] text-sm">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          className="px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
          style={{ height: 44, lineHeight: 1.15 }}
        >
          Mark All as Read
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-[24px] border border-[#dee1e6]">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-[12px] font-semibold transition-all text-sm ${
            filter === 'all' ? 'text-white' : 'text-[#5b616e] hover:bg-[#f7f7f7]'
          }`}
          style={{ backgroundColor: filter === 'all' ? '#0052ff' : 'transparent' }}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-[12px] font-semibold transition-all text-sm ${
            filter === 'unread' ? 'text-white' : 'text-[#5b616e] hover:bg-[#f7f7f7]'
          }`}
          style={{ backgroundColor: filter === 'unread' ? '#dc3545' : 'transparent' }}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('assignment')}
          className={`px-4 py-2 rounded-[12px] font-semibold transition-all text-sm ${
            filter === 'assignment' ? 'text-white' : 'text-[#5b616e] hover:bg-[#f7f7f7]'
          }`}
          style={{ backgroundColor: filter === 'assignment' ? '#f59e0b' : 'transparent' }}
        >
          Assignments
        </button>
        <button
          onClick={() => setFilter('class')}
          className={`px-4 py-2 rounded-[12px] font-semibold transition-all text-sm ${
            filter === 'class' ? 'text-white' : 'text-[#5b616e] hover:bg-[#f7f7f7]'
          }`}
          style={{ backgroundColor: filter === 'class' ? '#0052ff' : 'transparent' }}
        >
          Classes
        </button>
        <button
          onClick={() => setFilter('announcement')}
          className={`px-4 py-2 rounded-[12px] font-semibold transition-all text-sm ${
            filter === 'announcement' ? 'text-white' : 'text-[#5b616e] hover:bg-[#f7f7f7]'
          }`}
          style={{ backgroundColor: filter === 'announcement' ? '#dc3545' : 'transparent' }}
        >
          Announcements
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {paginatedNotifications.length > 0 ? (
          paginatedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white border border-[#dee1e6] rounded-[24px] transition-all p-6 border-l-4 ${
                !notification.read ? 'border-l-4' : ''
              }`}
              style={{
                borderLeftColor: !notification.read ? notification.color : '#e0e0e0',
                backgroundColor: 'white'
              }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1 text-[#0a0b0d]">
                        {notification.title}
                        {!notification.read && (
                          <span
                            className="ml-3 px-2 py-1 rounded-[100px] text-xs font-semibold text-white"
                            style={{ backgroundColor: '#dc3545' }}
                          >
                            NEW
                          </span>
                        )}
                      </h3>
                      <p className="text-[#5b616e] mb-2">{notification.message}</p>
                      <p className="text-sm text-[#7c828a]">{notification.time}</p>
                    </div>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="mt-3 px-4 py-2 rounded-[12px] text-sm font-semibold transition-all border"
                      style={{
                        borderColor: notification.color,
                        color: notification.color,
                        backgroundColor: 'transparent'
                      }}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-[#dee1e6] rounded-[24px] p-12 text-center">
            <h3 className="text-2xl font-semibold mb-2 text-[#0a0b0d]">
              No Notifications
            </h3>
            <p className="text-[#5b616e]">You're all caught up! No notifications to show.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredNotifications.length}
        itemsPerPage={itemsPerPage}
        alwaysShow={true}
      />

    </div>
  )
}
