import type { ClosetItem, Outfit } from "@/lib/types";
import { getProduct } from "@/lib/data/catalog";
import { GarmentImage } from "@/components/visual/GarmentImage";
import { Swatches } from "@/components/visual/Swatches";
import { modeLabel, money, cn } from "@/lib/utils/format";

/**
 * The "full outfit image" — an editorial flat-lay composed from the individual
 * garment illustrations. Stands in for an AI-generated lookbook render.
 */
export function OutfitLookboard({
  outfit,
  closet = [],
  className,
}: {
  outfit: Outfit;
  closet?: ClosetItem[];
  className?: string;
}) {
  const tiles = outfit.pieces.map((piece) => {
    if (piece.fromCloset) {
      const item = closet.find((c) => c.id === piece.closetItemId);
      return {
        key: piece.closetItemId ?? piece.productId,
        category: item?.category ?? "top",
        color: item?.color.hex ?? "#D6CEBF",
        palette: [item?.color.hex ?? "#D6CEBF"],
        label: item?.label ?? "Closet item",
        fromCloset: true,
      };
    }
    const p = getProduct(piece.productId);
    return {
      key: piece.productId,
      category: p?.category ?? "top",
      color: p?.color.hex ?? "#D6CEBF",
      palette: p?.palette ?? [],
      label: p?.name ?? "Piece",
      fromCloset: false,
    };
  });

  // Lead tile = first outerwear/dress/top, gets the large frame.
  const leadIdx = Math.max(
    0,
    tiles.findIndex((t) => ["outerwear", "dress", "top"].includes(t.category)),
  );
  const lead = tiles[leadIdx];
  const rest = tiles.filter((_, i) => i !== leadIdx);

  return (
    <div className={cn("card overflow-hidden bg-gradient-to-b from-paper-50 to-paper-100", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div>
          <p className="eyebrow">{modeLabel(outfit.mode)} look</p>
          <h3 className="font-display text-xl leading-tight text-ink-900">{outfit.title}</h3>
        </div>
        <Swatches colors={outfit.palette} />
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        {lead && (
          <figure className="col-span-2 row-span-2">
            <GarmentImage
              category={lead.category as never}
              color={lead.color}
              palette={lead.palette}
              className="aspect-[4/5] w-full"
            />
            <figcaption className="mt-1.5 flex items-center gap-1.5 truncate text-xs text-ink-500">
              {lead.fromCloset && <ClosetDot />}
              {lead.label}
            </figcaption>
          </figure>
        )}
        {rest.map((t) => (
          <figure key={t.key} className="col-span-1">
            <GarmentImage
              category={t.category as never}
              color={t.color}
              palette={t.palette}
              className="aspect-square w-full"
            />
            <figcaption className="mt-1 flex items-center gap-1 truncate text-[11px] text-ink-400">
              {t.fromCloset && <ClosetDot />}
              {t.label}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-line px-5 py-3">
        <span className="text-sm text-ink-500">{outfit.pieces.length} pieces</span>
        <span className="font-display text-lg text-ink-900">{money(outfit.total)}</span>
      </div>
    </div>
  );
}

function ClosetDot() {
  return (
    <span className="inline-block rounded-full bg-sage-500 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-paper-50">
      Yours
    </span>
  );
}
