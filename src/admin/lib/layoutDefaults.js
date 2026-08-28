/**
 * The layout a newly uploaded card starts from.
 *
 * Prefilled from the occasion's newest existing design rather than from a
 * constant, because cards within an occasion are produced as a set: the
 * calligraphy sits in the same place, the personalisation band is the same
 * height, and the brand lockup is in the same corner. Starting from a sibling
 * usually means the admin nudges rather than places, and where it does not --
 * genuinely new artwork -- the editor is right there.
 *
 * The fallback below is only reached by the first card of a brand new
 * occasion, where there is nothing to copy from.
 */

/** A centred band across the lower quarter -- the safest guess for a card. */
export const FALLBACK_LAYOUT = {
  safeArea: { x: 0.08, y: 0.72, w: 0.84, h: 0.2 },
  name: { x: 0.5, y: 0.78, size: 0.05, align: "center", maxWidth: 0.84 },
  jobTitle: { x: 0.5, y: 0.855, size: 0.023, align: "center", maxWidth: 0.84 },
  logo: { x: 0.5, y: 0.92, width: 0.26 },
  palette: ["#FFFFFF", "#000000"],
  defaultColor: "#FFFFFF",
  brandMark: { x: 0.02, y: 0.015, w: 0.32, h: 0.105 },
  fontId: "cairo",
};

/**
 * @param {Array} siblings designs already belonging to the occasion
 * @param {string} [seasonId] prefer a sibling from this season
 */
export function defaultLayout(siblings, seasonId) {
  if (!siblings?.length) return structuredClone(FALLBACK_LAYOUT);

  const sameSeason = seasonId ? siblings.filter((d) => d.year === seasonId) : [];
  const pool = sameSeason.length ? sameSeason : siblings;

  // Highest number in the pool: the most recently produced card, and so the
  // one most likely to match artwork being added now.
  const newest = pool.reduce((a, b) => (b.number > a.number ? b : a));
  return structuredClone(newest.layout);
}
