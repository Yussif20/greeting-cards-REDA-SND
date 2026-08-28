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
npm test          # the render contract (scripts/verify-render.mjs)
npm run assets    # regenerate optimised images (see "Artwork" below)

npm run snapshot:pull   # refresh the bundled registry from the published one
npm run db:seed         # seed Supabase from the bundled registry (one-off)
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
  data/      the registry store and its readers; brands and fonts
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

Occasions, seasons and designs live in Supabase. `src/data/occasions.js` and
`src/data/designs/index.js` are thin readers over `src/data/registryStore.js`
and keep the signatures they always had, so no page or hook knows where the
data came from.

The store is seeded **synchronously** from `src/data/registry.snapshot.js`, a
committed copy of the last published registry, and revalidated once from the
CDN after the first render. That ordering is the whole design:

- `getOccasion()` and `getDesign()` stay synchronous, so the pages keep their
  `if (!occasion) return <NotFoundPage />` guards and a refresh never flashes a
  404 while data loads.
- No page needs a loading state, because a valid registry exists at
  module-eval time.
- If the fetch fails — offline, or a paused free-tier project — the site is
  fully usable on the bundled snapshot. Only newly published content is missing.

A snapshot is swapped in only when it is both newer (`revision`) and passes a
structural guard, so a malformed one can never replace a working registry.

Occasion copy lives in the registry as `{ ar, en }` objects rather than as
i18n keys, because an occasion is a domain entity rather than interface text.
`src/lib/localize.js` resolves it. UI chrome stays in `src/i18n/`.

**All design geometry is stored as a fraction of the native image, never in
pixels.** That is what keeps the live preview, the exported file and the grid
thumbnail in agreement, and it lets artwork of different sizes coexist.

### Seasons

Designs accumulate rather than being replaced. Every design carries the `year`
of the season it was produced for, listed newest-first by the registry,
and each occasion page opens on its newest season with a dropdown to reach the
earlier ones. All current artwork is the **2025 / 2026** season.

The season is part of the design id (`eid-al-adha-2025-2026-01`) because card
numbers restart at `01` each year and would otherwise collide.

Adding next season is an admin action rather than a code edit: create the
season in `/admin`, upload the artwork, place the name and job title on it, and
publish. The year dropdown, the style chips and the brand picker all read
whatever seasons are present for the occasion, and the brand picker never moves
you to a different year's artwork.

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

There are two paths into `public/`, and they coexist deliberately.

The **existing** artwork is generated by `npm run assets` and served by the
site's own CDN. It is already optimised and costs nothing to keep there, so it
was left alone.

**New** artwork uploaded through `/admin` is resized and encoded in the browser
(mirroring the settings below) and stored in Supabase, then served through
`/media/*`, which the host proxies. That proxy is not a detail: it keeps every
image same-origin, and a cross-origin image would taint the `<canvas>` and
break the download.

### Why uploads are proxied rather than served from Supabase

Uploaded artwork is drawn into a `<canvas>` and read back out with `toBlob()`,
which browsers refuse on a *tainted* canvas. Serving Supabase Storage through
this origin at `/media/*` makes every image same-origin, so tainting cannot
occur. Measured, rather than assumed:

| image loaded | `toBlob()` |
|---|---|
| `/media/...` proxied, `crossOrigin` set | works |
| `/media/...` proxied, no `crossOrigin` | works |
| `supabase.co` direct, `crossOrigin` set | works |
| `supabase.co` direct, no `crossOrigin` | **SecurityError** |

Only the last row fails, and it is the one that would have shipped: `DesignCard`
and `OccasionCard` render plain `<img>` with no `crossorigin`, so a visitor who
browsed the grid first would cache a non-CORS response, and the editor's
Download would then throw for them and nobody else. The proxy removes the
failure mode instead of mitigating it — and `vite.config.js` mirrors the
rewrite so dev behaves like production.

It also moves egress onto the host's CDN, which matters: the Supabase free plan
allows 5 GB/month, and card masters are ~600KB each.

Optimised images under `public/` are generated, not hand-edited. Originals go
in `assets-src/` (gitignored); `npm run assets` produces:

- `public/occasions/<slug>/hero.{avif,webp,jpg}` plus `@2x`
- `public/cards/<slug>/NN.jpg` — masters, re-encoded
- `public/cards/<slug>/thumbs/NN.webp` — grid thumbnails

Card files are numbered `01…07`; the brand each one carries, and the season it
belongs to, are recorded in the registry, not in the filename.
Later seasons live one directory deeper — see [Seasons](#seasons).

### Occasions still using borrowed artwork

Saudi National Day, the Hijri New Year and the Gregorian New Year have no
artwork of their own yet and display another occasion's cards, marked "sample
artwork" in the interface. **The Hijri and Gregorian New Year samples still read
"Ramadan Mubarak".**

Retiring a placeholder no longer needs a developer: upload the real artwork to
those designs in `/admin`, clear their placeholder flag, and set the occasion's
art status to final.

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
- **Style tags** on designs were assigned by eye and are provisional — one
  field each in `/admin`.
- **Edition numbers** (Saudi National Day "96") are not derivable from a
  calendar and need an annual review, now editable in `/admin`.
- **Saudi Founding Day artwork** is a fully composed poster with very little
  clear space; its personalisation band is narrow and its type is set smaller
  than the other occasions as a result.
