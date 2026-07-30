import "server-only";

import { filterProducts } from "./brand-filter";
import { fetchUpstream } from "./client";
import { CHIBOX_ORIGIN, REVALIDATE } from "./config";
import { parseCategoryListing } from "./parse-list";
import type { Listing } from "./types";

export async function getCategoryProducts(
  categoryKey: string,
  page: number,
): Promise<Listing> {
  const safeKey = categoryKey.replace(/[^a-z0-9-]/gi, "");
  const safePage = Math.max(1, Math.floor(page) || 1);
  const html = await fetchUpstream<string>(
    `${CHIBOX_ORIGIN}/categories/${safeKey}?page=${safePage}`,
    { revalidate: REVALIDATE.listing, accept: "html" },
  );
  const listing = parseCategoryListing(html, safePage);

  if (listing.products.length === 0 && html.length > 100_000) {
    console.error(
      `[Chippix] Category extractor returned 0 products from ${html.length} bytes for ${safeKey}. Upstream markup likely changed.`,
    );
  }

  return { ...listing, products: filterProducts(listing.products) };
}
