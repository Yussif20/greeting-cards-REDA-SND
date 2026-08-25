// One-shot asset pipeline. Run with `npm run assets`.
//
// Reads originals from assets-src/ (gitignored) and the legacy public/ card
// folders, and writes optimised, slug-named output into public/.
// Safe to re-run: every output is derived, never hand-edited.

import sharp from "sharp";
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "assets-src");
const PUB = path.join(ROOT, "public");

// Hero widths: 760 for the 3-column desktop tile, 1520 for 2x / mobile full-bleed.
const HERO_WIDTHS = [760, 1520];
const CARD_MASTER = 2000;
const CARD_THUMB = 600;

// Legacy folder -> occasion slug. Only occasions with real artwork appear here;
// the placeholder occasions borrow another slug's cards at the registry level.
const CARD_SETS = [
  { from: "eid", slug: "eid-al-fitr" },
  { from: "eid-adha", slug: "eid-al-adha" },
  { from: "founding-day-cards", slug: "saudi-founding-day" },
  { from: "cards", slug: "hijri-new-year" }, // Ramadan art, reused as placeholder source
];

// Brand order fixes design numbering (01..07) so filenames stop encoding brand.
// The brand itself now lives in src/data/designs/<slug>.js.
const BRAND_ORDER = ["RHC", "FHC", "Green", "Process", "Safe", "Verdifor", "GUARD"];

const kb = (n) => `${Math.round(n / 1024)}KB`;
let saved = 0;

async function sizeOf(p) {
  try {
    return (await stat(p)).size;
  } catch {
    return 0;
  }
}

async function heroes() {
  const dir = path.join(SRC, "heroes");
  let files;
  try {
    files = (await readdir(dir)).filter((f) => /\.(png|jpe?g)$/i.test(f));
  } catch {
    console.log("· no assets-src/heroes, skipping heroes");
    return;
  }

  for (const file of files) {
    const slug = path.basename(file, path.extname(file));
    const out = path.join(PUB, "occasions", slug);
    await mkdir(out, { recursive: true });

    const input = path.join(dir, file);
    const before = await sizeOf(input);
    let after = 0;

    for (const w of HERO_WIDTHS) {
      const suffix = w === HERO_WIDTHS[0] ? "" : "@2x";
      const base = sharp(input).resize({ width: w, withoutEnlargement: true });

      const targets = [
        [`hero${suffix}.avif`, base.clone().avif({ quality: 55 })],
        [`hero${suffix}.webp`, base.clone().webp({ quality: 78 })],
        [`hero${suffix}.jpg`, base.clone().jpeg({ quality: 80, progressive: true, mozjpeg: true })],
      ];

      for (const [name, pipeline] of targets) {
        const dest = path.join(out, name);
        await pipeline.toFile(dest);
        after += await sizeOf(dest);
      }
    }

    saved += before - after;
    console.log(`  hero ${slug}: ${kb(before)} -> ${kb(after)} (6 files)`);
  }
}

async function cards() {
  for (const { from, slug } of CARD_SETS) {
    const dir = path.join(PUB, from);
    let files;
    try {
      files = (await readdir(dir)).filter((f) => /\.(jpe?g)$/i.test(f));
    } catch {
      console.log(`· no public/${from}, skipping`);
      continue;
    }

    // Order by BRAND_ORDER so numbering is stable across runs.
    files.sort((a, b) => {
      const key = (f) => {
        const stem = path.basename(f, path.extname(f)).toUpperCase();
        const i = BRAND_ORDER.findIndex((x) => x.toUpperCase() === stem);
        return i === -1 ? 99 : i;
      };
      return key(a) - key(b);
    });

    const out = path.join(PUB, "cards", slug);
    const thumbs = path.join(out, "thumbs");
    await mkdir(thumbs, { recursive: true });

    for (const [i, file] of files.entries()) {
      const nn = String(i + 1).padStart(2, "0");
      const input = path.join(dir, file);
      const before = await sizeOf(input);

      const master = path.join(out, `${nn}.jpg`);
      await sharp(input)
        .resize({ width: CARD_MASTER, height: CARD_MASTER, fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 82, progressive: true, mozjpeg: true })
        .toFile(master);

      const thumb = path.join(thumbs, `${nn}.webp`);
      await sharp(input)
        .resize({ width: CARD_THUMB, height: CARD_THUMB, fit: "inside" })
        .webp({ quality: 76 })
        .toFile(thumb);

      const after = (await sizeOf(master)) + (await sizeOf(thumb));
      saved += before - after;
      console.log(
        `  card ${slug}/${nn} (was ${path.basename(file, path.extname(file))}): ${kb(before)} -> ${kb(after)}`,
      );
    }
  }
}

console.log("Optimising heroes...");
await heroes();
console.log("Optimising cards...");
await cards();
console.log(`\nDone. Reclaimed ~${kb(saved)}.`);
