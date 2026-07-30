export const CHIBOX_ORIGIN = "https://chibox.app";
export const API_VERSION = "v10_0_0";
export const UPSTREAM_TIMEOUT_MS = 8_000;

export const REVALIDATE = {
  home: 300,
  listing: 120,
  product: 60,
  search: 60,
} as const;
