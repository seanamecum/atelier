"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils/format";

/** Reads an image file to a data URL (downscaled) for local persistence. */
async function fileToDataUrl(file: File, maxDim = 900): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  // Downscale via canvas to keep localStorage small.
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function PhotoUpload({
  value,
  onChange,
  label = "Upload a photo",
  hint = "Front-facing, full body works best",
  className,
  aspect = "aspect-[3/4]",
}: {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  label?: string;
  hint?: string;
  className?: string;
  aspect?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className={className}>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          try {
            onChange(await fileToDataUrl(file));
          } finally {
            setBusy(false);
          }
        }}
      />
      {value ? (
        <div className={cn("relative overflow-hidden rounded-2xl border border-line", aspect)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="upload preview" className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 flex justify-between gap-2 bg-gradient-to-t from-ink-900/70 to-transparent p-3">
            <button className="btn-ghost !py-1.5 !text-xs" onClick={() => ref.current?.click()}>
              Replace
            </button>
            <button
              className="btn-quiet !py-1.5 !text-xs !text-paper-100"
              onClick={() => onChange(undefined)}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => ref.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-paper-100 p-6 text-center transition hover:border-clay-300 hover:bg-paper-50",
            aspect,
          )}
        >
          <span className="grid h-11 w-11 place-items-center rounded-full bg-paper-300 text-ink-500">
            {busy ? "…" : "＋"}
          </span>
          <span className="text-sm font-medium text-ink-800">{busy ? "Processing…" : label}</span>
          <span className="text-xs text-ink-400">{hint}</span>
        </button>
      )}
    </div>
  );
}
