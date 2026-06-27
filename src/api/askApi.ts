import { makeApiCall, ApiError, type QueryRecord } from './runtimeApiBase.ts';
import { LOCAL_GRADES, LOCAL_SUBJECTS } from '../data/askData';

const FORCE_LOCAL_ASK_API = String(import.meta.env.VITE_USE_LOCAL_ASK_API || '').toLowerCase() === 'true';
const USE_LOCAL_MODE = FORCE_LOCAL_ASK_API;

export type AskCategory = { id: string; name: string; slug?: string };

export type BackendGrade = { id: string; name: string; order: number };
export type BackendSubject = { id: string; name: string; gradeId: string; order: number };

type AskQuestion = {
    id: string;
    title: string;
    slug: string;
    descriptionHtml: string;
    grade?: BackendGrade | null;
    subject?: BackendSubject | null;
    attachments?: string[];
    status?: string;
    approvalStatus?: string;
    viewsCount: number;
    answersCount: number;
    adminId?: string;
    createdAt: string;
    updatedAt?: string;
};

export type AskPageResponse = {
    content: AskQuestion[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first?: boolean;
    last?: boolean;
};

type AnswerResponse = {
    id: string;
    questionId?: string;
    userId?: string;
    authorName: string;
    contentHtml: string;
    status: string;
    attachments?: string[];
    isCorrect?: boolean;
    createdAt: string;
    updatedAt?: string;
};

const FREE_QUESTIONS_KEY = 'astar_free_questions';

const STORAGE_KEY = 'astar_ask_questions_v2';

function readLocalQuestions(): AskQuestion[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? (JSON.parse(raw) as AskQuestion[]) : [];
    } catch {
        return [];
    }
}

function writeLocalQuestions(data: AskQuestion[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export const askApi = {
    // ----- Grades & Subjects -----
    async getGrades() {
        try {
            const data = await makeApiCall<BackendGrade[]>('GET', '/api/grades');
            return { data: Array.isArray(data) ? data : [] };
        } catch (error) {
            if (import.meta.env.DEV) return { data: LOCAL_GRADES as BackendGrade[] };
            throw error;
        }
    },

    async getSubjects(gradeId?: string) {
        try {
            const params = gradeId ? { gradeId } as Record<string, string> : undefined;
            const data = await makeApiCall<BackendSubject[]>('GET', '/api/subjects', undefined, params);
            return { data: Array.isArray(data) ? data : [] };
        } catch (error) {
            if (import.meta.env.DEV) {
                const all = LOCAL_SUBJECTS as BackendSubject[];
                return { data: gradeId ? all.filter(s => s.gradeId === gradeId) : all };
            }
            throw error;
        }
    },

    // ----- Questions -----
    async getAll(params?: QueryRecord) {
        if (USE_LOCAL_MODE) {
            return { data: { content: readLocalQuestions() } as AskPageResponse };
        }

        try {
            const data = await makeApiCall<AskPageResponse>('GET', '/api/questions', undefined, params);
            return { data };
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            if (import.meta.env.DEV) return { data: { content: readLocalQuestions(), totalPages: 0, totalElements: 0, number: 0, size: 10 } as AskPageResponse };
            throw error;
        }
    },

    async getById(id: string) {
        if (USE_LOCAL_MODE) {
            const q = readLocalQuestions().find(q => q.id === id);
            return { data: q };
        }
        try {
            const data = await makeApiCall<AskQuestion>('GET', `/api/questions/${id}`);
            return { data };
        } catch (error) {
            console.error('Failed to fetch question by ID:', error);
            throw error;
        }
    },

    async getBySlug(slug: string) {
        if (USE_LOCAL_MODE) {
            const q = readLocalQuestions().find(q => q.slug === slug);
            return { data: q };
        }
        try {
            const data = await makeApiCall<AskQuestion>('GET', `/api/questions/slug/${slug}`);
            return { data };
        } catch (error) {
            console.error('Failed to fetch question by slug:', error);
            throw error;
        }
    },

    async create(payload: Record<string, string>, role?: string) {
        if (USE_LOCAL_MODE) {
            const existing = readLocalQuestions();
            const next: AskQuestion = {
                id: `${Date.now()}`,
                title: payload.title,
                slug: payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
                descriptionHtml: payload.descriptionHtml,
                status: 'PENDING',
                approvalStatus: 'PENDING',
                viewsCount: 0,
                answersCount: 0,
                createdAt: new Date().toISOString(),
                grade: payload.gradeId ? { id: payload.gradeId, name: payload.gradeId, order: 0 } : null,
                subject: payload.subjectId ? { id: payload.subjectId, name: payload.subjectId, gradeId: '', order: 0 } : null,
            };
            const updated = [next, ...existing];
            writeLocalQuestions(updated);
            return { data: next };
        }

        const endpoint = role === 'admin' ? '/api/admin/questions' : '/api/user/questions';

        try {
            const data = await makeApiCall<AskQuestion>('POST', endpoint, {
                title: payload.title,
                descriptionHtml: payload.descriptionHtml,
                gradeId: payload.gradeId,
                subjectId: payload.subjectId,
                attachments: payload.attachments ? JSON.parse(payload.attachments) : undefined,
            });
            return { data };
        } catch (err: unknown) {
            const apiErr = err as { status?: number; message?: string };
            if (apiErr.status === 401) {
                throw new ApiError('Please log in to submit a question.', apiErr.status, null);
            }
            if (apiErr.status === 403) {
                throw new ApiError('You do not have permission to submit questions. Please contact support.', apiErr.status, null);
            }
            throw err;
        }
    },

    async update(id: string, payload: Record<string, string>) {
        if (USE_LOCAL_MODE) {
            const existing = readLocalQuestions();
            const updated = existing.map((item) => (item.id === id ? { ...item, ...payload } : item));
            writeLocalQuestions(updated);
            return { data: updated.find((item) => item.id === id) };
        }

        try {
            const data = await makeApiCall<AskQuestion>('PUT', `/api/admin/questions/${id}`, {
                title: payload.title,
                descriptionHtml: payload.descriptionHtml,
                gradeId: payload.gradeId,
                subjectId: payload.subjectId,
            });
            return { data };
        } catch (error) {
            console.error('Failed to update question:', error);
            throw error;
        }
    },

    async delete(id: string) {
        if (USE_LOCAL_MODE) {
            const existing = readLocalQuestions();
            const updated = existing.filter(q => q.id !== id);
            writeLocalQuestions(updated);
            return { success: true };
        }
        try {
            await makeApiCall('DELETE', `/api/admin/questions/${id}`);
            return { success: true };
        } catch (error) {
            console.error('Failed to delete question:', error);
            throw error;
        }
    },

    // ----- Answers -----
    async getAnswers(questionId: string) {
        try {
            const data = await makeApiCall<AnswerResponse[]>('GET', `/api/answers/question/${questionId}`);
            return { data };
        } catch (error) {
            console.error('Failed to fetch answers:', error);
            throw error;
        }
    },

    async submitAnswer(payload: { questionId: string; contentHtml: string }) {
        try {
            const data = await makeApiCall<AnswerResponse>('POST', '/api/answers', payload);
            return { data };
        } catch (err: unknown) {
            const apiErr = err as { status?: number; message?: string; response?: { data?: { message?: string } } };
            const msg = apiErr?.response?.data?.message || apiErr?.message || '';
            if (apiErr.status === 401 || apiErr.status === 403 || msg.includes('User not found')) {
                localStorage.removeItem('icfy_token');
                localStorage.removeItem('icfy_user');
                localStorage.removeItem('icfy_role');
                throw new ApiError('Your session has expired. Please log in again.', 401, null);
            }
            throw err;
        }
    },

    // ----- Categories (Public) -----
    async getCategories() {
        try {
            const data = await makeApiCall<AskCategory[]>('GET', '/api/categories');
            return { data };
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            throw error;
        }
    },

    async getCategoryById(id: string) {
        const data = await makeApiCall<AskCategory>('GET', `/api/categories/${id}`);
        return { data };
    },

    async getCategoryBySlug(slug: string) {
        const data = await makeApiCall<AskCategory>('GET', `/api/categories/slug/${slug}`);
        return { data };
    },

    // ----- Admin Answers -----
    async adminGetAnswers(params?: QueryRecord) {
        const data = await makeApiCall<AnswerResponse[]>('GET', '/api/admin/answers', undefined, params);
        return { data };
    },

    async approveAnswer(id: string) {
        const data = await makeApiCall<AnswerResponse>('PATCH', `/api/admin/answers/${id}/approve`);
        return { data };
    },

    async rejectAnswer(id: string, reason?: string) {
        const params = reason ? { reason } as QueryRecord : undefined;
        const data = await makeApiCall<AnswerResponse>('PATCH', `/api/admin/answers/${id}/reject`, undefined, params);
        return { data };
    },

    async deleteAnswer(id: string) {
        await makeApiCall('DELETE', `/api/admin/answers/${id}`);
        return { success: true };
    },

    async markAnswerCorrect(id: string) {
        const data = await makeApiCall<AnswerResponse>('PATCH', `/api/admin/answers/${id}/correct`);
        return { data };
    },

    // ----- Admin Categories -----
    async adminGetCategories() {
        const data = await makeApiCall<AskCategory[]>('GET', '/api/admin/categories');
        return { data };
    },

    async createCategory(name: string) {
        const data = await makeApiCall<AskCategory>('POST', '/api/admin/categories', { name });
        return { data };
    },

    async updateCategory(id: string, name: string) {
        const data = await makeApiCall<AskCategory>('PUT', `/api/admin/categories/${id}`, { name });
        return { data };
    },

    async deleteCategory(id: string) {
        await makeApiCall('DELETE', `/api/admin/categories/${id}`);
        return { success: true };
    },

    // ----- User Endpoints -----
    async getMyQuestions(params?: QueryRecord) {
        const data = await makeApiCall<AskPageResponse>('GET', '/api/user/questions/me', undefined, params);
        return { data };
    },

    async getMyAnswers(params?: QueryRecord) {
        const data = await makeApiCall<AskPageResponse>('GET', '/api/user/answers/me', undefined, params);
        return { data };
    },

    async submitAdminAnswer(payload: Record<string, string>) {
        const data = await makeApiCall<AnswerResponse>('POST', '/api/admin/answers', {
            questionId: payload.questionId,
            contentHtml: payload.contentHtml,
        });
        return { data };
    },

    // ----- Leads -----
    async submitLead(payload: { name: string; mobile: string; email: string; grade: string; otp: string }) {
        try {
            const data = await makeApiCall<{ success: boolean; message: string }>('POST', '/api/leads/submit', payload);
            return data;
        } catch (error) {
            console.error('Failed to submit lead:', error);
            throw error;
        }
    },

    async sendLeadOtp(email: string, resend = false) {
        try {
            const data = await makeApiCall<{ success: boolean; message: string }>('POST', '/api/leads/send-otp', { email, resend });
            return data;
        } catch (error) {
            console.error('Failed to send lead OTP:', error);
            throw error;
        }
    },

    // ----- File Upload (Minio for Ask module) -----
    async uploadFile(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('icfy_token');
        const baseUrl = typeof import.meta.env !== 'undefined'
            ? (import.meta.env.VITE_API_BASE_URL || 'https://api.astarclasses.com').replace(/\/$/, '')
            : 'https://api.astarclasses.com';

        const res = await fetch(`${baseUrl}/api/media/minio/upload`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData,
        });

        if (!res.ok) {
            const errText = await res.text().catch(() => 'Upload failed');
            throw new Error(errText);
        }

        const data = await res.json();
        return data.url as string;
    },

    // ----- Free Question Tracking -----
    getRemainingQuestions(userId: string): number {
        try {
            const raw = localStorage.getItem(FREE_QUESTIONS_KEY);
            const data: Record<string, number> = raw ? JSON.parse(raw) : {};
            const asked = data[userId] || 0;
            return Math.max(0, 3 - asked);
        } catch {
            return 3;
        }
    },

    markQuestionUsed(userId: string): void {
        try {
            const raw = localStorage.getItem(FREE_QUESTIONS_KEY);
            const data: Record<string, number> = raw ? JSON.parse(raw) : {};
            data[userId] = (data[userId] || 0) + 1;
            localStorage.setItem(FREE_QUESTIONS_KEY, JSON.stringify(data));
        } catch {
            // fail silently
        }
    },
};
