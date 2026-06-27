/** Enrolled courses page - view registered courses with progress and materials. */
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Pagination from '../ui/Pagination'
import toast from 'react-hot-toast'

const ITEMS_PER_PAGE = 100

const AVAILABLE_CLASSES = [
  { id: 1, subject: 'IGCSE Mathematics', level: 'IGCSE', schedule: 'Mon, Wed, Fri – 6:00 PM IST', instructor: 'Ms. Neha Aggarwal' },
  { id: 2, subject: 'IGCSE Physics', level: 'IGCSE', schedule: 'Tue, Thu – 5:30 PM IST', instructor: 'Mr. Arvind' },
  { id: 3, subject: 'IGCSE Chemistry', level: 'IGCSE', schedule: 'Mon, Wed, Fri – 4:30 PM IST', instructor: 'B. Aishwarya' },
  { id: 4, subject: 'AS Level Mathematics', level: 'AS Level', schedule: 'Tue, Thu, Sat – 7:00 PM IST', instructor: 'Mr. Ashwin Jain' },
  { id: 5, subject: 'AS Level Physics', level: 'AS Level', schedule: 'Sat, Sun – 6:00 PM IST', instructor: 'Ms. Ramya Rajamani' },
  { id: 6, subject: 'A Level Chemistry', level: 'A Level', schedule: 'Thu, Sat – 8:00 PM IST', instructor: 'Financial Expert' },
  { id: 7, subject: 'A Level Mathematics', level: 'A Level', schedule: 'Tue, Thu, Sat – 8:30 PM IST', instructor: 'Expert Coach' },
  { id: 8, subject: 'IGCSE English', level: 'IGCSE', schedule: 'Mon, Wed – 6:30 PM IST', instructor: 'Mr. Ram G. Mohan' },
]

const EMOJI_MAP = { 'Mathematics': '📐', 'Physics': '⚡', 'Chemistry': '🧪', 'English': '📖' }
const getEmoji = (subject) => { for (const [k, v] of Object.entries(EMOJI_MAP)) { if (subject.includes(k)) return v } return '📚' }

const MOCK_COURSES = [
  { id: 1, subject: 'IGCSE Mathematics', level: 'IGCSE', instructor: 'Ms. Neha Aggarwal', progress: 75, totalClasses: 40, completedClasses: 30, nextClass: 'Today, 6:00 PM', status: 'active' },
  { id: 2, subject: 'IGCSE Physics', level: 'IGCSE', instructor: 'Mr. Arvind', progress: 60, totalClasses: 35, completedClasses: 21, nextClass: 'Tomorrow, 5:30 PM', status: 'active' },
  { id: 3, subject: 'IGCSE Chemistry', level: 'IGCSE', instructor: 'B. Aishwarya', progress: 85, totalClasses: 30, completedClasses: 25, nextClass: 'Jan 22, 5:00 PM', status: 'active' },
  { id: 4, subject: 'AS Level Mathematics', level: 'AS Level', instructor: 'Mr. Ashwin Jain', progress: 45, totalClasses: 38, completedClasses: 17, nextClass: 'Jan 23, 7:00 PM', status: 'active' },
  { id: 5, subject: 'A Level Chemistry', level: 'A Level', instructor: 'Financial Expert', progress: 100, totalClasses: 25, completedClasses: 25, nextClass: 'Completed', status: 'completed' },
]

export default function MyCourses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Enroll modal state
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [enrollMessage, setEnrollMessage] = useState('')
  const [enrollName, setEnrollName] = useState(user?.fullName || '')
  const [enrollEmail, setEnrollEmail] = useState(user?.email || '')

  // Course details modal state
  const [detailCourse, setDetailCourse] = useState(null)

  useEffect(() => {
    setLoading(true)
    const saved = JSON.parse(localStorage.getItem('icfy_my_courses') || 'null')
    setCourses(saved && saved.length > 0 ? saved : MOCK_COURSES)
    setLoading(false)
  }, [])

  const saveCourses = (updated) => {
    setCourses(updated)
    localStorage.setItem('icfy_my_courses', JSON.stringify(updated))
  }

  const handleEnrollSubmit = (e) => {
    e.preventDefault()
    if (!selectedSubject) { toast.error('Please select a class.'); return }
    if (courses.find(c => c.subject === selectedSubject)) { toast.error('Already enrolled in this class.'); return }
    const cls = AVAILABLE_CLASSES.find(c => c.subject === selectedSubject)
    saveCourses([...courses, {
      id: Date.now(), subject: cls.subject, level: cls.level, instructor: cls.instructor,
      progress: 0, totalClasses: 30, completedClasses: 0, nextClass: 'TBD – Admin will confirm', status: 'active',
    }])
    const enrollments = JSON.parse(localStorage.getItem('runningClassEnrollments') || '[]')
    enrollments.push({ id: `ENROLL${Date.now()}`, fullName: enrollName || '', email: enrollEmail || '', phone: user?.phone || '', classSubject: selectedSubject, message: enrollMessage, enrollmentDate: new Date().toISOString(), status: 'Pending' })
    localStorage.setItem('runningClassEnrollments', JSON.stringify(enrollments))
    toast.success(`Enrolled in ${selectedSubject}! Our team will confirm the schedule.`)
    setShowEnrollModal(false); setSelectedSubject(''); setEnrollMessage(''); setEnrollName(user?.fullName || ''); setEnrollEmail(user?.email || '')
  }

  const filteredCourses = filter === 'all' ? courses : courses.filter(c => c.status === filter)
  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)
  const paginated = filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const handleFilterChange = (f) => { setFilter(f); setCurrentPage(1) }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-[100px] h-10 w-10 border-t-2 border-b-2 border-[#0052ff]"></div>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-normal text-[#0a0b0d]">My Courses</h2>
          <p className="text-[#5b616e] text-sm mt-0.5">Track your enrolled courses and progress</p>
        </div>
        <button
          onClick={() => setShowEnrollModal(true)}
          className="px-5 py-3 bg-[#0052ff] text-white rounded-[100px] text-sm font-semibold"
          style={{ height: 44, lineHeight: 1.15 }}
        >
          + Enroll in a Course
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-3 rounded-[24px] border border-[#dee1e6]">
        {[
          { key: 'all', label: `All (${courses.length})` },
          { key: 'active', label: `Active (${courses.filter(c => c.status === 'active').length})` },
          { key: 'completed', label: `Completed (${courses.filter(c => c.status === 'completed').length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleFilterChange(key)}
            className={`px-4 py-1.5 rounded-[12px] text-sm font-semibold transition-all border ${
              filter === key
                ? 'bg-[#0052ff] text-white border-[#0052ff]'
                : 'bg-white text-[#5b616e] border-[#dee1e6] hover:border-[#0052ff] hover:text-[#0052ff]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-[24px] border border-[#dee1e6] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dee1e6] bg-[#f7f7f7]">
                <th className="text-left px-5 py-3 font-semibold text-[#0a0b0d]">Course</th>
                <th className="text-left px-5 py-3 font-semibold text-[#0a0b0d]">Instructor</th>
                <th className="text-left px-5 py-3 font-semibold text-[#0a0b0d]">Level</th>
                <th className="text-left px-5 py-3 font-semibold text-[#0a0b0d]">Progress</th>
                <th className="text-left px-5 py-3 font-semibold text-[#0a0b0d]">Classes</th>
                <th className="text-left px-5 py-3 font-semibold text-[#0a0b0d]">Next Class</th>
                <th className="text-left px-5 py-3 font-semibold text-[#0a0b0d]">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-[#0a0b0d]">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center">
                    <p className="text-4xl mb-3">📚</p>
                    <p className="text-[#5b616e] font-medium">No courses found.</p>
                    <button onClick={() => setShowEnrollModal(true)} className="mt-4 px-5 py-3 bg-[#0052ff] text-white rounded-[100px] text-sm font-semibold" style={{ height: 44, lineHeight: 1.15 }}>
                      Enroll in a Course
                    </button>
                  </td>
                </tr>
              ) : paginated.map((course) => (
                <tr key={course.id} className="border-b border-[#dee1e6] hover:bg-[#f7f7f7] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getEmoji(course.subject)}</span>
                      <p className="font-semibold text-[#0a0b0d]">{course.subject}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#5b616e]">👨‍🏫 {course.instructor}</td>
                  <td className="px-5 py-4 text-[#7c828a]">{course.level}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <div className="flex-1 h-2 bg-[#f7f7f7] rounded-[100px] overflow-hidden">
                        <div className="h-full rounded-[100px]" style={{ width: `${course.progress}%`, backgroundColor: course.status === 'completed' ? '#28a745' : '#f59e0b' }} />
                      </div>
                      <span className="text-xs font-semibold text-[#0a0b0d] whitespace-nowrap">{course.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold text-[#0a0b0d]">{course.completedClasses}/{course.totalClasses}</td>
                  <td className="px-5 py-4 text-[#5b616e] text-xs">{course.nextClass}</td>
                  <td className="px-5 py-4">
                    <span
                      className="px-[10px] py-[6px] rounded-[100px] text-xs font-semibold whitespace-nowrap"
                      style={{
                        backgroundColor: course.status === 'completed' ? '#e8f5e9' : '#fff8e1',
                        color: course.status === 'completed' ? '#28a745' : '#b45309',
                      }}
                    >
                      {course.status === 'completed' ? '✓ Done' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => setDetailCourse(course)}
                      className="px-5 py-3 rounded-[100px] text-xs font-semibold border border-[#dee1e6] text-[#0a0b0d] bg-white"
                      style={{ height: 44, lineHeight: 1.15 }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredCourses.length}
        itemsPerPage={100}
        alwaysShow={true}
      />

      {/* ── Enroll Modal ── */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowEnrollModal(false)}>
          <div className="bg-white rounded-[24px] border border-[#dee1e6] w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowEnrollModal(false)} className="absolute top-4 right-4 text-[#a8acb3] hover:text-[#5b616e] text-xl">✕</button>
            <h3 className="text-xl font-semibold text-[#0a0b0d] mb-1">Enroll in a Course</h3>
            <p className="text-sm text-[#5b616e] mb-5">Select a running class to join</p>
            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5b616e] mb-1">Name</label>
                  <input 
                    value={enrollName} 
                    onChange={e => setEnrollName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3 text-sm border border-[#dee1e6] rounded-[12px] focus:outline-none focus:border-[#0052ff] bg-white" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5b616e] mb-1">Email</label>
                  <input 
                    value={enrollEmail} 
                    onChange={e => setEnrollEmail(e.target.value)}
                    placeholder="Your email"
                    className="w-full px-4 py-3 text-sm border border-[#dee1e6] rounded-[12px] focus:outline-none focus:border-[#0052ff] bg-white" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0a0b0d] mb-1">Select Class <span className="text-red-500">*</span></label>
                <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} required className="w-full px-4 py-3 text-sm border border-[#dee1e6] rounded-[12px] focus:outline-none focus:border-[#0052ff] bg-white">
                  <option value="">-- Choose a class --</option>
                  {AVAILABLE_CLASSES.map(cls => (
                    <option key={cls.id} value={cls.subject}>{cls.subject} — {cls.level} ({cls.schedule})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0a0b0d] mb-1">Message (optional)</label>
                <textarea value={enrollMessage} onChange={e => setEnrollMessage(e.target.value)} placeholder="Any timing preference or requirements..." rows={2} className="w-full px-4 py-3 text-sm border border-[#dee1e6] rounded-[12px] focus:outline-none focus:border-[#0052ff] resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="flex-1 px-5 py-3 bg-[#0052ff] text-white rounded-[100px] text-sm font-semibold" style={{ height: 44, lineHeight: 1.15 }}>Confirm Enrollment</button>
                <button type="button" onClick={() => setShowEnrollModal(false)} className="flex-1 px-5 py-3 rounded-[100px] text-sm font-semibold border border-[#dee1e6] text-[#5b616e] bg-white" style={{ height: 44, lineHeight: 1.15 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Course Detail Modal ── */}
      {detailCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDetailCourse(null)}>
          <div className="bg-white rounded-[24px] border border-[#dee1e6] w-full max-w-md p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setDetailCourse(null)} className="absolute top-4 right-4 text-[#a8acb3] hover:text-[#5b616e] text-xl">✕</button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-[12px] bg-[#f7f7f7] flex items-center justify-center text-3xl">{getEmoji(detailCourse.subject)}</div>
              <div>
                <h3 className="font-semibold text-lg text-[#0a0b0d]">{detailCourse.subject}</h3>
                <p className="text-[#5b616e] text-sm">{detailCourse.level}</p>
              </div>
            </div>
            <div className="h-0.5 rounded-[100px] mb-4" style={{ backgroundColor: '#f59e0b' }} />
            <div className="space-y-3 text-sm">
              {[
                ['Instructor', detailCourse.instructor],
                ['Progress', `${detailCourse.progress}%`],
                ['Classes Completed', `${detailCourse.completedClasses} / ${detailCourse.totalClasses}`],
                ['Next Class', detailCourse.nextClass],
                ['Status', detailCourse.status === 'completed' ? 'Completed' : 'Active'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[#5b616e]">{label}</span>
                  <span className={`font-semibold ${label === 'Status' ? (detailCourse.status === 'completed' ? 'text-green-600' : 'text-amber-600') : 'text-[#0a0b0d]'}`}>{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 w-full h-3 bg-[#f7f7f7] rounded-[100px] overflow-hidden">
              <div className="h-full rounded-[100px]" style={{ width: `${detailCourse.progress}%`, backgroundColor: detailCourse.status === 'completed' ? '#28a745' : '#f59e0b' }} />
            </div>
            <button onClick={() => setDetailCourse(null)} className="mt-5 w-full px-5 py-3 rounded-[100px] font-semibold text-sm border border-[#dee1e6] text-[#0a0b0d] bg-white" style={{ height: 44, lineHeight: 1.15 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

