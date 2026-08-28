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
const { seasonToRow, occasionToRow, designToRow, snapshotFromRows } = await load(
  "src/lib/registry/serialize.js",
);

const occasions = snapshot.occasions;
const designs = Object.values(snapshot.designs).flat();

console.log(`\nSeeding ${URL_BASE}\n`);

// Seasons first, then occasions, then designs -- foreign keys run downhill.
await upsert(
  "seasons",
  snapshot.seasons.map((s, i) => seasonToRow(s, i, snapshot.seasons.length)),
  "id",
);

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

const [seasonRows, occasionRows, designRows] = await Promise.all([
  readAll("seasons", ANON_KEY),
  readAll("occasions", ANON_KEY),
  readAll("designs", ANON_KEY),
]);

const rebuilt = snapshotFromRows(
  { seasons: seasonRows, occasions: occasionRows, designs: designRows },
  { revision: snapshot.revision, generatedAt: snapshot.generatedAt },
);

try {
  assert.deepStrictEqual(rebuilt.seasons, snapshot.seasons, "seasons differ");
  assert.deepStrictEqual(rebuilt.occasions, snapshot.occasions, "occasions differ");
  assert.deepStrictEqual(rebuilt.designs, snapshot.designs, "designs differ");
} catch (err) {
  console.error("MISMATCH -- Postgres does not reproduce the bundled snapshot.\n");
  console.error(err.message);
  process.exit(1);
}

console.log(`  seasons   ${rebuilt.seasons.length}`);
console.log(`  occasions ${rebuilt.occasions.length}`);
console.log(`  designs   ${Object.values(rebuilt.designs).flat().length}`);
console.log("\nPostgres reproduces the bundled snapshot exactly, read through anon.\n");
