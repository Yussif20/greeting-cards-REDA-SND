// Headless check of the rendering contract.
//
// The central claim of the redesign is that the live preview and the exported
// file agree because both go through renderCard with geometry stored as
// fractions of the native image. This exercises that directly by rendering the
// same scene at preview scale and at export scale and comparing the results.
//
// Run with: node scripts/verify-render.mjs

// --- Minimal browser shims -------------------------------------------------
const requestedFaces = [];
globalThis.document = {
  fonts: {
    ready: Promise.resolve(),
    load: (spec) => {
      requestedFaces.push(spec);
      return Promise.resolve();
    },
  },
};

/** Records every draw call and applies the transform stack, like a real ctx. */
function makeCtx() {
  const calls = [];
  let m = { a: 1, d: 1, e: 0, f: 0 }; // scale x, scale y, translate x, translate y
  const stack = [];

  return {
    calls,
    font: "",
    fillStyle: "",
    textAlign: "center",
    textBaseline: "middle",
    direction: "ltr",
    save() {
      stack.push({ ...m });
    },
    restore() {
      m = stack.pop() ?? m;
    },
    scale(x, y) {
      m = { ...m, a: m.a * x, d: m.d * y };
    },
    translate(x, y) {
      m = { ...m, e: m.e + x * m.a, f: m.f + y * m.d };
    },
    rotate() {},
    clearRect() {},
    fillRect() {},
    drawImage(_img, x, y, w, h) {
      calls.push({ op: "image", x: m.e + x * m.a, y: m.f + y * m.d, w: w * m.a, h: h * m.d });
    },
    // Deterministic stand-in: real metrics need a font engine.
    measureText(text) {
      const px = parseFloat(/(\d+(?:\.\d+)?)px/.exec(this.font)?.[1] ?? "10");
      return { width: text.length * px * 0.5 };
    },
    fillText(text, x, y) {
      calls.push({
        op: "text",
        text,
        x: m.e + x * m.a,
        y: m.f + y * m.d,
        font: this.font,
        fill: this.fillStyle,
        dir: this.direction,
      });
    },
  };
}

const { renderCard, detectDir, wrapText } = await import("../src/lib/renderCard.js");
const { getDesigns } = await import("../src/data/designs/index.js");
const { buildLayers } = await import("../src/hooks/useEditorState.js");

let failures = 0;
const check = (label, cond, detail = "") => {
  if (cond) {
    console.log(`  PASS  ${label}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${label}${detail ? ` -- ${detail}` : ""}`);
  }
};

// --- mutation acknowledgement ---------------------------------------------
//
// The shared write helper only needs to know whether a row was affected. It
// must not name a table-specific primary key: occasions use `slug`, while the
// other admin resources use `id`.

{
  const { createClient } = await import("@supabase/supabase-js");
  const { mutate } = await import("../src/admin/lib/mutate.js");
  let requestedUrl = "";
  const fetch = async (url) => {
    requestedUrl = String(url);
    return new Response(JSON.stringify([{ slug: "eid-al-fitr" }]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  const client = createClient("https://example.supabase.co", "test-key", {
    global: { fetch },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  await mutate(
    client.from("occasions").update({ brand_covers: {} }).eq("slug", "eid-al-fitr"),
    "updateOccasion",
  );
  check(
    "write acknowledgement does not assume every table has an id column",
    new URL(requestedUrl).searchParams.get("select") === "*",
    requestedUrl,
  );
}

// Taken by position, not by id: design ids carry the season they belong to,
// so pinning a literal id here would break the day a new season is added.
const design = getDesigns("eid-al-adha")[0];
const layers = buildLayers(design, {
  name: "فيصل الغامدي",
  jobTitle: "Marketing & Communication Manager",
});

console.log("\nrenderCard: preview vs export");

// Preview at a typical displayed width, export at native size.
const previewWidth = 520;
const previewScale = previewWidth / design.width;

const preview = makeCtx();
await renderCard(preview, { design, image: { width: 2000, height: 2000 }, layers }, { scale: previewScale });

const exported = makeCtx();
await renderCard(exported, { design, image: { width: 2000, height: 2000 }, layers }, { scale: 1 });

const pText = preview.calls.filter((c) => c.op === "text");
const eText = exported.calls.filter((c) => c.op === "text");

check("both render the same number of text runs", pText.length === eText.length,
  `${pText.length} vs ${eText.length}`);

// The whole point: positions must be identical once scale is divided out.
let maxDrift = 0;
pText.forEach((p, i) => {
  const e = eText[i];
  if (!e) return;
  maxDrift = Math.max(
    maxDrift,
    Math.abs(p.x / previewScale - e.x),
    Math.abs(p.y / previewScale - e.y),
  );
});
check("text positions agree after removing scale", maxDrift < 0.5, `max drift ${maxDrift.toFixed(4)}px`);

// Name must land where the design says, in native pixels.
const expectedX = design.layout.name.x * design.width;
const expectedY = design.layout.name.y * design.height;
const name = eText[0];
check(
  "name anchored at the design's declared position",
  Math.abs(name.x - expectedX) < 0.5 && Math.abs(name.y - expectedY) < 0.5,
  `got (${name.x}, ${name.y}), expected (${expectedX}, ${expectedY})`,
);

// Font size is a fraction of native height, so it must scale with the output.
const px = (c) => parseFloat(/(\d+(?:\.\d+)?)px/.exec(c.font)[1]);
check(
  "font size scales with output size",
  Math.abs(px(eText[0]) - design.layout.name.size * design.height) < 0.5,
  `${px(eText[0])}px`,
);

check("background covers the full native canvas",
  exported.calls.some((c) => c.op === "image" && c.w === design.width && c.h === design.height));

console.log("\nbidi handling");
check("Arabic name gets rtl direction", eText[0].dir === "rtl", eText[0].dir);
check("Latin job title gets ltr direction", eText[1]?.dir === "ltr", eText[1]?.dir);
check("mixed strings resolve to rtl", detectDir("Faisal الغامدي") === "rtl");
check("digits alone stay ltr", detectDir("96") === "ltr");

console.log("\nempty layers");
const blank = makeCtx();
await renderCard(
  blank,
  { design, image: { width: 2000, height: 2000 }, layers: buildLayers(design, { name: "", jobTitle: "" }) },
  { scale: 1 },
);
check("no text drawn when fields are empty", blank.calls.filter((c) => c.op === "text").length === 0);
check("logo layer hidden while brand is baked into artwork",
  blank.calls.filter((c) => c.op === "image").length === 1);

console.log("\nstaleness guard");
const stale = makeCtx();
await renderCard(stale, { design, image: { width: 2000, height: 2000 }, layers }, { scale: 1, isStale: () => true });
check("a superseded frame paints nothing", stale.calls.length === 0);

console.log("\ntext wrapping");
const wrapCtx = makeCtx();
wrapCtx.font = "700 100px test";
const long = wrapText(wrapCtx, "one two three four five six seven eight", 500);
check("long text wraps to multiple lines", long.length > 1, `${long.length} lines`);
check("short text stays on one line", wrapText(wrapCtx, "short", 5000).length === 1);

console.log("\nfont pairing");
const { BUILT_IN, allFonts, LATIN, FALLBACK_FAMILY, getFont, DEFAULT_FONT_ID } = await import(
  "../src/data/fonts.js"
);

check(
  "the card font stack names both scripts' families",
  eText[0].font.includes(LATIN) && eText[0].font.includes("Cairo"),
  eText[0].font,
);
check(
  "Latin family is listed first, so it wins for Latin glyphs",
  eText[0].font.indexOf(LATIN) < eText[0].font.indexOf("Cairo"),
);
check(
  "every family in the stack was actually requested",
  getFont("cairo").loadFamilies.every((f) => requestedFaces.some((r) => r.includes(f))),
);
check(
  "every bundled font pairs an Arabic face with the Latin one",
  BUILT_IN.every((f) => f.loadFamilies.length === 2 && f.loadFamilies[0] === LATIN),
);

// The invariant that has to hold for EVERY font, bundled or uploaded: the stack
// ends in a generic, and every family named in it is one ensureFont will load.
// A family in the stack but not in loadFamilies is the classic silent
// substitution -- the preview is right and the download is not.
check(
  "no font entry can silently fall back to a generic serif",
  allFonts().every((f) => f.stack.trim().endsWith("sans-serif")),
);
check(
  "every family in a stack is one that gets loaded",
  allFonts().every((f) => f.loadFamilies.every((fam) => f.stack.includes(`"${fam}"`))),
);

// --- uploaded fonts --------------------------------------------------------
//
// Asserted against a hand-built row rather than against whatever the registry
// happens to hold, so these hold on a project with no uploads -- which is every
// project until an admin makes one.

const { uploadedFamily, formatForPath, validateFontFile, FontError, fontExtension } =
  await import("../src/lib/fontFile.js");

check(
  "an uploaded family is derived from the id, so it cannot shadow a bundled one",
  uploadedFamily("cairo") !== "Cairo" && uploadedFamily("cairo").includes("cairo"),
  uploadedFamily("cairo"),
);

// The format() hint is not cosmetic: a browser may skip a source whose declared
// format it does not recognise, and it does so silently -- the family stays
// unloaded and the card renders in the fallback with nothing logged.
check(
  "the format hint follows the stored extension",
  formatForPath("/media/fonts/x/regular.ttf") === "truetype" &&
    formatForPath("/media/fonts/x/bold.woff2") === "woff2" &&
    formatForPath("/media/fonts/x/r.otf") === "opentype",
);
check(
  "a path with no usable extension falls back to the format every browser reads",
  formatForPath("/media/fonts/x/regular") === "woff2",
);

check(
  "fonts are judged by extension, never by the browser's idea of the type",
  fontExtension("IBMPlexSansArabic-Medium.TTF") === "ttf",
);

// file.type is "" for a .ttf on plenty of platforms, so validation that trusted
// it would refuse the most common upload there is.
{
  const accepted = validateFontFile({ name: "IBMPlexSansArabic-Medium.ttf", size: 200_000, type: "" });
  check(
    "a .ttf with no reported MIME type is accepted, and declares its own",
    accepted.format === "truetype" && accepted.type === "font/ttf",
  );

  let refused = null;
  try {
    validateFontFile({ name: "artwork.png", size: 1000, type: "image/png" });
  } catch (err) {
    refused = err;
  }
  check(
    "something that is not a font is refused with a code the interface can translate",
    refused instanceof FontError && refused.code === "badFontType",
  );
}

// Declaring the type is not the same as sending it. supabase-js posts a Blob as
// multipart/form-data and the part carries `blob.type`, so `options.contentType`
// never leaves the browser -- and a .otf picked on Windows arrives with
// file.type === "", which reaches the bucket as application/octet-stream.
{
  const { uploadBody } = await import("../src/admin/lib/uploadBody.js");

  const picked = new File([new Uint8Array(16)], "DINNextArabic-Regular.otf");
  check(
    "what is actually uploaded carries the declared type, not octet-stream",
    uploadBody(picked, validateFontFile(picked).type).type === "font/otf",
    picked.type || "(none)",
  );

  // The bytes are copied to retype a blob, so a blob that is already right has
  // to pass straight through -- card masters are megabytes and go this way.
  const master = new Blob([new Uint8Array(4)], { type: "image/webp" });
  check(
    "a blob already carrying its type is passed through uncopied",
    uploadBody(master, "image/webp") === master,
  );
}

// A design's layout stores fontId as plain text inside jsonb with no foreign
// key, so unpublishing a font has to degrade its cards rather than break them.
check(
  "an unknown font id falls back to the default rather than throwing",
  getFont("deleted-font-id").id === DEFAULT_FONT_ID,
);
check(
  "the fallback family covers both scripts, so either half can be missing",
  BUILT_IN.some((f) => f.id === FALLBACK_FAMILY.toLowerCase()),
  FALLBACK_FAMILY,
);

console.log("\nalignment") ;
const { layerBox, alignLayer } = await import("../src/lib/layers.js");
const { brandMark } = design.layout;

const measure = makeCtx();
const nameLayer = layers.find((l) => l.id === "name");
const centred = layerBox(measure, nameLayer, design.width, design.height);

// Aligning must move the text, not just relabel it, and the selection box has
// to follow -- the anchor is the box centre only while the text is centred.
const leftLayer = { ...nameLayer, ...alignLayer(nameLayer, design.layout.safeArea, "left") };
const rightLayer = { ...nameLayer, ...alignLayer(nameLayer, design.layout.safeArea, "right") };
const leftBox = layerBox(measure, leftLayer, design.width, design.height);
const rightBox = layerBox(measure, rightLayer, design.width, design.height);

check(
  "left align puts the box's left edge on the safe area's left edge",
  Math.abs(leftBox.cx - leftBox.w / 2 - design.layout.safeArea.x) < 0.001,
  `${(leftBox.cx - leftBox.w / 2).toFixed(4)} vs ${design.layout.safeArea.x}`,
);
check(
  "right align puts the box's right edge on the safe area's right edge",
  Math.abs(
    rightBox.cx + rightBox.w / 2 - (design.layout.safeArea.x + design.layout.safeArea.w),
  ) < 0.001,
);
check(
  "a centred box is still centred on its anchor",
  Math.abs(centred.cx - nameLayer.x) < 0.0001,
);
check("aligning left actually moves the box", Math.abs(leftBox.cx - centred.cx) > 0.001);

const { allOccasions } = await import("../src/data/occasions.js");
const { allSeasons } = await import("../src/data/years.js");
check(
  "every design declares the brand-lockup region the editor crops",
  Boolean(brandMark) &&
    allOccasions().every((o) =>
      getDesigns(o.slug).every((d) => {
        const m = d.layout.brandMark;
        return m && m.w > 0 && m.h > 0 && m.x + m.w <= 1 && m.y + m.h <= 1;
      }),
    ),
);

// Card numbers restart at 01 every season, so ids must carry the season to
// stay unique -- a collision would make getDesign() return the wrong artwork.
const ids = allOccasions().flatMap((o) => getDesigns(o.slug).map((d) => d.id));
check(
  "design ids are unique across every occasion and season",
  new Set(ids).size === ids.length,
  `${ids.length - new Set(ids).size} duplicate(s)`,
);

const seasons = new Set(allSeasons().map((y) => y.id));
check(
  "every design belongs to a season registered in src/data/years.js",
  allOccasions().every((o) => getDesigns(o.slug).every((d) => seasons.has(d.year))),
);

// --- layout round trip -----------------------------------------------------
//
// buildLayers() turns a layout into an editor scene; layoutFromScene() turns a
// scene back into a layout. /admin saves a card's default geometry through the
// second, so the two have to be exact inverses -- if one grows a field and the
// other does not, an admin's edit silently drops it and nothing complains.
// Asserting the round trip over every real design is what makes that drift
// fail here rather than in production.

const { layoutFromScene } = await import("../src/lib/layoutFromScene.js");
const { stableStringify } = await import("../src/lib/registry/serialize.js");

const sceneOf = (d) => ({
  layers: buildLayers(d, { name: "Sample", jobTitle: "Sample" }),
  color: d.layout.defaultColor,
  fontId: d.layout.fontId,
});

const drifted = allOccasions()
  .flatMap((o) => getDesigns(o.slug))
  .filter(
    (d) =>
      stableStringify(layoutFromScene(sceneOf(d), d.layout)) !== stableStringify(d.layout),
  );

check(
  "every layout survives buildLayers -> layoutFromScene unchanged",
  drifted.length === 0,
  drifted.length ? `${drifted.length} drifted, e.g. ${drifted[0].id}` : "",
);

// --- saved drafts vs a changed layout --------------------------------------
//
// A draft records where a customer dragged their name, and restoring that is
// the whole point of saving one. But an admin can now change a design's
// default layout, and a draft holding coordinates from the old one would
// quietly defeat that fix for precisely the people who use the card most.
//
// The rule: unchanged layout, restore everything; changed layout, keep what
// they typed and chose, take the new geometry.

const { buildInitialState } = await import("../src/hooks/useEditorState.js");
const { NAME_LAYER } = await import("../src/lib/layers.js");
const { layoutFingerprint } = await import("../src/lib/draft.js");

const draftDesign = getDesigns("eid-al-fitr")[0];
const movedName = { ...draftDesign.layout.name, y: draftDesign.layout.name.y + 0.05 };

const occasionDefault = buildInitialState({
  design: draftDesign,
  draft: null,
  defaultFontId: "tajawal",
});
check(
  "an occasion default font replaces the card default on first open",
  occasionDefault.fontId === "tajawal" &&
    occasionDefault.layers
      .filter((layer) => layer.type === "text")
      .every((layer) => layer.fontId === "tajawal"),
);

const savedDraft = (fingerprint) => ({
  layers: {
    [NAME_LAYER]: { text: "Ahmed", color: "#FF0000", y: 0.31, size: 0.09 },
  },
  color: "#FF0000",
  layout: fingerprint,
});

const nameOf = (state) => state.layers.find((l) => l.id === NAME_LAYER);

const draftFresh = nameOf(
  buildInitialState({
    design: draftDesign,
    draft: savedDraft(layoutFingerprint(draftDesign.layout)),
  }),
);
check("an unchanged layout restores the draft's position", draftFresh.y === 0.31 && draftFresh.size === 0.09);
check("an unchanged layout restores the draft's text", draftFresh.text === "Ahmed");

const draftStale = nameOf(
  buildInitialState({
    design: draftDesign,
    draft: savedDraft(layoutFingerprint({ ...draftDesign.layout, name: movedName })),
  }),
);
check(
  "a changed layout supersedes the draft's position",
  draftStale.y === draftDesign.layout.name.y && draftStale.size === draftDesign.layout.name.size,
  `y=${draftStale.y}`,
);
check("a changed layout still keeps what was typed", draftStale.text === "Ahmed");
check("a changed layout still keeps the chosen colour", draftStale.color === "#FF0000");

const draftLegacy = nameOf(buildInitialState({ design: draftDesign, draft: savedDraft(undefined) }));
check(
  "a draft saved before fingerprints existed is treated as stale",
  draftLegacy.y === draftDesign.layout.name.y && draftLegacy.text === "Ahmed",
);

const { defaultLayout } = await import("../src/admin/lib/layoutDefaults.js");
const uploadedLayout = defaultLayout([draftDesign], draftDesign.year, "amiri");
check(
  "a new card inherits geometry but uses its occasion's default font",
  uploadedLayout.fontId === "amiri" && uploadedLayout.name.y === draftDesign.layout.name.y,
);

// --- the brand picker's rows ------------------------------------------------
//
// The picker lists cards, not brands, because a company can have several
// designs for one occasion. Numbering only appears where it disambiguates,
// which is the part that is invisible until a season ships two cards for one
// company -- exactly when nobody is looking closely.

const { brandRows } = await import("../src/lib/brandRows.js");
const { BRANDS } = await import("../src/data/brands.js");

const rowsFor = (cards) => brandRows(cards, BRANDS);
const labels = (cards) => rowsFor(cards).filter((r) => !r.disabled).map((r) => r.label);

const single = labels([
  { id: "a", brand: "rhc", number: 1 },
  { id: "b", brand: "fhc", number: 2 },
]);
check(
  "one card per brand is not numbered",
  single.join("|") === "REDA Hazard Control|Fire & Hazard Control",
  single.join(", "),
);

const many = labels([
  { id: "x-09", brand: "rhc", number: 9 },
  { id: "x-02", brand: "fhc", number: 2 },
  { id: "x-01", brand: "rhc", number: 1 },
]);
check(
  "a brand with several cards is numbered from 1, in card order",
  many.join("|") === "REDA Hazard Control 1|REDA Hazard Control 2|Fire & Hazard Control",
  many.join(", "),
);

const ordered = rowsFor([
  { id: "x-09", brand: "rhc", number: 9 },
  { id: "x-01", brand: "rhc", number: 1 },
]);
check(
  "numbering follows the card number, not the input order",
  ordered[0].designId === "x-01" && ordered[1].designId === "x-09",
);

check(
  "a brand with no card stays in the roster, disabled",
  rowsFor([{ id: "a", brand: "rhc", number: 1 }]).some(
    (r) => r.brandId === "guard" && r.disabled && r.designId === null,
  ),
);

// Every enabled row must address a real card, or choosing it navigates nowhere.
const realCards = getDesigns("eid-al-fitr");
check(
  "every enabled row carries the id of a card that exists",
  rowsFor(realCards)
    .filter((r) => !r.disabled)
    .every((r) => realCards.some((d) => d.id === r.designId)),
);

// Deliberately a property of the code, not of the content. An earlier version
// asserted that today's artwork has one card per brand -- true when written,
// false the moment an admin uploaded a second card for one, and the suite then
// failed for a change that was entirely correct. A check that breaks when the
// client adds content is a check that will be deleted rather than believed.
const perBrand = new Map();
for (const d of realCards) perBrand.set(d.brand, (perBrand.get(d.brand) ?? 0) + 1);

check(
  "a row is numbered exactly when its brand has more than one card",
  rowsFor(realCards)
    .filter((r) => !r.disabled)
    .every((r) => / \d+$/.test(r.label) === perBrand.get(r.brandId) > 1),
  [...perBrand].map(([b, n]) => `${b}:${n}`).join(" "),
);

// --- the brand chooser, and reachability -----------------------------------
//
// The visitor now reaches a card through its brand: occasion, then company,
// then the card. That makes "which tile leads here" a property every card has
// to have, where before it had none -- a card the chooser does not list is one
// that only a direct link finds, and nothing in the interface would say so.
//
// These are properties of brandGroups, not of today's artwork. An earlier
// version of the brandRows suite asserted one card per brand, which was true
// when written and false the moment an admin uploaded a second; a check that
// breaks when the client does their job gets deleted rather than believed.

const { brandGroups, designsForBrand, OTHER_BRAND } = await import(
  "../src/lib/brandGroups.js"
);

const groupsFor = (cards) => brandGroups(cards, BRANDS);
const oneCard = [{ id: "a", brand: "rhc", number: 1 }];

check(
  "every brand in the roster gets a tile, with or without artwork",
  groupsFor(oneCard).filter((g) => g.id !== OTHER_BRAND).length === BRANDS.length,
);

check(
  "a brand with no card for this occasion is disabled rather than dropped",
  groupsFor(oneCard).some((g) => g.id === "guard" && g.disabled && g.cards.length === 0),
);

check(
  "there is no catch-all tile when every card matches a brand",
  groupsFor(oneCard).every((g) => g.id !== OTHER_BRAND),
);

// The reachability property itself. A null brand and a brand the roster no
// longer contains are the two ways a card can fall out of the chooser, and both
// have to land somewhere a page links to.
{
  const strays = [
    { id: "none", brand: null, number: 1 },
    { id: "stale", brand: "retired-co", number: 2 },
    { id: "real", brand: "rhc", number: 3 },
  ];
  const other = groupsFor(strays).find((g) => g.id === OTHER_BRAND);
  check(
    "cards with no brand, or a brand no longer in the roster, are still reachable",
    Boolean(other) && other.cards.map((d) => d.id).join(",") === "none,stale",
    other ? other.cards.map((d) => d.id).join(",") : "no catch-all group",
  );

  // What the tile promises and what the page opens have to be the same set, or
  // a tile reading "2 cards" leads to one.
  check(
    "the designs page resolves the same cards the tile counted",
    groupsFor(strays).every(
      (g) =>
        designsForBrand(strays, BRANDS, g.id)
          .map((d) => d.id)
          .join(",") === g.cards.map((d) => d.id).join(","),
    ),
  );
}

// Every real card appears under exactly one tile. Two would double-list it in
// the chooser; zero is the unreachable case above.
{
  const everyCard = allOccasions().flatMap((o) => getDesigns(o.slug));
  const listed = groupsFor(everyCard).flatMap((g) => g.cards.map((d) => d.id));
  check(
    "every published card is listed under exactly one brand tile",
    listed.length === everyCard.length && new Set(listed).size === everyCard.length,
    `${listed.length} listed of ${everyCard.length}`,
  );
}

// --- brand covers ----------------------------------------------------------
//
// Which picture a tile shows is now an admin decision with a fallback, and the
// fallback is the part that has to keep working: an occasion whose covers are
// half filled in must have no half-broken tiles, and an occasion published
// before covers existed carries no such key at all.
//
// Properties of coverFor, against hand-built groups -- the rule the two sections
// above state twice. The fixtures are group shapes rather than registry rows,
// because that is what the function consumes.

{
  const { coverFor } = await import("../src/lib/brandGroups.js");

  const withCards = { id: "rhc", name: "REDA Hazard Control", cards: [{ thumb: "/first.webp" }] };
  const noCards = { id: "guard", name: "REDA Guard", cards: [] };
  const covers = { rhc: { src: "/media/covers/x/rhc/u/cover.webp" } };

  check(
    "an uploaded cover wins over the brand's first card",
    coverFor(withCards, covers) === "/media/covers/x/rhc/u/cover.webp",
    coverFor(withCards, covers),
  );

  check(
    "a brand with no cover falls back to its first card",
    coverFor(withCards, {}) === "/first.webp",
    coverFor(withCards, {}),
  );

  // The pre-migration case. An occasion row written before 0007, and a snapshot
  // published before it, have no brandCovers at all -- and a deploy has to keep
  // serving on exactly that.
  check(
    "an occasion published before covers existed still shows the first card",
    coverFor(withCards, undefined) === "/first.webp",
    String(coverFor(withCards, undefined)),
  );

  check(
    "a brand with neither a cover nor a card has nothing to show",
    coverFor(noCards, covers) === null,
    String(coverFor(noCards, covers)),
  );

  // A cover on a company with no artwork is allowed, and the tile stays disabled
  // on the strength of `cards`. The picture is not what decides that.
  check(
    "a cover with no cards behind it is still shown",
    coverFor({ ...noCards, cards: [] }, { guard: { src: "/c.webp" } }) === "/c.webp",
  );

  // The catch-all tile is not a company, so nothing can be keyed to it.
  check(
    "the catch-all tile keeps showing its first stray card",
    coverFor({ id: OTHER_BRAND, cards: [{ thumb: "/stray.webp" }] }, covers) === "/stray.webp",
  );
}

// --- categories ------------------------------------------------------------
//
// A card's category is optional and stays optional, so its absence is never a
// failure here. What would be a failure is a card stamped with a category the
// registry does not carry: the chip row is built by intersecting the two, so
// such a card offers no chip that reaches it.

const { allCategories, categoriesIn } = await import("../src/data/categories.js");

{
  const known = new Set(allCategories().map((c) => c.id));
  const filed = allOccasions()
    .flatMap((o) => getDesigns(o.slug))
    .filter((d) => d.category);
  const dangling = filed.filter((d) => !known.has(d.category));

  check(
    "every category stamped on a card is one the registry carries",
    dangling.length === 0,
    dangling.length
      ? `${dangling.length}, e.g. ${dangling[0].id} -> ${dangling[0].category}`
      : `${known.size} categories, ${filed.length} cards filed`,
  );
}

check(
  "a chip is offered only for a category present in the grid below it",
  categoriesIn([{ category: null }, { category: "nothing-uses-this" }]).length === 0,
);

// --- duplicating a card ----------------------------------------------------
//
// A season is one template rendered once per company, so a duplicate has to be
// identical in every field that identifies the card and different only in the
// two that distinguish siblings. Asserted against the pure function rather than
// through the panel, which needs Supabase and a canvas -- the same reason
// brandGroups is its own module.

const { duplicateInput, nextFreeBrand, aspectDiffers } = await import(
  "../src/admin/lib/duplicateInput.js"
);

{
  const source = {
    id: "x-2025-2026-01",
    number: 1,
    occasion: "eid-al-fitr",
    year: "2025-2026",
    style: "traditional",
    brand: "rhc",
    category: "employees",
    brandBakedIn: true,
    isPlaceholder: false,
    src: "/media/a/master.jpg",
    thumb: "/media/a/thumb.webp",
    width: 2000,
    height: 2000,
    layout: { safeArea: { x: 0.08, y: 0.72, w: 0.84, h: 0.2 }, palette: ["#FFF"] },
  };

  const copy = duplicateInput(source, { brand: "fhc", category: "clients" });

  check(
    "a duplicate carries over every field that identifies the card",
    ["occasion", "year", "style", "brandBakedIn", "isPlaceholder"].every(
      (k) => copy[k] === source[k],
    ),
  );

  check(
    "a duplicate takes the brand and category it was given",
    copy.brand === "fhc" && copy.category === "clients",
  );

  // createDesign allocates the number per (occasion, season), builds the id from
  // it, and retries on the unique-constraint collision. Setting either here
  // would defeat all three.
  check(
    "a duplicate names neither an id nor a number",
    copy.id === undefined && copy.number === undefined,
  );

  // A shared nested object would let dragging the copy's safe area move the
  // original's -- a corruption that survives to the next publish with nothing
  // to show where it came from.
  copy.layout.safeArea.x = 0.5;
  check(
    "the copied layout is deep, so editing the copy cannot move the original",
    source.layout.safeArea.x === 0.08,
  );

  check(
    "with no new artwork the copy points at the source's image",
    copy.src === source.src &&
      copy.thumb === source.thumb &&
      copy.width === source.width &&
      copy.height === source.height,
  );

  const withArt = duplicateInput(source, {
    brand: "fhc",
    image: { src: "/media/b/m.jpg", thumb: "/media/b/t.webp", width: 1600, height: 2000 },
  });
  check(
    "with new artwork all four image fields come from the upload",
    withArt.src === "/media/b/m.jpg" &&
      withArt.thumb === "/media/b/t.webp" &&
      withArt.width === 1600 &&
      withArt.height === 2000,
  );

  // The layout editor copies what is on screen, not what the row holds.
  const overridden = duplicateInput(source, { brand: "fhc", layout: { palette: ["#000"] } });
  check(
    "an explicit layout overrides the source's",
    overridden.layout.palette[0] === "#000" && overridden.layout.safeArea === undefined,
  );

  // The default brand is the next gap, because filling out the set is the whole
  // point -- and the source's own brand is the one value guaranteed to be taken.
  const oneCard = [{ brand: "rhc", year: "2025-2026" }];
  check(
    "the default brand is the first company with no card this season",
    nextFreeBrand(oneCard, BRANDS, source) === "fhc",
  );

  check(
    "a brand busy in another season is still offered as the default",
    nextFreeBrand([{ brand: "fhc", year: "2024-2025" }], BRANDS, source) === "rhc",
  );

  check(
    "once every company has a card the default falls back to the source's brand",
    nextFreeBrand(
      BRANDS.map((b) => ({ brand: b.id, year: "2025-2026" })),
      BRANDS,
      source,
    ) === "rhc",
  );

  // Fractions survive a change of pixel size but not of proportion: `size` is a
  // fraction of height while `maxWidth` is a fraction of width.
  check(
    "a resize of the same shape is not reported as a mismatch",
    !aspectDiffers({ width: 1000, height: 1000 }, { width: 2000, height: 2000 }),
  );
  check(
    "a change of proportion is reported",
    aspectDiffers({ width: 1600, height: 2000 }, { width: 2000, height: 2000 }),
  );
  check(
    "reusing the source's image is never reported as a mismatch",
    !aspectDiffers(undefined, { width: 2000, height: 2000 }),
  );
}

console.log(failures === 0 ? "\nAll checks passed.\n" : `\n${failures} check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
