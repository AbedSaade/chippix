import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist-view";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <main id="main" className="route-shell">
      <header className="page-intro">
        <p className="eyebrow">Device-local wishlist</p>
        <h1>Things worth another look.</h1>
        <p>Saved only on this device, independent of the moving catalog.</p>
      </header>
      <WishlistView />
    </main>
  );
}
