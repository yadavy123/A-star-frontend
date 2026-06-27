import React, { useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function AdminSidebar({ currentView, setCurrentView, sidebarOpen, setSidebarOpen }) {
  const { logout } = useAuth()
  const navRef = useRef(null)

  useEffect(() => {
    if (navRef.current) {
      navRef.current.scrollTop = 0
    }
  }, [])

  const menuItems = [
    { id: 'home', label: 'Dashboard' },
    { id: 'students', label: 'Students' },
    // { id: 'courses', label: 'Courses' },
    { id: 'running-classes', label: 'Running Classes' },
    { id: 'fee-payment', label: 'Fee Payments' },
    { id: 'demo-settings', label: 'Demo Settings' },
    { id: 'demo-requests', label: 'Demo Requests' },
    { id: 'contact-requests', label: 'Contact Requests' },
    // { id: 'homework', label: 'Homework' },
    // { id: 'practice-tests', label: 'Practice Tests' },
    { id: 'questions', label: 'Q&A Management' },
    { id: 'categories', label: 'Categories' },
    // { id: 'announcements', label: 'Announcements' },
    // { id: 'notifications', label: 'Notifications' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'reviews', label: 'Student Reviews' },
    { id: 'tutors', label: 'Tutors' },
    { id: 'blog', label: 'Blog' },
    { id: 'profile', label: 'Profile' },
  ]

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
      window.location.href = '/'
    }
  }

  const handleItemClick = (id) => {
    setCurrentView(id)
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-[#dee1e6] flex flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-[#dee1e6] lg:hidden">
          <div>
            <p className="font-semibold text-[#0a0b0d] text-base" style={{ lineHeight: 1.25 }}>A Star Classes</p>
            <p className="text-xs text-[#5b616e]" style={{ lineHeight: 1.5 }}>Admin Portal</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-[#5b616e] hover:text-[#0a0b0d] transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav ref={navRef} className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full text-left px-5 py-3 text-sm transition-all border-l-[3px] ${currentView === item.id
                ? 'bg-[#f7f7f7] text-[#0052ff] font-semibold border-[#0052ff]'
                : 'text-[#5b616e] hover:bg-[#f7f7f7] hover:text-[#0a0b0d] border-transparent'
                }`}
              style={{ lineHeight: 1.4 }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-[#dee1e6] shrink-0">
          <button
            onClick={handleLogout}
            className="w-full px-5 py-3 rounded-[100px] bg-[#0052ff] text-white font-semibold hover:bg-[#003ecc] transition text-sm"
            style={{ height: 44, lineHeight: 1.15 }}
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
