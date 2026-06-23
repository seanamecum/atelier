import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/services/envelope";
import type { ClosetItem, OutfitMode, StyleProfile } from "@/lib/types";
import { generateOutfit } from "@/lib/ai/stylist";

export const dynamic = "force-dynamic";

interface StylistRequest {
  prompt?: string;
  mode?: OutfitMode;
  profile?: Partial<StyleProfile>;
  buildAround?: ClosetItem[];
}

/**
 * POST /api/v1/stylist
 *   { prompt, mode?, profile?, buildAround? } -> { outfit, parsed, overBudget }
 *
 * The AI stylist endpoint. Today it runs the deterministic engine server-side;
 * swap `generateOutfit` for an LLM call returning the same `Outfit` shape and
 * every client (web + mobile) keeps working. Free-tier rate limiting lives at
 * the gateway / on the authed user record in production.
 */
export async function POST(req: NextRequest) {
  let body: StylistRequest;
  try {
    body = (await req.json()) as StylistRequest;
  } catch {
    return fail("bad_request", "Body must be JSON");
  }
  if (!body.prompt && !body.mode && !body.buildAround?.length) {
    return fail("bad_request", "Provide a prompt, mode, or buildAround items");
  }

  const profile = normalizeProfile(body.profile);
  const result = generateOutfit(profile, {
    prompt: body.prompt,
    mode: body.mode,
    buildAround: body.buildAround,
  });

  return ok({ outfit: result.outfit, parsed: result.parsed, overBudget: result.overBudget });
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
