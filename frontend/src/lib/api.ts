import { getToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions {
    method?: string;
    body?: unknown;
    auth?: boolean;
}

class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, auth = false } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (auth) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new ApiError(
            response.status,
            Array.isArray(error.message) ? error.message.join(', ') : error.message || 'Request failed',
        );
    }

    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

// Auth
export const authApi = {
    register: (data: { email: string; name: string; password: string }) =>
        request<{ access_token: string; user: { id: string; email: string; name: string } }>('/auth/register', {
            method: 'POST',
            body: data,
        }),
    login: (data: { email: string; password: string }) =>
        request<{ access_token: string; user: { id: string; email: string; name: string } }>('/auth/login', {
            method: 'POST',
            body: data,
        }),
};

// Blogs (protected)
export const blogsApi = {
    create: (data: { title: string; content: string; summary?: string; isPublished?: boolean }) =>
        request('/blogs', { method: 'POST', body: data, auth: true }),
    getMyBlogs: () =>
        request<Array<{ id: string; title: string; slug: string; isPublished: boolean; createdAt: string; _count: { likes: number; comments: number } }>>('/blogs', { auth: true }),
    getById: (id: string) =>
        request(`/blogs/${id}`, { auth: true }),
    update: (id: string, data: { title?: string; content?: string; summary?: string; isPublished?: boolean }) =>
        request(`/blogs/${id}`, { method: 'PATCH', body: data, auth: true }),
    delete: (id: string) =>
        request(`/blogs/${id}`, { method: 'DELETE', auth: true }),
    like: (id: string) =>
        request<{ liked: boolean; likeCount: number }>(`/blogs/${id}/like`, { method: 'POST', auth: true }),
    unlike: (id: string) =>
        request<{ liked: boolean; likeCount: number }>(`/blogs/${id}/like`, { method: 'DELETE', auth: true }),
};

// Comments
export const commentsApi = {
    create: (blogId: string, content: string) =>
        request(`/blogs/${blogId}/comments`, { method: 'POST', body: { content }, auth: true }),
    getByBlog: (blogId: string, page = 1, limit = 20) =>
        request<{ data: Array<{ id: number; content: string; createdAt: string; user: { id: string; name: string } }>; meta: { total: number; page: number; totalPages: number; hasNext: boolean } }>(
            `/blogs/${blogId}/comments?page=${page}&limit=${limit}`,
        ),
};

// Public
export const publicApi = {
    getFeed: (page = 1, limit = 10) =>
        request<{
            data: Array<{
                id: string;
                title: string;
                slug: string;
                summary: string | null;
                content: string;
                isPublished: boolean;
                createdAt: string;
                user: { id: string; name: string };
                _count: { likes: number; comments: number };
            }>;
            meta: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean };
        }>(`/public/feed?page=${page}&limit=${limit}`),
    getBlogBySlug: (slug: string) =>
        request<{
            id: string;
            title: string;
            slug: string;
            content: string;
            summary: string | null;
            createdAt: string;
            user: { id: string; name: string };
            _count: { likes: number; comments: number };
        }>(`/public/blogs/${slug}`),
};

export { ApiError };
