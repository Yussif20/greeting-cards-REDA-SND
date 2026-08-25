import { renderCard } from "./renderCard.js";

/**
 * Render a scene to a Blob at the design's native resolution.
 *
 * JPEG rather than PNG: the card background is fully opaque, so PNG buys
 * nothing and costs ~10x. The old editor used toDataURL() on a 2000x2000 PNG,
 * producing a ~10MB base64 string that crashes low-end Android.
 */
export async function renderToBlob(scene, { type = "image/jpeg", quality = 0.92 } = {}) {
  const { design } = scene;
  const canvas = document.createElement("canvas");
  canvas.width = design.width;
  canvas.height = design.height;

  const ctx = canvas.getContext("2d");
  // Opaque ground, so a transparent-edged design never exports black.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await renderCard(ctx, scene, { scale: 1 });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas export failed"))),
      type,
      quality,
    );
  });
}

export function buildFilename(occasionSlug, name, ext = "jpg") {
  const person = String(name ?? "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "");
  return [occasionSlug, person].filter(Boolean).join("-").concat(`.${ext}`) || `card.${ext}`;
}

/** Trigger a download from a Blob, cleaning the object URL up afterwards. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoking synchronously can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export function canShareFile(file) {
  return Boolean(navigator.canShare?.({ files: [file] }) && navigator.share);
}

/**
 * Share a pre-rendered blob.
 *
 * The blob must already exist: on iOS, navigator.share() has to be called
 * within the user gesture, so awaiting a render inside the handler breaks it.
 */
export async function shareBlob(blob, filename, { title, text }) {
  const file = new File([blob], filename, { type: blob.type });

  if (canShareFile(file)) {
    await navigator.share({ title, text, files: [file] });
    return "shared";
  }

  // No file sharing available -- hand the user the image rather than opening a
  // text-only WhatsApp link, which silently dropped the card in the old build.
  downloadBlob(blob, filename);
  return "downloaded";
}
