import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogsService } from '../blogs/blogs.service';

@Controller('public')
export class PublicController {
    constructor(private readonly blogsService: BlogsService) { }

    @Get('blogs/:slug')
    async findBySlug(@Param('slug') slug: string) {
        return this.blogsService.findPublishedBySlug(slug);
    }

    @Get('feed')
    async getFeed(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNum = Math.max(1, parseInt(page ?? '1', 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit ?? '10', 10) || 10));
        return this.blogsService.findPublishedFeed(pageNum, limitNum);
    }
}
