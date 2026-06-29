import api from './api';

const FORCE_LOCAL_AUTH = String(import.meta.env.VITE_USE_LOCAL_AUTH_API || '').toLowerCase() === 'true';
const USE_LOCAL_MODE = FORCE_LOCAL_AUTH;

const LOCAL_USERS_KEY = 'icfy_local_users';
const LOCAL_PENDING_KEY = 'icfy_local_pending_user';

const ADMIN_AUTH_BASE_URL = '/api/admin/auth';
const USER_AUTH_BASE_URL = '/api/auth';

function getLocalUsers() {
    try {
        return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
    } catch { return []; }
}

function saveLocalUsers(users) {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function generateToken() {
    return 'local_token_' + Date.now() + '_' + Math.random().toString(36).slice(2);
}

/**
 * User Journey (OTP Login)
 */

// Step 1: Request OTP
export const requestUserOTP = async (email, isResend = false) => {
    if (USE_LOCAL_MODE) {
        // Store the email as pending OTP verification
        localStorage.setItem(LOCAL_PENDING_KEY, JSON.stringify({ email, otp: '123456', createdAt: Date.now() }));
        // Log OTP for development
        console.log(`[LOCAL AUTH] OTP for ${email}: 123456`);
        return {
            success: true,
            message: isResend ? 'OTP resent. Check your email (local: use 123456).' : 'OTP sent to your email (local: use 123456).',
            otpSent: true
        };
    }
    try {
        const response = await api.post(`${USER_AUTH_BASE_URL}/start`, { email, resend: isResend });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Step 2: Verify OTP & Get Token
export const verifyUserOTP = async (data) => {
    if (USE_LOCAL_MODE) {
        const pending = JSON.parse(localStorage.getItem(LOCAL_PENDING_KEY) || 'null');
        if (!pending || pending.email !== data.email) {
            throw { status: 400, message: 'No OTP was requested for this email.' };
        }
        if (data.otp !== '123456') {
            throw { status: 400, message: 'Invalid OTP. In local mode, use 123456.' };
        }

        // Check if user already exists
        const users = getLocalUsers();
        let user = users.find(u => u.email === data.email);

        if (!user) {
            // Create new user
            user = {
                id: 'user_' + Date.now(),
                name: data.name || data.email.split('@')[0],
                email: data.email,
                phone: data.mobile || '',
                role: 'student',
                createdAt: new Date().toISOString()
            };
            users.push(user);
            saveLocalUsers(users);
        }

        const token = generateToken();
        localStorage.setItem('icfy_token', token);
        localStorage.setItem('icfy_user', JSON.stringify(user));
        localStorage.removeItem(LOCAL_PENDING_KEY);
        return { token, user, success: true, message: 'OTP verified successfully.' };
    }
    try {
        const response = await api.post(`${USER_AUTH_BASE_URL}/verify`, data);
        if (response.data.token) {
            localStorage.setItem('icfy_token', response.data.token);
            localStorage.setItem('icfy_user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        const data = error.response?.data;
        throw data && typeof data === 'object' ? data : { message: 'Invalid OTP. Please try again.' };
    }
};

/**
 * User Journey (Email/Password)
 */

// User Login with Password
export const loginWithPassword = async (email, password) => {
    if (USE_LOCAL_MODE) {
        const users = getLocalUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) {
            // For local mode, also accept any email with password "password123"
            if (password === 'password123') {
                const newUser = {
                    id: 'user_' + Date.now(),
                    name: email.split('@')[0],
                    email,
                    phone: '',
                    role: 'student',
                    createdAt: new Date().toISOString()
                };
                const token = generateToken();
                localStorage.setItem('icfy_token', token);
                localStorage.setItem('icfy_user', JSON.stringify(newUser));
                return { token, user: newUser, success: true };
            }
            throw { status: 401, message: 'Invalid email or password.' };
        }
        const token = generateToken();
        localStorage.setItem('icfy_token', token);
        localStorage.setItem('icfy_user', JSON.stringify(user));
        return { token, user, success: true };
    }
    try {
        const response = await api.post(`${USER_AUTH_BASE_URL}/login-password`, { email, password });
        if (response.data.token) {
            localStorage.setItem('icfy_token', response.data.token);
            localStorage.setItem('icfy_user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// User Forgot Password (Request OTP)
export const userForgotPassword = async (email) => {
    if (USE_LOCAL_MODE) {
        const users = getLocalUsers();
        const user = users.find(u => u.email === email);
        if (!user) {
            throw { status: 404, message: 'No account found with this email.' };
        }
        localStorage.setItem(LOCAL_PENDING_KEY, JSON.stringify({ email, otp: '123456', type: 'reset', createdAt: Date.now() }));
        console.log(`[LOCAL AUTH] Reset OTP for ${email}: 123456`);
        return { success: true, message: 'OTP sent to your email (local: use 123456).' };
    }
    try {
        const response = await api.post(`${USER_AUTH_BASE_URL}/forgot-password`, { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// User Reset Password
export const userResetPassword = async (data) => {
    if (USE_LOCAL_MODE) {
        const pending = JSON.parse(localStorage.getItem(LOCAL_PENDING_KEY) || 'null');
        if (!pending || pending.email !== data.email || pending.type !== 'reset') {
            throw { status: 400, message: 'No reset OTP was requested for this email.' };
        }
        if (data.otp !== '123456') {
            throw { status: 400, message: 'Invalid OTP.' };
        }
        const users = getLocalUsers();
        const index = users.findIndex(u => u.email === data.email);
        if (index === -1) {
            throw { status: 404, message: 'User not found.' };
        }
        users[index].password = data.newPassword;
        saveLocalUsers(users);
        localStorage.removeItem(LOCAL_PENDING_KEY);
        return { success: true, message: 'Password reset successfully.' };
    }
    try {
        const response = await api.post(`${USER_AUTH_BASE_URL}/reset-password`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Admin Journey (Email/Password)
 */

// Admin Login
export const adminLogin = async (email, password) => {
    if (USE_LOCAL_MODE) {
        if (email === 'admin@astarclasses.com' && password === 'admin123') {
            const adminUser = { id: 'admin_1', name: 'Administrator', email, role: 'admin' };
            const token = generateToken();
            localStorage.setItem('icfy_token', token);
            localStorage.setItem('icfy_user', JSON.stringify(adminUser));
            localStorage.setItem('icfy_role', 'admin');
            localStorage.setItem('adminAuth', 'true');
            return { token, user: adminUser, email };
        }
        throw { status: 401, message: 'Invalid admin credentials. Use admin@astarclasses.com / admin123.' };
    }
    try {
        const response = await api.post(`${ADMIN_AUTH_BASE_URL}/login`, { email, password });
        const body = response.data;
        const token = body.token || body.accessToken || body.jwt || body.data?.token || body.data?.accessToken;
        const user = body.user || body.data?.user || body.admin || body.data?.admin;
        if (token) {
            localStorage.setItem('icfy_token', token);
            localStorage.setItem('icfy_user', JSON.stringify(user || { id: 'admin', name: 'Administrator', email }));
            localStorage.setItem('icfy_role', 'admin');
            localStorage.setItem('adminAuth', 'true');
            return { token, user, email };
        }
        return body;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Admin Login OTP (Request)
export const requestAdminLoginOTP = async (email) => {
    if (USE_LOCAL_MODE) {
        console.log(`[LOCAL AUTH] Admin OTP for ${email}: 123456`);
        return { success: true, message: 'OTP sent to admin email (local: use 123456).' };
    }
    try {
        const response = await api.post(`${ADMIN_AUTH_BASE_URL}/login-otp/request`, { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Admin Login OTP (Verify)
export const verifyAdminLoginOTP = async (data) => {
    if (USE_LOCAL_MODE) {
        if (data.otp !== '123456') {
            throw { status: 400, message: 'Invalid OTP.' };
        }
        const adminUser = { id: 'admin_1', name: 'Administrator', email: data.email, role: 'admin' };
        const token = generateToken();
        localStorage.setItem('icfy_token', token);
        localStorage.setItem('icfy_user', JSON.stringify(adminUser));
        localStorage.setItem('icfy_role', 'admin');
        localStorage.setItem('adminAuth', 'true');
        return { token, user: adminUser, success: true };
    }
    try {
        const response = await api.post(`${ADMIN_AUTH_BASE_URL}/login-otp/verify`, data);
        if (response.data.token) {
            localStorage.setItem('icfy_token', response.data.token);
            localStorage.setItem('icfy_user', JSON.stringify(response.data.user));
            localStorage.setItem('icfy_role', 'admin');
            localStorage.setItem('adminAuth', 'true');
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Admin Forgot Password (Request OTP)
export const adminForgotPassword = async (email) => {
    if (USE_LOCAL_MODE) {
        console.log(`[LOCAL AUTH] Admin reset OTP for ${email}: 123456`);
        localStorage.setItem(LOCAL_PENDING_KEY, JSON.stringify({ email, otp: '123456', type: 'admin_reset', createdAt: Date.now() }));
        return { success: true, message: 'OTP sent to admin email (local: use 123456).' };
    }
    try {
        const response = await api.post(`${ADMIN_AUTH_BASE_URL}/forgot-password`, { email });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

// Admin Reset Password
export const adminResetPassword = async (data) => {
    if (USE_LOCAL_MODE) {
        const pending = JSON.parse(localStorage.getItem(LOCAL_PENDING_KEY) || 'null');
        if (!pending || pending.email !== data.email || !pending.type?.startsWith('admin_reset')) {
            throw { status: 400, message: 'No admin reset OTP was requested for this email.' };
        }
        if (data.otp !== '123456') {
            throw { status: 400, message: 'Invalid OTP.' };
        }
        localStorage.removeItem(LOCAL_PENDING_KEY);
        return { success: true, message: 'Admin password reset successfully.' };
    }
    try {
        const response = await api.post(`${ADMIN_AUTH_BASE_URL}/reset-password`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const logout = () => {
    localStorage.removeItem('icfy_token');
    localStorage.removeItem('icfy_user');
    localStorage.removeItem('icfy_role');
    localStorage.removeItem('adminAuth');
};
