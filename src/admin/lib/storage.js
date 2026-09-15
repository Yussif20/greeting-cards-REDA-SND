import { supabase } from "./supabase.js";
import { uploadBody } from "./uploadBody.js";
import { validateFontFile } from "../../lib/fontFile.js";

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

/**
 * The body goes through uploadBody() because `contentType` alone does not
 * reach the server for a Blob -- see the note there. It is still passed, since
 * it is what a non-Blob body would be sent with.
 */
async function put(bucket, objectPath, blob, contentType) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, uploadBody(blob, contentType), {
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

/**
 * Store one brand cover and return the path the occasion row keeps.
 *
 * Content-addressed like everything else, so replacing a company's cover writes
 * a new object rather than overwriting one. That matters more here than it looks:
 * the published snapshot still points at the old path until the next publish,
 * and an upsert would blank the tile for everyone in between.
 *
 * The original goes to the private bucket on the same best-effort terms as a
 * card's: the cover is already stored by then, so losing it costs the ability to
 * re-derive, not the tile.
 */
export async function uploadBrandCover({ occasionSlug, brandId, cover, original }) {
  const dir = `covers/${occasionSlug}/${brandId}/${uid()}`;
  const path = await put(MEDIA_BUCKET, `${dir}/cover.webp`, cover, "image/webp");

  try {
    const ext = (original.name?.split(".").pop() ?? "bin").toLowerCase().slice(0, 5);
    await put(ORIGINALS_BUCKET, `${dir}/original.${ext}`, original, original.type);
  } catch {
    // The cover is already stored; the tile is usable without the original.
  }

  return { src: mediaUrl(path) };
}

/**
 * Store one font file and return the path the registry keeps.
 *
 * The content type is derived from the extension rather than read off the File.
 * Browsers report the same .ttf as "font/ttf", as "application/x-font-ttf" and
 * as "" depending on the platform, and the bucket checks exactly this value
 * against its allowed_mime_types -- so trusting file.type would make an upload
 * succeed or fail according to which machine the admin happened to be on.
 *
 * Nothing is re-encoded. A browser cannot convert a TTF to WOFF2, and shipping
 * the file the foundry supplied is the only way a licensed face can be used at
 * all.
 */
export async function uploadFont({ fontId, weight, file }) {
  const { ext, type } = validateFontFile(file);
  const path = `fonts/${fontId}/${uid()}/${weight}.${ext}`;
  return mediaUrl(await put(MEDIA_BUCKET, path, file, type));
}

/**
 * Store a hero's variants and return the extension-less base the registry
 * keeps, matching the `${hero.base}.webp` / `${hero.base}@2x.jpg` convention
 * OccasionCard has always used.
 */
export async function uploadHero({ occasionSlug, variants, original }) {
  const dir = `heroes/${occasionSlug}/${uid()}`;

  for (const { suffix, ext, blob } of variants) {
    await put(
      MEDIA_BUCKET,
      `${dir}/hero${suffix}.${ext}`,
      blob,
      ext === "webp" ? "image/webp" : "image/jpeg",
    );
  }

  // As with cards: losing the original must not lose the hero.
  try {
    const ext = (original.name?.split(".").pop() ?? "bin").toLowerCase().slice(0, 5);
    await put(ORIGINALS_BUCKET, `${dir}/original.${ext}`, original, original.type);
  } catch {
    // The derivatives are already stored; the occasion is usable without it.
  }

  return { base: mediaUrl(`${dir}/hero`) };
}
