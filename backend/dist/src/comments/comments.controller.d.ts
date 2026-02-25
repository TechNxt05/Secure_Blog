import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/comment.dto';
import type { JwtPayload } from '../common';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(blogId: string, user: JwtPayload, dto: CreateCommentDto): Promise<{
        user: {
            name: string;
            id: string;
        };
    } & {
        id: number;
        createdAt: Date;
        content: string;
        userId: string;
        blogId: string;
    }>;
    findByBlog(blogId: string, page?: string, limit?: string): Promise<{
        data: ({
            user: {
                name: string;
                id: string;
            };
        } & {
            id: number;
            createdAt: Date;
            content: string;
            userId: string;
            blogId: string;
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
