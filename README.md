# REDA Cards

Personalised corporate greeting cards for REDA, in Arabic and English, for six
occasions across the year.

Pick an occasion, pick a design, add a name and job title, then download the
card as a full-resolution image.

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
npm run preview   # serve the build -- exercises the real SPA fallback
npm run lint
npm run assets    # regenerate optimised images (see "Artwork" below)
```

## How it is put together

- **React 19 + Vite 6**, plain JSX, no TypeScript.
- **Tailwind CSS v4** via `@tailwindcss/vite`. There is no `tailwind.config.js` —
  configuration is CSS-first in `src/index.css`.
- **react-router 7**, with occasion and design in the URL.
- **i18next**, Arabic and English, with direction handled on `<html>`.
- Cards are drawn with the **2D canvas API**. No html2canvas, no image libraries.

```
src/
  data/      the registries: occasions, designs, brands, fonts
  lib/       canvas rendering, layer geometry, export, drafts
  hooks/     editor state, pointer interaction, URL params
  i18n/      UI strings (en/ar)
  components/  layout · brand · ui · occasions · designs · editor
  pages/     OccasionsPage · DesignsPage · EditorPage · NotFoundPage
```

### Typography

**Cairo** sets the Arabic, **Space Grotesk** the Latin, in both the interface
and the cards.

Space Grotesk has no Arabic coverage, so Arabic falls through to Cairo per
glyph on its own. That needs no per-script CSS and behaves identically inside
`<canvas>`, since `ctx.font` accepts the same family list — which is why a name
in Arabic and a job title in English both render correctly from a single font
choice.

Every entry in `src/data/fonts.js` is therefore a *pairing*, and its
`loadFamilies` lists both faces: `document.fonts.load()` takes one family at a
time, and an unloaded face is silently substituted on the canvas — the usual
cause of "the downloaded card has the wrong font".

Fonts are self-hosted via `@fontsource`. Note the family registered by the
variable package is `Space Grotesk Variable`, not `Space Grotesk`.

### The home page fills one viewport

On a desktop-sized screen the home page is exactly `100vh` — no scrolling. The
flex column runs `App` → `main` → `PageShell` → the tile grid, which takes
whatever height the hero and chrome leave and splits it between two rows. Tiles
therefore size themselves to the screen rather than imposing a fixed aspect
ratio, so the page never grows past the fold.

It is gated on a `desktop:` variant (`src/index.css`) that requires the viewport
to be both wide **and** tall enough:

```css
@custom-variant desktop (@media (width >= 64rem) and (height >= 46rem));
```

Anywhere smaller the page scrolls normally. Six tiles will never fit a phone,
and on a short laptop crushing them into the viewport reads worse than a
scroll. Percentage heights are avoided throughout — a child of a flex item
cannot resolve `height: 100%` reliably, so the chain is flex all the way down.

### Routing

| Path | Page |
|---|---|
| `/` | all six occasions |
| `/:occasion` | design chooser (`?year=` picks a season, `?style=` filters) |
| `/:occasion/:designId` | editor |

Everything the editor needs comes from the URL, so links are shareable and a
refresh keeps you where you were. Nothing is passed through `location.state`.

### The registries

`src/data/occasions.js` and `src/data/designs/*.js` are the single source of
truth. Adding an occasion or a design is a data edit — no component changes.

Occasion copy lives in the registry as `{ ar, en }` objects rather than as
i18n keys, because an occasion is a domain entity rather than interface text.
`src/lib/localize.js` resolves it. UI chrome stays in `src/i18n/`.

**All design geometry is stored as a fraction of the native image, never in
pixels.** That is what keeps the live preview, the exported file and the grid
thumbnail in agreement, and it lets artwork of different sizes coexist.

### Seasons

Designs accumulate rather than being replaced. Every design carries the `year`
of the season it was produced for, listed newest-first in `src/data/years.js`,
and each occasion page opens on its newest season with a dropdown to reach the
earlier ones. All current artwork is the **2025 / 2026** season.

The season is part of the design id (`eid-al-adha-2025-2026-01`) because card
numbers restart at `01` each year and would otherwise collide.

Adding next season:

1. Drop the artwork in `public/cards/<slug>/<season-id>/` — `NN.jpg` plus
   `thumbs/NN.webp`. (The first season predates the archive, so its files sit
   at the occasion root instead of in a subdirectory.)
2. Prepend an entry to `YEARS` in `src/data/years.js`.
3. In `src/data/designs/<slug>.js`, add a second `season(...)` block and append
   its cards to the exported array.

No component changes. The year dropdown, the style chips and the brand picker
all read whatever seasons are present for the occasion, and the brand picker
never moves you to a different year's artwork.

### Cards and brands

Each design declares whether its brand logo is already part of the artwork:

- `brandBakedIn: true` (all current artwork) — the brand selector picks a
  *different design*, since the logo is in the pixels.
- `brandBakedIn: false` — the brand becomes a layer composited at render time
  from `src/data/brands.js`.

Both paths render the same control, so the interface does not change when
logo-free artwork is supplied.

### Rendering

`src/lib/renderCard.js` is the only place a card is drawn. The preview, the
download and the share all call it.

It draws **only pixels that belong in the exported file**. Selection chrome —
the dashed box, corner handles, guides — is a DOM overlay
(`SelectionOverlay.jsx`), so it cannot leak into a download and stays crisp at
any pixel ratio.

Run the contract check with:

```bash
node scripts/verify-render.mjs
```

It renders the same scene at preview scale and at export scale and asserts the
results agree.

## Artwork

Optimised images under `public/` are generated, not hand-edited. Originals go
in `assets-src/` (gitignored); `npm run assets` produces:

- `public/occasions/<slug>/hero.{avif,webp,jpg}` plus `@2x`
- `public/cards/<slug>/NN.jpg` — masters, re-encoded
- `public/cards/<slug>/thumbs/NN.webp` — grid thumbnails

Card files are numbered `01…07`; the brand each one carries, and the season it
belongs to, are recorded in `src/data/designs/<slug>.js`, not in the filename.
Later seasons live one directory deeper — see [Seasons](#seasons).

### Occasions still using borrowed artwork

Saudi National Day, the Hijri New Year and the Gregorian New Year have no
artwork of their own yet and display another occasion's cards, marked "sample
artwork" in the interface. **The Hijri and Gregorian New Year samples still read
"Ramadan Mubarak".**

To retire a placeholder: add the real files, add a
`src/data/designs/<slug>.js`, register it in `designs/index.js`, and set
`artStatus: "final"` in `occasions.js`.

## Known gaps

- **The footer carries no copyright line**, because the design does not show
  one. Restoring it is a `footer.copyright` string plus one paragraph.
- **Brand logos** are not available as transparent files, so `logo` is `null`
  throughout `src/data/brands.js` and the compositing path is inert. Brand names
  are English in both languages — they are registered trade names, and the
  wordmarks in the artwork are English.
- **The design mockup specified DIN Next Arabic**, a licensed Monotype face.
  Cairo and Space Grotesk were chosen instead (see Typography). If REDA later
  wants DIN Next Arabic and holds a *web* licence, add the `.woff2` to
  `public/fonts/`, declare an `@font-face`, and add one entry to
  `src/data/fonts.js`.
- **Style tags** on designs were assigned by eye and are provisional — one line
  each in `src/data/designs/<slug>.js`.
- **Edition numbers** (Saudi National Day "96") are hardcoded and need an annual
  review.
- **Saudi Founding Day artwork** is a fully composed poster with very little
  clear space; its personalisation band is narrow and its type is set smaller
  than the other occasions as a result.
