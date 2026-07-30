import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="message-page">
      <p className="eyebrow">Error 404 / Misfiled</p>
      <h1>This aisle isn’t in the index.</h1>
      <p>The catalog moves fast, but this address does not point to a shelf.</p>
      <Link className="button button--dark" href="/categories">
        Return to the catalog
      </Link>
    </main>
  );
}
