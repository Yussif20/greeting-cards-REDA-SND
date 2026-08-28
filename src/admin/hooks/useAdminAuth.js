import { useCallback, useEffect, useState } from "react";
import { supabase, isConfigured } from "../lib/supabase.js";

/**
 * Session state for /admin.
 *
 * Two questions, deliberately kept separate: is there a session, and is that
 * session an admin. Signing in proves who you are; it does not prove you may
 * write anything. The second answer comes from the `is_admin()` RPC -- the
 * *same* function every write policy calls -- so the interface and the
 * database can never disagree about who is an admin. Reimplementing the check
 * as a query against `admins` here would be a second source of truth, and the
 * two would drift the first time the rule changed.
 *
 * `status` is a single value rather than a set of booleans, because
 * "checking", "signed out" and "signed in but not an admin" need visibly
 * different screens and a pile of flags makes it easy to render two at once.
 */
export function useAdminAuth() {
  const [status, setStatus] = useState(isConfigured ? "checking" : "unconfigured");
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState(null);

  const resolve = useCallback(async (nextSession) => {
    setSession(nextSession);
    setEmail(nextSession?.user?.email ?? null);

    if (!nextSession) {
      setStatus("signedOut");
      return;
    }

    const { data, error } = await supabase.rpc("is_admin");
    if (error) {
      setStatus("error");
      return;
    }
    setStatus(data === true ? "admin" : "notAdmin");
  }, []);

  useEffect(() => {
    if (!isConfigured) return;

    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) resolve(data.session ?? null);
    });

    // Covers token refresh and sign-out in another tab, not just our own
    // sign-in call -- a session that expires while the tab sits open should
    // return the admin to the login screen rather than to failing writes.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!cancelled) resolve(next ?? null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [resolve]);

  const signIn = useCallback(async (address, password) => {
    setStatus("checking");
    const { error } = await supabase.auth.signInWithPassword({
      email: address,
      password,
    });
    if (error) {
      setStatus("signedOut");
      return { error: error.message };
    }
    // onAuthStateChange resolves the admin check; nothing to do here.
    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { status, session, email, signIn, signOut };
}
