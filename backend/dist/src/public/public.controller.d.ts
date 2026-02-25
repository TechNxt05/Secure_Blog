import { BlogsService } from '../blogs/blogs.service';
export declare class PublicController {
    private readonly blogsService;
    constructor(blogsService: BlogsService);
    findBySlug(slug: string): Promise<{
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
    getFeed(page?: string, limit?: string): Promise<{
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
}
