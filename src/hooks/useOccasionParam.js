import { useParams } from "react-router-dom";
import { getOccasion } from "../data/occasions.js";
import { useRegistry } from "../data/useRegistry.js";

/**
 * Resolve the :occasion URL segment against the registry.
 * Returns null for an unknown slug so the page can render a 404 rather than
 * redirecting from inside an effect -- the pattern that caused the old
 * "refresh bounces you out" bug.
 */
export function useOccasionParam() {
  useRegistry();
  const { occasion: slug } = useParams();
  return { slug, occasion: getOccasion(slug) };
}
