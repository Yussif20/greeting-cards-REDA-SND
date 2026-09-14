import {
  allFonts,
  resolveFontStack,
  resolveFontFamilies,
  getFont,
} from "../data/fonts.js";
import { uploadedFamily, formatForPath } from "./fontFile.js";

/**
 * Canvas font loading.
 *
 * Each editor font names more than one family -- a bundled entry is a Latin +
 * Arabic pairing, an uploaded one is the face plus Cairo as its safety net --
 * so every family in the stack has to be loaded before the first fillText. A
 * face the browser has not loaded is silently substituted, and the exported
 * card then does not match the preview.
 *
 * Requests are memoised per family and weight so a face is fetched once.
 */
const pending = new Map();

/* -------------------------------------------------------------------------- */
/* uploaded faces                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Uploaded fonts have no stylesheet behind them.
 *
 * The four bundled families arrive as @import-ed @font-face rules in
 * src/index.css, resolved at build time. An uploaded face exists only as a row
 * in the registry, so it is declared at runtime with the FontFace API instead --
 * which reaches CSS and <canvas> identically, because both read the same
 * document font set.
 *
 * Registration is metadata only: adding a FontFace does NOT fetch the file. The
 * browser loads it when something actually renders with the family, exactly as
 * it would for an @font-face rule, so declaring every uploaded font costs no
 * bandwidth for a visitor who never picks one.
 */
const registered = new Set();

/**
 * Weight descriptors, and why they are not simply 400 and 700.
 *
 * A card sets the name at 700 and the job title at 400. With both files there
 * are two real faces and the match is exact. With only a regular file, a face
 * declared at 400 would leave the 700 request unmatched -- and an unmatched bold
 * is not a fallback, it is SYNTHETIC bold: the browser smears the outlines
 * itself. On Arabic that is visibly wrong, and it would land in the downloaded
 * file. Claiming the whole range instead means 700 resolves to the real
 * outlines and the card loses the weight contrast rather than the letterforms.
 */
const weightRange = (hasBold) => (hasBold ? { regular: "400", bold: "700" } : { regular: "100 900" });

function addFace(family, weight, src) {
  const face = new FontFace(family, `url("${src}") format("${formatForPath(src)}")`, {
    weight,
    style: "normal",
    // The card is never drawn before ensureFont() has awaited the face, so swap
    // costs nothing here and keeps the previews readable while the file is
    // still in flight.
    display: "swap",
  });
  document.fonts.add(face);
}

/**
 * Declare one uploaded font, from the two paths that define it.
 *
 * Takes raw paths rather than a registry entry so that /admin can declare a
 * font that is still a DRAFT. Drafts are excluded from the published snapshot
 * by design, so registerUploadedFonts() below cannot see one -- and the font
 * list would preview a just-uploaded face in the fallback, at exactly the
 * moment the admin is trying to check that the file is right.
 *
 * Idempotent and cheap, so it is safe to call from render.
 *
 * Silent on failure by design. `FontFace` is absent under bare Node, where
 * scripts/verify-render.mjs imports this module, and a browser that refuses one
 * malformed upload must still render every other font.
 */
export function registerFontFace({ id, regular, bold }) {
  if (typeof FontFace === "undefined" || typeof document === "undefined") return;
  if (!id || !regular || registered.has(id)) return;
  registered.add(id);

  const family = uploadedFamily(id);
  const weights = weightRange(Boolean(bold));
  try {
    addFace(family, weights.regular, regular);
    if (bold) addFace(family, weights.bold, bold);
  } catch {
    // A malformed descriptor or a blocked file. The stack falls through to
    // Cairo, which is what that fallback is there for.
  }
}

/**
 * Declare every uploaded face the registry currently carries.
 *
 * Called from the font picker (which needs the families for its CSS previews)
 * and from ensureFont (which needs them for the canvas), rather than once at
 * startup -- a visitor who never opens the editor should not be handed font
 * metadata at all.
 */
export function registerUploadedFonts() {
  for (const font of allFonts()) {
    if (!font.upload) continue;
    registerFontFace({
      id: font.id,
      regular: font.upload.regular.src,
      bold: font.upload.bold?.src ?? null,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* loading                                                                    */
/* -------------------------------------------------------------------------- */

/** ctx.font-ready shorthand, carrying the full family list. */
export function fontShorthand(fontId, weight, px) {
  return `${weight} ${px}px ${resolveFontStack(fontId)}`;
}

export async function ensureFont(fontId, weight = 400, px = 64) {
  // An uploaded family that was never declared can never load, and
  // document.fonts.load() reports that as success with nothing matched.
  registerUploadedFonts();

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
