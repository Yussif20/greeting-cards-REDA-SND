// Eid Al Fitr designs.
//
// Original mapping: 01 RHC · 02 FHC · 03 Green · 04 Process · 05 Safe · 06 Verdifor
//
// Flat vector artwork: white thuluth calligraphy over a patterned royal-blue
// ground with hanging lanterns and stars. Calligraphy-led, so all six read as
// traditional -- they differ only by brand mark.

const SLUG = "eid-al-fitr";
const DIR = `/cards/${SLUG}`;

// Calligraphy occupies 0.28-0.56 and the "EID MUBARAK" line sits at ~0.62.
const layout = () => ({
  safeArea: { x: 0.08, y: 0.72, w: 0.84, h: 0.20 },
  name: { x: 0.5, y: 0.78, size: 0.05, align: "center", maxWidth: 0.84 },
  jobTitle: { x: 0.5, y: 0.855, size: 0.023, align: "center", maxWidth: 0.84 },
  logo: { x: 0.5, y: 0.92, width: 0.26 },
  palette: ["#FFFFFF", "#E7C873", "#8FB8E8", "#EE2E3A", "#0B1A33"],
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
  isPlaceholder: false,
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
