export interface Author {
  id: number;
  name: string;
  username?: string;
  email?: string;
  headline?: string;
  avatarUrl?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  tags: string[];
  imageUrl: string;
  author: Author;
  createdAt: string;
  likes: number;
  comments: number; // Count from backend (may be inaccurate, use /comments/{postId} for actual count)
}

export interface PostsResponse {
  data: Post[];
  total: number;
  page: number;
  lastPage: number;
}

export interface PostsByUserResponse extends PostsResponse {
  user: Author;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: Author;
  post?: { id: number };
}

export interface LikeUser {
  id: number;
  name: string;
  headline?: string;
  avatarUrl?: string;
}
