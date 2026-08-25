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
const { getDesign } = await import("../src/data/designs/index.js");
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

const design = getDesign("eid-al-adha", "eid-al-adha-01");
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
const { FONTS, LATIN, getFont } = await import("../src/data/fonts.js");

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
  "every offered font pairs an Arabic face with the Latin one",
  FONTS.every((f) => f.loadFamilies.length === 2 && f.loadFamilies[0] === LATIN),
);
check(
  "no font entry can silently fall back to a generic serif",
  FONTS.every((f) => f.stack.trim().endsWith("sans-serif")),
);

console.log(failures === 0 ? "\nAll checks passed.\n" : `\n${failures} check(s) failed.\n`);
process.exit(failures === 0 ? 0 : 1);
