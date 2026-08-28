// Refresh the bundled fallback from the published snapshot.
//
//   npm run snapshot:pull      (also runs automatically as `prebuild`)
//
// This NEVER fails the build. If the fetch fails -- no URL configured, offline
// CI, a paused free-tier project -- the committed snapshot is left exactly as
// it is and the build proceeds. A stale fallback is the designed-for state;
// a failed deploy because a CDN blipped is not.
//
// The output is a .js module rather than .json on purpose:
// scripts/verify-render.mjs imports the data layer under bare Node, where a
// JSON import needs `with { type: "json" }`, and Vite's handling of that
// attribute is unreliable.
//
// Note the deliberate absence of process.exit(). Calling it while undici's
// connection pool is still tearing down aborts the process on Windows with
// "Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)" and an exit code of
// 127 -- which, from `prebuild`, silently prevents `build` from running at all.
// Every path here returns instead and lets Node exit on its own.

import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "src/data/registry.snapshot.js");

// VITE_REGISTRY_URL is relative ("/media/...") because the browser reaches the
// snapshot through the host's proxy. Node has no origin to resolve that
// against, so anything not absolute is rebuilt from SUPABASE_URL.
const configured = process.env.VITE_REGISTRY_URL;
const fromProject = process.env.SUPABASE_URL
  ? `${process.env.SUPABASE_URL}/storage/v1/object/public/media/registry/registry.json`
  : null;

const url = configured?.startsWith("http") ? configured : fromProject;

const keep = (why) => {
  console.log(`snapshot:pull  ${why} -- keeping the committed snapshot`);
};

const template = (snapshot) => `// GENERATED -- do not edit by hand.
//
// The stale fallback for src/data/registryStore.js: a valid registry that
// exists synchronously at module-eval time, so getOccasion()/getDesign() never
// have to become async and no page ever needs a loading state.
//
// A .js module rather than .json on purpose -- scripts/verify-render.mjs
// imports the data layer under bare Node, where a JSON import needs
// \`with { type: "json" }\`, and Vite's handling of that attribute is unreliable.
//
// Regenerate with: npm run snapshot:pull

export default ${JSON.stringify(snapshot, null, 2)};
`;

async function main() {
  if (!url) return keep("no VITE_REGISTRY_URL or SUPABASE_URL");

  const { isUsableSnapshot } = await import(
    pathToFileURL(path.join(ROOT, "src/lib/registry/serialize.js")).href
  );

  // Bypass the CDN, not just the local cache.
  //
  // registry.json is uploaded with `Cache-Control: max-age=30` so ordinary
  // visitors are served by the CDN rather than the origin. `cache: "no-store"`
  // only governs *this* process's HTTP cache, so a pull run seconds after a
  // publish would happily bake a superseded snapshot into the build. A unique
  // query string makes it a cache miss and forces the origin copy.
  //
  // Only the build-time pull does this. The running site deliberately keeps
  // the CDN in front of it -- being up to 30 seconds behind is the trade that
  // stops every visitor hitting the origin.
  const fresh = `${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`;

  let next;
  try {
    const res = await fetch(fresh, { cache: "no-store" });
    if (!res.ok) {
      // Drain the body so the socket returns to the pool cleanly.
      await res.text().catch(() => {});
      return keep(`HTTP ${res.status}`);
    }
    next = await res.json();
  } catch (err) {
    return keep(err.message);
  }

  if (!isUsableSnapshot(next)) {
    return keep("fetched snapshot failed the structural guard");
  }

  // Don't rewrite when nothing changed -- a no-op diff in CI is noise, and an
  // unchanged mtime keeps Vite's cache warm.
  const current = await readFile(OUT, "utf8").catch(() => "");
  const currentRevision = Number(current.match(/"revision":\s*(\d+)/)?.[1] ?? -1);
  if (currentRevision === next.revision) {
    return console.log(`snapshot:pull  already at revision ${next.revision}`);
  }

  await writeFile(OUT, template(next), "utf8");

  const designs = Object.values(next.designs).flat().length;
  console.log(
    `snapshot:pull  revision ${currentRevision} -> ${next.revision} ` +
      `(${next.occasions.length} occasions, ${designs} designs)`,
  );
}

await main();
