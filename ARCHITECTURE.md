# Mira — Architecture (web-first, API-first, mobile-ready)

Mira is built so the **website is the product today** and **iOS/Android are clients
tomorrow** — both talking to the *same* versioned HTTP API. Nothing about the
mobile expansion requires re-writing business logic; it requires building thin
native UIs against the contract below.

```
                ┌─────────────────────────────────────────────┐
                │                 Clients                      │
                │  Web (Next.js)   iOS (Swift)   Android (KMP) │
                └───────────────┬───────────────┬─────────────┘
                                │  HTTPS / JSON  │
                                ▼                ▼
                ┌─────────────────────────────────────────────┐
                │            Mira API  (/api/v1/*)             │
                │  REST · versioned · one response envelope    │
                ├───────────┬───────────┬──────────┬──────────┤
                │  Stylist  │  Catalog  │  Feed/   │  Commerce │
                │  (AI)     │  /Search  │  Reco    │  /Orders  │
                └─────┬─────┴─────┬─────┴────┬─────┴────┬──────┘
                      ▼           ▼          ▼          ▼
   ┌──────────┐  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐
   │ LLM /    │  │ Postgres│ │ Reco    │ │ Auth     │ │ Stripe  │
   │ ImageGen │  │ +Prisma │ │ engine  │ │(Clerk..) │ │ Payments│
   └──────────┘  └─────────┘ └─────────┘ └──────────┘ └─────────┘
                      │
                 ┌─────────┐
                 │ S3 /    │  user photos, closet images
                 │Cloudinary│
                 └─────────┘
```

## Service separation

| Concern | Today (in this repo) | Production swap |
| --- | --- | --- |
| **Frontend** | Next.js App Router + Tailwind, calls the API via `lib/services/api.ts` | unchanged |
| **Backend/API** | Next.js Route Handlers under `src/app/api/v1/*` | same routes, or split to a dedicated Node/Nest service — contract identical |
| **Database** | in-memory `lib/data/*` | PostgreSQL + Prisma (`prisma/schema.prisma`) |
| **Auth** | passwordless local seam (`lib/auth`) | Clerk / Supabase Auth / Auth.js (magic-link, passkeys) → `User.authProviderId` |
| **AI services** | deterministic `lib/ai/stylist.ts` | LLM behind `/api/v1/stylist`; image model behind try-on |
| **Recommendations** | `lib/data/feed.ts` | dedicated reco service / vector store behind `/api/v1/feed` |
| **Storage** | client data-URLs | S3 / Cloudinary (`*PhotoUrl` keys in schema) |
| **Payments** | explicit-confirm mock at checkout | Stripe (web) / StoreKit + Play Billing (mobile) |
| **Analytics** | `lib/analytics` (console + localStorage sink) | PostHog / Mixpanel / GA sink — same `track()` taxonomy |

## API contract (`/api/v1`)

One envelope everywhere: success `{ "data": ... }`, failure `{ "error": { code, message } }`.

| Method & path | Purpose |
| --- | --- |
| `GET /health` | liveness/version probe |
| `GET /products?category&q&minPrice&maxPrice&inStock&limit&offset` | catalog + search (paginated) |
| `GET /products/:id` | product detail + brand/retailer + affiliate URL |
| `POST /feed` `{ profile }` | personalized feed: recommended / trending / new / on-sale |
| `POST /stylist` `{ prompt, mode?, profile, buildAround? }` | AI outfit generation → `{ outfit, parsed, overBudget }` |

Stateless by design: the client sends `profile` in the body today; once auth + DB
land, the server reads it from the authed `User` and `profile` becomes optional —
**the response shape does not change**, so shipped mobile binaries keep working.
That's the whole point of versioning under `/api/v1`.

The web app already consumes `/api/v1/stylist` over HTTP from the stylist screen,
proving the frontend → API → engine path end-to-end. The remaining screens call
the same SDK methods (`api.products`, `api.feed`) — flip them from direct calls to
SDK calls with zero contract change.

## Auth & security

- **Passwordless** — no password is ever entered or stored. Production uses
  magic-link / passkeys via the auth provider; the API trusts a verified session
  (JWT/`Authorization: Bearer`) and resolves `User.authProviderId`.
- **Rate limiting** — free-tier styling cap moves from the client counter to a
  server check on `GenerationLog` (per-user, per-day) + gateway throttling.
- **Never auto-purchase** — checkout requires explicit user confirmation; the API
  only ever *prepares* retailer hand-off, it does not place charges autonomously.
- Secrets via env (`DATABASE_URL`, provider keys); CORS locked to known clients.

## Mobile expansion (Phase 4)

Native apps are pure clients of `/api/v1`:
1. Point the SDK base at the deployed API (`NEXT_PUBLIC_API_BASE_URL` ⇒ native
   build config).
2. Rebuild the UI natively (SwiftUI / Compose) against the documented contract.
3. Reuse auth (provider SDKs exist for iOS/Android), Stripe→StoreKit/Play Billing
   for subscriptions, and the identical stylist/feed/catalog endpoints.

No business logic is re-implemented on device — it lives behind the API.

## Phased roadmap mapping

- **Phase 1 — Website MVP** ✅ accounts (seam), style profiles, AI generation over
  HTTP, saved outfits, collections.
- **Phase 2 — Virtual try-on** ✅ figure renderer + fit/size confidence; image-model
  provider is the documented swap.
- **Phase 3 — Digital closet** ✅ uploads, real color detection, packing + seasonal
  planners.
- **Phase 4 — Mobile** ⏳ ship native clients against `/api/v1`.
