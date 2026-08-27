// Hijri New Year designs.
//
// Original mapping: 01 RHC · 02 FHC · 03 Green · 04 Process · 05 Safe · 06 Verdifor
//
// NOTE: this is the former Ramadan artwork, reused while dedicated Hijri New
// Year art is produced. The lockup reads "RAMADAN MUBARAK", which is why these
// designs carry `isPlaceholder` and the UI shows a "sample artwork" badge.
// When real art lands: drop it in /cards/hijri-new-year, set isPlaceholder to
// false here, and flip artStatus in occasions.js.

const SLUG = "hijri-new-year";
const DIR = `/cards/${SLUG}`;

// The crescent lockup runs to ~0.65 and its caption to ~0.72; everything
// below is open night sky.
const layout = () => ({
  safeArea: { x: 0.08, y: 0.77, w: 0.84, h: 0.18 },
  name: { x: 0.5, y: 0.82, size: 0.05, align: "center", maxWidth: 0.84 },
  jobTitle: { x: 0.5, y: 0.89, size: 0.023, align: "center", maxWidth: 0.84 },
  logo: { x: 0.5, y: 0.95, width: 0.26 },
  palette: ["#FFFFFF", "#E7C873", "#7FD4F5", "#B8C6E0", "#0B1A33"],
  defaultColor: "#FFFFFF",
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
  isPlaceholder: true,
  layout: layout(),
});

// The first season predates the archive, so its artwork sits at the occasion
// root rather than in a season subdirectory.
const y2526 = season("2025-2026", DIR);

export default [
  y2526(1, "rhc", "traditional"),
  y2526(2, "fhc", "traditional"),
  y2526(3, "green", "traditional"),
  y2526(4, "process", "traditional"),
  y2526(5, "safe", "traditional"),
  y2526(6, "verdifor", "traditional"),
];
