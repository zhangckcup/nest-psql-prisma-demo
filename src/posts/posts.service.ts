import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  // 生成文章摘要的辅助方法
  private generateSummary(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) {
      return content;
    }
    const truncated = content.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  }

  async create(
    createPostDto: CreatePostDto,
    authorId: number = 1,
  ): Promise<Post> {
    const { title, content, published = false } = createPostDto;
    const summary = this.generateSummary(content);

    const postData: any = {
      title,
      content,
      summary,
      published,
      author: {
        connect: { id: authorId },
      },
    };

    if (published) {
      postData.publishedAt = new Date();
    }

    const post = await this.prisma.post.create({
      data: postData,
    });

    return post as unknown as Post;
  }

  async findAll(publishedOnly: boolean = false): Promise<Post[]> {
    const where: any = publishedOnly ? { published: true } : {};

    const posts = await this.prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return posts as unknown as Post[];
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post as unknown as Post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const existingPost = await this.findOne(id);

    let summary = existingPost.summary;
    if (
      updatePostDto.content &&
      updatePostDto.content !== existingPost.content
    ) {
      summary = this.generateSummary(updatePostDto.content);
    }

    const updateData: any = {
      ...updatePostDto,
      summary,
    };

    // 如果文章被发布且之前未发布，设置发布时间
    if (updatePostDto.published && !existingPost.published) {
      updateData.publishedAt = new Date();
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: updateData,
    });

    return updatedPost as unknown as Post;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // 确保文章存在

    await this.prisma.post.delete({
      where: { id },
    });
  }

  async incrementViews(id: number): Promise<Post> {
    const post = await this.prisma.post.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return post as unknown as Post;
  }

  async incrementLikes(id: number): Promise<Post> {
    const post = await this.prisma.post.update({
      where: { id },
      data: {
        likes: {
          increment: 1,
        },
      },
    });

    return post as unknown as Post;
  }

  async getPublishedPosts(): Promise<Post[]> {
    return this.findAll(true);
  }
}
