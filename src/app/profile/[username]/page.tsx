"use client";

import { useState, useEffect } from "react";
import { getPostsByUsername } from "@/Services/api/post";
import BlogCard from "@/components/Card/BlogCard";
import Link from "next/link";
import Image from "next/image";
import type { Post, PostsByUserResponse } from "@/types/blog";
import { getInitials, getImageUrl } from "@/lib/utils";
import ErrorPage from "@/components/ErrorPage";
import { useParams } from "next/navigation";
import Loader from "@/components/Loader";

interface UserData {
  id: number;
  name: string;
  username: string;
  headline?: string;
  avatarUrl?: string;
}

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [posts, setPosts] = useState<Post[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!username) return;

      setIsLoading(true);
      setError(null);

      try {
        const response: PostsByUserResponse = await getPostsByUsername(
          username,
          1,
          20,
        );
        setPosts(response.data || []);

        // Get user data from the response
        if (response.user) {
          setUserData({
            id: response.user.id,
            name: response.user.name || response.user.username || "User",
            username: response.user.username || "",
            headline: response.user.headline,
            avatarUrl: response.user.avatarUrl,
          });
        }
      } catch (err) {
        console.error("Failed to fetch user posts:", err);
        setError("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPosts();
  }, [username]);

  // Loading state
  if (isLoading) {
    return <Loader />;
  }

  // Error state
  if (error || !userData) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          Profile Not Found
        </h1>
        <p className="text-[var(--text-secondary)] mb-6">
          The user you are looking for does not exist.
        </p>
        <Link href="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-[800px] mx-auto px-4">
      {/* Profile Header */}
      <div className="bg-white border-b border-neutral-300">
        <div className="container pt-8 pb-5">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            {userData.avatarUrl ? (
              <Image
                src={getImageUrl(userData.avatarUrl)}
                alt={userData.name}
                width={80}
                height={80}
                className="w-10 h-10 md:w-20 md:h-20 rounded-full object-cover ring-4 ring-[var(--accent-light)]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white text-2xl font-bold ring-4 ring-[var(--accent-light)] flex-shrink-0">
                {getInitials(userData.name)}
              </div>
            )}

            {/* Info */}
            <div className="flex flex-col gap-1">
              <h1 className="text-sm md:text-xl font-bold text-[var(--text-primary)]">
                {userData.name}
              </h1>
              <p className="text-xs md:text-sm">
                {userData.headline || "Blogger"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User's Posts */}
      <div className="container pt-4 flex flex-col gap-4">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <img
              src="/assets/empty-document.svg"
              alt="No posts"
              className="w-20 h-20 mb-6"
            />
            <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              No posts from this user yet
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Stay tuned for future posts
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              {posts.length} Post{posts.length !== 1 ? "s" : ""}
            </h2>
            <div className="space-y-4 ">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
