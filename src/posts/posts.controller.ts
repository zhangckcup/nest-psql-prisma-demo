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
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostEntity } from './entities/post.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  async create(@Body() createPostDto: CreatePostDto): Promise<PostEntity> {
    return this.postsService.create(createPostDto);
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
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
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
