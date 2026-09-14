// What a duplicated card is, expressed as data rather than as a sequence of
// clicks.
//
// Deliberately import-free. The rest of the duplicate flow needs Supabase and a
// canvas, neither of which exists under bare Node -- so the part worth asserting
// lives here on its own and scripts/verify-render.mjs can test it directly. Same
// reason ../../lib/brandRows.js and ../../lib/brandGroups.js are their own
// files: the logic that is invisible until it is wrong should not be reachable
// only through a component.

/**
 * The `createDesign` input for a copy of `source`.
 *
 * Everything that identifies the *card* is carried over untouched -- occasion,
 * season, style, whether the brand is baked into the artwork, whether it is
 * borrowed placeholder art. A season is one template rendered once per company,
 * so those five are exactly the fields that must not drift between siblings.
 *
 * What the caller chooses is the brand and the category, because those are the
 * two that distinguish one sibling from another.
 *
 * `id` and `number` are deliberately absent. createDesign() allocates the next
 * free number per (occasion, season), builds the id from it, and retries on the
 * unique-constraint collision when two admins duplicate at the same moment.
 * Setting either here would defeat that.
 *
 * @param {object} source   the design being copied, in runtime shape
 * @param {object} options
 * @param {string} options.brand          brand id for the copy
 * @param {string|null} [options.category] category id, or null for none
 * @param {object} [options.layout]       layout to copy; defaults to the source's
 * @param {object} [options.image]        {src, thumb, width, height} from a new
 *                                        upload; omitted means reuse the source's
 * @returns {object} input for createDesign()
 */
export function duplicateInput(source, { brand, category = null, layout, image } = {}) {
  // Deep, not a reference. The copy is about to be edited in its own layout
  // editor, and a shared nested object would let dragging the new card's safe
  // area move the original's -- a corruption that would survive to the next
  // publish with nothing to show where it came from.
  const copied = structuredClone(layout ?? source.layout);

  // No new artwork means the copy points at the same stored image. That is a
  // supported state rather than a shortcut: storage paths carry a random uuid
  // and no design id (src/admin/lib/storage.js), designs.src has no unique
  // constraint, and uploads are never deleted -- so neither row can pull the
  // image out from under the other. It is also what makes "same artwork, two
  // categories" a one-click operation.
  const art = image ?? source;

  return {
    occasion: source.occasion,
    year: source.year,
    style: source.style,
    brandBakedIn: source.brandBakedIn,
    isPlaceholder: source.isPlaceholder,

    brand,
    category,

    src: art.src,
    thumb: art.thumb,
    width: art.width,
    height: art.height,

    layout: copied,
  };
}

/**
 * The brand a duplicate should default to: the first company in roster order
 * with no card for this occasion and season.
 *
 * The whole point of duplicating is filling out the set, so the default should
 * be the next gap rather than the source's own brand -- which is the one value
 * guaranteed to be taken. Falling back to the source's brand once every company
 * has a card keeps the control valid: a second card for one brand is legitimate
 * (the picker in the editor numbers them), it is just not the likely intent.
 *
 * Scoped to the season as well as the occasion, because a brand can be in one
 * year's set and not the next.
 *
 * @param {Array} siblings designs for the occasion, any season, drafts included
 * @param {Array} brands   the full roster, in display order
 * @param {object} source  the design being copied
 */
export function nextFreeBrand(siblings, brands, source) {
  const taken = new Set(
    siblings.filter((d) => d.year === source.year).map((d) => d.brand),
  );
  return brands.find((b) => !taken.has(b.id))?.id ?? source.brand ?? brands[0]?.id ?? null;
}

/**
 * Whether artwork is a different shape from the card being copied.
 *
 * A layout is stored entirely in fractions, so it survives a change of pixel
 * size -- but not a change of proportion. `size` is a fraction of the image's
 * HEIGHT while `maxWidth` is a fraction of its WIDTH (src/lib/renderCard.js),
 * so on a taller card the text grows while the space it may wrap into does not,
 * and a band positioned against the bottom edge lands somewhere else entirely.
 *
 * This warns rather than refuses. Copying a layout onto differently-shaped
 * artwork and then adjusting it is a perfectly reasonable thing to do, and it is
 * still far less work than placing everything from scratch.
 *
 * The tolerance absorbs the rounding in the resize step, which fits the long
 * edge to 2000px and rounds both dimensions to whole pixels.
 */
export const RATIO_TOLERANCE = 0.01;

export function aspectDiffers(a, b) {
  if (!a?.width || !a?.height || !b?.width || !b?.height) return false;
  return Math.abs(a.width / a.height - b.width / b.height) > RATIO_TOLERANCE;
}
