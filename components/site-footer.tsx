import Link from "next/link";

const links = [
  ["About", "/about-us"],
  ["Help", "/help-center"],
  ["Contact", "/contact-us"],
  ["Shipping", "/shipping"],
  ["Support", "/support"],
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer__mark">shippix</p>
      <p className="site-footer__statement">
        A live field guide to a catalog that refuses to sit still.
      </p>
      <nav aria-label="Information">
        {links.map(([label, href]) => (
          <Link href={href} key={href}>
            {label}
          </Link>
        ))}
      </nav>
      <small>
        Product availability and pricing are read live from the source catalog.
        Chippix is an independent browsing interface.
      </small>
    </footer>
  );
}
