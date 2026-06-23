import { ok, API_VERSION } from "@/lib/services/envelope";

export const dynamic = "force-dynamic";

/** Liveness probe for ops / uptime monitoring. */
export async function GET() {
  return ok({ status: "ok", version: API_VERSION, time: new Date().toISOString() });
}
