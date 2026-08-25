// Single source of truth for occasions.
//
// This is plain data, not React state. The occasion the user is looking at is a
// URL segment, so `useParams()` is the state container -- see useOccasionParam.
// Adding an occasion should never require touching a component.
//
// Occasion copy lives here as bilingual objects rather than as i18n keys.
// Occasions are domain entities; splitting their fields across en/ar bundles
// keyed `{occasion}_{field}` is what produced the previous comment-in/comment-out
// mess. UI chrome still lives in i18next.

/** Show a "sample artwork" badge on occasions still using borrowed art. */
export const SHOW_PLACEHOLDER_BADGE = true;

export const OCCASIONS = [
  {
    slug: "eid-al-fitr",
    order: 1,
    enabled: true,
    title: { ar: "عيد الفطر", en: "Eid Al Fitr" },
    shortTitle: { ar: "عيد الفطر", en: "Eid Al Fitr" },
    tagline: {
      ar: "بطاقات معايدة بمناسبة عيد الفطر المبارك",
      en: "Greeting cards for Eid Al Fitr",
    },
    edition: null,
    hero: {
      base: "/occasions/eid-al-fitr/hero",
      width: 1672,
      height: 941,
      focal: "50% 45%",
      alt: {
        ar: "مسجد مضاء عند الغروب مع هلال في السماء",
        en: "An illuminated mosque at dusk beneath a crescent moon",
      },
    },
    icon: "eidFitr",
    cardsDir: "/cards/eid-al-fitr",
    artStatus: "final",
    placeholderSource: null,
    theme: {
      light: {
        accent: "#B8860B",
        accentSoft: "#FBF3E2",
        onAccent: "#FFFFFF",
        scrimFrom: "rgba(30, 20, 5, 0)",
        scrimTo: "rgba(30, 20, 5, 0.86)",
      },
      dark: {
        accent: "#E0C063",
        accentSoft: "#2A2416",
        onAccent: "#1A1206",
        scrimFrom: "rgba(0, 0, 0, 0)",
        scrimTo: "rgba(0, 0, 0, 0.90)",
      },
    },
  },
  {
    slug: "eid-al-adha",
    order: 2,
    enabled: true,
    title: { ar: "عيد الأضحى", en: "Eid Al Adha" },
    shortTitle: { ar: "عيد الأضحى", en: "Eid Al Adha" },
    tagline: {
      ar: "بطاقات معايدة بمناسبة عيد الأضحى المبارك",
      en: "Greeting cards for Eid Al Adha",
    },
    edition: null,
    hero: {
      base: "/occasions/eid-al-adha/hero",
      width: 1672,
      height: 941,
      focal: "50% 50%",
      alt: {
        ar: "الكعبة المشرفة في المسجد الحرام عند الفجر",
        en: "The Kaaba in the Grand Mosque at dawn",
      },
    },
    icon: "eidAdha",
    cardsDir: "/cards/eid-al-adha",
    artStatus: "final",
    placeholderSource: null,
    theme: {
      light: {
        accent: "#0F5F4A",
        accentSoft: "#E8F1ED",
        onAccent: "#FFFFFF",
        scrimFrom: "rgba(5, 25, 35, 0)",
        scrimTo: "rgba(5, 25, 35, 0.86)",
      },
      dark: {
        accent: "#4FBF85",
        accentSoft: "#12261D",
        onAccent: "#06140F",
        scrimFrom: "rgba(0, 0, 0, 0)",
        scrimTo: "rgba(0, 0, 0, 0.90)",
      },
    },
  },
  {
    slug: "saudi-national-day",
    order: 3,
    enabled: true,
    title: { ar: "اليوم الوطني السعودي", en: "Saudi National Day" },
    shortTitle: { ar: "اليوم الوطني", en: "National Day" },
    tagline: {
      ar: "بطاقات معايدة بمناسبة اليوم الوطني",
      en: "Greeting cards for Saudi National Day",
    },
    // The ordinal is not derivable from a calendar API -- review each year.
    // 96 = 2026 (the Kingdom was unified in 1932).
    edition: { label: "96", labelAr: "٩٦" },
    hero: {
      base: "/occasions/saudi-national-day/hero",
      width: 1672,
      height: 941,
      focal: "50% 45%",
      alt: {
        ar: "العلم السعودي يرفرف أمام أفق الرياض",
        en: "The Saudi flag flying before the Riyadh skyline",
      },
    },
    icon: "nationalDay",
    cardsDir: "/cards/saudi-founding-day",
    artStatus: "placeholder",
    placeholderSource: "saudi-founding-day",
    theme: {
      light: {
        accent: "#1E7A4B",
        accentSoft: "#E7F2EC",
        onAccent: "#FFFFFF",
        scrimFrom: "rgba(6, 38, 30, 0)",
        scrimTo: "rgba(6, 38, 30, 0.86)",
      },
      dark: {
        accent: "#4FBF85",
        accentSoft: "#12261D",
        onAccent: "#06140F",
        scrimFrom: "rgba(0, 0, 0, 0)",
        scrimTo: "rgba(0, 0, 0, 0.90)",
      },
    },
  },
  {
    slug: "saudi-founding-day",
    order: 4,
    enabled: true,
    title: { ar: "يوم التأسيس", en: "Saudi Founding Day" },
    shortTitle: { ar: "يوم التأسيس", en: "Founding Day" },
    tagline: {
      ar: "بطاقات معايدة بمناسبة يوم التأسيس",
      en: "Greeting cards for Saudi Founding Day",
    },
    edition: null,
    hero: {
      base: "/occasions/saudi-founding-day/hero",
      width: 1672,
      height: 941,
      focal: "50% 50%",
      alt: {
        ar: "بيوت الدرعية الطينية التاريخية عند الغروب",
        en: "The historic mud-brick buildings of Diriyah at sunset",
      },
    },
    icon: "foundingDay",
    cardsDir: "/cards/saudi-founding-day",
    artStatus: "final",
    placeholderSource: null,
    theme: {
      light: {
        accent: "#8A5A2B",
        accentSoft: "#F6EDE2",
        onAccent: "#FFFFFF",
        scrimFrom: "rgba(38, 24, 12, 0)",
        scrimTo: "rgba(38, 24, 12, 0.86)",
      },
      dark: {
        accent: "#D9A468",
        accentSoft: "#2A2016",
        onAccent: "#1A1206",
        scrimFrom: "rgba(0, 0, 0, 0)",
        scrimTo: "rgba(0, 0, 0, 0.90)",
      },
    },
  },
  {
    slug: "hijri-new-year",
    order: 5,
    enabled: true,
    title: { ar: "العام الهجري الجديد", en: "Hijri New Year" },
    shortTitle: { ar: "العام الهجري", en: "Hijri New Year" },
    tagline: {
      ar: "بطاقات معايدة بمناسبة العام الهجري الجديد",
      en: "Greeting cards for the Hijri New Year",
    },
    edition: null,
    hero: {
      base: "/occasions/hijri-new-year/hero",
      width: 1672,
      height: 941,
      focal: "50% 55%",
      alt: {
        ar: "هلال فوق كثبان صحراوية وقرية مضاءة",
        en: "A crescent moon above desert dunes and a lit village",
      },
    },
    icon: "hijriNewYear",
    cardsDir: "/cards/hijri-new-year",
    artStatus: "placeholder",
    placeholderSource: "hijri-new-year",
    theme: {
      light: {
        accent: "#2A4A8A",
        accentSoft: "#E8EDF7",
        onAccent: "#FFFFFF",
        scrimFrom: "rgba(8, 16, 38, 0)",
        scrimTo: "rgba(8, 16, 38, 0.86)",
      },
      dark: {
        accent: "#7FA0E0",
        accentSoft: "#161E33",
        onAccent: "#070C1A",
        scrimFrom: "rgba(0, 0, 0, 0)",
        scrimTo: "rgba(0, 0, 0, 0.90)",
      },
    },
  },
  {
    slug: "new-year",
    order: 6,
    enabled: true,
    title: { ar: "العام الميلادي الجديد", en: "New Year" },
    shortTitle: { ar: "العام الميلادي", en: "New Year" },
    tagline: {
      ar: "بطاقات معايدة بمناسبة العام الميلادي الجديد",
      en: "Greeting cards for the New Year",
    },
    edition: null,
    hero: {
      base: "/occasions/new-year/hero",
      width: 1672,
      height: 941,
      focal: "50% 50%",
      alt: {
        ar: "ألعاب نارية فوق أفق الرياض ليلاً",
        en: "Fireworks above the Riyadh skyline at night",
      },
    },
    icon: "newYear",
    cardsDir: "/cards/hijri-new-year",
    artStatus: "placeholder",
    placeholderSource: "hijri-new-year",
    theme: {
      light: {
        accent: "#4A3A8A",
        accentSoft: "#EDEAF7",
        onAccent: "#FFFFFF",
        scrimFrom: "rgba(12, 10, 34, 0)",
        scrimTo: "rgba(12, 10, 34, 0.86)",
      },
      dark: {
        accent: "#9B8AE0",
        accentSoft: "#1D1833",
        onAccent: "#0A0818",
        scrimFrom: "rgba(0, 0, 0, 0)",
        scrimTo: "rgba(0, 0, 0, 0.90)",
      },
    },
  },
].sort((a, b) => a.order - b.order);

export const OCCASIONS_BY_SLUG = Object.fromEntries(
  OCCASIONS.map((o) => [o.slug, o]),
);

export const getOccasion = (slug) => OCCASIONS_BY_SLUG[slug] ?? null;

/** Occasions shown on the home page, in display order. */
export const visibleOccasions = () => OCCASIONS.filter((o) => o.enabled);
