import { ProductGridSkeleton } from "@/components/product-grid";

export default function ProductLoading() {
  return (
    <main id="main" className="route-shell route-shell--product">
      <div className="product-detail product-detail--optimistic" aria-hidden="true">
        <div className="product-gallery">
          <div className="product-gallery__main skeleton" />
        </div>
        <section className="product-purchase">
          <span className="skeleton skeleton--line skeleton--short" />
          <span className="skeleton skeleton--heading" />
          <span className="skeleton skeleton--price" />
          <span className="skeleton skeleton--button" />
        </section>
      </div>
      <ProductGridSkeleton />
    </main>
  );
}
