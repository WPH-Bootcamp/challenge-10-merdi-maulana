import Link from "next/link";
import type { Post } from "@/types/blog";
import { truncateText } from "@/lib/utils";
import StatsDropdown from "@/components/StatsDropdown";

interface HomeSidebarProps {
  mostLiked: Post[];
}

export default function HomeSidebar({ mostLiked }: HomeSidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Most Liked */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-bold text-xl">Most liked</h3>
        </div>
        <div className="space-y-1">
          {mostLiked.map((post, index) => (
            <div>
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="block p-3 -mx-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <h4 className="font-bold text-base text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent-primary)] transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-sm text-[var(--text-tertiary)] line-clamp-2 flex-1">
                      {truncateText(post.content, 120)}
                    </p>
                    <div className="flex items-center gap-4">
                      <StatsDropdown
                        postId={post.id}
                        type="likes"
                        count={post.likes}
                      />
                      <StatsDropdown
                        postId={post.id}
                        type="comments"
                        count={post.comments}
                      />
                    </div>
                  </div>
                </div>
              </Link>
              <hr className="mt-1 text-neutral-300" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
