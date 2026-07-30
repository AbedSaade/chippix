import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyProducts, ProductGrid, ProductGridSkeleton } from "@/components/product-grid";
import { searchProducts } from "@/lib/chibox";

export const metadata: Metadata = { title: "Search" };

type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  return (
    <main id="main" className="route-shell">
      <header className="search-intro">
        <p className="eyebrow">Search the live index</p>
        <form action="/search" role="search">
          <label htmlFor="catalog-query">What are you trying to find?</label>
          <div>
            <input
              id="catalog-query"
              name="q"
              type="search"
              defaultValue={query}
              autoFocus
              placeholder="Try: lamp, linen bag, steel bowl…"
            />
            <button type="submit">Search ↗</button>
          </div>
        </form>
        {query && (
          <p className="search-intro__context">
            Showing the moving catalog for <strong>“{query}”</strong>. Counts
            are deliberately omitted because the live index changes between
            calls.
          </p>
        )}
      </header>

      {query ? (
        <Suspense key={`${query}-${page}`} fallback={<ProductGridSkeleton count={24} />}>
          <SearchResults query={query} page={page} />
        </Suspense>
      ) : (
        <div className="empty-products">
          <span aria-hidden="true">⌕</span>
          <p>Give the index a word to work with.</p>
          <small>Broad nouns work surprisingly well.</small>
        </div>
      )}
    </main>
  );
}

async function SearchResults({
  query,
  page,
}: {
  query: string;
  page: number;
}) {
  try {
    const result = await searchProducts(query, page);
    return (
      <>
        <ProductGrid products={result.products} />
        {(result.hasPrevious || result.hasNext) && (
          <nav className="pagination" aria-label="Search pages">
            {result.hasPrevious ? (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
              >
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            <span>Page {page}</span>
            {result.hasNext ? (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
              >
                Next →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </>
    );
  } catch {
    return <EmptyProducts />;
  }
}
