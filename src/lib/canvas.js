/** Canvas sizing and image loading helpers. */

const imageCache = new Map();

/**
 * Size a canvas for crisp rendering at the device pixel ratio and return a
 * context already scaled so all drawing can use CSS pixels.
 *
 * The preview must NOT be sized to the native image (the old editor set
 * canvas.width = image.width): a 2000x2000 backing store costs ~16MB and then
 * CSS-downsamples 2000px glyphs, which is why preview text looked soft.
 */
export function sizeCanvas(canvas, cssW, cssH, dpr) {
  const ratio = dpr ?? Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(cssW * ratio));
  canvas.height = Math.max(1, Math.round(cssH * ratio));
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return ctx;
}

/** Load and decode an image once, then serve it from cache. */
export function loadImage(src) {
  if (imageCache.has(src)) return imageCache.get(src);

  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = async () => {
      try {
        await img.decode();
      } catch {
        // decode() can reject on some browsers even when the image is usable.
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Could not load image: ${src}`));
    img.src = src;
  });

  imageCache.set(src, promise);
  // A failed load must not poison the cache for a later retry.
  promise.catch(() => imageCache.delete(src));
  return promise;
}
