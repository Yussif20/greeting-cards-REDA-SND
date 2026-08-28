// Card seasons, over the registry store.
//
// A season is one year's worth of artwork, kept forever: last year's cards stay
// reachable rather than being replaced. Its label spans two Gregorian years
// because the occasion calendar does -- the Hijri occasions drift, so a single
// production run covers Founding Day in one Gregorian year and the New Year in
// the next.
//
// Newest first. allSeasons()[0] is what an occasion page opens on.
//
// Adding a season is now an admin action, not a code edit: create it in
// /admin, upload the artwork, and publish. The year dropdown, the style chips
// and the brand picker all read whatever seasons are present for the occasion.
//
// Labels are bilingual objects, like occasion copy: seasons are domain data,
// not interface text. src/lib/localize.js resolves them.

import { getRegistry } from "./registryStore.js";

/** Every season, newest first. Was `export const YEARS`. */
export const allSeasons = () => getRegistry().seasons;

/** The current season -- the one new artwork belongs to. */
export const currentSeason = () => getRegistry().currentYear;

export const getYear = (id) => getRegistry().seasons.find((y) => y.id === id) ?? null;
