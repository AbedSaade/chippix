import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { EmptyProducts, ProductGrid, ProductGridSkeleton } from "@/components/product-grid";
import { getHome } from "@/lib/chibox";

export default function HomePage() {
  return (
    <main id="main">
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Live catalog / Re-indexed continuously</p>
          <h1>
            Find the
            <br />
            <em>useful</em> thing.
          </h1>
          <p className="hero__dek">
            1.64 million products. 7,301 precise categories. One independent
            map through the noise.
          </p>
          <div className="hero__actions">
            <Link className="button button--dark" href="/categories">
              Enter the index <span aria-hidden="true">↗</span>
            </Link>
            <Link className="text-link" href="/deals">
              Read today’s signals
            </Link>
          </div>
        </div>
        <Suspense fallback={<div className="hero__image skeleton" />}>
          <HeroBanner />
        </Suspense>
        <div className="hero__ledger" aria-label="Catalog facts">
          <span><b>30</b> departments</span>
          <span><b>03</b> levels deep</span>
          <span><b>Live</b> source</span>
        </div>
      </section>

      <Suspense fallback={<CategoryRailSkeleton />}>
        <HomeCategories />
      </Suspense>

      <HomeProductSection
        title="Newly filed"
        label="Entry 01"
        source="products"
        description="Recent arrivals, left in the order the live catalog gives us."
      />
      <HomeProductSection
        title="Running hot"
        label="Entry 02"
        source="hotProducts"
        description="Products currently making more noise than their neighbors."
      />
      <HomeProductSection
        title="Price signals"
        label="Entry 03"
        source="dealProducts"
        description="Current deal and price-led selections from the source."
      />
    </main>
  );
}

async function HeroBanner() {
  try {
    const data = await getHome();
    const banner = data.banners[0];
    if (!banner) return <div className="hero__image hero__image--empty" />;
    return (
      <div className="hero__image">
        <Image
          src={banner.image}
          alt=""
          fill
          priority
          sizes="(max-width: 800px) 100vw, 46vw"
        />
        <span className="hero__stamp">Live image / 001</span>
      </div>
    );
  } catch {
    return <div className="hero__image hero__image--empty" />;
  }
}

async function HomeCategories() {
  try {
    const data = await getHome();
    return (
      <section className="category-rail" aria-labelledby="departments-title">
        <div className="section-heading">
          <p className="eyebrow">Fast entry points</p>
          <h2 id="departments-title">Start broad. Get specific fast.</h2>
          <Link href="/categories">All 30 departments →</Link>
        </div>
        <div className="category-rail__track">
          {data.categories.map((category, index) => (
            <Link
              className="category-tile"
              href={`/categories/${category.id}-${category.slug}`}
              key={category.id}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                {category.image && (
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="160px"
                  />
                )}
              </div>
              <strong>{category.name}</strong>
            </Link>
          ))}
        </div>
      </section>
    );
  } catch {
    return <CategoryRailSkeleton />;
  }
}

function CategoryRailSkeleton() {
  return (
    <section className="category-rail" aria-hidden="true">
      <div className="section-heading">
        <span className="skeleton skeleton--line skeleton--short" />
        <span className="skeleton skeleton--heading" />
      </div>
      <div className="category-rail__track">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="category-tile" key={index}>
            <span>—</span>
            <div className="skeleton" />
            <span className="skeleton skeleton--line" />
          </div>
        ))}
      </div>
    </section>
  );
}

function HomeProductSection({
  title,
  label,
  source,
  description,
}: {
  title: string;
  label: string;
  source: "products" | "hotProducts" | "dealProducts";
  description: string;
}) {
  return (
    <section className="product-section" aria-labelledby={`${source}-title`}>
      <div className="section-heading section-heading--numbered">
        <p className="eyebrow">{label}</p>
        <h2 id={`${source}-title`}>{title}</h2>
        <p>{description}</p>
      </div>
      <Suspense fallback={<ProductGridSkeleton />}>
        <HomeProducts source={source} />
      </Suspense>
    </section>
  );
}

async function HomeProducts({
  source,
}: {
  source: "products" | "hotProducts" | "dealProducts";
}) {
  try {
    const data = await getHome();
    return <ProductGrid products={data[source]} />;
  } catch {
    return <EmptyProducts />;
  }
}
