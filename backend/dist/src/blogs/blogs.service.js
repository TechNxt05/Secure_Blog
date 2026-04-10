"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const slugify_1 = __importDefault(require("slugify"));
let BlogsService = class BlogsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateUniqueSlug(title) {
        let slug = (0, slugify_1.default)(title, { lower: true, strict: true });
        let suffix = 0;
        let candidate = slug;
        while (await this.prisma.blog.findUnique({ where: { slug: candidate } })) {
            suffix++;
            candidate = `${slug}-${suffix}`;
        }
        return candidate;
    }
    async create(userId, dto) {
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
    async findUserBlogs(userId) {
        return this.prisma.blog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { likes: true, comments: true } },
            },
        });
    }
    async findById(id) {
        const blog = await this.prisma.blog.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                _count: { select: { likes: true, comments: true } },
            },
        });
        if (!blog) {
            throw new common_1.NotFoundException('Blog not found');
        }
        return blog;
    }
    async update(blogId, userId, dto) {
        const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
        if (!blog) {
            throw new common_1.NotFoundException('Blog not found');
        }
        if (blog.userId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own blogs');
        }
        const data = {};
        if (dto.title !== undefined) {
            data['title'] = dto.title;
            data['slug'] = await this.generateUniqueSlug(dto.title);
        }
        if (dto.content !== undefined)
            data['content'] = dto.content;
        if (dto.summary !== undefined)
            data['summary'] = dto.summary;
        if (dto.isPublished !== undefined)
            data['isPublished'] = dto.isPublished;
        return this.prisma.blog.update({
            where: { id: blogId },
            data,
            include: {
                _count: { select: { likes: true, comments: true } },
            },
        });
    }
    async delete(blogId, userId) {
        const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
        if (!blog) {
            throw new common_1.NotFoundException('Blog not found');
        }
        if (blog.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own blogs');
        }
        await this.prisma.blog.delete({ where: { id: blogId } });
        return { message: 'Blog deleted successfully' };
    }
    async findPublishedBySlug(slug) {
        const blog = await this.prisma.blog.findUnique({
            where: { slug },
            include: {
                user: { select: { id: true, name: true } },
                _count: { select: { likes: true, comments: true } },
            },
        });
        if (!blog || !blog.isPublished) {
            throw new common_1.NotFoundException('Blog not found');
        }
        return blog;
    }
    async findPublishedFeed(page, limit) {
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
    async toggleLike(blogId, userId) {
        const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
        if (!blog) {
            throw new common_1.NotFoundException('Blog not found');
        }
        const existingLike = await this.prisma.like.findUnique({
            where: { userId_blogId: { userId, blogId } },
        });
        if (existingLike) {
            await this.prisma.like.delete({ where: { id: existingLike.id } });
        }
        else {
            try {
                await this.prisma.like.create({ data: { userId, blogId } });
            }
            catch {
                throw new common_1.ConflictException('Like already exists');
            }
        }
        const likeCount = await this.prisma.like.count({ where: { blogId } });
        return { liked: !existingLike, likeCount };
    }
    async removeLike(blogId, userId) {
        const like = await this.prisma.like.findUnique({
            where: { userId_blogId: { userId, blogId } },
        });
        if (!like) {
            throw new common_1.NotFoundException('Like not found');
        }
        await this.prisma.like.delete({ where: { id: like.id } });
        const likeCount = await this.prisma.like.count({ where: { blogId } });
        return { liked: false, likeCount };
    }
    async hasUserLiked(blogId, userId) {
        const like = await this.prisma.like.findUnique({
            where: { userId_blogId: { userId, blogId } },
        });
        return !!like;
    }
};
exports.BlogsService = BlogsService;
exports.BlogsService = BlogsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BlogsService);
//# sourceMappingURL=blogs.service.js.map