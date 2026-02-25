export interface User {
    id: string;
    email: string;
    name: string;
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface Blog {
    id: string;
    userId: string;
    title: string;
    slug: string;
    content: string;
    summary: string | null;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    user?: { id: string; name: string };
    _count?: { likes: number; comments: number };
}

export interface Comment {
    id: number;
    blogId: string;
    userId: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string };
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
    };
}

export interface LikeResponse {
    liked: boolean;
    likeCount: number;
}
