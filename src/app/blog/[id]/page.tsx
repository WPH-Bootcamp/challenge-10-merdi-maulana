import { Metadata } from "next";
import { getPostById, getPostComments, getPosts } from "@/Services/api/post";
import {
  getImageUrl,
  getInitials,
  formatDate,
  truncateText,
} from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BlogCard from "@/components/Card/BlogCard";
import { Post, Comment } from "@/types/blog";
import CommentList from "@/components/List/CommentList";
import LikeButton from "@/components/LikeButton";
import CommentButton from "@/components/CommentButton";

interface BlogDetailProps {
  params: Promise<{ id: string }>;
}

export async function generateMetaData({
  params,
}: BlogDetailProps): Promise<Metadata> {
  const resolvedParams = await params;
  const postId = parseInt(resolvedParams.id);

  try {
    const post = await getPostById(postId);
    const cleanDescription = truncateText(post.content, 160);
    return {
      title: post.title,
      description: cleanDescription,
      openGraph: {
        title: post.title,
        description: cleanDescription,
        images: [getImageUrl(post.imageUrl)],
      },
    };
  } catch (error) {
    return {
      title: "Blog Not Found",
      description: "The blog you are looking for does not exist.",
    };
  }
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const resolvedParams = await params;
  const postId = parseInt(resolvedParams.id);

  if (isNaN(postId)) {
    notFound();
  }

  let post: Post;
  let comments: Comment[];
  let relatedPosts: Post[] = [];

  try {
    [post, comments] = await Promise.all([
      getPostById(postId),
      getPostComments(postId),
    ]);

    const allPosts = await getPosts(1, 5);
    relatedPosts = allPosts.data.filter((p) => p.id !== postId).slice(0, 1);
  } catch (error) {
    notFound();
  }

  const imageUrl = getImageUrl(post.imageUrl);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-4">
      <article>
        <div>
          <div>
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?category=${tag.toLowerCase()}`}
                  className="px-3 py-1 rounded-full border border-neutral-300 text-neutral-900 text-xs md:text-sm hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            <Link
              href={`/profile/${post.author.username || post.author.id}`}
              className="flex items-center gap-3 my-3 group"
            >
              {post.author.avatarUrl ? (
                <Image
                  src={getImageUrl(post.author.avatarUrl)}
                  alt={post.author.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-300 flex items-center justify-center text-white text-sm font-bold">
                  {getInitials(post.author.name)}
                </div>
              )}
              <div>
                <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                  {post.author.name} • {formatDate(post.createdAt)}
                </p>
              </div>
            </Link>
          </div>
          <hr />
          <div className="flex items-center gap-4 py-4">
            {/* Like Button - Interactive */}
            <LikeButton postId={post.id} initialLikes={post.likes} />

            {/* Comments count - Clickable to scroll */}
            <CommentButton count={comments.length} />
          </div>
        </div>
        <hr className="mb-3" />
        <div>
          <div className="relative aspect-video rounded-md md:rounded-xl overflow-hidden mb-8">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
          {/* Blog Content with HTML support */}
          <article
            className="prose prose-lg max-w-none mb-12 prose-content text-sm"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
        <hr />
        <div id="comment-section">
          <CommentList
            postId={post.id}
            postAuthorId={post.author.id}
            comments={comments}
          />
        </div>
        <hr />
        <div>
          {relatedPosts.length > 0 && (
            <section>
              <h2 className="mt-4 text-xl font-bold">Another Post</h2>
              <div>
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.id} post={relatedPost} />
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </div>
  );
}
