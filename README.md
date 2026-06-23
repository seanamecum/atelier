# Mira — AI Personal Stylist, Fitting Room & Shopping Assistant

Describe the outfit you want → see it on your own body → buy the whole look in one place.

Mira is a premium, mobile-first web app that combines three things:

1. **AI personal stylist** — type a natural-language request (“make me a clean summer
   outfit under $200”) and get a complete, occasion-ready outfit with real pieces,
   prices, brands, retailers, recommended sizes and a full-look total.
2. **Virtual fitting room** — upload a photo and your measurements; recommended pieces
   are placed on your body and sized to you.
3. **One-bag shopping** — add an entire look to your bag across multiple retailers and
   check out once. **Mira never auto-purchases — you always confirm.**

> Everything here is a working, fully-offline **prototype**: the catalog, AI stylist,
> and try-on are mocked but architected so real AI / retailer / image / payment APIs
> drop in behind stable interfaces.

## Shareable demo

[`Mira-Demo.html`](Mira-Demo.html) is the entire experience in one self-contained file —
no install, no server. Double-click it (or email it to anyone) and explore the full flow in any
browser, on desktop or phone: describe a look, watch the AI assemble it under budget from real
brands, see it on a body in the fitting room, then run the one-bag, explicit-confirm checkout.
The same stylist engine, catalog, and design system as the app, ported to run offline on a
single page.

## Run it

```bash
cd atelier
npm install
npm run dev        # http://localhost:3001
```

`npm run build` produces a production build; `npm start` serves it.

## Screens

| Route | Screen |
| --- | --- |
| `/` | Landing |
| `/onboarding` | Intro flow |
| `/profile` | Style profile: sizes, body, budget, brands, colors, fit, taste, photo |
| `/stylist` | AI outfit generator + results |
| `/try-on` | Virtual fitting room |
| `/closet` | Closet upload + “build around my clothes” |
| `/saved` | Saved lookbook |
| `/outfit/[id]` | Full outfit result |
| `/product/[id]` | Product detail (sizes, retailer, affiliate buy link) |
| `/cart` | Bag, grouped by retailer |
| `/checkout` | Review, retailer handoff plan, explicit confirm |
| `/upgrade` | Membership / Mira+ plans |

## API & platform (web-first, mobile-ready)

Mira is API-first so the website is the product today and native iOS/Android can
be thin clients tomorrow — all sharing one backend. See **[ARCHITECTURE.md](ARCHITECTURE.md)**
for the full blueprint and **[prisma/schema.prisma](prisma/schema.prisma)** for the
PostgreSQL data model.

- **Versioned REST API** under `src/app/api/v1/*` (`/health`, `/products`,
  `/products/:id`, `/feed`, `/stylist`) with one `{ data } / { error }` envelope.
- **Typed client SDK** — `src/lib/services/api.ts` is the single place the app talks
  to the backend; the Stylist and Home screens already call it over HTTP. Set
  `NEXT_PUBLIC_API_BASE_URL` so a native client reuses the same API.
- **Environment** — copy [`.env.example`](.env.example) to `.env.local` for the
  production integrations (Postgres/Prisma, auth, Stripe, storage, analytics).
  None are required to run the in-memory prototype. **CI** (`.github/workflows/ci.yml`)
  runs typecheck + build on every push/PR.

## Architecture

```
src/
  app/                    Next.js App Router screens
    (app)/                Authed app shell (sidebar + mobile nav)
  components/
    ui/        Reusable primitives (Price, Stars, ChipSelect, PhotoUpload…)
    visual/    GarmentImage (generated SVG product art), Swatches
    outfit/    ProductCard, OutfitLookboard, OutfitResult, ModeSelector
    tryon/     TryOnCanvas
    layout/    AppShell
  lib/
    types.ts            Domain model (the contract for everything)
    data/               Mock catalog, brands, retailers, preference option sets
    ai/
      stylist.ts        ← Mock AI: parseRequest + budget-aware outfit assembly
      tryon.ts          ← Mock virtual try-on plan builder
    retail/
      affiliate.ts      ← Affiliate links, inventory, multi-retailer cart handoff
    store/
      AtelierStore.tsx  React context + localStorage persistence
    utils/              Formatting helpers
```

### Where the real APIs plug in

The whole app speaks one set of types (`lib/types.ts`). Swapping mocks for real
services is a localized change:

- **AI stylist** → replace `generateOutfit()` in `lib/ai/stylist.ts` with a call to an
  LLM (e.g. Claude) that returns the same `Outfit` shape. `parseRequest` is a ready-made
  few-shot target; the slot recipes become your structured-output schema.
- **Virtual try-on** → replace `buildTryOnPlan()` / `TryOnCanvas` with an
  image-generation / virtual-garment model using the user’s photo + product images.
- **Catalog & inventory** → back `lib/data/catalog.ts` and `checkInventory()` with real
  retailer product feeds. Add an `imageUrl` to `Product` and swap `GarmentImage` for a
  real `<img>`.
- **Affiliate & cart** → `lib/retail/affiliate.ts` already groups a bag by retailer and
  builds a handoff plan; point it at a real affiliate network and retailer cart APIs.
- **Payments** → the checkout confirm step is the single, explicit purchase gate. Wire it
  to Stripe / retailer checkout there.

## Product principles

- **Premium & quiet** — editorial typography, warm paper, a single clay accent.
- **Profile-aware** — outfits respect your sizes, budget, favorite brands, color
  preferences/avoids and style taste.
- **You’re always in control** — Mira proposes and assembles; the user confirms before
  any purchase.
