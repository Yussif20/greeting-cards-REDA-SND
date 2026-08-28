// Daily maintenance: keep the project awake, and keep the fallback fresh.
//
// Runs as a Vercel Cron Job -- see the `crons` entry in vercel.json. It has to
// live with the deployment rather than in GitHub Actions, whose scheduled
// workflows are disabled after 60 days without a commit: exactly what a
// finished client project looks like, and it would then stop silently.

import bundled from "../src/data/registry.snapshot.js";

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;

// Public by design: this key ships inside the JavaScript bundle already. It is
// row level security, not secrecy, that protects the data.
const key = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * The Vercel deploy hook, deliberately NOT VITE_-prefixed.
 *
 * An earlier version read this from the browser bundle, which was a mistake
 * worth spelling out: the admin chunk is a static file with no authentication
 * in front of it -- the login gate lives inside that JavaScript -- so the URL
 * was not a secret at risk of leaking, it was published. Held here it never
 * reaches a browser.
 */
const deployHook = process.env.VERCEL_DEPLOY_HOOK;

/**
 * Cron endpoints on Vercel are ordinary public URLs. Without this check,
 * anyone could call /api/daily in a loop and trigger a deploy each time,
 * which is the same denial of service as publishing the hook itself -- just
 * one indirection further away.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` on cron invocations when
 * that variable is set. If it is not set the endpoint stays open, so this
 * refuses rather than assuming: an unprotected endpoint that quietly works is
 * how it ends up staying unprotected.
 */
function isAuthorised(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.authorization === `Bearer ${secret}`;
}

export default async function handler(req, res) {
  if (!isAuthorised(req)) {
    // Deliberately uninformative to the caller, explicit in the log.
    console.error("daily: refused -- CRON_SECRET missing or did not match");
    return res.status(401).send("unauthorized");
  }

  if (!url || !key) {
    // Loud, because a keepalive that cannot reach the project is the one
    // failure this exists to prevent, and a silent skip would look identical
    // to success for the six days before anything broke.
    console.error("daily: SUPABASE_URL or the anon key is not set for this deployment");
    return res.status(500).send("not configured");
  }

  try {
    // The ping is a READ. Writing a row would mean granting `anon` write
    // access somewhere -- opening a hole in the security model to hold a door
    // open. This is the shape of request the public site already makes.
    const ping = await fetch(`${url}/rest/v1/seasons?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });

    if (!ping.ok) {
      const body = await ping.text();
      console.error(`daily: keepalive failed, HTTP ${ping.status} ${body.slice(0, 120)}`);
      return res.status(502).send("unreachable");
    }
    console.log("daily: keepalive ok -- pause timer reset");

    const rebuilt = await refreshFallbackIfStale();
    return res.status(200).json({ awake: true, rebuildRequested: rebuilt });
  } catch (error) {
    console.error(`daily: ${error.message}`);
    return res.status(502).send("unreachable");
  }
}

/**
 * Redeploy when the published registry has moved past the one in this build.
 *
 * Publishing makes a change live immediately -- the site fetches the snapshot
 * and swaps it in. This is about the other copy: the one compiled into the
 * bundle, which is what a visitor gets when that fetch fails, when they are
 * offline, or when the project is paused. Left alone it drifts further behind
 * with every publish until the fallback is worse than useless.
 *
 * Comparing revisions rather than deploying on a timer means an idle month
 * costs no builds at all, and a busy day costs one.
 */
async function refreshFallbackIfStale() {
  if (!deployHook) return false;

  const res = await fetch(
    `${url}/storage/v1/object/public/media/registry/registry.json?_=${Date.now()}`,
    { headers: { apikey: key } },
  );
  if (!res.ok) {
    console.log(`daily: could not read the published registry (HTTP ${res.status})`);
    return false;
  }

  const published = await res.json();
  if (!(published.revision > bundled.revision)) {
    console.log(`daily: fallback is current at revision ${bundled.revision}`);
    return false;
  }

  const hook = await fetch(deployHook, { method: "POST", body: "{}" });
  console.log(
    `daily: fallback is at ${bundled.revision}, published is ${published.revision} ` +
      `-- redeploy requested, HTTP ${hook.status}`,
  );
  return hook.ok;
}
