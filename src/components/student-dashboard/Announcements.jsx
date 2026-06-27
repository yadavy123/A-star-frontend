/** Student announcements page - view announcements with subject filter. */
import React, { useState, useEffect } from 'react'
import Pagination from '../ui/Pagination'

const STATIC_ANNOUNCEMENTS = [
  { id: 'static1', title: 'Important: Midterm Exam Schedule Released', message: 'The midterm examination schedule for all subjects has been released. Please check your schedule section for detailed timings.', category: 'exam', priority: 'high', date: '2 hours ago', postedBy: 'Admin' },
  { id: 'static2', title: 'Holiday Notice - Republic Day', message: 'Our institute will remain closed on January 26, 2026 on account of Republic Day. Classes will resume on January 27, 2026.', category: 'holiday', priority: 'medium', date: '1 day ago', postedBy: 'Admin' },
  { id: 'static3', title: 'New Course Materials Uploaded', message: 'New study materials for Mathematics and Physics have been uploaded to the course section. Students are advised to download and review them.', category: 'academic', priority: 'medium', date: '2 days ago', postedBy: 'Academic Dept' },
  { id: 'static4', title: 'Fee Payment Reminder', message: 'This is a reminder that the last date for Term 2 fee payment is February 28, 2026. Please clear your dues before the deadline to avoid late fees.', category: 'payment', priority: 'high', date: '3 days ago', postedBy: 'Accounts Dept' },
]

const loadAnnouncements = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('icfy_announcements') || 'null')
    if (saved && saved.length > 0) {
      // Map admin format to student display format
      const mapped = saved.map(a => ({
        ...a,
        date: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-GB') : 'Recent',
        postedBy: 'Admin',
        category: a.category || 'general',
        priority: a.priority || 'medium',
      }))
      // Put admin announcements first, then static ones not already covered
      return mapped
    }
  } catch {}
  return STATIC_ANNOUNCEMENTS
}

export default function Announcements() {
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [announcements, setAnnouncements] = useState(loadAnnouncements)
  const itemsPerPage = 100

  // Reload if admin updates announcements while student is logged in
  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncements(loadAnnouncements())
    }, 5000) // Refresh every 5s
    return () => clearInterval(interval)
  }, [])

  const filteredAnnouncements = filter === 'all'
    ? announcements
    : announcements.filter(a => a.category === filter)

  // Pagination
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAnnouncements = filteredAnnouncements.slice(startIndex, startIndex + itemsPerPage)

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#dc3545'
      case 'medium':
        return '#ffc107'
      case 'low':
        return '#28a745'
      default:
        return '#1e3a8a'
    }
  }

  const getCategoryIcon = (category) => {
    return null
  }

  const getCategoryName = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  const highPriorityCount = announcements.filter(a => a.priority === 'high').length

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div>
        <h2 className="text-2xl font-normal text-[#0a0b0d]" style={{ lineHeight: 1.15, letterSpacing: '-0.5px' }}>Announcements</h2>
        <p className="text-[#7c828a] text-sm mt-1">Stay updated with important notices and updates</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4 border-blue-700">
          <h3 className="text-sm font-semibold text-[#5b616e] mb-2">Total Announcements</h3>
          <p className="text-4xl font-bold text-blue-900">{announcements.length}</p>
        </div>
        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4 border-red-400">
          <h3 className="text-sm font-semibold text-[#5b616e] mb-2">High Priority</h3>
          <p className="text-4xl font-bold text-red-500">{highPriorityCount}</p>
        </div>
        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-semibold text-[#5b616e] mb-2">This Week</h3>
          <p className="text-4xl font-bold text-green-600">5</p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-white border border-[#dee1e6] rounded-[24px] p-4">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-[12px] font-semibold transition-all text-sm ${filter === 'all' ? 'bg-[#0052ff] text-white' : 'text-[#5b616e] hover:bg-[#f7f7f7]'}`}>All</button>
          <button onClick={() => setFilter('exam')} className={`px-4 py-2 rounded-[12px] font-semibold transition-all text-sm ${filter === 'exam' ? 'bg-[#0052ff] text-white' : 'text-[#5b616e] hover:bg-[#f7f7f7]'}`}>Exam</button>
          <button
            onClick={() => setFilter('academic')}
            className={`px-4 py-2 rounded-[12px] font-semibold transition-all text-sm ${
              filter === 'academic' ? 'text-white' : 'text-[#5b616e] hover:bg-[#f7f7f7]'
            }`}
            style={{ backgroundColor: filter === 'academic' ? '#0052ff' : 'transparent' }}
          >
            Academic
          </button>
          <button
            onClick={() => setFilter('class')}
            className={`px-4 py-2 rounded-[12px] font-semibold transition-all text-sm ${
              filter === 'class' ? 'text-white' : 'text-[#5b616e] hover:bg-[#f7f7f7]'
            }`}
            style={{ backgroundColor: filter === 'class' ? '#0052ff' : 'transparent' }}
          >
            Class
          </button>
          <button
            onClick={() => setFilter('event')}
            className={`px-4 py-2 rounded-[12px] font-semibold transition-all text-sm ${
              filter === 'event' ? 'text-white' : 'text-[#5b616e] hover:bg-[#f7f7f7]'
            }`}
            style={{ backgroundColor: filter === 'event' ? '#0052ff' : 'transparent' }}
          >
            Events
          </button>
          <button
            onClick={() => setFilter('payment')}
            className={`px-4 py-2 rounded-[12px] font-semibold transition-all text-sm ${
              filter === 'payment' ? 'text-white' : 'text-[#5b616e] hover:bg-[#f7f7f7]'
            }`}
            style={{ backgroundColor: filter === 'payment' ? '#0052ff' : 'transparent' }}
          >
            Payment
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {paginatedAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            className="bg-white border border-[#dee1e6] rounded-[24px] p-6 transition-all border-l-4"
            style={{ borderLeftColor: getPriorityColor(announcement.priority) }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-semibold text-[#0a0b0d]">
                        {announcement.title}
                      </h3>
                      <span
                        className="px-3 py-1 rounded-[100px] text-xs font-semibold text-white"
                        style={{ backgroundColor: getPriorityColor(announcement.priority) }}
                      >
                        {announcement.priority.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 rounded-[100px] text-xs font-semibold" style={{ backgroundColor: '#f59e0b', color: 'white' }}>
                        {getCategoryName(announcement.category)}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-[#5b616e] whitespace-nowrap ml-4">{announcement.date}</span>
                </div>
                <p className="text-[#5b616e] mb-3">{announcement.message}</p>
                <div className="flex items-center gap-2 text-sm text-[#5b616e]">
                  <span className="font-semibold">Posted by:</span>
                  <span>{announcement.postedBy}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredAnnouncements.length}
        itemsPerPage={itemsPerPage}
        alwaysShow={true}
      />

      {filteredAnnouncements.length === 0 && (
        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-12 text-center">
          <h3 className="text-2xl font-semibold mb-2 text-[#0a0b0d]">
            No Announcements
          </h3>
          <p className="text-[#5b616e]">No announcements found for this category.</p>
        </div>
      )}
    </div>
  )
}
