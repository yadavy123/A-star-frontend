import { useState, useEffect, useCallback, useRef, type ChangeEvent, type DragEvent, type FormEvent, type SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import { blogApi } from '../../api/blogApi.ts';
import { Card, Input, TextArea, Button } from '../ui/index.tsx';
import { ContentEditor } from '../editor/ContentEditor';
import { PenTool, Mail, CheckCircle, ArrowRight, Save, X, Image as ImageIcon, ArrowLeft, Loader } from 'lucide-react';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';
import toast from 'react-hot-toast';

const DRAFT_KEY = 'blogpost_draft';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_MB = 5;
const FEATURED_IMAGE_DIMENSIONS = { width: 1200, height: 675 };
const TARGET_ASPECT_RATIO = 16 / 9;
const ASPECT_RATIO_TOLERANCE = 0.15;
const DEFAULT_FALLBACK_IMAGE_URL = 'https://drive.google.com/uc?export=view&id=16BWUC7BonpEG6n4oIrWVTCwagV5Vsigc';

const checkImageDimensions = (file: File): Promise<{ width: number; height: number; aspectRatio: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: img.naturalWidth, height: img.naturalHeight, aspectRatio: img.naturalWidth / img.naturalHeight });
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };
        img.src = url;
    });
};

const resizeImage = (file: File, width: number, height: number): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('Failed to get canvas context')); return; }
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (!blob) { reject(new Error('Failed to create blob')); return; }
                const resizedFile = new File([blob], file.name, { type: file.type });
                resolve(resizedFile);
            }, file.type, 0.92);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
        img.src = url;
    });
};

type ImagePreviewItem = {
    id: string;
    previewUrl: string;
    cloudinaryUrl: string | null;
    file: File | null;
    uploading: boolean;
    error: string | null;
};

type SubmitFormData = {
    authorName: string;
    authorEmail: string;
    authorMobile: string;
    title: string;
    excerpt: string;
    content: string;
    tags: string;
    featuredImageUrl: string;
};

type SavedDraft = {
    formData: SubmitFormData;
    savedAt?: string;
};

const emptyForm: SubmitFormData = {
    authorName: '', authorEmail: '', authorMobile: '',
    title: '', excerpt: '', content: '', tags: '', featuredImageUrl: '',
};

const TOTAL_STEPS = 4;

const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null) {
        if ('response' in error) {
            const response = (error as { response?: { data?: { message?: string } } }).response;
            if (response?.data?.message) return response.data.message;
        }
        if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
            return (error as Record<string, string>).message;
        }
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
};

const stepLabels: Record<number, string> = {
    1: 'Write',
    2: 'Verify',
    3: 'Upload',
    4: 'Submit',
};

export const SubmitBlogPage = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<SubmitFormData>(emptyForm);
    const [otp, setOtp] = useState('');
    const [draftSavedAt, setDraftSavedAt] = useState<Date | null>(null);
    const [imagePreviews, setImagePreviews] = useState<ImagePreviewItem[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const autoSaveTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const imagePreviewsRef = useRef<ImagePreviewItem[]>([]);
    const [resizeEnabled, setResizeEnabled] = useState(false);
    const [resizeWidth, setResizeWidth] = useState(FEATURED_IMAGE_DIMENSIONS.width);
    const [resizeHeight, setResizeHeight] = useState(FEATURED_IMAGE_DIMENSIONS.height);
    const [lockAspectRatio, setLockAspectRatio] = useState(true);

    useEffect(() => {
        imagePreviewsRef.current = imagePreviews;
    }, [imagePreviews]);

    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(DRAFT_KEY);
            if (saved) {
                const draft = JSON.parse(saved) as SavedDraft;
                if (draft.formData && (draft.formData.title || draft.formData.content || draft.formData.excerpt)) {
                    setDraftSavedAt(draft.savedAt ? new Date(draft.savedAt) : null);
                }
            }
        } catch { /* ignore corrupt data */ }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const formatResendTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const saveDraft = useCallback((silent = false) => {
        try {
            const draft: SavedDraft = { formData, savedAt: new Date().toISOString() };
            localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
            setDraftSavedAt(new Date());
            if (!silent) toast.success('Draft saved!');
        } catch {
            if (!silent) toast.error('Could not save draft');
        }
    }, [formData]);

    const getCloudinaryUrls = useCallback((items: ImagePreviewItem[]): string => {
        return items
            .map(item => item.cloudinaryUrl)
            .filter((url): url is string => url !== null)
            .join(',');
    }, []);

    useEffect(() => {
        if (step !== 1) return;
        autoSaveTimer.current = setInterval(() => {
            const hasContent = formData.title || formData.content || formData.excerpt;
            if (hasContent) {
                saveDraft(true);
            }
        }, 30000);
        return () => {
            if (autoSaveTimer.current) {
                clearInterval(autoSaveTimer.current);
            }
        };
    }, [step, formData, saveDraft]);

    useEffect(() => {
        const cloudUrls = getCloudinaryUrls(imagePreviews);
        const currentFeatured = formData.featuredImageUrl;
        if (cloudUrls !== currentFeatured) {
            setFormData(f => ({ ...f, featuredImageUrl: cloudUrls }));
        }
    }, [imagePreviews, getCloudinaryUrls, formData.featuredImageUrl]);

    const clearDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setDraftSavedAt(null);
    };

    const handleStep1 = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.authorName.trim()) {
            toast.error('Please enter your name.');
            return;
        }
        if (!formData.authorMobile || formData.authorMobile.length !== 10) {
            toast.error('Mobile number must be exactly 10 digits.');
            return;
        }
        if (!/^\d{10}$/.test(formData.authorMobile)) {
            toast.error('Please enter a valid 10-digit mobile number (digits only).');
            return;
        }
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.authorEmail)) {
            toast.error('Please enter a valid email address.');
            return;
        }
        if (!formData.title.trim()) {
            toast.error('Please enter a blog title.');
            return;
        }
        if (!formData.excerpt.trim()) {
            toast.error('Please enter an excerpt.');
            return;
        }
        if (!formData.content.trim()) {
            toast.error('Please write some content.');
            return;
        }

        setStep(2);
        await sendOtp(false);
    };

    const [otpTimer, setOtpTimer] = useState(0);

    const sendOtp = async (isResend = false) => {
        try {
            await blogApi.startSubmission({ authorEmail: formData.authorEmail, isResend });
            toast.success('OTP sent to your email!');
            setOtpTimer(300);
        } catch (err) {
            toast.error(getApiErrorMessage(err, 'Failed to send OTP'));
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    const handleOtpSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP.');
            return;
        }
        setLoading(true);
        try {
            await blogApi.verifySubmission({ authorEmail: formData.authorEmail, otp });
            toast.success('Email verified! You can now upload images.');
            setStep(3);
        } catch (err) {
            const msg = getApiErrorMessage(err, 'Verification failed');
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (otpTimer > 0) return;
        await sendOtp(true);
    };

    const handleImageStepNext = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStep(4);
    };

    const handleFinalSubmit = async () => {
        setLoading(true);
        try {
            const cloudUrls = getCloudinaryUrls(imagePreviews);
            await blogApi.finishSubmission({
                ...formData,
                email: formData.authorEmail,
                contentHtml: formData.content,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                featuredImageUrl: cloudUrls || DEFAULT_FALLBACK_IMAGE_URL,
            });
            clearDraft();
            toast.success('Blog submitted!'); setStep(5);
        }
        catch (err) { toast.error(getApiErrorMessage(err, 'Failed to finalize')); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        return () => {
            imagePreviewsRef.current.forEach(item => {
                if (item.previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });
        };
    }, []);

    const update = (field: keyof SubmitFormData) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        let value = e.target.value;
        if (field === 'authorMobile') {
            const digitsOnly = value.replace(/\D/g, '');
            value = digitsOnly.slice(0, 10);
        }
        setFormData({ ...formData, [field]: value });
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        imagePreviewsRef.current.forEach(item => {
            if (item.previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(item.previewUrl);
            }
        });
        setImagePreviews([]);
        processImageFile(files[0]);
        e.target.value = '';
    };

    const processImageFile = async (file: File) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            toast.error(`"${file.name}" is not supported. Only JPG and PNG formats are allowed.`);
            return;
        }

        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > MAX_IMAGE_SIZE_MB) {
            toast.error(`"${file.name}" is ${fileSizeMB.toFixed(1)}MB. Max allowed is ${MAX_IMAGE_SIZE_MB}MB`);
            return;
        }

        let dims;
        try {
            dims = await checkImageDimensions(file);
        } catch {
            toast.error(`"${file.name}" — could not read image dimensions.`);
            return;
        }

        const ratioDiff = Math.abs(dims.aspectRatio - TARGET_ASPECT_RATIO);
        if (ratioDiff > ASPECT_RATIO_TOLERANCE) {
            toast.error(`"${file.name}" has ${dims.width}×${dims.height}px (${dims.aspectRatio.toFixed(2)}:1). Only 16:9 ratio images are allowed — please upload a 16:9 image (recommended ${FEATURED_IMAGE_DIMENSIONS.width}×${FEATURED_IMAGE_DIMENSIONS.height}px).`);
            return;
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const localUrl = URL.createObjectURL(file);

        const item: ImagePreviewItem = {
            id,
            previewUrl: localUrl,
            cloudinaryUrl: null,
            file,
            uploading: true,
            error: null,
        };

        setImagePreviews(prev => [...prev, item]);

        let fileToUpload = file;
        if (resizeEnabled) {
            try {
                fileToUpload = await resizeImage(file, resizeWidth, resizeHeight);
            } catch {
                toast.error('Resize failed, uploading original');
            }
        }

        try {
            const url = await uploadToCloudinary(fileToUpload);
            setImagePreviews(prev =>
                prev.map(p => p.id === id ? { ...p, previewUrl: url, cloudinaryUrl: url, uploading: false } : p)
            );
            toast.success(`"${file.name}" uploaded successfully!`);
        } catch {
            setImagePreviews(prev =>
                prev.map(p => p.id === id ? { ...p, uploading: false, error: 'Upload failed, keeping local copy' } : p)
            );
            toast.error(`Failed to upload "${file.name}". Add via URL instead.`);
        }
    };

    const handleUrlChange = (url: string) => {
        if (!url.trim()) return;
        try {
            new URL(url);
            const trimmed = url.trim();
            imagePreviewsRef.current.forEach(item => {
                if (item.previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });
            const id = `url-${Date.now()}`;
            const item: ImagePreviewItem = {
                id,
                previewUrl: trimmed,
                cloudinaryUrl: trimmed,
                file: null,
                uploading: false,
                error: null,
            };
            setImagePreviews([item]);
            toast.success('Image URL added');
        } catch {
            toast.error('Invalid URL format');
        }
    };

    const removeImage = (index: number) => {
        setImagePreviews(prev => {
            const removed = prev[index];
            if (removed && removed.previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(removed.previewUrl);
            }
            const next = prev.filter((_, i) => i !== index);
            return next;
        });
        toast.success('Image removed');
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            imagePreviewsRef.current.forEach(item => {
                if (item.previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(item.previewUrl);
                }
            });
            setImagePreviews([]);
            processImageFile(files[0]);
        }
    };

    const formatDraftTime = (date: Date | null) => {
        if (!date) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="max-w-5xl mx-auto px-6 pt-14 pb-10 md:pt-16">
            <Link to="/blog" className="inline-flex items-center gap-2 text-base font-medium text-[#4f6079] hover:text-text-primary transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-text-primary mb-2">
                Submit Your Blog
            </h1>
            <p className="text-lg text-text-secondary mb-6">Share your knowledge with our community</p>

            <div className="flex items-center justify-center gap-0.5 sm:gap-5 mb-12 overflow-hidden px-0">
                {[1, 2, 3, 4].map((s) => (
                    <div key={s} className="flex items-center gap-px sm:gap-3 shrink-0">
                        <div className={`w-5 h-5 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-[9px] sm:text-[17px] font-bold transition-all ${step > s ? 'bg-[#19788f] text-white' : step === s ? 'bg-[#19788f] text-white' : 'bg-[#d9dde3] text-[#667085]'
                            }`}>{step > s ? '✓' : s}</div>
                        <span className={`text-[8px] sm:text-base font-semibold ${step >= s ? 'text-[#19788f]' : 'text-[#667085]'}`}>
                            {stepLabels[s]}
                        </span>
                        {s < TOTAL_STEPS && <div className={`w-1.5 sm:w-16 h-[2px] ${step > s ? 'bg-[#19788f]' : 'bg-[#c9ced6]'}`} />}
                    </div>
                ))}
            </div>

            {step === 1 && (
                <Card className="rounded-2xl border border-[#d7dce3] shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <PenTool className="w-5 h-5 text-text-secondary" />
                            <h2 className="text-xl font-bold text-text-primary">Write Your Blog</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {draftSavedAt && (
                                <span className="text-xs text-text-tertiary hidden sm:inline">
                                    Saved {formatDraftTime(draftSavedAt)}
                                </span>
                            )}
                            <button type="button" onClick={() => saveDraft(false)}
                                className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary bg-bg-tertiary hover:bg-bg-hover px-3 py-1.5 rounded-lg transition-colors">
                                <Save size={14} /> Save Draft
                            </button>
                        </div>
                    </div>
                    <form onSubmit={handleStep1} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Your Name *" placeholder="John Doe" value={formData.authorName} onChange={update('authorName')} required />
                            <Input label="Email *" type="email" placeholder="john@example.com" value={formData.authorEmail} onChange={update('authorEmail')} required />
                        </div>
                        <Input label="Mobile *" placeholder="9876543210" value={formData.authorMobile} onChange={update('authorMobile')} maxLength={10} required />
                        <div className="text-xs text-text-tertiary mt-1">Enter 10-digit phone number</div>
                        <Input label="Blog Title *" placeholder="An amazing title..." value={formData.title} onChange={update('title')} required />
                        <TextArea label="Excerpt *" placeholder="Brief summary (2-3 sentences)" rows={2} value={formData.excerpt} onChange={update('excerpt')} required />

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-text-secondary">Content *</label>
                            <ContentEditor
                                initialContent={formData.content}
                                onChange={(html: string) => setFormData(prev => ({ ...prev, content: html }))}
                            />
                        </div>

                        <Input label="Tags (comma separated)" placeholder="spring-boot, java, tutorial" value={formData.tags} onChange={update('tags')} />

                        <div className="rounded-xl bg-bg-secondary border border-border-primary p-4">
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                                <ImageIcon size={18} />
                                <span>Images can be uploaded after verification.</span>
                            </div>
                        </div>

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Sending OTP...' : 'Continue — Verify Email'} <ArrowRight className="w-4 h-4 inline ml-1" />
                        </Button>
                    </form>
                </Card>
            )}

            {step === 2 && (
                <Card className="text-center">
                    <Mail className="w-12 h-12 mx-auto text-text-tertiary mb-3" />
                    <h2 className="text-xl font-bold text-text-primary mb-1">Verify Your Email</h2>
                    <p className="text-text-secondary mb-2 text-sm">OTP sent to <strong>{formData.authorEmail}</strong></p>
                    <form onSubmit={handleOtpSubmit} className="max-w-xs mx-auto space-y-4">
                        <Input
                            placeholder="Enter 6-digit OTP"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={otp}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setOtp(val);
                            }}
                            className="text-center text-xl tracking-widest"
                            maxLength={6}
                            required
                        />
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Verifying...' : 'Verify & Continue'}
                        </Button>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={otpTimer > 0}
                                className={`text-sm font-semibold transition-colors ${otpTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#19788f] hover:text-[#166b7f] underline'}`}
                            >
                                {otpTimer > 0 ? `Resend OTP in ${formatResendTimer(otpTimer)}` : 'Resend OTP'}
                            </button>
                        </div>
                        <button type="button" onClick={() => setStep(1)} className="w-full pt-2 text-sm text-text-tertiary hover:text-text-primary font-medium flex items-center justify-center gap-1 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Writing
                        </button>
                    </form>
                </Card>
            )}

            {step === 3 && (
                <Card className="rounded-2xl border border-[#d7dce3] shadow-sm">
                    <form onSubmit={handleImageStepNext} className="space-y-4">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-text-secondary" />
                            <h2 className="text-xl font-bold text-text-primary">Upload Featured Image</h2>
                        </div>
                        <p className="text-sm text-text-secondary">Upload a single featured image for your blog post.</p>

                        <div className="space-y-3">
                            <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 font-medium">
                                Required: <strong>16:9 aspect ratio</strong> (e.g. {FEATURED_IMAGE_DIMENSIONS.width}×{FEATURED_IMAGE_DIMENSIONS.height}px). Only <strong>JPG</strong> / <strong>PNG</strong> / <strong>WEBP</strong>, max <strong>{MAX_IMAGE_SIZE_MB}MB</strong>.
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
                                <p className="text-xs font-semibold text-blue-800 mb-1">Recommended Image Size: <strong>1200 × 675 px (16:9)</strong></p>
                                <p className="text-xs text-blue-700">Supported Formats: JPG, PNG, WEBP &nbsp;|&nbsp; Maximum File Size: 5 MB</p>
                            </div>

                            <div className="border border-border-primary rounded-xl p-4 space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={resizeEnabled}
                                        onChange={e => setResizeEnabled(e.target.checked)}
                                        className="w-4 h-4 rounded border-border-primary text-[#19788f] focus:ring-[#19788f]"
                                    />
                                    <span className="text-sm font-medium text-text-primary">Resize image before upload (recommended)</span>
                                </label>
                                {resizeEnabled && (
                                    <div className="grid grid-cols-2 gap-3 pl-6">
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">Width (px)</label>
                                            <input
                                                type="number"
                                                min={100}
                                                max={4000}
                                                value={resizeWidth}
                                                onChange={e => {
                                                    const w = Math.max(100, Number(e.target.value) || 0);
                                                    setResizeWidth(w);
                                                    if (lockAspectRatio) {
                                                        setResizeHeight(Math.round(w / TARGET_ASPECT_RATIO));
                                                    }
                                                }}
                                                className="input-clean w-full text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-text-secondary mb-1">Height (px)</label>
                                            <input
                                                type="number"
                                                min={100}
                                                max={4000}
                                                value={resizeHeight}
                                                onChange={e => {
                                                    const h = Math.max(100, Number(e.target.value) || 0);
                                                    setResizeHeight(h);
                                                    if (lockAspectRatio) {
                                                        setResizeWidth(Math.round(h * TARGET_ASPECT_RATIO));
                                                    }
                                                }}
                                                className="input-clean w-full text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={lockAspectRatio}
                                                    onChange={e => setLockAspectRatio(e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded border-border-primary text-[#19788f] focus:ring-[#19788f]"
                                                />
                                                <span className="text-xs text-text-secondary">Lock 16:9 aspect ratio</span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {imagePreviews.map((item, index) => (
                                        <div key={item.id} className="relative h-44 rounded-lg overflow-hidden bg-bg-secondary border border-border-primary group flex items-center justify-center">
                                            <img
                                                src={item.previewUrl}
                                                alt={`Preview ${index + 1}`}
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e: SyntheticEvent<HTMLImageElement>) => {
                                                    e.currentTarget.src = 'https://via.placeholder.com/400x225?text=Invalid+Image';
                                                }}
                                            />
                                            {item.uploading && (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <Loader className="w-6 h-6 text-white animate-spin" />
                                                </div>
                                            )}
                                            {item.error && (
                                                <div className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                                                    LOCAL ONLY
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                                title="Remove image"
                                                disabled={item.uploading}
                                            >
                                                <X size={14} />
                                            </button>
                                            {index === 0 && (
                                                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-0.5 text-center font-bold">
                                                    FEATURED
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragOver
                                    ? 'border-text-secondary bg-bg-secondary'
                                    : 'border-border-primary bg-bg-primary hover:border-text-secondary hover:bg-bg-tertiary'
                                    }`}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-3 rounded-full bg-bg-secondary text-text-tertiary group-hover:text-text-primary transition-colors">
                                        <ImageIcon size={28} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-text-primary">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-text-tertiary mt-1">
                                            JPG, PNG, WEBP up to {MAX_IMAGE_SIZE_MB}MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp"
                                onChange={handleImageUpload}
                                className="hidden"
                            />

                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    placeholder="Or paste image URL here..."
                                    className="input-clean flex-1 text-sm"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleUrlChange((e.target as HTMLInputElement).value);
                                            (e.target as HTMLInputElement).value = '';
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                                        handleUrlChange(input.value);
                                        input.value = '';
                                    }}
                                    className="px-4 py-2 bg-bg-tertiary hover:bg-bg-hover text-text-secondary text-xs font-bold rounded-lg transition-colors border border-border-primary"
                                >
                                    Add URL
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={() => setStep(2)} className="px-4 py-2 bg-bg-tertiary hover:bg-bg-hover text-text-secondary text-sm font-medium rounded-lg transition-colors border border-border-primary">
                                <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
                            </button>
                            <Button type="submit" className="flex-1">
                                Continue to Submit <ArrowRight className="w-4 h-4 inline ml-1" />
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {step === 4 && (
                <Card className="text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-3" />
                    <h2 className="text-xl font-bold text-text-primary mb-1">Ready to Submit!</h2>
                    <p className="text-text-secondary mb-2 text-sm">
                        {imagePreviews.some(i => i.uploading)
                            ? 'Uploading image...'
                            : imagePreviews.length > 0
                                ? 'Featured image attached.'
                                : 'No image — a default image will be used.'}
                    </p>
                    <p className="text-text-secondary mb-6 text-sm">Click below to submit for admin review</p>
                    <Button
                        onClick={handleFinalSubmit}
                        disabled={loading || imagePreviews.some(i => i.uploading)}
                    >
                        {loading
                            ? 'Submitting...'
                            : imagePreviews.some(i => i.uploading)
                                ? 'Uploading...'
                                : 'Finalize Submission'}
                    </Button>
                    <button type="button" onClick={() => setStep(3)} className="w-full pt-3 text-sm text-text-tertiary hover:text-text-primary font-medium flex items-center justify-center gap-1 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Images
                    </button>
                </Card>
            )}

            {step === 5 && (
                <Card className="text-center">
                    <div className="text-5xl mb-3">🎉</div>
                    <h2 className="text-2xl font-bold text-text-primary mb-1">Blog Submitted!</h2>
                    <p className="text-text-secondary text-sm mb-6">Pending admin review. You'll get an email once approved.</p>
                    <Button variant="secondary" onClick={() => { setStep(1); setFormData(emptyForm); setImagePreviews([]); setOtp(''); }}>
                        Submit Another
                    </Button>
                </Card>
            )}
        </div>
    );
};
