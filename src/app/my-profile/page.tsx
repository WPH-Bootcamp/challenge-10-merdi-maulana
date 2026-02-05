"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getInitials,
  getImageUrl,
  truncateText,
  formatDate,
} from "@/lib/utils";
import {
  getMyPosts,
  getPostLikes,
  getPostComments,
  deletePost,
} from "@/Services/api/post";
import type { Post, LikeUser, Comment } from "@/types/blog";
import Loader from "@/components/Loader";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { AiOutlineClose } from "react-icons/ai";

// Statistic Modal Component
function StatisticModal({
  isOpen,
  onClose,
  post,
}: {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
}) {
  const [activeTab, setActiveTab] = useState<"likes" | "comments">("likes");
  const [likes, setLikes] = useState<LikeUser[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!post || !isOpen) return;

      setIsLoading(true);
      try {
        const [likesData, commentsData] = await Promise.all([
          getPostLikes(post.id),
          getPostComments(post.id),
        ]);
        setLikes(likesData);
        setComments(commentsData);
      } catch (error) {
        console.error("Failed to fetch statistics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [post, isOpen]);

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl p-0 max-w-md w-full max-h-[80vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h3 className="text-base font-bold text-black">Statistic</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <svg
              className="w-5 h-5 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200">
          <button
            onClick={() => setActiveTab("likes")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "likes"
                ? "text-primary-300 border-b-2 border-primary-300"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
              />
            </svg>
            Like
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "comments"
                ? "text-primary-300 border-b-2 border-primary-300"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Comment
          </button>
        </div>

        {/* Content */}
        <div className="pt-4 px-4 overflow-y-auto max-h-80">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-300 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === "likes" ? (
            <>
              <p className="text-sm font-bold text-black mb-4">
                Like ({likes.length})
              </p>
              {likes.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">
                  No likes yet
                </p>
              ) : (
                <div className="space-y-3">
                  {likes.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 pb-4 pt-2 border-b border-neutral-300"
                    >
                      {user.avatarUrl ? (
                        <Image
                          src={getImageUrl(user.avatarUrl)}
                          alt={user.name}
                          width={36}
                          height={36}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary-300 flex items-center justify-center text-white text-sm font-bold">
                          {getInitials(user.headline)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-black">
                          {user.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {user.headline || "Frontend Developer"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-black mb-4">
                Comment ({comments.length})
              </p>
              {comments.length === 0 ? (
                <p className="text-sm text-neutral-500 text-center py-4">
                  No comments yet
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex flex-col gap-1 pb-3 border-b border-neutral-300"
                    >
                      <div className="flex gap-3">
                        {comment.author.avatarUrl ? (
                          <Image
                            src={getImageUrl(comment.author.avatarUrl)}
                            alt={comment.author.name}
                            width={36}
                            height={36}
                            className="rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary-300 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {getInitials(comment.author.name)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-black">
                            {comment.author.name}
                          </p>
                          <p className="text-sm text-neutral-600 mt-0.5">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-neutral-600 mt-0.5">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyProfilePage() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "password">("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Statistic modal
  const [isStatisticModalOpen, setIsStatisticModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Edit Profile modal
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: "",
    headline: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch user posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      if (!user || !token) return;

      setIsLoadingPosts(true);
      try {
        const response = await getMyPosts(token);
        setPosts(response.data || []);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setPosts([]);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    if (user && token) {
      fetchPosts();
    }
  }, [user, token]);

  const handleDeletePost = (post: Post) => {
    setPostToDelete(post);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete || !token) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deletePost(token, postToDelete.id);
      setPosts(posts.filter((p) => p.id !== postToDelete.id));
      setIsDeleteModalOpen(false);
      setPostToDelete(null);
    } catch (error) {
      console.error("Failed to delete post:", error);
      setDeleteError("Failed to delete post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenStatistic = (post: Post) => {
    setSelectedPost(post);
    setIsStatisticModalOpen(true);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordErrors({});
    setPasswordSuccess(true);
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  if (authLoading || !user) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen px-4">
      {/* Profile Header */}
      <div className="bg-white border-b border-neutral-300">
        <div className="container pt-6">
          <div className="flex border px-4 py-3 rounded-2xl border-neutral-300 items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              {user.avatarUrl ? (
                <Image
                  src={getImageUrl(user.avatarUrl)}
                  alt={user.name || user.username}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-300 flex items-center justify-center text-white text-lg font-bold">
                  {getInitials(user.name || user.username)}
                </div>
              )}

              <div className="flex flex-col justify-around h-full gap-1">
                <h1 className="text-sm font-bold text-black">
                  {user.name || user.username}
                </h1>
                <p className="text-xs text-neutral-500">
                  {user.role || "Frontend Developer"}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setEditProfileForm({
                  name: user.name || user.username,
                  headline: user.role || "",
                });
                setIsEditProfileModalOpen(true);
              }}
              className="text-primary-300 underline underline-offset-2 text-sm font-medium hover:underline"
            >
              Edit Profile
            </button>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 mt-6">
            <button
              onClick={() => setActiveTab("posts")}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === "posts"
                  ? "text-primary-300"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              Your Post
              {activeTab === "posts" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-300" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === "password"
                  ? "text-primary-300"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              Change Password
              {activeTab === "password" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container py-4">
        {activeTab === "posts" ? (
          <>
            {/* Write Post Button */}
            <Link
              href="/create"
              className="flex items-center justify-center gap-2 w-full py-3 bg-primary-300 text-white rounded-full font-medium hover:bg-primary-400 transition-colors mb-4"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              Write Post
            </Link>

            {/* Posts Header */}
            <h2 className="text-lg font-bold text-black mb-4 pt-4 border-t border-neutral-300">
              {posts.length} Post{posts.length !== 1 ? "s" : ""}
            </h2>

            {/* Loading State */}
            {isLoadingPosts ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary-300 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-neutral-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">
                  No posts yet
                </h3>
                <p className="text-neutral-500 mb-6">
                  Start sharing your thoughts with the world!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <article key={post.id}>
                    {/* Title */}
                    <Link href={`/blog/${post.id}`}>
                      <h3 className="font-bold text-base text-black hover:text-primary-300 transition-colors mb-2">
                        {post.title}
                      </h3>
                    </Link>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs rounded-full border border-neutral-300 text-neutral-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                      {truncateText(post.content, 150)}
                    </p>

                    {/* Date */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 mb-3">
                      <span>Created {formatDate(post.createdAt)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 text-sm">
                      <button
                        onClick={() => handleOpenStatistic(post)}
                        className="text-primary-300 underline underline-offset-2 hover:underline font-medium"
                      >
                        Statistic
                      </button>
                      <Link
                        href={`/edit/${post.id}`}
                        className="text-primary-300 underline underline-offset-2 hover:underline font-medium"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeletePost(post)}
                        className="text-pink-500 underline underline-offset-2 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Divider */}
                    <hr className="mt-4 border-neutral-200" />
                  </article>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Password Change Form */
          <div className="max-w-md">
            <h2 className="text-lg font-bold text-black mb-6">
              Change Password
            </h2>

            {passwordSuccess && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
                Password changed successfully!
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className={`input pr-12 ${passwordErrors.currentPassword ? "border-red-400" : ""}`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                  >
                    {showCurrentPassword ? (
                      <AiOutlineEye />
                    ) : (
                      <AiOutlineEyeInvisible />
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className={`input pr-12 ${passwordErrors.newPassword ? "border-red-400" : ""}`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                  >
                    {showNewPassword ? (
                      <AiOutlineEye />
                    ) : (
                      <AiOutlineEyeInvisible />
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className={`input pr-12 ${passwordErrors.confirmPassword ? "border-red-400" : ""}`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors"
                  >
                    {showConfirmPassword ? (
                      <AiOutlineEye />
                    ) : (
                      <AiOutlineEyeInvisible />
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {passwordErrors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary-300 text-white rounded-full font-medium hover:bg-primary-400 transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Statistic Modal */}
      <StatisticModal
        isOpen={isStatisticModalOpen}
        onClose={() => setIsStatisticModalOpen(false)}
        post={selectedPost}
      />

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-black">Delete</h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-neutral-600 hover:text-black transition-colors"
              >
                <AiOutlineClose className="w-6 h-6 text-black" />
              </button>
            </div>
            <p className="text-neutral-600 mb-6">Are you sure to delete?</p>
            {deleteError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {deleteError}
              </div>
            )}
            <div className="grid grid-cols-2">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteError(null);
                }}
                className="px-4 py-2 text-black font-semibold hover:bg-neutral-100 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-[#EE1D52] text-white rounded-full hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-black">Edit Profile</h3>
              <button
                onClick={() => setIsEditProfileModalOpen(false)}
                className="p-1 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Avatar with Camera Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {user.avatarUrl ? (
                  <Image
                    src={getImageUrl(user.avatarUrl)}
                    alt={user.name || user.username}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary-300 flex items-center justify-center text-white text-2xl font-bold">
                    {getInitials(user.name || user.username)}
                  </div>
                )}
                {/* Camera Icon */}
                <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary-300 rounded-full flex items-center justify-center text-white shadow-md hover:bg-primary-400 transition-colors">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editProfileForm.name}
                  onChange={(e) =>
                    setEditProfileForm({
                      ...editProfileForm,
                      name: e.target.value,
                    })
                  }
                  className="input"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Profile Headline
                </label>
                <input
                  type="text"
                  value={editProfileForm.headline}
                  onChange={(e) =>
                    setEditProfileForm({
                      ...editProfileForm,
                      headline: e.target.value,
                    })
                  }
                  className="input"
                  placeholder="Enter your headline"
                />
              </div>

              {/* Update Password Button */}
              <button
                onClick={() => {
                  setIsEditProfileModalOpen(false);
                  setActiveTab("password");
                }}
                className="w-full py-3 bg-primary-300 text-white rounded-full font-medium hover:bg-primary-400 transition-colors mt-4"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
