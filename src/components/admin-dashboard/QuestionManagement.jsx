import React, { useState, useEffect } from 'react'
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../../api/api/questionApi'
import { getAdminAnswers, approveAnswer, rejectAnswer, deleteAnswer } from '../../api/api/answerApi'
import { getCategories } from '../../api/api/categoryApi'
import RichDescriptionEditor from '../RichDescriptionEditor'
import toast from 'react-hot-toast'
import ScrollableCard from './ScrollableCard'
import { Search, Filter, MessageSquare, CheckCircle, XCircle, Trash2, Eye, ChevronLeft, ChevronRight, AlertCircle, Plus, X, Edit3 } from 'lucide-react'

export default function QuestionManagement() {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  })
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ title: '', descriptionHtml: '', categoryId: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('questions')
  const [answers, setAnswers] = useState([])
  const [answersPagination, setAnswersPagination] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0
  })
  const [viewQuestion, setViewQuestion] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (activeTab === 'questions') {
      fetchQuestions()
    } else {
      fetchAnswers()
    }
  }, [activeTab, filterStatus, selectedCategory, pagination.page])

  const fetchCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
      }
      const data = await getQuestions(params)
      setQuestions(data.content || [])
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }))
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnswers = async () => {
    setLoading(true)
    try {
      const params = {
        page: answersPagination.page,
        size: answersPagination.size,
        status: filterStatus === 'all' ? undefined : filterStatus.toUpperCase()
      }
      const data = await getAdminAnswers(params)
      setAnswers(data.content || [])
      setAnswersPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }))
    } catch (error) {
      console.error('Error fetching answers:', error)
      toast.error('Failed to load answers')
    } finally {
      setLoading(false)
    }
  }

  const filteredQuestions = questions.filter(q =>
    !searchTerm || q.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.descriptionHtml?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAnswers = answers.filter(a =>
    !searchTerm || a.contentHtml?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.questionTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setFilterStatus('all')
    setSelectedCategory('all')
    setPagination(p => ({ ...p, page: 0 }))
    setAnswersPagination(p => ({ ...p, page: 0 }))
  }

  const openCreateModal = () => {
    setEditId(null)
    setForm({ title: '', descriptionHtml: '', categoryId: '' })
    setShowModal(true)
  }

  const openEditModal = (q) => {
    setEditId(q.id)
    setForm({
      title: q.title || '',
      descriptionHtml: q.descriptionHtml || '',
      categoryId: q.category?.id || ''
    })
    setShowModal(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const titleVal = (form.title || '').trim()
    const descVal = (form.descriptionHtml || '').replace(/<[^>]*>/g, '').trim()
    if (!titleVal || !descVal) {
      toast.error('Please fill in both title and description')
      return
    }
    setFormLoading(true)
    try {
      const payload = {
        title: titleVal,
        descriptionHtml: (form.descriptionHtml || '').trim(),
        categoryId: form.categoryId || undefined
      }
      if (editId) {
        await updateQuestion(editId, payload)
        toast.success('Question updated successfully')
      } else {
        await createQuestion(payload)
        toast.success('Question created successfully')
      }
      setShowModal(false)
      setEditId(null)
      setForm({ title: '', descriptionHtml: '', categoryId: '' })
      fetchQuestions()
    } catch (error) {
      toast.error(error.message || 'Failed to save question')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return
    try {
      await deleteQuestion(id)
      toast.success('Question deleted successfully')
      fetchQuestions()
    } catch (error) {
      toast.error(error.message || 'Failed to delete question')
    }
  }

  const handleApproveAnswer = async (id) => {
    try {
      await approveAnswer(id)
      toast.success('Answer approved')
      fetchAnswers()
    } catch (error) {
      toast.error(error.message || 'Failed to approve answer')
    }
  }

  const handleRejectAnswer = async (id) => {
    const reason = prompt('Enter rejection reason:')
    if (reason === null) return
    try {
      await rejectAnswer(id, reason)
      toast.success('Answer rejected')
      fetchAnswers()
    } catch (error) {
      toast.error(error.message || 'Failed to reject answer')
    }
  }

  const handleDeleteAnswer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return
    try {
      await deleteAnswer(id)
      toast.success('Answer deleted')
      fetchAnswers()
    } catch (error) {
      toast.error(error.message || 'Failed to delete answer')
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-3">
            <MessageSquare className="w-8 h-8" />
            Q&A Management
          </h2>
          <p className="text-gray-600 mt-2">Manage student questions and tutor answers</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create Question
        </button>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => handleTabChange('questions')}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'questions' ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-500 hover:text-blue-900'
          }`}
        >
          Questions
        </button>
        <button
          onClick={() => handleTabChange('answers')}
          className={`px-6 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'answers' ? 'border-blue-900 text-blue-900' : 'border-transparent text-gray-500 hover:text-blue-900'
          }`}
        >
          Answers
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1 min-w-0 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto min-w-0">
          {activeTab === 'questions' && (
              <select
                className="block w-full sm:w-auto max-w-full min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setPagination(p => ({ ...p, page: 0 })); }}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}
            <select
              className="block w-full sm:w-auto max-w-full min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setAnswersPagination(p => ({ ...p, page: 0 })); }}
            >
            <option value="all">All Status</option>
            {activeTab === 'answers' && (
              <>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <ScrollableCard>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Category / User</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-700 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div></div>
                  </td>
                </tr>
              ) : activeTab === 'questions' ? (
                filteredQuestions.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">{searchTerm ? 'No questions match your search' : 'No questions found'}</td></tr>
                ) : filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-blue-900 mb-1">{q.title}</div>
                      <div className="text-sm text-gray-500 line-clamp-2" dangerouslySetInnerHTML={{ __html: q.descriptionHtml }}></div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-gray-700">{q.category?.name || 'General'}</div>
                      <div className="text-gray-500">{new Date(q.createdAt).toLocaleDateString('en-GB')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Question</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setViewQuestion(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button onClick={() => openEditModal(q)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Edit">
                          <Edit3 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredAnswers.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-500">{searchTerm ? 'No answers match your search' : 'No answers found'}</td></tr>
                ) : filteredAnswers.map((a) => (
                  <tr key={a.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 line-clamp-2" dangerouslySetInnerHTML={{ __html: a.contentHtml }}></div>
                      <div className="text-xs text-gray-500 mt-1">On Question: {a.questionTitle || a.questionId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-gray-700">{a.authorName || 'Student'}</div>
                      <div className="text-gray-500">{new Date(a.createdAt).toLocaleDateString('en-GB')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {a.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleApproveAnswer(a.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleRejectAnswer(a.id)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Reject">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button onClick={() => handleDeleteAnswer(a.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollableCard>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {activeTab === 'questions' ? filteredQuestions.length : filteredAnswers.length} of {activeTab === 'questions' ? pagination.totalElements : answersPagination.totalElements} entries{searchTerm ? ' (filtered)' : ''}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => activeTab === 'questions' ? setPagination(p => ({ ...p, page: p.page - 1 })) : setAnswersPagination(p => ({ ...p, page: p.page - 1 }))}
              disabled={(activeTab === 'questions' ? pagination.page : answersPagination.page) === 0}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => activeTab === 'questions' ? setPagination(p => ({ ...p, page: p.page + 1 })) : setAnswersPagination(p => ({ ...p, page: p.page + 1 }))}
              disabled={(activeTab === 'questions' ? pagination.page : answersPagination.page) >= (activeTab === 'questions' ? pagination.totalPages : answersPagination.totalPages) - 1}
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* View Question Modal */}
      {viewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setViewQuestion(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-full sm:max-w-2xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white truncate">{viewQuestion.title}</h3>
              <button onClick={() => setViewQuestion(null)} className="text-white/80 hover:text-white shrink-0 ml-4">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">{viewQuestion.category?.name || 'General'}</span>
                <span>{new Date(viewQuestion.createdAt).toLocaleDateString('en-GB')}</span>
                {viewQuestion.slug && <span className="text-gray-400">/{viewQuestion.slug}</span>}
              </div>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: viewQuestion.descriptionHtml }} />
            </div>
            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
              <button onClick={() => { setViewQuestion(null); openEditModal(viewQuestion); }} className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all">
                <Edit3 className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => { const q = viewQuestion; setViewQuestion(null); handleDeleteQuestion(q.id); }} className="inline-flex items-center gap-2 px-5 py-2 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <button onClick={() => setViewQuestion(null)} className="px-5 py-2 text-sm font-bold text-gray-600 hover:text-gray-800">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-full sm:max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 to-blue-700 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {editId ? <Edit3 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                {editId ? 'Edit Question' : 'Create New Question'}
              </h3>
              <button onClick={() => { setShowModal(false); setEditId(null); }} className="text-white/80 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="block w-full max-w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">General</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Enter question title"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <RichDescriptionEditor
                  value={form.descriptionHtml}
                  onChange={(html) => setForm(f => ({ ...f, descriptionHtml: html }))}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditId(null); }}
                  className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : editId ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
