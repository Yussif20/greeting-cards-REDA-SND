// Fonts offered in the card editor: four bundled pairings, plus whatever the
// admin has uploaded.
//
// Each BUNDLED entry is a SCRIPT PAIRING, not a single face: Space Grotesk sets
// the Latin, an Arabic face sets the Arabic. Space Grotesk has no Arabic
// coverage, so the browser falls through per glyph on its own -- in CSS and,
// importantly, inside <canvas> too, since ctx.font accepts the same family list.
//
// That is why the old arabicFont / englishFont / fontLanguage triple is gone:
// one choice styles the whole card, and a name in Arabic beside a job title in
// English both render correctly without the user selecting anything twice.
//
// `loadFamilies` must list every family in the stack. document.fonts.load()
// takes one family at a time, and a face that has not been loaded will be
// silently substituted on the canvas -- the classic "the downloaded card has
// the wrong font" bug.
//
// `FONTS` was a const array. A const binding is exactly the thing that cannot
// reflect a snapshot swap, so it became allFonts() -- the same move occasions.js
// made for the same reason.

import { getRegistry } from "./registryStore.js";
import { uploadedFamily, formatForPath } from "../lib/fontFile.js";

/** Latin half of every bundled pairing. Note the family @fontsource-variable registers. */
export const LATIN = "Space Grotesk Variable";

/** What catches whatever a font does not cover. Covers Arabic AND Latin. */
export const FALLBACK_FAMILY = "Cairo";

const pair = (arabic) => `"${LATIN}", "${arabic}", sans-serif`;

/** Bundled through @fontsource and @import-ed in src/index.css. */
export const BUILT_IN = [
  {
    id: "cairo",
    label: { en: "Cairo + Space Grotesk", ar: "القاهرة + سبيس جروتيسك" },
    stack: pair("Cairo"),
    loadFamilies: [LATIN, "Cairo"],
    weights: [400, 500, 600, 700],
  },
  {
    id: "tajawal",
    label: { en: "Tajawal + Space Grotesk", ar: "تجوال + سبيس جروتيسك" },
    stack: pair("Tajawal"),
    loadFamilies: [LATIN, "Tajawal"],
    weights: [400, 700],
  },
  {
    id: "almarai",
    label: { en: "Almarai + Space Grotesk", ar: "المراعي + سبيس جروتيسك" },
    stack: pair("Almarai"),
    loadFamilies: [LATIN, "Almarai"],
    weights: [400, 700],
  },
  {
    id: "amiri",
    label: { en: "Amiri + Space Grotesk", ar: "أميري + سبيس جروتيسك" },
    stack: pair("Amiri"),
    loadFamilies: [LATIN, "Amiri"],
    weights: [400, 700],
  },
];

/**
 * Memoised on the row object, not on the id.
 *
 * renderCard asks for the stack once per text layer per frame, so a fresh
 * object per call would allocate through every drag. Rows keep their identity
 * for the life of a registry -- normalise() builds the array once per swap --
 * so a WeakMap keyed on the row is both stable while it matters and collected
 * the moment a snapshot is replaced.
 */
const derived = new WeakMap();

/**
 * An uploaded row, in the shape every consumer already understands.
 *
 * The uploaded face leads and Cairo catches the rest. A font the admin chose is
 * the one they want seen, whatever it covers; Cairo covers both scripts, so an
 * Arabic-only upload still sets a Latin job title in something deliberate
 * rather than in the platform's default sans.
 *
 * That inverts the bundled order -- there Latin leads, because Space Grotesk is
 * the Latin half of a deliberate pair. Here there is no pair, only a face and a
 * safety net.
 *
 * `weights` drives preloadFont. With a bold file there are two real weights to
 * warm; without one, a single face claims the whole range (see registerFace in
 * ../lib/fonts.js) and asking for 700 as well would be a wasted probe.
 */
const fromRow = (row) => {
  const cached = derived.get(row);
  if (cached) return cached;

  const family = uploadedFamily(row.id);
  const font = {
    id: row.id,
    label: row.label,
    stack: `"${family}", "${FALLBACK_FAMILY}", sans-serif`,
    loadFamilies: [family, FALLBACK_FAMILY],
    weights: row.bold ? [400, 700] : [400],
    // Everything the runtime needs to build a FontFace, and nothing it has to
    // look up again.
    upload: {
      family,
      regular: { src: row.regular, format: formatForPath(row.regular) },
      bold: row.bold ? { src: row.bold, format: formatForPath(row.bold) } : null,
    },
  };

  derived.set(row, font);
  return font;
};

/**
 * Every font the picker offers: the bundled pairings first, then uploads in the
 * order the admin arranged them.
 *
 * Bundled first deliberately. They are the ones whose licensing and script
 * coverage are known, and DEFAULT_FONT_ID points into them, so the list opens
 * on something that is guaranteed to render.
 */
export const allFonts = () => [...BUILT_IN, ...getRegistry().fonts.map(fromRow)];

export const DEFAULT_FONT_ID = "cairo";

const BUILT_IN_BY_ID = Object.fromEntries(BUILT_IN.map((f) => [f.id, f]));

/**
 * One font by id, never null.
 *
 * An unknown id falls back to the default rather than throwing, and that is
 * load-bearing: a design's layout stores `fontId` as plain text with no foreign
 * key, so unpublishing an uploaded font has to degrade every card using it to
 * Cairo rather than break them. Cards keep working; the admin sees the change
 * and can republish the font or re-pick.
 */
export const getFont = (id) => {
  if (BUILT_IN_BY_ID[id]) return BUILT_IN_BY_ID[id];
  const uploaded = getRegistry().fonts.find((f) => f.id === id);
  return uploaded ? fromRow(uploaded) : BUILT_IN_BY_ID[DEFAULT_FONT_ID];
};

/** The family list canvas should render with, as a ctx.font-ready string. */
export const resolveFontStack = (id) => getFont(id).stack;

/** Every family that must be loaded before drawing with this pairing. */
export const resolveFontFamilies = (id) => getFont(id).loadFamilies;
