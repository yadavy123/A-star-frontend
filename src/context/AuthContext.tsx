import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { adminLogin as apiAdminLogin, loginWithPassword as apiUserLogin, requestUserOTP, verifyUserOTP, logout as apiLogout } from '../api/api/authApi.js';
import { getMe, changePassword as apiChangePassword } from '../api/api/accountApi.js';

type User = {
    id: string;
    adminId?: string;
    fullName: string;
    email: string;
    phone?: string;
    role: 'admin' | 'student';
};

type AuthResult = {
    success: boolean;
    message?: string;
    isAdmin?: boolean;
};

type AuthContextValue = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<AuthResult>;
    logout: () => void;
    requestOtp: (email: string, isResend?: boolean) => Promise<{ success: boolean; message: string }>;
    verifyOtp: (email: string, otp: string, name?: string, mobile?: string) => Promise<AuthResult>;
    changePassword: (data: { oldPassword?: string; newPassword: string }) => Promise<{ success: boolean; message: string }>;
};

function sanitizeOtpMessage(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('invalid') && (lower.includes('otp') || lower.includes('code'))) return 'The OTP you entered is incorrect. Please try again.';
  if (lower.includes('expired')) return 'This OTP has expired. Please request a new one.';
  if (lower.includes('no otp') || lower.includes('not requested')) return 'No OTP was requested for this email. Please request one first.';
  if (lower.includes('too many') || lower.includes('rate limit')) return 'Too many attempts. Please wait before trying again.';
  if (lower.includes('already') && lower.includes('regist')) return 'This email is already registered. Please log in instead.';
  if (lower.includes('not found') || lower.includes('no account')) return 'No account found with this email.';
  if (lower.includes('network') || lower.includes('econnrefused') || lower.includes('timeout')) return 'Unable to connect. Please check your internet connection.';
  return 'Something went wrong. Please try again later.';
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USER_STORAGE_KEY = 'icfy_user';
const TOKEN_STORAGE_KEY = 'icfy_token';
const ROLE_STORAGE_KEY = 'icfy_role';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
            toast.error('Session expired. Please log in again.');
        };
        window.addEventListener('auth:unauthorized', handleUnauthorized);

        const init = async () => {
            try {
                const storedUser = localStorage.getItem(USER_STORAGE_KEY);
                const storedRole = localStorage.getItem(ROLE_STORAGE_KEY) as User['role'] | null;
                const token = localStorage.getItem(TOKEN_STORAGE_KEY);

                if (storedUser && storedRole && token) {
                    if (storedRole === 'admin') {
                        try {
                            const account = await getMe();
                            if (account) {
                                const verifiedUser: User = {
                                    id: account.id,
                                    fullName: account.name || account.fullName,
                                    email: account.email,
                                    role: storedRole,
                                };
                                setUser(verifiedUser);
                                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(verifiedUser));
                                return;
                            }
                        } catch (err: unknown) {
                            const apiErr = err as { status?: number; message?: string; data?: { message?: string } };
                            const errMsg = apiErr?.data?.message || apiErr?.message || '';
                            // User deleted from backend — clear stale auth
                            if (apiErr.status === 404 && errMsg.includes('User not found')) {
                                localStorage.removeItem(USER_STORAGE_KEY);
                                localStorage.removeItem(TOKEN_STORAGE_KEY);
                                localStorage.removeItem(ROLE_STORAGE_KEY);
                                return;
                            }
                            // Server error — keep localStorage data, don't force logout
                        }
                    }
                    // Student or admin with API error — use stored data
                    const parsed = JSON.parse(storedUser) as Omit<User, 'role'>;
                    setUser({ ...parsed, role: storedRole });
                    return;
                }
            } catch {
                localStorage.removeItem(USER_STORAGE_KEY);
                localStorage.removeItem(TOKEN_STORAGE_KEY);
                localStorage.removeItem(ROLE_STORAGE_KEY);
            } finally {
                setIsLoading(false);
            }
        };
        init();
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

    const login = async (email: string, password: string): Promise<AuthResult> => {
        try {
            // Try admin login first, fall back to student login
            try {
                const result = await apiAdminLogin(email, password);
                if (result.token) {
                    localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
                    const adminUser: User = {
                        id: result.user?.id || 'admin-id',
                        fullName: result.user?.name || 'Administrator',
                        email: result.email || email,
                        role: 'admin',
                    };
                    setUser(adminUser);
                    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(adminUser));
                    localStorage.setItem(ROLE_STORAGE_KEY, 'admin');
                    return { success: true, isAdmin: true };
                }
                // Admin API returned success (no throw) but no token — check localStorage (api may have saved directly)
                if (localStorage.getItem(TOKEN_STORAGE_KEY) && localStorage.getItem(ROLE_STORAGE_KEY) === 'admin') {
                    const storedUser = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '{}');
                    setUser({ ...storedUser, role: 'admin' });
                    return { success: true, isAdmin: true };
                }
            } catch {
                const result = await apiUserLogin(email, password);
                if (result.token) {
                    localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
                    const userRecord = result.user || {};
                    const studentUser: User = {
                        id: userRecord.id || userRecord._id || 'user-id',
                        fullName: userRecord.name || userRecord.fullName || 'Student',
                        email: userRecord.email || email,
                        phone: userRecord.phone || userRecord.mobile || '',
                        role: 'student',
                    };
                    setUser(studentUser);
                    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(studentUser));
                    localStorage.setItem(ROLE_STORAGE_KEY, 'student');
                    return { success: true, isAdmin: false };
                }
                // Student API returned success (no throw) but no token — check localStorage
                if (localStorage.getItem(TOKEN_STORAGE_KEY) && localStorage.getItem(ROLE_STORAGE_KEY) === 'student') {
                    const storedUser = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '{}');
                    setUser({ ...storedUser, role: 'student' });
                    return { success: true, isAdmin: false };
                }
            }
            return { success: false, message: 'Invalid credentials' };
        } catch (error) {
            console.error('Login failed:', error);
            const apiError = error as { status?: number; message?: string };
            const rawMsg = apiError?.message || '';
            const msg = sanitizeOtpMessage(rawMsg) || 'Invalid email or password. Please check your credentials.';
            return { success: false, message: msg };
        }
    };

    const requestOtp = async (email: string, isResend: boolean = false) => {
        try {
            const result = await requestUserOTP(email, isResend);
            if (result.success === false) {
                const msg = result.message || 'Failed to send OTP. Please try again.';
                return { success: false, message: sanitizeOtpMessage(msg) };
            }
            return { success: true, message: result.message || 'OTP sent successfully' };
        } catch {
            return { success: false, message: 'Failed to send OTP. Please try again later.' };
        }
    };

    const verifyOtp = async (email: string, otp: string, name?: string, mobile?: string): Promise<AuthResult> => {
        try {
            const result = await verifyUserOTP({ email, otp, name, mobile });
            if (result.token) {
                // Ensure token is saved to localStorage (verifyUserOTP may also save it)
                localStorage.setItem(TOKEN_STORAGE_KEY, result.token);

                const userRecord = result.user || {};
                const studentUser: User = {
                    id: userRecord.id || userRecord._id || 'user-id',
                    fullName: userRecord.name || userRecord.fullName || name || 'Student',
                    email: userRecord.email || email,
                    phone: userRecord.phone || userRecord.mobile || mobile || '',
                    role: 'student',
                };
                setUser(studentUser);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(studentUser));
                localStorage.setItem(ROLE_STORAGE_KEY, 'student');
                return { success: true, isAdmin: false };
            }
            const msg = result.message || 'Invalid OTP. Please try again.';
            return { success: false, message: sanitizeOtpMessage(msg) };
        } catch (err) {
            const e = err as { message?: string; response?: { data?: { message?: string } } };
            const msg = e?.message || e?.response?.data?.message || 'OTP verification failed. Please try again.';
            return { success: false, message: msg };
        }
    };

    const changePassword = async (data: { oldPassword?: string; newPassword: string }): Promise<{ success: boolean; message: string }> => {
        try {
            await apiChangePassword(data);
            return { success: true, message: 'Password changed successfully' };
        } catch (error) {
            const err = error as { data?: { message?: string }; message?: string };
            return { success: false, message: err?.data?.message || err?.message || 'Failed to change password' };
        }
    };

    const logout = () => {
        apiLogout();
        setUser(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(ROLE_STORAGE_KEY);
        localStorage.removeItem('adminAuth');
        toast.success('Logged out successfully. See you again!');
    };

    const value = useMemo<AuthContextValue>(() => ({
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isAdmin: user?.role === 'admin',
        login,
        logout,
        requestOtp,
        verifyOtp,
        changePassword,
    }), [user, isLoading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
