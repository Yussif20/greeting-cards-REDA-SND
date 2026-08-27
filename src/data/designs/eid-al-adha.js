// Eid Al Adha designs.
//
// Numbering was assigned by scripts/optimize-assets.mjs from the original
// brand-named files. Original mapping:
//   01 RHC · 02 FHC · 03 Green · 04 Process · 05 Safe · 06 Verdifor · 07 GUARD
//
// Artwork is glossy 3D product renders with neon rim-light on deep blue, with
// the "عيد مبارك" lockup across the lower-middle. Style tags are provisional --
// each is one line to correct.

const SLUG = "eid-al-adha";
const DIR = `/cards/${SLUG}`;

// The "عيد مبارك" lockup runs to y=0.71 and its Latin caption to 0.75,
// so personalisation sits in the clear field beneath it.
const layout = (defaultColor = "#FFFFFF") => ({
  safeArea: { x: 0.08, y: 0.77, w: 0.84, h: 0.18 },
  name: { x: 0.5, y: 0.82, size: 0.05, align: "center", maxWidth: 0.84 },
  jobTitle: { x: 0.5, y: 0.89, size: 0.023, align: "center", maxWidth: 0.84 },
  logo: { x: 0.5, y: 0.95, width: 0.26 },
  palette: ["#FFFFFF", "#E7C873", "#7FD4F5", "#B8C6E0", "#0B1A33"],
  defaultColor,
  brandMark: { x: 0.02, y: 0.015, w: 0.32, h: 0.105 },
  fontId: "cairo",
});

// Card factory for one season -- see src/data/years.js. The season id is part
// of the design id because card numbers restart at 01 each year and would
// otherwise collide across seasons.
const season = (year, dir) => (number, brand, style) => ({
  id: `${SLUG}-${year}-${String(number).padStart(2, "0")}`,
  number,
  year,
  occasion: SLUG,
  style,
  src: `${dir}/${String(number).padStart(2, "0")}.jpg`,
  thumb: `${dir}/thumbs/${String(number).padStart(2, "0")}.webp`,
  width: 2000,
  height: 2000,
  brandBakedIn: true,
  brand,
  isPlaceholder: false,
  layout: layout(),
});

// The first season predates the archive, so its artwork sits at the occasion
// root rather than in a season subdirectory.
const y2526 = season("2025-2026", DIR);

export default [
  y2526(1, "rhc", "modern"),
  y2526(2, "fhc", "modern"),
  y2526(3, "green", "modern"),
  y2526(4, "process", "modern"),
  y2526(5, "safe", "modern"),
  // Single sweeping arc on flat green, far less busy than its siblings.
  y2526(6, "verdifor", "minimal"),
  y2526(7, "guard", "modern"),
];
