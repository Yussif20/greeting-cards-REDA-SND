// The body handed to Supabase Storage, carrying the type the caller declares.
//
// Import-free, so scripts/verify-render.mjs can assert the rule directly --
// the same reason duplicateInput.js and fontFile.js are their own modules. And
// it needs asserting more than most: nothing here is visible until a bucket
// refuses an upload, in production, with a message about a MIME type nobody
// wrote down anywhere.

/**
 * `upload(path, file, { contentType })` IGNORES contentType whenever the body
 * is a Blob. storage-js posts a Blob as multipart/form-data, and the part's
 * Content-Type is then whatever `blob.type` says -- the option is only read on
 * the branch for bodies that are neither Blob nor FormData:
 *
 *   if (fileBody instanceof Blob) { body = new FormData(); body.append('', fileBody) }
 *   else if (fileBody instanceof FormData) { ... }
 *   else { headers['content-type'] = options.contentType }
 *
 * A File is a Blob, so the first branch always wins. Windows registers no type
 * for .ttf or .otf, so `file.type` is "" for both, the browser writes
 * `application/octet-stream` for the part, and the media bucket refuses it --
 * which is exactly the upload the extension-derived type was meant to permit.
 *
 * Re-wrapping copies the bytes, which is why the equality check is not
 * cosmetic. A card's master and thumbnail come out of canvas.toBlob() already
 * carrying image/jpeg and image/webp, so they pass through untouched; the copy
 * falls only on font files, capped at MAX_FONT_BYTES.
 */
export const uploadBody = (blob, contentType) =>
  !contentType || blob.type === contentType
    ? blob
    : new Blob([blob], { type: contentType });
