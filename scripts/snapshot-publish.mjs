// Publish the current database state as the live registry snapshot.
//
//   npm run snapshot:publish
//
// The admin dashboard will do this from the browser after every mutation; this
// script is the same operation from the command line. It stays useful even
// once the UI exists: bootstrapping a new environment, recovering after a
// hand-edit in the Supabase dashboard, or re-publishing when a browser publish
// was interrupted.
//
// Only PUBLISHED rows are included. Drafts exist in the database and are
// visible in /admin, but they must never reach the snapshot the public site
// reads -- that is the whole mechanism behind per-item draft/live status.

import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const load = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);

const URL_BASE = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_BASE || !SERVICE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (see .env.example).");
  process.exit(1);
}

const auth = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };

async function readPublished(table) {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}?select=*&status=eq.published`, {
    headers: auth,
  });
  if (!res.ok) throw new Error(`read ${table} failed (${res.status}): ${await res.text()}`);
  return res.json();
}

async function upload(objectPath, json, { upsert }) {
  const res = await fetch(`${URL_BASE}/storage/v1/object/media/${objectPath}`, {
    method: "POST",
    headers: {
      ...auth,
      "Content-Type": "application/json",
      // The snapshot is polled on every page load, so it must not be cached
      // for long -- but it must be cached a little, or a busy day turns into
      // one origin request per visitor.
      "Cache-Control": "max-age=30",
      ...(upsert ? { "x-upsert": "true" } : {}),
    },
    body: JSON.stringify(json),
  });
  if (!res.ok && !(res.status === 409 && !upsert)) {
    throw new Error(`upload ${objectPath} failed (${res.status}): ${await res.text()}`);
  }
  return res.status;
}

const { snapshotFromRows, isUsableSnapshot } = await load("src/lib/registry/serialize.js");

// Tolerated rather than required for the last two: this script is how a
// database is bootstrapped or repaired, and it must still run against one where
// 0005_categories.sql or 0006_fonts.sql has not been applied. PostgREST answers
// a missing table with 404, which readPublished turns into a throw -- so the
// miss is caught here and reported once, rather than failing a publish that is
// otherwise entirely correct.
const optional = (table) =>
  readPublished(table).catch(() => {
    console.warn(`  ${table} table not found -- publishing without it`);
    return [];
  });

const [seasons, occasions, designs, categories, fonts] = await Promise.all([
  readPublished("seasons"),
  readPublished("occasions"),
  readPublished("designs"),
  optional("categories"),
  optional("fonts"),
]);

const revision = Date.now();
const snapshot = snapshotFromRows(
  { seasons, occasions, designs, categories, fonts },
  { revision, generatedAt: new Date(revision).toISOString() },
);

// Refuse to publish something the client would reject anyway. Better to fail
// here than to overwrite a working registry with one the store will discard.
if (!isUsableSnapshot(snapshot)) {
  console.error("Refusing to publish: the assembled snapshot failed the structural guard.");
  console.error("Are any rows published? Drafts are excluded by design.");
  process.exit(1);
}

// History first. If the second upload fails, the revision is still recoverable
// rather than lost between two writes.
await upload(`registry/history/${revision}.json`, snapshot, { upsert: false });
await upload("registry/registry.json", snapshot, { upsert: true });

console.log(`\npublished revision ${revision}`);
console.log(`  seasons    ${snapshot.seasons.length}`);
console.log(`  categories ${snapshot.categories.length}`);
console.log(`  fonts      ${snapshot.fonts.length}`);
console.log(`  occasions  ${snapshot.occasions.length}`);
console.log(`  designs    ${Object.values(snapshot.designs).flat().length}`);
console.log(`\n  ${URL_BASE}/storage/v1/object/public/media/registry/registry.json\n`);
