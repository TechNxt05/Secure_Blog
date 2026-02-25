import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BlogsService } from './blogs.service';
import { CreateBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { CurrentUser } from '../common';
import type { JwtPayload } from '../common';

@Controller('blogs')
@UseGuards(AuthGuard('jwt'))
export class BlogsController {
    constructor(private readonly blogsService: BlogsService) { }

    @Post()
    async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateBlogDto) {
        return this.blogsService.create(user.sub, dto);
    }

    @Get()
    async findMyBlogs(@CurrentUser() user: JwtPayload) {
        return this.blogsService.findUserBlogs(user.sub);
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.blogsService.findById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
        @Body() dto: UpdateBlogDto,
    ) {
        return this.blogsService.update(id, user.sub, dto);
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.blogsService.delete(id, user.sub);
    }

    @Post(':id/like')
    async likeBlog(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.blogsService.toggleLike(id, user.sub);
    }

    @Delete(':id/like')
    async unlikeBlog(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: JwtPayload,
    ) {
        return this.blogsService.removeLike(id, user.sub);
    }
}
