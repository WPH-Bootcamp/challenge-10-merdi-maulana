import { fetchApi, fetchApiAuth } from "./client";
import {
  Comment,
  Post,
  PostsByUserResponse,
  PostsResponse,
  LikeUser,
} from "@/types/blog";

// Public endpoints (no auth required)

export async function getPosts(
  page: number = 1,
  limit: number = 10,
): Promise<PostsResponse> {
  return fetchApi<PostsResponse>(
    `/posts/recommended?page=${page}&limit=${limit}`,
  );
}

export async function getPostById(id: number): Promise<Post> {
  return fetchApi<Post>(`/posts/${id}`);
}

export async function getMostLikedPosts(
  page: number = 1,
  limit: number = 10,
): Promise<PostsResponse> {
  return fetchApi<PostsResponse>(
    `/posts/most-liked?page=${page}&limit=${limit}`,
  );
}

export async function searchPosts(
  query: string,
  page: number = 1,
  limit: number = 10,
): Promise<PostsResponse> {
  return fetchApi<PostsResponse>(
    `/posts/search?query=${encodeURIComponent(query)}&limit=${limit}&page=${page}`,
  );
}

export async function getPostsByUsername(
  username: string,
  page: number = 1,
  limit: number = 10,
): Promise<PostsByUserResponse> {
  return fetchApi<PostsByUserResponse>(
    `/posts/by-username/${username}?page=${page}&limit=${limit}`,
  );
}

export async function getPostsByUserId(
  userId: number,
  page: number = 1,
  limit: number = 10,
): Promise<PostsByUserResponse> {
  return fetchApi<PostsByUserResponse>(
    `/posts/by-user/${userId}?page=${page}&limit=${limit}`,
  );
}

export async function getPostComments(postId: number): Promise<Comment[]> {
  return fetchApi<Comment[]>(`/posts/${postId}/comments`);
}

export async function getPostLikes(postId: number): Promise<LikeUser[]> {
  return fetchApi<LikeUser[]>(`/posts/${postId}/likes`);
}

// Auth required (with Token)

export async function getMyPosts(
  token: string,
  page: number = 1,
  limit: number = 10,
): Promise<PostsResponse> {
  return fetchApiAuth<PostsResponse>(
    `/posts/my-posts?limit=${limit}&page=${page}`,
    token,
  );
}

export async function createPost(
  token: string,
  formData: FormData,
): Promise<Post> {
  return fetchApiAuth<Post>("/posts", token, {
    method: "POST",
    body: formData,
  });
}

export async function updatePost(
  token: string,
  postId: number,
  formData: FormData,
): Promise<Post> {
  return fetchApiAuth<Post>(`/posts/${postId}`, token, {
    method: "PATCH",
    body: formData,
  });
}

export async function deletePost(
  token: string,
  postId: number,
): Promise<{ success: boolean }> {
  return fetchApiAuth<{ success: boolean }>(`/posts/${postId}`, token, {
    method: "DELETE",
  });
}

export async function likePost(token: string, postId: number): Promise<Post> {
  return fetchApiAuth<Post>(`/posts/${postId}/like`, token, {
    method: "POST",
  });
}
