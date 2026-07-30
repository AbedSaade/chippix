import "server-only";

import { cache } from "react";
import { filterProducts, isBlockedProduct } from "./brand-filter";
import { fetchUpstream } from "./client";
import { CHIBOX_ORIGIN, REVALIDATE } from "./config";
import { asArray, asRecord, normalizeProduct } from "./normalize";
import type { Product } from "./types";

export const getProduct = cache(async (code: string): Promise<Product | null> => {
  const safeCode = code.replace(/^p-/, "").replace(/\D/g, "");
  if (!safeCode) return null;

  const payload = asRecord(
    await fetchUpstream<unknown>(
      `${CHIBOX_ORIGIN}/api/public/product?code=p-${safeCode}&include=reviews,related`,
      { revalidate: REVALIDATE.product },
    ),
  );
  const data = asRecord(payload.data);
  const rawProduct = data.product ?? payload.product;
  if (!rawProduct) return null;

  const product = normalizeProduct(rawProduct);
  const related = asArray(
    data.related ?? asRecord(rawProduct).related ?? payload.related,
  ).map(normalizeProduct);
  product.related = filterProducts(related);

  if (
    product.code === "1004893524806" ||
    /adjustable sofa side table/i.test(product.name) ||
    isBlockedProduct(product)
  ) {
    return null;
  }

  return product;
});
