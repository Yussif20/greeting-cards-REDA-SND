// Occasion lookups, over the registry store.
//
// This used to be the source of truth -- a literal array of six. It is now a
// thin reader over src/data/registryStore.js, whose contents come from the
// published snapshot with the bundled one as a fallback. Every exported
// signature is unchanged, which is why no page or hook needed rewriting.
//
// Occasion copy still travels as bilingual `{ ar, en }` objects rather than as
// i18n keys. Occasions are domain entities; splitting their fields across
// en/ar bundles keyed `{occasion}_{field}` is what produced the previous
// comment-in/comment-out mess. UI chrome still lives in i18next.
// src/lib/localize.js resolves them.

import { getRegistry } from "./registryStore.js";

/** Show a "sample artwork" badge on occasions still using borrowed art. */
export const SHOW_PLACEHOLDER_BADGE = true;

export const getOccasion = (slug) => getRegistry().occasionsBySlug[slug] ?? null;

/** Occasions shown on the home page, in display order. */
export const visibleOccasions = () => getRegistry().visibleOccasions;

/**
 * Every occasion, enabled or not, in display order.
 *
 * Was `export const OCCASIONS`. A const array binding is exactly the thing that
 * cannot reflect a snapshot swap, so it became a call.
 */
export const allOccasions = () => getRegistry().occasions;
