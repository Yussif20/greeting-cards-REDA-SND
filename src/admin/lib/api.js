// Reads for /admin.
//
// Deliberately not the registry store. The public site reads a snapshot of
// *published* rows; /admin must see drafts and archives too, and must see them
// the instant they change rather than at the next publish. So the admin talks
// to Postgres directly and the two paths stay separate on purpose.
//
// Rows are mapped through the same serialiser the snapshot uses, so an
// occasion object here is identical in shape to one the public components
// already render -- which is what lets /admin reuse OccasionIcon, DesignCard
// and the editor without adapters. `status` is carried alongside, since it is
// the one thing the public shape has no room for.

import { supabase } from "./supabase.js";
import { rowToOccasion, rowToDesign, rowToSeason } from "../../lib/registry/serialize.js";

const withStatus = (map) => (row) => ({
  ...map(row),
  status: row.status,
  updatedAt: row.updated_at,
  publishedAt: row.published_at,
});

const toOccasion = withStatus(rowToOccasion);
const toDesign = withStatus(rowToDesign);

async function query(builder, label) {
  const { data, error } = await builder;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data ?? [];
}

export const listOccasions = async () =>
  (
    await query(
      supabase.from("occasions").select("*").order("sort_order", { ascending: true }),
      "listOccasions",
    )
  ).map(toOccasion);

export const listSeasons = async () =>
  (
    await query(
      supabase.from("seasons").select("*").order("sort_order", { ascending: false }),
      "listSeasons",
    )
  ).map((row) => ({ ...rowToSeason(row), status: row.status }));

export const listDesigns = async (occasionSlug) => {
  const base = supabase.from("designs").select("*");
  const scoped = occasionSlug ? base.eq("occasion_slug", occasionSlug) : base;
  return (
    await query(
      scoped.order("season_id", { ascending: false }).order("number", { ascending: true }),
      "listDesigns",
    )
  ).map(toDesign);
};

/** One design by id, drafts included -- the layout editor's entry point. */
export const getDesignById = async (id) => {
  const rows = await query(
    supabase.from("designs").select("*").eq("id", id).limit(1),
    "getDesignById",
  );
  if (!rows.length) throw new Error(`getDesignById: no design "${id}"`);
  return toDesign(rows[0]);
};

/** How many designs each occasion has, and how many are not yet live. */
export const designCounts = async () => {
  const rows = await query(
    supabase.from("designs").select("occasion_slug,status"),
    "designCounts",
  );
  const counts = {};
  for (const { occasion_slug: slug, status } of rows) {
    counts[slug] ??= { total: 0, draft: 0 };
    counts[slug].total += 1;
    if (status !== "published") counts[slug].draft += 1;
  }
  return counts;
};
