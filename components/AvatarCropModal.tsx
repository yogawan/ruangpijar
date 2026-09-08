"use client";

import { useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

type AvatarCropModalProps = {
  /** Object URL of the just-picked file, or null when nothing is open. */
  imageSrc: string | null;
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
};

// Fixed square output — plenty for how large an avatar ever renders in this
// app, without carrying along whatever huge resolution the source photo was.
const OUTPUT_SIZE = 512;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function cropToBlob(imageSrc: string, area: Area): Promise<Blob> {
  const image = await loadImage(imageSrc);

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      0.9,
    );
  });
}

/**
 * Pan/zoom crop step between picking a file and uploading it, so what gets
 * saved is framed on purpose rather than whatever rectangle the source photo
 * happened to be. Built on the native `<dialog>` (see CheckInDayModal) for
 * the focus trap, Esc-to-close and inert background.
 */
export default function AvatarCropModal({
  imageSrc,
  onCancel,
  onCropped,
}: AvatarCropModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const open = imageSrc !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // A fresh image starts centered and unzoomed rather than wherever the
  // previous one was left. The dialog stays mounted between opens (see the
  // effect above), so this can't just be initial state — it only depends on
  // `imageSrc` as a change trigger, never reads its value.
  // biome-ignore lint/correctness/useExhaustiveDependencies: imageSrc is intentionally the trigger, not a value the effect reads.
  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
  }, [imageSrc]);

  async function handleConfirm() {
    if (!imageSrc || !croppedArea) return;

    setProcessing(true);
    try {
      const blob = await cropToBlob(imageSrc, croppedArea);
      onCropped(blob);
    } finally {
      setProcessing(false);
    }
  }

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the click handler only implements dismiss-on-backdrop, which is inherently pointer-only. The keyboard equivalent is Esc, which <dialog> handles natively and reports through onClose, and there is an explicit Batal button besides.
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      onClick={(event) => {
        if (event.target === dialogRef.current) onCancel();
      }}
      aria-labelledby="avatar-crop-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50"
    >
      {imageSrc ? (
        <div className="p-5">
          <h2 id="avatar-crop-title" className="text-lg font-semibold">
            Atur foto profil
          </h2>

          <div className="relative mt-4 h-72 w-full overflow-hidden rounded-xl bg-surface-muted">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_area, areaPixels) => setCroppedArea(areaPixels)}
            />
          </div>

          <label className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            Perbesar
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="flex-1 accent-primary"
            />
          </label>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={processing}
              className="flex-1 rounded-xl border border-border px-4 py-3 font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={processing || !croppedArea}
              className="flex-1 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {processing ? "Memproses…" : "Gunakan foto ini"}
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
