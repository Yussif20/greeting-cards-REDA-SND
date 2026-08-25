import { useParams } from "react-router-dom";
import { getOccasion } from "../data/occasions.js";
import { getDesign, getDesigns } from "../data/designs/index.js";

/** Resolve :occasion/:designId against the registry. Never uses location.state. */
export function useDesignParam() {
  const { occasion: slug, designId } = useParams();
  const occasion = getOccasion(slug);
  const design = occasion ? getDesign(slug, designId) : null;
  return { slug, designId, occasion, design, designs: occasion ? getDesigns(slug) : [] };
}
