import { BlogsService } from './blogs.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import type { JwtPayload } from '../common';
export declare class BlogsController {
    private readonly blogsService;
    constructor(blogsService: BlogsService);
    create(user: JwtPayload, dto: CreateBlogDto): Promise<{
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
    findMyBlogs(user: JwtPayload): Promise<({
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
    findOne(id: string): Promise<{
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
    update(id: string, user: JwtPayload, dto: UpdateBlogDto): Promise<{
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
    remove(id: string, user: JwtPayload): Promise<{
        message: string;
    }>;
    likeBlog(id: string, user: JwtPayload): Promise<{
        liked: boolean;
        likeCount: number;
    }>;
    unlikeBlog(id: string, user: JwtPayload): Promise<{
        liked: boolean;
        likeCount: number;
    }>;
}
