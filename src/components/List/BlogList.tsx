import { getPosts, searchPosts, getMostLikedPosts } from "@/Services/api/post";
import { Post, PostsResponse } from "@/types/blog";
import ErrorPage from "../ErrorPage";
import Link from "next/link";
import BlogCard from "../Card/BlogCard";
import HomeSidebar from "../HomeSideBar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface BlogListProps {
  searchQuery?: string;
  category?: string;
  page: number;
}

export default async function BlogList({
  searchQuery,
  category,
  page,
}: BlogListProps) {
  let response: PostsResponse | null = null;
  let posts: Post[] = [];
  let lastPage = 1;
  let error: Error | null = null;
  let mostLikedPosts: Post[] = [];

  try {
    const [postsResponse, mostLikedResponse] = await Promise.all([
      searchQuery && searchQuery.trim()
        ? searchPosts(searchQuery.trim(), page, 5)
        : getPosts(page, 5),
      getMostLikedPosts(1, 5),
    ]);

    response = postsResponse;
    if (response) {
      posts = response.data;
      lastPage = response.lastPage;
    }

    mostLikedPosts = mostLikedResponse.data || [];
  } catch (err) {
    console.log("failed to fetch posts", err);
    error = err as Error;
  }

  if (error || !response) {
    return <ErrorPage />;
  }

  if (posts.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center">
          <svg
            className="w-10 h-10 text-[var(--text-muted)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
          {searchQuery ? `No results for "${searchQuery}"` : "No articles yet"}
        </h3>
        <p className="text-[var(--text-secondary)] mb-6">
          {searchQuery
            ? "Try different keywords or remove filters"
            : "Be the first to write an article!"}
        </p>
        <Link href="/create" className="btn btn-primary">
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Write First Article
        </Link>
      </div>
    );
  }

  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set("page", pageNum.toString());
    if (searchQuery) params.set("q", searchQuery);
    if (category) params.set("category", category);
    return `/?${params.toString()}`;
  };

  const currentPage = Number(page);

  const renderPaginationItems = () => {
    const items = [];
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(lastPage, currentPage + 1);

    if (startPage > 1) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            className={i === Number(page) ? "bg-primary-300" : ""}
            href={buildPageUrl(i)}
            isActive={i === Number(page)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (endPage < lastPage) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    return items;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3">
      <div className="space-y-4 md:col-span-2">
        <div className="mb-6">
          {searchQuery && (
            <form action="/" method="GET" className="md:hidden mb-4">
              <div className="relative w-full group">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] transition-colors group-focus-within:text-[var(--accent-primary)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  name="q"
                  placeholder="Search"
                  defaultValue={searchQuery}
                  className="input pl-12 py-2.5 bg-[var(--bg-secondary)] border-transparent focus:bg-white focus:border-[var(--accent-primary)]"
                />
              </div>
            </form>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
              {searchQuery ? (
                <>
                  Result For{" "}
                  <span className="text-[var(--accent-primary)]">
                    &quot;{searchQuery}&quot;
                  </span>
                </>
              ) : (
                "Recommend for you"
              )}
            </h2>
          </div>
        </div>

        {posts.map((post, index) => (
          <div
            key={post.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <BlogCard post={post} />
          </div>
        ))}

        {lastPage > 1 && (
          <Pagination className="my-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={buildPageUrl(Math.max(1, page - 1))}
                  className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {renderPaginationItems()}

              <PaginationItem>
                <PaginationNext
                  href={buildPageUrl(Math.min(lastPage, currentPage + 1))}
                  className={
                    page >= lastPage ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <div className=" h-1 w-[100%+] bg-neutral-300 md:hidden -mx-4 " />

      {searchQuery ? null : (
        <div className="md:col-span-1 mt-6 md:border-l-2 md:border-neutral-300 md:pl-10 md:ml-10">
          <HomeSidebar mostLiked={mostLikedPosts} />
        </div>
      )}
    </div>
  );
}
