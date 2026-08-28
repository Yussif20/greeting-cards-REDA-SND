import { supabase } from "./supabase.js";
import { designToRow, occasionToRow } from "../../lib/registry/serialize.js";
import { publishSnapshot } from "./publish.js";

/**
 * Writes.
 *
 * Every one of these can be refused by the database regardless of what the
 * interface allowed: `is_admin()` gates all of them, and the delete policy
 * additionally requires `status = 'draft' and published_at is null`. So
 * deleteDraft below cannot destroy something a customer may have linked to
 * even if a bug called it on a published row.
 *
 * Each mutation republishes the snapshot, because a change nobody can see is
 * not a change. That is one extra round trip per save, which is the right
 * trade for never leaving the live site behind the database.
 */

const run = async (builder, label) => {
  const { data, error } = await builder;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data;
};

/**
 * The next free card number for an occasion and season.
 *
 * Numbers are never reused, even after an archive: the number is baked into
 * the design id, the id is in shared URLs and in localStorage draft keys, and
 * reissuing one would silently point old links at new artwork. A unique
 * constraint backs this up, and createDesign retries on the collision rather
 * than trusting the read.
 */
export async function nextNumber(occasionSlug, seasonId) {
  const rows = await run(
    supabase
      .from("designs")
      .select("number")
      .eq("occasion_slug", occasionSlug)
      .eq("season_id", seasonId)
      .order("number", { ascending: false })
      .limit(1),
    "nextNumber",
  );
  return (rows[0]?.number ?? 0) + 1;
}

export const designId = (slug, season, number) =>
  `${slug}-${season}-${String(number).padStart(2, "0")}`;

/**
 * Insert a card as a draft.
 *
 * Draft is not a default worth overriding: a card is useless until its layout
 * has been placed on the artwork, and publishing between those two steps would
 * put a card in front of customers with the name sitting over the calligraphy.
 *
 * Two admins creating a card at the same moment can pick the same number. The
 * unique (occasion, season, number) constraint catches it as Postgres 23505,
 * and the retry re-reads rather than surfacing a raw database error.
 */
export async function createDesign(input, attempt = 0) {
  const number = input.number ?? (await nextNumber(input.occasion, input.year));
  const row = designToRow({ ...input, number, id: designId(input.occasion, input.year, number) });

  const { data, error } = await supabase
    .from("designs")
    .insert({ ...row, status: "draft", published_at: null })
    .select()
    .single();

  if (error) {
    if (error.code === "23505" && attempt < 3) {
      return createDesign({ ...input, number: undefined }, attempt + 1);
    }
    throw new Error(`createDesign: ${error.message}`);
  }
  return data;
}

/** Save a design's layout, the output of the visual editor. */
export async function saveLayout(id, layout) {
  await run(supabase.from("designs").update({ layout }).eq("id", id), "saveLayout");
  await publishSnapshot();
}

export async function updateDesign(id, patch) {
  await run(supabase.from("designs").update(patch).eq("id", id), "updateDesign");
  await publishSnapshot();
}

/**
 * Publish, or take back out of circulation.
 *
 * Archiving rather than deleting is what keeps a shared link from turning into
 * a 404 by accident. `published_at` is stamped once by a trigger and never
 * cleared, so a row that has been live once can never again qualify for the
 * delete policy.
 */
export async function setStatus(id, status) {
  await run(supabase.from("designs").update({ status }).eq("id", id), "setStatus");
  await publishSnapshot();
}

/**
 * Permanently remove a draft that was never published.
 *
 * The interface only offers this on such rows, and the database enforces the
 * same rule independently. Storage files are deliberately left behind: there
 * is no delete policy on storage.objects at all, so an upload is never
 * destroyed by a mis-click, only orphaned.
 */
export async function deleteDraft(id) {
  await run(supabase.from("designs").delete().eq("id", id), "deleteDraft");
  await publishSnapshot();
}

/* -------------------------------------------------------------------------- */
/* occasions                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Create an occasion as a draft.
 *
 * The slug is the primary key and it is embedded in every one of that
 * occasion's design ids, in its public URL, and in the localStorage draft keys
 * of everyone who has customised one of its cards. It is therefore fixed at
 * creation: the form only lets it be edited while nothing has been published.
 */
export async function createOccasion(input) {
  const { data, error } = await supabase
    .from("occasions")
    .insert({ ...occasionToRow(input), status: "draft", published_at: null })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw new Error(`createOccasion: the slug "${input.slug}" is taken`);
    throw new Error(`createOccasion: ${error.message}`);
  }
  await publishSnapshot();
  return data;
}

export async function updateOccasion(slug, input) {
  const row = occasionToRow(input);
  // Never rewrite the primary key from a form submission: designs reference it
  // and their ids embed it, so a slug change would orphan the artwork.
  delete row.slug;
  delete row.status;

  await run(supabase.from("occasions").update(row).eq("slug", slug), "updateOccasion");
  await publishSnapshot();
}

export async function setOccasionStatus(slug, status) {
  await run(
    supabase.from("occasions").update({ status }).eq("slug", slug),
    "setOccasionStatus",
  );
  await publishSnapshot();
}

/**
 * Persist a new display order.
 *
 * Written one row at a time rather than as a bulk upsert: an upsert of partial
 * rows would need every not-null column restated, and getting that wrong is a
 * good way to blank a tagline while reordering tiles.
 */
export async function reorderOccasions(slugsInOrder) {
  for (const [index, slug] of slugsInOrder.entries()) {
    await run(
      supabase.from("occasions").update({ sort_order: index + 1 }).eq("slug", slug),
      "reorderOccasions",
    );
  }
  await publishSnapshot();
}

/** Only ever reachable for a draft that was never published. */
export async function deleteOccasionDraft(slug) {
  await run(supabase.from("occasions").delete().eq("slug", slug), "deleteOccasionDraft");
  await publishSnapshot();
}
