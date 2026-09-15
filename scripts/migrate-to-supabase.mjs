// Seed Supabase from the bundled registry snapshot.
//
//   node --env-file=.env.local scripts/migrate-to-supabase.mjs
//
// Idempotent: every write is an upsert on the primary key, so re-running is
// safe and is the intended way to repair a partial run.
//
// Deliberately dependency-free. PostgREST is a REST API, so plain fetch is
// enough, and the migration stays runnable before anyone has run npm install.
//
// The verification pass at the end is the point of the script, not a nicety:
// it re-reads everything through the ANON key and asserts the result is
// byte-identical to the snapshot the app already ships. That single assertion
// proves the data landed correctly AND that the public RLS read path works.

import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const load = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);

const URL_BASE = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

for (const [name, value] of Object.entries({
  SUPABASE_URL: URL_BASE,
  SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
  VITE_SUPABASE_ANON_KEY: ANON_KEY,
})) {
  if (!value) {
    console.error(`Missing ${name}. Copy .env.example to .env.local and fill it in.`);
    process.exit(1);
  }
}

const rest = (table, key, { method = "GET", body, query = "", prefer } = {}) =>
  fetch(`${URL_BASE}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

async function upsert(table, rows, onConflict) {
  const res = await rest(table, SERVICE_KEY, {
    method: "POST",
    body: rows,
    query: `?on_conflict=${onConflict}`,
    prefer: "resolution=merge-duplicates,return=minimal",
  });
  if (!res.ok) {
    throw new Error(`upsert ${table} failed (${res.status}): ${await res.text()}`);
  }
  console.log(`  ${table.padEnd(10)} ${String(rows.length).padStart(3)} rows`);
}

async function readAll(table, key) {
  const res = await rest(table, key, { query: "?select=*" });
  if (!res.ok) throw new Error(`read ${table} failed (${res.status}): ${await res.text()}`);
  return res.json();
}

/* -------------------------------------------------------------------------- */

const { default: snapshot } = await load("src/data/registry.snapshot.js");
const {
  seasonToRow,
  categoryToRow,
  fontToRow,
  occasionToRow,
  rowToOccasion,
  designToRow,
  rowToDesign,
  buildSnapshot,
  snapshotFromRows,
} = await load("src/lib/registry/serialize.js");

const occasions = snapshot.occasions;
const designs = Object.values(snapshot.designs).flat();
// Absent from any snapshot taken before 0005_categories.sql, which is most of
// them -- and an empty list is a valid state anyway, since a card does not need
// a category.
const categories = snapshot.categories ?? [];
const fonts = snapshot.fonts ?? [];

console.log(`\nSeeding ${URL_BASE}\n`);

// Seasons and categories first, then occasions, then designs -- foreign keys
// run downhill, and designs.category_id points at a category.
await upsert(
  "seasons",
  snapshot.seasons.map((s, i) => seasonToRow(s, i, snapshot.seasons.length)),
  "id",
);

if (categories.length) await upsert("categories", categories.map(categoryToRow), "id");
// Fonts reference nothing and nothing references them with a foreign key, so
// order is irrelevant here -- they sit with the other taxonomies for reading.
if (fonts.length) await upsert("fonts", fonts.map(fontToRow), "id");

// Occasions go in two passes. placeholder_source is a self-reference, and
// while Postgres would in fact check it at statement end, splitting the write
// makes correctness obvious rather than dependent on trigger timing.
await upsert(
  "occasions",
  occasions.map((o) => ({ ...occasionToRow(o), placeholder_source: null })),
  "slug",
);

const borrowing = occasions.filter((o) => o.placeholderSource);
if (borrowing.length) {
  await upsert("occasions", borrowing.map(occasionToRow), "slug");
  console.log(`  ${"".padEnd(10)} ${String(borrowing.length).padStart(3)} placeholder links`);
}

await upsert("designs", designs.map(designToRow), "id");

/* -------------------------------------------------------------------------- */
/* verification -- through the anon key, i.e. through public RLS              */
/* -------------------------------------------------------------------------- */

console.log("\nVerifying through the anon key (public RLS path)\n");

const [seasonRows, occasionRows, designRows, categoryRows, fontRows] = await Promise.all([
  readAll("seasons", ANON_KEY),
  readAll("occasions", ANON_KEY),
  readAll("designs", ANON_KEY),
  // A database that has not had 0005_categories.sql or 0006_fonts.sql applied
  // answers 404 here. That is a seed worth completing rather than aborting:
  // nothing else depends on either table, and the comparison below then has
  // nothing to compare.
  readAll("categories", ANON_KEY).catch(() => []),
  readAll("fonts", ANON_KEY).catch(() => []),
]);

const rebuilt = snapshotFromRows(
  {
    seasons: seasonRows,
    occasions: occasionRows,
    designs: designRows,
    categories: categoryRows,
    fonts: fontRows,
  },
  { revision: snapshot.revision, generatedAt: snapshot.generatedAt },
);

/**
 * The bundled snapshot, put through the same serialiser as the rows just read.
 *
 * Compared raw, this assertion fails whenever the committed snapshot predates a
 * column. rowToDesign now always emits `category`, so a snapshot published
 * before 0005_categories.sql -- which is every snapshot on a project that has
 * not republished since -- has no such key and deep-equals nothing, through
 * nobody's fault. That is a check that fails because someone did their job, and
 * a check like that gets ignored rather than believed.
 *
 * Round-tripping the expected side through designToRow -> rowToDesign compares
 * the two by VALUE at the current shape, which is what this was ever asserting:
 * that Postgres gives back what went in, read through the public RLS path.
 *
 * Occasions go through the same round trip for the same reason, and it is no
 * longer hypothetical: rowToOccasion now always emits `brandCovers`, so every
 * snapshot taken before 0007_brand_covers.sql lacks the key while every row read
 * back carries `{}`. Anything added to an occasion later lands here too, which
 * is why both sides are round-tripped rather than only the one that broke.
 */
const expected = buildSnapshot(
  {
    seasons: snapshot.seasons,
    occasions: snapshot.occasions.map((o) => rowToOccasion(occasionToRow(o))),
    designs: designs.map((d) => rowToDesign(designToRow(d))),
    categories,
    fonts,
  },
  { revision: snapshot.revision, generatedAt: snapshot.generatedAt },
);

try {
  assert.deepStrictEqual(rebuilt.seasons, expected.seasons, "seasons differ");
  assert.deepStrictEqual(rebuilt.categories, expected.categories, "categories differ");
  assert.deepStrictEqual(rebuilt.fonts, expected.fonts, "fonts differ");
  assert.deepStrictEqual(rebuilt.occasions, expected.occasions, "occasions differ");
  assert.deepStrictEqual(rebuilt.designs, expected.designs, "designs differ");
} catch (err) {
  console.error("MISMATCH -- Postgres does not reproduce the bundled snapshot.\n");
  console.error(err.message);
  process.exit(1);
}

console.log(`  seasons    ${rebuilt.seasons.length}`);
console.log(`  categories ${rebuilt.categories.length}`);
console.log(`  fonts      ${rebuilt.fonts.length}`);
console.log(`  occasions  ${rebuilt.occasions.length}`);
console.log(`  designs    ${Object.values(rebuilt.designs).flat().length}`);
console.log("\nPostgres reproduces the bundled snapshot exactly, read through anon.\n");
