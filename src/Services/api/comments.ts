import { Comment } from "@/types/blog";
import { fetchApi, fetchApiAuth } from "./client";

// Get comments for a post (public)
export async function getComments(postId: number): Promise<Comment[]> {
  return fetchApi<Comment[]>(`/comments/${postId}`);
}

// Create a comment (auth required)
export async function createComment(
  token: string,
  postId: number,
  content: string,
): Promise<Comment> {
  return fetchApiAuth<Comment>(`/comments/${postId}`, token, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
    }),
  });
}

// Delete a comment (auth required, only post owner can delete)
export async function deleteComment(
  token: string,
  commentId: number,
): Promise<{ success: boolean }> {
  return fetchApiAuth<{ success: boolean }>(`/comments/${commentId}`, token, {
    method: "DELETE",
  });
}
