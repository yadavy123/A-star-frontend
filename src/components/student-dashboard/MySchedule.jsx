/** Class schedule view - weekly timetable with enrolled class details. */
import React, { useState } from 'react'

export default function MySchedule() {
  const [view, setView] = useState('week') // week or month

  const schedule = {
    Monday: [
      { time: '10:00 AM - 11:00 AM', subject: 'Mathematics - Calculus', tutor: 'Ms. Ramya Rajamani', type: 'live', link: 'join' },
      { time: '2:00 PM - 3:00 PM', subject: 'Physics - Mechanics', tutor: 'Mr. Ram G. Mohan', type: 'live', link: 'join' }
    ],
    Tuesday: [
      { time: '11:00 AM - 12:00 PM', subject: 'Organic Chemistry', tutor: 'B. Aishwarya', type: 'live', link: 'join' },
      { time: '4:00 PM - 5:00 PM', subject: 'Computer Science - DS', tutor: 'Mr. Ashwin Jain', type: 'live', link: 'join' }
    ],
    Wednesday: [
      { time: '10:00 AM - 11:00 AM', subject: 'Mathematics - Calculus', tutor: 'Ms. Ramya Rajamani', type: 'live', link: 'join' },
      { time: '3:00 PM - 4:00 PM', subject: 'Physics Lab', tutor: 'Mr. Ram G. Mohan', type: 'lab', link: 'join' }
    ],
    Thursday: [
      { time: '11:00 AM - 12:00 PM', subject: 'Organic Chemistry', tutor: 'B. Aishwarya', type: 'live', link: 'join' },
      { time: '2:00 PM - 3:00 PM', subject: 'Statistics', tutor: 'Ms. Ramya Rajamani', type: 'live', link: 'join' }
    ],
    Friday: [
      { time: '10:00 AM - 11:00 AM', subject: 'Computer Science - DS', tutor: 'Mr. Ashwin Jain', type: 'live', link: 'join' },
      { time: '4:00 PM - 5:00 PM', subject: 'Doubt Session', tutor: 'All Tutors', type: 'doubt', link: 'join' }
    ],
    Saturday: [
      { time: '10:00 AM - 12:00 PM', subject: 'Weekend Workshop', tutor: 'Multiple Tutors', type: 'workshop', link: 'join' }
    ],
    Sunday: [
      { time: 'No Classes', subject: 'Rest Day', tutor: '', type: 'rest', link: '' }
    ]
  }

  const upcomingEvents = [
    { title: 'Mathematics Quiz', date: 'Jan 25, 2026', time: '10:00 AM', type: 'quiz', color: '#dc3545' },
    { title: 'Physics Midterm', date: 'Jan 28, 2026', time: '2:00 PM', type: 'exam', color: '#dc3545' },
    { title: 'Chemistry Workshop', date: 'Jan 30, 2026', time: '4:00 PM', type: 'workshop', color: '#f59e0b' },
    { title: 'Guest Lecture - AI', date: 'Feb 2, 2026', time: '11:00 AM', type: 'special', color: '#1e3a8a' }
  ]

  const getTypeIcon = (type) => {
    switch (type) {
      case 'live':
        return '🎥'
      case 'lab':
        return '🔬'
      case 'doubt':
        return '💬'
      case 'workshop':
        return '🛠️'
      case 'rest':
        return '😊'
      default:
        return '📚'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'live':
        return '#1e3a8a'
      case 'lab':
        return '#28a745'
      case 'doubt':
        return '#f59e0b'
      case 'workshop':
        return '#ffc107'
      case 'rest':
        return '#6c757d'
      default:
        return '#1e3a8a'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-normal text-[#0a0b0d]" style={{ lineHeight: 1.15, letterSpacing: '-0.5px' }}>My Schedule</h2>
          <p className="text-[#7c828a] text-sm">View your weekly class schedule and upcoming events</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('week')}
            className={`px-6 py-2 rounded-[100px] font-semibold transition-all border border-[#dee1e6] ${
              view === 'week' ? 'bg-[#0052ff] text-white' : 'bg-white text-[#5b616e] hover:bg-[#f7f7f7]'
            }`}
            style={{ height: 44, lineHeight: 1.15 }}
          >
            Week View
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-6 py-2 rounded-[100px] font-semibold transition-all border border-[#dee1e6] ${
              view === 'month' ? 'bg-[#0052ff] text-white' : 'bg-white text-[#5b616e] hover:bg-[#f7f7f7]'
            }`}
            style={{ height: 44, lineHeight: 1.15 }}
          >
            Month View
          </button>
        </div>
      </div>

      {/* Current Week Info */}
      <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#0a0b0d]">
              Week of January 19 - 25, 2026
            </h3>
            <p className="text-[#5b616e] mt-1">Total Classes: 12 • Live Sessions: 10 • Labs: 2</p>
          </div>
          <button
            className="px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
            style={{ height: 44, lineHeight: 1.15 }}
          >
            Download Schedule
          </button>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(schedule).map(([day, classes]) => (
          <div key={day} className="bg-white border border-[#dee1e6] rounded-[24px] p-6">
            <h3 className="text-xl font-semibold mb-4 text-[#0a0b0d]">
              {day}
              {day === 'Monday' && (
                <span className="ml-2 px-3 py-1 rounded-[100px] text-xs font-semibold text-white" style={{ backgroundColor: '#f59e0b' }}>
                  Today
                </span>
              )}
            </h3>
            <div className="space-y-3">
              {classes.map((cls, index) => (
                <div
                  key={index}
                  className="p-4 rounded-[12px] border-l-4 border border-[#dee1e6] transition-all"
                  style={{
                    backgroundColor: '#ffffff',
                    borderLeftColor: getTypeColor(cls.type)
                  }}
                >
                  {cls.type !== 'rest' ? (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="mb-1">
                            <h4 className="font-semibold text-[#0a0b0d]">{cls.subject}</h4>
                          </div>
                          <p className="text-sm text-[#5b616e]">{cls.tutor}</p>
                          <p className="text-sm text-[#5b616e] mt-1">{cls.time}</p>
                        </div>
                        {cls.link && (
                          <button
                            className="px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
                            style={{ height: 44, lineHeight: 1.15 }}
                          >
                            Join Class
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-[#5b616e] font-semibold">No Classes - Rest Day</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Events */}
      <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6">
        <h3 className="text-base font-semibold text-[#0a0b0d] mb-6">Upcoming Events & Exams</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingEvents.map((event, index) => (
            <div
              key={index}
              className="p-4 rounded-[12px] border-l-4 border border-[#dee1e6] transition-all"
              style={{
                backgroundColor: '#ffffff',
                borderLeftColor: event.color
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-[#0a0b0d] mb-2">{event.title}</h4>
                  <p className="text-sm text-[#5b616e]">{event.date}</p>
                  <p className="text-sm text-[#5b616e]">{event.time}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-[100px] text-xs font-semibold text-white"
                  style={{ backgroundColor: event.color }}
                >
                  {event.type.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Study Hours Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4 border-[#0052ff]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-3xl font-bold text-[#0052ff]">12</h3>
          </div>
          <p className="text-[#0a0b0d] font-semibold">Hours This Week</p>
          <p className="text-sm text-[#5b616e] mt-2">+2 hours from last week</p>
        </div>

        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4 border-yellow-400">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-3xl font-bold text-yellow-500">10</h3>
          </div>
          <p className="text-[#0a0b0d] font-semibold">Classes Attended</p>
          <p className="text-sm text-[#5b616e] mt-2">95% attendance rate</p>
        </div>

        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4" style={{ borderLeftColor: '#28a745' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-3xl font-bold" style={{ color: '#28a745' }}>2</h3>
          </div>
          <p className="text-[#0a0b0d] font-semibold">Upcoming Today</p>
          <p className="text-sm text-[#5b616e] mt-2">Next at 10:00 AM</p>
        </div>
      </div>
    </div>
  )
}
