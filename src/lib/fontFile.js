// What counts as a font file, and what to call it.
//
// In src/lib/ rather than src/admin/lib/ because both halves need it: the admin
// validates an upload with it, and the public runtime derives a registered
// family and a format() hint from a stored path with it. The public bundle must
// never import from src/admin/ -- that is where @supabase/supabase-js lives, and
// the whole point of the lazy admin chunk is that a visitor downloads none of
// it.
//
// Import-free, so scripts/verify-render.mjs can assert these rules directly --
// the same reason duplicateInput.js and brandGroups.js are their own modules.
// Getting the content type wrong is invisible until an upload is refused by the
// bucket, and getting the format() hint wrong is invisible until a card is
// downloaded with the wrong typeface in it.

/**
 * Judged by EXTENSION, never by `file.type`.
 *
 * Browsers disagree about fonts more than about images: the same .ttf arrives
 * as "font/ttf" on one machine, "application/x-font-ttf" on another and "" on a
 * third, depending on the platform's own type registry. The extension is the
 * one thing the foundry controls and the browser does not rewrite.
 *
 * `format` is the hint passed to the FontFace source. It is not cosmetic -- a
 * browser may skip a source whose declared format it does not recognise, and
 * the failure is silent: the family stays unloaded and the card renders in the
 * fallback with nothing logged.
 *
 * `type` is what the upload declares to Supabase Storage, which checks it
 * against the bucket's allowed_mime_types (see 0006_fonts.sql).
 */
export const FONT_FORMATS = {
  woff2: { format: "woff2", type: "font/woff2" },
  woff: { format: "woff", type: "font/woff" },
  ttf: { format: "truetype", type: "font/ttf" },
  otf: { format: "opentype", type: "font/otf" },
};

export const FONT_EXTENSIONS = Object.keys(FONT_FORMATS);

/** The file picker's accept list. A drop ignores it, hence validate() below. */
export const FONT_ACCEPT = FONT_EXTENSIONS.map((e) => `.${e}`).join(",");

/**
 * Comfortably under the media bucket's 10 MB object limit.
 *
 * A full Arabic TTF is usually 200 KB to 2 MB; anything approaching this is
 * either a variable font with every axis or the wrong file entirely. Refusing
 * it here gives a sentence the admin can act on, where the bucket would give a
 * 413.
 */
export const MAX_FONT_BYTES = 8 * 1024 * 1024;

export class FontError extends Error {
  constructor(code, detail) {
    super(code);
    this.name = "FontError";
    this.code = code;
    this.detail = detail;
  }
}

/** Lower-case extension without the dot, or "" when there is none. */
export const fontExtension = (name = "") => {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
};

/**
 * Throws FontError, or returns what the uploader needs.
 *
 * @returns {{ext: string, format: string, type: string}}
 */
export function validateFontFile(file) {
  const ext = fontExtension(file?.name);
  const spec = FONT_FORMATS[ext];
  if (!spec) throw new FontError("badFontType", ext || file?.name || "");
  if (file.size > MAX_FONT_BYTES) throw new FontError("fontTooLarge", String(file.size));
  return { ext, ...spec };
}

/**
 * The CSS family an uploaded font registers under.
 *
 * Derived from the row id rather than read out of the file, because the name
 * inside a font file is not ours to trust: two uploads may both call themselves
 * "IBM Plex Sans Arabic", and one calling itself "Cairo" would shadow the
 * bundled Cairo on every card that uses it. A derived family is unique by
 * construction and cannot collide with a bundled face.
 *
 * The `uf-` prefix is what makes that last guarantee readable in devtools and
 * in a ctx.font string, rather than something to be taken on trust.
 */
export const uploadedFamily = (id) => `uf-${id}`;

/**
 * The format hint for an already-stored path, which is all the runtime has.
 *
 * Falls back to woff2 for a path with no usable extension. That is the format
 * every supported browser reads, so a bad guess costs a failed load rather than
 * a wrong typeface silently rendering.
 */
export const formatForPath = (path = "") =>
  FONT_FORMATS[fontExtension(path)]?.format ?? "woff2";
