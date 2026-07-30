import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  formatPrice,
  productDisplay,
} from "../lib/products/presentation";

type FixtureProduct = {
  code: string;
  name: string;
  price: number;
  currency: string;
};

type StressFixtures = {
  codeOnlyNames: FixtureProduct[];
  longestTitles: FixtureProduct[];
  cheapest: FixtureProduct[];
  priciest: FixtureProduct[];
};

const fixtures = JSON.parse(
  readFileSync(join(process.cwd(), "data/stress-fixtures.json"), "utf8"),
) as StressFixtures;

const asPresentationProduct = (fixture: FixtureProduct) => ({
  ...fixture,
  category: undefined,
  props: [],
});

describe("product card presentation under real catalog stress", () => {
  it("owns code-only names instead of repeating a bare SKU as the title", () => {
    for (const fixture of fixtures.codeOnlyNames) {
      const display = productDisplay(asPresentationProduct(fixture));
      expect(display.isDerived).toBe(true);
      expect(display.title).toBe("Unlabelled catalog find");
      expect(display.kicker).toContain(fixture.code);
    }
  });

  it("preserves every hostile long title for accessible/full-title display", () => {
    for (const fixture of fixtures.longestTitles) {
      const display = productDisplay(asPresentationProduct(fixture));
      expect(display.isDerived).toBe(false);
      expect(display.title).toBe(fixture.name);
    }
    expect(fixtures.longestTitles[0].name).toHaveLength(182);
  });

  it("rounds the complete measured price range to two decimals", () => {
    const priced = [...fixtures.cheapest, ...fixtures.priciest];
    for (const fixture of priced) {
      expect(formatPrice(fixture.currency, fixture.price)).toMatch(
        /^\$\d+\.\d{2}$/,
      );
    }
    expect(formatPrice("$", 0.0136)).toBe("$0.01");
    expect(formatPrice("$", 79.5454)).toBe("$79.55");
  });
});
