"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { likePost, getPostLikes } from "@/Services/api/post";
import { useRouter } from "next/navigation";

interface LikeButtonProps {
  postId: number;
  initialLikes: number;
}

export default function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch actual likes count from API on mount
  useEffect(() => {
    const fetchActualLikes = async () => {
      try {
        const likesData = await getPostLikes(postId);
        setLikes(likesData.length);
      } catch (error) {
        console.error("Failed to fetch likes count:", error);
      }
    };
    fetchActualLikes();
  }, [postId]);

  const handleLike = async () => {
    if (!user || !token) {
      // Redirect to login if not authenticated
      router.push(`/login?redirect=/blog/${postId}`);
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const updatedPost = await likePost(token, postId);
      setLikes(updatedPost.likes);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Failed to like post:", error);
      // Toggle locally even if API fails for better UX
      setIsLiked(!isLiked);
      setLikes(isLiked ? likes - 1 : likes + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
        isLiked
          ? "bg-red-50 border-red-200 text-red-500"
          : "border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-red-200 hover:text-red-500"
      } ${isLoading ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
    >
      <svg
        className={`w-4 h-4 transition-transform ${isLiked ? "scale-110" : ""}`}
        fill={isLiked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={isLiked ? 0 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
      <span className="text-sm font-medium">{likes}</span>
    </button>
  );
}
