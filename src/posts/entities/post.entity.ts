export class Post {
  id: number;
  title: string;
  summary?: string;
  content: string;
  views: number;
  likes: number;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId: number;
}
