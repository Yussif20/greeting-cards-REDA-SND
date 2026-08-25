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
      layers: "Layers",
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
    layer: {
      name: "Name",
      jobTitle: "Job title",
      logo: "Brand logo",
      moveUp: "Move up",
      moveDown: "Move down",
      show: "Show",
      hide: "Hide",
      lock: "Lock",
      unlock: "Unlock",
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
};
