"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Product, ProductVariation } from "@/lib/chibox";
import { formatPrice, productDisplay } from "@/lib/products/presentation";
import { useStore } from "./store-provider";
import { WishlistButton } from "./wishlist-button";

function initialSelection(product: Product) {
  return Object.fromEntries(
    product.options
      .filter((option) => option.values.length > 0)
      .map((option) => [option.id, option.values[0].id]),
  );
}

function resolves(
  variation: ProductVariation,
  selected: Record<number, number>,
  optionCount: number,
) {
  const ids = Object.values(selected);
  return (
    ids.length === optionCount &&
    ids.every((id) => variation.valueIds.includes(id))
  );
}

export function ProductConfigurator({ product }: { product: Product }) {
  const display = productDisplay(product);
  const { addToCart } = useStore();
  const [selected, setSelected] = useState<Record<number, number>>(() =>
    initialSelection(product),
  );
  const [activeImage, setActiveImage] = useState(
    product.image ?? product.images[0],
  );
  const [notice, setNotice] = useState("");

  const variation = useMemo(
    () =>
      product.variations.find((item) =>
        resolves(item, selected, product.options.length),
      ),
    [product.options.length, product.variations, selected],
  );
  const price = variation?.price ?? product.price;
  const images = Array.from(
    new Set([activeImage, ...product.images].filter(Boolean)),
  ) as string[];

  function choose(optionId: number, valueId: number, image?: string) {
    setSelected((current) => ({ ...current, [optionId]: valueId }));
    if (image) setActiveImage(image);
    setNotice("");
  }

  function isPossible(optionId: number, valueId: number) {
    if (product.variations.length === 0) return true;
    const candidate = { ...selected, [optionId]: valueId };
    const candidateIds = Object.values(candidate);
    return product.variations.some(
      (item) =>
        item.available &&
        candidateIds.every((id) => item.valueIds.includes(id)),
    );
  }

  function add() {
    if (product.options.length > 0 && !variation) {
      setNotice("Choose one value from each option first.");
      return;
    }
    addToCart({
      code: product.code,
      name: product.name,
      image: variation?.image ?? activeImage ?? product.image,
      price,
      currency: product.currency,
      quantity: 1,
      variationId: variation?.id,
      variationName: variation?.name,
    });
    setNotice("Added to your bag.");
  }

  return (
    <div className="product-detail">
      <div className="product-gallery">
        <div className="product-gallery__main">
          {activeImage ? (
            <Image
              src={activeImage}
              alt={display.title}
              fill
              priority
              sizes="(max-width: 800px) 100vw, 54vw"
            />
          ) : (
            <span className="image-missing">no image</span>
          )}
          <span className="product-gallery__code">CN-{product.code}</span>
        </div>
        {images.length > 1 && (
          <div className="product-gallery__thumbs" aria-label="Product images">
            {images.slice(0, 8).map((image, index) => (
              <button
                type="button"
                key={image}
                aria-label={`Show image ${index + 1}`}
                aria-pressed={activeImage === image}
                onClick={() => setActiveImage(image)}
              >
                <Image src={image} alt="" fill sizes="72px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <section className="product-purchase" aria-labelledby="product-title">
        <p className="eyebrow">{display.kicker}</p>
        <h1 id="product-title">{display.title}</h1>
        {display.isDerived && (
          <p className="product-purchase__raw">
            Source label: <span>{product.name}</span>
          </p>
        )}
        <p className="product-price" aria-live="polite">
          {formatPrice(product.currency, price)}
          {variation && <small>Resolved for {variation.name}</small>}
        </p>

        {product.options.length > 0 && (
          <div className="variant-selector">
            {product.options.map((option) => (
              <fieldset key={option.id}>
                <legend>{option.name}</legend>
                <div className={option.isColor ? "option-grid option-grid--swatch" : "option-grid"}>
                  {option.values.map((value) => {
                    const active = selected[option.id] === value.id;
                    const possible = isPossible(option.id, value.id);
                    return (
                      <button
                        key={value.id}
                        type="button"
                        aria-pressed={active}
                        disabled={!possible}
                        onClick={() =>
                          choose(option.id, value.id, value.image)
                        }
                      >
                        {value.image && (
                          <span className="option-grid__image">
                            <Image src={value.image} alt="" fill sizes="54px" />
                          </span>
                        )}
                        <span>{value.name}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        )}

        <div className="purchase-actions">
          <button
            className="button button--signal"
            type="button"
            onClick={add}
            disabled={!product.available || variation?.available === false}
          >
            {product.available ? "Add to bag" : "Currently unavailable"}
            <span aria-hidden="true">＋</span>
          </button>
          <WishlistButton product={product} />
        </div>
        <p className="purchase-notice" role="status" aria-live="polite">
          {notice}
        </p>
        <dl className="product-facts">
          <div>
            <dt>Availability</dt>
            <dd>{product.available ? "Live at source" : "Unavailable"}</dd>
          </div>
          <div>
            <dt>Catalog code</dt>
            <dd>CN-{product.code}</dd>
          </div>
          <div>
            <dt>Price note</dt>
            <dd>Rounded to two decimals for display</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
