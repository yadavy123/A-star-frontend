import React, { useState, useEffect } from 'react';
import { askApi } from '../api/askApi';
import toast from 'react-hot-toast';

type LeadFormProps = {
    onSuccess?: () => void;
};

const GRADE_OPTIONS = [
    { value: 'primary', label: 'Primary (Grades 1-5)' },
    { value: 'lower-secondary', label: 'Lower Secondary (Grades 6-8)' },
    { value: 'igcse', label: 'IGCSE (Grades 9-10)' },
    { value: 'as-level', label: 'AS Level (Grade 11)' },
    { value: 'a-level', label: 'A Level (Grade 12)' },
];

const LeadForm: React.FC<LeadFormProps> = ({ onSuccess }) => {
    const [fullName, setFullName] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [grade, setGrade] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpTimer, setOtpTimer] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (otpTimer > 0) {
            interval = setInterval(() => {
                setOtpTimer(prev => {
                    if (prev <= 1) { clearInterval(interval); return 0; }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!fullName.trim()) errs.fullName = 'Full name is required.';
        const digits = mobileNumber.replace(/\D/g, '');
        if (!digits) errs.mobileNumber = 'Please enter a valid mobile number.';
        else if (digits.length !== 10) errs.mobileNumber = 'Please enter a valid mobile number.';
        else if (!/^\d{10}$/.test(digits)) errs.mobileNumber = 'Please enter a valid mobile number.';
        if (!email.trim()) errs.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Please enter a valid email address.';
        if (!grade) errs.grade = 'Please select a grade.';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSendOtp = async () => {
        const e = email.trim();
        if (!e) {
            setErrors(prev => ({ ...prev, email: 'Please enter your email address to receive OTP.' }));
            toast.error('Please enter your email address to receive OTP.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
            setErrors(prev => ({ ...prev, email: 'Please enter a valid email address.' }));
            toast.error('Please enter a valid email address.');
            return;
        }
        setErrors(prev => { const n = { ...prev }; delete n.email; return n; });
        setLoading(true);
        try {
            await askApi.sendLeadOtp(e);
            setOtpSent(true);
            setOtpTimer(300);
            toast.success('OTP sent to your email!');
        } catch {
            toast.error('Unable to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getOtpErrorMessage = (backendMsg: string): string => {
        const lower = backendMsg.toLowerCase();
        if (lower.includes('expired')) return 'OTP has expired. Please resend OTP.';
        if (lower.includes('invalid')) return 'The OTP entered is incorrect. Please try again.';
        if (lower.includes('not found') || lower.includes('no account')) return 'Please verify your mobile number before proceeding.';
        return backendMsg || 'Failed to submit. Please try again.';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        const otpValue = otp.trim();
        if (!otpValue) {
            toast.error('Please enter the OTP.');
            return;
        }

        setLoading(true);
        try {
            const digits = mobileNumber.replace(/\D/g, '');
            await askApi.submitLead({ name: fullName.trim(), mobile: digits, email: email.trim(), grade, otp: otpValue });
            toast.success('Mobile number verified successfully!');
            toast.success('Details submitted successfully! Our team will contact you soon.');
            onSuccess?.();
        } catch (error) {
            const err = error as { status?: number; message?: string; response?: { data?: { message?: string } } };
            const msg = err?.response?.data?.message || err?.message || 'Failed to submit. Please try again.';
            const displayMsg = getOtpErrorMessage(msg);
            if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
                setOtpSent(false);
                setOtpTimer(0);
                setOtp('');
            }
            toast.error(displayMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Details</h2>
                <p className="text-sm text-gray-600">You've used all free questions. Share your details so our team can assist you further.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter your full name" />
                    {errors.fullName && <p className="text-red-500 text-xs mt-0.5">{errors.fullName}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
                    <input type="tel" value={mobileNumber} maxLength={10}
                        onChange={e => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.mobileNumber ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter 10-digit mobile number" />
                    {errors.mobileNumber && <p className="text-red-500 text-xs mt-0.5">{errors.mobileNumber}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            className={`flex-1 px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Enter your email address" disabled={otpSent} />
                        {!otpSent && (
                            <button type="button" onClick={handleSendOtp} disabled={loading}
                                className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 whitespace-nowrap">
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                        )}
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email}</p>}

                    {otpSent && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-700 mb-2">OTP sent to {email}. Valid for 5 minutes.</p>
                            <input type="text" value={otp} maxLength={6}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className={`w-full px-3 py-2 border rounded-lg text-sm text-center tracking-widest font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.otp ? 'border-red-500' : 'border-blue-300'}`}
                                placeholder="Enter OTP" inputMode="numeric" />
                            {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
                            <div className="mt-2 text-center">
                                {otpTimer > 0 ? (
                                    <span className="text-xs text-gray-500">Resend OTP in <span className="font-bold text-indigo-600">{formatTime(otpTimer)}</span></span>
                                ) : (
                                    <button type="button" onClick={handleSendOtp} disabled={loading}
                                        className="text-xs font-semibold text-indigo-600 hover:underline">
                                        Resend OTP
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade <span className="text-red-500">*</span></label>
                    <select value={grade} onChange={e => setGrade(e.target.value)}
                        className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.grade ? 'border-red-500' : 'border-gray-300'}`}>
                        <option value="">Select grade</option>
                        {GRADE_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                    {errors.grade && <p className="text-red-500 text-xs mt-0.5">{errors.grade}</p>}
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button type="submit" disabled={loading}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-bold rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all disabled:opacity-50 shadow-md">
                        {loading ? 'Submitting...' : 'Submit Details'}
                    </button>
                    <a href="https://wa.me/918073982848" target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 transition-all">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371 0-.57 0-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.75 5.404 2.177 7.707l-2.313 6.256 6.514-2.286c2.25 1.238 4.761 1.889 7.368 1.889 5.431 0 9.856-4.413 9.878-9.846 0-2.6-.555-5.15-1.604-7.563-1.048-2.413-2.585-4.583-4.487-6.38-1.901-1.797-4.124-3.207-6.507-4.082-2.383-.876-4.902-1.322-7.2-1.293z" />
                        </svg>
                        WhatsApp
                    </a>
                </div>
            </form>
        </div>
    );
};

export default LeadForm;
