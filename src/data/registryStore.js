// The registry, and the one place it is allowed to change.
//
// Seeded synchronously from the bundled snapshot, then revalidated once from
// the CDN. That ordering is the whole point: a valid registry exists at
// module-eval time, so getOccasion() and getDesign() stay synchronous, the
// pages keep their `if (!occasion) return <NotFoundPage />` guards, and a
// refresh never flashes a 404 while data loads.
//
// Consequences worth stating, because they are load-bearing:
//   - No async accessor is exported. Ever. getRegistry() never returns null
//     and never returns a promise.
//   - revalidate() is fire-and-forget, called after render(), never awaited.
//     If it fails -- offline, or the free-tier project is paused -- the bundled
//     snapshot simply stands, and the site is fully usable.

import fallback from "./registry.snapshot.js";
import { isUsableSnapshot } from "../lib/registry/serialize.js";

/**
 * Where the published registry lives.
 *
 * Defaults to the proxied path rather than to null, because "not configured"
 * used to mean "never fetch" -- and nothing said so. A deployment missing this
 * variable served the snapshot compiled into its bundle forever: the admin
 * would publish, see the change in /admin, and find the public site unmoved,
 * with no error anywhere to explain it. The default is the value that works,
 * so the variable is now an override rather than a requirement.
 *
 * import.meta.env is undefined under bare Node (verify-render.mjs), so the
 * optional chain is not decoration.
 */
const REGISTRY_URL =
  import.meta.env?.VITE_REGISTRY_URL ?? "/media/registry/registry.json";

if (!isUsableSnapshot(fallback)) {
  // Fail the build, not the browser. A fresh clone whose snapshot never got
  // generated would otherwise ship an app with no occasions and no error.
  throw new Error(
    "registry.snapshot.js is missing or empty -- run `npm run snapshot:pull`",
  );
}

/**
 * Precompute every lookup the readers need, once per swap. Keeps the exported
 * helpers O(1) and keeps object identities stable between renders, which is
 * what lets DesignsPage's useMemo and EditorPage's `key={design.id}` behave.
 */
function normalise(raw) {
  const occasions = [...raw.occasions].sort((a, b) => a.order - b.order);
  const designsByOccasion = raw.designs ?? {};
  const allDesigns = Object.values(designsByOccasion).flat();

  return {
    revision: raw.revision,
    occasions,
    occasionsBySlug: Object.fromEntries(occasions.map((o) => [o.slug, o])),
    visibleOccasions: occasions.filter((o) => o.enabled),
    designsByOccasion,
    designsById: Object.fromEntries(allDesigns.map((d) => [d.id, d])),
    seasons: raw.seasons,
    currentYear: raw.seasons[0]?.id ?? null,
  };
}

let current = normalise(fallback);
const listeners = new Set();

export const getRegistry = () => current;

/** The value useSyncExternalStore compares. Changes only when the data does. */
export const getRevision = () => current.revision;

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Pull the published snapshot and swap it in if it is both newer and sane.
 *
 * Called once from main.jsx *after* the first render, so it is never on the
 * critical path. Failure is silent by design -- there is nothing to report to
 * a user whose site is already working.
 */
export async function revalidate() {
  if (!REGISTRY_URL) return false;

  try {
    const res = await fetch(REGISTRY_URL, { cache: "no-store" });
    if (!res.ok) return false;

    const next = await res.json();
    // A malformed or older snapshot must never replace a working one.
    if (!isUsableSnapshot(next) || next.revision <= current.revision) return false;

    current = normalise(next);
    listeners.forEach((fn) => fn());
    return true;
  } catch (error) {
    // Offline, blocked, or the project is paused. The bundled snapshot stands,
    // and a visitor has a working site -- so this is silent in production.
    //
    // In development it is worth saying out loud: the usual cause is the
    // /media proxy not resolving, and a silent failure there looks exactly
    // like "publishing does not work".
    if (import.meta.env?.DEV) {
      console.warn(`registry: could not refresh from ${REGISTRY_URL} -- ${error.message}`);
    }
    return false;
  }
}
