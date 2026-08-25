// Design registry: every card design, keyed by occasion slug.

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

export const getDesigns = (slug) => DESIGNS_BY_OCCASION[slug] ?? [];

export const getDesign = (slug, id) =>
  getDesigns(slug).find((d) => d.id === id) ?? null;

/**
 * Style tags actually present for an occasion, in STYLES order. Chips with no
 * matching designs are never rendered -- with the current artwork most
 * occasions carry a single style, and an always-on chip row would look broken.
 */
export const getStyles = (slug) => {
  const present = new Set(getDesigns(slug).map((d) => d.style));
  return STYLES.filter((s) => present.has(s));
};

/**
 * The sibling design carrying `brandId` for the same occasion, preferring one
 * that also matches `style`. Used by BrandSelect when the brand logo is baked
 * into the artwork, so switching brand means switching design.
 */
export const findSiblingByBrand = (slug, design, brandId) => {
  const siblings = getDesigns(slug).filter((d) => d.brand === brandId);
  if (siblings.length === 0) return null;
  return siblings.find((d) => d.style === design?.style) ?? siblings[0];
};

/** Brand ids that have artwork for this occasion, in design order. */
export const getBrandIds = (slug) => [
  ...new Set(getDesigns(slug).map((d) => d.brand).filter(Boolean)),
];
