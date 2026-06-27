/** Student dashboard home - welcome panel with Quick Links and Stats. */
import React from 'react'

export default function DashboardHome({ studentData, setCurrentView }) {
  const stats = [
    { label: 'Enrolled Courses',     value: '5',  change: '+2 this month' },
    { label: 'Pending Assignments',  value: '4',  change: 'Due this week' },
    { label: 'Completed Tasks',      value: '8',  change: '67% completion' },
    { label: 'Upcoming Classes',     value: '3',  change: 'This week' },
  ]

  const upcomingClasses = [
    { subject: 'Mathematics - Calculus',   tutor: 'Ms. Ramya Rajamani', time: 'Today, 4:00 PM',     duration: '60 min', status: 'upcoming' },
    { subject: 'Physics - Mechanics',      tutor: 'Mr. Ram G. Mohan',   time: 'Tomorrow, 3:00 PM',  duration: '60 min', status: 'upcoming' },
    { subject: 'Chemistry - Organic',      tutor: 'B. Aishwarya',       time: 'Jan 22, 5:00 PM',    duration: '60 min', status: 'scheduled' },
  ]

  const recentAssignments = [
    { title: 'Calculus Problem Set 3',    course: 'Mathematics', dueDate: 'Jan 25, 2026', status: 'pending',   priority: 'high' },
    { title: 'Physics Lab Report',        course: 'Physics',     dueDate: 'Jan 23, 2026', status: 'pending',   priority: 'high' },
    { title: 'Chemistry Quiz 2',          course: 'Chemistry',   dueDate: 'Jan 28, 2026', status: 'pending',   priority: 'medium' },
    { title: 'Linear Algebra Assignment', course: 'Mathematics', dueDate: 'Submitted',    status: 'completed', priority: null },
  ]

  const notifications = [
    { type: 'info',    message: 'New study material added for Calculus',                   time: '2 hours ago' },
    { type: 'success', message: 'Assignment "Physics Lab Report" submitted successfully',  time: '5 hours ago' },
    { type: 'warning', message: 'Upcoming class reminder: Mathematics at 4:00 PM',        time: '1 day ago' },
  ]

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div className="bg-white rounded-[24px] border border-[#dee1e6] p-6">
        <h2 className="text-2xl font-normal text-[#0a0b0d] mb-1" style={{ lineHeight: 1.15, letterSpacing: '-0.5px' }}>Welcome back, {studentData.name.split(' ')[0]}!</h2>
        <p className="text-[#5b616e] text-sm mb-4">Ready to continue your learning journey with A-star classes?</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setCurrentView('courses')}
            className="px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
            style={{ height: 44, lineHeight: 1.15 }}
          >
            Browse Courses
          </button>
          <button
            onClick={() => setCurrentView('runningClasses')}
            className="px-5 py-3 border border-[#dee1e6] text-[#0a0b0d] text-sm font-semibold rounded-[100px] hover:bg-[#f7f7f7] transition"
            style={{ height: 44, lineHeight: 1.15 }}
          >
            Running Classes
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-[24px] border border-[#dee1e6] p-6">
            <p className="text-[32px] font-normal text-[#0a0b0d] mb-1" style={{ lineHeight: 1.0, letterSpacing: '-1px' }}>{stat.value}</p>
            <p className="text-[#5b616e] text-sm font-semibold">{stat.label}</p>
            <p className="text-[#a8acb3] text-xs mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setCurrentView('assignments')}
          className="bg-[#f7f7f7] border border-[#dee1e6] text-[#0a0b0d] p-5 rounded-[24px] font-semibold text-sm hover:bg-white transition text-left"
        >
          Submit Assignment
        </button>
        <button
          onClick={() => setCurrentView('askQuestion')}
          className="bg-[#f7f7f7] border border-[#dee1e6] text-[#0a0b0d] p-5 rounded-[24px] font-semibold text-sm hover:bg-white transition text-left"
        >
          Ask a Question
        </button>
        <button
          onClick={() => setCurrentView('support')}
          className="bg-[#f7f7f7] border border-[#dee1e6] text-[#0a0b0d] p-5 rounded-[24px] font-semibold text-sm hover:bg-white transition text-left"
        >
          Get Support
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <div className="bg-white rounded-[24px] border border-[#dee1e6] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#0a0b0d]">Upcoming Classes</h3>
            <button onClick={() => setCurrentView('runningClasses')} className="text-sm font-semibold text-[#0052ff] hover:text-[#003ecc] transition">View All →</button>
          </div>
          <div className="space-y-3">
            {upcomingClasses.map((cls, i) => (
              <div key={i} className="p-4 bg-[#f7f7f7] rounded-[12px] border border-[#dee1e6]">
                <h4 className="font-semibold text-[#0a0b0d] text-sm mb-1">{cls.subject}</h4>
                <p className="text-xs text-[#5b616e] mb-2">Tutor: {cls.tutor}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#5b616e]">{cls.time}</span>
                  <span className="px-3 py-1 rounded-[100px] text-xs font-semibold bg-[#f7f7f7] text-[#0a0b0d]">{cls.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="bg-white rounded-[24px] border border-[#dee1e6] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[#0a0b0d]">Recent Assignments</h3>
            <button onClick={() => setCurrentView('assignments')} className="text-sm font-semibold text-[#0052ff] hover:text-[#003ecc] transition">View All →</button>
          </div>
          <div className="space-y-3">
            {recentAssignments.map((a, i) => (
              <div key={i} className="p-4 bg-[#f7f7f7] rounded-[12px] border border-[#dee1e6]">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-[#0a0b0d] text-sm">{a.title}</h4>
                    <p className="text-xs text-[#5b616e] mt-0.5">{a.course} · Due: {a.dueDate}</p>
                  </div>
                  <span className={`shrink-0 px-3 py-1 rounded-[100px] text-xs font-semibold ${
                    a.status === 'completed' ? 'bg-[#f7f7f7] text-[#05b169]' : a.priority === 'high' ? 'bg-[#f7f7f7] text-[#cf202f]' : 'bg-[#f7f7f7] text-[#0a0b0d]'
                  }`}>
                    {a.status === 'completed' ? 'Done' : a.priority === 'high' ? 'High' : 'Medium'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-[24px] border border-[#dee1e6] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#0a0b0d]">Recent Notifications</h3>
          <button onClick={() => setCurrentView('notifications')} className="text-sm font-semibold text-[#0052ff] hover:text-[#003ecc] transition">View All →</button>
        </div>
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <div key={i} className="py-3 border-b border-[#dee1e6] last:border-0">
              <p className="text-sm text-[#5b616e]">{n.message}</p>
              <p className="text-xs text-[#a8acb3] mt-0.5">{n.time}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
