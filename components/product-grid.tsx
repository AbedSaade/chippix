import type { Product } from "@/lib/chibox";
import { ProductCard } from "./product-card";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <EmptyProducts />;
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard key={product.code} product={product} index={index} />
      ))}
    </div>
  );
}

export function EmptyProducts({
  message = "No products available right now.",
}: {
  message?: string;
}) {
  return (
    <div className="empty-products" role="status">
      <span aria-hidden="true">∅</span>
      <p>{message}</p>
      <small>The live catalog returned an empty shelf. Try again shortly.</small>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="product-card product-card--skeleton" key={index}>
          <div className="product-card__visual skeleton" />
          <div className="product-card__body">
            <span className="skeleton skeleton--line skeleton--short" />
            <span className="skeleton skeleton--line" />
            <span className="skeleton skeleton--line skeleton--medium" />
            <span className="skeleton skeleton--price" />
          </div>
        </div>
      ))}
    </div>
  );
}
