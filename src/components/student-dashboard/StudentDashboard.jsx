/** Student dashboard layout with sidebar navigation and view routing. */
import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import StudentSidebar from './StudentSidebar'
import DashboardHome from './DashboardHome'
import MyCourses from './MyCourses'
import MyAssignments from './MyAssignments'
import MyProfile from './MyProfile'
import Notifications from './Notifications'
import SupportHelp from './SupportHelp'
import Homework from './Homework'
import PracticeTests from './PracticeTests'
import AskQuestion from './AskQuestion'
import RunningClasses from './RunningClasses'
import Announcements from './Announcements'
import FeePayment from './FeePayment'
import FeedbackReviews from './FeedbackReviews'
import Testimonials from './Testimonials'

export default function StudentDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { section } = useParams()
  const navigate = useNavigate()
  const currentView = section || 'home'
  const setCurrentView = (view) =>
    navigate(view === 'home' ? '/student-dashboard' : `/student-dashboard/${view}`)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Show loading screen while auth is being verified
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-[3px] border-b-[3px] border-[#0052ff]"></div>
          <p className="mt-4 text-lg font-semibold text-[#0a0b0d]">Loading...</p>
        </div>
      </div>
    )
  }

  // Student data from auth context
  const studentData = {
    name: user.fullName || user.name || user.email?.split('@')[0] || 'Student',
    email: user.email,
    phone: user.phone || '',
    studentId: user.studentId,
    enrollmentDate: user.enrollmentDate,
    profileImage: '',
    courses: 5,
    assignments: 12,
    completedAssignments: 8
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <DashboardHome studentData={studentData} setCurrentView={setCurrentView} />
      case 'courses':
        return <MyCourses />
      case 'homework':
        return <Homework />
      case 'assignments':
        return <MyAssignments />
      case 'practice-tests':
        return <PracticeTests />
      case 'running-classes':
        return <RunningClasses />
      case 'ask-question':
        return <AskQuestion />
      case 'announcements':
        return <Announcements />
      case 'notifications':
        return <Notifications />
      case 'fee-payment':
        return <FeePayment />
      case 'feedback':
        return <FeedbackReviews />
      case 'testimonials':
        return <Testimonials />
      case 'profile':
        return <MyProfile studentData={studentData} />
      case 'support':
        return <SupportHelp />
      default:
        return <DashboardHome studentData={studentData} setCurrentView={setCurrentView} />
    }
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <header className="bg-white border-b border-[#dee1e6] flex-shrink-0 z-50" style={{ height: 64 }}>
        <div className="px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[#0a0b0d] p-2 rounded-[8px] hover:bg-[#f7f7f7] transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-[#0a0b0d]">A-star classes</h1>
              <p className="text-xs text-[#5b616e]">Student Portal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Back to Home */}
            <Link
              to="/"
              className="text-[#5b616e] hover:text-[#0a0b0d] p-2 rounded-[8px] hover:bg-[#f7f7f7] transition"
              title="Back to Home"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>
            {/* User Profile */}
            <button 
              onClick={() => setCurrentView('profile')}
              className="flex items-center gap-3 hover:bg-[#f7f7f7] rounded-[8px] px-3 py-2 transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white text-lg bg-[#0052ff]">
                {(studentData.name || '').split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden md:block">
                <p className="font-semibold text-sm text-[#0a0b0d]">{studentData.name}</p>
                <p className="text-xs text-[#5b616e]">Student</p>
              </div>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed */}
        <StudentSidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Main Content - Scrollable */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
          <div className="p-6">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  )
}
