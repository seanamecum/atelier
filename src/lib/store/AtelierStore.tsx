"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type {
  Cart,
  CartLine,
  ClosetItem,
  Order,
  Outfit,
  StyleProfile,
} from "@/lib/types";
import { getProduct } from "@/lib/data/catalog";
import { uid } from "@/lib/utils/format";

// ---------------------------------------------------------------------------
// Persisted shape
// ---------------------------------------------------------------------------

interface Streak {
  count: number;
  lastActive: string; // YYYY-MM-DD
}

interface PersistedState {
  profile: StyleProfile;
  closet: ClosetItem[];
  outfits: Record<string, Outfit>;
  savedIds: string[];
  lastOutfitId: string | null;
  cart: Cart;
  order: Order | null;
  recentlyViewedIds: string[];
  streak: Streak;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

const STORAGE_KEY = "atelier:v1";

const DEFAULT_PROFILE: StyleProfile = {
  name: "",
  sizes: {},
  budget: 400,
  favoriteBrandIds: [],
  colorPreferences: [],
  colorAvoids: [],
  fitPreference: "regular",
  styleKeywords: [],
  onboarded: false,
};

const INITIAL: PersistedState = {
  profile: DEFAULT_PROFILE,
  closet: [],
  outfits: {},
  savedIds: [],
  lastOutfitId: null,
  cart: { lines: [] },
  order: null,
  recentlyViewedIds: [],
  streak: { count: 0, lastActive: "" },
};

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AtelierContextValue extends PersistedState {
  hydrated: boolean;

  // profile
  updateProfile: (patch: Partial<StyleProfile>) => void;
  completeOnboarding: () => void;
  setBodyPhoto: (dataUrl: string | undefined) => void;

  // closet
  addClosetItem: (item: Omit<ClosetItem, "id">) => void;
  removeClosetItem: (id: string) => void;

  // outfits
  storeOutfit: (outfit: Outfit) => void;
  getOutfit: (id: string) => Outfit | undefined;
  toggleSaveOutfit: (outfit: Outfit) => void;
  isSaved: (id: string) => boolean;
  savedOutfits: () => Outfit[];

  // cart
  addToCart: (line: CartLine) => void;
  addOutfitToCart: (outfit: Outfit) => number;
  updateCartQty: (productId: string, size: string, qty: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;

  // checkout
  createPendingOrder: () => Order;
  confirmOrder: () => void;
  resetOrder: () => void;

  // engagement
  recordView: (productId: string) => void;
  recentlyViewedIds: string[];
  streak: Streak;
}

const AtelierContext = createContext<AtelierContextValue | null>(null);

export function AtelierProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const didLoad = useRef(false);

  // Load once on mount.
  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        // Daily streak: +1 if last active yesterday, reset if older, hold if today.
        const prev = parsed.streak ?? { count: 0, lastActive: "" };
        const today = todayKey();
        const streak: Streak =
          prev.lastActive === today
            ? prev
            : prev.lastActive === yesterdayKey()
              ? { count: prev.count + 1, lastActive: today }
              : { count: 1, lastActive: today };
        setState({
          ...INITIAL,
          ...parsed,
          profile: { ...DEFAULT_PROFILE, ...parsed.profile },
          cart: parsed.cart ?? { lines: [] },
          recentlyViewedIds: parsed.recentlyViewedIds ?? [],
          streak,
        });
      } else {
        setState((s) => ({ ...s, streak: { count: 1, lastActive: todayKey() } }));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  // Persist on change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full / unavailable */
    }
  }, [state, hydrated]);

  const patch = (p: Partial<PersistedState>) => setState((s) => ({ ...s, ...p }));

  const value = useMemo<AtelierContextValue>(() => {
    const cartCount = state.cart.lines.reduce((t, l) => t + l.qty, 0);
    const cartSubtotal = state.cart.lines.reduce((t, l) => {
      const p = getProduct(l.productId);
      return t + (p ? p.price * l.qty : 0);
    }, 0);

    return {
      ...state,
      hydrated,

      updateProfile: (p) =>
        setState((s) => ({ ...s, profile: { ...s.profile, ...p } })),

      completeOnboarding: () =>
        setState((s) => ({ ...s, profile: { ...s.profile, onboarded: true } })),

      setBodyPhoto: (dataUrl) =>
        setState((s) => ({ ...s, profile: { ...s.profile, bodyPhoto: dataUrl } })),

      addClosetItem: (item) =>
        setState((s) => ({
          ...s,
          closet: [...s.closet, { ...item, id: uid("closet") }],
        })),

      removeClosetItem: (id) =>
        setState((s) => ({ ...s, closet: s.closet.filter((c) => c.id !== id) })),

      storeOutfit: (outfit) =>
        setState((s) => ({
          ...s,
          outfits: { ...s.outfits, [outfit.id]: outfit },
          lastOutfitId: outfit.id,
        })),

      getOutfit: (id) => state.outfits[id],

      toggleSaveOutfit: (outfit) =>
        setState((s) => {
          const saved = s.savedIds.includes(outfit.id);
          return {
            ...s,
            outfits: { ...s.outfits, [outfit.id]: { ...outfit, saved: !saved } },
            savedIds: saved
              ? s.savedIds.filter((x) => x !== outfit.id)
              : [...s.savedIds, outfit.id],
          };
        }),

      isSaved: (id) => state.savedIds.includes(id),

      savedOutfits: () =>
        state.savedIds
          .map((id) => state.outfits[id])
          .filter((o): o is Outfit => Boolean(o))
          .sort((a, b) => b.createdAt - a.createdAt),

      addToCart: (line) =>
        setState((s) => {
          const existing = s.cart.lines.find(
            (l) => l.productId === line.productId && l.size === line.size,
          );
          const lines = existing
            ? s.cart.lines.map((l) =>
                l === existing ? { ...l, qty: l.qty + line.qty } : l,
              )
            : [...s.cart.lines, line];
          return { ...s, cart: { lines } };
        }),

      addOutfitToCart: (outfit) => {
        let added = 0;
        setState((s) => {
          const lines = [...s.cart.lines];
          for (const piece of outfit.pieces) {
            if (piece.fromCloset) continue;
            const p = getProduct(piece.productId);
            if (!p) continue;
            const existing = lines.find(
              (l) => l.productId === piece.productId && l.size === piece.recommendedSize,
            );
            if (existing) existing.qty += 1;
            else
              lines.push({
                productId: piece.productId,
                size: piece.recommendedSize,
                qty: 1,
                outfitId: outfit.id,
              });
            added += 1;
          }
          return { ...s, cart: { lines } };
        });
        return added;
      },

      updateCartQty: (productId, size, qty) =>
        setState((s) => ({
          ...s,
          cart: {
            lines: s.cart.lines
              .map((l) =>
                l.productId === productId && l.size === size ? { ...l, qty } : l,
              )
              .filter((l) => l.qty > 0),
          },
        })),

      removeFromCart: (productId, size) =>
        setState((s) => ({
          ...s,
          cart: {
            lines: s.cart.lines.filter(
              (l) => !(l.productId === productId && l.size === size),
            ),
          },
        })),

      clearCart: () => patch({ cart: { lines: [] } }),

      cartCount,
      cartSubtotal,

      createPendingOrder: () => {
        const subtotal = cartSubtotal;
        const shipping = subtotal > 250 || subtotal === 0 ? 0 : 12;
        const tax = +(subtotal * 0.0875).toFixed(2);
        const order: Order = {
          id: uid("order"),
          lines: state.cart.lines,
          subtotal,
          shipping,
          tax,
          total: +(subtotal + shipping + tax).toFixed(2),
          status: "pending-confirmation",
          createdAt: Date.now(),
        };
        patch({ order });
        return order;
      },

      confirmOrder: () =>
        setState((s) =>
          s.order
            ? { ...s, order: { ...s.order, status: "confirmed" }, cart: { lines: [] } }
            : s,
        ),

      resetOrder: () => patch({ order: null }),

      recordView: (productId) =>
        setState((s) => ({
          ...s,
          recentlyViewedIds: [productId, ...s.recentlyViewedIds.filter((id) => id !== productId)].slice(0, 12),
        })),

      recentlyViewedIds: state.recentlyViewedIds,
      streak: state.streak,
    };
  }, [state, hydrated]);

  return <AtelierContext.Provider value={value}>{children}</AtelierContext.Provider>;
}

export function useAtelier(): AtelierContextValue {
  const ctx = useContext(AtelierContext);
  if (!ctx) throw new Error("useAtelier must be used within <AtelierProvider>");
  return ctx;
}
