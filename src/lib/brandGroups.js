/**
 * The tiles the brand chooser offers for one occasion and season.
 *
 * One row per *brand*, where src/lib/brandRows.js gives one row per card. The
 * two answer different questions and both are needed: this one is "which
 * company's cards do you want", asked before any artwork is on screen; that one
 * is "which of these cards", asked inside the editor where switching brand
 * means switching to a specific sibling design.
 *
 * Brands with no card for this occasion are kept, disabled, for the same reason
 * brandRows keeps them: the roster is the REDA group, and showing a subset
 * without explanation reads as something missing rather than as something that
 * does not exist yet.
 *
 * The last row is the one worth explaining. `designs.brand` is a plain text
 * column -- there is no foreign key, because the roster lives in code -- so a
 * card can carry null, or an id that no longer matches anything in
 * src/data/brands.js. Under a browse-by-brand flow such a card is not merely
 * mislabelled, it is *unreachable*: no tile leads to it, and only someone
 * holding its direct link would ever see it again. So anything unmatched is
 * collected into one trailing group rather than dropped, and the group appears
 * only when it has something in it -- an empty "Other" tile would be its own
 * kind of lie.
 *
 * Pulled out of the page so both behaviours can be tested directly. The
 * unreachable-card case is invisible until the day it happens, which is exactly
 * when nobody is looking for it.
 *
 * @param {Array} designs  designs for one occasion and season
 * @param {Array} brands   the full brand roster, in display order
 * @returns {Array<{id: string|null, name: string, cards: Array, disabled: boolean}>}
 */
export const OTHER_BRAND = "other";

export function brandGroups(designs, brands) {
  const byBrand = new Map();
  for (const design of designs) {
    const key = design.brand ?? null;
    if (!byBrand.has(key)) byBrand.set(key, []);
    byBrand.get(key).push(design);
  }
  for (const list of byBrand.values()) list.sort((a, b) => a.number - b.number);

  const rows = brands.map((brand) => {
    const cards = byBrand.get(brand.id) ?? [];
    byBrand.delete(brand.id);
    return { id: brand.id, name: brand.name, cards, disabled: cards.length === 0 };
  });

  // Whatever is left matched no brand in the roster: null, or a stale id.
  const orphans = [...byBrand.values()].flat().sort((a, b) => a.number - b.number);
  if (orphans.length > 0) {
    rows.push({ id: OTHER_BRAND, name: null, cards: orphans, disabled: false });
  }

  return rows;
}

/**
 * The cards behind one tile, resolved back from the URL segment.
 *
 * `other` is not a brand id, so it cannot be compared against `design.brand`
 * the way a real one can -- it means "everything the roster does not claim",
 * which is a property of the roster rather than of the card. Keeping that
 * inversion here means the page never has to branch on it.
 */
export function designsForBrand(designs, brands, brandId) {
  if (brandId !== OTHER_BRAND) return designs.filter((d) => d.brand === brandId);
  const known = new Set(brands.map((b) => b.id));
  return designs.filter((d) => !d.brand || !known.has(d.brand));
}
