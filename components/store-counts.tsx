"use client";

import { useStore } from "./store-provider";

export function StoreCounts() {
  const { cart, wishlist, hydrated } = useStore();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <span className="store-counts" aria-label="Saved item counts">
      <span>
        Wish <b>{hydrated ? wishlist.length : "—"}</b>
      </span>
      <span>
        Bag <b>{hydrated ? cartCount : "—"}</b>
      </span>
    </span>
  );
}
