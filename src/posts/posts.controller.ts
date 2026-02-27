import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @Request() req,
  ): Promise<PostEntity> {
    const authorId = req.user.userId;
    return this.postsService.create(createPostDto, authorId);
  }

  @Get()
  async findAll(@Query('published') published?: string): Promise<PostEntity[]> {
    const publishedOnly = published === 'true';
    return this.postsService.findAll(publishedOnly);
  }

  @Get('published')
  async getPublishedPosts(): Promise<PostEntity[]> {
    return this.postsService.getPublishedPosts();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    // 先增加浏览量，然后返回更新后的文章
    return this.postsService.incrementViews(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ): Promise<PostEntity> {
    const authorId = req.user.userId;
    // 验证用户是否有权限更新此文章
    const post = await this.postsService.findOne(+id);
    if (post.authorId !== authorId) {
      throw new Error('You are not authorized to update this post');
    }
    return this.postsService.update(+id, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    const authorId = req.user.userId;
    // 验证用户是否有权限删除此文章
    const post = await this.postsService.findOne(+id);
    if (post.authorId !== authorId) {
      throw new Error('You are not authorized to delete this post');
    }
    return this.postsService.remove(+id);
  }

  @Post(':id/views')
  @HttpCode(200)
  async incrementViews(@Param('id') id: string): Promise<PostEntity> {
    return this.postsService.incrementViews(+id);
  }

  @Post(':id/likes')
  @HttpCode(200)
  async incrementLikes(@Param('id') id: string): Promise<PostEntity> {
    return this.postsService.incrementLikes(+id);
  }
}
