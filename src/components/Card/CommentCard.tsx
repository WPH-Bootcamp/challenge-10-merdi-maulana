import {
  formatDate,
  formatRelativeTime,
  getImageUrl,
  getInitials,
} from "@/lib/utils";
import type { Comment } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";

interface CommentCardProps {
  comment: Comment;
  onLinkClick?: () => void;
  avatarSize?: number;
  canDelete?: boolean;
  isDeleting?: boolean;
  onDelete?: (commentId: number) => void;
}

export default function CommentCard({
  comment,
  onLinkClick,
  avatarSize = 40,
  canDelete = false,
  isDeleting = false,
  onDelete,
}: CommentCardProps) {
  return (
    <>
      <div className="flex gap-3">
        <div className="flex items-center gap-2">
          <Link
            href={`/profile/${comment.author.username || comment.author.id}`}
            className="flex-shrink-0"
            onClick={onLinkClick}
          >
            {comment.author.avatarUrl ? (
              <Image
                src={getImageUrl(comment.author.avatarUrl)}
                alt={comment.author.name}
                width={avatarSize}
                height={avatarSize}
                className="rounded-full object-cover"
              />
            ) : (
              <div
                className="rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center text-white text-sm font-bold"
                style={{ width: avatarSize, height: avatarSize }}
              >
                {getInitials(comment.author.name)}
              </div>
            )}
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center flex-col text-left gap-1 ">
                <Link
                  href={`/profile/${comment.author.username || comment.author.id}`}
                  className="font-semibold text-sm w-full text-[var(--text-primary)] hover:text-[var(--accent-primary)]"
                  onClick={onLinkClick}
                >
                  {comment.author.name}
                </Link>
                <div className="text-xs text-neutral-600">
                  {formatDate(comment.createdAt)}
                </div>
              </div>
            </div>
            {/* Delete button - only for post owner */}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(comment.id)}
                disabled={isDeleting}
                className="ml-auto text-[var(--text-muted)] hover:text-red-500 transition-colors disabled:opacity-50"
                title="Delete comment"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">{comment.content}</p>
      <hr />
    </>
  );
}
