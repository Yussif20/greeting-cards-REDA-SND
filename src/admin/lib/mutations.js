import { supabase } from "./supabase.js";
import { designToRow, occasionToRow } from "../../lib/registry/serialize.js";
import { publishSnapshot } from "./publish.js";
import { mutate } from "./mutate.js";

/**
 * Writes.
 *
 * Every one of these can be refused by the database regardless of what the
 * interface allowed: `is_admin()` gates all of them, and the delete policy
 * additionally requires `status = 'draft' and published_at is null`. So
 * deleteDesign below cannot destroy a card customers can currently see, even
 * if a bug called it on a published row.
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
 * A write that must actually have written something.
 *
 * This is the trap PostgREST sets for every RLS-protected table. A DELETE or
 * UPDATE the policy refuses does not fail -- it matches no rows and returns
 * success, because "you may not touch this row" and "there was no such row"
 * are the same answer once the row is invisible to you. Without asking for the
 * affected rows back, a denied delete is indistinguishable from a completed
 * one, and the interface cheerfully reports that it worked.
 *
 * That is exactly what happened: a card was reported deleted, stayed in the
 * list, and nothing anywhere had gone wrong as far as the code could tell.
 *
 * `.select()` makes the write return what it changed, so an empty result is a
 * refusal and can be said out loud.
 */
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
  await mutate(supabase.from("designs").update({ layout }).eq("id", id), "saveLayout");
  await publishSnapshot();
}

export async function updateDesign(id, patch) {
  await mutate(supabase.from("designs").update(patch).eq("id", id), "updateDesign");
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
  await mutate(supabase.from("designs").update({ status }).eq("id", id), "setStatus");
  await publishSnapshot();
}

/**
 * Permanently remove a card that is not currently public.
 *
 * A draft, or something already unpublished. Never a live one: the interface
 * hides the action and the delete policy refuses it, so destroying a card
 * customers can see right now takes two deliberate steps rather than one
 * click. Storage files are left behind either way -- there is no delete policy
 * on storage.objects at all, so an upload is never destroyed by a mis-click,
 * only orphaned.
 */
export async function deleteDesign(id) {
  await mutate(supabase.from("designs").delete().eq("id", id), "deleteDesign");
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

  await mutate(supabase.from("occasions").update(row).eq("slug", slug), "updateOccasion");
  await publishSnapshot();
}

export async function setOccasionStatus(slug, status) {
  await mutate(
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
    await mutate(
      supabase.from("occasions").update({ sort_order: index + 1 }).eq("slug", slug),
      "reorderOccasions",
    );
  }
  await publishSnapshot();
}

/**
 * Permanently remove an occasion that is not currently public.
 *
 * designs.occasion_slug references occasions.slug with no ON DELETE action, so
 * an occasion that still has cards cannot be removed -- Postgres raises a
 * foreign key violation. That refusal is correct: silently orphaning or
 * cascading away a season's artwork would be far worse than a failed click.
 *
 * But "23503" is not an explanation. The count is read first so the interface
 * can say what is actually in the way and how much of it, and the constraint is
 * still caught underneath as the thing that genuinely enforces it -- a card
 * created between the count and the delete must not slip through.
 */
export async function deleteOccasion(slug) {
  const cards = await run(
    supabase.from("designs").select("id").eq("occasion_slug", slug),
    "deleteOccasion/count",
  );

  if (cards.length > 0) {
    const error = new Error("occasionHasDesigns");
    error.code = "occasionHasDesigns";
    error.count = cards.length;
    throw error;
  }

  const { data, error } = await supabase
    .from("occasions")
    .delete()
    .eq("slug", slug)
    .select("slug");

  if (error) {
    if (error.code === "23503") {
      const conflict = new Error("occasionHasDesigns");
      conflict.code = "occasionHasDesigns";
      throw conflict;
    }
    throw new Error(`deleteOccasion: ${error.message}`);
  }
  if (!data?.length) {
    throw new Error("deleteOccasion: the database refused this. Nothing was changed.");
  }

  await publishSnapshot();
}

/* -------------------------------------------------------------------------- */
/* seasons                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Create a season.
 *
 * Without this the whole dashboard stops short of its purpose: cards belong to
 * a season, the upload form only offers seasons that exist, and every card
 * produced next year needs one that does not. The annual task is exactly the
 * task an admin could not do.
 *
 * The id is the season, not a surrogate: it is stored on every design as
 * `season_id` and surfaces in the public URL as ?year=, so it is fixed at
 * creation like an occasion's slug. The database checks the shape too.
 *
 * sort_order counts down from the top, because the year dropdown reads
 * newest-first and the newest season is the one being added.
 */
export async function createSeason({ id, label }) {
  if (!/^[0-9]{4}-[0-9]{4}$/.test(id)) {
    throw new Error(`createSeason: "${id}" must look like 2026-2027`);
  }

  const existing = await run(
    supabase.from("seasons").select("sort_order").order("sort_order", { ascending: false }).limit(1),
    "createSeason/order",
  );

  const { data, error } = await supabase
    .from("seasons")
    .insert({
      id,
      label_en: label.en,
      label_ar: label.ar,
      sort_order: (existing[0]?.sort_order ?? 0) + 1,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw new Error(`createSeason: ${id} already exists`);
    throw new Error(`createSeason: ${error.message}`);
  }
  await publishSnapshot();
  return data;
}

export async function setSeasonStatus(id, status) {
  await mutate(supabase.from("seasons").update({ status }).eq("id", id), "setSeasonStatus");
  await publishSnapshot();
}

/**
 * Remove a season that is not public and holds no cards.
 *
 * designs.season_id references it, so the same foreign key that protects an
 * occasion's artwork protects a season's, and the same courtesy applies: count
 * first so the refusal can say what is in the way.
 */
export async function deleteSeason(id) {
  const cards = await run(
    supabase.from("designs").select("id").eq("season_id", id),
    "deleteSeason/count",
  );
  if (cards.length > 0) {
    const error = new Error("seasonHasDesigns");
    error.code = "seasonHasDesigns";
    error.count = cards.length;
    throw error;
  }

  await mutate(supabase.from("seasons").delete().eq("id", id), "deleteSeason");
  await publishSnapshot();
}

/* -------------------------------------------------------------------------- */
/* categories                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Create a category as a draft.
 *
 * The id is a slug rather than a surrogate key, and it is fixed at creation for
 * the same reason an occasion's is: it travels in the public URL as
 * ?category=, so a shared link depends on it. The database checks the shape
 * too, so a typed id that the form let through is still refused.
 *
 * New categories land at the end of the list. The admin can move them, and
 * appending is the only ordering that does not silently reshuffle the chips
 * every time one is added.
 */
export async function createCategory({ id, label }) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`createCategory: "${id}" must be lower-case letters, digits and dashes`);
  }

  const existing = await run(
    supabase
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1),
    "createCategory/order",
  );

  const { data, error } = await supabase
    .from("categories")
    .insert({
      id,
      label_en: label.en,
      label_ar: label.ar,
      sort_order: (existing[0]?.sort_order ?? 0) + 1,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw new Error(`createCategory: "${id}" already exists`);
    throw new Error(`createCategory: ${error.message}`);
  }
  await publishSnapshot();
  return data;
}

/**
 * Rename a category. Labels only -- never the id, for the reason above.
 *
 * Renaming is worth having where a season does not have it: a season's label is
 * mechanically derived from its id, while a category's is free text somebody
 * typed, and a typo in a chip every visitor sees should not need a developer.
 */
export async function updateCategory(id, label) {
  await mutate(
    supabase.from("categories").update({ label_en: label.en, label_ar: label.ar }).eq("id", id),
    "updateCategory",
  );
  await publishSnapshot();
}

export async function setCategoryStatus(id, status) {
  await mutate(
    supabase.from("categories").update({ status }).eq("id", id),
    "setCategoryStatus",
  );
  await publishSnapshot();
}

/** Persist a new chip order. One row at a time, as with occasions. */
export async function reorderCategories(idsInOrder) {
  for (const [index, id] of idsInOrder.entries()) {
    await mutate(
      supabase.from("categories").update({ sort_order: index + 1 }).eq("id", id),
      "reorderCategories",
    );
  }
  await publishSnapshot();
}

/**
 * Remove a category that is not currently public.
 *
 * Unlike deleteSeason and deleteOccasion this does NOT refuse when cards are
 * filed under it. designs.category_id is nullable with ON DELETE SET NULL, so
 * removing a category un-files its cards and leaves the artwork untouched --
 * there is nothing to orphan, because a design without a category is a valid
 * design that simply shows under "All".
 *
 * The count is still read first, so the confirmation can say how many cards are
 * about to lose their category. "Safe" and "expected" are different things, and
 * the number is the difference.
 */
export async function deleteCategory(id) {
  await mutate(supabase.from("categories").delete().eq("id", id), "deleteCategory");
  await publishSnapshot();
}

/* -------------------------------------------------------------------------- */
/* fonts                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Create a font from files already uploaded to storage.
 *
 * The id is fixed at creation, and it is fixed twice over: it is written into
 * every design's layout as `fontId`, and the CSS family the face registers
 * under is derived from it (see uploadedFamily in src/lib/fontFile.js). A
 * rename would therefore both orphan the cards using it and change the family
 * the browser has already cached.
 *
 * Draft, like everything else. A font with no bold file is perfectly usable --
 * the single face is declared across the whole weight range -- so nothing here
 * insists on one.
 */
export async function createFont({ id, label, regular, bold }) {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`createFont: "${id}" must be lower-case letters, digits and dashes`);
  }
  if (!regular) throw new Error("createFont: the regular file is required");

  const existing = await run(
    supabase.from("fonts").select("sort_order").order("sort_order", { ascending: false }).limit(1),
    "createFont/order",
  );

  const { data, error } = await supabase
    .from("fonts")
    .insert({
      id,
      label_en: label.en,
      label_ar: label.ar,
      regular_src: regular,
      bold_src: bold ?? null,
      sort_order: (existing[0]?.sort_order ?? 0) + 1,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw new Error(`createFont: "${id}" already exists`);
    throw new Error(`createFont: ${error.message}`);
  }
  await publishSnapshot();
  return data;
}

/**
 * Rename, or attach a file that was not there before.
 *
 * `patch` carries only the columns being changed, so adding a bold file later
 * does not require restating the labels. Never the id -- see createFont.
 */
export async function updateFont(id, patch) {
  await mutate(supabase.from("fonts").update(patch).eq("id", id), "updateFont");
  await publishSnapshot();
}

export async function setFontStatus(id, status) {
  await mutate(supabase.from("fonts").update({ status }).eq("id", id), "setFontStatus");
  await publishSnapshot();
}

/** Persist a new picker order. One row at a time, as with occasions. */
export async function reorderFonts(idsInOrder) {
  for (const [index, id] of idsInOrder.entries()) {
    await mutate(
      supabase.from("fonts").update({ sort_order: index + 1 }).eq("id", id),
      "reorderFonts",
    );
  }
  await publishSnapshot();
}

/**
 * Remove a font that is not currently public.
 *
 * No count of affected cards, and no refusal, because there is nothing to
 * count: `layout.fontId` is a string inside jsonb with no foreign key, and
 * getFont() falls back to the default for an id it does not recognise. A card
 * whose font is gone renders in Cairo -- it does not break, and the admin can
 * see it and re-pick. The uploaded file itself is left in storage; there is no
 * delete policy on storage.objects at all, by design.
 */
export async function deleteFont(id) {
  await mutate(supabase.from("fonts").delete().eq("id", id), "deleteFont");
  await publishSnapshot();
}

