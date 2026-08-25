// Reads bilingual objects stored on domain entities (occasions, brands, fonts).
//
// Registry entities carry their copy inline as { ar, en } rather than as i18n
// keys, so this is the one place that resolves them. UI chrome still uses t().

const FALLBACK = "en";

/**
 * Pick the current language out of a { ar, en } object.
 * Returns "" for a missing field so callers render nothing rather than
 * printing "undefined" into the page.
 */
export function loc(value, lang) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value[FALLBACK] ?? "";
}

/** Occasion heading, including its edition number when it has one. */
export function occasionHeading(occasion, lang) {
  if (!occasion) return "";
  const title = loc(occasion.title, lang);
  const edition = occasion.edition;
  if (!edition) return title;
  const label = lang === "ar" ? (edition.labelAr ?? edition.label) : edition.label;
  return `${title} ${label}`;
}

/** Shorter heading for breadcrumbs and narrow viewports. */
export function occasionShortHeading(occasion, lang) {
  if (!occasion) return "";
  return loc(occasion.shortTitle ?? occasion.title, lang);
}
