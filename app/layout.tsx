import type { Metadata } from "next";
import { headers } from "next/headers";
import { Fraunces, Inter } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreProvider } from "@/components/store-provider";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const rawHost =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const host = rawHost?.replace(/[^a-zA-Z0-9.:[\]-]/g, "") || "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: {
      default: "Shippix — Find the useful thing",
      template: "%s / Shippix",
    },
    description: "A better way through a very big catalog.",
    openGraph: {
      type: "website",
      title: "Shippix — Find the useful thing",
      description: "A live field guide to 1.64 million products.",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1732,
          height: 908,
          alt: "Shippix — Find the useful thing",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Shippix — Find the useful thing",
      description: "A live field guide to 1.64 million products.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <StoreProvider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <SiteHeader />
          {children}
          <SiteFooter />
        </StoreProvider>
      </body>
    </html>
  );
}
