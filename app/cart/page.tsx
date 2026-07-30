import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Your bag" };

export default function CartPage() {
  return (
    <main id="main" className="route-shell">
      <header className="page-intro">
        <p className="eyebrow">Device-local bag</p>
        <h1>Held for later.</h1>
        <p>Your selections persist in this browser. No account required.</p>
      </header>
      <CartView />
    </main>
  );
}
