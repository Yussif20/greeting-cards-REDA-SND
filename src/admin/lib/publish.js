import { supabase } from "./supabase.js";
import { snapshotFromRows, isUsableSnapshot } from "../../lib/registry/serialize.js";
import { MEDIA_BUCKET } from "./storage.js";

/**
 * Rebuild registry.json from the published rows and put it on the CDN.
 *
 * This is the only thing that makes an edit visible. The public site never
 * queries Postgres -- it reads this file -- so a mutation that skipped this
 * step would be saved and invisible, which is a worse failure than an error.
 *
 * The Node equivalent is scripts/snapshot-publish.mjs; both build the payload
 * with the same serialiser, so a snapshot published from a browser and one
 * published from the command line are byte-identical.
 */

const REGISTRY_PATH = "registry/registry.json";

/**
 * Optional. A Netlify build hook, so a deploy picks up the newly published
 * content as its bundled fallback.
 *
 * Publishing already makes a change live -- the site fetches the snapshot and
 * swaps it in within seconds. This is about the *other* copy: the one compiled
 * into the bundle, which is what a visitor sees when the fetch fails, when
 * they are offline, or when the project is paused. Without a rebuild that copy
 * drifts further behind every publish, and the fallback quietly becomes a
 * worse and worse answer.
 *
 * The URL is a secret in the sense that anyone holding it can trigger builds,
 * but not in the sense that it exposes data. It is VITE_-prefixed because the
 * admin chunk needs it, so treat it as spendable: rotate it in Netlify if it
 * leaks, and leave it unset if that trade is not worth it. Everything works
 * without it, just with a staler fallback.
 */
const BUILD_HOOK = import.meta.env.VITE_NETLIFY_BUILD_HOOK ?? null;

/**
 * Fire and forget, deliberately.
 *
 * A rebuild is a nicety on top of a publish that has already succeeded. If the
 * hook is down, or rate limited, or simply not configured, the content is
 * still live and the admin should not be told anything went wrong -- because
 * from their point of view, nothing did.
 */
function requestRebuild() {
  if (!BUILD_HOOK) return;
  fetch(BUILD_HOOK, { method: "POST", body: "{}" }).catch(() => {});
}

/**
 * Thirty seconds, not a year.
 *
 * Long enough that a burst of traffic is served by the CDN rather than the
 * origin, short enough that an admin who publishes and then reloads the site
 * sees their change while still looking at it. Build-time pulls bypass this
 * cache deliberately -- see scripts/snapshot-pull.mjs.
 */
const REGISTRY_CACHE = "30";

const publishedRows = async (table) => {
  const { data, error } = await supabase.from(table).select("*").eq("status", "published");
  if (error) throw new Error(`publishSnapshot/${table}: ${error.message}`);
  return data ?? [];
};

async function upload(path, snapshot, { upsert }) {
  const body = new Blob([JSON.stringify(snapshot)], { type: "application/json" });
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, body, {
    contentType: "application/json",
    cacheControl: REGISTRY_CACHE,
    upsert,
  });
  // A history entry that already exists is not a failure worth surfacing.
  if (error && !(String(error.message).includes("exists") && !upsert)) {
    throw new Error(`publishSnapshot/${path}: ${error.message}`);
  }
}

export async function publishSnapshot() {
  const [seasons, occasions, designs] = await Promise.all([
    publishedRows("seasons"),
    publishedRows("occasions"),
    publishedRows("designs"),
  ]);

  const revision = Date.now();
  const snapshot = snapshotFromRows(
    { seasons, occasions, designs },
    { revision, generatedAt: new Date(revision).toISOString() },
  );

  // Refuse to publish something registryStore would reject on arrival. Better
  // to fail here, with the previous registry still serving, than to overwrite
  // a working one with a payload every visitor silently discards.
  if (!isUsableSnapshot(snapshot)) {
    throw new Error(
      "publishSnapshot: assembled snapshot failed the structural guard -- are any rows published?",
    );
  }

  // History first, so an interrupted publish leaves the revision recoverable
  // rather than lost between two writes.
  await upload(`registry/history/${revision}.json`, snapshot, { upsert: false });
  await upload(REGISTRY_PATH, snapshot, { upsert: true });

  // After the snapshot is live, never before: a rebuild that raced the upload
  // would bundle the previous revision.
  requestRebuild();

  return revision;
}
