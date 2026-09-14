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
// data-driven style would render an untranslated key. What a card is *for* --
// its category -- is the admin-managed axis instead; see ../categories.js.
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
 * Seasons present in a set of designs, newest first.
 *
 * The brand is a browsing step now, not a filter on a flat grid: a visitor
 * picks the occasion, then the company, then the card. So the designs page
 * holds one company's cards, and every control above the grid -- this dropdown,
 * the category chips, the style chips -- has to be derived from that set rather
 * than from the occasion. A brand can be in one year's set and not the next,
 * and a season dropdown built from the occasion would offer a year this company
 * has nothing in, from a control that looked like it would work.
 */
export const seasonsIn = (designs) => {
  const present = new Set(designs.map((d) => d.year));
  return getRegistry().seasons.filter((y) => present.has(y.id));
};

/**
 * Seasons this occasion actually has artwork for, newest first. Returns the
 * full year objects, labels included, since the dropdown renders them.
 */
export const getYears = (slug) => seasonsIn(getDesigns(slug));

/**
 * The season an occasion page opens on: its newest one. Falls back to the
 * current season for an occasion with no designs at all, so callers always get
 * a usable id.
 */
export const defaultYear = (slug) => getYears(slug)[0]?.id ?? getRegistry().currentYear;

/**
 * Style tags actually present in a set of designs, in STYLES order.
 *
 * Takes the designs rather than a slug, for the reason given on seasonsIn:
 * the chips have to describe the grid the visitor is looking
 * at, which is now narrowed by brand as well as by season. Chips with no
 * matching designs are never rendered -- with the current artwork most
 * occasions carry a single style, and an always-on chip row would look broken.
 */
export const stylesIn = (designs) => {
  const present = new Set(designs.map((d) => d.style));
  return STYLES.filter((s) => present.has(s));
};
