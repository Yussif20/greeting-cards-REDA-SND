// Saudi Founding Day designs.
//
// Original mapping: 01 RHC · 02 FHC · 03 Green · 04 Process · 05 Safe · 06 Verdifor
//
// Blush ground, bold maroon Arabic display type at the top, a thin Najdi
// pattern band across the middle, and a desaturated Diriyah photograph along
// the bottom edge. Restrained and editorial -- all six read as elegant.

const DIR = "/cards/saudi-founding-day";

// Type occupies 0.10-0.30 and the pattern band sits at ~0.45, so the clear
// blush field between them is where personalisation belongs.
const layout = () => ({
  safeArea: { x: 0.10, y: 0.30, w: 0.80, h: 0.13 },
  name: { x: 0.5, y: 0.345, size: 0.044, align: "center", maxWidth: 0.80 },
  jobTitle: { x: 0.5, y: 0.405, size: 0.021, align: "center", maxWidth: 0.80 },
  logo: { x: 0.5, y: 0.55, width: 0.24 },
  palette: ["#8E2B34", "#3A2A22", "#A87A4A", "#FFFFFF", "#1A1410"],
  defaultColor: "#8E2B34",
  fontId: "din-next-arabic",
});

const design = (number, brand, style) => ({
  id: `saudi-founding-day-${String(number).padStart(2, "0")}`,
  number,
  occasion: "saudi-founding-day",
  style,
  src: `${DIR}/${String(number).padStart(2, "0")}.jpg`,
  thumb: `${DIR}/thumbs/${String(number).padStart(2, "0")}.webp`,
  width: 2000,
  height: 2000,
  brandBakedIn: true,
  brand,
  isPlaceholder: false,
  layout: layout(),
});

export default [
  design(1, "rhc", "elegant"),
  design(2, "fhc", "elegant"),
  design(3, "green", "elegant"),
  design(4, "process", "elegant"),
  design(5, "safe", "elegant"),
  design(6, "verdifor", "elegant"),
];
