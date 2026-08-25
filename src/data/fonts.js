// Fonts offered in the card editor.
//
// Each entry is a SCRIPT PAIRING, not a single face: Space Grotesk sets the
// Latin, an Arabic face sets the Arabic. Space Grotesk has no Arabic coverage,
// so the browser falls through per glyph on its own -- in CSS and, importantly,
// inside <canvas> too, since ctx.font accepts the same family list.
//
// That is why the old arabicFont / englishFont / fontLanguage triple is gone:
// one choice styles the whole card, and a name in Arabic beside a job title in
// English both render correctly without the user selecting anything twice.
//
// `loadFamilies` must list every family in the stack. document.fonts.load()
// takes one family at a time, and a face that has not been loaded will be
// silently substituted on the canvas -- the classic "the downloaded card has
// the wrong font" bug.

/** Latin half of every pairing. Note the family name @fontsource-variable registers. */
export const LATIN = "Space Grotesk Variable";

const pair = (arabic) => `"${LATIN}", "${arabic}", sans-serif`;

export const FONTS = [
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

export const FONTS_BY_ID = Object.fromEntries(FONTS.map((f) => [f.id, f]));

export const DEFAULT_FONT_ID = "cairo";

export const getFont = (id) => FONTS_BY_ID[id] ?? FONTS_BY_ID[DEFAULT_FONT_ID];

/** The family list canvas should render with, as a ctx.font-ready string. */
export const resolveFontStack = (id) => getFont(id).stack;

/** Every family that must be loaded before drawing with this pairing. */
export const resolveFontFamilies = (id) => getFont(id).loadFamilies;
