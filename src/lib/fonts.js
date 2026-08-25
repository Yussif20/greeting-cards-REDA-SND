import { resolveFontStack, resolveFontFamilies, getFont } from "../data/fonts.js";

/**
 * Canvas font loading.
 *
 * Each editor font is a pairing (Latin + Arabic), so every family in the stack
 * has to be loaded before the first fillText -- a face the browser has not
 * loaded is silently substituted, and the exported card then does not match the
 * preview.
 *
 * Requests are memoised per family and weight so a face is fetched once.
 */
const pending = new Map();

/** ctx.font-ready shorthand, carrying the full family list. */
export function fontShorthand(fontId, weight, px) {
  return `${weight} ${px}px ${resolveFontStack(fontId)}`;
}

export async function ensureFont(fontId, weight = 400, px = 64) {
  await Promise.all(
    resolveFontFamilies(fontId).map((family) => {
      const key = `${family}:${weight}`;
      if (!pending.has(key)) {
        // A fixed probe size is enough -- the browser caches by family+weight.
        pending.set(
          key,
          document.fonts.load(`${weight} 64px "${family}"`).catch(() => {}),
        );
      }
      return pending.get(key);
    }),
  );

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
