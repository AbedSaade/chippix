import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { categoryKey, topCategories } from "@/lib/categories/tree";

export const metadata: Metadata = { title: "Catalog index" };

export default function CategoriesPage() {
  const categories = topCategories();

  return (
    <main id="main" className="route-shell">
      <header className="page-intro page-intro--index">
        <p className="eyebrow">The complete atlas / Level 01</p>
        <h1>Thirty ways in.</h1>
        <p>
          Choose a department. Every next screen keeps your place, exposes
          siblings, and narrows the field without making you start over.
        </p>
        <span className="page-intro__counter">01—30</span>
      </header>
      <ol className="department-index">
        {categories.map((category, index) => (
          <li key={category.id}>
            <Link href={`/categories/${categoryKey(category)}`}>
              <span className="department-index__number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="department-index__image">
                {category.image && (
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="96px"
                  />
                )}
              </span>
              <strong>{category.name}</strong>
              <span className="department-index__meta">
                {category.childCount ?? 0} branches
              </span>
              <span aria-hidden="true">↗</span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
