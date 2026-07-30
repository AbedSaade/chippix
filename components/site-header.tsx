import Link from "next/link";
import { categoryKey, topCategories } from "@/lib/categories/tree";
import { StoreCounts } from "./store-counts";

export function SiteHeader() {
  const categories = topCategories();

  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Chippix home">
        CHIPPIX<span>®</span>
      </Link>
      <nav className="primary-nav" aria-label="Main navigation">
        <details className="catalog-menu">
          <summary>Catalog <span aria-hidden="true">＋</span></summary>
          <div className="catalog-menu__panel">
            <div className="catalog-menu__intro">
              <p>30 departments</p>
              <strong>One useful way through 1.64 million things.</strong>
              <Link href="/categories">Open full index →</Link>
            </div>
            <ul>
              {categories.map((category, index) => (
                <li key={category.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <Link href={`/categories/${categoryKey(category)}`}>
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </details>
        <Link href="/deals">Signals</Link>
        <Link href="/about-us">About</Link>
      </nav>
      <form className="header-search" action="/search" role="search">
        <label className="sr-only" htmlFor="site-search">
          Search the catalog
        </label>
        <input
          id="site-search"
          name="q"
          type="search"
          placeholder="Search 1.64m things"
          autoComplete="off"
        />
        <button type="submit" aria-label="Submit search">
          ↗
        </button>
      </form>
      <nav className="store-nav" aria-label="Saved products">
        <Link href="/wishlist">Wishlist</Link>
        <Link href="/cart">Cart</Link>
        <StoreCounts />
      </nav>
    </header>
  );
}
