// Eid Al Adha designs.
//
// Numbering was assigned by scripts/optimize-assets.mjs from the original
// brand-named files. Original mapping:
//   01 RHC · 02 FHC · 03 Green · 04 Process · 05 Safe · 06 Verdifor · 07 GUARD
//
// Artwork is glossy 3D product renders with neon rim-light on deep blue, with
// the "عيد مبارك" lockup across the lower-middle. Style tags are provisional --
// each is one line to correct.

const DIR = "/cards/eid-al-adha";

// The "عيد مبارك" lockup sits around y=0.62, so personalisation goes beneath it.
const layout = (defaultColor = "#FFFFFF") => ({
  safeArea: { x: 0.08, y: 0.72, w: 0.84, h: 0.24 },
  name: { x: 0.5, y: 0.79, size: 0.052, align: "center", maxWidth: 0.84 },
  jobTitle: { x: 0.5, y: 0.865, size: 0.024, align: "center", maxWidth: 0.84 },
  logo: { x: 0.5, y: 0.93, width: 0.28 },
  palette: ["#FFFFFF", "#E7C873", "#7FD4F5", "#B8C6E0", "#0B1A33"],
  defaultColor,
  fontId: "din-next-arabic",
});

const design = (number, brand, style) => ({
  id: `eid-al-adha-${String(number).padStart(2, "0")}`,
  number,
  occasion: "eid-al-adha",
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
  design(1, "rhc", "modern"),
  design(2, "fhc", "modern"),
  design(3, "green", "modern"),
  design(4, "process", "modern"),
  design(5, "safe", "modern"),
  // Single sweeping arc on flat green, far less busy than its siblings.
  design(6, "verdifor", "minimal"),
  design(7, "guard", "modern"),
];
