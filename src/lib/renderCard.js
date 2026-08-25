import { ensureFont, fontShorthand } from "./fonts.js";
import { loadImage } from "./canvas.js";

/**
 * The single card renderer, shared by the live preview, the download and the
 * share. The previous editor carried three byte-identical copies of this logic,
 * which is how preview and export drifted apart.
 *
 * CONTRACT: this draws only pixels that belong in the exported file. Selection
 * chrome (dashed box, handles, guides) is a DOM overlay, never painted here --
 * so preview and export share one code path with no flags, and chrome can never
 * leak into a download.
 *
 * All layer geometry is expressed as a fraction of the design's native size, so
 * the same scene renders identically at any output resolution.
 */

/** Wrap `text` to at most `maxWidth` px, breaking on spaces. */
export function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const lines = [];
  let line = words[0];

  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${line} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      lines.push(line);
      line = words[i];
    }
  }
  lines.push(line);
  return lines;
}

const ARABIC = /\p{Script=Arabic}/u;

/** Text direction for a string: Arabic if it contains any Arabic-range glyph. */
export function detectDir(text) {
  return ARABIC.test(String(text)) ? "rtl" : "ltr";
}

function applyTextStyle(ctx, layer, W, H) {
  const px = layer.size * H;
  ctx.font = fontShorthand(layer.fontId, layer.weight ?? 400, px);
  ctx.fillStyle = layer.color;
  ctx.textAlign = layer.align === "left" ? "left" : layer.align === "right" ? "right" : "center";
  ctx.textBaseline = "middle";
  // Never set by the old editor, which is why mixed Arabic/Latin names rendered
  // in the wrong visual order.
  ctx.direction = layer.dir === "auto" ? detectDir(layer.text) : layer.dir;
  return px;
}

/** Measured box of a text layer, in native pixels, ignoring rotation. */
export function measureTextLayer(ctx, layer, W, H) {
  ctx.save();
  const px = applyTextStyle(ctx, layer, W, H);
  const lines = wrapText(ctx, layer.text, layer.maxWidth * W);
  const lineHeight = px * (layer.lineHeight ?? 1.15);
  const width = lines.reduce((max, l) => Math.max(max, ctx.measureText(l).width), 0);
  const height = Math.max(lines.length, 1) * lineHeight;
  ctx.restore();
  return { width, height, lines, lineHeight, px };
}

function drawTextLayer(ctx, layer, W, H) {
  const { lines, lineHeight } = measureTextLayer(ctx, layer, W, H);
  if (lines.length === 0) return;

  applyTextStyle(ctx, layer, W, H);

  // Anchor is the centre of the block; lay lines out around it.
  const startY = -((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, 0, startY + i * lineHeight);
  });
}

async function drawImageLayer(ctx, layer, W) {
  if (!layer.src) return;
  let img;
  try {
    img = await loadImage(layer.src);
  } catch {
    return; // A missing brand logo must not abort the whole card.
  }
  const width = layer.width * W;
  const height = width / (layer.aspect || img.width / img.height || 1);
  ctx.drawImage(img, -width / 2, -height / 2, width, height);
}

/**
 * Draw a full card.
 *
 * @param {CanvasRenderingContext2D} ctx target context
 * @param {{design: object, image: HTMLImageElement, layers: Array}} scene
 * @param {{scale?: number, isStale?: () => boolean}} opts
 *   scale = output width / design.width.
 *   isStale lets a caller abandon a frame whose inputs have already changed --
 *   fonts and images resolve asynchronously, so without it a slow frame can
 *   land on the canvas after a newer one and paint stale text.
 */
export async function renderCard(ctx, scene, opts = {}) {
  const { design, image, layers = [] } = scene;
  if (!design) return;

  const scale = opts.scale ?? 1;
  const isStale = opts.isStale ?? (() => false);
  const W = design.width;
  const H = design.height;

  const ordered = [...layers]
    .filter((l) => l.visible !== false)
    .sort((a, b) => (a.z ?? 0) - (b.z ?? 0));

  // Load every face before the first fillText, or the browser substitutes.
  await Promise.all(
    ordered
      .filter((l) => l.type === "text" && String(l.text ?? "").trim())
      .map((l) => ensureFont(l.fontId, l.weight ?? 400)),
  );

  // Everything above is async; from here the draw is synchronous apart from
  // image layers, so this is the point to bail out.
  if (isStale()) return;

  ctx.save();
  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, W, H);

  if (image) ctx.drawImage(image, 0, 0, W, H);

  for (const layer of ordered) {
    if (layer.type === "text" && !String(layer.text ?? "").trim()) continue;

    ctx.save();
    ctx.translate(layer.x * W, layer.y * H);
    if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);

    if (layer.type === "text") {
      drawTextLayer(ctx, layer, W, H);
    } else if (layer.type === "image") {
      await drawImageLayer(ctx, layer, W);
    }

    ctx.restore();

    if (isStale()) break;
  }

  ctx.restore();
}
