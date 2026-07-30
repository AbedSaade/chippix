import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductConfigurator } from "@/components/product-configurator";
import { ProductGrid, ProductGridSkeleton } from "@/components/product-grid";
import { getProduct } from "@/lib/chibox";
import { formatPrice, isCodeOnlyName } from "@/lib/products/presentation";

type ProductPageProps = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ n?: string; p?: string; c?: string }>;
};

export async function generateMetadata({
  searchParams,
}: ProductPageProps): Promise<Metadata> {
  const { n } = await searchParams;
  return { title: n && !isCodeOnlyName(n) ? n : "Catalog find" };
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { code } = await params;
  const query = await searchParams;

  return (
    <main id="main" className="route-shell route-shell--product">
      <Suspense
        fallback={
          <OptimisticProduct
            code={code}
            name={query.n}
            price={query.p}
            currency={query.c}
          />
        }
      >
        <ProductBody code={code} />
      </Suspense>
    </main>
  );
}

async function ProductBody({ code }: { code: string }) {
  let product;
  try {
    product = await getProduct(code);
  } catch {
    return (
      <div className="empty-products empty-products--detail">
        <span aria-hidden="true">∅</span>
        <p>This product isn’t available from the live catalog right now.</p>
        <small>Nothing stale has been substituted in its place.</small>
      </div>
    );
  }
  if (!product) notFound();

  return (
    <>
      <ProductConfigurator product={product} />

      {product.description && (
        <section className="product-copy">
          <p className="eyebrow">Source notes</p>
          <h2>About this product</h2>
          <p>{product.description}</p>
        </section>
      )}

      {product.props.length > 0 && (
        <section className="property-ledger" aria-labelledby="property-title">
          <div>
            <p className="eyebrow">Filed attributes</p>
            <h2 id="property-title">What the source tells us.</h2>
            <p>
              No invented prose. These are the usable attributes supplied with
              this listing.
            </p>
          </div>
          <dl>
            {product.props.map((prop, index) => (
              <div key={`${prop.label}-${index}`}>
                <dt>{prop.label}</dt>
                <dd>{prop.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {product.related.length > 0 && (
        <section className="product-section">
          <div className="section-heading">
            <p className="eyebrow">Adjacent files</p>
            <h2>Related finds</h2>
          </div>
          <ProductGrid products={product.related.slice(0, 8)} />
        </section>
      )}
    </>
  );
}

function OptimisticProduct({
  code,
  name,
  price,
  currency,
}: {
  code: string;
  name?: string;
  price?: string;
  currency?: string;
}) {
  const numericPrice = Number(price);
  const title = name && !isCodeOnlyName(name) ? name : "Unlabelled catalog find";
  return (
    <div className="product-detail product-detail--optimistic" aria-busy="true">
      <div className="product-gallery">
        <div className="product-gallery__main skeleton" />
        <div className="product-gallery__thumbs">
          {Array.from({ length: 4 }, (_, index) => (
            <span className="skeleton" key={index} />
          ))}
        </div>
      </div>
      <section className="product-purchase">
        <p className="eyebrow">Filed as CN-{code}</p>
        <h1>{title}</h1>
        {Number.isFinite(numericPrice) && (
          <p className="product-price">
            {formatPrice(currency || "$", numericPrice)}
          </p>
        )}
        <span className="skeleton skeleton--line" />
        <span className="skeleton skeleton--line skeleton--medium" />
        <span className="skeleton skeleton--button" />
      </section>
    </div>
  );
}
