import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/comment.dto';
import { CurrentUser } from '../common';
import type { JwtPayload } from '../common';

@Controller('blogs/:blogId/comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async create(
        @Param('blogId', ParseUUIDPipe) blogId: string,
        @CurrentUser() user: JwtPayload,
        @Body() dto: CreateCommentDto,
    ) {
        return this.commentsService.create(blogId, user.sub, dto);
    }

    @Get()
    async findByBlog(
        @Param('blogId', ParseUUIDPipe) blogId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNum = Math.max(1, parseInt(page ?? '1', 10) || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit ?? '20', 10) || 20));
        return this.commentsService.findByBlog(blogId, pageNum, limitNum);
    }
}
