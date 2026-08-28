// Browser-side image processing for admin uploads.
//
// Mirrors scripts/optimize-assets.mjs, which does the same work with sharp for
// the artwork already in public/. The numbers below are deliberately the same
// ones, so a card uploaded through /admin is indistinguishable from a card
// that went through the offline pipeline.

/** Long edge of the master a card is drawn from. Matches CARD_MASTER. */
export const CARD_MASTER = 2000;
/** Long edge of the grid thumbnail. Matches CARD_THUMB. */
export const CARD_THUMB = 600;

export const MASTER_TYPE = "image/jpeg";
export const MASTER_QUALITY = 0.82;
export const THUMB_TYPE = "image/webp";
export const THUMB_QUALITY = 0.76;

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 40 * 1024 * 1024;
const MAX_PIXELS = 50e6;

export class ImageError extends Error {
  constructor(code, detail) {
    super(code);
    this.code = code;
    this.detail = detail;
  }
}

/* -------------------------------------------------------------------------- */
/* dimensions                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Intrinsic size, with EXIF orientation already applied.
 *
 * This matters far more than it looks. Every value in a design's `layout` is a
 * fraction of the stored width and height, so a portrait photo whose EXIF says
 * "rotate 90" but whose stored dimensions say landscape produces a row with
 * width and height transposed -- and then the safe area, the name anchor and
 * the brand-mark crop are all wrong, in the preview and in the export, with no
 * fix short of re-uploading.
 *
 * Modern browsers default to `image-orientation: from-image`, so naturalWidth
 * and naturalHeight here are already the oriented values, and they agree with
 * what createImageBitmap({ imageOrientation: "from-image" }) will produce.
 *
 * Reading the size before decoding at full resolution is also what lets the
 * decode below be bounded: a 24-megapixel phone photo never has to exist in
 * memory at full size.
 */
function probeDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      size.width && size.height
        ? resolve(size)
        : reject(new ImageError("decodeFailed"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageError("decodeFailed"));
    };
    img.src = url;
  });
}

const fit = (width, height, longEdge) => {
  const scale = Math.min(1, longEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

/* -------------------------------------------------------------------------- */
/* decode and draw                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Decode `file` straight to `target`, never larger than its intrinsic size.
 *
 * createImageBitmap does the downscale itself at `resizeQuality: "high"`,
 * which is both better and cheaper than decoding full-size and then shrinking
 * on a canvas. Capping resizeWidth/Height at the intrinsic size is what stops
 * a small upload being silently upscaled into a blurry 2000px "master".
 */
async function decodeTo(file, target) {
  if (typeof createImageBitmap !== "function") return null;
  try {
    return await createImageBitmap(file, {
      imageOrientation: "from-image",
      resizeWidth: target.width,
      resizeHeight: target.height,
      resizeQuality: "high",
    });
  } catch {
    // Safari has shipped several partial versions of these options. Falling
    // back is cheaper than feature-detecting each one.
    return null;
  }
}

/** Draw a source into a canvas of exactly `target`, and hand back the canvas. */
function paint(source, target) {
  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;

  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, target.width, target.height);
  return canvas;
}

/**
 * iOS caps total canvas backing store, and when it hits that cap it produces a
 * blank canvas rather than throwing. Without this probe the upload would
 * succeed and the client would find a pure white card in the grid.
 *
 * Cards are dense artwork, so an all-zero pixel is a reliable tell; a fully
 * transparent one is impossible here because the context is created with
 * `alpha: false`.
 */
function assertNotBlank(canvas) {
  const ctx = canvas.getContext("2d");
  const { data } = ctx.getImageData(0, 0, 1, 1);
  if (data[0] === 0 && data[1] === 0 && data[2] === 0 && data[3] === 0) {
    throw new ImageError("blankCanvas");
  }
}

/** Release the backing store. Setting the dimensions to 0 is what frees it. */
const release = (canvas) => {
  canvas.width = 0;
  canvas.height = 0;
};

/* -------------------------------------------------------------------------- */
/* encode                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Encode, and verify the browser produced what was asked for.
 *
 * toBlob() does NOT throw on an unsupported type -- it quietly falls back to
 * PNG. A "webp thumbnail" that is really a PNG is several times larger and
 * nothing about it looks wrong until someone checks the grid's weight.
 */
export async function encode(canvas, type, quality) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  if (!blob) throw new ImageError("encodeFailed", type);
  if (blob.type !== type) throw new ImageError("unsupportedFormat", blob.type);
  return blob;
}

/* -------------------------------------------------------------------------- */
/* the pipeline                                                               */
/* -------------------------------------------------------------------------- */

function validate(file) {
  if (!ACCEPTED.includes(file.type)) throw new ImageError("badType", file.type);
  if (file.size > MAX_BYTES) throw new ImageError("tooLarge", file.size);
}

/**
 * One uploaded card, turned into everything the registry needs.
 *
 * Returns the master, the thumbnail, and the master's post-resize dimensions.
 * Those dimensions are not cosmetic: exportCard sizes the export canvas to
 * `design.width/height` and renderCard draws the source into exactly that box,
 * so a mismatch does not throw -- it silently stretches every download.
 *
 * Variants are produced one at a time rather than with Promise.all, so peak
 * memory is one canvas instead of two.
 */
export async function processCard(file) {
  validate(file);

  const intrinsic = await probeDimensions(file);
  if (intrinsic.width * intrinsic.height > MAX_PIXELS) {
    throw new ImageError("tooManyPixels", `${intrinsic.width}x${intrinsic.height}`);
  }

  const masterSize = fit(intrinsic.width, intrinsic.height, CARD_MASTER);
  const thumbSize = fit(intrinsic.width, intrinsic.height, CARD_THUMB);

  const bitmap = await decodeTo(file, masterSize);
  const source = bitmap ?? (await loadViaElement(file));

  let master;
  let thumb;
  try {
    const masterCanvas = paint(source, masterSize);
    try {
      assertNotBlank(masterCanvas);
      master = await encode(masterCanvas, MASTER_TYPE, MASTER_QUALITY);
    } finally {
      release(masterCanvas);
    }

    const thumbCanvas = paint(source, thumbSize);
    try {
      thumb = await encode(thumbCanvas, THUMB_TYPE, THUMB_QUALITY);
    } finally {
      release(thumbCanvas);
    }
  } finally {
    bitmap?.close();
    if (source instanceof HTMLImageElement) URL.revokeObjectURL(source.src);
  }

  return {
    master,
    thumb,
    original: file,
    width: masterSize.width,
    height: masterSize.height,
    intrinsic,
  };
}

/** Fallback source when createImageBitmap's resize options are unavailable. */
function loadViaElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ImageError("decodeFailed"));
    };
    img.src = url;
  });
}
