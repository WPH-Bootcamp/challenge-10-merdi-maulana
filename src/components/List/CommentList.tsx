"use client";

import { useState, useEffect } from "react";
import type { Comment } from "@/types/blog";
import { formatRelativeTime, getImageUrl, getInitials } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { createComment, deleteComment } from "@/Services/api/comments";
import { useAuth } from "@/context/AuthContext";
import CommentCard from "../Card/CommentCard";

interface CommentListProps {
  postId: number;
  postAuthorId?: number; // Post author can delete any comment
  comments: Comment[];
}

export default function CommentList({
  postId,
  postAuthorId,
  comments: initialComments,
}: CommentListProps) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [modalComment, setModalComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null,
  );

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  const handleSubmit = async (e: React.FormEvent, isModal: boolean = false) => {
    e.preventDefault();
    const commentText = isModal ? modalComment : newComment;
    if (!commentText.trim() || isSubmitting || !user) return;

    setIsSubmitting(true);
    setError("");

    try {
      if (!token) {
        throw new Error("No authentication token");
      }
      const comment = await createComment(token, postId, commentText.trim());
      setComments([comment, ...comments]);
      if (isModal) {
        setModalComment("");
      } else {
        setNewComment("");
      }
    } catch (err) {
      console.error("Failed to create comment:", err);
      // For demo, add comment locally
      const mockComment: Comment = {
        id: Date.now(),
        content: commentText.trim(),
        author: {
          id: user.id,
          name: user.name || user.username,
          avatarUrl: user.avatarUrl,
        },
        createdAt: new Date().toISOString(),
      };
      setComments([mockComment, ...comments]);
      if (isModal) {
        setModalComment("");
      } else {
        setNewComment("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only post author can delete comments
  const canDeleteComment = (): boolean => {
    return !!(user && postAuthorId && user.id === postAuthorId);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token || !canDeleteComment()) return;

    setDeletingCommentId(commentId);
    try {
      await deleteComment(token, commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error("Failed to delete comment:", error);
      setError("Failed to delete comment");
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <section className="py-4">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
        Comments({comments.length})
      </h2>

      {/* Add Comment Form - Only show if logged in */}
      {user ? (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            {user.avatarUrl ? (
              <Image
                src={getImageUrl(user.avatarUrl)}
                alt={user.name || user.username}
                width={36}
                height={36}
                className="rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary-300 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {getInitials(user.name || user.username)}
              </div>
            )}
            <div className="font-semibold text-xs text-black">{user.name}</div>
          </div>
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="comment"
              className="text-sm font-semibold text-black mb-2"
            >
              Give your Comments
            </label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your comment"
              className="input min-h-[140px] resize-none text-sm mb-3 mt-2"
              rows={4}
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="bg-primary-300 text-white w-full h-12 rounded-full  px-8 disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : "Send"}
              </button>
            </div>
            <hr className="mt-4" />
          </form>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-center">
          <p className="text-[var(--text-secondary)] mb-3 text-sm">
            Login untuk menulis komentar
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/login" className="btn btn-primary text-sm py-2 px-6">
              Login
            </Link>
            <Link href="/register" className="btn btn-ghost text-sm py-2 px-6">
              Register
            </Link>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {displayedComments.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          displayedComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              canDelete={canDeleteComment()}
              isDeleting={deletingCommentId === comment.id}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>

      {/* See All Comments */}
      {comments.length > 3 && !showAllComments && (
        <button
          onClick={() => setShowModal(true)}
          className="text-primary-300 underline underline-offset-3 text-sm font-medium h-8 w-full text-left -mt-4 bg-white hover:text-primary-200"
        >
          See All Comments
        </button>
      )}

      {/* Comments Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-[var(--bg-primary)] rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-primary)]">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                Comments({comments.length})
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
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

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto rounded-2xl p-5 bg-white">
              {/* Comment Form in Modal */}
              {user && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">
                    Comments({comments.length})
                  </h3>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                    Give your Comments
                  </p>
                  <form onSubmit={(e) => handleSubmit(e, true)}>
                    <textarea
                      value={modalComment}
                      onChange={(e) => setModalComment(e.target.value)}
                      placeholder="Enter your comment"
                      className="input min-h-[140px] resize-none text-sm mb-3 w-full"
                      rows={4}
                    />
                    <button
                      type="submit"
                      disabled={!modalComment.trim() || isSubmitting}
                      className="bg-primary-300 text-white w-full h-10 rounded-full  px-8 disabled:opacity-70"
                    >
                      {isSubmitting ? "Sending..." : "Send"}
                    </button>
                  </form>
                </div>
              )}

              {/* Comments List in Modal */}
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    avatarSize={40}
                    onLinkClick={() => setShowModal(false)}
                    canDelete={canDeleteComment()}
                    isDeleting={deletingCommentId === comment.id}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
