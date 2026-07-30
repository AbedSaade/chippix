import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/chibox";
import {
  formatPrice,
  productDisplay,
  productHref,
} from "@/lib/products/presentation";
import { WishlistButton } from "./wishlist-button";

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const display = productDisplay(product);

  return (
    <article className="product-card" data-derived={display.isDerived}>
      <div className="product-card__visual">
        <Link href={productHref(product)} aria-label={`View ${display.title}`}>
          {product.image ? (
            <Image
              src={product.image}
              alt=""
              fill
              sizes="(max-width: 620px) 50vw, (max-width: 1100px) 33vw, 25vw"
              className="product-card__image"
              priority={index < 4}
            />
          ) : (
            <span className="image-missing" aria-hidden="true">
              no image
            </span>
          )}
        </Link>
        <span className="product-card__index" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <WishlistButton product={product} />
      </div>
      <Link className="product-card__body" href={productHref(product)}>
        <span className="product-card__kicker">{display.kicker}</span>
        <h3 title={product.name}>{display.title}</h3>
        <span className="product-card__foot">
          <strong>{formatPrice(product.currency, product.price)}</strong>
          <span aria-hidden="true">↗</span>
        </span>
      </Link>
    </article>
  );
}
