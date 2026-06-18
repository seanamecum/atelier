/**
 * Analytics seam.
 *
 * A single typed `track()` entry point with an explicit event taxonomy. Today it
 * buffers to memory + console + localStorage (so funnels are inspectable in the
 * prototype); in production swap `sink` for Segment / PostHog / Amplitude without
 * touching any call sites.
 */

export type AnalyticsEvent =
  | { name: "app_open" }
  | { name: "onboarding_complete" }
  | { name: "outfit_generated"; prompt?: string; mode: string; total: number; intents?: string[] }
  | { name: "outfit_saved"; outfitId: string }
  | { name: "outfit_shared"; outfitId: string; method: string }
  | { name: "piece_swapped"; from: string; to: string; direction: "budget" | "upgrade" }
  | { name: "product_viewed"; productId: string; price: number }
  | { name: "add_to_cart"; productId?: string; outfitId?: string; count: number; value: number }
  | { name: "checkout_started"; value: number; retailers: number }
  | { name: "order_confirmed"; value: number; items: number }
  | { name: "tryon_opened"; outfitId: string }
  | { name: "paywall_viewed"; feature: string }
  | { name: "upgrade_started"; plan: string }
  | { name: "subscription_activated"; plan: string };

export interface TrackedEvent {
  event: AnalyticsEvent;
  ts: number;
}

type Sink = (e: TrackedEvent) => void;

const buffer: TrackedEvent[] = [];
const LS_KEY = "mira:analytics";

const consoleSink: Sink = (e) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", e.event.name, e.event);
  }
};

const localSink: Sink = (e) => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const list: TrackedEvent[] = raw ? JSON.parse(raw) : [];
    list.push(e);
    localStorage.setItem(LS_KEY, JSON.stringify(list.slice(-200)));
  } catch {
    /* storage unavailable */
  }
};

let sinks: Sink[] = [consoleSink];
if (typeof window !== "undefined") sinks.push(localSink);

/** Replace sinks (e.g. wire a real provider at app bootstrap). */
export function configureAnalytics(next: Sink[]) {
  sinks = next;
}

export function track(event: AnalyticsEvent): void {
  const e: TrackedEvent = { event, ts: Date.now() };
  buffer.push(e);
  for (const s of sinks) {
    try {
      s(e);
    } catch {
      /* never let analytics break the app */
    }
  }
}

/** Inspect the in-memory funnel (used by the prototype's debug surfaces). */
export function recentEvents(): TrackedEvent[] {
  return [...buffer];
}
