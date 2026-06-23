import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/services/envelope";
import type { StyleProfile } from "@/lib/types";
import { recommendedForYou, trendingNow, newArrivals, onSale } from "@/lib/data/feed";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/feed  { profile?: Partial<StyleProfile> }
 *
 * The personalized home feed. Stateless by design: the client sends the profile
 * (today from localStorage; in production the server reads it from the authed
 * user's DB record and `profile` becomes optional). Same response either way.
 */
export async function POST(req: NextRequest) {
  let profile: StyleProfile;
  try {
    const body = (await req.json()) as { profile?: Partial<StyleProfile> };
    profile = normalizeProfile(body.profile);
  } catch {
    return fail("bad_request", "Body must be JSON { profile? }");
  }

  return ok({
    recommended: recommendedForYou(profile),
    trending: trendingNow(),
    newArrivals: newArrivals(),
    onSale: onSale(),
  });
}

function normalizeProfile(p?: Partial<StyleProfile>): StyleProfile {
  return {
    name: p?.name ?? "",
    sizes: p?.sizes ?? {},
    budget: p?.budget ?? 400,
    favoriteBrandIds: p?.favoriteBrandIds ?? [],
    colorPreferences: p?.colorPreferences ?? [],
    colorAvoids: p?.colorAvoids ?? [],
    fitPreference: p?.fitPreference ?? "regular",
    styleKeywords: p?.styleKeywords ?? [],
    onboarded: p?.onboarded ?? false,
    ...p,
  };
}
