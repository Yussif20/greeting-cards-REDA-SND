// Saudi Founding Day designs.
//
// Original mapping: 01 RHC · 02 FHC · 03 Green · 04 Process · 05 Safe · 06 Verdifor
//
// Blush ground, bold maroon Arabic display type at the top, a thin Najdi
// pattern band across the middle, and a desaturated Diriyah photograph along
// the bottom edge. Restrained and editorial -- all six read as elegant.

const SLUG = "saudi-founding-day";
const DIR = `/cards/${SLUG}`;

// This artwork is densely filled: display type runs 0.20-0.44, the subtitle
// to 0.52, the Najdi pattern band 0.58-0.72, and the Diriyah photograph from
// 0.80. The only clear field is the blush band between them, so the type is
// set smaller here than on the other occasions.
const layout = () => ({
  safeArea: { x: 0.10, y: 0.71, w: 0.80, h: 0.075 },
  name: { x: 0.5, y: 0.734, size: 0.033, align: "center", maxWidth: 0.80 },
  jobTitle: { x: 0.5, y: 0.771, size: 0.016, align: "center", maxWidth: 0.80 },
  logo: { x: 0.5, y: 0.66, width: 0.20 },
  palette: ["#8E2B34", "#3A2A22", "#A87A4A", "#FFFFFF", "#1A1410"],
  defaultColor: "#8E2B34",
  brandMark: { x: 0.02, y: 0.02, w: 0.32, h: 0.125 },
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
  y2526(1, "rhc", "elegant"),
  y2526(2, "fhc", "elegant"),
  y2526(3, "green", "elegant"),
  y2526(4, "process", "elegant"),
  y2526(5, "safe", "elegant"),
  y2526(6, "verdifor", "elegant"),
];
