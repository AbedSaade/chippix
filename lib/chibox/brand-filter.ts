import type { Product } from "./types";

const BLOCKED_TERMS = [
  "lv",
  "dior",
  "gucci",
  "chanel",
  "prada",
  "louis vuitton",
] as const;

const BLOCKED = new RegExp(
  `\\b(?:${BLOCKED_TERMS.map((term) => term.replace(" ", "\\s+")).join("|")})\\b`,
  "i",
);

export function isBlockedProduct(product: Pick<Product, "name">) {
  return BLOCKED.test(product.name);
}

export function filterProducts(products: Product[]) {
  return products.filter((product) => !isBlockedProduct(product));
}
