/**
 * Subscription / entitlement model.
 *
 * Two tiers today (free + Mira+). Entitlements are checked through a single
 * `hasFeature` helper so gating is consistent and a real billing backend
 * (Stripe / App Store / Play) can later set `plan` without touching call sites.
 */

export type Plan = "free" | "plus";

export type PremiumFeature =
  | "unlimited-styling"
  | "advanced-tryon" // side/back views, compare, color swap
  | "early-trends"
  | "concierge"
  | "packing-plans";

export const FREE_DAILY_GENERATIONS = 3;

export interface PlanInfo {
  id: Plan;
  name: string;
  priceMonthly: number;
  blurb: string;
  features: string[];
}

export const PLANS: Record<Plan, PlanInfo> = {
  free: {
    id: "free",
    name: "Mira",
    priceMonthly: 0,
    blurb: "Style, try on, and shop.",
    features: [
      `${FREE_DAILY_GENERATIONS} AI stylings per day`,
      "Virtual try-on (front view)",
      "Digital closet & saved looks",
      "One-bag checkout",
    ],
  },
  plus: {
    id: "plus",
    name: "Mira+",
    priceMonthly: 12,
    blurb: "Your personal AI shopper, unlimited.",
    features: [
      "Unlimited AI stylings",
      "Advanced try-on — side & back views, compare, color swap",
      "Personal AI shopper & concierge looks",
      "Early access to trends & drops",
      "Packing lists & seasonal wardrobe plans",
    ],
  },
};

const ENTITLEMENTS: Record<Plan, PremiumFeature[]> = {
  free: [],
  plus: ["unlimited-styling", "advanced-tryon", "early-trends", "concierge", "packing-plans"],
};

export function hasFeature(plan: Plan, feature: PremiumFeature): boolean {
  return ENTITLEMENTS[plan].includes(feature);
}
