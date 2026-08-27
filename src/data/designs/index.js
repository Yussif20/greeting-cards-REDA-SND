// Design registry: every card design, keyed by occasion slug.
//
// Designs accumulate rather than being replaced: each carries the `year` of the
// season it was produced for (src/data/years.js), and every lookup below takes
// an optional season so a page can scope itself to one year's cards.

import { YEARS, CURRENT_YEAR } from "../years.js";
import eidAlFitr from "./eid-al-fitr.js";
import eidAlAdha from "./eid-al-adha.js";
import saudiFoundingDay from "./saudi-founding-day.js";
import hijriNewYear from "./hijri-new-year.js";
import { placeholderDesigns } from "./placeholders.js";

/** Canonical style tags, in the order the filter chips render. */
export const STYLES = ["modern", "traditional", "minimal", "elegant"];

const DESIGNS_BY_OCCASION = {
  "eid-al-fitr": eidAlFitr,
  "eid-al-adha": eidAlAdha,
  "saudi-founding-day": saudiFoundingDay,
  "hijri-new-year": hijriNewYear,

  // Borrowed artwork until dedicated designs are produced.
  "saudi-national-day": placeholderDesigns("saudi-national-day", saudiFoundingDay),
  "new-year": placeholderDesigns("new-year", hijriNewYear),
};

/** Designs for an occasion; pass a season id to get just that year's cards. */
export const getDesigns = (slug, year) => {
  const all = DESIGNS_BY_OCCASION[slug] ?? [];
  return year ? all.filter((d) => d.year === year) : all;
};

export const getDesign = (slug, id) =>
  getDesigns(slug).find((d) => d.id === id) ?? null;

/**
 * Seasons this occasion actually has artwork for, newest first. Returns the
 * full year objects, labels included, since the dropdown renders them.
 */
export const getYears = (slug) => {
  const present = new Set(getDesigns(slug).map((d) => d.year));
  return YEARS.filter((y) => present.has(y.id));
};

/**
 * The season an occasion page opens on: its newest one. Falls back to the
 * current season for an occasion with no designs at all, so callers always get
 * a usable id.
 */
export const defaultYear = (slug) => getYears(slug)[0]?.id ?? CURRENT_YEAR;

/**
 * Style tags actually present for an occasion, in STYLES order. Chips with no
 * matching designs are never rendered -- with the current artwork most
 * occasions carry a single style, and an always-on chip row would look broken.
 * Scoped to `year` when given, so the chips describe the visible grid.
 */
export const getStyles = (slug, year) => {
  const present = new Set(getDesigns(slug, year).map((d) => d.style));
  return STYLES.filter((s) => present.has(s));
};

/**
 * The sibling design carrying `brandId` for the same occasion and the same
 * season, preferring one that also matches `style`. Used by BrandSelect when
 * the brand logo is baked into the artwork, so switching brand means switching
 * design -- but never silently switching year.
 */
export const findSiblingByBrand = (slug, design, brandId) => {
  const siblings = getDesigns(slug, design?.year).filter((d) => d.brand === brandId);
  if (siblings.length === 0) return null;
  return siblings.find((d) => d.style === design?.style) ?? siblings[0];
};

/**
 * Brand ids that have artwork for this occasion, in design order. Scoped to
 * `year` when given: a brand can be in one season's set and not the next.
 */
export const getBrandIds = (slug, year) => [
  ...new Set(getDesigns(slug, year).map((d) => d.brand).filter(Boolean)),
];
