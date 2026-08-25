import { resolveFontFamily, getFont } from "../data/fonts.js";

/**
 * Canvas font loading.
 *
 * Every face is requested once and the promise memoised. Callers must await
 * this before the first fillText, otherwise the browser silently substitutes
 * and the exported card does not match the preview.
 */
const pending = new Map();

export function fontShorthand(fontId, weight, px) {
  return `${weight} ${px}px "${resolveFontFamily(fontId)}"`;
}

export async function ensureFont(fontId, weight = 400, px = 64) {
  const key = `${fontId}:${weight}`;
  if (!pending.has(key)) {
    // A fixed probe size is enough: the browser caches by family and weight.
    const spec = `${weight} 64px "${resolveFontFamily(fontId)}"`;
    pending.set(
      key,
      document.fonts.load(spec).catch(() => {}),
    );
  }
  await pending.get(key);

  // Safari resolves fonts.load() before the face is genuinely usable for
  // measurement, so wait for the document to settle too.
  await document.fonts.ready;
  return fontShorthand(fontId, weight, px);
}

/** Warm the weights a design is likely to use, so first paint is not a swap. */
export function preloadFont(fontId) {
  const font = getFont(fontId);
  return Promise.all((font?.weights ?? [400, 700]).map((w) => ensureFont(fontId, w)));
}
