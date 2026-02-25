import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(blogId: string, userId: string, dto: CreateCommentDto) {
        const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }

        return this.prisma.comment.create({
            data: {
                blogId,
                userId,
                content: dto.content,
            },
            include: {
                user: { select: { id: true, name: true } },
            },
        });
    }

    async findByBlog(blogId: string, page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [comments, total] = await this.prisma.$transaction([
            this.prisma.comment.findMany({
                where: { blogId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, name: true } },
                },
            }),
            this.prisma.comment.count({ where: { blogId } }),
        ]);

        return {
            data: comments,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: skip + limit < total,
            },
        };
    }
}
