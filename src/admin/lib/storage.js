import { supabase } from "./supabase.js";

export const MEDIA_BUCKET = "media";
export const ORIGINALS_BUCKET = "originals";

/**
 * Public path for an object in the media bucket.
 *
 * Deliberately the proxied path and never the supabase.co URL. Serving
 * uploads from this origin is what makes canvas exports possible at all: a
 * cross-origin image taints the canvas unless every single fetch of it was a
 * CORS request, and DesignCard renders plain <img> tags with no crossorigin,
 * so one cached non-CORS response is enough to break Download for that
 * visitor. Measured, not assumed -- see the README.
 *
 * It also keeps egress on the host's CDN rather than the 5 GB/month free tier.
 */
export const mediaUrl = (objectPath) => `/media/${objectPath}`;

/**
 * Uploads are content-addressed by a random segment, so an object is written
 * exactly once and never mutated. That makes them safe to cache for a year,
 * removes any question of a stale derivative, and means replacing a card's
 * artwork can never destroy the file a published design still points at.
 */
const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;

const IMMUTABLE = "31536000";

async function put(bucket, objectPath, blob, contentType) {
  const { error } = await supabase.storage.from(bucket).upload(objectPath, blob, {
    contentType,
    cacheControl: IMMUTABLE,
    upsert: false,
  });
  if (error) throw new Error(`upload ${objectPath}: ${error.message}`);
  return objectPath;
}

/**
 * Store the three files a card needs and return the paths the registry keeps.
 *
 * The untouched original goes to a private bucket. It is the only thing that
 * makes re-deriving possible -- if the encoder settings change, or a card
 * turns out to need a different crop, the master is already lossy. Nothing
 * reads it at runtime, which is why it is not public.
 */
export async function uploadCard({ occasionSlug, seasonId, master, thumb, original }) {
  const dir = `cards/${occasionSlug}/${seasonId}/${uid()}`;

  const masterPath = await put(MEDIA_BUCKET, `${dir}/master.jpg`, master, "image/jpeg");
  const thumbPath = await put(MEDIA_BUCKET, `${dir}/thumb.webp`, thumb, "image/webp");

  // A failure here must not lose the card: the master and thumbnail are
  // already stored, so the design is usable with or without the original.
  let originalPath = null;
  try {
    const ext = (original.name?.split(".").pop() ?? "bin").toLowerCase().slice(0, 5);
    originalPath = await put(
      ORIGINALS_BUCKET,
      `${dir}/original.${ext}`,
      original,
      original.type,
    );
  } catch {
    originalPath = null;
  }

  return {
    src: mediaUrl(masterPath),
    thumb: mediaUrl(thumbPath),
    originalPath,
  };
}
