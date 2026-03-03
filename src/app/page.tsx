import BlogList from "@/components/List/BlogList";
import { Suspense } from "react";

interface HomePageProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const searchQuery = params.q || "";
  const category = params.category || "all";
  const page = Number(params.page) || 1;

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 pt-8">
        <Suspense>
          <BlogList searchQuery={searchQuery} category={category} page={page} />
        </Suspense>
      </main>
    </div>
  );
}
