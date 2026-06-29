import React, { useState, useEffect, useMemo } from 'react';
import { Send, Edit3, Check } from 'lucide-react';
import { demoApi } from '../api/demoApi';
import { ApiError } from '../api/runtimeApiBase';
import toast from 'react-hot-toast';

interface FormData {
  studentName: string;
  parentName: string;
  grade: string;
  board: string;
  email: string;
  mobileNumber: string;
  preferredDate: string;
  preferredTime: string;
}

interface FormErrors {
  studentName?: string;
  parentName?: string;
  grade?: string;
  board?: string;
  email?: string;
  mobileNumber?: string;
  preferredDate?: string;
  preferredTime?: string;
  otp?: string;
}

interface Grade {
  id: string;
  name: string;
  displayName: string;
}

interface Board {
  id: string;
  name: string;
  displayName: string;
}

interface DemoFormProps {
  onSuccess?: () => void;
}

const validateField = (name: string, value: string, formData?: FormData): string | undefined => {
  switch (name) {
    case 'studentName':
      if (!value.trim()) return 'Student name is required.';
      if (value.trim().length < 2) return 'Student name must be at least 2 characters.';
      if (/\d/.test(value.trim())) return 'Student name should not contain numbers.';
      return undefined;
    case 'parentName':
      if (!value.trim()) return 'Parent name is required.';
      if (value.trim().length < 2) return 'Parent name must be at least 2 characters.';
      if (/\d/.test(value.trim())) return 'Parent name should not contain numbers.';
      return undefined;
    case 'grade':
      if (!value) return 'Please select a grade.';
      return undefined;
    case 'board':
      if (!value) return 'Please select a board.';
      return undefined;
    case 'preferredDate':
      if (!value) return 'Preferred date is required.';
      if (value < new Date().toISOString().split('T')[0]) return 'Date cannot be in the past.';
      return undefined;
    case 'preferredTime':
      if (!value) return 'Preferred time is required.';
      if (formData?.preferredDate === new Date().toISOString().split('T')[0]) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [hours, minutes] = value.split(':').map(Number);
        const selectedMinutes = hours * 60 + minutes;
        if (selectedMinutes <= currentMinutes) return 'Time cannot be in the past. Please select a future time.';
      }
      return undefined;
    case 'mobileNumber': {
      const digits = value.replace(/\D/g, '');
      if (!digits) return 'Mobile number is required.';
      if (digits.length !== 10) return 'Mobile number must be exactly 10 digits.';
      if (!/^\d{10}$/.test(digits)) return 'Enter a valid 10-digit mobile number.';
      return undefined;
    }
    case 'email': {
      const trimmed = value.trim();
      if (!trimmed) return 'Email is required.';
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) return 'Please enter a valid email address.';
      return undefined;
    }
    default:
      return undefined;
  }
};

const validateForm = (data: FormData): FormErrors => {
  const errors: FormErrors = {};
  const fields: (keyof FormData)[] = ['studentName', 'parentName', 'grade', 'board', 'preferredDate', 'preferredTime', 'mobileNumber', 'email'];
  fields.forEach(field => {
    const err = validateField(field, data[field], data);
    if (err) errors[field] = err;
  });
  return errors;
};

const DemoForm: React.FC<DemoFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    studentName: '',
    parentName: '',
    grade: '',
    board: '',
    email: '',
    mobileNumber: '',
    preferredDate: '',
    preferredTime: ''
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [grades, setGrades] = useState<Grade[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [consent, setConsent] = useState(false);

  const preOtpErrors = useMemo(() => {
    const errs = validateForm(formData);
    return Object.keys(errs).length > 0 ? errs : null;
  }, [formData]);

  const isPreOtpValid = useMemo(() => preOtpErrors === null, [preOtpErrors]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const err = validateField(name, value, formData);
    setFormErrors(prev => {
      const next = { ...prev };
      if (err) next[name as keyof FormErrors] = err;
      else delete next[name as keyof FormErrors];
      return next;
    });
  };

  // Reset form to initial empty state
  const resetForm = () => {
    setFormData({
      studentName: '',
      parentName: '',
      grade: '',
      board: '',
      email: '',
      mobileNumber: '',
      preferredDate: '',
      preferredTime: ''
    });
    setOtpStep(false);
    setOtp('');
    setIsOtpVerified(false);
    setIsSubmitted(false);
    setConsent(false);
  };

  // Load grades and boards on component mount
  useEffect(() => {
    const loadSettings = async () => {
      // Clear old storage keys to ensure new IDs are picked up
      localStorage.removeItem('icfy_demo_grades');
      localStorage.removeItem('icfy_demo_boards');
      localStorage.removeItem('icfy_demo_grades_v2');
      localStorage.removeItem('icfy_demo_boards_v2');
      localStorage.removeItem('icfy_demo_grades_v3');
      localStorage.removeItem('icfy_demo_boards_v3');

      const fallbackGrades: Grade[] = [
        { id: "69f59c3b7fba777198d8f380", name: "Grade 8", displayName: "Grade 8" },
        { id: "69f59c3b7fba777198d8f381", name: "Grade 9", displayName: "Grade 9" },
        { id: "69f59c3b7fba777198d8f382", name: "Grade 10", displayName: "Grade 10" },
        { id: "69f59c3b7fba777198d8f383", name: "Grade 11", displayName: "Grade 11" },
        { id: "69f59c3b7fba777198d8f384", name: "Grade 12", displayName: "Grade 12" }
      ];
      const fallbackBoards: Board[] = [
        { id: "69f59c3b7fba777198d8f379", name: "AS level and A level", displayName: "AS level and A level" },
        { id: "69f59c3b7fba777198d8f37b", name: "IGCSE", displayName: "IGCSE" }
      ];

      try {
        const [gradesResult, boardsResult] = await Promise.allSettled([
          demoApi.getGrades(),
          demoApi.getBoards()
        ]);

        function extractItems<T extends { displayName?: string; name: string }>(value: unknown, fallback: T[]): T[] {
          if (Array.isArray(value)) return value as T[];
          if (value && typeof value === 'object' && 'data' in value) {
            const d = (value as Record<string, unknown>).data;
            if (Array.isArray(d)) return d as T[];
          }
          return fallback;
        }

        const gradesData = extractItems(gradesResult.status === 'fulfilled' ? gradesResult.value : null, fallbackGrades)
          .map(g => ({ ...g, displayName: g.displayName || g.name }));

        const boardsData = extractItems(boardsResult.status === 'fulfilled' ? boardsResult.value : null, fallbackBoards)
          .map(b => ({ ...b, displayName: b.displayName || b.name }));

        setGrades(gradesData);
        setBoards(boardsData);

        if (gradesResult.status === 'rejected' || boardsResult.status === 'rejected') {
          console.warn('Demo form settings loaded with fallback data:', {
            gradesError: gradesResult.status === 'rejected' ? gradesResult.reason : null,
            boardsError: boardsResult.status === 'rejected' ? boardsResult.reason : null
          });
        }
      } catch (error) {
        console.error('Failed to load demo settings:', error);
        setGrades(fallbackGrades);
        setBoards(fallbackBoards);
        toast.error('Failed to load form options. Using local defaults.');
      } finally {
        setLoadingGrades(false);
        setLoadingBoards(false);
      }
    };

    loadSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    setFormErrors(prev => {
      const next = { ...prev };
      delete next[name as keyof FormErrors];
      return next;
    });

    if (name === 'email' || name === 'mobileNumber') {
      setIsOtpVerified(false);
      setOtpStep(false);
      setOtp('');
    }
  };

  const handleSendOtp = async (isResend = false) => {
    const allErrors = validateForm(formData);
    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      const firstError = Object.values(allErrors).find(Boolean);
      if (firstError) toast.error(firstError);
      return;
    }

    setOtpTimer(300); // 5 minutes

    setLoading(true);
    try {
      const response = await demoApi.sendDemoOtp(formData.email, isResend);
      // Request succeeded, show OTP field
      setOtpStep(true);
      setIsOtpVerified(false);
      const successMsg = response?.message || '✅ OTP sent successfully! Please check your email.';
      toast.success(successMsg);

      // Start timer
      const timer = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('OTP send error:', error);
      let errorMsg = 'Failed to send OTP. Please try again later.';
      if (error instanceof ApiError) {
        const data = error.response?.data as Record<string, unknown> | undefined;
        const rawMsg = data?.message && typeof data.message === 'string' ? data.message.toLowerCase() : '';
        if (rawMsg.includes('already') || rawMsg.includes('registered') || rawMsg.includes('exist')) {
          errorMsg = 'This email is already registered. Please use a different email or login.';
        } else if (rawMsg.includes('too many') || rawMsg.includes('rate limit') || error.response?.status === 429) {
          errorMsg = 'Too many requests. Please wait before trying again.';
        }
      }
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpStep) {
      toast.error('Please request an OTP first');
      return;
    }

    if (!consent) {
      toast.error('Please agree to be contacted for demo scheduling');
      return;
    }

    if (!otp || otp.length !== 6) {
      setOtpError('Please enter the 6-digit OTP sent to your email');
      toast.error('Please enter the 6-digit OTP sent to your email');
      return;
    }
    setOtpError('');

    setLoading(true);

    try {
      const demoRequest = {
        studentName: formData.studentName,
        parentName: formData.parentName,
        gradeId: String(formData.grade),
        boardId: String(formData.board),
        emailId: formData.email,
        mobileNumber: formData.mobileNumber,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        otp: otp,
        scheduledAt: `${formData.preferredDate}T${formData.preferredTime}:00`
      };

      await demoApi.scheduleDemo(demoRequest);

      setOtpStep(false);
      setOtp('');
      toast.success('✅ Demo scheduled successfully!');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Demo scheduling error:', error);
      const errorMsg = 'Failed to schedule demo. Please check your OTP and try again.';
      let otpMsg: string | null = null;
      if (error instanceof ApiError) {
        const data = error.response?.data as Record<string, unknown> | undefined;
        const rawMsg = data?.message && typeof data.message === 'string' ? data.message.toLowerCase() : '';
        if (rawMsg.includes('invalid') && rawMsg.includes('otp')) {
          otpMsg = 'The OTP you entered is incorrect. Please try again.';
        } else if (rawMsg.includes('expired')) {
          otpMsg = 'This OTP has expired. Please request a new one.';
        } else if (rawMsg.includes('otp')) {
          otpMsg = 'Invalid OTP. Please check and try again.';
        }
        if (otpMsg) {
          setOtpError(otpMsg);
          toast.error(`❌ ${otpMsg}`);
        } else {
          toast.error(`❌ ${errorMsg}`);
        }
      } else {
        toast.error(`❌ ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="demo-form max-w-md mt-10 mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 relative">
        {isSubmitted && (
          <div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center z-10 animate-in fade-in duration-200">
            <div className="text-center bg-white rounded-xl shadow-lg border border-gray-100 px-6 py-6 max-w-[220px] w-full">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-5 h-5 text-green-600" strokeWidth={3} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-0.5">Thank You!</h3>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">Your demo has been scheduled. Our team will contact you shortly.</p>
              <button type="button" onClick={() => { resetForm(); onSuccess?.(); }}
                className="px-5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-all active:scale-95">
                OK
              </button>
            </div>
          </div>
        )}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Schedule Your Free Demo</h3>
          <p className="text-gray-600">Experience our teaching methodology with a personalized demo class</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student Name *
            </label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${formErrors.studentName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter student's full name"
            />
            {formErrors.studentName && <p className="text-red-500 text-xs mt-1">{formErrors.studentName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Name *
            </label>
            <input
              type="text"
              name="parentName"
              value={formData.parentName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${formErrors.parentName ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter parent's full name"
            />
            {formErrors.parentName && <p className="text-red-500 text-xs mt-1">{formErrors.parentName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade *
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                disabled={loadingGrades || otpStep || isOtpVerified}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 ${formErrors.grade ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">
                  {loadingGrades ? 'Loading grades...' : 'Select Grade'}
                </option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>
                    {grade.displayName || grade.name}
                  </option>
                ))}
              </select>
              {formErrors.grade && <p className="text-red-500 text-xs mt-1">{formErrors.grade}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Board *
              </label>
              <select
                name="board"
                value={formData.board}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                disabled={loadingBoards || otpStep || isOtpVerified}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 ${formErrors.board ? 'border-red-500' : 'border-gray-300'}`}
              >
                <option value="">
                  {loadingBoards ? 'Loading boards...' : 'Select Board'}
                </option>
                {boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.displayName || board.name}
                  </option>
                ))}
              </select>
              {formErrors.board && <p className="text-red-500 text-xs mt-1">{formErrors.board}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Date *
              </label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                disabled={otpStep || isOtpVerified}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${formErrors.preferredDate ? 'border-red-500' : 'border-gray-300'} ${(otpStep || isOtpVerified) ? 'bg-gray-100' : ''}`}
              />
              {formErrors.preferredDate && <p className="text-red-500 text-xs mt-1">{formErrors.preferredDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Time *
              </label>
              <input
                type="time"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                disabled={otpStep || isOtpVerified}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${formErrors.preferredTime ? 'border-red-500' : 'border-gray-300'} ${(otpStep || isOtpVerified) ? 'bg-gray-100' : ''}`}
              />
              {formErrors.preferredTime && <p className="text-red-500 text-xs mt-1">{formErrors.preferredTime}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData(prev => ({ ...prev, mobileNumber: val }));
                setFormErrors(prev => { const next = { ...prev }; delete next.mobileNumber; return next; });
                setIsOtpVerified(false);
                setOtpStep(false);
              }}
              onBlur={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                const err = validateField('mobileNumber', val);
                setFormErrors(prev => {
                  const next = { ...prev };
                  if (err) next.mobileNumber = err;
                  else delete next.mobileNumber;
                  return next;
                });
              }}
              required
              placeholder="Enter 10-digit mobile number"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${formErrors.mobileNumber ? 'border-red-500' : 'border-gray-300'}`}
              maxLength={10}
              disabled={otpStep || isOtpVerified}
            />
            {formErrors.mobileNumber && <p className="text-red-500 text-xs mt-1">{formErrors.mobileNumber}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email ID *
            </label>
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1 min-w-0">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  required
                  disabled={otpStep}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${formErrors.email ? 'border-red-500' : 'border-gray-300'} ${otpStep ? 'bg-gray-100' : ''}`}
                  placeholder="student@email.com"
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>
              {!otpStep && (
                <button
                  type="button"
                  onClick={() => handleSendOtp(false)}
                  disabled={loading || !isPreOtpValid}
                  className="w-full sm:w-auto h-12 px-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              )}
            </div>
          </div>

          {otpStep && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-inner">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-blue-800">
                    Enter 6-Digit OTP sent to your email *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(false);
                      setOtp('');
                      setOtpError('');
                    }}
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> Edit Details
                  </button>
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) { setOtp(val); setOtpError(''); }
                  }}
                  onBlur={() => {
                    if (otp.length > 0 && otp.length !== 6) {
                      setOtpError('OTP must be exactly 6 digits.');
                    }
                  }}
                  maxLength={6}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center text-xl tracking-widest font-bold ${otpError ? 'border-red-400' : 'border-blue-300'}`}
                  placeholder="000000"
                  inputMode="numeric"
                />
                {otpError && <p className="text-red-500 text-xs mt-1">{otpError}</p>}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-blue-600">
                        {otpTimer > 0 ? (
                          <>Resend available in <span className="font-bold">{formatTime(otpTimer)}</span></>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSendOtp(true)}
                            disabled={loading}
                            className="text-blue-700 font-bold hover:underline disabled:opacity-50 flex items-center gap-1"
                          >
                            <Send size={12} /> Resend OTP
                          </button>
                        )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 pt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    required
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-600">
                    I agree to be contacted via phone, WhatsApp, and email for demo scheduling and course information.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !otp || otp.length !== 6 || !isPreOtpValid || !consent}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 rounded-lg font-black text-sm hover:from-blue-700 hover:to-blue-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 uppercase tracking-widest shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Schedule Free Demo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>100% secure & spam-free</span>
          </div>
        </div>
      </div>
  );
};

export default DemoForm;