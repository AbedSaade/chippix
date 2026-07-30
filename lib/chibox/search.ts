import "server-only";

import { API_VERSION, CHIBOX_ORIGIN, REVALIDATE } from "./config";
import { fetchUpstream } from "./client";
import { filterProducts } from "./brand-filter";
import { asArray, asRecord, normalizeProduct } from "./normalize";
import type { SearchResult } from "./types";

export async function searchProducts(
  query: string,
  page: number,
  pageSize = 24,
): Promise<SearchResult> {
  const safePage = Math.max(1, Math.floor(page) || 1);
  const payload = asRecord(
    await fetchUpstream<unknown>(
      `${CHIBOX_ORIGIN}/api/chibox/${API_VERSION}-product/search?keyword=${encodeURIComponent(query)}&page=${safePage}&per_page=${pageSize}`,
      { revalidate: REVALIDATE.search },
    ),
  );
  const data = asRecord(payload.data);
  const pagination = asRecord(data.pagination ?? payload.pagination);

  return {
    products: filterProducts(asArray(data.products).map(normalizeProduct)),
    page: safePage,
    pageSize,
    hasNext: Boolean(
      pagination.has_next ??
        (numberValue(pagination.current_page) <
          numberValue(pagination.last_page)),
    ),
    hasPrevious: Boolean(pagination.has_prev ?? safePage > 1),
  };
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
