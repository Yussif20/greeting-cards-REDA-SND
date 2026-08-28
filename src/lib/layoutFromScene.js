import { NAME_LAYER, JOB_LAYER, LOGO_LAYER } from "./layers.js";

/**
 * Turn an editor scene back into a design's stored `layout`.
 *
 * The exact inverse of buildLayers() in src/hooks/useEditorState.js. The two
 * belong together: if one grows a field the other must, and
 * scripts/verify-render.mjs asserts the round trip for every design so drift
 * fails the build rather than silently dropping whatever was added.
 *
 * Three parts of a layout are NOT in the scene, because no layer represents
 * them -- `safeArea` (which AlignPanel aligns against), `brandMark` (the region
 * BrandSelect crops a logo preview from) and `palette` (which ColorSwatches
 * reads but never writes). They come from `base`, which is why this takes the
 * design's current layout rather than building one from nothing.
 */

/**
 * Four decimal places is 0.2px on a 2000px card -- below anything a person can
 * perceive, and it keeps the stored jsonb and the snapshot diff readable
 * instead of full of 0.7834729108...
 */
const round = (n) => Math.round(n * 10000) / 10000;

const textLayer = (layer) => ({
  x: round(layer.x),
  y: round(layer.y),
  size: round(layer.size),
  align: layer.align,
  maxWidth: round(layer.maxWidth),
  // Written only when set, so version-1 rows keep the shape they had. The
  // reader supplies `?? 0`, so an absent key and a zero mean the same thing.
  ...(layer.rotation ? { rotation: round(layer.rotation) } : {}),
});

export function layoutFromScene(state, base) {
  const find = (id) => state.layers.find((l) => l.id === id);
  const name = find(NAME_LAYER);
  const jobTitle = find(JOB_LAYER);
  const logo = find(LOGO_LAYER);

  if (!name || !jobTitle || !logo) {
    throw new Error("layoutFromScene: the scene is missing a layer");
  }

  return {
    ...base,
    name: textLayer(name),
    jobTitle: {
      ...textLayer(jobTitle),
      // Only recorded when it differs from the card's default, matching how
      // buildLayers reads it back with `l.jobTitle.color ?? l.defaultColor`.
      ...(jobTitle.color && jobTitle.color !== state.color
        ? { color: jobTitle.color }
        : {}),
    },
    logo: {
      x: round(logo.x),
      y: round(logo.y),
      width: round(logo.width),
    },
    defaultColor: state.color,
    fontId: state.fontId,
  };
}
