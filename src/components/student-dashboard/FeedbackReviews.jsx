/** Feedback and review submission form with star rating and message. */
import React, { useState } from 'react'
import Pagination from '../ui/Pagination'

export default function FeedbackReviews() {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [myReviewsPage, setMyReviewsPage] = useState(1)
  const [allReviewsPage, setAllReviewsPage] = useState(1)
  const itemsPerPage = 100
  const [feedbackForm, setFeedbackForm] = useState({
    course: '',
    rating: 5,
    category: 'course',
    feedback: ''
  })

  const myReviews = [
    {
      id: 1,
      course: 'Mathematics Advanced',
      rating: 5,
      feedback: 'Excellent teaching methodology! The concepts are explained very clearly.',
      date: 'Jan 15, 2026',
      category: 'Course Quality',
      response: 'Thank you for your feedback! We\'re glad you\'re enjoying the course.'
    },
    {
      id: 2,
      course: 'Physics Fundamentals',
      rating: 4,
      feedback: 'Good course content but would appreciate more practice problems.',
      date: 'Jan 10, 2026',
      category: 'Course Content',
      response: null
    }
  ]

  const allReviews = [
    {
      id: 1,
      student: 'Rahul S.',
      course: 'Chemistry Basics',
      rating: 5,
      feedback: 'Outstanding tutor! Very patient and explains everything in detail.',
      date: '2 days ago'
    },
    {
      id: 2,
      student: 'Priya M.',
      course: 'Computer Science',
      rating: 5,
      feedback: 'Best online learning platform. Highly recommended!',
      date: '3 days ago'
    },
    {
      id: 3,
      student: 'Amit K.',
      course: 'Mathematics Advanced',
      rating: 4,
      feedback: 'Great teaching style and the practice materials are very helpful.',
      date: '5 days ago'
    },
    {
      id: 4,
      student: 'Sneha P.',
      course: 'Physics Fundamentals',
      rating: 5,
      feedback: 'The live classes are interactive and engaging. Love it!',
      date: '1 week ago'
    }
  ]

  const handleSubmitFeedback = (e) => {
    e.preventDefault()
    alert('Thank you for your feedback! We value your input.')
    setShowFeedbackForm(false)
    setFeedbackForm({ course: '', rating: 5, category: 'course', feedback: '' })
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className="text-2xl"
            style={{ color: star <= rating ? '#f59e0b' : '#e0e0e0' }}
          >
            ★
          </span>
        ))}
      </div>
    )
  }

  const averageRating = (allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length).toFixed(1)

  // Pagination for My Reviews
  const myReviewsTotalPages = Math.ceil(myReviews.length / itemsPerPage)
  const myReviewsStartIndex = (myReviewsPage - 1) * itemsPerPage
  const paginatedMyReviews = myReviews.slice(myReviewsStartIndex, myReviewsStartIndex + itemsPerPage)

  // Pagination for All Reviews
  const allReviewsTotalPages = Math.ceil(allReviews.length / itemsPerPage)
  const allReviewsStartIndex = (allReviewsPage - 1) * itemsPerPage
  const paginatedAllReviews = allReviews.slice(allReviewsStartIndex, allReviewsStartIndex + itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-normal text-[#0a0b0d]" style={{ lineHeight: 1.15, letterSpacing: '-0.5px' }}>Feedback & Reviews</h2>
          <p className="text-[#5b616e] mt-2">Share your experience and read reviews from other students</p>
        </div>
        <button
          onClick={() => setShowFeedbackForm(true)}
          className="px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
          style={{ height: 44, lineHeight: 1.15 }}
        >
          Write Review
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
          <h3 className="text-sm font-semibold text-[#5b616e] mb-2">Average Rating</h3>
          <div className="flex items-center gap-3">
            <p className="text-4xl font-bold" style={{ color: '#f59e0b' }}>{averageRating}</p>
            <span className="text-3xl" style={{ color: '#f59e0b' }}>★</span>
          </div>
        </div>
        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4" style={{ borderLeftColor: '#1e3a8a' }}>
          <h3 className="text-sm font-semibold text-[#5b616e] mb-2">Total Reviews</h3>
          <p className="text-4xl font-bold" style={{ color: '#1e3a8a' }}>{allReviews.length + myReviews.length}</p>
        </div>
        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4" style={{ borderLeftColor: '#28a745' }}>
          <h3 className="text-sm font-semibold text-[#5b616e] mb-2">My Reviews</h3>
          <p className="text-4xl font-bold" style={{ color: '#28a745' }}>{myReviews.length}</p>
        </div>
      </div>

      {/* My Reviews Table */}
      <div className="bg-white border border-[#dee1e6] rounded-[24px] overflow-hidden">
        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#0a0b0d]">My Reviews</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dee1e6]">
                <th className="text-left px-5 py-3 font-semibold text-[#5b616e]">Course</th>
                <th className="text-left px-5 py-3 font-semibold text-[#5b616e]">Rating</th>
                <th className="text-left px-5 py-3 font-semibold text-[#5b616e]">Category</th>
                <th className="text-left px-5 py-3 font-semibold text-[#5b616e]">Date</th>
                <th className="text-left px-5 py-3 font-semibold text-[#5b616e]">Feedback</th>
                <th className="text-left px-5 py-3 font-semibold text-[#5b616e]">Response</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMyReviews.map((review) => (
                <tr key={review.id} className="border-b border-[#dee1e6] hover:bg-[#f7f7f7] transition-colors">
                  <td className="px-5 py-4 font-semibold text-[#0a0b0d]">{review.course}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= review.rating ? '#f59e0b' : '#e0e0e0' }}>★</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 rounded-[100px] text-xs font-semibold text-white" style={{ backgroundColor: '#0052ff' }}>{review.category}</span>
                  </td>
                  <td className="px-5 py-4 text-[#7c828a] whitespace-nowrap">{review.date}</td>
                  <td className="px-5 py-4 text-[#5b616e] max-w-50">
                    <p className="line-clamp-2">{review.feedback}</p>
                  </td>
                  <td className="px-5 py-4">
                    {review.response ? (
                      <p className="text-xs max-w-40 line-clamp-2" style={{ color: '#0052ff' }}>{review.response}</p>
                    ) : <span className="text-[#a8acb3] text-xs">No response yet</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        currentPage={myReviewsPage}
        totalPages={myReviewsTotalPages}
        onPageChange={setMyReviewsPage}
        totalItems={myReviews.length}
        itemsPerPage={itemsPerPage}
        alwaysShow={true}
      />

      {/* All Reviews Table */}
      <div className="bg-white border border-[#dee1e6] rounded-[24px] overflow-hidden">
        <div className="px-6 pt-5 pb-2">
          <h3 className="text-base font-semibold text-[#0a0b0d]">Student Reviews</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dee1e6]">
                <th className="text-left px-5 py-3 font-semibold text-[#5b616e]">Student</th>
                <th className="text-left px-5 py-3 font-semibold text-[#5b616e]">Course</th>
                <th className="text-left px-5 py-3 font-semibold text-[#5b616e]">Rating</th>
                <th className="text-left px-5 py-3 font-semibold text-[#5b616e]">Date</th>
                <th className="text-left px-5 py-3 font-semibold text-[#5b616e]">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAllReviews.map((review) => (
                <tr key={review.id} className="border-b border-[#dee1e6] hover:bg-[#f7f7f7] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-[100px] flex items-center justify-center font-semibold text-white text-sm shrink-0" style={{ backgroundColor: '#0052ff' }}>
                        {review.student.charAt(0)}
                      </div>
                      <p className="font-semibold text-[#0a0b0d] whitespace-nowrap">{review.student}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#5b616e]">{review.course}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color: s <= review.rating ? '#f59e0b' : '#e0e0e0' }}>★</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#7c828a] whitespace-nowrap">{review.date}</td>
                  <td className="px-5 py-4 text-[#5b616e] max-w-60">
                    <p className="line-clamp-2">{review.feedback}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        currentPage={allReviewsPage}
        totalPages={allReviewsTotalPages}
        onPageChange={setAllReviewsPage}
        totalItems={allReviews.length}
        itemsPerPage={itemsPerPage}
        alwaysShow={true}
      />

      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <div
          className="fixed inset-0  flex items-center justify-center z-50"
          onClick={() => setShowFeedbackForm(false)}
        >
          <div
            className="bg-white border border-[#dee1e6] rounded-[24px] p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold mb-6 text-[#0a0b0d]">Write Your Review</h2>
            
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#5b616e] mb-2">Course</label>
                  <select
                    value={feedbackForm.course}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, course: e.target.value })}
                    className="w-full border border-[#dee1e6] rounded-[12px] focus:outline-none focus:border-[#0052ff]"
                    style={{ height: 48, padding: '14px 16px' }}
                    required
                  >
                    <option value="">Select course</option>
                    <option value="Mathematics Advanced">Mathematics Advanced</option>
                    <option value="Physics Fundamentals">Physics Fundamentals</option>
                    <option value="Chemistry Basics">Chemistry Basics</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#5b616e] mb-2">Category</label>
                  <select
                    value={feedbackForm.category}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                    className="w-full border border-[#dee1e6] rounded-[12px] focus:outline-none focus:border-[#0052ff]"
                    style={{ height: 48, padding: '14px 16px' }}
                  >
                    <option value="course">Course Quality</option>
                    <option value="teaching">Teaching</option>
                    <option value="content">Course Content</option>
                    <option value="platform">Platform</option>
                    <option value="support">Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5b616e] mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                      className="text-4xl transition-all"
                      style={{ color: star <= feedbackForm.rating ? '#f59e0b' : '#e0e0e0' }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5b616e] mb-2">Your Feedback</label>
                <textarea
                  value={feedbackForm.feedback}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                  className="w-full border border-[#dee1e6] rounded-[12px] focus:outline-none focus:border-[#0052ff] resize-none"
                  style={{ padding: '14px 16px' }}
                  rows="5"
                  placeholder="Share your experience..."
                  required
                ></textarea>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="flex-1 py-3 rounded-[100px] font-semibold border transition-all"
                  style={{ borderColor: '#dc3545', color: '#dc3545', height: 44, lineHeight: 1.15 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
                  style={{ height: 44, lineHeight: 1.15 }}
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
