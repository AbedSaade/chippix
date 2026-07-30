export type ContentPage = {
  title: string;
  eyebrow: string;
  intro: string;
  sections: { title: string; body: string }[];
};

export const CONTENT_PAGES: Record<string, ContentPage> = {
  "about-us": {
    title: "A map, not another warehouse.",
    eyebrow: "About Shippix",
    intro:
      "Shippix is an independent interface for navigating a very large, very changeable product catalog. We do not hold inventory, copy a storefront, or pretend rough source data is polished retail prose.",
    sections: [
      {
        title: "Why it exists",
        body: "Wholesale catalogs are full of useful things and difficult decisions. Shippix makes their category structure legible, keeps context while you browse, and presents uncertain data honestly.",
      },
      {
        title: "What “live” means",
        body: "Products, availability, and prices are read from the source catalog. When the source cannot supply a shelf, Shippix shows an empty shelf rather than an old or fabricated one.",
      },
      {
        title: "What it is not",
        body: "Shippix is not the source company and does not operate its stores, fulfillment network, payments, or customer accounts. It is a browsing layer with a deliberately independent identity.",
      },
    ],
  },
  "help-center": {
    title: "Start broad. Narrow without losing your place.",
    eyebrow: "Help center",
    intro:
      "The catalog is organized as a three-level atlas: department, branch, and leaf. Every category page shows where you are and nearby paths you can take.",
    sections: [
      {
        title: "Finding a category",
        body: "Open the complete index from the Catalog menu. Choose one of 30 departments, then follow the numbered branch cards until you reach a live shelf.",
      },
      {
        title: "Searching",
        body: "Use concrete nouns and materials. Search results deliberately omit exact totals because the upstream index changes between otherwise identical requests.",
      },
      {
        title: "Saving products",
        body: "Wishlist and bag items are stored in your browser. They survive reloads on this device, but do not sync to another device or create an account.",
      },
    ],
  },
  "contact-us": {
    title: "Questions need the right destination.",
    eyebrow: "Contact",
    intro:
      "Shippix can help explain this interface. Product manufacturing, fulfillment, and order questions belong with the eventual seller or source platform.",
    sections: [
      {
        title: "About a listing",
        body: "Keep the full CN catalog code shown on the product page. It is the most reliable identifier when names are missing, translated, or unusually long.",
      },
      {
        title: "About Shippix",
        body: "For interface feedback, include the page address, what you expected, and what happened. Never include payment details, passwords, or private account information.",
      },
    ],
  },
  shipping: {
    title: "Browsing is live. Shipping is not connected.",
    eyebrow: "Shipping",
    intro:
      "Shippix currently has no checkout, order API, or fulfillment relationship with the products it displays. We therefore cannot quote delivery dates, shipping charges, or destinations.",
    sections: [
      {
        title: "Before checkout exists",
        body: "A product can be saved to your bag, but the bag ends in a clear unavailable state. No order is placed and no payment or address is collected.",
      },
      {
        title: "Product availability",
        body: "Availability reflects the live source response at the time a product page loads. It is not a reservation and may change before a future purchasing flow becomes available.",
      },
    ],
  },
  support: {
    title: "Honest limits make better support.",
    eyebrow: "Support",
    intro:
      "Shippix can preserve your device-local bag and wishlist, help you navigate the taxonomy, and show what the source catalog currently returns.",
    sections: [
      {
        title: "When a shelf is empty",
        body: "The upstream catalog may be slow or unavailable. Shippix does not fill that gap with stale products. Try again later; a clear empty state is expected behavior during an outage.",
      },
      {
        title: "When a name looks strange",
        body: "Some products arrive with only a CN code. Shippix labels these as unlabelled finds and preserves the source code so the listing remains identifiable without inventing a name.",
      },
      {
        title: "Local data",
        body: "Your bag and wishlist live in browser storage. Clearing site data removes them. Shippix cannot recover or sync that device-local state.",
      },
    ],
  },
};
