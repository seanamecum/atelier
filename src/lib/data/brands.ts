import type { Brand } from "@/lib/types";

export const BRANDS: Brand[] = [
  { id: "everlane", name: "Everlane", tier: "mid" },
  { id: "uniqlo", name: "Uniqlo", tier: "value" },
  { id: "cos", name: "COS", tier: "mid" },
  { id: "theory", name: "Theory", tier: "premium" },
  { id: "acne", name: "Acne Studios", tier: "luxury" },
  { id: "aime", name: "Aimé Leon Dore", tier: "premium" },
  { id: "stone-island", name: "Stone Island", tier: "luxury" },
  { id: "nike", name: "Nike", tier: "mid" },
  { id: "adidas", name: "adidas", tier: "mid" },
  { id: "newbalance", name: "New Balance", tier: "mid" },
  { id: "levis", name: "Levi's", tier: "value" },
  { id: "ralph", name: "Polo Ralph Lauren", tier: "premium" },
  { id: "reformation", name: "Reformation", tier: "premium" },
  { id: "ganni", name: "GANNI", tier: "premium" },
  { id: "lululemon", name: "lululemon", tier: "premium" },
  { id: "common-projects", name: "Common Projects", tier: "luxury" },
  { id: "carhartt", name: "Carhartt WIP", tier: "mid" },
  { id: "arket", name: "ARKET", tier: "mid" },
];

const BRAND_MAP = new Map(BRANDS.map((b) => [b.id, b]));

export function getBrand(id: string): Brand | undefined {
  return BRAND_MAP.get(id);
}
