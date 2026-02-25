import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
export declare class BlogsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private generateUniqueSlug;
    create(userId: string, dto: CreateBlogDto): Promise<{
        _count: {
            comments: number;
            likes: number;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        content: string;
        summary: string | null;
        isPublished: boolean;
        slug: string;
        userId: string;
        updatedAt: Date;
    }>;
    findUserBlogs(userId: string): Promise<({
        _count: {
            comments: number;
            likes: number;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        content: string;
        summary: string | null;
        isPublished: boolean;
        slug: string;
        userId: string;
        updatedAt: Date;
    })[]>;
    findById(id: string): Promise<{
        user: {
            name: string;
            id: string;
            email: string;
        };
        _count: {
            comments: number;
            likes: number;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        content: string;
        summary: string | null;
        isPublished: boolean;
        slug: string;
        userId: string;
        updatedAt: Date;
    }>;
    update(blogId: string, userId: string, dto: UpdateBlogDto): Promise<{
        _count: {
            comments: number;
            likes: number;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        content: string;
        summary: string | null;
        isPublished: boolean;
        slug: string;
        userId: string;
        updatedAt: Date;
    }>;
    delete(blogId: string, userId: string): Promise<{
        message: string;
    }>;
    findPublishedBySlug(slug: string): Promise<{
        user: {
            name: string;
            id: string;
        };
        _count: {
            comments: number;
            likes: number;
        };
    } & {
        id: string;
        createdAt: Date;
        title: string;
        content: string;
        summary: string | null;
        isPublished: boolean;
        slug: string;
        userId: string;
        updatedAt: Date;
    }>;
    findPublishedFeed(page: number, limit: number): Promise<{
        data: ({
            user: {
                name: string;
                id: string;
            };
            _count: {
                comments: number;
                likes: number;
            };
        } & {
            id: string;
            createdAt: Date;
            title: string;
            content: string;
            summary: string | null;
            isPublished: boolean;
            slug: string;
            userId: string;
            updatedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
            hasNext: boolean;
        };
    }>;
    toggleLike(blogId: string, userId: string): Promise<{
        liked: boolean;
        likeCount: number;
    }>;
    removeLike(blogId: string, userId: string): Promise<{
        liked: boolean;
        likeCount: number;
    }>;
    hasUserLiked(blogId: string, userId: string): Promise<boolean>;
}
