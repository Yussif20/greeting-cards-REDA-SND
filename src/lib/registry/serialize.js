// The row <-> runtime mapping, in one place.
//
// Pure: no Supabase import, no DOM, no filesystem. It is loaded by the Vite
// bundle, by the Node migration script and by the snapshot builder, so it must
// stay portable across all three.
//
// The runtime shapes below are the shapes the components have always consumed.
// Nothing adapts at read time -- a snapshot is what `src/data/*.js` used to
// export, serialised.

/** Snapshot format. Bump when the *shape* changes, not when content does. */
export const SNAPSHOT_VERSION = 1;

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

export const rowToOccasion = (r) => ({
  slug: r.slug,
  order: r.sort_order,
  enabled: r.enabled,
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

export const occasionToRow = (o) => ({
  slug: o.slug,
  sort_order: o.order,
  enabled: o.enabled,
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
 * @param {{seasons: Array, occasions: Array, designs: Array}} data
 * @param {{revision: number, generatedAt?: string}} meta
 */
export function buildSnapshot({ seasons, occasions, designs }, { revision, generatedAt }) {
  const byOccasion = {};
  for (const o of occasions) byOccasion[o.slug] = [];
  for (const d of designs) (byOccasion[d.occasion] ??= []).push(d);
  for (const list of Object.values(byOccasion)) list.sort((a, b) => a.number - b.number);

  return {
    version: SNAPSHOT_VERSION,
    revision,
    generatedAt: generatedAt ?? null,
    seasons: [...seasons],
    occasions: [...occasions].sort((a, b) => a.order - b.order),
    designs: byOccasion,
  };
}

/** Build a snapshot straight from Supabase rows. */
export const snapshotFromRows = ({ seasons, occasions, designs }, meta) =>
  buildSnapshot(
    {
      seasons: seasons.map(rowToSeason),
      occasions: occasions.map(rowToOccasion),
      designs: designs.map(rowToDesign),
    },
    meta,
  );

/**
 * Cheap structural guard. A malformed snapshot must never replace a working
 * one, so this runs before every swap -- including the very first load.
 */
export function isUsableSnapshot(s) {
  return Boolean(
    s &&
      typeof s.revision === "number" &&
      Array.isArray(s.occasions) &&
      s.occasions.length > 0 &&
      Array.isArray(s.seasons) &&
      s.seasons.length > 0 &&
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
