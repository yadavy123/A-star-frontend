import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { askApi, type AskPageResponse, type BackendGrade, type BackendSubject } from '../api/askApi';
import { ApiError } from '../api/runtimeApiBase';
import { ContentEditor } from '../components/editor/ContentEditor';
import AskQuestionForm from '../components/AskQuestionFormNew';
import LeadForm from '../components/LeadForm';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import katex from 'katex';
import 'katex/dist/katex.min.css';

type Question = {
    id: string;
    title: string;
    slug: string;
    descriptionHtml: string;
    grade?: BackendGrade | null;
    subject?: BackendSubject | null;
    status?: string;
    approvalStatus?: string;
    viewsCount: number;
    answersCount: number;
    createdAt: string;
    attachments?: string[];
};

type Answer = {
    id: string;
    contentHtml: string;
    authorName: string;
    createdAt: string;
    status: string;
};

type SortOption = 'latest' | 'oldest' | 'most-viewed' | 'most-answered' | 'subject' | 'grade';
type StatusFilter = 'all' | 'open' | 'answered' | 'closed';

const PAGE_SIZE = 10;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    'OPEN_TO_ANSWER': { label: 'Open to Answer', color: 'bg-[#eef0f3] text-[#0a0b0d]' },
    'ANSWERED': { label: 'Answered', color: 'bg-[#eef0f3] text-[#05b169]' },
    'CLOSED': { label: 'Closed', color: 'bg-[#eef0f3] text-[#5b616e]' },
    'PENDING': { label: 'Under Review', color: 'bg-[#eef0f3] text-[#f4b000]' },
};

const renderMathInHTML = (html: string): string => {
    if (!html) return '';
    let result = html;
    result = result.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
        try {
            return `<div class="math-block py-4 overflow-x-auto">${katex.renderToString(formula.trim(), { throwOnError: false, displayMode: true })}</div>`;
        } catch { return match; }
    });
    result = result.replace(/\$([^$]+)\$/g, (match, formula) => {
        try {
            return `<span class="math-inline px-1">${katex.renderToString(formula.trim(), { throwOnError: false, displayMode: false })}</span>`;
        } catch { return match; }
    });
    return result;
};

const Ask: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [answersMap, setAnswersMap] = useState<Record<string, Answer[]>>({});
    const [answerTextMap, setAnswerTextMap] = useState<Record<string, string>>({});
    const [answerLoading, setAnswerLoading] = useState(false);
    const [answerLoaders, setAnswerLoaders] = useState<Record<string, boolean>>({});

    const [searchQuery, setSearchQuery] = useState('');
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [sortBy, setSortBy] = useState<SortOption>('latest');
    const [showLeadForm, setShowLeadForm] = useState(false);

    const { isAuthenticated, user } = useAuth();
    const answersFetchedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        fetchQuestions(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keyword, statusFilter, sortBy]);

    useEffect(() => {
        try {
            const saved = sessionStorage.getItem('astar_pending_answer');
            if (saved) {
                const data = JSON.parse(saved);
                sessionStorage.removeItem('astar_pending_answer');
                if (data.questionId && data.contentHtml) {
                    setExpandedId(data.questionId);
                    setAnswerTextMap(prev => ({ ...prev, [data.questionId]: data.contentHtml }));
                    toast.success('Answer text restored. Please review and submit.');
                }
            }
        } catch { /* ignore */ }
    }, []);

    const handleLoginForAnswer = (qId: string, contentHtml: string) => {
        if (contentHtml?.trim()) {
            try {
                sessionStorage.setItem('astar_pending_answer', JSON.stringify({
                    questionId: qId,
                    contentHtml: contentHtml.trim(),
                }));
            } catch { /* ignore */ }
        }
    };

    const fetchQuestions = async (page: number) => {
        setLoading(true);
        setExpandedId(null);
        try {
            const params: Record<string, string | number | boolean | null> = {
                page, size: PAGE_SIZE,
            };

            switch (sortBy) {
                case 'latest': params.sort = 'createdAt'; params.direction = 'desc'; break;
                case 'oldest': params.sort = 'createdAt'; params.direction = 'asc'; break;
                case 'most-viewed': params.sort = 'viewsCount'; params.direction = 'desc'; break;
                case 'most-answered': params.sort = 'answersCount'; params.direction = 'desc'; break;
                case 'subject': params.sort = 'subjectId'; params.direction = 'asc'; break;
                case 'grade': params.sort = 'gradeId'; params.direction = 'asc'; break;
            }

            if (keyword.trim()) params.keyword = keyword.trim();

            const qsRes = await askApi.getAll(params);
            const pageData = qsRes.data as AskPageResponse;
            setQuestions(pageData?.content || []);
            setTotalPages(pageData?.totalPages ?? 0);
            setCurrentPage(pageData?.number ?? 0);
        } catch {
            toast.error('Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setKeyword(searchQuery);
    };

    const fetchAnswers = async (questionId: string) => {
        if (answersFetchedRef.current.has(questionId)) return;
        answersFetchedRef.current.add(questionId);
        setAnswerLoaders(prev => ({ ...prev, [questionId]: true }));
        try {
            const res = await askApi.getAnswers(questionId);
            setAnswersMap(prev => ({ ...prev, [questionId]: Array.isArray(res.data) ? res.data : [] }));
        } catch {
            setAnswersMap(prev => ({ ...prev, [questionId]: [] }));
        } finally {
            setAnswerLoaders(prev => ({ ...prev, [questionId]: false }));
        }
    };

    const handleToggleExpand = (qId: string) => {
        if (expandedId === qId) {
            setExpandedId(null);
            return;
        }
        setExpandedId(qId);
        fetchAnswers(qId);
    };

    const handleSubmitAnswer = async (qId: string) => {
        const text = answerTextMap[qId]?.trim();
        if (!text) {
            toast.error('Please write your answer');
            return;
        }
        setAnswerLoading(true);
        try {
            await askApi.submitAnswer({ questionId: qId, contentHtml: text });
            toast.success('Answer submitted for review!');
            setAnswerTextMap(prev => { const next = { ...prev }; delete next[qId]; return next; });
            setAnswersMap(prev => { const next = { ...prev }; delete next[qId]; return next; });
            fetchAnswers(qId);
        } catch (error) {
            let errMsg = 'Failed to submit answer';
            if (error instanceof ApiError) {
                errMsg = (error.response?.data as { message?: string })?.message || error.message;
                if (errMsg.toLowerCase().includes('free quota')) {
                    const q = questions.find(q => q.id === qId);
                    const name = user?.name || user?.email?.split('@')[0] || 'Guest';
                    const email = user?.email || 'N/A';
                    const title = q?.title || qId;
                    const msg = 'Hello Astar Classes, I have a doubt regarding a question I am working on. Could you please help me with it?';
                    setShowLeadForm(true);
                    window.open(`https://wa.me/918073982848?text=${encodeURIComponent(msg)}`, '_blank');
                    return;
                }
            } else if (error instanceof Error) {
                errMsg = error.message;
            }
            toast.error(errMsg);
        } finally {
            setAnswerLoading(false);
        }
    };

    const getQuestionStatusKey = (q: Question): string => {
        if (q.status === 'ANSWERED') return 'ANSWERED';
        if (q.status === 'CLOSED') return 'CLOSED';
        if (q.approvalStatus === 'PENDING') return 'PENDING';
        if (q.answersCount > 0) return 'ANSWERED';
        return 'OPEN_TO_ANSWER';
    };

    const filteredQuestions = questions.filter(qs => {
        if (statusFilter === 'all') return true;
        const st = getQuestionStatusKey(qs);
        if (statusFilter === 'open') return st === 'OPEN_TO_ANSWER';
        if (statusFilter === 'answered') return st === 'ANSWERED';
        if (statusFilter === 'closed') return st === 'CLOSED';
        return true;
    });

    const sortOptions: { value: SortOption; label: string }[] = [
        { value: 'latest', label: 'Latest' },
        { value: 'oldest', label: 'Oldest' },
        { value: 'most-viewed', label: 'Most Viewed' },
        { value: 'most-answered', label: 'Most Answered' },
        { value: 'subject', label: 'Subject' },
        { value: 'grade', label: 'Grade' },
    ];

    const statusOptions: { value: StatusFilter; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'open', label: 'Open to Answer' },
        { value: 'answered', label: 'Answered' },
        { value: 'closed', label: 'Closed' },
    ];

    const QuestionSkeleton = () => (
        <div className="animate-pulse space-y-4 p-[24px] bg-white rounded-[24px] border border-[#dee1e6]">
            <div className="h-5 bg-[#eef0f3] rounded w-3/4" />
            <div className="h-3 bg-[#eef0f3] rounded w-1/4" />
            <div className="h-3 bg-[#f7f7f7] rounded w-full" />
            <div className="h-3 bg-[#f7f7f7] rounded w-2/3" />
        </div>
    );

    return (
        <div className="min-h-screen bg-white py-[48px] md:py-[96px]">
            <style>{`
                .math-block { display: block; text-align: center; margin: 1.5em 0; overflow-x: auto; padding: 1rem; background: #f7f7f7; border-radius: 12px; }
                .math-inline { display: inline; padding: 0 4px; color: #0052ff; font-weight: 500; }
                .katex { font-size: 1.1em; }
                .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>

            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-[48px]">
                    <h1 className="text-[44px] font-normal text-[#0a0b0d] mb-2" style={{ lineHeight: 1.09, letterSpacing: '-1px' }}>Ask</h1>
                    <p className="text-[16px] text-[#5b616e]" style={{ lineHeight: 1.5 }}>Ask your academic questions and get answers from our experts and community.</p>
                </div>

                <div className="lg:hidden mb-6">
                    <AskQuestionForm
                        user={user}
                        onSuccess={() => fetchQuestions(0)}
                        onLeadRequired={() => setShowLeadForm(true)}
                    />
                </div>

                {showLeadForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                        <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto" style={{ marginTop: '20px' }}>
                            <LeadForm onSuccess={() => {
                                setShowLeadForm(false);
                                fetchQuestions(0);
                            }} />
                        </div>
                        <button onClick={() => setShowLeadForm(false)}
                            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl">&times;</button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
                    <div className="hidden lg:block lg:col-span-2">
                        <AskQuestionForm
                            user={user}
                            onSuccess={() => fetchQuestions(0)}
                            onLeadRequired={() => setShowLeadForm(true)}
                        />
                    </div>

                    <div className="col-span-1 lg:col-span-2">
                        <div className="mb-6">
                            <h2 className="text-[32px] font-normal text-[#0a0b0d] mb-[24px]" style={{ lineHeight: 1.13, letterSpacing: '-0.4px' }}>Browse Questions</h2>

                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="What do you want to know?"
                                        className="w-full rounded-[12px] border border-[#dee1e6] px-[16px] py-[14px] pr-10 text-[16px] text-[#0a0b0d] placeholder-[#a8acb3] bg-white focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10 outline-none transition-all"
                                        style={{ height: 48, lineHeight: 1.5 }}
                                    />
                                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#a8acb3] hover:text-[#0052ff]">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </form>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                                <div className="flex items-center gap-2">
                                    <svg className="h-5 w-5 text-[#a8acb3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h6M3 12h6m-6 5h6m5-10l4 4-4 4m-1-8l-4 4 4 4" />
                                    </svg>
                                    <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}
                                        className="rounded-[12px] border border-[#dee1e6] px-[16px] py-[14px] text-[16px] text-[#0a0b0d] bg-white focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10 outline-none transition-all"
                                        style={{ height: 44 }}>
                                        {sortOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-2 flex-wrap mb-4">
                                {statusOptions.map(opt => (
                                    <button key={opt.value}
                                        onClick={() => setStatusFilter(opt.value)}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-[100px] transition-all ${statusFilter === opt.value
                                            ? 'bg-[#0052ff] text-white'
                                            : 'bg-[#eef0f3] text-[#0a0b0d] hover:bg-[#dee1e6]'
                                            }`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <QuestionSkeleton key={i} />)}
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <div className="bg-[#f7f7f7] rounded-[24px] border-2 border-dashed border-[#dee1e6] p-12 text-center">
                                <div className="p-4 bg-white rounded-full inline-flex mb-4">
                                    <svg className="h-8 w-8 text-[#a8acb3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-[#0a0b0d] mb-2">No questions found</h3>
                                <p className="text-[#5b616e] text-sm" style={{ lineHeight: 1.5 }}>No questions match your criteria. Try adjusting the filters or ask a new question.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredQuestions.map((q) => {
                                    const isExpanded = expandedId === q.id;
                                    const statusKey = getQuestionStatusKey(q);
                                    const statusInfo = STATUS_LABELS[statusKey] || STATUS_LABELS.OPEN_TO_ANSWER;
                                    const existingAnswers = answersMap[q.id];
                                    const ansLoading = answerLoaders[q.id];

                                    return (
                                        <div key={q.id} className="bg-white rounded-[24px] border border-[#dee1e6] overflow-hidden">
                                            <div className="p-[24px] cursor-pointer" onClick={() => handleToggleExpand(q.id)}>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                                            {q.subject && (
                                                                <span className="inline-block px-2 py-1 bg-[#f7f7f7] text-[#0a0b0d] text-xs font-semibold rounded-[100px]">
                                                                    {q.subject.name}
                                                                </span>
                                                            )}
                                                            {q.grade && (
                                                                <span className="inline-block px-2 py-1 bg-[#f7f7f7] text-[#0a0b0d] text-xs font-semibold rounded-[100px]">
                                                                    {q.grade.name}
                                                                </span>
                                                            )}
                                                            <span className={`inline-block px-[12px] py-[4px] text-[12px] font-semibold rounded-[100px] ${statusInfo.color}`}>
                                                                {statusInfo.label}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-[16px] font-semibold text-[#0a0b0d] mb-2" style={{ lineHeight: 1.25 }}>
                                                            {q.title || 'Untitled Question'}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#7c828a]" style={{ lineHeight: 1.5 }}>
                                                            <span>Asked by {isAuthenticated ? 'Student' : 'Visitor'}</span>
                                                            <span>•</span>
                                                            <span>{new Date(q.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                            {q.answersCount > 0 && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-[#0052ff] font-semibold">{q.answersCount} answer{q.answersCount > 1 ? 's' : ''}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {q.answersCount > 0 && (
                                                        <div className="text-right flex-shrink-0">
                                                            <div className="text-lg font-semibold text-[#0a0b0d]">{q.answersCount}</div>
                                                            <div className="text-[14px] text-[#7c828a]" style={{ lineHeight: 1.5 }}>Answer{q.answersCount > 1 ? 's' : ''}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="border-t border-[#dee1e6] bg-[#f7f7f7]">
                                                    {q.attachments && q.attachments.length > 0 && (
                                                        <div className="px-[24px] pt-[16px] flex flex-wrap gap-2">
                                                            {q.attachments.map((url, i) => (
                                                                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#dee1e6] rounded-[12px] text-xs font-medium text-[#5b616e] hover:border-[#0052ff] hover:text-[#0052ff] transition-all">
                                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                    </svg>
                                                                    Attachment {i + 1}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {ansLoading ? (
                                                        <div className="p-[24px] flex justify-center">
                                                            <svg className="animate-spin h-5 w-5 text-[#0052ff]" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                            </svg>
                                                        </div>
                                                    ) : existingAnswers && existingAnswers.length > 0 ? (
                                                        <div className="divide-y divide-[#dee1e6]">
                                                            {existingAnswers.map((a) => (
                                                                <div key={a.id} className="p-[24px]">
                                                                    <div className="flex items-start gap-3 mb-3">
                                                                        <div className="h-8 w-8 rounded-full bg-[#0052ff] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">S</div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-sm font-semibold text-[#0a0b0d]">{a.authorName || 'Student'}</span>
                                                                                {a.status === 'APPROVED' && (
                                                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#05b169]">
                                                                                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                        Accepted Answer
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-xs text-[#7c828a] mt-1" style={{ lineHeight: 1.5 }}>{new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-sm text-[#5b616e] prose prose-sm max-w-none" style={{ lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: renderMathInHTML(a.contentHtml) }} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-[24px] text-center">
                                                            <p className="text-sm text-[#7c828a]" style={{ lineHeight: 1.5 }}>No answers yet. Be the first to respond!</p>
                                                        </div>
                                                    )}

                                                    {q.status !== 'CLOSED' && (
                                                        <div className="border-t border-[#dee1e6] p-[24px]">
                                                            {isAuthenticated ? (
                                                                <div className="space-y-3">
                                                                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Post Your Answer</h4>
                                                                    <ContentEditor initialContent={answerTextMap[q.id] || ''} onChange={(val) => setAnswerTextMap(prev => ({ ...prev, [q.id]: val }))} size="small" />
                                                                    <button onClick={() => handleSubmitAnswer(q.id)} disabled={answerLoading}
                                                                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl">
                                                                        {answerLoading ? 'Posting...' : 'Post'}
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-sm">
                                                                    <div className="mb-4">
                                                                        <ContentEditor initialContent={answerTextMap[q.id] || ''} onChange={(val) => setAnswerTextMap(prev => ({ ...prev, [q.id]: val }))} size="small" />
                                                                    </div>
                                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                                        <Link to="/login?redirect=%2Fask" onClick={() => handleLoginForAnswer(q.id, answerTextMap[q.id])}
                                                                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                                                                            Log in to Post Answer
                                                                        </Link>
                                                                        <p className="text-sm text-slate-600 font-medium">Write your answer above, then log in to submit.</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {q.status === 'CLOSED' && (
                                                        <div className="border-t border-[#dee1e6] p-6 bg-slate-50 text-center">
                                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-600 rounded-full font-bold text-sm">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                </svg>
                                                                This question is closed for new answers
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-6">
                                        <button onClick={() => fetchQuestions(currentPage - 1)} disabled={currentPage === 0}
                                            className="inline-flex items-center gap-1 px-5 py-3 text-sm font-semibold rounded-[100px] bg-white border border-[#dee1e6] text-[#0a0b0d] hover:bg-[#f7f7f7] disabled:opacity-30 disabled:cursor-not-allowed"
                                            style={{ height: 44, lineHeight: 1.15 }}>
                                            Previous
                                        </button>
                                        {(() => {
                                            const pages: number[] = [];
                                            if (totalPages <= 5) { for (let i = 0; i < totalPages; i++) pages.push(i); }
                                            else if (currentPage < 3) { for (let i = 0; i < 5; i++) pages.push(i); }
                                            else if (currentPage > totalPages - 4) { for (let i = totalPages - 5; i < totalPages; i++) pages.push(i); }
                                            else { for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i); }
                                            return pages;
                                        })().map(pageNum => (
                                            <button key={pageNum} onClick={() => fetchQuestions(pageNum)}
                                                className={`h-8 w-8 rounded-[100px] text-xs font-semibold transition-all ${pageNum === currentPage ? 'bg-[#0052ff] text-white' : 'bg-white border border-[#dee1e6] text-[#0a0b0d] hover:bg-[#f7f7f7]'}`}>
                                                {pageNum + 1}
                                            </button>
                                        ))}
                                        <button onClick={() => fetchQuestions(currentPage + 1)} disabled={currentPage >= totalPages - 1}
                                            className="inline-flex items-center gap-1 px-5 py-3 text-sm font-semibold rounded-[100px] bg-white border border-[#dee1e6] text-[#0a0b0d] hover:bg-[#f7f7f7] disabled:opacity-30 disabled:cursor-not-allowed"
                                            style={{ height: 44, lineHeight: 1.15 }}>
                                            Next
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="hidden lg:flex lg:flex-col gap-3">
                        <div className="bg-white rounded-[24px] border border-[#dee1e6] p-[24px]">
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-[#f7f7f7] flex items-center justify-center text-[#0a0b0d] font-semibold text-xs flex-shrink-0">1</div>
                                <div>
                                    <h3 className="font-semibold text-[#0a0b0d] text-sm" style={{ lineHeight: 1.25 }}>Ask Your Question</h3>
                                    <p className="text-xs text-[#5b616e] mt-1" style={{ lineHeight: 1.5 }}>Select grade and subject, write your question and submit.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] border border-[#dee1e6] p-[24px]">
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-[#f7f7f7] flex items-center justify-center text-[#0a0b0d] font-semibold text-xs flex-shrink-0">2</div>
                                <div>
                                    <h3 className="font-semibold text-[#0a0b0d] text-sm" style={{ lineHeight: 1.25 }}>Get Answers</h3>
                                    <p className="text-xs text-[#5b616e] mt-1" style={{ lineHeight: 1.5 }}>Our experts and community members will answer and help you.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[24px] border border-[#dee1e6] p-[24px]">
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-[#f7f7f7] flex items-center justify-center text-[#0a0b0d] font-semibold text-xs flex-shrink-0">3</div>
                                <div>
                                    <h3 className="font-semibold text-[#0a0b0d] text-sm" style={{ lineHeight: 1.25 }}>Learn & Understand</h3>
                                    <p className="text-xs text-[#5b616e] mt-1" style={{ lineHeight: 1.5 }}>Get clear explanations and improve your knowledge.</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#f7f7f7] rounded-[24px] border border-[#dee1e6] p-[24px]">
                            <h3 className="font-semibold text-[#0a0b0d] text-sm" style={{ lineHeight: 1.25 }}>Need more help?</h3>
                            <p className="text-xs text-[#5b616e] mt-1 mb-3" style={{ lineHeight: 1.5 }}>After 3 free questions, share your details or WhatsApp.</p>
                            <a href="https://wa.me/918073982848" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-1.5 w-full px-5 py-3 bg-[#05b169] text-white text-sm font-semibold rounded-[100px] hover:bg-[#048c55] transition-all"
                                style={{ height: 44, lineHeight: 1.15 }}>
                                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371 0-.57 0-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.75 5.404 2.177 7.707l-2.313 6.256 6.514-2.286c2.25 1.238 4.761 1.889 7.368 1.889 5.431 0 9.856-4.413 9.878-9.846 0-2.6-.555-5.15-1.604-7.563-1.048-2.413-2.585-4.583-4.487-6.38-1.901-1.797-4.124-3.207-6.507-4.082-2.383-.876-4.902-1.322-7.2-1.293z" />
                                </svg>
                                WhatsApp
                            </a>
                        </div>

                        <div className="bg-[#f7f7f7] rounded-[24px] border border-[#dee1e6] p-[24px]">
                            <h3 className="font-semibold text-[#0a0b0d] text-sm" style={{ lineHeight: 1.25 }}>Existing Student?</h3>
                            <p className="text-xs text-[#5b616e] mt-1 mb-3" style={{ lineHeight: 1.5 }}>Login to your student portal to ask unlimited questions and access all answers.</p>
                            <Link to="/login?redirect=%2Fask" className="inline-flex items-center justify-center w-full px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition-all"
                                style={{ height: 44, lineHeight: 1.15 }}>
                                Login Now
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="lg:hidden mt-10 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-[24px] border border-[#dee1e6] p-[24px]">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-[#f7f7f7] flex items-center justify-center text-[#0a0b0d] font-semibold text-xs flex-shrink-0">1</div>
                                <div>
                                    <h3 className="font-semibold text-[#0a0b0d] text-sm" style={{ lineHeight: 1.25 }}>Ask Your Question</h3>
                                    <p className="text-xs text-[#5b616e] mt-0.5" style={{ lineHeight: 1.5 }}>Select grade and subject, write your question.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[24px] border border-[#dee1e6] p-[24px]">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-[#f7f7f7] flex items-center justify-center text-[#0a0b0d] font-semibold text-xs flex-shrink-0">2</div>
                                <div>
                                    <h3 className="font-semibold text-[#0a0b0d] text-sm" style={{ lineHeight: 1.25 }}>Get Answers</h3>
                                    <p className="text-xs text-[#5b616e] mt-0.5" style={{ lineHeight: 1.5 }}>Experts and community will answer.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-[24px] border border-[#dee1e6] p-[24px]">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-[#f7f7f7] flex items-center justify-center text-[#0a0b0d] font-semibold text-xs flex-shrink-0">3</div>
                                <div>
                                    <h3 className="font-semibold text-[#0a0b0d] text-sm" style={{ lineHeight: 1.25 }}>Learn & Understand</h3>
                                    <p className="text-xs text-[#5b616e] mt-0.5" style={{ lineHeight: 1.5 }}>Get clear explanations.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#f7f7f7] rounded-[24px] border border-[#dee1e6] p-[24px]">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                                <h3 className="font-semibold text-[#0a0b0d] text-sm" style={{ lineHeight: 1.25 }}>Need more help?</h3>
                                <p className="text-xs text-[#5b616e] mt-0.5" style={{ lineHeight: 1.5 }}>Share your details or WhatsApp.</p>
                            </div>
                            <a href="https://wa.me/918073982848" target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-5 py-3 bg-[#05b169] text-white text-xs font-semibold rounded-[100px] hover:bg-[#048c55] transition-all whitespace-nowrap"
                                style={{ height: 44, lineHeight: 1.15 }}>
                                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371 0-.57 0-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.75 5.404 2.177 7.707l-2.313 6.256 6.514-2.286c2.25 1.238 4.761 1.889 7.368 1.889 5.431 0 9.856-4.413 9.878-9.846 0-2.6-.555-5.15-1.604-7.563-1.048-2.413-2.585-4.583-4.487-6.38-1.901-1.797-4.124-3.207-6.507-4.082-2.383-.876-4.902-1.322-7.2-1.293z" />
                                </svg>
                                WhatsApp
                            </a>
                        </div>
                    </div>
                    <div className="bg-[#f7f7f7] rounded-[24px] border border-[#dee1e6] p-[24px]">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-[#0a0b0d] text-sm" style={{ lineHeight: 1.25 }}>Existing Student?</h3>
                                <p className="text-xs text-[#5b616e] mt-0.5" style={{ lineHeight: 1.5 }}>Login for unlimited questions.</p>
                            </div>
                            <Link to="/login?redirect=%2Fask" className="px-5 py-3 bg-[#0052ff] text-white text-xs font-semibold rounded-[100px] hover:bg-[#003ecc] transition-all"
                                style={{ height: 44, lineHeight: 1.15 }}>
                                Login Now
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ask;
