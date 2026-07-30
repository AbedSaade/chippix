import type { Product, ProductProp } from "@/lib/chibox";

const CODE_NAME = /^(?:CN-)?\d{8,}$/i;
const CONTEXT_KEYS = [
  "product category",
  "type",
  "material",
  "purpose",
  "style",
];

export function isCodeOnlyName(name: string) {
  return !name.trim() || CODE_NAME.test(name.trim());
}

function propContext(props: ProductProp[]) {
  for (const key of CONTEXT_KEYS) {
    const match = props.find(
      (prop) =>
        prop.label.toLowerCase().includes(key) &&
        prop.value.length > 2 &&
        !/^(none|other|others|no|yes|\d+)$/i.test(prop.value.trim()),
    );
    if (match) return match.value;
  }
}

export function productDisplay(product: Pick<
  Product,
  "name" | "code" | "category" | "props"
>) {
  if (!isCodeOnlyName(product.name)) {
    return {
      title: product.name,
      kicker: `Catalog ${product.code.slice(-6)}`,
      isDerived: false,
    };
  }

  const context = product.category || propContext(product.props);
  return {
    title: context ? `Unlabelled ${context}` : "Unlabelled catalog find",
    kicker: `Filed as CN-${product.code}`,
    isDerived: true,
  };
}

export function formatPrice(currency: string, price: number) {
  return `${currency}${price.toFixed(2)}`;
}

export function productHref(product: Pick<
  Product,
  "code" | "name" | "price" | "currency"
>) {
  const params = new URLSearchParams({
    n: product.name,
    p: String(product.price),
    c: product.currency,
  });
  return `/products/${product.code}?${params.toString()}`;
}
