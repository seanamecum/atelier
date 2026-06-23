import { NextResponse } from "next/server";

/**
 * Standard API envelope shared by every /api/v1 route.
 *
 * Keeping one response shape (`{ data }` / `{ error }`) means the web client and
 * any future native app parse responses identically. Versioned under /api/v1 so
 * the contract can evolve without breaking shipped mobile binaries.
 */

export interface ApiError {
  error: { code: string; message: string };
}

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ data }, init);
}

export function fail(code: string, message: string, status = 400): NextResponse {
  return NextResponse.json({ error: { code, message } } satisfies ApiError, { status });
}

export const API_VERSION = "v1";
