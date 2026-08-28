import { useSyncExternalStore } from "react";
import { subscribe, getRevision } from "./registryStore.js";

/**
 * Re-render when the registry is swapped by revalidate().
 *
 * Subscribed at the three places that read registry data outside a hook that
 * already does, rather than once at the root: a root subscription would remount
 * the editor mid-edit, and there is nothing to gain from re-rendering pages
 * that never read this data.
 *
 * The same function serves as the server snapshot -- the value is a number
 * that only changes when the data does, so it is stable under SSR and under
 * StrictMode's double-invoke.
 */
export const useRegistry = () => useSyncExternalStore(subscribe, getRevision, getRevision);
