/** Assignment submission page with file upload and submission tracking. */
import React, { useState, useEffect } from 'react'
// import { homeworkApi } from '../../api/homeworkApi' // API file not created - using mock data
import { useAuth } from '../../context/AuthContext'
import Pagination from '../ui/Pagination'

export default function MyAssignments() {
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submittingId, setSubmittingId] = useState(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const itemsPerPage = 100

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check localStorage for previously submitted assignments
      try {
        const saved = localStorage.getItem('icfy_student_assignments')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed && parsed.length > 0) {
            setAssignments(parsed)
            setLoading(false)
            return
          }
        }
      } catch (_) {}

      // Fallback to mock data
      setAssignments([
          {
            id: 1,
            title: 'Calculus Problem Set 3',
            course: 'Mathematics - Calculus',
            courseIcon: '📐',
            dueDate: 'Jan 25, 2026',
            daysLeft: 6,
            status: 'pending',
            priority: 'high',
            description: 'Solve problems 1-15 from Chapter 5: Integration',
            points: 100,
            attachments: 2
          },
          {
            id: 2,
            title: 'Physics Lab Report',
            course: 'Physics - Mechanics',
            courseIcon: '⚡',
            dueDate: 'Jan 23, 2026',
            daysLeft: 4,
            status: 'pending',
            priority: 'high',
            description: 'Submit lab report on Projectile Motion experiment',
            points: 50,
            attachments: 1
          },
          {
            id: 3,
            title: 'Chemistry Quiz 2',
            course: 'Organic Chemistry',
            courseIcon: '🧪',
            dueDate: 'Jan 28, 2026',
            daysLeft: 9,
            status: 'pending',
            priority: 'medium',
            description: 'Online quiz covering chapters 3-5',
            points: 30,
            attachments: 0
          },
          {
            id: 4,
            title: 'Data Structures Assignment 1',
            course: 'Computer Science',
            courseIcon: '💻',
            dueDate: 'Feb 1, 2026',
            daysLeft: 13,
            status: 'pending',
            priority: 'medium',
            description: 'Implement Binary Search Tree in Java',
            points: 100,
            attachments: 3
          },
          {
            id: 5,
            title: 'Linear Algebra Assignment',
            course: 'Mathematics - Calculus',
            courseIcon: '📐',
            dueDate: 'Submitted on Jan 15',
            daysLeft: null,
            status: 'submitted',
            priority: null,
            description: 'Matrix operations and transformations',
            points: 100,
            grade: 92,
            attachments: 2
          }
        ])
    } catch (err) {
      console.error('Error fetching assignments:', err)
      setError('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAssignment = async (assignmentId) => {
    try {
      setSubmittingId(assignmentId)

      // Validate: a file must be selected
      if (!selectedAssignment?.files || selectedAssignment.files.length === 0) {
        setError('Please select a file to upload before submitting.')
        return
      }

      // Update assignment status locally
      const submittedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
      const updatedAssignments = assignments.map(a =>
        a.id === assignmentId
          ? { ...a, status: 'submitted', daysLeft: null, priority: null, dueDate: `Submitted on ${submittedDate}` }
          : a
      )
      setAssignments(updatedAssignments)
      localStorage.setItem('icfy_student_assignments', JSON.stringify(updatedAssignments))
      setShowSubmitModal(false)
      setSelectedAssignment(null)
      setError(null)
    } catch (err) {
      console.error('Error submitting assignment:', err)
      setError('Failed to submit assignment. Please try again.')
    } finally {
      setSubmittingId(null)
    }
  }

  const handleViewDetails = (assignment) => {
    setSelectedAssignment(assignment)
    setShowSubmitModal(true)
  }

  const handleViewOnly = (assignment) => {
    setSelectedAssignment(assignment)
    setShowViewModal(true)
  }

  const filteredAssignments = filter === 'all'
    ? assignments
    : assignments.filter(assignment => assignment.status === filter)

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedAssignments = filteredAssignments.slice(startIndex, startIndex + itemsPerPage)

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#dc3545'
      case 'submitted':
        return '#28a745'
      default:
        return '#f59e0b'
    }
  }

  const getPriorityBadge = (priority) => {
    if (!priority) return null
    return (
      <span
        className="px-3 py-1 rounded-[100px] text-xs font-semibold text-white"
        style={{ backgroundColor: priority === 'high' ? '#dc3545' : '#f59e0b' }}
      >
        {priority === 'high' ? '⚠️ High Priority' : '📌 Medium'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-[100px] h-12 w-12 border-t-2 border-b-2" style={{ borderColor: '#0052ff', borderTopColor: '#f59e0b' }}></div>
          <p className="mt-4 text-lg font-semibold text-[#0a0b0d]">Loading assignments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-normal text-[#0a0b0d]">📝 My Assignments</h2>
          <p className="text-[#5b616e] mt-2">Manage your assignments and submissions</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-[#dee1e6] rounded-[24px] p-4 bg-white border-l-4" style={{ borderLeftColor: '#dc3545' }}>
          <h3 className="text-2xl font-semibold" style={{ color: '#dc3545' }}>
            {assignments.filter(a => a.status === 'pending').length}
          </h3>
          <p className="text-[#5b616e] text-sm">Pending</p>
        </div>
        <div className="border border-[#dee1e6] rounded-[24px] p-4 bg-white border-l-4" style={{ borderLeftColor: '#28a745' }}>
          <h3 className="text-2xl font-semibold" style={{ color: '#28a745' }}>
            {assignments.filter(a => a.status === 'submitted').length}
          </h3>
          <p className="text-[#5b616e] text-sm">Submitted</p>
        </div>
        <div className="border border-[#dee1e6] rounded-[24px] p-4 bg-white border-l-4" style={{ borderLeftColor: '#0a0b0d' }}>
          <h3 className="text-2xl font-semibold" style={{ color: '#0a0b0d' }}>
            {assignments.length}
          </h3>
          <p className="text-[#5b616e] text-sm">Total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 border border-[#dee1e6] rounded-[24px] p-6 bg-white">
        <button
          onClick={() => { setFilter('all'); setCurrentPage(1) }}
          className={`px-5 py-3 text-sm font-semibold rounded-[100px] transition-all ${
            filter === 'all' ? 'text-white' : 'text-[#5b616e] hover:bg-gray-50'
          }`}
          style={{ backgroundColor: filter === 'all' ? '#0052ff' : 'transparent', height: 44, lineHeight: 1.15 }}
        >
          All
        </button>
        <button
          onClick={() => { setFilter('pending'); setCurrentPage(1) }}
          className={`px-5 py-3 text-sm font-semibold rounded-[100px] transition-all ${
            filter === 'pending' ? 'text-white' : 'text-[#5b616e] hover:bg-gray-50'
          }`}
          style={{ backgroundColor: filter === 'pending' ? '#dc3545' : 'transparent', height: 44, lineHeight: 1.15 }}
        >
          Pending
        </button>
        <button
          onClick={() => { setFilter('submitted'); setCurrentPage(1) }}
          className={`px-5 py-3 text-sm font-semibold rounded-[100px] transition-all ${
            filter === 'submitted' ? 'text-white' : 'text-[#5b616e] hover:bg-gray-50'
          }`}
          style={{ backgroundColor: filter === 'submitted' ? '#28a745' : 'transparent', height: 44, lineHeight: 1.15 }}
        >
          Submitted
        </button>
      </div>

      {/* Assignments Table */}
      <div className="border border-[#dee1e6] rounded-[24px] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dee1e6] bg-[#f7f7f7]">
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#0a0b0d]">Assignment</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#0a0b0d]">Course</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#0a0b0d]">Due Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#0a0b0d]">Points</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#0a0b0d]">Priority</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#0a0b0d]">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-[#0a0b0d]">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssignments.map((assignment) => (
                <tr key={assignment.id} className="border-b border-[#dee1e6] hover:bg-[#f7f7f7] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{assignment.courseIcon}</span>
                      <div>
                        <p className="font-semibold text-[#0a0b0d]">{assignment.title}</p>
                        <p className="text-xs text-[#7c828a] mt-0.5 max-w-[180px] truncate">{assignment.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#5b616e]">{assignment.course}</td>
                  <td className="px-5 py-4">
                    <p className="text-[#5b616e]">{assignment.dueDate}</p>
                    {assignment.daysLeft && (
                      <p className="text-xs mt-0.5" style={{ color: assignment.daysLeft <= 5 ? '#dc3545' : '#28a745' }}>
                        {assignment.daysLeft} days left
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 font-semibold" style={{ color: '#f59e0b' }}>
                    {assignment.grade !== undefined ? `${assignment.grade}/${assignment.points}` : assignment.points}
                  </td>
                  <td className="px-5 py-4">
                    {assignment.priority ? (
                      <span
                        className="px-3 py-1 rounded-[100px] text-xs font-semibold text-white whitespace-nowrap"
                        style={{ backgroundColor: assignment.priority === 'high' ? '#dc3545' : '#f59e0b' }}
                      >
                        {assignment.priority === 'high' ? 'High' : 'Medium'}
                      </span>
                    ) : <span className="text-[#a8acb3] text-xs">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-3 py-1 rounded-[100px] text-xs font-semibold text-white whitespace-nowrap"
                      style={{ backgroundColor: getStatusColor(assignment.status) }}
                    >
                      {assignment.status === 'submitted' ? '✓ Submitted' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {assignment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleViewDetails(assignment)}
                            className="px-5 py-3 text-xs font-semibold border border-[#dee1e6] hover:bg-[#196d83] hover:text-white transition-all whitespace-nowrap rounded-[100px]"
                            style={{ borderColor: '#0052ff', color: '#0052ff', backgroundColor: 'white', height: 44, lineHeight: 1.15 }}
                          >
                            Submit
                          </button>
                          <button
                            onClick={() => handleViewOnly(assignment)}
                            className="px-5 py-3 text-xs font-semibold border border-[#dee1e6] hover:bg-gray-100 transition-all whitespace-nowrap rounded-[100px]"
                            style={{ borderColor: '#0052ff', color: '#0052ff', backgroundColor: 'white', height: 44, lineHeight: 1.15 }}
                          >
                            View
                          </button>
                        </>
                      )}
                      {assignment.status === 'submitted' && (
                        <button
                          onClick={() => handleViewOnly(assignment)}
                          className="px-5 py-3 text-xs font-semibold border border-[#dee1e6] hover:bg-gray-100 transition-all whitespace-nowrap rounded-[100px]"
                          style={{ borderColor: '#28a745', color: '#28a745', backgroundColor: 'white', height: 44, lineHeight: 1.15 }}
                        >
                          View
                        </button>
                      )}
                    </div>
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
        totalItems={filteredAssignments.length}
        itemsPerPage={itemsPerPage}
        alwaysShow={true}
      />

      {/* Submit Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="border border-[#dee1e6] rounded-[24px] bg-white max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4 text-[#0a0b0d]">
              Submit: {selectedAssignment.title}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#5b616e] mb-2">
                  Upload Files
                </label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => {
                    setSelectedAssignment({ ...selectedAssignment, files: e.target.files })
                  }}
                  className="block w-full border border-[#dee1e6] rounded-[12px] p-2 focus:outline-none focus:border-[#0052ff]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-[#5b616e] mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  className="block w-full border border-[#dee1e6] rounded-[12px] p-2 focus:outline-none focus:border-[#0052ff]"
                  rows="3"
                  placeholder="Add any comments..."
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-5 py-3 text-sm font-semibold border border-[#dee1e6] rounded-[100px] transition-all hover:bg-gray-50"
                style={{ borderColor: '#0052ff', color: '#0052ff', backgroundColor: 'white', height: 44, lineHeight: 1.15 }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitAssignment(selectedAssignment.id)}
                disabled={submittingId === selectedAssignment.id}
                className="flex-1 px-5 py-3 text-sm font-semibold border border-[#dee1e6] rounded-[100px] transition-all hover:opacity-90 disabled:opacity-50"
                style={{ borderColor: '#0052ff', backgroundColor: '#0052ff', color: 'white', height: 44, lineHeight: 1.15 }}
              >
                {submittingId === selectedAssignment.id ? '⏳ Submitting...' : '✓ Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedAssignment && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)}>
          <div className="border border-[#dee1e6] rounded-[24px] bg-white max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#0a0b0d]">Assignment Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-[#a8acb3] hover:text-[#5b616e] text-xl font-semibold">✕</button>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-[12px] flex items-center justify-center text-2xl" style={{ backgroundColor: '#f7f7f7' }}>
                {selectedAssignment.courseIcon}
              </div>
              <div>
                <h4 className="font-semibold text-base text-[#0a0b0d]">{selectedAssignment.title}</h4>
                <p className="text-xs text-[#7c828a]">📚 {selectedAssignment.course}</p>
              </div>
            </div>
            <div className="h-px bg-[#dee1e6] mb-4" />
            <p className="text-sm text-[#5b616e] mb-4">{selectedAssignment.description}</p>
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="p-3 border border-[#dee1e6] rounded-[12px] bg-[#f7f7f7]">
                <p className="text-xs text-[#7c828a] mb-1">Due Date</p>
                <p className="font-semibold text-[#0a0b0d]">{selectedAssignment.dueDate}</p>
                {selectedAssignment.daysLeft && (
                  <p className="text-xs mt-1" style={{ color: selectedAssignment.daysLeft <= 5 ? '#dc3545' : '#28a745' }}>
                    {selectedAssignment.daysLeft} days left
                  </p>
                )}
              </div>
              <div className="p-3 border border-[#dee1e6] rounded-[12px] bg-[#f7f7f7]">
                <p className="text-xs text-[#7c828a] mb-1">Points</p>
                <p className="font-semibold text-[#0a0b0d]">{selectedAssignment.points}</p>
              </div>
              <div className="p-3 border border-[#dee1e6] rounded-[12px] bg-[#f7f7f7]">
                <p className="text-xs text-[#7c828a] mb-1">Attachments</p>
                <p className="font-semibold text-[#0a0b0d]">📎 {selectedAssignment.attachments}</p>
              </div>
              <div className="p-3 border border-[#dee1e6] rounded-[12px]" style={{ backgroundColor: selectedAssignment.status === 'submitted' ? '#e8f5e9' : '#f7f7f7' }}>
                <p className="text-xs text-[#7c828a] mb-1">Status</p>
                <p className="font-semibold" style={{ color: selectedAssignment.status === 'submitted' ? '#28a745' : '#dc3545' }}>
                  {selectedAssignment.status === 'submitted' ? '✓ Submitted' : 'Pending'}
                </p>
              </div>
              {selectedAssignment.grade !== undefined && (
                <div className="col-span-2 p-3 border border-[#dee1e6] rounded-[12px]" style={{ backgroundColor: '#e8f5e9' }}>
                  <p className="text-xs text-[#7c828a] mb-1">Grade</p>
                  <p className="font-semibold" style={{ color: '#28a745' }}>
                    {selectedAssignment.grade}/{selectedAssignment.points} ({Math.round((selectedAssignment.grade / selectedAssignment.points) * 100)}%)
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 px-5 py-3 text-sm font-semibold border border-[#dee1e6] rounded-[100px] transition-all hover:bg-gray-50"
                style={{ borderColor: '#0052ff', color: '#0052ff', backgroundColor: 'white', height: 44, lineHeight: 1.15 }}
              >
                Close
              </button>
              {selectedAssignment.status === 'pending' && (
                <button
                  onClick={() => { setShowViewModal(false); handleViewDetails(selectedAssignment) }}
                  className="flex-1 px-5 py-3 text-sm font-semibold border border-[#dee1e6] rounded-[100px] transition-all hover:opacity-90"
                  style={{ borderColor: '#0052ff', backgroundColor: '#0052ff', color: 'white', height: 44, lineHeight: 1.15 }}
                >
                  📤 Submit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
