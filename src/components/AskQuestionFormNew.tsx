import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { askApi, type BackendGrade, type BackendSubject } from '../api/askApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const GUEST_ID = 'guest';

function getVisitorId(): string {
    try {
        let vid = localStorage.getItem('astar_visitor_id');
        if (!vid) { vid = 'visitor_' + Date.now(); localStorage.setItem('astar_visitor_id', vid); }
        return vid;
    } catch { return GUEST_ID; }
}

type AskQuestionFormProps = {
    user: { id: string; isEnrolled?: boolean } | null;
    onSuccess?: () => void;
    onLeadRequired?: () => void;
};

const AskQuestionForm: React.FC<AskQuestionFormProps> = ({
    user: propUser,
    onSuccess,
    onLeadRequired,
}) => {
    const { user: authUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const userId = authUser?.id || propUser?.id || getVisitorId();

    const [grades, setGrades] = useState<BackendGrade[]>([]);
    const [subjects, setSubjects] = useState<BackendSubject[]>([]);
    const [loadingGrades, setLoadingGrades] = useState(true);

    const wasRestored = useRef<boolean>(false);
    const [formData, setFormData] = useState(() => {
        try {
            const saved = sessionStorage.getItem('astar_pending_question');
            if (saved) {
                const data = JSON.parse(saved);
                wasRestored.current = true;
                return {
                    gradeId: data.gradeId || '',
                    subjectId: data.subjectId || '',
                    title: data.title || '',
                    description: data.description || '',
                };
            }
        } catch { /* ignore */ }
        return { gradeId: '', subjectId: '', title: '', description: '' };
    });
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const remainingFree = askApi.getRemainingQuestions(userId);
    const isEnrolled = propUser?.isEnrolled ?? false;

    useEffect(() => {
        loadGrades();
    }, []);

    useEffect(() => {
        if (formData.gradeId) {
            loadSubjects(formData.gradeId);
        } else {
            setSubjects([]);
        }
    }, [formData.gradeId]);

    useEffect(() => {
        if (wasRestored.current) {
            toast.success('Form restored. Please review and submit your question.');
        }
    }, []);

    const loadGrades = async () => {
        setLoadingGrades(true);
        try {
            const res = await askApi.getGrades();
            setGrades(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error('Failed to load grades');
        } finally {
            setLoadingGrades(false);
        }
    };

    const loadSubjects = async (gradeId: string) => {
        try {
            const res = await askApi.getSubjects(gradeId);
            setSubjects(Array.isArray(res.data) ? res.data : []);
        } catch {
            toast.error('Failed to load subjects');
            setSubjects([]);
        }
    };

    const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, gradeId: value, subjectId: '' }));
        if (errors.gradeId) setErrors(prev => { const n = { ...prev }; delete n.gradeId; return n; });
        loadSubjects(value);
    };

    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.currentTarget.value;
        setFormData(prev => ({ ...prev, subjectId: value }));
        if (errors.subjectId) setErrors(prev => { const n = { ...prev }; delete n.subjectId; return n; });
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        setFormData(prev => ({ ...prev, title: value }));
        if (errors.title) setErrors(prev => { const n = { ...prev }; delete n.title; return n; });
    };

    const handleDescriptionChange = (value: string) => {
        setFormData(prev => ({ ...prev, description: value }));
        if (errors.description) setErrors(prev => { const n = { ...prev }; delete n.description; return n; });
    };

    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (!formData.gradeId) errs.gradeId = 'Please select a grade.';
        if (!formData.subjectId) errs.subjectId = 'Please select a subject.';
        if (!formData.title.trim()) errs.title = 'Please enter a question title.';
        if (!formData.description.trim()) errs.description = 'Please enter a question description.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setUploadedFile(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        if (!isEnrolled && remainingFree <= 0) {
            onLeadRequired?.();
            return;
        }

        if (!authUser) {
            try {
                sessionStorage.setItem('astar_pending_question', JSON.stringify({
                    gradeId: formData.gradeId,
                    subjectId: formData.subjectId,
                    title: formData.title,
                    description: formData.description,
                }));
            } catch { /* ignore */ }
            toast.error('Please log in to submit a question.');
            navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
            return;
        }

        setLoading(true);
        try {
            let attachmentUrl = '';
            if (uploadedFile) {
                setUploading(true);
                attachmentUrl = await askApi.uploadFile(uploadedFile);
                setUploading(false);
            }

            const payload: Record<string, string> = {
                title: formData.title,
                descriptionHtml: formData.description,
                gradeId: formData.gradeId,
                subjectId: formData.subjectId,
            };
            if (attachmentUrl) payload.attachments = JSON.stringify([attachmentUrl]);

            await askApi.create(payload, authUser?.role);
            sessionStorage.removeItem('astar_pending_question');
            sessionStorage.removeItem('astar_pending_question_file');
            toast.success('Question submitted successfully!');
            askApi.markQuestionUsed(userId);

            setFormData({
                gradeId: '',
                subjectId: '',
                title: '',
                description: '',
            });
            setUploadedFile(null);
            setErrors({});

            if (onSuccess) onSuccess();
        } catch (error) {
            const errMsg = error instanceof Error ? error.message : 'Failed to submit question';
            toast.error(errMsg);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="bg-white rounded-[24px] border border-[#dee1e6] p-[32px] md:sticky md:top-6">
                <h2 className="text-[18px] font-semibold text-[#0a0b0d] mb-1 flex items-center gap-2" style={{ lineHeight: 1.33 }}>
                    <svg className="h-5 w-5 text-[#0052ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Ask a Question
                </h2>

                <form onSubmit={handleSubmit} className="space-y-[20px] mt-[24px]">
                    {!isEnrolled && (
                        <div className={`px-3 py-2 rounded-[12px] text-xs font-semibold ${remainingFree > 0 ? 'bg-[#f7f7f7] text-[#0a0b0d]' : 'bg-[#f7f7f7] text-[#0a0b0d]'}`}>
                            {remainingFree > 0
                                ? `You have ${remainingFree} free question${remainingFree !== 1 ? 's' : ''} remaining.`
                                : 'You have used all free questions. Please share your details to continue.'}
                        </div>
                    )}

                    <div>
                        <label className="block text-[12px] font-semibold text-[#0a0b0d] mb-1 uppercase tracking-wide" style={{ lineHeight: 1.5 }}>
                            Grade <span className="text-[#cf202f]">*</span>
                        </label>
                        <select
                            name="gradeId"
                            value={formData.gradeId}
                            onChange={handleGradeChange}
                            className={`w-full rounded-[12px] border ${errors.gradeId ? 'border-[#cf202f]' : 'border-[#dee1e6]'} px-[16px] py-[14px] text-[16px] text-[#0a0b0d] placeholder-[#a8acb3] bg-white focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10 outline-none transition-all`}
                            style={{ height: 48, lineHeight: 1.5 }}
                            disabled={loading || loadingGrades}
                        >
                            <option value="">{loadingGrades ? 'Loading grades...' : 'Select grade'}</option>
                            {grades.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        {errors.gradeId && <p className="text-[#cf202f] text-[10px] mt-0.5">{errors.gradeId}</p>}
                    </div>

                    <div>
                        <label className="block text-[12px] font-semibold text-[#0a0b0d] mb-1 uppercase tracking-wide" style={{ lineHeight: 1.5 }}>
                            Subject <span className="text-[#cf202f]">*</span>
                        </label>
                        <select
                            name="subjectId"
                            value={formData.subjectId}
                            onChange={handleSubjectChange}
                            className={`w-full rounded-[12px] border ${errors.subjectId ? 'border-[#cf202f]' : 'border-[#dee1e6]'} px-[16px] py-[14px] text-[16px] text-[#0a0b0d] placeholder-[#a8acb3] bg-white focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10 outline-none transition-all`}
                            style={{ height: 48, lineHeight: 1.5 }}
                            disabled={loading || !formData.gradeId}
                        >
                            <option value="">{formData.gradeId ? 'Select subject' : 'Select grade first'}</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        {errors.subjectId && <p className="text-[#cf202f] text-[10px] mt-0.5">{errors.subjectId}</p>}
                    </div>

                    <div>
                        <label className="block text-[12px] font-semibold text-[#0a0b0d] mb-1 uppercase tracking-wide" style={{ lineHeight: 1.5 }}>
                            Question Title <span className="text-[#cf202f]">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleTitleChange}
                            placeholder="e.g. Integration Doubt, Electrostatics Question"
                            className={`w-full rounded-[12px] border ${errors.title ? 'border-[#cf202f]' : 'border-[#dee1e6]'} px-[16px] py-[14px] text-[16px] text-[#0a0b0d] placeholder-[#a8acb3] bg-white focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10 outline-none transition-all`}
                            style={{ height: 48, lineHeight: 1.5 }}
                            disabled={loading}
                            maxLength={150}
                        />
                        {errors.title && <p className="text-[#cf202f] text-[10px] mt-0.5">{errors.title}</p>}
                    </div>

                    <div>
                        <label className="block text-[12px] font-semibold text-[#0a0b0d] mb-1 uppercase tracking-wide" style={{ lineHeight: 1.5 }}>
                            Description <span className="text-[#cf202f]">*</span>
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={e => handleDescriptionChange(e.target.value)}
                            rows={5}
                            placeholder="Type your question in detail... You can use LaTeX math (e.g. $x^2 + y^2 = z^2$) and plain text."
                            className={`w-full rounded-[12px] border px-[16px] py-[14px] text-[16px] text-[#0a0b0d] placeholder-[#a8acb3] bg-white focus:outline-none focus:ring-2 focus:ring-[#0052ff]/10 transition-all resize-y min-h-[120px] ${errors.description ? 'border-[#cf202f]' : 'border-[#dee1e6] focus:border-[#0052ff]'}`}
                            style={{ lineHeight: 1.5 }}
                            disabled={loading}
                        />
                        {errors.description && <p className="text-[#cf202f] text-[10px] mt-0.5">{errors.description}</p>}
                    </div>

                    <div>
                        <label className="block text-[12px] font-semibold text-[#0a0b0d] mb-1 uppercase tracking-wide" style={{ lineHeight: 1.5 }}>
                            Attachment (optional)
                        </label>
                        <label className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-[12px] cursor-pointer transition-all ${uploadedFile ? 'border-[#05b169] bg-[#f7f7f7]' : 'border-[#dee1e6] bg-white hover:border-[#0052ff] hover:bg-[#f7f7f7]'}`}>
                            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="sr-only" disabled={loading || uploading} />
                            {uploadedFile ? (
                                <span className="text-sm font-medium text-[#05b169]">{uploadedFile.name}</span>
                            ) : (
                                <span className="text-sm font-medium text-[#5b616e]">Upload image or PDF (JPG, JPEG, PNG, PDF)</span>
                            )}
                        </label>
                    </div>

                    {!authUser ? (
                        <div className="mt-[24px] p-[24px] bg-[#f7f7f7] rounded-[24px] text-center">
                            <p className="text-sm font-semibold text-[#0a0b0d] mb-3">Fill in your question above, then log in to submit.</p>
                            <Link
                                to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
                                onClick={() => {
                                    sessionStorage.setItem('astar_pending_question', JSON.stringify({
                                        gradeId: formData.gradeId,
                                        subjectId: formData.subjectId,
                                        title: formData.title,
                                        description: formData.description,
                                    }));
                                }}
                                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0052ff] text-white text-[16px] font-semibold rounded-[100px] hover:bg-[#003ecc] transition-all"
                                style={{ height: 44, lineHeight: 1.15 }}
                            >
                                Log In to Submit
                            </Link>
                        </div>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-[100px] bg-[#0052ff] px-5 py-3 text-[16px] font-semibold text-white hover:bg-[#003ecc] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ height: 44, lineHeight: 1.15 }}
                        >
                            {uploading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Uploading...
                                </>
                            ) : loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Submit Question
                                </>
                            )}
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default AskQuestionForm;
