import type { Metadata } from "next";
import { Suspense } from "react";
import { EmptyProducts, ProductGrid, ProductGridSkeleton } from "@/components/product-grid";
import { getHome } from "@/lib/chibox";

export const metadata: Metadata = { title: "Signals" };

export default function DealsPage() {
  return (
    <main id="main" className="route-shell">
      <header className="page-intro page-intro--signal">
        <p className="eyebrow">Signals / Refreshed every five minutes</p>
        <h1>The loud shelf.</h1>
        <p>
          Two live collections: products currently running hot and those
          surfaced for price. No invented scarcity. No countdown theatre.
        </p>
      </header>
      <section className="product-section">
        <div className="section-heading section-heading--numbered">
          <p className="eyebrow">Signal 01</p>
          <h2>Price-led</h2>
          <p>Current deal products supplied by the source catalog.</p>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <DealProducts source="dealProducts" />
        </Suspense>
      </section>
      <section className="product-section">
        <div className="section-heading section-heading--numbered">
          <p className="eyebrow">Signal 02</p>
          <h2>Running hot</h2>
          <p>Attention-led products supplied by the source catalog.</p>
        </div>
        <Suspense fallback={<ProductGridSkeleton />}>
          <DealProducts source="hotProducts" />
        </Suspense>
      </section>
    </main>
  );
}

async function DealProducts({
  source,
}: {
  source: "dealProducts" | "hotProducts";
}) {
  try {
    const data = await getHome();
    return <ProductGrid products={data[source]} />;
  } catch {
    return <EmptyProducts />;
  }
}
