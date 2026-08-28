// Keep the Supabase project awake.
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

const url = process.env.SUPABASE_URL;

// Public by design: this key ships inside the JavaScript bundle already. It is
// row level security, not secrecy, that protects the data.
const key = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export default async () => {
  if (!url || !key) {
    // Loud, because a keepalive that cannot reach the project is the one
    // failure this whole function exists to prevent, and a silent skip would
    // look identical to success for the six days before anything broke.
    console.error("keepalive: SUPABASE_URL or the anon key is not set for this site");
    return new Response("not configured", { status: 500 });
  }

  try {
    const res = await fetch(`${url}/rest/v1/seasons?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });

    // A paused project answers, but not with data. Distinguishing the two
    // matters: 200 means the timer reset, anything else means it did not.
    const body = await res.text();
    const ok = res.ok;

    console.log(`keepalive: HTTP ${res.status} ${ok ? "-- timer reset" : body.slice(0, 120)}`);
    return new Response(ok ? "awake" : "unreachable", { status: ok ? 200 : 502 });
  } catch (error) {
    console.error(`keepalive: ${error.message}`);
    return new Response("unreachable", { status: 502 });
  }
};

// Daily, not every three days. The window is seven, so a daily ping tolerates
// six consecutive failures before anything is at risk -- and the invocations
// are free at this rate either way.
export const config = {
  schedule: "@daily",
};
