// GENERATED -- do not edit by hand.
//
// The stale fallback for src/data/registryStore.js: a valid registry that
// exists synchronously at module-eval time, so getOccasion()/getDesign() never
// have to become async and no page ever needs a loading state.
//
// A .js module rather than .json on purpose -- scripts/verify-render.mjs
// imports the data layer under bare Node, where a JSON import needs
// `with { type: "json" }`, and Vite's handling of that attribute is unreliable.
//
// Regenerate with: npm run snapshot:pull

export default {
  "version": 1,
  "revision": 1787878133620,
  "generatedAt": "2026-08-28T00:48:53.620Z",
  "seasons": [
    {
      "id": "2025-2026",
      "label": {
        "en": "2025 / 2026",
        "ar": "٢٠٢٥ / ٢٠٢٦"
      }
    }
  ],
  "occasions": [
    {
      "slug": "eid-al-fitr",
      "order": 1,
      "enabled": true,
      "title": {
        "ar": "عيد الفطر",
        "en": "Eid Al Fitr"
      },
      "shortTitle": {
        "ar": "عيد الفطر",
        "en": "Eid Al Fitr"
      },
      "tagline": {
        "ar": "بطاقات معايدة بمناسبة عيد الفطر المبارك",
        "en": "Greeting cards for Eid Al Fitr"
      },
      "edition": null,
      "hero": {
        "alt": {
          "ar": "مسجد مضاء عند الغروب مع هلال في السماء",
          "en": "An illuminated mosque at dusk beneath a crescent moon"
        },
        "base": "/occasions/eid-al-fitr/hero",
        "focal": "50% 45%",
        "width": 1672,
        "height": 941,
        "widths": [
          760,
          1520
        ],
        "formats": [
          "avif",
          "webp",
          "jpg"
        ]
      },
      "icon": "eidFitr",
      "cardsDir": "/cards/eid-al-fitr",
      "artStatus": "final",
      "placeholderSource": null,
      "theme": {
        "dark": {
          "accent": "#E0C063",
          "scrimTo": "rgba(0, 0, 0, 0.90)",
          "onAccent": "#1A1206",
          "scrimFrom": "rgba(0, 0, 0, 0)",
          "accentSoft": "#2A2416"
        },
        "light": {
          "accent": "#B8860B",
          "scrimTo": "rgba(30, 20, 5, 0.86)",
          "onAccent": "#FFFFFF",
          "scrimFrom": "rgba(30, 20, 5, 0)",
          "accentSoft": "#FBF3E2"
        }
      }
    },
    {
      "slug": "eid-al-adha",
      "order": 2,
      "enabled": true,
      "title": {
        "ar": "عيد الأضحى",
        "en": "Eid Al Adha"
      },
      "shortTitle": {
        "ar": "عيد الأضحى",
        "en": "Eid Al Adha"
      },
      "tagline": {
        "ar": "بطاقات معايدة بمناسبة عيد الأضحى المبارك",
        "en": "Greeting cards for Eid Al Adha"
      },
      "edition": null,
      "hero": {
        "alt": {
          "ar": "الكعبة المشرفة في المسجد الحرام عند الفجر",
          "en": "The Kaaba in the Grand Mosque at dawn"
        },
        "base": "/occasions/eid-al-adha/hero",
        "focal": "50% 50%",
        "width": 1672,
        "height": 941,
        "widths": [
          760,
          1520
        ],
        "formats": [
          "avif",
          "webp",
          "jpg"
        ]
      },
      "icon": "eidAdha",
      "cardsDir": "/cards/eid-al-adha",
      "artStatus": "final",
      "placeholderSource": null,
      "theme": {
        "dark": {
          "accent": "#4FBF85",
          "scrimTo": "rgba(0, 0, 0, 0.90)",
          "onAccent": "#06140F",
          "scrimFrom": "rgba(0, 0, 0, 0)",
          "accentSoft": "#12261D"
        },
        "light": {
          "accent": "#0F5F4A",
          "scrimTo": "rgba(5, 25, 35, 0.86)",
          "onAccent": "#FFFFFF",
          "scrimFrom": "rgba(5, 25, 35, 0)",
          "accentSoft": "#E8F1ED"
        }
      }
    },
    {
      "slug": "saudi-national-day",
      "order": 3,
      "enabled": true,
      "title": {
        "ar": "اليوم الوطني السعودي",
        "en": "Saudi National Day"
      },
      "shortTitle": {
        "ar": "اليوم الوطني",
        "en": "National Day"
      },
      "tagline": {
        "ar": "بطاقات معايدة بمناسبة اليوم الوطني",
        "en": "Greeting cards for Saudi National Day"
      },
      "edition": {
        "label": "96",
        "labelAr": "٩٦"
      },
      "hero": {
        "alt": {
          "ar": "العلم السعودي يرفرف أمام أفق الرياض",
          "en": "The Saudi flag flying before the Riyadh skyline"
        },
        "base": "/occasions/saudi-national-day/hero",
        "focal": "50% 45%",
        "width": 1672,
        "height": 941,
        "widths": [
          760,
          1520
        ],
        "formats": [
          "avif",
          "webp",
          "jpg"
        ]
      },
      "icon": "nationalDay",
      "cardsDir": "/cards/saudi-founding-day",
      "artStatus": "placeholder",
      "placeholderSource": "saudi-founding-day",
      "theme": {
        "dark": {
          "accent": "#4FBF85",
          "scrimTo": "rgba(0, 0, 0, 0.90)",
          "onAccent": "#06140F",
          "scrimFrom": "rgba(0, 0, 0, 0)",
          "accentSoft": "#12261D"
        },
        "light": {
          "accent": "#1E7A4B",
          "scrimTo": "rgba(6, 38, 30, 0.86)",
          "onAccent": "#FFFFFF",
          "scrimFrom": "rgba(6, 38, 30, 0)",
          "accentSoft": "#E7F2EC"
        }
      }
    },
    {
      "slug": "saudi-founding-day",
      "order": 4,
      "enabled": true,
      "title": {
        "ar": "يوم التأسيس",
        "en": "Saudi Founding Day"
      },
      "shortTitle": {
        "ar": "يوم التأسيس",
        "en": "Founding Day"
      },
      "tagline": {
        "ar": "بطاقات معايدة بمناسبة يوم التأسيس",
        "en": "Greeting cards for Saudi Founding Day"
      },
      "edition": null,
      "hero": {
        "alt": {
          "ar": "بيوت الدرعية الطينية التاريخية عند الغروب",
          "en": "The historic mud-brick buildings of Diriyah at sunset"
        },
        "base": "/occasions/saudi-founding-day/hero",
        "focal": "50% 50%",
        "width": 1672,
        "height": 941,
        "widths": [
          760,
          1520
        ],
        "formats": [
          "avif",
          "webp",
          "jpg"
        ]
      },
      "icon": "foundingDay",
      "cardsDir": "/cards/saudi-founding-day",
      "artStatus": "final",
      "placeholderSource": null,
      "theme": {
        "dark": {
          "accent": "#D9A468",
          "scrimTo": "rgba(0, 0, 0, 0.90)",
          "onAccent": "#1A1206",
          "scrimFrom": "rgba(0, 0, 0, 0)",
          "accentSoft": "#2A2016"
        },
        "light": {
          "accent": "#8A5A2B",
          "scrimTo": "rgba(38, 24, 12, 0.86)",
          "onAccent": "#FFFFFF",
          "scrimFrom": "rgba(38, 24, 12, 0)",
          "accentSoft": "#F6EDE2"
        }
      }
    },
    {
      "slug": "hijri-new-year",
      "order": 5,
      "enabled": true,
      "title": {
        "ar": "العام الهجري الجديد",
        "en": "Hijri New Year"
      },
      "shortTitle": {
        "ar": "العام الهجري",
        "en": "Hijri New Year"
      },
      "tagline": {
        "ar": "بطاقات معايدة بمناسبة العام الهجري الجديد",
        "en": "Greeting cards for the Hijri New Year"
      },
      "edition": null,
      "hero": {
        "alt": {
          "ar": "هلال فوق كثبان صحراوية وقرية مضاءة",
          "en": "A crescent moon above desert dunes and a lit village"
        },
        "base": "/occasions/hijri-new-year/hero",
        "focal": "50% 55%",
        "width": 1672,
        "height": 941,
        "widths": [
          760,
          1520
        ],
        "formats": [
          "avif",
          "webp",
          "jpg"
        ]
      },
      "icon": "hijriNewYear",
      "cardsDir": "/cards/hijri-new-year",
      "artStatus": "placeholder",
      "placeholderSource": "hijri-new-year",
      "theme": {
        "dark": {
          "accent": "#7FA0E0",
          "scrimTo": "rgba(0, 0, 0, 0.90)",
          "onAccent": "#070C1A",
          "scrimFrom": "rgba(0, 0, 0, 0)",
          "accentSoft": "#161E33"
        },
        "light": {
          "accent": "#2A4A8A",
          "scrimTo": "rgba(8, 16, 38, 0.86)",
          "onAccent": "#FFFFFF",
          "scrimFrom": "rgba(8, 16, 38, 0)",
          "accentSoft": "#E8EDF7"
        }
      }
    },
    {
      "slug": "new-year",
      "order": 6,
      "enabled": true,
      "title": {
        "ar": "العام الميلادي الجديد",
        "en": "New Year"
      },
      "shortTitle": {
        "ar": "العام الميلادي",
        "en": "New Year"
      },
      "tagline": {
        "ar": "بطاقات معايدة بمناسبة العام الميلادي الجديد",
        "en": "Greeting cards for the New Year"
      },
      "edition": null,
      "hero": {
        "alt": {
          "ar": "ألعاب نارية فوق أفق الرياض ليلاً",
          "en": "Fireworks above the Riyadh skyline at night"
        },
        "base": "/occasions/new-year/hero",
        "focal": "50% 50%",
        "width": 1672,
        "height": 941,
        "widths": [
          760,
          1520
        ],
        "formats": [
          "avif",
          "webp",
          "jpg"
        ]
      },
      "icon": "newYear",
      "cardsDir": "/cards/hijri-new-year",
      "artStatus": "placeholder",
      "placeholderSource": "hijri-new-year",
      "theme": {
        "dark": {
          "accent": "#9B8AE0",
          "scrimTo": "rgba(0, 0, 0, 0.90)",
          "onAccent": "#0A0818",
          "scrimFrom": "rgba(0, 0, 0, 0)",
          "accentSoft": "#1D1833"
        },
        "light": {
          "accent": "#4A3A8A",
          "scrimTo": "rgba(12, 10, 34, 0.86)",
          "onAccent": "#FFFFFF",
          "scrimFrom": "rgba(12, 10, 34, 0)",
          "accentSoft": "#EDEAF7"
        }
      }
    }
  ],
  "designs": {
    "eid-al-fitr": [
      {
        "id": "eid-al-fitr-2025-2026-01",
        "number": 1,
        "year": "2025-2026",
        "occasion": "eid-al-fitr",
        "style": "traditional",
        "src": "/cards/eid-al-fitr/01.jpg",
        "thumb": "/cards/eid-al-fitr/thumbs/01.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "rhc",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.92,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.78,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#8FB8E8",
            "#EE2E3A",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.855,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.2,
            "w": 0.84,
            "x": 0.08,
            "y": 0.72
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "eid-al-fitr-2025-2026-02",
        "number": 2,
        "year": "2025-2026",
        "occasion": "eid-al-fitr",
        "style": "traditional",
        "src": "/cards/eid-al-fitr/02.jpg",
        "thumb": "/cards/eid-al-fitr/thumbs/02.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "fhc",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.92,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.78,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#8FB8E8",
            "#EE2E3A",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.855,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.2,
            "w": 0.84,
            "x": 0.08,
            "y": 0.72
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "eid-al-fitr-2025-2026-03",
        "number": 3,
        "year": "2025-2026",
        "occasion": "eid-al-fitr",
        "style": "traditional",
        "src": "/cards/eid-al-fitr/03.jpg",
        "thumb": "/cards/eid-al-fitr/thumbs/03.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "green",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.92,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.78,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#8FB8E8",
            "#EE2E3A",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.855,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.2,
            "w": 0.84,
            "x": 0.08,
            "y": 0.72
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "eid-al-fitr-2025-2026-04",
        "number": 4,
        "year": "2025-2026",
        "occasion": "eid-al-fitr",
        "style": "traditional",
        "src": "/cards/eid-al-fitr/04.jpg",
        "thumb": "/cards/eid-al-fitr/thumbs/04.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "process",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.92,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.78,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#8FB8E8",
            "#EE2E3A",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.855,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.2,
            "w": 0.84,
            "x": 0.08,
            "y": 0.72
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "eid-al-fitr-2025-2026-05",
        "number": 5,
        "year": "2025-2026",
        "occasion": "eid-al-fitr",
        "style": "traditional",
        "src": "/cards/eid-al-fitr/05.jpg",
        "thumb": "/cards/eid-al-fitr/thumbs/05.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "safe",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.92,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.78,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#8FB8E8",
            "#EE2E3A",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.855,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.2,
            "w": 0.84,
            "x": 0.08,
            "y": 0.72
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "eid-al-fitr-2025-2026-06",
        "number": 6,
        "year": "2025-2026",
        "occasion": "eid-al-fitr",
        "style": "traditional",
        "src": "/cards/eid-al-fitr/06.jpg",
        "thumb": "/cards/eid-al-fitr/thumbs/06.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "verdifor",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.92,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.78,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#8FB8E8",
            "#EE2E3A",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.855,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.2,
            "w": 0.84,
            "x": 0.08,
            "y": 0.72
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      }
    ],
    "eid-al-adha": [
      {
        "id": "eid-al-adha-2025-2026-01",
        "number": 1,
        "year": "2025-2026",
        "occasion": "eid-al-adha",
        "style": "modern",
        "src": "/cards/eid-al-adha/01.jpg",
        "thumb": "/cards/eid-al-adha/thumbs/01.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "rhc",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "eid-al-adha-2025-2026-02",
        "number": 2,
        "year": "2025-2026",
        "occasion": "eid-al-adha",
        "style": "modern",
        "src": "/cards/eid-al-adha/02.jpg",
        "thumb": "/cards/eid-al-adha/thumbs/02.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "fhc",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "eid-al-adha-2025-2026-03",
        "number": 3,
        "year": "2025-2026",
        "occasion": "eid-al-adha",
        "style": "modern",
        "src": "/cards/eid-al-adha/03.jpg",
        "thumb": "/cards/eid-al-adha/thumbs/03.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "green",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "eid-al-adha-2025-2026-04",
        "number": 4,
        "year": "2025-2026",
        "occasion": "eid-al-adha",
        "style": "modern",
        "src": "/cards/eid-al-adha/04.jpg",
        "thumb": "/cards/eid-al-adha/thumbs/04.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "process",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "eid-al-adha-2025-2026-05",
        "number": 5,
        "year": "2025-2026",
        "occasion": "eid-al-adha",
        "style": "modern",
        "src": "/cards/eid-al-adha/05.jpg",
        "thumb": "/cards/eid-al-adha/thumbs/05.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "safe",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "eid-al-adha-2025-2026-06",
        "number": 6,
        "year": "2025-2026",
        "occasion": "eid-al-adha",
        "style": "minimal",
        "src": "/cards/eid-al-adha/06.jpg",
        "thumb": "/cards/eid-al-adha/thumbs/06.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "verdifor",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "eid-al-adha-2025-2026-07",
        "number": 7,
        "year": "2025-2026",
        "occasion": "eid-al-adha",
        "style": "modern",
        "src": "/cards/eid-al-adha/07.jpg",
        "thumb": "/cards/eid-al-adha/thumbs/07.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "guard",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      }
    ],
    "saudi-national-day": [
      {
        "id": "saudi-national-day-2025-2026-01",
        "number": 1,
        "year": "2025-2026",
        "occasion": "saudi-national-day",
        "style": "elegant",
        "src": "/cards/saudi-founding-day/01.jpg",
        "thumb": "/cards/saudi-founding-day/thumbs/01.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "rhc",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.66,
            "width": 0.2
          },
          "name": {
            "x": 0.5,
            "y": 0.734,
            "size": 0.033,
            "align": "center",
            "maxWidth": 0.8
          },
          "fontId": "cairo",
          "palette": [
            "#8E2B34",
            "#3A2A22",
            "#A87A4A",
            "#FFFFFF",
            "#1A1410"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.771,
            "size": 0.016,
            "align": "center",
            "maxWidth": 0.8
          },
          "safeArea": {
            "h": 0.075,
            "w": 0.8,
            "x": 0.1,
            "y": 0.71
          },
          "brandMark": {
            "h": 0.125,
            "w": 0.32,
            "x": 0.02,
            "y": 0.02
          },
          "defaultColor": "#8E2B34"
        }
      },
      {
        "id": "saudi-national-day-2025-2026-02",
        "number": 2,
        "year": "2025-2026",
        "occasion": "saudi-national-day",
        "style": "elegant",
        "src": "/cards/saudi-founding-day/02.jpg",
        "thumb": "/cards/saudi-founding-day/thumbs/02.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "fhc",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.66,
            "width": 0.2
          },
          "name": {
            "x": 0.5,
            "y": 0.734,
            "size": 0.033,
            "align": "center",
            "maxWidth": 0.8
          },
          "fontId": "cairo",
          "palette": [
            "#8E2B34",
            "#3A2A22",
            "#A87A4A",
            "#FFFFFF",
            "#1A1410"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.771,
            "size": 0.016,
            "align": "center",
            "maxWidth": 0.8
          },
          "safeArea": {
            "h": 0.075,
            "w": 0.8,
            "x": 0.1,
            "y": 0.71
          },
          "brandMark": {
            "h": 0.125,
            "w": 0.32,
            "x": 0.02,
            "y": 0.02
          },
          "defaultColor": "#8E2B34"
        }
      },
      {
        "id": "saudi-national-day-2025-2026-03",
        "number": 3,
        "year": "2025-2026",
        "occasion": "saudi-national-day",
        "style": "elegant",
        "src": "/cards/saudi-founding-day/03.jpg",
        "thumb": "/cards/saudi-founding-day/thumbs/03.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "green",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.66,
            "width": 0.2
          },
          "name": {
            "x": 0.5,
            "y": 0.734,
            "size": 0.033,
            "align": "center",
            "maxWidth": 0.8
          },
          "fontId": "cairo",
          "palette": [
            "#8E2B34",
            "#3A2A22",
            "#A87A4A",
            "#FFFFFF",
            "#1A1410"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.771,
            "size": 0.016,
            "align": "center",
            "maxWidth": 0.8
          },
          "safeArea": {
            "h": 0.075,
            "w": 0.8,
            "x": 0.1,
            "y": 0.71
          },
          "brandMark": {
            "h": 0.125,
            "w": 0.32,
            "x": 0.02,
            "y": 0.02
          },
          "defaultColor": "#8E2B34"
        }
      },
      {
        "id": "saudi-national-day-2025-2026-04",
        "number": 4,
        "year": "2025-2026",
        "occasion": "saudi-national-day",
        "style": "elegant",
        "src": "/cards/saudi-founding-day/04.jpg",
        "thumb": "/cards/saudi-founding-day/thumbs/04.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "process",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.66,
            "width": 0.2
          },
          "name": {
            "x": 0.5,
            "y": 0.734,
            "size": 0.033,
            "align": "center",
            "maxWidth": 0.8
          },
          "fontId": "cairo",
          "palette": [
            "#8E2B34",
            "#3A2A22",
            "#A87A4A",
            "#FFFFFF",
            "#1A1410"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.771,
            "size": 0.016,
            "align": "center",
            "maxWidth": 0.8
          },
          "safeArea": {
            "h": 0.075,
            "w": 0.8,
            "x": 0.1,
            "y": 0.71
          },
          "brandMark": {
            "h": 0.125,
            "w": 0.32,
            "x": 0.02,
            "y": 0.02
          },
          "defaultColor": "#8E2B34"
        }
      },
      {
        "id": "saudi-national-day-2025-2026-05",
        "number": 5,
        "year": "2025-2026",
        "occasion": "saudi-national-day",
        "style": "elegant",
        "src": "/cards/saudi-founding-day/05.jpg",
        "thumb": "/cards/saudi-founding-day/thumbs/05.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "safe",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.66,
            "width": 0.2
          },
          "name": {
            "x": 0.5,
            "y": 0.734,
            "size": 0.033,
            "align": "center",
            "maxWidth": 0.8
          },
          "fontId": "cairo",
          "palette": [
            "#8E2B34",
            "#3A2A22",
            "#A87A4A",
            "#FFFFFF",
            "#1A1410"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.771,
            "size": 0.016,
            "align": "center",
            "maxWidth": 0.8
          },
          "safeArea": {
            "h": 0.075,
            "w": 0.8,
            "x": 0.1,
            "y": 0.71
          },
          "brandMark": {
            "h": 0.125,
            "w": 0.32,
            "x": 0.02,
            "y": 0.02
          },
          "defaultColor": "#8E2B34"
        }
      },
      {
        "id": "saudi-national-day-2025-2026-06",
        "number": 6,
        "year": "2025-2026",
        "occasion": "saudi-national-day",
        "style": "elegant",
        "src": "/cards/saudi-founding-day/06.jpg",
        "thumb": "/cards/saudi-founding-day/thumbs/06.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "verdifor",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.66,
            "width": 0.2
          },
          "name": {
            "x": 0.5,
            "y": 0.734,
            "size": 0.033,
            "align": "center",
            "maxWidth": 0.8
          },
          "fontId": "cairo",
          "palette": [
            "#8E2B34",
            "#3A2A22",
            "#A87A4A",
            "#FFFFFF",
            "#1A1410"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.771,
            "size": 0.016,
            "align": "center",
            "maxWidth": 0.8
          },
          "safeArea": {
            "h": 0.075,
            "w": 0.8,
            "x": 0.1,
            "y": 0.71
          },
          "brandMark": {
            "h": 0.125,
            "w": 0.32,
            "x": 0.02,
            "y": 0.02
          },
          "defaultColor": "#8E2B34"
        }
      }
    ],
    "saudi-founding-day": [
      {
        "id": "saudi-founding-day-2025-2026-01",
        "number": 1,
        "year": "2025-2026",
        "occasion": "saudi-founding-day",
        "style": "elegant",
        "src": "/cards/saudi-founding-day/01.jpg",
        "thumb": "/cards/saudi-founding-day/thumbs/01.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "rhc",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.66,
            "width": 0.2
          },
          "name": {
            "x": 0.5,
            "y": 0.734,
            "size": 0.033,
            "align": "center",
            "maxWidth": 0.8
          },
          "fontId": "cairo",
          "palette": [
            "#8E2B34",
            "#3A2A22",
            "#A87A4A",
            "#FFFFFF",
            "#1A1410"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.771,
            "size": 0.016,
            "align": "center",
            "maxWidth": 0.8
          },
          "safeArea": {
            "h": 0.075,
            "w": 0.8,
            "x": 0.1,
            "y": 0.71
          },
          "brandMark": {
            "h": 0.125,
            "w": 0.32,
            "x": 0.02,
            "y": 0.02
          },
          "defaultColor": "#8E2B34"
        }
      },
      {
        "id": "saudi-founding-day-2025-2026-02",
        "number": 2,
        "year": "2025-2026",
        "occasion": "saudi-founding-day",
        "style": "elegant",
        "src": "/cards/saudi-founding-day/02.jpg",
        "thumb": "/cards/saudi-founding-day/thumbs/02.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "fhc",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.66,
            "width": 0.2
          },
          "name": {
            "x": 0.5,
            "y": 0.734,
            "size": 0.033,
            "align": "center",
            "maxWidth": 0.8
          },
          "fontId": "cairo",
          "palette": [
            "#8E2B34",
            "#3A2A22",
            "#A87A4A",
            "#FFFFFF",
            "#1A1410"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.771,
            "size": 0.016,
            "align": "center",
            "maxWidth": 0.8
          },
          "safeArea": {
            "h": 0.075,
            "w": 0.8,
            "x": 0.1,
            "y": 0.71
          },
          "brandMark": {
            "h": 0.125,
            "w": 0.32,
            "x": 0.02,
            "y": 0.02
          },
          "defaultColor": "#8E2B34"
        }
      },
      {
        "id": "saudi-founding-day-2025-2026-03",
        "number": 3,
        "year": "2025-2026",
        "occasion": "saudi-founding-day",
        "style": "elegant",
        "src": "/cards/saudi-founding-day/03.jpg",
        "thumb": "/cards/saudi-founding-day/thumbs/03.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "green",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.66,
            "width": 0.2
          },
          "name": {
            "x": 0.5,
            "y": 0.734,
            "size": 0.033,
            "align": "center",
            "maxWidth": 0.8
          },
          "fontId": "cairo",
          "palette": [
            "#8E2B34",
            "#3A2A22",
            "#A87A4A",
            "#FFFFFF",
            "#1A1410"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.771,
            "size": 0.016,
            "align": "center",
            "maxWidth": 0.8
          },
          "safeArea": {
            "h": 0.075,
            "w": 0.8,
            "x": 0.1,
            "y": 0.71
          },
          "brandMark": {
            "h": 0.125,
            "w": 0.32,
            "x": 0.02,
            "y": 0.02
          },
          "defaultColor": "#8E2B34"
        }
      },
      {
        "id": "saudi-founding-day-2025-2026-04",
        "number": 4,
        "year": "2025-2026",
        "occasion": "saudi-founding-day",
        "style": "elegant",
        "src": "/cards/saudi-founding-day/04.jpg",
        "thumb": "/cards/saudi-founding-day/thumbs/04.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "process",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.66,
            "width": 0.2
          },
          "name": {
            "x": 0.5,
            "y": 0.734,
            "size": 0.033,
            "align": "center",
            "maxWidth": 0.8
          },
          "fontId": "cairo",
          "palette": [
            "#8E2B34",
            "#3A2A22",
            "#A87A4A",
            "#FFFFFF",
            "#1A1410"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.771,
            "size": 0.016,
            "align": "center",
            "maxWidth": 0.8
          },
          "safeArea": {
            "h": 0.075,
            "w": 0.8,
            "x": 0.1,
            "y": 0.71
          },
          "brandMark": {
            "h": 0.125,
            "w": 0.32,
            "x": 0.02,
            "y": 0.02
          },
          "defaultColor": "#8E2B34"
        }
      },
      {
        "id": "saudi-founding-day-2025-2026-05",
        "number": 5,
        "year": "2025-2026",
        "occasion": "saudi-founding-day",
        "style": "elegant",
        "src": "/cards/saudi-founding-day/05.jpg",
        "thumb": "/cards/saudi-founding-day/thumbs/05.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "safe",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.66,
            "width": 0.2
          },
          "name": {
            "x": 0.5,
            "y": 0.734,
            "size": 0.033,
            "align": "center",
            "maxWidth": 0.8
          },
          "fontId": "cairo",
          "palette": [
            "#8E2B34",
            "#3A2A22",
            "#A87A4A",
            "#FFFFFF",
            "#1A1410"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.771,
            "size": 0.016,
            "align": "center",
            "maxWidth": 0.8
          },
          "safeArea": {
            "h": 0.075,
            "w": 0.8,
            "x": 0.1,
            "y": 0.71
          },
          "brandMark": {
            "h": 0.125,
            "w": 0.32,
            "x": 0.02,
            "y": 0.02
          },
          "defaultColor": "#8E2B34"
        }
      },
      {
        "id": "saudi-founding-day-2025-2026-06",
        "number": 6,
        "year": "2025-2026",
        "occasion": "saudi-founding-day",
        "style": "elegant",
        "src": "/cards/saudi-founding-day/06.jpg",
        "thumb": "/cards/saudi-founding-day/thumbs/06.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "verdifor",
        "isPlaceholder": false,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.66,
            "width": 0.2
          },
          "name": {
            "x": 0.5,
            "y": 0.734,
            "size": 0.033,
            "align": "center",
            "maxWidth": 0.8
          },
          "fontId": "cairo",
          "palette": [
            "#8E2B34",
            "#3A2A22",
            "#A87A4A",
            "#FFFFFF",
            "#1A1410"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.771,
            "size": 0.016,
            "align": "center",
            "maxWidth": 0.8
          },
          "safeArea": {
            "h": 0.075,
            "w": 0.8,
            "x": 0.1,
            "y": 0.71
          },
          "brandMark": {
            "h": 0.125,
            "w": 0.32,
            "x": 0.02,
            "y": 0.02
          },
          "defaultColor": "#8E2B34"
        }
      }
    ],
    "hijri-new-year": [
      {
        "id": "hijri-new-year-2025-2026-01",
        "number": 1,
        "year": "2025-2026",
        "occasion": "hijri-new-year",
        "style": "traditional",
        "src": "/cards/hijri-new-year/01.jpg",
        "thumb": "/cards/hijri-new-year/thumbs/01.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "rhc",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "hijri-new-year-2025-2026-02",
        "number": 2,
        "year": "2025-2026",
        "occasion": "hijri-new-year",
        "style": "traditional",
        "src": "/cards/hijri-new-year/02.jpg",
        "thumb": "/cards/hijri-new-year/thumbs/02.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "fhc",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "hijri-new-year-2025-2026-03",
        "number": 3,
        "year": "2025-2026",
        "occasion": "hijri-new-year",
        "style": "traditional",
        "src": "/cards/hijri-new-year/03.jpg",
        "thumb": "/cards/hijri-new-year/thumbs/03.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "green",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "hijri-new-year-2025-2026-04",
        "number": 4,
        "year": "2025-2026",
        "occasion": "hijri-new-year",
        "style": "traditional",
        "src": "/cards/hijri-new-year/04.jpg",
        "thumb": "/cards/hijri-new-year/thumbs/04.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "process",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "hijri-new-year-2025-2026-05",
        "number": 5,
        "year": "2025-2026",
        "occasion": "hijri-new-year",
        "style": "traditional",
        "src": "/cards/hijri-new-year/05.jpg",
        "thumb": "/cards/hijri-new-year/thumbs/05.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "safe",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "hijri-new-year-2025-2026-06",
        "number": 6,
        "year": "2025-2026",
        "occasion": "hijri-new-year",
        "style": "traditional",
        "src": "/cards/hijri-new-year/06.jpg",
        "thumb": "/cards/hijri-new-year/thumbs/06.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "verdifor",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      }
    ],
    "new-year": [
      {
        "id": "new-year-2025-2026-01",
        "number": 1,
        "year": "2025-2026",
        "occasion": "new-year",
        "style": "traditional",
        "src": "/cards/hijri-new-year/01.jpg",
        "thumb": "/cards/hijri-new-year/thumbs/01.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "rhc",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "new-year-2025-2026-02",
        "number": 2,
        "year": "2025-2026",
        "occasion": "new-year",
        "style": "traditional",
        "src": "/cards/hijri-new-year/02.jpg",
        "thumb": "/cards/hijri-new-year/thumbs/02.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "fhc",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "new-year-2025-2026-03",
        "number": 3,
        "year": "2025-2026",
        "occasion": "new-year",
        "style": "traditional",
        "src": "/cards/hijri-new-year/03.jpg",
        "thumb": "/cards/hijri-new-year/thumbs/03.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "green",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "new-year-2025-2026-04",
        "number": 4,
        "year": "2025-2026",
        "occasion": "new-year",
        "style": "traditional",
        "src": "/cards/hijri-new-year/04.jpg",
        "thumb": "/cards/hijri-new-year/thumbs/04.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "process",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "new-year-2025-2026-05",
        "number": 5,
        "year": "2025-2026",
        "occasion": "new-year",
        "style": "traditional",
        "src": "/cards/hijri-new-year/05.jpg",
        "thumb": "/cards/hijri-new-year/thumbs/05.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "safe",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      },
      {
        "id": "new-year-2025-2026-06",
        "number": 6,
        "year": "2025-2026",
        "occasion": "new-year",
        "style": "traditional",
        "src": "/cards/hijri-new-year/06.jpg",
        "thumb": "/cards/hijri-new-year/thumbs/06.webp",
        "width": 2000,
        "height": 2000,
        "brandBakedIn": true,
        "brand": "verdifor",
        "isPlaceholder": true,
        "layout": {
          "logo": {
            "x": 0.5,
            "y": 0.95,
            "width": 0.26
          },
          "name": {
            "x": 0.5,
            "y": 0.82,
            "size": 0.05,
            "align": "center",
            "maxWidth": 0.84
          },
          "fontId": "cairo",
          "palette": [
            "#FFFFFF",
            "#E7C873",
            "#7FD4F5",
            "#B8C6E0",
            "#0B1A33"
          ],
          "jobTitle": {
            "x": 0.5,
            "y": 0.89,
            "size": 0.023,
            "align": "center",
            "maxWidth": 0.84
          },
          "safeArea": {
            "h": 0.18,
            "w": 0.84,
            "x": 0.08,
            "y": 0.77
          },
          "brandMark": {
            "h": 0.105,
            "w": 0.32,
            "x": 0.02,
            "y": 0.015
          },
          "defaultColor": "#FFFFFF"
        }
      }
    ]
  }
};
