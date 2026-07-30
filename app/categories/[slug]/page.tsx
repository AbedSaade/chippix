import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EmptyProducts, ProductGrid, ProductGridSkeleton } from "@/components/product-grid";
import {
  ancestorsOf,
  categoryByKey,
  categoryKey,
  childrenOf,
} from "@/lib/categories/tree";
import { getCategoryProducts } from "@/lib/chibox";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const category = categoryByKey((await params).slug);
  return { title: category?.name ?? "Category" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const category = categoryByKey(slug);
  if (!category) notFound();

  const page = Math.max(1, Number.parseInt((await searchParams).page ?? "1", 10) || 1);
  const ancestors = ancestorsOf(category.id);
  const children = childrenOf(category.id);
  const siblings = category.parentId ? childrenOf(category.parentId) : [];

  return (
    <main id="main" className="route-shell">
      <nav className="breadcrumbs" aria-label="Breadcrumbs">
        <Link href="/categories">Catalog</Link>
        {ancestors.map((ancestor) => (
          <span key={ancestor.id}>
            <span aria-hidden="true">/</span>
            <Link href={`/categories/${categoryKey(ancestor)}`}>
              {ancestor.name}
            </Link>
          </span>
        ))}
        <span aria-current="page">
          <span aria-hidden="true">/</span>
          {category.name}
        </span>
      </nav>

      <header className="category-header">
        <div>
          <p className="eyebrow">Level 0{category.depth} / Catalog field</p>
          <h1>{category.name}</h1>
        </div>
        <p>
          {children.length > 0
            ? `${children.length} narrower paths. Pick one, or scan the live shelf below.`
            : "You’ve reached a leaf. The products below are read from the live shelf."}
        </p>
      </header>

      {children.length > 0 && (
        <section className="branch-browser" aria-labelledby="branch-title">
          <div className="branch-browser__label">
            <h2 id="branch-title">Narrow the field</h2>
            <span>{children.length} branches</span>
          </div>
          <div className="branch-browser__grid">
            {children.map((child, index) => (
              <Link href={`/categories/${categoryKey(child)}`} key={child.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{child.name}</strong>
                <small>
                  {child.childCount
                    ? `${child.childCount} subcategories`
                    : "Open live shelf"}
                </small>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {siblings.length > 1 && (
        <nav className="sibling-pivots" aria-label="Related categories">
          <span>Nearby</span>
          <div>
            {siblings.slice(0, 12).map((sibling) => (
              <Link
                aria-current={sibling.id === category.id ? "page" : undefined}
                href={`/categories/${categoryKey(sibling)}`}
                key={sibling.id}
              >
                {sibling.name}
              </Link>
            ))}
          </div>
        </nav>
      )}

      <section className="product-section product-section--listing">
        <div className="section-heading">
          <p className="eyebrow">Live shelf / Page {page}</p>
          <h2>Current products</h2>
        </div>
        <Suspense key={`${slug}-${page}`} fallback={<ProductGridSkeleton count={24} />}>
          <CategoryProducts categoryKeyValue={slug} page={page} />
        </Suspense>
      </section>
    </main>
  );
}

async function CategoryProducts({
  categoryKeyValue,
  page,
}: {
  categoryKeyValue: string;
  page: number;
}) {
  try {
    const listing = await getCategoryProducts(categoryKeyValue, page);
    return (
      <>
        <ProductGrid products={listing.products} />
        {(page > 1 || listing.hasNext) && (
          <nav className="pagination" aria-label="Product pages">
            {page > 1 ? (
              <Link href={`?page=${page - 1}`}>← Previous</Link>
            ) : (
              <span />
            )}
            <span>Page {page}</span>
            {listing.hasNext ? (
              <Link href={`?page=${page + 1}`}>Next →</Link>
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
