import type { Listing, Product } from "./types";

const TILE =
  /\/products\/p-(\d+)\?n=([^"\\&]*)&p=([0-9.]+)&c=([^"\\&]*)/g;
const TOTAL = /\{\\"total\\":(\d+)\}/;
const IMG = /https:\/\/cbu01\.alicdn\.com\/[^"\\ ]+/g;

function decode(value: string) {
  try {
    return decodeURIComponent(value.replace(/\+/g, " "));
  } catch {
    return value.replace(/\+/g, " ");
  }
}

function cleanAttribute(value: string) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&")
    .trim();
}

export function parseCategoryListing(
  html: string,
  page = 1,
  pageSize = 24,
): Listing {
  const norm = html.replaceAll("\\u0026", "&").replaceAll("&amp;", "&");
  const matches = Array.from(norm.matchAll(TILE));
  const globalImages = Array.from(norm.matchAll(IMG), (match) => match[0]);
  const productsByCode = new Map<string, Product>();

  matches.forEach((match, index) => {
    const code = match[1];
    if (productsByCode.has(code)) return;

    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? Math.min(norm.length, start + 20_000);
    const tileMarkup = norm.slice(start, end);
    const alt =
      tileMarkup.match(/<img[^>]*\balt=(?:\\"|")([^"\\]*)(?:\\"|")/i)?.[1] ??
      "";
    const image = tileMarkup.match(IMG)?.[0] ?? globalImages[index];
    const queryName = decode(match[2]);

    productsByCode.set(code, {
      code,
      name: cleanAttribute(alt) || queryName || `CN-${code}`,
      image,
      images: image ? [image] : [],
      price: Number.parseFloat(match[3]),
      currency: decode(match[4]) || "$",
      ratingCount: 0,
      available: true,
      options: [],
      variations: [],
      props: [],
      related: [],
    });
  });

  const total = Number.parseInt(norm.match(TOTAL)?.[1] ?? "", 10);
  const products = Array.from(productsByCode.values());

  return {
    products,
    total: Number.isFinite(total) ? total : undefined,
    page,
    pageSize,
    hasNext:
      Number.isFinite(total) ? page * pageSize < total : products.length === pageSize,
  };
}
