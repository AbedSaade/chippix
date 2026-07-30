import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseCategoryListing } from "../lib/chibox/parse-list";

describe("parseCategoryListing", () => {
  it("extracts, decodes, associates images, and de-duplicates products", () => {
    const html = readFileSync(
      join(process.cwd(), "tests/fixtures/category-listing.html"),
      "utf8",
    );
    const listing = parseCategoryListing(html);

    expect(listing.products).toHaveLength(2);
    expect(listing.products[0]).toMatchObject({
      code: "1051385121470",
      price: 0.9045,
      currency: "$",
      name: expect.stringContaining("quick-drying"),
      image: expect.stringContaining("long-title.jpg"),
    });
    expect(listing.products[1]).toMatchObject({
      code: "933022695798",
      name: "CN-933022695798",
      price: 1.9318,
    });
    expect(listing.total).toBe(49);
    expect(listing.hasNext).toBe(true);
  });
});
