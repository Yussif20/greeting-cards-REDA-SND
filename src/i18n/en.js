// UI chrome only. Occasion and design copy lives in src/data/*, resolved by
// src/lib/localize.js -- they are domain entities, not interface strings.

export default {
  common: {
    appName: "REDA Cards",
    tagline: "Celebrate Every Occasion",
    taglineAr: "بطاقات معايدة رسمية لمختلف المناسبات على مدار العام",
    breadcrumb: { home: "Home" },
    language: "Language",
    theme: { light: "Light mode", dark: "Dark mode", label: "Theme" },
    loading: "Loading",
    dismiss: "Dismiss",
  },

  home: {
    title: "REDA Cards",
    subtitle: "Celebrate Every Occasion",
    intro: "Official greeting cards for every occasion, all year round.",
    openOccasion: "Open {{name}}",
  },

  brands: {
    chooseABrand: "Choose a company",
    open: "Open {{name}}",
    // Not a plural key. Arabic has six plural forms and every other count
    // string in this file is written flat; adding one exception here would be
    // a half-migration rather than an improvement.
    cardCount: "{{count}} cards",
    empty: "No cards yet",
    noArtwork: "No artwork yet",
    // The catch-all tile: cards carrying no brand, or one no longer in the
    // roster. It exists so such a card is still reachable from a page rather
    // than only from its own link.
    other: "Other cards",
    none: "No cards for this occasion yet.",
    noCards: "This company has no cards for this season.",
    backToBrands: "Choose another company",
  },

  designs: {
    heading: "Choose a design",
    chooseADesign: "Choose a design",
    category: "Category",
    allCategories: "All",
    year: "Year",
    loadMore: "Load More Designs",
    selected: "Selected",
    design: "Design",
    empty: "No designs match this filter.",
    clearFilter: "Show all designs",
    sampleArtwork: "Sample artwork",
    sampleNotice:
      "Artwork for this occasion is still in production. These cards are borrowed samples and carry another occasion's greeting.",
    style: {
      all: "All",
      modern: "Modern",
      traditional: "Traditional",
      minimal: "Minimal",
      elegant: "Elegant",
    },
  },

  editor: {
    title: "Customize Your Card",
    subtitle: "Personalize your card and make it yours",
    optional: "Optional",
    preview: "Card preview",
    field: {
      name: "Name",
      jobTitle: "Job Title",
      brand: "Brand",
      font: "Font",
      textColor: "Text Color",
    },
    placeholder: {
      name: "Enter your name",
      jobTitle: "Enter your job title",
    },
    fontHelp:
      "The font applies to both your name and job title. Every option supports Arabic and Latin text.",
    brandUnavailable: "No card for this brand in this occasion",
    tool: {
      move: "Move",
      size: "Size",
      align: "Align",
    },
    align: {
      left: "Left",
      center: "Center",
      right: "Right",
      top: "Top",
      middle: "Middle",
      bottom: "Bottom",
      distribute: "Distribute evenly",
    },
    size: { label: "Size", nudge: "Use arrow keys to nudge the selected layer" },
    action: {
      reset: "Reset",
      saveDraft: "Save Draft",
      download: "Download",
      share: "Share",
    },
    draftSaved: "Draft saved",
    draftRestored: "Draft restored",
    discardDraft: "Discard",
    resetDone: "Card reset",
    enterNameFirst: "Enter a name first",
    selectLayerHint: "Click the card to select and move text",
  },

  errors: {
    notFoundTitle: "Page not found",
    notFoundBody: "That page does not exist. Let us take you back.",
    backHome: "Back to occasions",
    imageLoad: "Could not load this design. Please pick another.",
    download: "Could not download the card. Please try again.",
    share: "Could not share the card. Please try again.",
    unknownOccasion: "We could not find that occasion.",
  },

  footer: {
    tagline: "معاً في كل مناسبة",
  },

  admin: {
    title: "REDA Cards Admin",
    loading: "Loading…",
    retry: "Try again",

    auth: {
      subtitle: "Sign in to manage occasions and cards.",
      email: "Email",
      password: "Password",
      signIn: "Sign in",
      signOut: "Sign out",
      invalid: "That email and password did not match. Please try again.",
      notAdminTitle: "This account is not an administrator",
      notAdminBody:
        "You are signed in, but this account has not been granted admin access. Ask whoever set up the site to add you.",
      unconfiguredTitle: "Admin is not configured",
      unconfiguredBody:
        "VITE_SUPABASE_URL and the publishable key are missing from this build. See .env.example.",
    },

    nav: {
      label: "Admin sections",
      occasions: "Occasions",
      designs: "Cards",
      categories: "Categories",
      fonts: "Fonts",
      seasons: "Seasons",
      viewSite: "View site",
    },

    status: {
      published: "Live",
      draft: "Draft",
      archived: "Archived",
    },

    occasions: {
      delete: "Delete",
      deleted: "Occasion deleted.",
      confirmDelete: "Delete this occasion permanently? It was never published, so no link can break.",
      confirmDeletePublished:
        "This occasion has been public. Deleting it permanently means any link shared to it will stop working. Delete anyway?",
      hasDesigns:
        "This occasion still has {{count}} cards. Delete or move them first — removing it now would take their artwork with it.",
      add: "Add occasion",
      edit: "Edit",
      moveUp: "Move up",
      moveDown: "Move down",
      title: "Occasions",
      subtitle: "Everything the site can show, including what is not live yet.",
      empty: "No occasions yet.",
      hidden: "Hidden from the home page",
      designCount: "{{count}} cards",
      draftCount: "{{count}} not live",
    },

    designs: {
      add: "Add card",
      layout: "Layout",
      publish: "Publish",
      archive: "Unpublish",
      delete: "Delete",
      publishedToast: "That card is live.",
      archived: "That card is no longer public.",
      deleted: "Draft deleted.",
      confirmDeletePublished:
        "This card has been public. Deleting it permanently means any link shared to it will stop working. Delete anyway?",
      confirmDelete: "Delete this draft permanently? It was never published, so no link can break.",
      title: "Cards",
      subtitle: "Artwork for every occasion and season.",
      occasion: "Occasion",
      allOccasions: "All occasions",
      empty: "No cards for this occasion yet.",
      placeholder: "Sample artwork",
      category: "Category",
      noCategory: "No category",
      categorySaved: "Category saved.",
    },

    errors: {
      loadFailed: "Could not load that from the database.",
    },

    upload: {
      title: "Add a card",
      subtitle: "Upload the artwork, then place the name on it.",
      occasion: "Occasion",
      season: "Season",
      brand: "Brand",
      category: "Category",
      noCategory: "No category",
      style: "Style",
      choose: "Choose an image, or drop one here",
      hint: "JPEG, PNG or WebP",
      cancel: "Cancel",
      note: "The card is saved as a draft. Nobody sees it until you publish it.",
      busy: {
        processing: "Resizing the artwork…",
        uploading: "Uploading…",
        saving: "Saving…",
      },
      errors: {
        badType: "That file is not a JPEG, PNG or WebP.",
        tooLarge: "That file is too large. Keep it under 40 MB.",
        tooManyPixels: "That image has too many pixels to process in the browser.",
        decodeFailed: "That image could not be read.",
        encodeFailed: "The browser could not encode the resized image.",
        unsupportedFormat: "This browser cannot write WebP thumbnails.",
        blankCanvas: "The browser ran out of memory and produced a blank image. Try a smaller file.",
      },
    },

    layout: {
      palette: "Text colours",
      paletteHint:
        "What a customer can choose from. The ringed swatch is the default.",
      swatch: "Colour {{colour}}",
      addSwatch: "Add a colour",
      removeSwatch: "Remove {{colour}}",
      regions: "Safe area and brand mark",
      regionsHint:
        "The safe area is what the align tools work against. The brand mark is the region cropped out to preview a logo.",
      safeArea: "Safe area",
      brandMark: "Brand mark",
      title: "Place the text",
      save: "Save layout",
      saveAndPublish: "Save and publish",
      saved: "Layout saved.",
      published: "Saved and published.",
      sampleName: "Sample name",
      sampleTitle: "Sample job title",
      sampleHint:
        "Sample text only — it is never saved. Use a long name to check it fits.",
      showLogo: "Show the logo placeholder",
    },

    occasion: {
      newTitle: "New occasion",
      editTitle: "Edit occasion",
      subtitle: "How the tile looks, and what it is called.",
      create: "Create",
      save: "Save",
      slug: "Address",
      slugHint: "The card pages will live at /{{slug}}. It cannot be changed later.",
      slugLocked:
        "Fixed once created: every card id contains it, and shared links depend on it.",
      title: "Name",
      shortTitle: "Short name",
      tagline: "Tagline",
      hero: "Tile photograph",
      heroAlt: "Photograph description",
      focalX: "Horizontal focus",
      focalY: "Vertical focus",
      focalHint: "Which part of the photograph stays visible when the tile is cropped.",
      brandCovers: "Company pictures",
      brandCoversHint:
        "The picture that stands for each company on this occasion's page. Without one, that company's first card is shown.",
      coverFallback: "Currently showing this company's first card.",
      coverChoose: "Choose a picture for {{name}}",
      coverReplace: "Replace {{name}}'s picture",
      coverRemove: "Remove",
      icon: "Mark",
      iconSearch: "Search marks",
      iconNone: "No marks match that.",
      iconHandDrawn: "This occasion uses its own hand-drawn mark ({{name}}).",
      iconGroup: {
        celebration: "Celebration",
        sky: "Sky",
        heritage: "Heritage",
        nature: "Nature",
        journey: "Journey",
        other: "Other",
      },
      accent: { light: "Accent (light)", dark: "Accent (dark)" },
      accentHint:
        "The rest of the palette is worked out from these two, including the fade behind the title.",
      preview: "Preview",
      previewEmpty: "Add a photograph to see the tile.",
      reordered: "Order saved.",
      published: "That occasion is live.",
      archived: "That occasion is no longer public.",
    },
    seasons: {
      title: "Seasons",
      subtitle: "Each year of artwork, kept rather than replaced.",
      add: "Add season",
      create: "Create",
      id: "Season",
      idHint: "Two years, like 2026-2027. It cannot be changed later.",
      labelEn: "Label (English)",
      labelAr: "Label (Arabic)",
      empty: "No seasons yet.",
      cardCount: "{{count}} cards",
      created: "Season created as a draft.",
      published: "That season is live.",
      archived: "That season is no longer public.",
      deleted: "Season deleted.",
      confirmDelete: "Delete this season permanently?",
      hasDesigns:
        "This season still has {{count}} cards. Delete or move them first — removing it now would take their artwork with it.",
    },

    duplicate: {
      action: "Duplicate",
      title: "Duplicate this card",
      brand: "Brand",
      category: "Category",
      noCategory: "No category",
      newArtwork: "Drop the new artwork here",
      keepImage: "Or leave it empty to reuse the same image",
      clearFile: "Remove",
      create: "Duplicate",
      cancel: "Cancel",
      created: "Created {{id}} as a draft.",
      // A layout is stored in fractions, which survive a change of pixel size
      // but not a change of proportion -- see aspectDiffers in
      // src/admin/lib/duplicateInput.js.
      aspectWarning: "The new artwork is a different shape, so check where the text landed.",
      hint: "The copy keeps this card's layout, style, occasion and season, and is saved as a draft. The brand mark region is a crop of this artwork — re-drag it if the new design places its logo elsewhere.",
    },

    fonts: {
      title: "Fonts",
      subtitle: "Typefaces the card editor offers, on top of the four built in.",
      add: "Add font",
      create: "Upload",
      cancel: "Cancel",
      save: "Save",
      edit: "Rename",
      id: "Address",
      idHint: "Stored on every card that uses this font. It cannot be changed later.",
      labelEn: "Name (English)",
      labelAr: "Name (Arabic)",
      regular: "Regular",
      bold: "Bold",
      required: "required",
      optional: "optional",
      dropFile: "Drop the font file here",
      fileHint: "TTF, OTF, WOFF or WOFF2",
      clearFile: "Remove",
      addBold: "Add bold",
      boldAdded: "Bold file added.",
      oneWeight: "One weight",
      twoWeights: "Regular and bold",
      moveUp: "Move up",
      moveDown: "Move down",
      empty: "No uploaded fonts yet. The four built-in ones are always available.",
      created: "Font uploaded as a draft.",
      saved: "Font renamed.",
      published: "That font is live.",
      archived: "That font is no longer public.",
      deleted: "Font deleted.",
      reordered: "Order saved.",
      // No count of affected cards: layout.fontId is plain text with no foreign
      // key, and an unknown id falls back to Cairo. Nothing breaks.
      confirmDelete:
        "Delete this font permanently? Any card still set to it falls back to Cairo.",
      hint: "The regular file is required; add a bold one and card names render genuinely heavier, otherwise the whole card uses the one weight. A bold is never faked. Whatever the font does not cover — Latin in an Arabic-only face, or the reverse — falls through to Cairo. WOFF2 is about half the size of the same TTF.",
      busy: {
        uploading: "Uploading…",
        saving: "Saving…",
      },
      errors: {
        badFontType: "That is not a font file. Use TTF, OTF, WOFF or WOFF2.",
        fontTooLarge: "That font file is too large. Keep it under 8 MB.",
        regularRequired: "Add the regular font file first.",
      },
    },

    categories: {
      title: "Categories",
      subtitle: "What a card is for — employees, clients, whatever you need next.",
      add: "Add category",
      create: "Create",
      id: "Address",
      idHint: "Used in the link as ?category=. It cannot be changed later.",
      labelEn: "Name (English)",
      labelAr: "Name (Arabic)",
      edit: "Rename",
      save: "Save",
      cancel: "Cancel",
      moveUp: "Move up",
      moveDown: "Move down",
      empty: "No categories yet. Cards without one still appear under “All”.",
      cardCount: "{{count}} cards",
      created: "Category created as a draft.",
      saved: "Category renamed.",
      published: "That category is live.",
      archived: "That category is no longer public.",
      deleted: "Category deleted.",
      reordered: "Order saved.",
      confirmDelete: "Delete this category permanently? It was never published, so no link can break.",
      // Deleting does not refuse when cards are filed under it -- it un-files
      // them -- so the confirmation has to say so rather than the interface
      // quietly doing it.
      confirmDeleteWithCards:
        "{{count}} cards are filed under this category. Deleting it leaves them with no category; the artwork is untouched. Delete anyway?",
      hint: "Cards can be filed under one of these, or none. A category only reaches the site once it is published and a card is using it.",
    },
  },
};
