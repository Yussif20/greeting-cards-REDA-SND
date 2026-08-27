// Card seasons.
//
// A season is one year's worth of artwork, kept forever: last year's cards stay
// reachable rather than being replaced. Its label spans two Gregorian years
// because the occasion calendar does -- the Hijri occasions drift, so a single
// production run covers Founding Day in one Gregorian year and the New Year in
// the next.
//
// Newest first. YEARS[0] is what an occasion page opens on.
//
// Adding next season:
//   1. Drop the artwork in /cards/<slug>/<season-id>/ (NN.jpg + thumbs/NN.webp).
//   2. Prepend an entry here.
//   3. In src/data/designs/<slug>.js, add a second `season(...)` block and
//      append its cards to the exported array.
// Nothing else needs touching -- the year dropdown, the style chips and the
// brand picker all read whatever seasons are present for the occasion.
//
// Labels are bilingual objects, like occasion copy: seasons are domain data,
// not interface text. src/lib/localize.js resolves them.

export const YEARS = [
  {
    id: "2025-2026",
    label: { en: "2025 / 2026", ar: "٢٠٢٥ / ٢٠٢٦" },
  },
];

/** The current season -- the one new artwork belongs to. */
export const CURRENT_YEAR = YEARS[0].id;

export const YEARS_BY_ID = Object.fromEntries(YEARS.map((y) => [y.id, y]));

export const getYear = (id) => YEARS_BY_ID[id] ?? null;
