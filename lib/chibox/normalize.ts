import type {
  Banner,
  CategorySummary,
  CmsPageShape,
  Product,
  ProductOption,
  ProductProp,
  ProductVariation,
} from "./types";

type UnknownRecord = Record<string, unknown>;

const record = (value: unknown): UnknownRecord =>
  value && typeof value === "object" ? (value as UnknownRecord) : {};
const array = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const text = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;
const number = (value: unknown, fallback = 0) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const optionalNumber = (value: unknown) => {
  const parsed = number(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : undefined;
};
const optionalText = (value: unknown) => {
  const parsed = text(value).trim();
  return parsed || undefined;
};
const codeFrom = (value: unknown) =>
  text(value).replace(/^p-/i, "").replace(/^CN-/i, "");

function normalizeProps(value: unknown): ProductProp[] {
  return array(value)
    .flatMap((entry) => Object.entries(record(entry)))
    .map(([label, rawValue]) => ({ label, value: text(rawValue) }))
    .filter(({ label, value }) => label.trim() && value.trim());
}

function normalizeOptions(value: unknown): ProductOption[] {
  return array(value).map((rawOption) => {
    const option = record(rawOption);
    return {
      id: number(option.id),
      name: text(option.name, "Option"),
      isColor: Boolean(option.isColor ?? option.is_color),
      values: array(option.values).map((rawValue) => {
        const item = record(rawValue);
        return {
          id: number(item.id),
          name: text(item.name, "Option"),
          image: optionalText(item.image),
        };
      }),
    };
  });
}

function normalizeVariations(value: unknown): ProductVariation[] {
  return array(value).map((rawVariation) => {
    const variation = record(rawVariation);
    return {
      id: number(variation.id),
      skuId: text(variation.skuId ?? variation.sku_id),
      name: text(variation.name),
      price: number(variation.price),
      originalPrice: optionalNumber(
        variation.originalPrice ?? variation.original_price,
      ),
      image: optionalText(variation.image),
      available: variation.available !== false,
      valueIds: array(variation.valueIds ?? variation.value_ids).map((id) =>
        number(id),
      ),
    };
  });
}

export function normalizeProduct(value: unknown): Product {
  const raw = record(value);
  const code = codeFrom(
    raw.code ?? raw.product_code ?? raw.source_product_id ?? raw.slug,
  );
  const image = optionalText(raw.image ?? raw.main_image);
  const images = array(raw.images)
    .map((item) => text(item))
    .filter(Boolean);

  return {
    id: optionalNumber(raw.id),
    code,
    name: text(
      raw.name ??
        raw.display_name ??
        raw.product_name ??
        raw.title_en ??
        raw.product_code,
      `CN-${code}`,
    ),
    image,
    images: Array.from(new Set([image, ...images].filter(Boolean))) as string[],
    videoUrl: optionalText(raw.videoUrl ?? raw.video_url),
    price: number(raw.price ?? raw.price_min),
    originalPrice: optionalNumber(raw.originalPrice ?? raw.original_price),
    currency: text(raw.currencySymbol ?? raw.currency_symbol, "$"),
    discountPercent: optionalNumber(
      raw.discountPercent ?? raw.discount_percent ?? raw.flash_discount,
    ),
    category: optionalText(raw.category),
    categoryId: optionalNumber(raw.categoryId ?? raw.category_id),
    rating: optionalNumber(raw.rating),
    ratingCount: number(raw.ratingCount ?? raw.reviews_count),
    soldCount: optionalNumber(raw.soldCount ?? raw.sales_count),
    description: optionalText(raw.description),
    storeName: optionalText(raw.storeName ?? raw.store_name),
    available: raw.available !== false,
    options: normalizeOptions(raw.options),
    variations: normalizeVariations(raw.variations),
    props: normalizeProps(raw.props ?? raw.product_props),
    related: array(raw.related).map(normalizeProduct),
  };
}

export function normalizeBanner(value: unknown): Banner | null {
  const raw = record(value);
  const image = optionalText(
    raw.image ?? raw.imageUrl ?? raw.image_url ?? raw.desktopImage,
  );
  if (!image) return null;
  return {
    id: optionalNumber(raw.id),
    title: optionalText(raw.title),
    subtitle: optionalText(raw.subtitle),
    image,
  };
}

export function normalizeCategory(value: unknown): CategorySummary | null {
  const raw = record(value);
  const id = optionalNumber(raw.id);
  const name = optionalText(raw.name);
  const slug = optionalText(raw.slug);
  if (id === undefined || !name || !slug) return null;
  return { id, name, slug, image: optionalText(raw.image) };
}

export function normalizePageShape(value: unknown): CmsPageShape | null {
  const raw = record(value);
  const slug = optionalText(raw.slug);
  const title = optionalText(raw.title);
  if (!slug || !title) return null;
  return { slug, title, sectionCount: array(raw.sections).length };
}

export const asRecord = record;
export const asArray = array;
