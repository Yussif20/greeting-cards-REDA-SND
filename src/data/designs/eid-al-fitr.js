// Eid Al Fitr designs.
//
// Original mapping: 01 RHC · 02 FHC · 03 Green · 04 Process · 05 Safe · 06 Verdifor
//
// Flat vector artwork: white thuluth calligraphy over a patterned royal-blue
// ground with hanging lanterns and stars. Calligraphy-led, so all six read as
// traditional -- they differ only by brand mark.

const DIR = "/cards/eid-al-fitr";

// Calligraphy occupies 0.28-0.56 and the "EID MUBARAK" line sits at ~0.62.
const layout = () => ({
  safeArea: { x: 0.08, y: 0.72, w: 0.84, h: 0.20 },
  name: { x: 0.5, y: 0.78, size: 0.05, align: "center", maxWidth: 0.84 },
  jobTitle: { x: 0.5, y: 0.855, size: 0.023, align: "center", maxWidth: 0.84 },
  logo: { x: 0.5, y: 0.92, width: 0.26 },
  palette: ["#FFFFFF", "#E7C873", "#8FB8E8", "#EE2E3A", "#0B1A33"],
  defaultColor: "#FFFFFF",
  fontId: "din-next-arabic",
});

const design = (number, brand, style) => ({
  id: `eid-al-fitr-${String(number).padStart(2, "0")}`,
  number,
  occasion: "eid-al-fitr",
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
  design(1, "rhc", "traditional"),
  design(2, "fhc", "traditional"),
  design(3, "green", "traditional"),
  design(4, "process", "traditional"),
  design(5, "safe", "traditional"),
  design(6, "verdifor", "traditional"),
];
