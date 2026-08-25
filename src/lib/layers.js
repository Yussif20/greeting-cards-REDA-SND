import { measureTextLayer } from "./renderCard.js";

/**
 * Layer geometry and hit-testing.
 *
 * Everything here works in NORMALISED units (0..1 of the design's native size).
 * Pointer coordinates are normalised the moment they arrive and are never
 * stored as pixels, so the maths is independent of the preview's display size,
 * the device pixel ratio, and browser zoom.
 */

export const NAME_LAYER = "name";
export const JOB_LAYER = "jobTitle";
export const LOGO_LAYER = "logo";

export const MIN_SIZE = 0.015;
export const MAX_SIZE = 0.25;

/** Grab padding, so thin text is still easy to hit. */
const PAD = 0.012;

/**
 * Bounding box of a layer in normalised units.
 * Returns null when the layer has nothing to draw.
 */
export function layerBox(ctx, layer, W, H) {
  if (!layer || layer.visible === false) return null;

  if (layer.type === "text") {
    if (!String(layer.text ?? "").trim()) return null;
    const { width, height } = measureTextLayer(ctx, layer, W, H);
    const w = width / W;

    // fillText places the run relative to the anchor according to textAlign, so
    // the anchor is the box centre only when the text is centred. Without this
    // the selection box and hit area drift half a text-width after aligning.
    const cx =
      layer.align === "left"
        ? layer.x + w / 2
        : layer.align === "right"
          ? layer.x - w / 2
          : layer.x;

    return { cx, cy: layer.y, w, h: height / H, rotation: layer.rotation ?? 0 };
  }

  if (layer.type === "image") {
    const w = layer.width;
    const h = (layer.width * W) / (layer.aspect || 1) / H;
    return { cx: layer.x, cy: layer.y, w, h, rotation: layer.rotation ?? 0 };
  }

  return null;
}

/** Is a normalised point inside a (possibly rotated) box? */
export function boxContains(box, point, aspect = 1) {
  if (!box) return false;

  let dx = point.x - box.cx;
  let dy = point.y - box.cy;

  if (box.rotation) {
    // Rotate the point back into the box's own frame. Because x and y are
    // normalised against different pixel extents, convert through aspect so
    // the rotation is not skewed.
    const rad = (-box.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const px = dx * aspect;
    dx = (px * cos - dy * sin) / aspect;
    dy = px * sin + dy * cos;
  }

  return (
    Math.abs(dx) <= box.w / 2 + PAD && Math.abs(dy) <= box.h / 2 + PAD
  );
}

/** Topmost layer under a normalised point, or null. */
export function hitTest(layers, point, ctx, W, H) {
  const aspect = W / H;
  const ordered = [...layers]
    .filter((l) => l.visible !== false && !l.locked)
    .sort((a, b) => (b.z ?? 0) - (a.z ?? 0));

  for (const layer of ordered) {
    const box = layerBox(ctx, layer, W, H);
    if (boxContains(box, point, aspect)) return layer;
  }
  return null;
}

/** The four corners of a box, in normalised units, as [tl, tr, br, bl]. */
export function boxCorners(box, aspect = 1) {
  if (!box) return [];
  const hw = box.w / 2;
  const hh = box.h / 2;
  const raw = [
    { x: -hw, y: -hh, id: "tl" },
    { x: hw, y: -hh, id: "tr" },
    { x: hw, y: hh, id: "br" },
    { x: -hw, y: hh, id: "bl" },
  ];

  if (!box.rotation) {
    return raw.map((c) => ({ ...c, x: box.cx + c.x, y: box.cy + c.y }));
  }

  const rad = (box.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return raw.map((c) => {
    const px = c.x * aspect;
    return {
      id: c.id,
      x: box.cx + (px * cos - c.y * sin) / aspect,
      y: box.cy + (px * sin + c.y * cos),
    };
  });
}

export const clampSize = (size) => Math.min(MAX_SIZE, Math.max(MIN_SIZE, size));

/** Keep a layer's anchor inside the canvas, with a little slack. */
export const clampPosition = (value) => Math.min(1.2, Math.max(-0.2, value));

/**
 * Align a layer within the design's safe area.
 * Text alignment also flips ctx.textAlign so the anchor means what it says.
 */
export function alignLayer(layer, safeArea, edge) {
  const a = safeArea;
  switch (edge) {
    case "left":
      return { x: a.x, align: "left" };
    case "center":
      return { x: a.x + a.w / 2, align: "center" };
    case "right":
      return { x: a.x + a.w, align: "right" };
    case "top":
      return { y: a.y };
    case "middle":
      return { y: a.y + a.h / 2 };
    case "bottom":
      return { y: a.y + a.h };
    default:
      return {};
  }
}

/** Even vertical distribution of the visible layers across the safe area. */
export function distributeVertically(layers, safeArea) {
  const visible = layers
    .filter((l) => l.visible !== false)
    .sort((a, b) => a.y - b.y);
  if (visible.length < 2) return {};

  const step = safeArea.h / (visible.length - 1);
  return Object.fromEntries(
    visible.map((l, i) => [l.id, { y: safeArea.y + i * step }]),
  );
}
