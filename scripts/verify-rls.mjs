// Prove row level security from the outside, using the key that ships in the
// bundle.
//
//   npm run verify:rls
//
// This is the check that matters most in the whole project. The anon key is
// public: anyone can read it out of the JavaScript and make these exact calls.
// So the only meaningful question is not "does the admin UI hide the buttons"
// but "does the database refuse". Everything below is what an attacker would
// try first.
//
// It is deliberately written against the raw REST API rather than through
// @supabase/supabase-js, so a client-side mistake cannot mask a server-side
// hole.

import assert from "node:assert/strict";

const URL_BASE = process.env.SUPABASE_URL;
const ANON = process.env.VITE_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL_BASE || !ANON || !SERVICE) {
  console.error("Missing SUPABASE_URL / anon key / service key -- see .env.example");
  process.exit(1);
}

const results = [];
const record = (pass, name, detail = "") => results.push({ pass, name, detail });

const call = (key, path, init = {}) =>
  fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

/** A write that succeeds is a finding, so "denied" is the passing outcome. */
async function expectDenied(name, path, init) {
  const res = await call(ANON, path, init);
  const body = await res.text();
  const denied = res.status === 401 || res.status === 403 || res.status === 404;

  // PostgREST reports an RLS refusal on a write as 0 rows affected rather than
  // an error when the row simply is not visible, so an empty 2xx is also a
  // denial -- but a 2xx that echoes back a row is a real breach.
  const changedNothing = res.ok && (body === "[]" || body === "");

  record(denied || changedNothing, name, denied ? `HTTP ${res.status}` : `HTTP ${res.status} ${body.slice(0, 80)}`);
}

/* ------------------------------------------------------------------ reads */

{
  const res = await call(ANON, "occasions?select=slug");
  const rows = await res.json();
  record(res.ok && rows.length === 6, "anon can read published occasions", `${rows.length} rows`);
}

{
  const res = await call(ANON, "designs?select=id");
  const rows = await res.json();
  record(res.ok && rows.length === 37, "anon can read published designs", `${rows.length} rows`);
}

{
  // admins has a policy for `authenticated` only, so anon gets nothing at all.
  const res = await call(ANON, "admins?select=user_id");
  const body = await res.text();
  const blocked = !res.ok || body === "[]";
  record(blocked, "anon cannot read the admins table", `HTTP ${res.status}`);
}

/* ----------------------------------------------------------------- writes */

await expectDenied("anon cannot INSERT an occasion", "occasions", {
  method: "POST",
  body: JSON.stringify({
    slug: "rls-probe",
    title_en: "probe",
    title_ar: "probe",
    short_title_en: "probe",
    short_title_ar: "probe",
    hero: { base: "/x", width: 1, height: 1, focal: "50% 50%", alt: { en: "", ar: "" } },
    theme: { light: {}, dark: {} },
  }),
});

await expectDenied("anon cannot UPDATE an occasion", "occasions?slug=eq.eid-al-fitr", {
  method: "PATCH",
  body: JSON.stringify({ title_en: "OWNED" }),
});

await expectDenied("anon cannot DELETE a design", "designs?id=eq.eid-al-fitr-2025-2026-01", {
  method: "DELETE",
});

await expectDenied("anon cannot grant itself admin", "admins", {
  method: "POST",
  body: JSON.stringify({
    user_id: "00000000-0000-0000-0000-000000000000",
    email: "attacker@example.com",
  }),
});

/* ------------------------------- a refused write must leave the data intact */
//
// The denial above is only half the story. PostgREST answers a DELETE that
// matched no rows exactly as it answers one that deleted something, because
// once row level security hides a row, "you may not delete this" and "there is
// no such row" are the same reply. A client that does not ask for the affected
// rows back cannot tell the difference -- which is how a card was once
// reported deleted and stayed in the list.
//
// So: attempt the delete, then look.

{
  const before = await (await call(ANON, "designs?select=id&limit=1")).json();
  const victim = before[0]?.id;

  await call(ANON, `designs?id=eq.${victim}`, { method: "DELETE" });

  const after = await (await call(ANON, `designs?select=id&id=eq.${victim}`)).json();
  record(
    Array.isArray(after) && after.length === 1,
    "a refused delete leaves the row in place",
    victim,
  );
}

/* ----------------------------------------- drafts must be invisible to anon */

const PROBE = "rls-probe-season";
try {
  await call(SERVICE, "seasons", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      id: "1900-1901",
      label_en: "RLS probe",
      label_ar: "RLS probe",
      sort_order: -1,
      status: "draft",
    }),
  });

  const res = await call(ANON, "seasons?select=id&id=eq.1900-1901");
  const rows = await res.json();
  record(
    Array.isArray(rows) && rows.length === 0,
    "anon cannot see a draft row",
    `${rows.length ?? "?"} rows`,
  );
} finally {
  // The draft was never published, so the delete policy allows it -- and the
  // service role would bypass that anyway.
  await call(SERVICE, "seasons?id=eq.1900-1901", { method: "DELETE" });
}

/* ---------------------------------------------------------------- verdict */

for (const { pass, name, detail } of results) {
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
}

const failures = results.filter((r) => !r.pass);
console.log(`\n${results.length - failures.length}/${results.length} checks passed`);

assert.equal(failures.length, 0, `${failures.length} row level security check(s) FAILED`);
