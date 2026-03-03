"use client";

import { useState, useEffect } from "react";
import { AiOutlineLike } from "react-icons/ai";
import { FaRegCommentAlt } from "react-icons/fa";
import { getPostLikes, getPostComments } from "@/Services/api/post";
import { LikeUser, Comment } from "@/types/blog";
import { getImageUrl, getInitials } from "@/lib/utils";
import Image from "next/image";

interface StatsDropdownProps {
  postId: number;
  type: "likes" | "comments";
  count: number;
}

interface UserDisplay {
  id: number;
  name: string;
  comment?: string;
  avatarUrl?: string | null;
}

export default function StatsDropdown({
  postId,
  type,
  count: initialCount,
}: StatsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<UserDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [actualCount, setActualCount] = useState(initialCount);

  // For comments type, fetch actual count on mount since backend post.comments may be inaccurate
  useEffect(() => {
    if (type === "comments") {
      const fetchActualCount = async () => {
        try {
          const data: Comment[] = await getPostComments(postId);
          setActualCount(data.length);
          // Pre-populate users for dropdown
          setUsers(
            data.map((c) => ({
              id: c.author.id,
              name: c.author.name,
              comment: c.content,
              avatarUrl: c.author.avatarUrl,
            })),
          );
          setFetched(true);
        } catch (err) {
          console.error("Failed to fetch comments count:", err);
          // Keep using initialCount as fallback
        }
      };
      fetchActualCount();
    }
  }, [postId, type]);

  const fetchData = async () => {
    if (fetched || loading) return;
    setLoading(true);
    try {
      if (type === "likes") {
        const data: LikeUser[] = await getPostLikes(postId);
        setUsers(
          data.map((u) => ({ id: u.id, name: u.name, avatarUrl: u.avatarUrl })),
        );
      } else {
        const data: Comment[] = await getPostComments(postId);
        setUsers(
          data.map((c) => ({
            id: c.author.id,
            name: c.author.name,
            comment: c.content,
            avatarUrl: c.author.avatarUrl,
          })),
        );
        setActualCount(data.length);
      }
      setFetched(true);
    } catch (err) {
      console.error(`Failed to fetch ${type}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    setIsOpen(true);
    fetchData();
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <button
        type="button"
        className="flex items-center gap-1.5 text-neutral-600 hover:text-[var(--accent-primary)] transition-colors cursor-pointer"
      >
        {type === "likes" ? (
          <AiOutlineLike className="w-4 h-4 " />
        ) : (
          <FaRegCommentAlt className="w-3.5 h-3.5" />
        )}
        <span className="font-medium text-sm">{actualCount}</span>
      </button>

      {/* Dropdown */}
      {isOpen && actualCount > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 overflow-hidden">
          <div className="px-3 py-2 border-b border-neutral-100 bg-neutral-50">
            <span className="text-xs font-semibold text-neutral-600">
              {type === "likes" ? "Liked by" : "Comments from"}
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-4 text-center text-sm text-neutral-500">
                Loading...
              </div>
            ) : users.length > 0 ? (
              <ul className="py-1">
                {users.map((user, index) => (
                  <li
                    key={`${user.id}-${index}`}
                    className="flex items-start gap-2.5 px-3 py-2 hover:bg-neutral-50"
                  >
                    {user.avatarUrl ? (
                      <Image
                        src={getImageUrl(user.avatarUrl)}
                        alt={user.name}
                        width={28}
                        height={28}
                        className="rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary-200 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(user.name)}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm text-neutral-700 truncate font-medium">
                        {user.name}
                      </span>
                      {type === "comments" && user.comment && (
                        <span className="text-xs text-neutral-500 line-clamp-1">
                          {user.comment}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-4 text-center text-sm text-neutral-500">
                {type === "likes" ? "No likes yet" : "No comments yet"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
