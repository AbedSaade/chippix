"use client";

import { ProductGrid } from "./product-grid";
import { SavedListSkeleton } from "./cart-view";
import { useStore } from "./store-provider";

export function WishlistView() {
  const { wishlist, hydrated } = useStore();
  if (!hydrated) return <SavedListSkeleton />;
  return <ProductGrid products={wishlist.map((item) => ({
    ...item,
    images: item.image ? [item.image] : [],
    ratingCount: 0,
    available: true,
    options: [],
    variations: [],
    props: [],
    related: [],
  }))} />;
}
