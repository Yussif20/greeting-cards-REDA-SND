import { useCallback, useEffect, useState } from "react";

/**
 * Run an async read and track its outcome.
 *
 * `state` is one value, not a loading flag beside a data field beside an error
 * field, because those three can contradict each other and a screen rendered
 * from contradictory flags shows a spinner over stale rows. Here the page can
 * only be in one of four states, and each has exactly one rendering.
 *
 * The `cancelled` guard is what stops a slow first request from overwriting a
 * faster second one after the admin has already changed occasion.
 */
export function useAsync(run, deps = []) {
  const [state, setState] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    setState("loading");

    run()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setState(Array.isArray(result) && result.length === 0 ? "empty" : "ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setState("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { state, data, error, reload };
}
