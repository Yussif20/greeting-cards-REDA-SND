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

  designs: {
    heading: "Choose a design",
    chooseADesign: "Choose a design",
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
      viewSite: "View site",
    },

    status: {
      published: "Live",
      draft: "Draft",
      archived: "Archived",
    },

    occasions: {
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
      confirmDelete: "Delete this draft permanently? It was never published, so no link can break.",
      title: "Cards",
      subtitle: "Artwork for every occasion and season.",
      occasion: "Occasion",
      allOccasions: "All occasions",
      empty: "No cards for this occasion yet.",
      placeholder: "Sample artwork",
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
  },
};
