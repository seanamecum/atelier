import type { Retailer } from "@/lib/types";

/**
 * Mock retailer registry. In production this would be backed by retailer
 * integration configs (affiliate network IDs, cart-handoff endpoints, etc.).
 */
export const RETAILERS: Retailer[] = [
  {
    id: "nordstrom",
    name: "Nordstrom",
    affiliateTag: "atelier-20",
    supportsCartHandoff: true,
    baseUrl: "https://www.nordstrom.com",
  },
  {
    id: "ssense",
    name: "SSENSE",
    affiliateTag: "atelier-aff",
    supportsCartHandoff: false,
    baseUrl: "https://www.ssense.com",
  },
  {
    id: "everlane",
    name: "Everlane",
    affiliateTag: "atelier",
    supportsCartHandoff: true,
    baseUrl: "https://www.everlane.com",
  },
  {
    id: "uniqlo",
    name: "Uniqlo",
    affiliateTag: "atelier-cj",
    supportsCartHandoff: false,
    baseUrl: "https://www.uniqlo.com",
  },
  {
    id: "zara",
    name: "Zara",
    affiliateTag: "atelier-rk",
    supportsCartHandoff: true,
    baseUrl: "https://www.zara.com",
  },
  {
    id: "endclothing",
    name: "END.",
    affiliateTag: "atelier-aff",
    supportsCartHandoff: false,
    baseUrl: "https://www.endclothing.com",
  },
  {
    id: "net-a-porter",
    name: "NET-A-PORTER",
    affiliateTag: "atelier-nap",
    supportsCartHandoff: true,
    baseUrl: "https://www.net-a-porter.com",
  },
];

const RETAILER_MAP = new Map(RETAILERS.map((r) => [r.id, r]));

export function getRetailer(id: string): Retailer | undefined {
  return RETAILER_MAP.get(id);
}
