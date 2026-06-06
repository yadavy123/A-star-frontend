import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { askApi, type AskPageResponse } from '../api/askApi';
import RichDescriptionEditor from '../components/RichDescriptionEditor';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import katex from 'katex';
import 'katex/dist/katex.min.css';

type Category = {
    id: string;
    name: string;
    slug?: string;
};

type Question = {
    id: string;
    title: string;
    descriptionHtml: string;
    createdAt: string;
    slug?: string;
    category?: Category | null;
};

type Answer = {
    id: string;
    contentHtml: string;
    authorName: string;
    createdAt: string;
    status: string;
};

const PAGE_SIZE = 10;

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
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    const [questions, setQuestions] = useState<Question[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);

    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [answersMap, setAnswersMap] = useState<Record<string, Answer[]>>({});
    const [answerTextMap, setAnswerTextMap] = useState<Record<string, string>>({});
    const [answerLoading, setAnswerLoading] = useState(false);
    const [answerLoaders, setAnswerLoaders] = useState<Record<string, boolean>>({});
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const location = useLocation();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchQuestions(0);
    }, [selectedCategory]);

    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const catRes = await askApi.getCategories();
            const cats = Array.isArray(catRes.data) ? catRes.data : [];
            setCategories(cats);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setCategoriesLoading(false);
        }
    };

    const fetchQuestions = async (page: number) => {
        setLoading(true);
        setExpandedId(null);
        try {
            const params: Record<string, string | number | boolean | null> = {
                page, size: PAGE_SIZE, sort: 'createdAt', direction: 'desc'
            };
            if (selectedCategory) params.categoryId = selectedCategory;

            const qsRes = await askApi.getAll(params);
            const pageData = qsRes.data as AskPageResponse;
            setQuestions(pageData?.content || []);
            setTotalPages(pageData?.totalPages ?? 0);
            setCurrentPage(pageData?.number ?? 0);
        } catch (error) {
            console.error('Error fetching questions:', error);
            toast.error('Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnswers = useCallback(async (questionId: string) => {
        if (answersMap[questionId] !== undefined) return;
        setAnswerLoaders(prev => ({ ...prev, [questionId]: true }));
        try {
            const res = await askApi.getAnswers(questionId);
            setAnswersMap(prev => ({ ...prev, [questionId]: Array.isArray(res.data) ? res.data : [] }));
        } catch (error) {
            console.error('Error fetching answers:', error);
            setAnswersMap(prev => ({ ...prev, [questionId]: [] }));
        } finally {
            setAnswerLoaders(prev => ({ ...prev, [questionId]: false }));
        }
    }, [answersMap]);

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
            const errMsg = error instanceof Error ? error.message : (error as { message?: string })?.message || 'Failed to submit answer';
            toast.error(errMsg);
        } finally {
            setAnswerLoading(false);
        }
    };

    const QuestionSkeleton = () => (
        <div className="animate-pulse space-y-4 p-6 bg-white rounded-2xl border border-gray-100">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 py-8 md:py-16">
            <style>{`
                .math-block {
                    display: block;
                    text-align: center;
                    margin: 1.5em 0;
                    overflow-x: auto;
                    padding: 1rem;
                    background: #f8f9fa;
                    border-radius: 8px;
                }
                .math-inline {
                    display: inline;
                    padding: 0 4px;
                    color: #4338ca;
                    font-weight: 500;
                }
                .katex { font-size: 1.1em; }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8 md:mb-12">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                        <span className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
                        Community Q&A
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 leading-tight">
                        Questions & Answers
                    </h1>
                    <p className="mt-4 text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Browse questions from our community. Share your knowledge by answering questions with full LaTeX math support.
                    </p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            disabled={categoriesLoading}
                            className="rounded-xl border-2 border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="">{categoriesLoading ? 'Loading categories...' : 'All Categories'}</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <span className="text-sm text-gray-400">
                        {!loading && `${questions.length} question${questions.length !== 1 ? 's' : ''}`}
                    </span>
                </div>

                {/* Questions List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <QuestionSkeleton key={i} />)}
                    </div>
                ) : questions.length === 0 ? (
                    <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 md:p-16 text-center">
                        <div className="p-4 bg-purple-50 rounded-full inline-flex mb-4">
                            <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 mb-2">No questions found</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto">
                            {selectedCategory ? 'No questions in this category yet.' : 'No questions have been posted yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questions.map((q) => {
                            const isExpanded = expandedId === q.id;
                            const ansCount = answersMap[q.id]?.length ?? 0;
                            const ansLoading = answerLoaders[q.id];

                            return (
                                <div key={q.id} className={`bg-white rounded-2xl border transition-all duration-200 ${isExpanded ? 'border-purple-200 shadow-xl' : 'border-gray-100 shadow-md hover:shadow-lg'}`}>
                                    <div
                                        className="p-5 md:p-6 cursor-pointer"
                                        onClick={() => handleToggleExpand(q.id)}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base md:text-lg font-bold text-gray-900 leading-snug mb-1">
                                                    {q.title || 'Untitled Question'}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                    {q.category && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">
                                                            {q.category.name}
                                                        </span>
                                                    )}
                                                    <span>{new Date(q.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    {ansCount > 0 && (
                                                        <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                            </svg>
                                                            {ansCount} {ansCount === 1 ? 'answer' : 'answers'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={`shrink-0 p-2 rounded-xl transition-colors ${isExpanded ? 'bg-purple-100 text-purple-600' : 'bg-gray-50 text-gray-400'}`}>
                                                <svg className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        <div className="mt-3 prose prose-sm max-w-none text-gray-600 line-clamp-2">
                                            <div dangerouslySetInnerHTML={{ __html: renderMathInHTML(q.descriptionHtml) }} />
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="border-t border-gray-100">
                                            {ansLoading ? (
                                                <div className="p-6 flex justify-center">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-600" />
                                                </div>
                                            ) : answersMap[q.id] && answersMap[q.id].length > 0 ? (
                                                <div className="divide-y divide-gray-50">
                                                    <div className="px-5 md:px-6 pt-4 pb-2">
                                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                            Answers ({answersMap[q.id].length})
                                                        </h4>
                                                    </div>
                                                    {answersMap[q.id].map((a) => (
                                                        <div key={a.id} className="px-5 md:px-6 py-4 hover:bg-gray-50/50 transition-colors">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold">
                                                                    {(a.authorName || 'S')[0].toUpperCase()}
                                                                </div>
                                                                <span className="text-xs font-medium text-gray-700">{a.authorName || 'Student'}</span>
                                                                <span className="text-xs text-gray-400">•</span>
                                                                <span className="text-xs text-gray-400">
                                                                    {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </span>
                                                            </div>
                                                            <div className="prose prose-sm max-w-none text-gray-700 pl-8"
                                                                dangerouslySetInnerHTML={{ __html: renderMathInHTML(a.contentHtml) }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="px-5 md:px-6 py-5 text-center">
                                                    <p className="text-sm text-gray-400">No answers yet. Be the first to respond!</p>
                                                </div>
                                            )}

                                            <div className="border-t border-gray-100 px-5 md:px-6 py-5">
                                                {isAuthenticated ? (
                                                    <div className="space-y-3">
                                                        <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider">Write Your Answer</h4>
                                                        <RichDescriptionEditor value={answerTextMap[q.id] || ''} onChange={(val) => setAnswerTextMap(prev => ({ ...prev, [q.id]: val }))} />
                                                        <div className="flex justify-end">
                                                            <button
                                                                onClick={() => handleSubmitAnswer(q.id)}
                                                                disabled={answerLoading}
                                                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {answerLoading ? (
                                                                    <>
                                                                        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                                        </svg>
                                                                        Submitting...
                                                                    </>
                                                                ) : 'Submit Answer'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-5 text-center border border-purple-100">
                                                        <p className="text-sm text-gray-600 mb-3">Please log in to submit an answer</p>
                                                        <Link
                                                            to="/login"
                                                            state={{ from: location.pathname }}
                                                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                            </svg>
                                                            Login
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 pt-4">
                                <button
                                    onClick={() => fetchQuestions(currentPage - 1)}
                                    disabled={currentPage === 0}
                                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>

                                <div className="flex items-center gap-1">
                                    {(() => {
                                        const pages: number[] = [];
                                        if (totalPages <= 7) {
                                            for (let i = 0; i < totalPages; i++) pages.push(i);
                                        } else if (currentPage < 3) {
                                            for (let i = 0; i < 7; i++) pages.push(i);
                                        } else if (currentPage > totalPages - 4) {
                                            for (let i = totalPages - 7; i < totalPages; i++) pages.push(i);
                                        } else {
                                            for (let i = currentPage - 3; i <= currentPage + 3; i++) pages.push(i);
                                        }
                                        return pages;
                                    })().map(pageNum => (
                                        <button
                                            key={pageNum}
                                            onClick={() => fetchQuestions(pageNum)}
                                            className={`h-9 w-9 rounded-xl text-sm font-bold transition-all ${pageNum === currentPage
                                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => fetchQuestions(currentPage + 1)}
                                    disabled={currentPage >= totalPages - 1}
                                    className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    Next
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Ask;
