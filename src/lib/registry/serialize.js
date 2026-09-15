// The row <-> runtime mapping, in one place.
//
// Pure: no Supabase import, no DOM, no filesystem. It is loaded by the Vite
// bundle, by the Node migration script and by the snapshot builder, so it must
// stay portable across all three.
//
// The runtime shapes below are the shapes the components have always consumed.
// Nothing adapts at read time -- a snapshot is what `src/data/*.js` used to
// export, serialised.

/**
 * Snapshot format. Bump when the *shape* changes, not when content does.
 *
 * 2 added `categories` and `design.category`; 3 added `fonts`; 4 added
 * `occasion.brandCovers`. Nothing reads this number to decide how to parse --
 * every reader tolerates all three being absent, which is what lets a deploy
 * built before a migration keep serving while the published snapshot has
 * already moved on.
 */
export const SNAPSHOT_VERSION = 4;

/** Hero derivatives the sharp pipeline produces for the original six. */
export const LEGACY_HERO_FORMATS = ["avif", "webp", "jpg"];
/** Hero derivatives a browser can encode. No AVIF -- see processHero. */
export const UPLOAD_HERO_FORMATS = ["webp", "jpg"];
export const HERO_WIDTHS = [760, 1520];

const emptyToNull = (v) => (v === "" ? null : v);

/* -------------------------------------------------------------------------- */
/* rows -> runtime                                                            */
/* -------------------------------------------------------------------------- */

export const rowToSeason = (r) => ({
  id: r.id,
  label: { en: r.label_en, ar: r.label_ar },
});

// Categories carry `order` where seasons do not: a season list has an obvious
// newest, and a category list has only the order the admin arranged.
export const rowToCategory = (r) => ({
  id: r.id,
  label: { en: r.label_en, ar: r.label_ar },
  order: r.sort_order,
});

// Only the two file paths and the labels. The CSS family, the format hint and
// the weight range are all derived at runtime from the id and the extensions --
// see src/lib/fontFile.js -- so none of them can drift out of step with what
// was actually stored.
export const rowToFont = (r) => ({
  id: r.id,
  label: { en: r.label_en, ar: r.label_ar },
  order: r.sort_order,
  regular: r.regular_src,
  bold: r.bold_src ?? null,
});

export const rowToOccasion = (r) => ({
  slug: r.slug,
  order: r.sort_order,
  enabled: r.enabled,
  // Keyed by brand id, each value { src, width, height }. Defaulted rather than
  // passed through, so a row written before 0007_brand_covers.sql -- and a
  // snapshot published before it -- reads as "no covers" rather than undefined.
  brandCovers: r.brand_covers ?? {},
  title: { ar: r.title_ar, en: r.title_en },
  shortTitle: { ar: r.short_title_ar, en: r.short_title_en },
  tagline: { ar: r.tagline_ar ?? "", en: r.tagline_en ?? "" },
  edition: r.edition,
  hero: r.hero,
  icon: r.icon,
  cardsDir: r.cards_dir,
  artStatus: r.art_status,
  placeholderSource: r.placeholder_source,
  theme: r.theme,
});

// `season_id` becomes `year` on the way out. That single rename is what keeps
// getDesigns(slug, year), the brand picker and DesignsPage's ?year= param
// from ever learning a new word.
export const rowToDesign = (r) => ({
  id: r.id,
  number: r.number,
  year: r.season_id,
  occasion: r.occasion_slug,
  style: r.style,
  src: r.src,
  thumb: r.thumb,
  width: r.width,
  height: r.height,
  brandBakedIn: r.brand_baked_in,
  brand: r.brand,
  // Null for every card made before categories existed, and for any occasion
  // that never needs the distinction. Readers must treat it as optional.
  category: r.category_id ?? null,
  isPlaceholder: r.is_placeholder,
  layout: r.layout,
});

/* -------------------------------------------------------------------------- */
/* runtime -> rows                                                            */
/* -------------------------------------------------------------------------- */

export const seasonToRow = (s, i, total) => ({
  id: s.id,
  label_en: s.label.en,
  label_ar: s.label.ar,
  // YEARS is newest-first, so the newest season needs the highest sort_order
  // for `order by sort_order desc` to reproduce it.
  sort_order: total - i,
  status: "published",
});

export const categoryToRow = (c, i = 0) => ({
  id: c.id,
  label_en: c.label.en,
  label_ar: c.label.ar,
  sort_order: c.order ?? i + 1,
  status: "published",
});

export const fontToRow = (f, i = 0) => ({
  id: f.id,
  label_en: f.label.en,
  label_ar: f.label.ar,
  sort_order: f.order ?? i + 1,
  regular_src: f.regular,
  bold_src: f.bold ?? null,
  status: "published",
});

export const occasionToRow = (o) => ({
  slug: o.slug,
  sort_order: o.order,
  enabled: o.enabled,
  brand_covers: o.brandCovers ?? {},
  status: "published",
  title_en: o.title.en,
  title_ar: o.title.ar,
  short_title_en: o.shortTitle.en,
  short_title_ar: o.shortTitle.ar,
  tagline_en: emptyToNull(o.tagline?.en ?? null),
  tagline_ar: emptyToNull(o.tagline?.ar ?? null),
  edition: o.edition,
  hero: o.hero,
  icon: o.icon,
  cards_dir: o.cardsDir,
  art_status: o.artStatus,
  placeholder_source: o.placeholderSource,
  theme: o.theme,
});

export const designToRow = (d) => ({
  id: d.id,
  occasion_slug: d.occasion,
  season_id: d.year,
  number: d.number,
  style: d.style,
  src: d.src,
  thumb: d.thumb,
  width: d.width,
  height: d.height,
  brand: d.brand,
  brand_baked_in: d.brandBakedIn,
  category_id: d.category ?? null,
  is_placeholder: d.isPlaceholder,
  layout: d.layout,
  layout_version: 1,
  status: "published",
  sort_order: d.number,
});

/* -------------------------------------------------------------------------- */
/* snapshot                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Assemble a snapshot from runtime-shaped collections.
 *
 * `designs` is keyed by occasion slug because that mirrors the old
 * DESIGNS_BY_OCCASION and saves a grouping pass at boot.
 *
 * `categories` and `fonts` default to empty rather than being required, so a
 * caller that predates them -- an old test, a hand-assembled payload -- still
 * produces a snapshot the store accepts.
 *
 * @param {{seasons: Array, occasions: Array, designs: Array,
 *          categories?: Array, fonts?: Array}} data
 * @param {{revision: number, generatedAt?: string}} meta
 */
export function buildSnapshot(
  { seasons, occasions, designs, categories = [], fonts = [] },
  { revision, generatedAt },
) {
  const byOccasion = {};
  for (const o of occasions) byOccasion[o.slug] = [];
  for (const d of designs) (byOccasion[d.occasion] ??= []).push(d);
  for (const list of Object.values(byOccasion)) list.sort((a, b) => a.number - b.number);

  return {
    version: SNAPSHOT_VERSION,
    revision,
    generatedAt: generatedAt ?? null,
    seasons: [...seasons],
    // Lowest sort_order first -- see rowToCategory.
    categories: [...categories].sort((a, b) => a.order - b.order),
    fonts: [...fonts].sort((a, b) => a.order - b.order),
    occasions: [...occasions].sort((a, b) => a.order - b.order),
    designs: byOccasion,
  };
}

/** Build a snapshot straight from Supabase rows. */
export const snapshotFromRows = ({ seasons, occasions, designs, categories, fonts }, meta) =>
  buildSnapshot(
    {
      seasons: seasons.map(rowToSeason),
      // Tolerates undefined so a caller that has not been taught to read the
      // table yet degrades to "none of those" rather than throwing.
      categories: (categories ?? []).map(rowToCategory),
      fonts: (fonts ?? []).map(rowToFont),
      occasions: occasions.map(rowToOccasion),
      designs: designs.map(rowToDesign),
    },
    meta,
  );

/**
 * Cheap structural guard. A malformed snapshot must never replace a working
 * one, so this runs before every swap -- including the very first load.
 *
 * `categories` and `fonts` are checked for *shape* but not for presence, and
 * the two are different things. A snapshot published before their migrations
 * ran has no such key at all, and refusing it would strand a site on its bundled
 * fallback for the sake of a list that is allowed to be empty. A key that is
 * present and not an array is a different matter -- that is a malformed payload,
 * and it fails here rather than at the first `.filter` in a component.
 */
export function isUsableSnapshot(s) {
  return Boolean(
    s &&
      typeof s.revision === "number" &&
      Array.isArray(s.occasions) &&
      s.occasions.length > 0 &&
      Array.isArray(s.seasons) &&
      s.seasons.length > 0 &&
      (s.categories === undefined || Array.isArray(s.categories)) &&
      (s.fonts === undefined || Array.isArray(s.fonts)) &&
      s.designs &&
      typeof s.designs === "object" &&
      !Array.isArray(s.designs),
  );
}

/**
 * JSON with object keys in a stable order.
 *
 * Postgres jsonb does not preserve key order, so the same layout read back
 * from the database can be spelled differently from the one that was written.
 * Anything that compares two layouts, or writes one into a file people diff,
 * has to be insensitive to that -- otherwise "has this changed?" answers yes
 * for a layout nobody touched, and a snapshot with identical content produces
 * a fourteen-hundred-line diff.
 */
export function stableStringify(value, space) {
  const order = (v) =>
    Array.isArray(v)
      ? v.map(order)
      : v && typeof v === "object"
        ? Object.fromEntries(
            Object.keys(v)
              .sort()
              .map((key) => [key, order(v[key])]),
          )
        : v;
  return JSON.stringify(order(value), null, space);
}
