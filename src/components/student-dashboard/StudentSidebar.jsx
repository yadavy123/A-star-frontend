/** Student sidebar navigation with menu items, profile, and logout. */
import React from 'react'
import { useAuth } from '../../context/AuthContext'

export default function StudentSidebar({ currentView, setCurrentView, sidebarOpen, setSidebarOpen }) {
  const { logout } = useAuth()

  const menuItems = [
    { id: 'home',             label: 'Dashboard'         },
    { id: 'courses',          label: 'My Courses'         },
    { id: 'homework',         label: 'Homework'           },
    { id: 'assignments',      label: 'Assignments'        },
    { id: 'practice-tests',   label: 'Practice Tests'     },
    { id: 'running-classes',  label: 'Running Classes'    },
    { id: 'ask-question',     label: 'Ask a Question'     },
    { id: 'announcements',    label: 'Announcements'      },
    { id: 'notifications',    label: 'Notifications'      },
    { id: 'fee-payment',      label: 'Fee Payment'        },
    { id: 'feedback',         label: 'Feedback & Reviews' },
    { id: 'testimonials',     label: 'Success Stories'    },
    { id: 'support',          label: 'Support & Help'     },
  ]

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  const handleItemClick = (id) => {
    setCurrentView(id)
    // Close sidebar on mobile after selecting
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  return (
    <>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-[#dee1e6] flex flex-col z-40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-[#dee1e6]">
          <div>
            <p className="text-[#0a0b0d] font-semibold text-base">A-star classes</p>
            <p className="text-[#5b616e] text-xs">Student Portal</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-[#5b616e] hover:text-[#0a0b0d] transition lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full text-left px-5 text-sm transition-all border-l-[3px] ${
                currentView === item.id
                  ? 'bg-[#f7f7f7] text-[#0a0b0d] font-semibold border-[#0052ff]'
                  : 'text-[#5b616e] hover:bg-[#f7f7f7] hover:text-[#0a0b0d] border-transparent'
              }`}
              style={{ paddingTop: 11, paddingBottom: 11, lineHeight: 1.25 }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-[#dee1e6] shrink-0">
          <button
            onClick={handleLogout}
            className="w-full py-3 text-white text-sm font-semibold rounded-[100px] bg-[#0052ff] hover:bg-[#003ecc] transition"
            style={{ height: 44, lineHeight: 1.15 }}
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
