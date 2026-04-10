import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import slugify from 'slugify';

@Injectable()
export class BlogsService {
    constructor(private readonly prisma: PrismaService) { }

    private async generateUniqueSlug(title: string): Promise<string> {
        let slug = slugify(title, { lower: true, strict: true });
        let suffix = 0;
        let candidate = slug;

        while (await this.prisma.blog.findUnique({ where: { slug: candidate } })) {
            suffix++;
            candidate = `${slug}-${suffix}`;
        }

        return candidate;
    }

    async create(userId: string, dto: CreateBlogDto) {
        const slug = await this.generateUniqueSlug(dto.title);

        return this.prisma.blog.create({
            data: {
                userId,
                title: dto.title,
                slug,
                content: dto.content,
                summary: dto.summary ?? dto.content.substring(0, 200),
                isPublished: dto.isPublished ?? false,
            },
            include: {
                _count: { select: { likes: true, comments: true } },
            },
        });
    }

    async findUserBlogs(userId: string) {
        return this.prisma.blog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { likes: true, comments: true } },
            },
        });
    }

    async findById(id: string) {
        const blog = await this.prisma.blog.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                _count: { select: { likes: true, comments: true } },
            },
        });

        if (!blog) {
            throw new NotFoundException('Blog not found');
        }

        return blog;
    }

    async update(blogId: string, userId: string, dto: UpdateBlogDto) {
        const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });

        if (!blog) {
            throw new NotFoundException('Blog not found');
        }

        if (blog.userId !== userId) {
            throw new ForbiddenException('You can only edit your own blogs');
        }

        const data: Record<string, unknown> = {};
        if (dto.title !== undefined) {
            data['title'] = dto.title;
            data['slug'] = await this.generateUniqueSlug(dto.title);
        }
        if (dto.content !== undefined) data['content'] = dto.content;
        if (dto.summary !== undefined) data['summary'] = dto.summary;
        if (dto.isPublished !== undefined) data['isPublished'] = dto.isPublished;

        return this.prisma.blog.update({
            where: { id: blogId },
            data,
            include: {
                _count: { select: { likes: true, comments: true } },
            },
        });
    }

    async delete(blogId: string, userId: string) {
        const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });

        if (!blog) {
            throw new NotFoundException('Blog not found');
        }

        if (blog.userId !== userId) {
            throw new ForbiddenException('You can only delete your own blogs');
        }

        await this.prisma.blog.delete({ where: { id: blogId } });
        return { message: 'Blog deleted successfully' };
    }

    async findPublishedBySlug(slug: string) {
        const blog = await this.prisma.blog.findUnique({
            where: { slug },
            include: {
                user: { select: { id: true, name: true } },
                _count: { select: { likes: true, comments: true } },
            },
        });

        if (!blog || !blog.isPublished) {
            throw new NotFoundException('Blog not found');
        }

        return blog;
    }

    async findPublishedFeed(page: number, limit: number) {
        const skip = (page - 1) * limit;

        const [blogs, total] = await Promise.all([
            this.prisma.blog.findMany({
                where: { isPublished: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, name: true } },
                    _count: { select: { likes: true, comments: true } },
                },
            }),
            this.prisma.blog.count({ where: { isPublished: true } }),
        ]);

        return {
            data: blogs,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: skip + limit < total,
            },
        };
    }

    async toggleLike(blogId: string, userId: string) {
        const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
        if (!blog) {
            throw new NotFoundException('Blog not found');
        }

        const existingLike = await this.prisma.like.findUnique({
            where: { userId_blogId: { userId, blogId } },
        });

        if (existingLike) {
            await this.prisma.like.delete({ where: { id: existingLike.id } });
        } else {
            try {
                await this.prisma.like.create({ data: { userId, blogId } });
            } catch {
                throw new ConflictException('Like already exists');
            }
        }

        const likeCount = await this.prisma.like.count({ where: { blogId } });
        return { liked: !existingLike, likeCount };
    }

    async removeLike(blogId: string, userId: string) {
        const like = await this.prisma.like.findUnique({
            where: { userId_blogId: { userId, blogId } },
        });

        if (!like) {
            throw new NotFoundException('Like not found');
        }

        await this.prisma.like.delete({ where: { id: like.id } });

        const likeCount = await this.prisma.like.count({ where: { blogId } });
        return { liked: false, likeCount };
    }

    async hasUserLiked(blogId: string, userId: string): Promise<boolean> {
        const like = await this.prisma.like.findUnique({
            where: { userId_blogId: { userId, blogId } },
        });
        return !!like;
    }
}
