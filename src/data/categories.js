// Card categories (تصنيفات), over the registry store.
//
// What a card is FOR rather than what it looks like: "موظفين", "عملاء", and
// whatever the client needs next. The admin creates them, so unlike
// `STYLES` in designs/index.js these cannot be i18n keys -- a category
// invented at runtime would render as `designs.category.employees`. Each one
// therefore carries its own bilingual label, like a season or an occasion, and
// src/lib/localize.js resolves it.
//
// A design's `category` is optional and stays optional. Every card made before
// categories existed has none, an occasion that never needs the distinction
// never gains one, and both show up under "All" and under no chip.
//
// Only published categories are in the snapshot at all, so nothing here has to
// ask about status.

import { getRegistry } from "./registryStore.js";

/** Every category, in the order the admin arranged them. */
export const allCategories = () => getRegistry().categories;

export const getCategory = (id) => (id ? (getRegistry().categoriesById[id] ?? null) : null);

/**
 * The categories actually present in a set of designs, in registry order.
 *
 * Takes the designs rather than a slug because the caller has already narrowed
 * them -- by occasion, season and brand -- and the chips have to describe the
 * grid underneath them rather than the occasion as a whole. A chip that filters
 * to nothing is the bug this signature exists to prevent.
 *
 * A category the admin has unpublished disappears from the registry but may
 * still be stamped on a design, so this intersects rather than mapping: an
 * unknown id contributes no chip, and those cards remain visible under "All".
 */
export const categoriesIn = (designs) => {
  const present = new Set(designs.map((d) => d.category).filter(Boolean));
  return allCategories().filter((c) => present.has(c.id));
};
