export type ProductProp = {
  label: string;
  value: string;
};

export type ProductOptionValue = {
  id: number;
  name: string;
  image?: string;
};

export type ProductOption = {
  id: number;
  name: string;
  isColor: boolean;
  values: ProductOptionValue[];
};

export type ProductVariation = {
  id: number;
  skuId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  available: boolean;
  valueIds: number[];
};

export type Product = {
  id?: number;
  code: string;
  name: string;
  image?: string;
  images: string[];
  videoUrl?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  discountPercent?: number;
  category?: string;
  categoryId?: number;
  rating?: number;
  ratingCount: number;
  soldCount?: number;
  description?: string;
  storeName?: string;
  available: boolean;
  options: ProductOption[];
  variations: ProductVariation[];
  props: ProductProp[];
  related: Product[];
};

export type CategorySummary = {
  id: number;
  name: string;
  slug: string;
  image?: string;
};

export type Banner = {
  id?: number;
  title?: string;
  subtitle?: string;
  image: string;
};

export type CmsPageShape = {
  slug: string;
  title: string;
  sectionCount: number;
};

export type HomeData = {
  banners: Banner[];
  categories: CategorySummary[];
  products: Product[];
  hotProducts: Product[];
  dealProducts: Product[];
  pages: CmsPageShape[];
};

export type Listing = {
  products: Product[];
  total?: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
};

export type SearchResult = {
  products: Product[];
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type UpstreamFailureKind =
  | "timeout"
  | "network"
  | "server"
  | "client"
  | "invalid";
