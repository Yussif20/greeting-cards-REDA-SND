// The Supabase client, for /admin only.
//
// IMPORTANT: nothing outside src/admin may import this module. The public site
// reads its data from a plain JSON file over fetch() and has no Supabase
// dependency at all -- that is what keeps @supabase/supabase-js inside the
// lazily-loaded admin chunk instead of in every visitor's first paint. The
// lazy boundary in App.jsx is an architectural rule, not an optimisation.
//
// The anon key is public by design; it ships in this chunk and is meant to.
// Row level security is the boundary, not secrecy. What must never appear here
// is the service-role key, which bypasses RLS entirely -- vite.config.js fails
// the build if it is ever placed in the browser-facing variable.

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;

// Supabase has renamed these keys over time and its own "Connect" panel now
// emits VITE_SUPABASE_PUBLISHABLE_KEY. Accepting both spellings costs one line
// and avoids a confusing "why is my key ignored" for whoever configures this
// next; they are the same credential under two names.
const key =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isConfigured = Boolean(url && key);

/**
 * Null when the environment is not configured, so the admin can render a
 * useful "not set up" screen rather than crashing at import time and taking
 * the whole lazy chunk with it.
 */
export const supabase = isConfigured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;
