import type { Brand, ClosetItem, Outfit, OutfitMode, Product, Retailer, StyleProfile } from "@/lib/types";
import type { ParsedRequest } from "@/lib/ai/stylist";

/**
 * Mira client SDK.
 *
 * The ONE place the app talks to the backend. Every screen (and any future iOS /
 * Android client) calls these typed methods instead of importing engines or data
 * directly — so swapping the in-memory backend for real services is invisible to
 * the UI. Set NEXT_PUBLIC_API_BASE_URL (or pass a base) to point a native client
 * at the deployed API.
 */

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export class ApiClientError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api/v1${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new ApiClientError("invalid_response", "Server returned a non-JSON response", res.status);
  }
  if (!res.ok || (json as { error?: unknown }).error) {
    const err = (json as { error?: { code?: string; message?: string } }).error;
    throw new ApiClientError(err?.code ?? "request_failed", err?.message ?? "Request failed", res.status);
  }
  return (json as { data: T }).data;
}

// --- response shapes ---
export interface ProductListResult {
  products: Product[];
  total: number;
  limit: number;
  offset: number;
}
export interface ProductDetail {
  product: Product;
  brand: Brand | null;
  retailer: Retailer | null;
  affiliateUrl: string;
}
export interface FeedResult {
  recommended: Product[];
  trending: Product[];
  newArrivals: Product[];
  onSale: Product[];
}
export interface StylistResult {
  outfit: Outfit;
  parsed: ParsedRequest;
  overBudget: boolean;
}

export interface ProductQuery {
  category?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  limit?: number;
  offset?: number;
}

export const api = {
  health: () => fetchJson<{ status: string; version: string; time: string }>("/health"),

  products: {
    list: (query: ProductQuery = {}) => {
      const sp = new URLSearchParams();
      if (query.category) sp.set("category", query.category);
      if (query.q) sp.set("q", query.q);
      if (query.minPrice != null) sp.set("minPrice", String(query.minPrice));
      if (query.maxPrice != null) sp.set("maxPrice", String(query.maxPrice));
      if (query.inStock) sp.set("inStock", "1");
      if (query.limit != null) sp.set("limit", String(query.limit));
      if (query.offset != null) sp.set("offset", String(query.offset));
      const qs = sp.toString();
      return fetchJson<ProductListResult>(`/products${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => fetchJson<ProductDetail>(`/products/${encodeURIComponent(id)}`),
  },

  feed: (profile: Partial<StyleProfile>) =>
    fetchJson<FeedResult>("/feed", { method: "POST", body: JSON.stringify({ profile }) }),

  stylist: {
    generate: (req: { prompt?: string; mode?: OutfitMode; profile: Partial<StyleProfile>; buildAround?: ClosetItem[] }) =>
      fetchJson<StylistResult>("/stylist", { method: "POST", body: JSON.stringify(req) }),
  },
};
