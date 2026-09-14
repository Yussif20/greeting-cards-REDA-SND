import { useParams } from "react-router-dom";
import { getOccasion } from "../data/occasions.js";
import { getDesigns } from "../data/designs/index.js";
import { BRANDS, getBrand } from "../data/brands.js";
import { designsForBrand, OTHER_BRAND } from "../lib/brandGroups.js";
import { useRegistry } from "../data/useRegistry.js";

/**
 * Resolve :occasion/brands/:brandId against the registry and the brand roster.
 *
 * `brand` is null for an id the roster does not contain, so the page can render
 * a 404 rather than redirecting from inside an effect -- the pattern the public
 * pages avoid everywhere, because it renders the wrong page for a frame first.
 *
 * `other` is the one id with no brand behind it: it stands for every card the
 * roster does not claim, so it resolves to a valid page with a null brand. The
 * `valid` flag is what callers check, rather than `brand`, precisely so that
 * distinction does not have to be repeated at every call site.
 *
 * `designs` is every season's cards for this brand, not just the season being
 * shown. The page derives its own season dropdown from them, so narrowing here
 * would leave that control with one entry whatever the archive holds.
 */
export function useBrandParam() {
  useRegistry();
  const { occasion: slug, brandId } = useParams();

  const occasion = getOccasion(slug);
  const brand = getBrand(brandId);
  const valid = Boolean(occasion) && (Boolean(brand) || brandId === OTHER_BRAND);

  return {
    slug,
    occasion,
    brandId,
    brand,
    valid,
    designs: valid ? designsForBrand(getDesigns(slug), BRANDS, brandId) : [],
  };
}
