/** Homework assignments view - filter by subject, track completion. */
import React, { useState, useEffect } from 'react'
import Pagination from '../ui/Pagination'

const STATIC_HOMEWORK = [
  { id: 1, subject: 'Mathematics', title: 'Calculus Problem Set 5', description: 'Solve problems 1-15 from Chapter 8. Focus on integration techniques.', dueDate: 'Mar 10, 2026', status: 'pending', marks: 25, assignedDate: 'Feb 28, 2026' },
  { id: 2, subject: 'Physics', title: 'Thermodynamics Assignment', description: 'Write a report on the First Law of Thermodynamics with examples.', dueDate: 'Mar 15, 2026', status: 'pending', marks: 30, assignedDate: 'Mar 01, 2026' },
  { id: 3, subject: 'Chemistry', title: 'Organic Chemistry Worksheet', description: 'Complete the reaction mechanism worksheet for Chapter 5.', dueDate: 'Mar 20, 2026', status: 'pending', marks: 20, assignedDate: 'Mar 05, 2026' },
]

const loadHomework = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('icfy_homework') || 'null')
    if (saved && saved.length > 0) {
      return saved.map(h => ({
        ...h,
        status: h.status || 'pending',
        marks: h.marks || 10,
        assignedDate: h.assignedDate || 'Not assigned',
      }))
    }
  } catch {}
  return STATIC_HOMEWORK
}

export default function Homework() {
  const [filter, setFilter] = useState('all')
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedHomework, setSelectedHomework] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [homework, setHomework] = useState(loadHomework)
  const itemsPerPage = 100

  // Reload when admin updates homework
  useEffect(() => {
    setHomework(loadHomework())
  }, [])

  const filteredHomework = filter === 'all' ? homework : homework.filter(h => h.status === filter)
  const totalPages = Math.ceil(filteredHomework.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedHomework = filteredHomework.slice(startIndex, endIndex)

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffc107'
      case 'overdue':
        return '#dc3545'
      case 'submitted':
        return '#28a745'
      default:
        return '#1e3a8a'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'overdue':
        return 'Overdue'
      case 'submitted':
        return 'Submitted'
      default:
        return status
    }
  }

  const handleSubmit = (hw) => {
    setSelectedHomework(hw)
    setShowSubmitModal(true)
  }

  const handleSubmitHomework = (e) => {
    e.preventDefault()
    const submittedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
    const updatedHomework = homework.map(h =>
      h.id === selectedHomework.id
        ? { ...h, status: 'submitted', submittedDate, submittedFile: selectedFile ? selectedFile.name : '' }
        : h
    )
    setHomework(updatedHomework)
    localStorage.setItem('icfy_homework', JSON.stringify(updatedHomework))
    setSelectedFile(null)
    setShowSubmitModal(false)
    setSelectedHomework(null)
  }

  const pendingCount = homework.filter(h => h.status === 'pending').length
  const overdueCount = homework.filter(h => h.status === 'overdue').length
  const submittedCount = homework.filter(h => h.status === 'submitted').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-normal text-[#0a0b0d]">Homework</h2>
        <p className="text-[#5b616e] mt-2">Track and submit your homework assignments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="border border-[#dee1e6] rounded-[24px] p-6 bg-white border-l-4" style={{ borderLeftColor: '#ffc107' }}>
          <h3 className="text-sm font-semibold text-[#5b616e] mb-2">Pending</h3>
          <p className="text-4xl font-semibold" style={{ color: '#ffc107' }}>{pendingCount}</p>
        </div>
        <div className="border border-[#dee1e6] rounded-[24px] p-6 bg-white border-l-4" style={{ borderLeftColor: '#dc3545' }}>
          <h3 className="text-sm font-semibold text-[#5b616e] mb-2">Overdue</h3>
          <p className="text-4xl font-semibold" style={{ color: '#dc3545' }}>{overdueCount}</p>
        </div>
        <div className="border border-[#dee1e6] rounded-[24px] p-6 bg-white border-l-4" style={{ borderLeftColor: '#28a745' }}>
          <h3 className="text-sm font-semibold text-[#5b616e] mb-2">Submitted</h3>
          <p className="text-4xl font-semibold" style={{ color: '#28a745' }}>{submittedCount}</p>
        </div>
        <div className="border border-[#dee1e6] rounded-[24px] p-6 bg-white border-l-4" style={{ borderLeftColor: '#1e3a8a' }}>
          <h3 className="text-sm font-semibold text-[#5b616e] mb-2">Total</h3>
          <p className="text-4xl font-semibold" style={{ color: '#1e3a8a' }}>{homework.length}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border border-[#dee1e6] rounded-[24px] p-4 bg-white">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-[12px] font-semibold transition-all text-sm ${
              filter === 'all' ? 'text-white' : 'text-[#5b616e]'
            }`}
            style={{ backgroundColor: filter === 'all' ? '#0052ff' : 'transparent' }}
          >
            All ({homework.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-[12px] font-semibold transition-all text-sm ${
              filter === 'pending' ? 'text-white' : 'text-[#5b616e]'
            }`}
            style={{ backgroundColor: filter === 'pending' ? '#ffc107' : 'transparent' }}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded-[12px] font-semibold transition-all text-sm ${
              filter === 'overdue' ? 'text-white' : 'text-[#5b616e]'
            }`}
            style={{ backgroundColor: filter === 'overdue' ? '#dc3545' : 'transparent' }}
          >
            Overdue ({overdueCount})
          </button>
          <button
            onClick={() => setFilter('submitted')}
            className={`px-4 py-2 rounded-[12px] font-semibold transition-all text-sm ${
              filter === 'submitted' ? 'text-white' : 'text-[#5b616e]'
            }`}
            style={{ backgroundColor: filter === 'submitted' ? '#28a745' : 'transparent' }}
          >
            Submitted
          </button>
        </div>
      </div>

      {/* Homework Table */}
      <div className="border border-[#dee1e6] rounded-[24px] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dee1e6]">
                <th className="text-left px-5 py-3 font-semibold text-[#0a0b0d]">Title</th>
                <th className="text-left px-5 py-3 font-semibold text-[#0a0b0d]">Subject</th>
                <th className="text-left px-5 py-3 font-semibold text-[#0a0b0d]">Assigned</th>
                <th className="text-left px-5 py-3 font-semibold text-[#0a0b0d]">Due Date</th>
                <th className="text-left px-5 py-3 font-semibold text-[#0a0b0d]">Marks</th>
                <th className="text-left px-5 py-3 font-semibold text-[#0a0b0d]">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-[#0a0b0d]">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedHomework.map((hw, idx) => (
                <tr
                  key={hw.id}
                  className="border-b border-[#dee1e6] hover:bg-[#f7f7f7] transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#0a0b0d]">{hw.title}</p>
                    <p className="text-xs text-[#7c828a] mt-0.5 max-w-[180px] truncate">{hw.description}</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-[#5b616e]">{hw.subject}</td>
                  <td className="px-5 py-4 text-[#5b616e]">{hw.assignedDate}</td>
                  <td className="px-5 py-4 text-[#5b616e]">{hw.dueDate}</td>
                  <td className="px-5 py-4 font-semibold" style={{ color: '#f59e0b' }}>
                    {hw.grade != null ? `${hw.grade}/${hw.marks}` : hw.marks}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-3 py-1 rounded-[100px] text-xs font-semibold text-white whitespace-nowrap"
                      style={{ backgroundColor: getStatusColor(hw.status) }}
                    >
                      {getStatusText(hw.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedHomework(hw); setShowDetailsModal(true) }}
                        className="px-3 py-1.5 rounded-[12px] text-xs font-semibold border transition-all whitespace-nowrap"
                        style={{ borderColor: '#f59e0b', color: '#f59e0b', backgroundColor: 'white' }}
                      >
                        View
                      </button>
                      {(hw.status === 'pending' || hw.status === 'overdue') && (
                        <button
                          onClick={() => handleSubmit(hw)}
                          className="px-3 py-1.5 rounded-[12px] text-xs font-semibold border transition-all hover:bg-[#003ecc] hover:text-white whitespace-nowrap"
                          style={{ borderColor: '#0052ff', color: '#0052ff', backgroundColor: 'white' }}
                        >
                          Submit
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
        totalItems={filteredHomework.length}
        itemsPerPage={100}
        alwaysShow={true}
      />

      {/* View Details Modal */}
      {showDetailsModal && selectedHomework && (
        <div
          className="fixed inset-0  flex items-center justify-center z-50"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white border border-[#dee1e6] rounded-[24px] p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#0a0b0d]">Homework Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-2xl text-[#7c828a] hover:text-[#5b616e] transition"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-[#0a0b0d]">{selectedHomework.title}</h3>
                <p className="text-[#5b616e] mb-3">{selectedHomework.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-[12px]" style={{ backgroundColor: '#fef9f0' }}>
                  <p className="text-xs text-[#5b616e] font-semibold">Subject</p>
                  <p className="text-lg font-semibold text-[#0a0b0d]">{selectedHomework.subject}</p>
                </div>
                <div className="p-3 rounded-[12px]" style={{ backgroundColor: '#fef9f0' }}>
                  <p className="text-xs text-[#5b616e] font-semibold">Marks</p>
                  <p className="text-lg font-semibold" style={{ color: '#f59e0b' }}>{selectedHomework.marks} Marks</p>
                </div>
                <div className="p-3 rounded-[12px]" style={{ backgroundColor: '#fef9f0' }}>
                  <p className="text-xs text-[#5b616e] font-semibold">Assigned Date</p>
                  <p className="text-lg font-semibold text-[#0a0b0d]">{selectedHomework.assignedDate}</p>
                </div>
                <div className="p-3 rounded-[12px]" style={{ backgroundColor: '#fef9f0' }}>
                  <p className="text-xs text-[#5b616e] font-semibold">Due Date</p>
                  <p className="text-lg font-semibold" style={{ color: '#dc3545' }}>{selectedHomework.dueDate}</p>
                </div>
              </div>
              
              <div className="p-4 rounded-[12px]" style={{ backgroundColor: '#e8f5f0' }}>
                <p className="text-sm font-semibold mb-1 text-[#0a0b0d]">Status</p>
                <span
                  className="px-3 py-1 rounded-[100px] text-sm font-semibold text-white"
                  style={{ backgroundColor: getStatusColor(selectedHomework.status) }}
                >
                  {getStatusText(selectedHomework.status)}
                </span>
              </div>
              
              {selectedHomework.submittedDate && (
                <div className="p-4 rounded-[12px]" style={{ backgroundColor: '#d4edda' }}>
                  <p className="text-sm font-semibold text-[#5b616e] mb-1">Submitted Date</p>
                  <p className="text-lg font-semibold" style={{ color: '#28a745' }}>{selectedHomework.submittedDate}</p>
                </div>
              )}
              
              {selectedHomework.grade !== null && selectedHomework.grade !== undefined && (
                <div className="p-4 rounded-[12px]" style={{ backgroundColor: '#d4edda' }}>
                  <p className="text-sm font-semibold text-[#5b616e] mb-1">Grade</p>
                  <p className="text-lg font-semibold" style={{ color: '#28a745' }}>{selectedHomework.grade}/{selectedHomework.marks}</p>
                </div>
              )}
              
              {selectedHomework.feedback && (
                <div className="p-4 rounded-[12px]" style={{ backgroundColor: '#e8f4f8' }}>
                  <p className="text-sm font-semibold mb-2 text-[#0a0b0d]">Teacher's Feedback</p>
                  <p className="text-sm text-[#5b616e]">{selectedHomework.feedback}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 py-3 rounded-[100px] font-semibold text-sm border border-[#dee1e6] transition-all"
                style={{ color: '#0a0b0d', backgroundColor: 'white', height: 44, lineHeight: 1.15 }}
              >
                Close
              </button>
              {(selectedHomework.status === 'pending' || selectedHomework.status === 'overdue') && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    handleSubmit(selectedHomework)
                  }}
                  className="flex-1 py-3 rounded-[100px] font-semibold text-sm transition-all hover:bg-[#003ecc] bg-[#0052ff] text-white"
                  style={{ height: 44, lineHeight: 1.15 }}
                >
                  Submit Homework
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Homework Modal */}
      {showSubmitModal && selectedHomework && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSubmitModal(false)}
        >
          <div
            className="bg-white border border-[#dee1e6] rounded-[24px] w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#0a0b0d] mb-1">Submit Homework</h2>
              <p className="text-[#7c828a] text-sm mb-4">{selectedHomework.title}</p>

              <form onSubmit={handleSubmitHomework} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#5b616e] mb-1">Upload File</label>
                  <input
                    type="file"
                    className="w-full px-3 py-2 rounded-[12px] border border-[#dee1e6] focus:outline-none text-sm"
                    required
                    onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  />
                  {selectedFile && (
                    <p className="text-xs mt-1 text-green-600">Selected: {selectedFile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#5b616e] mb-1">Comments (Optional)</label>
                  <textarea
                    className="w-full px-3 py-2 rounded-[12px] border border-[#dee1e6] focus:outline-none text-sm resize-none"
                    rows="3"
                    placeholder="Add any comments..."
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowSubmitModal(false); setSelectedFile(null); }}
                    className="flex-1 py-2 rounded-[100px] font-medium text-sm border border-[#dee1e6] text-[#5b616e] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-[100px] font-medium text-sm bg-[#0052ff] text-white hover:bg-[#003ecc] transition-colors"
                    style={{ height: 44, lineHeight: 1.15 }}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
