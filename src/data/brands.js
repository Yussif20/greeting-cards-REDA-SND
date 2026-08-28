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
// `name` is a plain string, not a bilingual { ar, en } pair like occasions and
// fonts carry: these are the registered trade names, and the logos in the
// artwork are English wordmarks, so the roster reads the same in both
// languages. Transliterating them would name a company that does not exist.
//
// The roster is deliberately not uniformly prefixed. "Fire & Hazard Control"
// and "Verdifor" carry no "REDA"; the rest do. These are how the companies are
// named, not a pattern with exceptions, so do not tidy them into line.

export const BRANDS = [
  {
    id: "rhc",
    name: "REDA Hazard Control",
    logo: null,
    aspect: 4.2,
  },
  {
    id: "fhc",
    name: "Fire & Hazard Control",
    logo: null,
    aspect: 4.2,
  },
  {
    id: "green",
    name: "REDA Green",
    logo: null,
    aspect: 4.2,
  },
  {
    id: "process",
    name: "REDA Process",
    logo: null,
    aspect: 4.2,
  },
  {
    id: "safe",
    name: "REDA Safe",
    logo: null,
    aspect: 4.2,
  },
  {
    id: "verdifor",
    name: "Verdifor",
    logo: null,
    aspect: 4.2,
  },
  {
    id: "guard",
    name: "REDA Guard",
    logo: null,
    aspect: 4.2,
  },
];

export const BRANDS_BY_ID = Object.fromEntries(BRANDS.map((b) => [b.id, b]));

export const getBrand = (id) => BRANDS_BY_ID[id] ?? null;
