"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Post } from "@/types/blog";
import StatsDropdown from "@/components/StatsDropdown";
import { getImageUrl, getInitials, formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface BlogCardProps {
  post: Post;
}

export default function BlogCard({ post }: BlogCardProps) {
  const imageUrl = getImageUrl(post.imageUrl);
  return (
    <Card className="grid md:grid-cols-5 gap-0 p-0 shadow-none rounded-none border-0 border-b-2 border-neutral-200 pb-4">
      <CardHeader className="col-span-2 ">
        <Link href={`/blog/${post.id}`}>
          <div className="relative w-full h-48 md:h-52 overflow-hidden hidden md:block rounded-md">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, 224px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="col-span-3 px-0">
        <CardContent className="flex flex-col gap-3 px-0">
          <Link href={`/blog/${post.id}`}>
            <CardTitle className="text-base md:text-[20px] font-bold ">
              {post.title}
            </CardTitle>
          </Link>
          <CardDescription>
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1.5 mr-2 border rounded-md bg-[var(--accent-light)] text-neutral-900 font-medium"
              >
                {tag}
              </span>
            ))}
          </CardDescription>
          <CardDescription>
            <p className="text-sm text-[var(--text-tertiary)] line-clamp-2 mb-4 flex-1">
              {post.content.replace(/<[^>]*>/g, "")}
            </p>
          </CardDescription>
        </CardContent>
        <CardFooter className="px-0">
          <CardAction className="flex justify-between flex-col gap-2">
            <Link href={`/profile/${post.author.username || post.author.id}`}>
              <div className="flex items-center align-middle gap-2.5">
                {post.author.avatarUrl ? (
                  <Image
                    src={getImageUrl(post.author.avatarUrl)}
                    alt={post.author.name}
                    width={32}
                    height={32}
                    className="rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-300 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
                    {getInitials(post.author.name)}
                  </div>
                )}
                <div className="flex ">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {post.author.name}{" "}
                    <span className="text-xs text-neutral-600">
                      {"  .  "}
                      {formatDate(post.createdAt)}
                    </span>
                  </p>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <StatsDropdown postId={post.id} type="likes" count={post.likes} />
              <StatsDropdown
                postId={post.id}
                type="comments"
                count={post.comments}
              />
            </div>
          </CardAction>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
