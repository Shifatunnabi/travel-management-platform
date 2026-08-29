"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Star, X } from "lucide-react";

export interface UploadedImage {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Uploads straight from the browser to Cloudinary using a short-lived signature
 * from our server, so an 8 MB photo never passes through the app. The resulting
 * list is serialized into a hidden field the server action reads.
 */
export default function ImageUploader({
  name,
  folder,
  scopeId,
  initial = [],
  max = 20,
  label = "Photos",
  hint = "First image is the cover. Drag to reorder.",
}: {
  name: string;
  folder: "hotels" | "rooms" | "kyc" | "avatars";
  scopeId: string;
  initial?: UploadedImage[];
  max?: number;
  label?: string;
  hint?: string;
}) {
  const [images, setImages] = useState<UploadedImage[]>(initial);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);

  const upload = useCallback(
    async (files: FileList) => {
      setError(null);
      const room = max - images.length;
      const chosen = Array.from(files).slice(0, Math.max(0, room));
      if (chosen.length === 0) {
        setError(`You can add up to ${max} images.`);
        return;
      }

      for (const file of chosen) {
        if (!ACCEPTED.includes(file.type)) {
          setError(`${file.name} is not a JPEG, PNG, WebP or AVIF image.`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          setError(`${file.name} is larger than 8 MB.`);
          continue;
        }

        setBusy((n) => n + 1);
        try {
          const signRes = await fetch("/api/uploads/cloudinary-signature", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ folder, scopeId }),
          });
          if (!signRes.ok) throw new Error("Could not authorise the upload.");
          const sign = await signRes.json();

          const body = new FormData();
          body.append("file", file);
          body.append("api_key", sign.apiKey);
          body.append("timestamp", String(sign.timestamp));
          body.append("signature", sign.signature);
          body.append("folder", sign.folder);

          const res = await fetch(sign.uploadUrl, { method: "POST", body });
          if (!res.ok) throw new Error("Cloudinary rejected the upload.");
          const data = await res.json();

          setImages((prev) => [
            ...prev,
            {
              publicId: data.public_id,
              url: data.secure_url,
              width: data.width,
              height: data.height,
              alt: "",
            },
          ]);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Upload failed. Try again.");
        } finally {
          setBusy((n) => n - 1);
        }
      }
      if (inputRef.current) inputRef.current.value = "";
    },
    [folder, images.length, max, scopeId],
  );

  const remove = (publicId: string) =>
    setImages((prev) => prev.filter((i) => i.publicId !== publicId));

  const makeCover = (index: number) =>
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      return [item, ...next];
    });

  const onDrop = (target: number) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === target) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(images)} readOnly />
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-xs font-semibold text-slate-600">{label}</label>
        <span className="text-[11px] text-slate-400 tabular-nums">
          {images.length} / {max}
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {images.map((img, i) => (
          <div
            key={img.publicId}
            draggable
            onDragStart={() => (dragIndex.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(i)}
            className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 cursor-grab active:cursor-grabbing"
          >
            <Image src={img.url} alt={img.alt || ""} fill sizes="200px" className="object-cover" />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                Cover
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 p-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => makeCover(i)}
                  title="Make cover image"
                  className="p-1 rounded bg-white/90 hover:bg-white text-slate-700"
                >
                  <Star size={13} />
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(img.publicId)}
                title="Remove image"
                className="p-1 rounded bg-white/90 hover:bg-white text-rose-600"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        ))}

        {images.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-[4/3] rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-400 hover:bg-brand-50/40 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-brand-600 transition-colors"
          >
            {busy > 0 ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
            <span className="text-[11px] font-medium">
              {busy > 0 ? `${busy} uploading` : "Add"}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        className="sr-only"
        onChange={(e) => e.target.files && upload(e.target.files)}
      />

      <p className="text-[11px] text-slate-400 mt-2">{hint}</p>
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
}
