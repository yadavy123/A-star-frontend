import { makeApiCall, ApiError, type QueryRecord } from './runtimeApiBase.ts';

const FORCE_LOCAL_ASK_API = String(import.meta.env.VITE_USE_LOCAL_ASK_API || '').toLowerCase() === 'true';
const USE_LOCAL_MODE = FORCE_LOCAL_ASK_API;

type AskQuestion = {
    id: string;
    category: any;
    title: string;
    descriptionHtml: string;
    createdAt: string;
    slug: string;
};

const STORAGE_KEY = 'astar_ask_questions';

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
    async getAll(params?: QueryRecord) {
        if (USE_LOCAL_MODE) {
            return { data: { content: readLocalQuestions() } };
        }

        try {
            // Using /api/questions as per Swagger "Question (Public)" tag
            const data = await makeApiCall<any>('GET', '/api/questions', undefined, params);
            return { data };
        } catch (error) {
            console.error('Failed to fetch questions:', error);
            if (import.meta.env.DEV) return { data: { content: readLocalQuestions() } };
            throw error;
        }
    },

    async getById(id: string) {
        if (USE_LOCAL_MODE) {
            const q = readLocalQuestions().find(q => q.id === id);
            return { data: q };
        }
        try {
            const data = await makeApiCall<any>('GET', `/api/questions/${id}`);
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
            const data = await makeApiCall<any>('GET', `/api/questions/slug/${slug}`);
            return { data };
        } catch (error) {
            console.error('Failed to fetch question by slug:', error);
            throw error;
        }
    },

    async create(payload: { title: string; descriptionHtml: string; categoryId: string }) {
        if (USE_LOCAL_MODE) {
            const existing = readLocalQuestions();
            const next: AskQuestion = {
                ...payload,
                id: `${Date.now()}`,
                createdAt: new Date().toISOString(),
                slug: payload.title.toLowerCase().replace(/ /g, '-'),
                category: { id: payload.categoryId, name: 'Local Category' }
            };
            const updated = [next, ...existing];
            writeLocalQuestions(updated);
            return { data: next };
        }

        try {
            const data = await makeApiCall<AskQuestion>('POST', '/api/admin/questions', payload);
            return { data };
        } catch (err: unknown) {
            const apiErr = err as { status?: number; message?: string };
            if (apiErr.status === 401 || apiErr.status === 403) {
                throw new ApiError('Please log in to submit a question', apiErr.status || 401, null);
            }
            throw err;
        }
    },

    async update(id: string, payload: { title: string; descriptionHtml: string; categoryId: string }) {
        if (USE_LOCAL_MODE) {
            const existing = readLocalQuestions();
            const updated = existing.map((item) => (item.id === id ? { ...item, ...payload } : item));
            writeLocalQuestions(updated);
            return { data: updated.find((item) => item.id === id) };
        }

        try {
            const data = await makeApiCall<AskQuestion>('PUT', `/api/admin/questions/${id}`, payload);
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
        const data = await makeApiCall<any[]>('GET', `/api/answers/question/${questionId}`);
        return { data };
    },

    async submitAnswer(payload: { questionId: string; contentHtml: string }) {
        try {
            const data = await makeApiCall<any>('POST', '/api/answers', payload);
            return { data };
        } catch (err: unknown) {
            const apiErr = err as { status?: number; message?: string; response?: { data?: { message?: string } } };
            const msg = apiErr?.response?.data?.message || apiErr?.message || '';
            if (apiErr.status === 401 || apiErr.status === 403 || msg.includes('User not found')) {
                throw new ApiError('Please log in to submit an answer', apiErr.status || 401, null);
            }
            throw err;
        }
    },

    // ----- Categories (Public) -----
    async getCategories() {
        const data = await makeApiCall<any[]>('GET', '/api/categories');
        return { data };
    },

    async getCategoryById(id: string) {
        const data = await makeApiCall<any>('GET', `/api/categories/${id}`);
        return { data };
    },

    async getCategoryBySlug(slug: string) {
        const data = await makeApiCall<any>('GET', `/api/categories/slug/${slug}`);
        return { data };
    },

    // ----- Admin Answers -----
    async adminGetAnswers(params?: QueryRecord) {
        const data = await makeApiCall<any>('GET', '/api/admin/answers', undefined, params);
        return { data };
    },

    async approveAnswer(id: string) {
        const data = await makeApiCall<any>('PATCH', `/api/admin/answers/${id}/approve`);
        return { data };
    },

    async rejectAnswer(id: string, reason?: string) {
        const params = reason ? { reason } as QueryRecord : undefined;
        const data = await makeApiCall<any>('PATCH', `/api/admin/answers/${id}/reject`, undefined, params);
        return { data };
    },

    async deleteAnswer(id: string) {
        await makeApiCall('DELETE', `/api/admin/answers/${id}`);
        return { success: true };
    },

    // ----- Admin Categories -----
    async adminGetCategories() {
        const data = await makeApiCall<any[]>('GET', '/api/admin/categories');
        return { data };
    },

    async createCategory(name: string) {
        const data = await makeApiCall<any>('POST', '/api/admin/categories', { name });
        return { data };
    },

    async updateCategory(id: string, name: string) {
        const data = await makeApiCall<any>('PUT', `/api/admin/categories/${id}`, { name });
        return { data };
    },

    async deleteCategory(id: string) {
        await makeApiCall('DELETE', `/api/admin/categories/${id}`);
        return { success: true };
    },
};
