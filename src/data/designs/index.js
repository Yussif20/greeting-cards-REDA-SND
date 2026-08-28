// Design lookups, over the registry store.
//
// Designs accumulate rather than being replaced: each carries the `year` of the
// season it was produced for, and every lookup below takes an optional season
// so a page can scope itself to one year's cards.
//
// The per-occasion design modules and placeholders.js are gone. Borrowed
// artwork is now real rows carrying `isPlaceholder`, which means retiring a
// placeholder is an upload rather than a new JS file -- and a borrowing
// occasion's cards can diverge from their source the moment real art lands.

import { getRegistry } from "../registryStore.js";

/** Canonical style tags, in the order the filter chips render. */
// Stays in code: these ids are i18n keys (`designs.style.<id>`), so a
// data-driven style would render an untranslated key.
export const STYLES = ["modern", "traditional", "minimal", "elegant"];

const EMPTY = [];

/** Designs for an occasion; pass a season id to get just that year's cards. */
export const getDesigns = (slug, year) => {
  const all = getRegistry().designsByOccasion[slug] ?? EMPTY;
  return year ? all.filter((d) => d.year === year) : all;
};

/**
 * One design by id. Indexed rather than scanned, but the occasion check is
 * kept so the semantics are provably identical to the old find(): ids embed
 * their slug, so it can only ever reject a caller passing a mismatched pair.
 */
export const getDesign = (slug, id) => {
  const design = getRegistry().designsById[id];
  return design && design.occasion === slug ? design : null;
};

/**
 * Seasons this occasion actually has artwork for, newest first. Returns the
 * full year objects, labels included, since the dropdown renders them.
 */
export const getYears = (slug) => {
  const present = new Set(getDesigns(slug).map((d) => d.year));
  return getRegistry().seasons.filter((y) => present.has(y.id));
};

/**
 * The season an occasion page opens on: its newest one. Falls back to the
 * current season for an occasion with no designs at all, so callers always get
 * a usable id.
 */
export const defaultYear = (slug) => getYears(slug)[0]?.id ?? getRegistry().currentYear;

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
