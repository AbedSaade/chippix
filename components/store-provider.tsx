"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/chibox";

export type StoredProduct = Pick<
  Product,
  "code" | "name" | "image" | "price" | "currency"
> & {
  quantity: number;
  variationId?: number;
  variationName?: string;
};

type StoreState = {
  cart: StoredProduct[];
  wishlist: StoredProduct[];
  hydrated: boolean;
  addToCart: (item: StoredProduct) => void;
  removeFromCart: (code: string, variationId?: number) => void;
  setQuantity: (code: string, quantity: number, variationId?: number) => void;
  toggleWishlist: (item: StoredProduct) => void;
  isWished: (code: string) => boolean;
};

const StoreContext = createContext<StoreState | null>(null);
const CART_KEY = "chippix.cart.v1";
const WISHLIST_KEY = "chippix.wishlist.v1";

function readItems(key: string): StoredProduct[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<StoredProduct[]>([]);
  const [wishlist, setWishlist] = useState<StoredProduct[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readItems(CART_KEY));
    setWishlist(readItems(WISHLIST_KEY));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated)
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = useCallback((item: StoredProduct) => {
    setCart((current) => {
      const index = current.findIndex(
        (entry) =>
          entry.code === item.code && entry.variationId === item.variationId,
      );
      if (index < 0) return [...current, item];
      return current.map((entry, itemIndex) =>
        itemIndex === index
          ? { ...entry, quantity: entry.quantity + item.quantity }
          : entry,
      );
    });
  }, []);

  const removeFromCart = useCallback((code: string, variationId?: number) => {
    setCart((current) =>
      current.filter(
        (entry) =>
          !(entry.code === code && entry.variationId === variationId),
      ),
    );
  }, []);

  const setQuantity = useCallback(
    (code: string, quantity: number, variationId?: number) => {
      if (quantity <= 0) return removeFromCart(code, variationId);
      setCart((current) =>
        current.map((entry) =>
          entry.code === code && entry.variationId === variationId
            ? { ...entry, quantity }
            : entry,
        ),
      );
    },
    [removeFromCart],
  );

  const toggleWishlist = useCallback((item: StoredProduct) => {
    setWishlist((current) =>
      current.some((entry) => entry.code === item.code)
        ? current.filter((entry) => entry.code !== item.code)
        : [...current, { ...item, quantity: 1 }],
    );
  }, []);

  const value = useMemo<StoreState>(
    () => ({
      cart,
      wishlist,
      hydrated,
      addToCart,
      removeFromCart,
      setQuantity,
      toggleWishlist,
      isWished: (code) => wishlist.some((entry) => entry.code === code),
    }),
    [
      addToCart,
      cart,
      hydrated,
      removeFromCart,
      setQuantity,
      toggleWishlist,
      wishlist,
    ],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
