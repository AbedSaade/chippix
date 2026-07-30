import "server-only";

import { cache } from "react";
import { CHIBOX_ORIGIN, REVALIDATE } from "./config";
import { fetchUpstream } from "./client";
import { filterProducts } from "./brand-filter";
import {
  asArray,
  asRecord,
  normalizeBanner,
  normalizeCategory,
  normalizePageShape,
  normalizeProduct,
} from "./normalize";
import type { HomeData } from "./types";

const DEMO_CODE = "1004893524806";

function cleanProducts(value: unknown) {
  const products = asArray(value).map(normalizeProduct);
  if (
    products.some(
      (product) =>
        product.code === DEMO_CODE ||
        /adjustable sofa side table/i.test(product.name),
    )
  ) {
    return [];
  }
  return filterProducts(products);
}

export const getHome = cache(async (): Promise<HomeData> => {
  const payload = asRecord(
    await fetchUpstream<unknown>(`${CHIBOX_ORIGIN}/api/public/home`, {
      revalidate: REVALIDATE.home,
    }),
  );

  return {
    banners: asArray(payload.banners)
      .map(normalizeBanner)
      .filter((item) => item !== null),
    categories: asArray(payload.categories)
      .map(normalizeCategory)
      .filter((item) => item !== null),
    products: cleanProducts(payload.products),
    hotProducts: cleanProducts(payload.hotProducts),
    dealProducts: cleanProducts(payload.dealProducts),
    pages: asArray(payload.pages)
      .map(normalizePageShape)
      .filter((item) => item !== null),
  };
});
