import type { Account } from "@/lib/types";
import { uid } from "@/lib/utils/format";

/**
 * Authentication seam.
 *
 * Mira ships passwordless by design — no password is ever entered or stored
 * (modern, and avoids handling sensitive credentials). Today identity is
 * local-first: an email maps deterministically to a stable account id so the
 * same email always resolves to the same account on this device.
 *
 * To go live, replace `resolveAccount` with a real provider (Clerk, Supabase
 * Auth, Auth.js magic-link / passkeys). The rest of the app only depends on the
 * `Account` shape and the store's sign-in/out actions, so nothing else changes.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/** Stable id for an email (so re-signing-in returns the same account). */
function idForEmail(email: string): string {
  let h = 0;
  const e = email.trim().toLowerCase();
  for (let i = 0; i < e.length; i++) h = (h * 31 + e.charCodeAt(i)) >>> 0;
  return `acct-${h.toString(36)}`;
}

export function resolveAccount(name: string, email: string): Account {
  return {
    id: idForEmail(email),
    name: name.trim() || email.trim().split("@")[0],
    email: email.trim().toLowerCase(),
    createdAt: Date.now(),
    guest: false,
  };
}

export function guestAccount(): Account {
  return { id: uid("guest"), name: "", email: "", createdAt: Date.now(), guest: true };
}
