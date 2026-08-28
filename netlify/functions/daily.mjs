// Daily maintenance: keep the project awake, and keep the fallback fresh.
//
// Free-plan projects pause after 7 days without activity. The public site is
// unaffected -- it renders from the snapshot bundled at build time -- but
// /admin stops working entirely until someone restores the project from the
// Supabase dashboard. For a site whose admin signs in twice a year, that will
// happen, and it will happen at the least convenient moment: the week they
// finally need to add next season's cards.
//
// Why here rather than anywhere else:
//
//   - GitHub Actions disables scheduled workflows after 60 days without a
//     commit, which is exactly what a finished client project looks like. It
//     would stop silently, months later, and nothing would say so.
//   - An external cron service is another account to hold, outlive and
//     remember. This one deploys with the site and belongs to whoever owns it.
//
// The request is a READ, deliberately. Upserting a row into a keepalive table
// would mean granting `anon` write access somewhere -- opening a hole in the
// security model to hold a door open. This asks for one season id, exactly the
// shape of request the public site already makes, against a table `anon` may
// already read. No new table, no new policy, no new surface.

import bundled from "../../src/data/registry.snapshot.js";

const url = process.env.SUPABASE_URL;

/**
 * The Netlify build hook, deliberately NOT VITE_-prefixed.
 *
 * An earlier version of this read the hook from the browser bundle, which was
 * a mistake worth spelling out: /assets/AdminRoutes-*.js is a static file with
 * no authentication in front of it -- the login gate lives inside that
 * JavaScript -- so the URL was not a secret that might leak, it was published.
 * Anyone could have read it out and POSTed to it in a loop, and the free tier
 * allows 300 build minutes a month. Held here it never reaches a browser.
 */
const buildHook = process.env.NETLIFY_BUILD_HOOK;

// Public by design: this key ships inside the JavaScript bundle already. It is
// row level security, not secrecy, that protects the data.
const key = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default async () => {
  if (!url || !key) {
    // Loud, because a keepalive that cannot reach the project is the one
    // failure this whole function exists to prevent, and a silent skip would
    // look identical to success for the six days before anything broke.
    console.error("daily: SUPABASE_URL or the anon key is not set for this site");
    return new Response("not configured", { status: 500 });
  }

  try {
    const res = await fetch(`${url}/rest/v1/seasons?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });

    // A paused project answers, but not with data. Distinguishing the two
    // matters: 200 means the timer reset, anything else means it did not.
    const body = await res.text();
    if (!res.ok) {
      console.error(`daily: keepalive failed, HTTP ${res.status} ${body.slice(0, 120)}`);
      return new Response("unreachable", { status: 502 });
    }
    console.log("daily: keepalive ok -- pause timer reset");

    await refreshFallbackIfStale();
    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error(`daily: ${error.message}`);
    return new Response("unreachable", { status: 502 });
  }
};

/**
 * Rebuild when the published registry has moved past the one in this deploy.
 *
 * Publishing makes a change live immediately -- the site fetches the snapshot
 * and swaps it in. This is about the other copy: the one compiled into the
 * bundle, which is what a visitor gets when that fetch fails, when they are
 * offline, or when the project is paused. Left alone it drifts further behind
 * with every publish until the fallback is worse than useless.
 *
 * Comparing revisions rather than rebuilding on a timer means an idle month
 * costs no builds at all, and a busy day costs one.
 */
async function refreshFallbackIfStale() {
  if (!buildHook) return;

  const res = await fetch(
    `${url}/storage/v1/object/public/media/registry/registry.json?_=${Date.now()}`,
    { headers: { apikey: key } },
  );
  if (!res.ok) {
    console.log(`daily: could not read the published registry (HTTP ${res.status})`);
    return;
  }

  const published = await res.json();
  if (!(published.revision > bundled.revision)) {
    console.log(`daily: fallback is current at revision ${bundled.revision}`);
    return;
  }

  const hook = await fetch(buildHook, { method: "POST", body: "{}" });
  console.log(
    `daily: fallback is at ${bundled.revision}, published is ${published.revision} ` +
      `-- rebuild requested, HTTP ${hook.status}`,
  );
}

// Daily, not every three days. The pause window is seven, so a daily run
// tolerates six consecutive failures before anything is at risk, and the
// invocations are free at this rate either way.
export const config = {
  schedule: "@daily",
};
