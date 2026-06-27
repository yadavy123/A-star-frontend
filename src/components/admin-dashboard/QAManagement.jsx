import React, { useState, useEffect, useCallback, useRef } from 'react';
import ScrollableCard from './ScrollableCard';
import Pagination from '../ui/Pagination';
import {
  getQuestions, getAdminQuestions, createQuestion, updateQuestion, deleteQuestion,
  approveQuestion, changeQuestionStatus
} from '../../api/api/questionApi';
import { askApi } from '../../api/askApi';
const { uploadFile } = askApi;
import { ContentEditor } from '../editor/ContentEditor';
import {
  getAdminAnswers, submitAdminAnswer, approveAnswer, rejectAnswer, deleteAnswer,
  markAnswerCorrect
} from '../../api/api/answerApi';
import { getCategories } from '../../api/api/categoryApi';
import { getAdminGrades } from '../../api/api/gradeApi';
import { getSubjects } from '../../api/api/subjectApi';
import { getAdminLeads } from '../../api/api/leadApi';
import toast from 'react-hot-toast';

import {
  Search, Filter, MessageSquare, HelpCircle, CheckCircle, XCircle, Trash2,
  Eye, Edit3, Plus, X, ChevronLeft, ChevronRight, Download, Flag, Clock,
  FileText, Users, BarChart3, ExternalLink, ZoomIn, ZoomOut, RotateCw, Loader2,
  Upload, Image
} from 'lucide-react';

const GRADE_SUBJECT_MAP = {
  'Primary (Grades 1-5)': ['Languages', 'Mathematics', 'Science / Environmental Studies', 'Social Studies', 'Computer Science'],
  'Lower Secondary (Grades 6-8)': ['Languages', 'Mathematics', 'Science / Environmental Studies', 'Social Studies', 'Computer Science'],
  'IGCSE (Grades 9-10)': ['Languages', 'Mathematics (Core or Extended)', 'Physics', 'Chemistry', 'Biology', 'Humanities and Social Studies', 'Computer Science'],
  'AS Level (Grade 11)': ['Physics', 'Chemistry', 'Economics', 'Mathematics', 'Further Mathematics', 'Languages', 'Biology'],
  'A Level (Grade 12)': ['Physics', 'Chemistry', 'Economics', 'Mathematics', 'Further Mathematics', 'Languages', 'Biology'],
};

const STATUS_CONFIG = {
  OPEN: { bg: 'bg-[#f7f7f7] text-[#0a0b0d]', label: 'Open' },
  OPEN_TO_ANSWER: { bg: 'bg-[#f7f7f7] text-[#0a0b0d]', label: 'Open' },
  UNDER_REVIEW: { bg: 'bg-[#f7f7f7] text-[#f4b000]', label: 'Under Review' },
  ANSWERED: { bg: 'bg-[#f7f7f7] text-[#05b169]', label: 'Answered' },
  CLOSED: { bg: 'bg-[#f7f7f7] text-[#5b616e]', label: 'Closed' }
};

const APPROVAL_STATUS_CONFIG = {
  PENDING: { bg: 'bg-[#f7f7f7] text-[#f4b000]', label: 'Pending' },
  APPROVED: { bg: 'bg-[#f7f7f7] text-[#05b169]', label: 'Approved' },
  REJECTED: { bg: 'bg-[#f7f7f7] text-[#cf202f]', label: 'Rejected' }
};

const ANSWER_STATUS_CONFIG = {
  PENDING: { bg: 'bg-[#f7f7f7] text-[#f4b000]', label: 'Pending' },
  APPROVED: { bg: 'bg-[#f7f7f7] text-[#05b169]', label: 'Approved' },
  REJECTED: { bg: 'bg-[#f7f7f7] text-[#cf202f]', label: 'Rejected' }
};

const LEAD_STATUS_CONFIG = {
  NEW: { bg: 'bg-[#f7f7f7] text-[#0052ff]', label: 'New' },
  CONTACTED: { bg: 'bg-[#f7f7f7] text-[#f4b000]', label: 'Contacted' },
  CONVERTED: { bg: 'bg-[#f7f7f7] text-[#05b169]', label: 'Converted' },
  CLOSED: { bg: 'bg-[#f7f7f7] text-[#5b616e]', label: 'Closed' }
};

const TYPE_OPTIONS = ['All', 'Doubt', 'Homework Help', 'Concept Clarification', 'Exam Prep'];

export default function QAManagement() {
  const [activeTab, setActiveTab] = useState('questions');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 0 });

  const [answers, setAnswers] = useState([]);
  const [answersPagination, setAnswersPagination] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 0 });

  const [leads, setLeads] = useState([]);
  const [leadsPagination, setLeadsPagination] = useState({ page: 0, size: 10, totalElements: 0, totalPages: 0 });

  const [viewQuestion, setViewQuestion] = useState(null);
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [questionAnswersLoading, setQuestionAnswersLoading] = useState(false);
  const [viewAnswer, setViewAnswer] = useState(null);
  const [viewLead, setViewLead] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editQuestionId, setEditQuestionId] = useState(null);
  const [questionForm, setQuestionForm] = useState({ title: '', descriptionHtml: '', gradeId: '', subjectId: '', attachments: [] });
  const [questionFormLoading, setQuestionFormLoading] = useState(false);
  const [adminAnswerContent, setAdminAnswerContent] = useState('');
  const [adminAnswerLoading, setAdminAnswerLoading] = useState(false);

  // Attachment preview
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [previewRotation, setPreviewRotation] = useState(0);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const [previewDragging, setPreviewDragging] = useState(false);
  const [previewDragStart, setPreviewDragStart] = useState({ x: 0, y: 0 });

  const openPreview = (url) => {
    setPreviewUrl(url);
    setPreviewZoom(1);
    setPreviewRotation(0);
    setPreviewPos({ x: 0, y: 0 });
  };

  const closePreview = () => setPreviewUrl(null);

  const handlePreviewMouseDown = (e) => {
    if (previewZoom > 1) {
      setPreviewDragging(true);
      setPreviewDragStart({ x: e.clientX - previewPos.x, y: e.clientY - previewPos.y });
      e.preventDefault();
    }
  };

  const handlePreviewMouseMove = (e) => {
    if (previewDragging && previewZoom > 1) {
      setPreviewPos({ x: e.clientX - previewDragStart.x, y: e.clientY - previewDragStart.y });
    }
  };

  const handlePreviewMouseUp = () => setPreviewDragging(false);

  const previewRef = useRef(null);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      setPreviewZoom(z => Math.max(0.5, Math.min(5, z - e.deltaY * 0.01)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [previewUrl]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') closePreview(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchGrades();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (activeTab === 'questions') fetchQuestions();
    else if (activeTab === 'answers') fetchAnswers();
    else if (activeTab === 'leads') fetchLeads();
  }, [activeTab, filterStatus, searchTerm, selectedCategory, selectedGrade, pagination.page, answersPagination.page, leadsPagination.page]);

  useEffect(() => {
    if (viewQuestion?.id) {
      fetchQuestionAnswers(viewQuestion.id);
    } else {
      setQuestionAnswers([]);
    }
  }, [viewQuestion?.id]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const data = await getAdminGrades();
      setGrades(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {
        keyword: searchTerm || undefined,
        gradeId: selectedGrade || undefined,
        page: pagination.page,
        size: pagination.size,
        sort: 'createdAt',
        direction: 'desc'
      };
      let data;
      try {
        data = await getAdminQuestions(params);
      } catch {
        data = await getQuestions(params);
      }
      const content = data?.content || (Array.isArray(data) ? data : []);
      setQuestions(content);
      setPagination(prev => ({
        ...prev,
        totalElements: data?.totalElements || content.length,
        totalPages: data?.totalPages || (Array.isArray(data) ? 1 : 0)
      }));
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async () => {
    setLoading(true);
    try {
      const params = {
        status: filterStatus === 'all' ? undefined : filterStatus.toUpperCase(),
        page: answersPagination.page,
        size: answersPagination.size,
        sort: 'createdAt',
        direction: 'desc'
      };
      const data = await getAdminAnswers(params);
      const content = data?.content || [];
      setAnswers(content);
      setAnswersPagination(prev => ({
        ...prev,
        totalElements: data?.totalElements || content.length,
        totalPages: data?.totalPages || 0
      }));
    } catch (error) {
      console.error('Failed to load answers:', error);
      toast.error('Failed to load answers');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const data = await getAdminLeads();
      const list = Array.isArray(data) ? data : [];
      const totalPages = Math.ceil(list.length / leadsPagination.size) || 1;
      const start = leadsPagination.page * leadsPagination.size;
      const paged = list.slice(start, start + leadsPagination.size);
      setLeads(paged);
      setLeadsPagination(prev => ({ ...prev, totalElements: list.length, totalPages }));
    } catch (error) {
      console.error('Failed to load leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionAnswers = async (questionId) => {
    setQuestionAnswersLoading(true);
    try {
      const data = await getAdminAnswers({ questionId, page: 0, size: 50, sort: 'createdAt', direction: 'desc' });
      const content = data?.content || [];
      setQuestionAnswers(content);
    } catch (error) {
      console.error('Failed to load question answers:', error);
      setQuestionAnswers([]);
    } finally {
      setQuestionAnswersLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilterStatus('all');
    setSelectedCategory('all');
    setSelectedGrade('');
    setSearchTerm('');
    setPagination(p => ({ ...p, page: 0 }));
    setAnswersPagination(p => ({ ...p, page: 0 }));
    setLeadsPagination(p => ({ ...p, page: 0 }));
  };

  const handleFilterStatusChange = (status) => {
    setFilterStatus(status);
    setPagination(p => ({ ...p, page: 0 }));
    setAnswersPagination(p => ({ ...p, page: 0 }));
    setLeadsPagination(p => ({ ...p, page: 0 }));
  };

  const openCreateQuestionModal = () => {
    setEditQuestionId(null);
    setQuestionForm({ title: '', descriptionHtml: '', gradeId: '', subjectId: '', attachments: [] });
    setShowQuestionModal(true);
  };

  const openEditQuestionModal = (q) => {
    setEditQuestionId(q.id);
    setQuestionForm({
      title: q.title || '',
      descriptionHtml: q.descriptionHtml || '',
      gradeId: q.grade?.id || '',
      subjectId: q.subject?.id || '',
      attachments: q.attachments || []
    });
    setShowQuestionModal(true);
  };

  const handleQuestionAttachmentUpload = async (file) => {
    try {
      const url = await uploadFile(file);
      setQuestionForm(f => ({ ...f, attachments: [...(f.attachments || []), url] }));
      toast.success('File uploaded');
    } catch (err) {
      toast.error(err?.message || 'Upload failed');
    }
  };

  const removeQuestionAttachment = (index) => {
    setQuestionForm(f => ({ ...f, attachments: f.attachments.filter((_, i) => i !== index) }));
  };

  const handleQuestionFormSubmit = async (e) => {
    e.preventDefault();
    const titleVal = (questionForm.title || '').trim();
    const descVal = (questionForm.descriptionHtml || '').replace(/<[^>]*>/g, '').trim();
    const hasAttachments = questionForm.attachments && questionForm.attachments.length > 0;
    if (!titleVal) {
      toast.error('Title is required');
      return;
    }
    if (!descVal && !hasAttachments) {
      toast.error('Please provide a description or upload an attachment');
      return;
    }
    if (!questionForm.gradeId || !questionForm.subjectId) {
      toast.error('Please select both grade and subject');
      return;
    }
    setQuestionFormLoading(true);
    try {
      const payload = {
        title: titleVal,
        descriptionHtml: (questionForm.descriptionHtml || '').trim() || undefined,
        gradeId: questionForm.gradeId || undefined,
        subjectId: questionForm.subjectId || undefined,
        attachments: hasAttachments ? questionForm.attachments : undefined
      };
      if (editQuestionId) {
        await updateQuestion(editQuestionId, payload);
        toast.success('Question updated successfully');
      } else {
        await createQuestion(payload);
        toast.success('Question created successfully');
      }
      setShowQuestionModal(false);
      setEditQuestionId(null);
      setQuestionForm({ title: '', descriptionHtml: '', gradeId: '', subjectId: '', attachments: [] });
      fetchQuestions();
    } catch (error) {
      toast.error(error?.message || 'Failed to save question');
    } finally {
      setQuestionFormLoading(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await deleteQuestion(id);
      toast.success('Question deleted successfully');
      if (viewQuestion?.id === id) setViewQuestion(null);
      fetchQuestions();
    } catch (error) {
      toast.error(error?.message || 'Failed to delete question');
    }
  };

  const handleSubmitAdminAnswer = async (questionId) => {
    const content = adminAnswerContent.trim();
    if (!content) { toast.error('Please write an answer'); return; }
    setAdminAnswerLoading(true);
    try {
      await submitAdminAnswer({ questionId, contentHtml: content });
      toast.success('Answer submitted successfully');
      setAdminAnswerContent('');
      fetchAnswers();
      fetchQuestions();
    } catch (error) {
      toast.error(error?.message || 'Failed to submit answer');
    } finally {
      setAdminAnswerLoading(false);
    }
  };

  const handleQuestionApproval = async (id, approvalStatus) => {
    setActionLoading(id);
    try {
      await approveQuestion(id, approvalStatus);
      toast.success(`Question ${approvalStatus.toLowerCase()}`);
      if (viewQuestion?.id === id) setViewQuestion(prev => prev ? { ...prev, approvalStatus } : null);
      fetchQuestions();
    } catch (error) {
      toast.error(error?.message || 'Failed to update question approval');
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuestionStatusChange = async (id, status) => {
    setActionLoading(id);
    try {
      await changeQuestionStatus(id, status);
      const label = STATUS_CONFIG[status]?.label || status.toLowerCase();
      toast.success(`Question ${label}`);
      if (viewQuestion?.id === id) setViewQuestion(prev => prev ? { ...prev, status } : null);
      fetchQuestions();
    } catch (error) {
      toast.error(error?.message || 'Failed to update question status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveAnswer = async (id) => {
    setActionLoading(id);
    try {
      await approveAnswer(id);
      toast.success('Answer approved');
      if (viewAnswer?.id === id) setViewAnswer(prev => prev ? { ...prev, status: 'APPROVED' } : null);
      setQuestionAnswers(prev => prev.map(a => a.id === id ? { ...a, status: 'APPROVED' } : a));
      fetchAnswers();
    } catch (error) {
      toast.error(error?.message || 'Failed to approve answer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectAnswer = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return;
    setActionLoading(id);
    try {
      await rejectAnswer(id, reason);
      toast.success('Answer rejected');
      if (viewAnswer?.id === id) setViewAnswer(null);
      setQuestionAnswers(prev => prev.map(a => a.id === id ? { ...a, status: 'REJECTED' } : a));
      fetchAnswers();
    } catch (error) {
      toast.error(error?.message || 'Failed to reject answer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkCorrect = async (id) => {
    setActionLoading(id);
    try {
      await markAnswerCorrect(id);
      toast.success('Answer marked as correct');
      fetchAnswers();
    } catch (error) {
      toast.error(error?.message || 'Failed to mark answer as correct');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAnswer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) return;
    setActionLoading(id);
    try {
      await deleteAnswer(id);
      toast.success('Answer deleted');
      if (viewAnswer?.id === id) setViewAnswer(null);
      fetchAnswers();
    } catch (error) {
      toast.error(error?.message || 'Failed to delete answer');
    } finally {
      setActionLoading(null);
    }
  };

  const getBadge = (status, config) => {
    const s = config[status?.toUpperCase()] || { bg: 'bg-[#f7f7f7] text-[#0a0b0d]', label: status || 'Unknown' };
    return <span className={`px-3 py-1 rounded-[100px] text-xs font-semibold whitespace-nowrap ${s.bg}`}>{s.label}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const renderStatsRow = () => {
    const totalQuestions = pagination.totalElements;
    const openCount = questions.filter(q => q.status === 'OPEN' || q.status === 'OPEN_TO_ANSWER' || !q.status).length;
    const resolvedCount = questions.filter(q => q.status === 'ANSWERED').length;
    const closedCount = questions.filter(q => q.status === 'CLOSED').length;
    const pendingAnswers = answers.filter(a => a.status === 'PENDING').length;
    const totalLeads = leadsPagination.totalElements;

    const cards = [
      { label: 'Total Questions', value: totalQuestions, icon: HelpCircle },
      { label: 'Open Questions', value: openCount, icon: MessageSquare },
      { label: 'Under Review', value: pendingAnswers, icon: Clock },
      { label: 'Answered', value: resolvedCount, icon: CheckCircle },
      { label: 'Closed', value: closedCount, icon: XCircle },
      { label: 'Leads Generated', value: totalLeads, icon: BarChart3 }
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-[24px] border border-[#dee1e6] p-[24px] bg-white">
              <div className="p-2 rounded-[12px] w-fit bg-[#f7f7f7] mb-3">
                <Icon className="w-5 h-5 text-[#0052ff]" />
              </div>
              <p className="text-[12px] font-semibold text-[#7c828a] uppercase tracking-wider mb-0.5" style={{ lineHeight: 1.5 }}>{s.label}</p>
              <p className="text-[32px] font-normal text-[#0a0b0d]" style={{ lineHeight: 1.0, letterSpacing: '-1px' }}>{s.value}</p>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFilterBar = () => (
    <div className="bg-white rounded-[24px] border border-[#dee1e6] p-[24px] flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8acb3] w-4 h-4" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPagination(p => ({ ...p, page: 0 })); }}
          className="w-full pl-9 pr-4 py-[14px] border border-[#dee1e6] rounded-[12px] text-[16px] text-[#0a0b0d] placeholder-[#a8acb3] focus:ring-2 focus:ring-[#0052ff]/10 focus:border-[#0052ff] outline-none transition-all"
          style={{ height: 48, lineHeight: 1.5 }}
        />
      </div>
      <select
        value={selectedGrade}
        onChange={(e) => { setSelectedGrade(e.target.value); setPagination(p => ({ ...p, page: 0 })); }}
        className="px-[16px] py-[14px] border border-[#dee1e6] rounded-[12px] text-[16px] text-[#0a0b0d] outline-none focus:ring-2 focus:ring-[#0052ff]/10 min-w-[120px]"
        style={{ height: 48, lineHeight: 1.5 }}
      >
        <option value="">Grade: All</option>
        {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      <select className="px-[16px] py-[14px] border border-[#dee1e6] rounded-[12px] text-[16px] text-[#0a0b0d] outline-none focus:ring-2 focus:ring-[#0052ff]/10 min-w-[130px]"
        style={{ height: 48, lineHeight: 1.5 }}>
        <option>Subject: All</option>
      </select>
      <select className="px-[16px] py-[14px] border border-[#dee1e6] rounded-[12px] text-[16px] text-[#0a0b0d] outline-none focus:ring-2 focus:ring-[#0052ff]/10 min-w-[100px]"
        style={{ height: 48, lineHeight: 1.5 }}>
        <option>Type: All</option>
        {TYPE_OPTIONS.filter(t => t !== 'All').map(t => <option key={t}>{t}</option>)}
      </select>
      {activeTab !== 'questions' && (
        <select
          value={filterStatus}
          onChange={(e) => handleFilterStatusChange(e.target.value)}
          className="px-[16px] py-[14px] border border-[#dee1e6] rounded-[12px] text-[16px] text-[#0a0b0d] outline-none focus:ring-2 focus:ring-[#0052ff]/10 min-w-[120px]"
          style={{ height: 48, lineHeight: 1.5 }}
        >
          <option value="all">Status: All</option>
          {activeTab === 'questions' && ['OPEN', 'UNDER_REVIEW', 'ANSWERED', 'CLOSED'].map(s => <option key={s} value={s}>{s}</option>)}
          {activeTab === 'answers' && ['PENDING', 'APPROVED', 'REJECTED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      )}
      <input type="date" className="px-[16px] py-[14px] border border-[#dee1e6] rounded-[12px] text-[16px] text-[#0a0b0d] outline-none focus:ring-2 focus:ring-[#0052ff]/10"
        style={{ height: 48, lineHeight: 1.5 }} />
      <button className="inline-flex items-center gap-2 px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
        style={{ height: 44, lineHeight: 1.15 }}>
        <Download className="w-4 h-4" /> Export
      </button>
      <button className="inline-flex items-center gap-2 px-5 py-3 border border-[#dee1e6] text-[#0a0b0d] text-sm font-semibold rounded-[100px] hover:bg-[#f7f7f7] transition"
        style={{ height: 44, lineHeight: 1.15 }}>
        <Filter className="w-4 h-4" /> Filters
      </button>
    </div>
  );

  const renderTabs = () => (
    <div className="flex border-b border-[#dee1e6] overflow-x-auto">
      {[
        { id: 'questions', label: 'Questions', count: pagination.totalElements },
        { id: 'answers', label: 'Answers', count: answersPagination.totalElements },
        { id: 'leads', label: 'Leads', count: leadsPagination.totalElements }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={`px-6 py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${
            activeTab === tab.id ? 'border-[#0052ff] text-[#0052ff]' : 'border-transparent text-[#5b616e] hover:text-[#0052ff]'
          }`}
        >
          {tab.label} {tab.count > 0 && <span className="ml-1 text-xs text-[#a8acb3]">({tab.count})</span>}
        </button>
      ))}
    </div>
  );

  const renderQuestionsTab = () => {
    const subjects = viewQuestion?.subject ? [viewQuestion.subject] : [];
    const pendingQuestions = questions.filter(q => q.approvalStatus === 'PENDING');
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#7c828a]" style={{ lineHeight: 1.5 }}>Total: {pagination.totalElements} questions</p>
          <button onClick={openCreateQuestionModal} className="inline-flex items-center gap-2 px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
            style={{ height: 44, lineHeight: 1.15 }}>
            <Plus className="w-4 h-4" /> Create Question
          </button>
        </div>

        {!loading && pendingQuestions.length > 0 && (
          <div className="bg-white rounded-[24px] border border-[#dee1e6] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#dee1e6] bg-[#fffbe6] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#f4b000]" />
              <span className="text-sm font-semibold text-[#0a0b0d]">Pending Approval ({pendingQuestions.length})</span>
            </div>
            <ScrollableCard>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f7f7f7]">
                    {['#', 'Question', 'Grade', 'Subject', 'Asked By', 'Approval', 'Asked On', 'Actions'].map(h => (
                      <th key={h} className="px-3 py-3 text-left text-[#0a0b0d] font-semibold whitespace-nowrap text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dee1e6]">
                  {pendingQuestions.map((q, idx) => (
                    <tr key={q.id} className="hover:bg-[#f7f7f7] transition-colors">
                      <td className="px-3 py-3 text-[#7c828a] text-xs">{idx + 1}</td>
                      <td className="px-3 py-3 max-w-[200px]">
                        <div className="font-semibold text-[#0a0b0d] truncate">{q.title}</div>
                        <div className="text-[10px] text-[#a8acb3] truncate" dangerouslySetInnerHTML={{ __html: q.descriptionHtml?.replace(/<[^>]*>/g, '').substring(0, 60) }} />
                      </td>
                      <td className="px-3 py-3 text-[#5b616e] text-xs whitespace-nowrap">{q.grade?.name || 'N/A'}</td>
                      <td className="px-3 py-3 text-[#5b616e] text-xs whitespace-nowrap">{q.subject?.name || q.category?.name || 'General'}</td>
                      <td className="px-3 py-3 text-[#5b616e] text-xs whitespace-nowrap">{q.authorName || 'Student'}</td>
                      <td className="px-3 py-3">{getBadge(q.approvalStatus, APPROVAL_STATUS_CONFIG)}</td>
                      <td className="px-3 py-3 text-[#7c828a] text-xs whitespace-nowrap">{formatDate(q.createdAt)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleQuestionApproval(q.id, 'APPROVED')} disabled={actionLoading === q.id} className="p-1.5 text-[#05b169] hover:bg-[#f7f7f7] rounded-[8px] transition disabled:opacity-40" title="Approve">
                            {actionLoading === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          </button>
                          <button onClick={() => handleQuestionApproval(q.id, 'REJECTED')} disabled={actionLoading === q.id} className="p-1.5 text-[#cf202f] hover:bg-[#f7f7f7] rounded-[8px] transition disabled:opacity-40" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => setViewQuestion(q)} className="p-1.5 text-[#0052ff] hover:bg-[#f7f7f7] rounded-[8px] transition" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollableCard>
          </div>
        )}

        <div className="bg-white rounded-[24px] border border-[#dee1e6] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#dee1e6] bg-[#f7f7f7] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#5b616e]" />
            <span className="text-sm font-semibold text-[#0a0b0d]">All Questions ({questions.length})</span>
          </div>
          <ScrollableCard>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#f7f7f7]">
                  {['#', 'Question', 'Grade', 'Subject', 'Asked By', 'Type', 'Status', 'Approval', 'Answers', 'Views', 'Asked On', 'Actions'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-[#0a0b0d] font-semibold whitespace-nowrap text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dee1e6]">
                {loading ? (
                  <tr><td colSpan="12" className="text-center py-12 text-[#a8acb3]">Loading questions...</td></tr>
                ) : questions.length === 0 ? (
                  <tr><td colSpan="12" className="text-center py-12 text-[#a8acb3]">No questions found.</td></tr>
                ) : questions.map((q, idx) => (
                  <tr key={q.id} className="hover:bg-[#f7f7f7] transition-colors">
                    <td className="px-3 py-3 text-[#7c828a] text-xs">{pagination.page * pagination.size + idx + 1}</td>
                    <td className="px-3 py-3 max-w-[200px]">
                      <div className="font-semibold text-[#0a0b0d] truncate">{q.title}</div>
                      <div className="text-[10px] text-[#a8acb3] truncate" dangerouslySetInnerHTML={{ __html: q.descriptionHtml?.replace(/<[^>]*>/g, '').substring(0, 60) }} />
                    </td>
                    <td className="px-3 py-3 text-[#5b616e] text-xs whitespace-nowrap">{q.grade?.name || 'N/A'}</td>
                    <td className="px-3 py-3 text-[#5b616e] text-xs whitespace-nowrap">{q.subject?.name || q.category?.name || 'General'}</td>
                    <td className="px-3 py-3 text-[#5b616e] text-xs whitespace-nowrap">{q.authorName || 'Student'}</td>
                    <td className="px-3 py-3"><span className="px-3 py-1 rounded-[100px] text-xs font-semibold bg-[#f7f7f7] text-[#0a0b0d]">Doubt</span></td>
                    <td className="px-3 py-3">{getBadge(q.status, STATUS_CONFIG)}</td>
                    <td className="px-3 py-3">{getBadge(q.approvalStatus, APPROVAL_STATUS_CONFIG)}</td>
                    <td className="px-3 py-3 text-center text-[#5b616e] text-xs">{q.answersCount || '-'}</td>
                    <td className="px-3 py-3 text-center text-[#5b616e] text-xs">{q.viewsCount || '-'}</td>
                    <td className="px-3 py-3 text-[#7c828a] text-xs whitespace-nowrap">{formatDate(q.createdAt)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewQuestion(q)} className="p-1.5 text-[#0052ff] hover:bg-[#f7f7f7] rounded-[8px] transition" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEditQuestionModal(q)} className="p-1.5 text-[#0052ff] hover:bg-[#f7f7f7] rounded-[8px] transition" title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="p-1.5 text-[#cf202f] hover:bg-[#f7f7f7] rounded-[8px] transition" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollableCard>
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-100">
              <Pagination currentPage={pagination.page + 1} totalPages={pagination.totalPages} onPageChange={(page) => setPagination(prev => ({ ...prev, page: page - 1 }))} totalItems={pagination.totalElements} itemsPerPage={pagination.size} alwaysShow />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAnswersTab = () => (
    <div className="space-y-4">
      <p className="text-sm text-[#5b616e]">Total: {answersPagination.totalElements} answers</p>
      <div className="bg-white rounded-[24px] border border-[#dee1e6] overflow-hidden">
        <ScrollableCard>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f7f7f7]">
                {['#', 'Answer', 'Question', 'Answered By', 'Status', 'Correct', 'Submitted On', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[#0a0b0d] font-semibold whitespace-nowrap text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dee1e6]">
              {loading ? (
                <tr><td colSpan="8" className="text-center py-12 text-[#a8acb3]">Loading answers...</td></tr>
              ) : answers.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-12 text-[#a8acb3]">No answers found.</td></tr>
              ) : answers.map((a, idx) => (
                <tr key={a.id} className="hover:bg-[#f7f7f7] transition-colors">
                  <td className="px-3 py-3 text-[#7c828a] text-xs">{answersPagination.page * answersPagination.size + idx + 1}</td>
                  <td className="px-3 py-3 max-w-[250px]">
                    <div className="text-xs text-[#5b616e] line-clamp-2" dangerouslySetInnerHTML={{ __html: a.contentHtml }} />
                  </td>
                  <td className="px-3 py-3 text-xs text-[#5b616e] max-w-[150px] truncate">{a.questionTitle || a.questionId}</td>
                  <td className="px-3 py-3 text-xs text-[#5b616e] whitespace-nowrap">{a.authorName || 'Student'}</td>
                  <td className="px-3 py-3">{getBadge(a.status, ANSWER_STATUS_CONFIG)}</td>
                  <td className="px-3 py-3 text-center">{a.correct ? <CheckCircle className="w-4 h-4 text-[#05b169] mx-auto" /> : <span className="text-[#dee1e6]">-</span>}</td>
                  <td className="px-3 py-3 text-xs text-[#5b616e] whitespace-nowrap">{formatDate(a.createdAt)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewAnswer(a)} className="p-1.5 text-[#0052ff] hover:bg-[#f7f7f7] rounded-[8px] transition" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      {!a.correct && a.status === 'APPROVED' && (
                        <button onClick={() => handleMarkCorrect(a.id)} disabled={actionLoading === a.id} className="p-1.5 text-[#05b169] hover:bg-[#f7f7f7] rounded-[8px] transition" title="Mark Correct">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {a.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleApproveAnswer(a.id)} disabled={actionLoading === a.id} className="p-1.5 text-[#05b169] hover:bg-[#f7f7f7] rounded-[8px] transition" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleRejectAnswer(a.id)} disabled={actionLoading === a.id} className="p-1.5 text-[#cf202f] hover:bg-[#f7f7f7] rounded-[8px] transition" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDeleteAnswer(a.id)} disabled={actionLoading === a.id} className="p-1.5 text-[#cf202f] hover:bg-[#f7f7f7] rounded-[8px] transition" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollableCard>
        {answersPagination.totalPages > 1 && (
          <div className="p-4 border-t border-[#dee1e6]">
            <Pagination currentPage={answersPagination.page + 1} totalPages={answersPagination.totalPages} onPageChange={(page) => setAnswersPagination(prev => ({ ...prev, page: page - 1 }))} totalItems={answersPagination.totalElements} itemsPerPage={answersPagination.size} alwaysShow />
          </div>
        )}
      </div>
    </div>
  );

  const renderLeadsTab = () => (
    <div className="space-y-4">
      <p className="text-sm text-[#5b616e]">Total: {leadsPagination.totalElements} leads</p>
      <div className="bg-white rounded-[24px] border border-[#dee1e6] overflow-hidden">
        <ScrollableCard>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f7f7f7]">
                {['#', 'Name', 'Mobile', 'Email', 'Grade', 'Submitted On', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[#0a0b0d] font-semibold whitespace-nowrap text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dee1e6]">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-12 text-[#a8acb3]">Loading leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-12 text-[#a8acb3]">No leads found.</td></tr>
              ) : leads.map((l, idx) => (
                <tr key={l.id || idx} className="hover:bg-[#f7f7f7] transition-colors">
                  <td className="px-3 py-3 text-[#7c828a] text-xs">{leadsPagination.page * leadsPagination.size + idx + 1}</td>
                  <td className="px-3 py-3 font-semibold text-[#0a0b0d] text-sm">{l.name || l.fullName || 'N/A'}</td>
                  <td className="px-3 py-3 text-xs text-[#5b616e] whitespace-nowrap">{l.mobile || l.mobileNumber || 'N/A'}</td>
                  <td className="px-3 py-3 text-xs text-[#5b616e]">{l.email || 'N/A'}</td>
                  <td className="px-3 py-3 text-xs text-[#5b616e]">{l.grade || 'N/A'}</td>
                  <td className="px-3 py-3 text-xs text-[#5b616e] whitespace-nowrap">{formatDate(l.createdAt || l.submittedAt)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewLead(l)} className="p-1.5 text-[#0052ff] hover:bg-[#f7f7f7] rounded-[8px] transition" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollableCard>
        {leadsPagination.totalPages > 1 && (
          <div className="p-4 border-t border-[#dee1e6]">
            <Pagination currentPage={leadsPagination.page + 1} totalPages={leadsPagination.totalPages} onPageChange={(page) => setLeadsPagination(prev => ({ ...prev, page: page - 1 }))} totalItems={leadsPagination.totalElements} itemsPerPage={leadsPagination.size} alwaysShow />
          </div>
        )}
      </div>
    </div>
  );

  const renderViewQuestionModal = () => {
    if (!viewQuestion) return null;
    const q = viewQuestion;
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewQuestion(null)}>
        <div className="bg-white rounded-[24px] w-full max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="bg-white border-b border-[#dee1e6] p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <HelpCircle className="w-5 h-5 text-[#0052ff] shrink-0" />
              <h3 className="text-lg font-semibold text-[#0a0b0d] truncate">View Question</h3>
              <span className="px-3 py-1 rounded-[100px] bg-[#f7f7f7] text-[#5b616e] text-[10px] font-mono font-semibold shrink-0">#{q.id?.substring(0, 8) || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => openEditQuestionModal(q)} className="p-2 text-[#5b616e] hover:text-[#0a0b0d] hover:bg-[#f7f7f7] rounded-[8px] transition" title="Edit">
                <Edit3 className="w-4 h-4" />
              </button>
              {q.status !== 'CLOSED' && q.status !== 'UNDER_REVIEW' && (
                <button onClick={() => handleQuestionStatusChange(q.id, 'UNDER_REVIEW')} disabled={actionLoading === q.id} className="p-2 text-[#f4b000] hover:text-[#0a0b0d] hover:bg-[#f7f7f7] rounded-[8px] transition" title="Mark Under Review">
                  <Clock className="w-4 h-4" />
                </button>
              )}
              {q.status !== 'CLOSED' && (
                <button onClick={() => handleQuestionStatusChange(q.id, 'CLOSED')} disabled={actionLoading === q.id} className="p-2 text-[#5b616e] hover:text-[#0a0b0d] hover:bg-[#f7f7f7] rounded-[8px] transition" title="Close Question">
                  <XCircle className="w-4 h-4" />
                </button>
              )}
              {q.status === 'CLOSED' && (
                <button onClick={() => handleQuestionStatusChange(q.id, 'OPEN_TO_ANSWER')} disabled={actionLoading === q.id} className="p-2 text-[#5b616e] hover:text-[#0a0b0d] hover:bg-[#f7f7f7] rounded-[8px] transition" title="Reopen Question">
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setViewQuestion(null)} className="p-2 text-[#5b616e] hover:text-[#0a0b0d] hover:bg-[#f7f7f7] rounded-[8px] transition ml-2">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h4 className="text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-3">Question Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Asked By', value: q.authorName || 'Student' },
                  { label: 'Asked On', value: formatDateTime(q.createdAt) },
                  { label: 'Type', value: 'Doubt' },
                  { label: 'Grade', value: q.grade?.name || 'N/A' },
                  { label: 'Subject', value: q.subject?.name || q.category?.name || 'General' },
                  { label: 'Status', value: getBadge(q.status, STATUS_CONFIG) }
                ].map((field, i) => (
                  <div key={i} className="bg-[#f7f7f7] rounded-[12px] p-3">
                    <p className="text-[10px] font-semibold text-[#7c828a] uppercase tracking-wider mb-1">{field.label}</p>
                    <p className="text-sm font-semibold text-[#0a0b0d]">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">Question Content</h4>
              <h5 className="text-lg font-semibold text-[#0a0b0d] mb-3">{q.title}</h5>
              <div className="p-4 bg-[#f7f7f7] rounded-[12px] border border-[#dee1e6] text-[#5b616e] leading-relaxed text-sm prose max-w-none" dangerouslySetInnerHTML={{ __html: q.descriptionHtml || '<p class="text-gray-400 italic">No description provided.</p>' }} />
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-3">Attachments</h4>
              {q.attachments && q.attachments.length > 0 ? (
                <div className="space-y-2">
                  {q.attachments.map((att, i) => {
                    const url = typeof att === 'string' ? att : att.url;
                    const fileName = url ? url.split('/').pop() || `Attachment ${i + 1}` : `Attachment ${i + 1}`;
                    const isImage = url ? /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url) : false;
                    return (
                      <div key={i} className="flex items-center gap-4 p-4 bg-[#f7f7f7] rounded-[12px] border border-[#dee1e6]">
                        {isImage ? (
                          <button onClick={() => openPreview(url)} className="shrink-0">
                            <img src={url} alt={fileName} className="w-10 h-10 rounded-[8px] object-cover border border-[#dee1e6] cursor-pointer hover:opacity-80 transition-opacity" />
                          </button>
                        ) : (
                          <FileText className="w-8 h-8 text-[#0052ff]" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0a0b0d] truncate">{fileName}</p>
                          <p className="text-xs text-[#7c828a]">{url ? url.split('.').pop()?.toUpperCase() || '' : ''}</p>
                        </div>
                        {url && (
                          <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 text-[#0052ff] hover:bg-[#f7f7f7] rounded-[8px] transition" title="Download">
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-[#f7f7f7] rounded-[12px] border border-[#dee1e6]">
                  <FileText className="w-8 h-8 text-[#a8acb3]" />
                  <p className="text-sm text-[#7c828a]">No attachments</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-[#7c828a] uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Answers ({q.answersCount || questionAnswers.length})
                </h4>
                <button onClick={() => { setViewQuestion(null); handleTabChange('answers'); }}
                  className="text-xs font-semibold text-[#0052ff] hover:underline">View All →</button>
              </div>
              {questionAnswersLoading ? (
                <div className="flex items-center justify-center py-8 text-[#7c828a]">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading answers...
                </div>
              ) : questionAnswers.length === 0 ? (
                <div className="p-4 bg-[#f7f7f7] rounded-[12px] border border-[#dee1e6] text-sm text-[#7c828a] text-center">
                  No answers yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {questionAnswers.map(a => (
                    <div key={a.id} className="p-4 bg-[#f7f7f7] rounded-[12px] border border-[#dee1e6]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs text-[#7c828a]">
                          <span className="font-semibold text-[#0a0b0d]">{a.authorName || 'Student'}</span>
                          <span>{formatDateTime(a.createdAt)}</span>
                          {getBadge(a.status, ANSWER_STATUS_CONFIG)}
                          {a.correct && (
                            <span className="px-2 py-0.5 rounded-[100px] bg-[#05b169]/10 text-[#05b169] text-[10px] font-semibold">Correct</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {a.status === 'PENDING' && (
                            <>
                              <button onClick={() => handleApproveAnswer(a.id)} disabled={actionLoading === a.id}
                                className="p-1.5 text-[#05b169] hover:bg-white rounded-[8px] transition" title="Approve">
                                {actionLoading === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                              </button>
                              <button onClick={() => handleRejectAnswer(a.id)} disabled={actionLoading === a.id}
                                className="p-1.5 text-[#cf202f] hover:bg-white rounded-[8px] transition" title="Reject">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => setViewAnswer(a)}
                            className="p-1.5 text-[#0052ff] hover:bg-white rounded-[8px] transition" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="prose max-w-none text-sm text-[#5b616e] leading-relaxed line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: a.contentHtml || '' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <details className="bg-[#f7f7f7] rounded-[12px] border border-[#dee1e6]">
              <summary className="px-4 py-3 text-sm font-semibold text-[#0a0b0d] cursor-pointer hover:bg-white rounded-[12px] transition flex items-center gap-2">
                <Clock className="w-4 h-4" /> Activity Log
              </summary>
              <div className="px-4 pb-4 pt-2 space-y-2">
                <div className="text-xs text-[#7c828a] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0052ff]" />
                  Created on {formatDateTime(q.createdAt)}
                </div>
                {q.updatedAt && q.updatedAt !== q.createdAt && (
                  <div className="text-xs text-[#7c828a] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#f4b000]" />
                    Last updated on {formatDateTime(q.updatedAt)}
                  </div>
                )}
              </div>
            </details>

            {q.status !== 'CLOSED' && (
              <div className="border-t border-[#dee1e6] pt-4">
                <h4 className="text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" /> Admin Answer
                </h4>
                <div className="mb-3">
                  <ContentEditor initialContent={adminAnswerContent} onChange={(val) => setAdminAnswerContent(val)} />
                </div>
                <div className="flex justify-end">
                  <button onClick={() => handleSubmitAdminAnswer(q.id)} disabled={adminAnswerLoading || !adminAnswerContent || !adminAnswerContent.replace(/<[^>]*>/g, '').trim()}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition disabled:opacity-50"
                    style={{ height: 44, lineHeight: 1.15 }}>
                    {adminAnswerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                    Submit Answer
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#dee1e6] bg-[#f7f7f7] flex justify-end gap-3 shrink-0">
            <button onClick={() => setViewQuestion(null)} className="px-5 py-3 border border-[#dee1e6] text-[#0a0b0d] text-sm font-semibold rounded-[100px] hover:bg-white transition"
              style={{ height: 44, lineHeight: 1.15 }}>
              Cancel
            </button>
            <button onClick={() => setViewQuestion(null)} className="px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
              style={{ height: 44, lineHeight: 1.15 }}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderViewAnswerModal = () => {
    if (!viewAnswer) return null;
    const a = viewAnswer;
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewAnswer(null)}>
        <div className="bg-white rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="bg-white border-b border-[#dee1e6] p-5 flex items-center justify-between shrink-0">
            <h3 className="text-lg font-semibold text-[#0a0b0d]">Answer Details</h3>
            <button onClick={() => setViewAnswer(null)} className="text-[#5b616e] hover:text-[#0a0b0d]"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f7f7f7] rounded-[12px] p-3">
                <p className="text-[10px] font-semibold text-[#7c828a] uppercase">Answer ID</p>
                <p className="text-sm font-mono font-semibold text-[#0a0b0d] break-all">{a.id || 'N/A'}</p>
              </div>
              <div className="bg-[#f7f7f7] rounded-[12px] p-3">
                <p className="text-[10px] font-semibold text-[#7c828a] uppercase">Question ID</p>
                <p className="text-sm font-mono font-semibold text-[#0a0b0d] break-all">{a.questionId || 'N/A'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f7f7f7] rounded-[12px] p-3">
                <p className="text-[10px] font-semibold text-[#7c828a] uppercase">Answered By</p>
                <p className="text-sm font-semibold text-[#0a0b0d]">{a.authorName || 'Student'}</p>
              </div>
              <div className="bg-[#f7f7f7] rounded-[12px] p-3">
                <p className="text-[10px] font-semibold text-[#7c828a] uppercase">Submitted On</p>
                <p className="text-sm font-semibold text-[#0a0b0d]">{formatDateTime(a.createdAt)}</p>
              </div>
              <div className="bg-[#f7f7f7] rounded-[12px] p-3">
                <p className="text-[10px] font-semibold text-[#7c828a] uppercase">Updated On</p>
                <p className="text-sm font-semibold text-[#0a0b0d]">{formatDateTime(a.updatedAt)}</p>
              </div>
              <div className="bg-[#f7f7f7] rounded-[12px] p-3">
                <p className="text-[10px] font-semibold text-[#7c828a] uppercase">Status</p>
                <div>{getBadge(a.status, ANSWER_STATUS_CONFIG)}</div>
              </div>
              <div className="bg-[#f7f7f7] rounded-[12px] p-3">
                <p className="text-[10px] font-semibold text-[#7c828a] uppercase">Correct</p>
                <p className="text-sm font-semibold text-[#0a0b0d]">{a.correct ? 'Yes' : 'No'}</p>
              </div>
              {a.rejectionReason && (
                <div className="bg-[#f7f7f7] rounded-[12px] p-3">
                  <p className="text-[10px] font-semibold text-[#7c828a] uppercase">Rejection Reason</p>
                  <p className="text-sm font-semibold text-[#cf202f]">{a.rejectionReason}</p>
                </div>
              )}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">Answer Content</h4>
              <div className="p-4 bg-[#f7f7f7] rounded-[12px] border border-[#dee1e6] text-[#5b616e] leading-relaxed text-sm prose max-w-none" dangerouslySetInnerHTML={{ __html: a.contentHtml || '<p class="text-gray-400 italic">No content.</p>' }} />
            </div>
          </div>
          <div className="p-4 border-t border-[#dee1e6] bg-[#f7f7f7] flex justify-end gap-3 shrink-0">
            {a.status === 'PENDING' && (
              <>
                <button onClick={() => handleRejectAnswer(a.id)} className="px-5 py-3 bg-[#cf202f] text-white text-sm font-semibold rounded-[100px] hover:bg-[#a81925] transition"
                  style={{ height: 44, lineHeight: 1.15 }}>Reject</button>
                <button onClick={() => handleApproveAnswer(a.id)} className="px-5 py-3 bg-[#05b169] text-white text-sm font-semibold rounded-[100px] hover:bg-[#048c55] transition"
                  style={{ height: 44, lineHeight: 1.15 }}>Approve</button>
              </>
            )}
            {!a.correct && a.status === 'APPROVED' && (
              <button onClick={() => handleMarkCorrect(a.id)} className="px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
                style={{ height: 44, lineHeight: 1.15 }}>Mark Correct</button>
            )}
            <button onClick={() => setViewAnswer(null)} className="px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
              style={{ height: 44, lineHeight: 1.15 }}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  const renderViewLeadModal = () => {
    if (!viewLead) return null;
    const l = viewLead;
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewLead(null)}>
        <div className="bg-white rounded-[24px] w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="bg-white border-b border-[#dee1e6] p-5 flex items-center justify-between shrink-0">
            <h3 className="text-lg font-semibold text-[#0a0b0d]">Lead Details</h3>
            <button onClick={() => setViewLead(null)} className="text-[#5b616e] hover:text-[#0a0b0d]"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Name', value: l.name || l.fullName || 'N/A' },
                { label: 'Mobile', value: l.mobile || l.mobileNumber || 'N/A' },
                { label: 'Email', value: l.email || 'N/A' },
                { label: 'Grade', value: l.grade || 'N/A' },
                { label: 'Email Verified', value: l.emailVerifiedAt ? formatDateTime(l.emailVerifiedAt) : 'No' },
                { label: 'Submitted On', value: formatDateTime(l.createdAt || l.submittedAt) }
              ].map((field, i) => (
                <div key={i} className="bg-[#f7f7f7] rounded-[12px] p-3">
                  <p className="text-[10px] font-semibold text-[#7c828a] uppercase">{field.label}</p>
                  <p className="text-sm font-semibold text-[#0a0b0d]">{field.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t border-[#dee1e6] bg-[#f7f7f7] flex justify-end gap-3 shrink-0">
            <button onClick={() => setViewLead(null)} className="px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
              style={{ height: 44, lineHeight: 1.15 }}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  const renderCreateEditQuestionModal = () => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { setShowQuestionModal(false); setEditQuestionId(null); }}>
      <div className="bg-white rounded-[24px] w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="bg-white border-b border-[#dee1e6] p-5 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-semibold text-[#0a0b0d]">{editQuestionId ? 'Edit Question' : 'Create Question'}</h3>
          <button onClick={() => { setShowQuestionModal(false); setEditQuestionId(null); }} className="text-[#5b616e] hover:text-[#0a0b0d]"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleQuestionFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-1.5">Grade <span className="text-[#cf202f]">*</span></label>
              <select value={questionForm.gradeId} onChange={(e) => setQuestionForm(f => ({ ...f, gradeId: e.target.value, subjectId: '' }))} className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                style={{ height: 48, lineHeight: 1.2 }}>
                <option value="">Select Grade</option>
                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-1.5">Subject <span className="text-[#cf202f]">*</span></label>
              <select value={questionForm.subjectId} onChange={(e) => setQuestionForm(f => ({ ...f, subjectId: e.target.value }))} className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                style={{ height: 48, lineHeight: 1.2 }}>
                <option value="">Select Subject</option>
                {subjects.filter(s => {
                  if (!questionForm.gradeId) return true;
                  const g = grades.find(gr => gr.id === questionForm.gradeId);
                  if (!g) return true;
                  const names = GRADE_SUBJECT_MAP[g.name];
                  return names ? names.includes(s.name) : true;
                }).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-1.5">Title <span className="text-[#cf202f]">*</span></label>
            <input value={questionForm.title} onChange={(e) => setQuestionForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter question title" className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
              style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }} />
          </div>
          <ContentEditor initialContent={questionForm.descriptionHtml} onChange={(val) => setQuestionForm(f => ({ ...f, descriptionHtml: val }))} />
          <div>
            <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-1.5">Attachments</label>
            <div className="space-y-2">
              {questionForm.attachments && questionForm.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {questionForm.attachments.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[#f7f7f7] rounded-[8px] border border-[#dee1e6] text-xs">
                      {/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i.test(url) ? (
                        <Image className="w-3.5 h-3.5 text-[#0052ff] shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-[#0052ff] shrink-0" />
                      )}
                      <span className="text-[#0a0b0d] truncate max-w-[120px]">{url.split('/').pop() || `file ${i + 1}`}</span>
                      <button type="button" onClick={() => removeQuestionAttachment(i)} className="text-[#cf202f] hover:text-[#a81925] p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-2 px-4 py-3 border border-dashed border-[#dee1e6] rounded-[12px] cursor-pointer hover:bg-[#f7f7f7] transition text-sm text-[#5b616e]">
                <Upload className="w-4 h-4" />
                <span>Upload file</span>
                <input type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) { handleQuestionAttachmentUpload(f); } e.target.value = ''; }} />
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowQuestionModal(false); setEditQuestionId(null); }} className="px-5 py-3 border border-[#dee1e6] text-[#0a0b0d] text-sm font-semibold rounded-[100px] hover:bg-white transition"
              style={{ height: 44, lineHeight: 1.15 }}>Cancel</button>
            <button type="submit" disabled={questionFormLoading} className="px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition disabled:opacity-50"
              style={{ height: 44, lineHeight: 1.15 }}>
              {questionFormLoading ? 'Saving...' : editQuestionId ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderPreviewModal = () => {
    if (!previewUrl) return null;
    return (
      <div
        ref={previewRef}
        className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center select-none"
        onMouseMove={handlePreviewMouseMove}
        onMouseUp={handlePreviewMouseUp}
        onMouseLeave={handlePreviewMouseUp}
        onClick={closePreview}
      >
        {/* Toolbar */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10" onClick={e => e.stopPropagation()}>
          <span className="text-white/70 text-xs font-mono mr-2">{Math.round(previewZoom * 100)}%</span>
          <button onClick={() => setPreviewZoom(z => Math.max(0.5, z - 0.25))} className="p-2 bg-white/10 hover:bg-white/20 rounded-[8px] transition text-white" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button onClick={() => setPreviewZoom(z => Math.min(5, z + 0.25))} className="p-2 bg-white/10 hover:bg-white/20 rounded-[8px] transition text-white" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={() => setPreviewRotation(r => (r + 90) % 360)} className="p-2 bg-white/10 hover:bg-white/20 rounded-[8px] transition text-white" title="Rotate">
            <RotateCw className="w-4 h-4" />
          </button>
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" download className="p-2 bg-white/10 hover:bg-white/20 rounded-[8px] transition text-white" title="Download" onClick={e => e.stopPropagation()}>
            <Download className="w-4 h-4" />
          </a>
          <button onClick={closePreview} className="p-2 bg-white/10 hover:bg-white/20 rounded-[8px] transition text-white ml-2" title="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <div
          className="max-w-[90vw] max-h-[90vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
          onMouseDown={handlePreviewMouseDown}
          style={{ cursor: previewZoom > 1 ? 'grab' : 'default' }}
        >
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-full transition-transform duration-200"
            style={{
              transform: `scale(${previewZoom}) rotate(${previewRotation}deg) translate(${previewPos.x}px, ${previewPos.y}px)`,
            }}
            draggable={false}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#0a0b0d]">Q&A Management</h2>
        <p className="text-[#5b616e] text-sm mt-1">Manage questions, answers, and leads</p>
      </div>
      {renderStatsRow()}
      {renderFilterBar()}
      {renderTabs()}
      {activeTab === 'questions' && renderQuestionsTab()}
      {activeTab === 'answers' && renderAnswersTab()}
      {activeTab === 'leads' && renderLeadsTab()}
      {viewQuestion && renderViewQuestionModal()}
      {viewAnswer && renderViewAnswerModal()}
      {viewLead && renderViewLeadModal()}
      {showQuestionModal && renderCreateEditQuestionModal()}
      {renderPreviewModal()}
    </div>
  );
}
