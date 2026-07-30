import { ProductGridSkeleton } from "@/components/product-grid";

export default function Loading() {
  return (
    <main id="main" className="route-shell">
      <div className="page-intro">
        <span className="skeleton skeleton--line skeleton--short" />
        <span className="skeleton skeleton--heading" />
        <span className="skeleton skeleton--line skeleton--medium" />
      </div>
      <ProductGridSkeleton />
    </main>
  );
}
