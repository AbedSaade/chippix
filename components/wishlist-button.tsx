"use client";

import type { Product } from "@/lib/chibox";
import { useStore } from "./store-provider";

export function WishlistButton({
  product,
}: {
  product: Pick<Product, "code" | "name" | "image" | "price" | "currency">;
}) {
  const { toggleWishlist, isWished } = useStore();
  const wished = isWished(product.code);

  return (
    <button
      className="wish-button"
      type="button"
      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wished}
      onClick={() => toggleWishlist({ ...product, quantity: 1 })}
    >
      <span aria-hidden="true">{wished ? "♥" : "♡"}</span>
    </button>
  );
}
