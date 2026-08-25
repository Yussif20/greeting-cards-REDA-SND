// Hijri New Year designs.
//
// Original mapping: 01 RHC · 02 FHC · 03 Green · 04 Process · 05 Safe · 06 Verdifor
//
// NOTE: this is the former Ramadan artwork, reused while dedicated Hijri New
// Year art is produced. The lockup reads "RAMADAN MUBARAK", which is why these
// designs carry `isPlaceholder` and the UI shows a "sample artwork" badge.
// When real art lands: drop it in /cards/hijri-new-year, set isPlaceholder to
// false here, and flip artStatus in occasions.js.

const DIR = "/cards/hijri-new-year";

// Crescent and calligraphy occupy the centre; the caption line sits at ~0.62.
const layout = () => ({
  safeArea: { x: 0.08, y: 0.70, w: 0.84, h: 0.24 },
  name: { x: 0.5, y: 0.77, size: 0.052, align: "center", maxWidth: 0.84 },
  jobTitle: { x: 0.5, y: 0.845, size: 0.024, align: "center", maxWidth: 0.84 },
  logo: { x: 0.5, y: 0.92, width: 0.28 },
  palette: ["#FFFFFF", "#E7C873", "#7FD4F5", "#B8C6E0", "#0B1A33"],
  defaultColor: "#FFFFFF",
  fontId: "din-next-arabic",
});

const design = (number, brand, style) => ({
  id: `hijri-new-year-${String(number).padStart(2, "0")}`,
  number,
  occasion: "hijri-new-year",
  style,
  src: `${DIR}/${String(number).padStart(2, "0")}.jpg`,
  thumb: `${DIR}/thumbs/${String(number).padStart(2, "0")}.webp`,
  width: 2000,
  height: 2000,
  brandBakedIn: true,
  brand,
  isPlaceholder: true,
  layout: layout(),
});

export default [
  design(1, "rhc", "traditional"),
  design(2, "fhc", "traditional"),
  design(3, "green", "traditional"),
  design(4, "process", "traditional"),
  design(5, "safe", "traditional"),
  design(6, "verdifor", "traditional"),
];
