"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/products/presentation";
import { useStore } from "./store-provider";

export function CartView() {
  const { cart, hydrated, removeFromCart, setQuantity } = useStore();
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const currency = cart[0]?.currency ?? "$";

  if (!hydrated) return <SavedListSkeleton />;
  if (cart.length === 0) {
    return (
      <div className="empty-products">
        <span aria-hidden="true">0</span>
        <p>Your bag is empty.</p>
        <small>Useful things can be added from any product page.</small>
        <Link className="button button--dark" href="/categories">
          Open the index
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <div className="saved-list">
        {cart.map((item) => (
          <article key={`${item.code}-${item.variationId ?? "base"}`}>
            <Link
              className="saved-list__image"
              href={`/products/${item.code}`}
            >
              {item.image && (
                <Image src={item.image} alt="" fill sizes="120px" />
              )}
            </Link>
            <div>
              <p className="eyebrow">CN-{item.code}</p>
              <h2>{item.name}</h2>
              {item.variationName && <small>{item.variationName}</small>}
              <strong>{formatPrice(item.currency, item.price)}</strong>
            </div>
            <div className="quantity-control">
              <button
                type="button"
                aria-label={`Decrease quantity of ${item.name}`}
                onClick={() =>
                  setQuantity(item.code, item.quantity - 1, item.variationId)
                }
              >
                −
              </button>
              <span aria-label={`Quantity ${item.quantity}`}>
                {item.quantity}
              </span>
              <button
                type="button"
                aria-label={`Increase quantity of ${item.name}`}
                onClick={() =>
                  setQuantity(item.code, item.quantity + 1, item.variationId)
                }
              >
                +
              </button>
              <button
                className="remove-button"
                type="button"
                onClick={() => removeFromCart(item.code, item.variationId)}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
      <aside className="cart-summary">
        <p className="eyebrow">Bag summary</p>
        <dl>
          <div>
            <dt>Items</dt>
            <dd>{cart.reduce((sum, item) => sum + item.quantity, 0)}</dd>
          </div>
          <div>
            <dt>Estimated total</dt>
            <dd>{formatPrice(currency, total)}</dd>
          </div>
        </dl>
        <button className="button button--signal" type="button" disabled>
          Checkout unavailable
        </button>
        <p>
          Shippix has no order or payment connection to the source catalog yet.
          Your bag remains saved on this device.
        </p>
      </aside>
    </div>
  );
}

export function SavedListSkeleton() {
  return (
    <div className="saved-list" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <div className="saved-list__skeleton" key={index}>
          <span className="skeleton" />
          <span className="skeleton skeleton--line" />
        </div>
      ))}
    </div>
  );
}
