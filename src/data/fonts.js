// Fonts offered in the card editor.
//
// Each face must cover BOTH Arabic and Latin, so a single choice styles the
// whole card. That is why the previous arabicFont/englishFont/fontLanguage
// triple is gone -- three pieces of state to pick one font.
//
// DIN Next Arabic is a licensed Monotype face and is not bundled. Its entry
// stays here with `available: false` so the label matches the design spec while
// rendering falls through to the stand-in. If REDA supplies a licensed *web*
// font, drop the .woff2 into public/fonts/, add an @font-face rule to index.css,
// and flip `available` to true -- nothing else changes.

export const FONTS = [
  {
    id: "din-next-arabic",
    label: { en: "DIN Next Arabic", ar: "دين نكست عربي" },
    stack: '"DIN Next Arabic", "IBM Plex Sans Arabic", sans-serif',
    // The family canvas must actually load. Falls back while unavailable.
    loadFamily: "IBM Plex Sans Arabic",
    weights: [400, 500, 700],
    licensed: true,
    available: false,
    fallbackId: "ibm-plex-sans-arabic",
  },
  {
    id: "ibm-plex-sans-arabic",
    label: { en: "IBM Plex Sans Arabic", ar: "آي بي إم بلكس" },
    stack: '"IBM Plex Sans Arabic", sans-serif',
    loadFamily: "IBM Plex Sans Arabic",
    weights: [400, 500, 700],
    licensed: false,
    available: true,
    fallbackId: null,
  },
  {
    id: "cairo",
    label: { en: "Cairo", ar: "القاهرة" },
    stack: '"Cairo", sans-serif',
    loadFamily: "Cairo",
    weights: [400, 700],
    licensed: false,
    available: true,
    fallbackId: null,
  },
  {
    id: "tajawal",
    label: { en: "Tajawal", ar: "تجوال" },
    stack: '"Tajawal", sans-serif',
    loadFamily: "Tajawal",
    weights: [400, 700],
    licensed: false,
    available: true,
    fallbackId: null,
  },
  {
    id: "almarai",
    label: { en: "Almarai", ar: "المراعي" },
    stack: '"Almarai", sans-serif',
    loadFamily: "Almarai",
    weights: [400, 700],
    licensed: false,
    available: true,
    fallbackId: null,
  },
  {
    id: "amiri",
    label: { en: "Amiri", ar: "أميري" },
    stack: '"Amiri", serif',
    loadFamily: "Amiri",
    weights: [400, 700],
    licensed: false,
    available: true,
    fallbackId: null,
  },
];

export const FONTS_BY_ID = Object.fromEntries(FONTS.map((f) => [f.id, f]));

export const DEFAULT_FONT_ID = "din-next-arabic";

export const getFont = (id) => FONTS_BY_ID[id] ?? FONTS_BY_ID[DEFAULT_FONT_ID];

/**
 * The family canvas should actually render with, following the fallback chain
 * when a licensed face has not been supplied.
 */
export function resolveFontFamily(id) {
  let font = getFont(id);
  const seen = new Set();
  while (font && !font.available && font.fallbackId && !seen.has(font.id)) {
    seen.add(font.id);
    font = FONTS_BY_ID[font.fallbackId];
  }
  return font?.loadFamily ?? "sans-serif";
}
