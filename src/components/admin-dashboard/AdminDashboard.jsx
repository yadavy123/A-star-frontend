import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from './AdminSidebar'
import AdminHome from './AdminHome'
import StudentManagement from './StudentManagement'
import DemoClassRequests from './DemoClassRequests'
import DemoSettings from './DemoSettings'
import CourseManagement from './CourseManagement'
import RunningClassesManagement from './RunningClassesManagement'
import FeePaymentManagement from './FeePaymentManagement'
import FeedbackManagement from './FeedbackManagement'
import PracticeTestManagement from './PracticeTestManagement'
import HomeworkManagement from './HomeworkManagement'
import TestimonialManagement from './TestimonialManagement'
import ReviewManagement from './ReviewManagement'
import TutorManagement from './TutorManagement'
import AnnouncementManagement from './AnnouncementManagement'
import { BlogModerationPage } from './BlogModerationPage'
import { SubscribersPage } from './SubscribersPage'
import { CommentManagement } from './CommentManagement'
import BlogDashboard from './BlogDashboard'
import AdminProfile from './AdminProfile'
import AdminNotifications from './AdminNotifications'
import ContactRequests from './ContactRequests'
import CategoryManagement from './CategoryManagement'
import QAManagement from './QAManagement'

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuth()
  const { section } = useParams()
  const navigate = useNavigate()
  const currentView = section || 'home'

  const setCurrentView = (view) =>
    navigate(view === 'home' ? '/admin-dashboard' : `/admin-dashboard/${view}`)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-900"></div>
          <p className="mt-4 text-lg font-semibold text-blue-900">Loading...</p>
        </div>
      </div>
    )
  }

  const adminData = {
    name: user?.fullName || 'Admin',
    email: user?.email || 'admin@astarclasses.com',
    role: 'Administrator',
    adminId: user?.adminId || user?.id || 'ADMIN001'
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <AdminHome setCurrentView={setCurrentView} />
      case 'students':
        return <StudentManagement />
      case 'courses':
        return <CourseManagement />
      case 'questions':
        return <QAManagement />
      case 'demo-requests':
        return <DemoClassRequests />
      case 'contact-requests':
        return <ContactRequests />
      case 'demo-settings':
        return <DemoSettings />
      case 'running-classes':
        return <RunningClassesManagement />
      case 'homework':
        return <HomeworkManagement />
      case 'practice-tests':
        return <PracticeTestManagement />
      // case 'notifications':
      //   return <AdminNotifications />
      case 'fee-payment':
        return <FeePaymentManagement />
      case 'feedback':
        return <FeedbackManagement />
      case 'testimonials':
        return <TestimonialManagement />
      case 'reviews':
        return <ReviewManagement />
      case 'categories':
        return <CategoryManagement />
      case 'tutors':
        return <TutorManagement />
      case 'announcements':
        return <AnnouncementManagement />
      case 'blog':
        return <BlogDashboard setCurrentView={setCurrentView} />
      case 'blogs':
        return <BlogModerationPage onBack={() => setCurrentView('blog')} />
      case 'subscribers':
        return <SubscribersPage onBack={() => setCurrentView('blog')} />
      case 'comment-management':
        return <CommentManagement onBack={() => setCurrentView('blog')} />
      case 'profile':
        return <AdminProfile adminData={adminData} />
      default:
        return <AdminHome setCurrentView={setCurrentView} />
    }
  }


  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <header className="bg-white border-b border-[#dee1e6] sticky top-0 z-40" style={{ height: 64 }}>
        <div className="px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[#0a0b0d] p-2 rounded-[12px] hover:bg-[#f7f7f7] transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-semibold text-[#0a0b0d]" style={{ lineHeight: 1.25 }}>A Star Classes</h1>
              <p className="text-xs text-[#5b616e]" style={{ lineHeight: 1.5 }}>Admin Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('profile')}
              className="flex items-center gap-3 hover:bg-[#f7f7f7] rounded-[12px] px-3 py-2 transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg bg-[#0052ff]">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="hidden md:block">
                <p className="font-semibold text-sm text-[#0a0b0d]">{user?.fullName || 'Admin'}</p>
                <p className="text-xs text-[#5b616e]">Administrator</p>
              </div>
            </button>
          </div>
        </div>
      </header>
      <AdminSidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex w-full justify-center">
        <main className={`flex-1 min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
          <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  )
}