// REDA group brands.
//
// Today every card JPEG has its brand logo baked into the pixels, so `logo` is
// null and BrandSelect works in "Mode A" -- picking a brand navigates to the
// sibling design carrying that brand's artwork.
//
// When logo-free artwork and transparent brand SVGs arrive, fill in `logo` and
// set `brandBakedIn: false` on those designs. BrandSelect then switches to
// "Mode B" and composites the logo as a layer. No component changes needed.
//
// Arabic names are provisional -- confirm with the client.

export const BRANDS = [
  {
    id: "rhc",
    name: { en: "REDA Hazard Control", ar: "رضا للسيطرة على المخاطر" },
    logo: null,
    aspect: 4.2,
  },
  {
    id: "fhc",
    name: { en: "REDA Fire & Hazard Control", ar: "رضا للسيطرة على الحريق والمخاطر" },
    logo: null,
    aspect: 4.2,
  },
  {
    id: "green",
    name: { en: "REDA Green", ar: "رضا جرين" },
    logo: null,
    aspect: 4.2,
  },
  {
    id: "process",
    name: { en: "REDA Process", ar: "رضا بروسيس" },
    logo: null,
    aspect: 4.2,
  },
  {
    id: "safe",
    name: { en: "REDA Safe", ar: "رضا سيف" },
    logo: null,
    aspect: 4.2,
  },
  {
    id: "verdifor",
    name: { en: "Verdifor", ar: "فيرديفور" },
    logo: null,
    aspect: 4.2,
  },
  {
    id: "guard",
    name: { en: "REDA Guard", ar: "رضا جارد" },
    logo: null,
    aspect: 4.2,
  },
];

export const BRANDS_BY_ID = Object.fromEntries(BRANDS.map((b) => [b.id, b]));

export const getBrand = (id) => BRANDS_BY_ID[id] ?? null;
