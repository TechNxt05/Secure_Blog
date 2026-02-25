import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/comment.dto';
export declare class CommentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(blogId: string, userId: string, dto: CreateCommentDto): Promise<{
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
    findByBlog(blogId: string, page: number, limit: number): Promise<{
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
