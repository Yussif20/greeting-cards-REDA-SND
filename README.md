# REDA Cards

Personalised corporate greeting cards for REDA, in Arabic and English, for six
occasions across the year.

Pick an occasion, pick the company, pick a design, add a name and job title,
then download the card as a full-resolution image.

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
- **react-router 7**, with occasion, brand and design in the URL.
- **i18next**, Arabic and English, with direction handled on `<html>`.
- Cards are drawn with the **2D canvas API**. No html2canvas, no image libraries.

```
src/
  data/      the registry store and its readers; brands and fonts
  lib/       canvas rendering, layer geometry, export, drafts
  hooks/     editor state, pointer interaction, URL params
  i18n/      UI strings (en/ar)
  components/  layout · brand · brands · ui · occasions · designs · editor
  pages/     OccasionsPage · BrandsPage · DesignsPage · EditorPage · NotFoundPage
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

#### Uploaded fonts

Those four are bundled and `@import`-ed in `src/index.css`, so adding a fifth
used to mean an npm dependency plus a code edit — and a licensed face that is
not on npm could not be added at all. `/admin` → الخطوط now takes the files
directly: a **regular** file (required), an optional **bold**, and a bilingual
name. The row reaches the browser in the registry snapshot like everything else.

An uploaded face has no stylesheet behind it, so it is declared at runtime with
the **FontFace API** (`src/lib/fonts.js`) rather than through CSS. That reaches
`<canvas>` and CSS identically, because both read the same document font set —
which is what keeps the preview and the downloaded file in agreement. Declaring
a face is metadata only; the browser fetches the file when something actually
renders with the family, so a visitor who never picks one pays nothing.

Four decisions worth stating:

- **The family is derived from the row id**, not read out of the file. Two
  uploads could both call themselves "IBM Plex Sans Arabic", and one calling
  itself "Cairo" would shadow the bundled Cairo on every card. `uf-<id>` is
  unique by construction.
- **A bold is never synthesised.** With both files the 400/700 match is exact.
  With only a regular, the single face is declared across the whole weight
  range, so a card loses its weight contrast rather than its letterforms —
  synthetic bold smears Arabic, which is most of what these cards are.
- **The stack is `"<uploaded>", "Cairo", sans-serif`.** That inverts the bundled
  order, where Latin leads because Space Grotesk is half of a deliberate pair.
  Here there is no pair, only a face and a safety net: Cairo covers both
  scripts, so an Arabic-only upload still sets a Latin job title in something
  chosen.
- **Files are judged by extension, never by `file.type`.** The same `.ttf`
  arrives as `font/ttf`, as `application/x-font-ttf` or as `""` depending on the
  platform, and the bucket checks exactly the type the upload declares.

`layout.fontId` is plain text inside jsonb with no foreign key, and `getFont()`
falls back to the default for an id it does not know — so unpublishing or
deleting a font degrades every card using it to Cairo rather than breaking it.

Nothing is re-encoded: a browser cannot convert a TTF to WOFF2, and shipping the
file the foundry supplied is the only way a licensed face can be used at all.
WOFF2 is roughly half the size if they have it.

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
| `/:occasion` | brand chooser (`?year=` picks a season) |
| `/:occasion/brands/:brandId` | design chooser (`?category=` and `?style=` filter) |
| `/:occasion/:designId` | editor |

Everything the editor needs comes from the URL, so links are shareable and a
refresh keeps you where you were. Nothing is passed through `location.state`.

The brand step has **three** segments, and that is what let it be added without
moving anything: the editor's `/:occasion/:designId` is two, so react-router
separates them with no ambiguity, every bookmarked card still resolves, and
every saved draft — keyed `reda-draft:<occasion>:<designId>` — still matches.

`/:occasion/brands/other` is the one brand id with no company behind it. See
[Cards and brands](#cards-and-brands).

### The registries

Occasions, seasons, categories, fonts and designs live in Supabase.
`src/data/occasions.js`, `src/data/categories.js`, `src/data/fonts.js` and
`src/data/designs/index.js` are thin readers over `src/data/registryStore.js`,
so no page or hook knows where the data came from.

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

Occasion and category copy lives in the registry as `{ ar, en }` objects rather
than as i18n keys, because both are domain entities rather than interface text.
`src/lib/localize.js` resolves them. UI chrome stays in `src/i18n/`.

Every reader treats `categories` and `fonts` as **optional**. A snapshot
published before `0005_categories.sql` or `0006_fonts.sql` was applied has no
such key, and refusing it would strand a deployment on its bundled fallback over
a list that is allowed to be empty — so the structural guard checks each key's
shape but never its presence.

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
publish. The year dropdown, the chips and the brand picker all read whatever
seasons are present, and the brand picker never moves you to a different year's
artwork.

### Cards and brands

Choosing the company is a **page**, not a filter. `/:occasion` lists the seven
REDA brands and `/:occasion/brands/:brandId` holds that company's cards. A
season now carries several cards per company rather than one, and a flat grid of
forty thumbnails, six of which are yours, is not a chooser.

Brands stay in `src/data/brands.js` rather than becoming a table. They are the
group's registered trade names — given, like the calendar, not authored.

`designs.brand` is plain text with no foreign key, precisely because the roster
is code. So a card can carry `null`, or an id `brands.js` no longer contains,
and under a browse-by-brand flow such a card is not merely mislabelled — no tile
leads to it. `src/lib/brandGroups.js` collects anything the roster does not
claim into one trailing **`other`** tile, shown only when it holds something,
and `scripts/verify-render.mjs` asserts that every card is listed under exactly
one tile. Brands with no card for the occasion stay in the grid, disabled: the
roster is the group, and a subset shown without explanation reads as artwork
gone missing.

Each design also declares whether its brand logo is already part of the artwork:

- `brandBakedIn: true` (all current artwork) — the brand selector in the editor
  picks a *different design*, since the logo is in the pixels.
- `brandBakedIn: false` — the brand becomes a layer composited at render time
  from `src/data/brands.js`.

Both paths render the same control, so the interface does not change when
logo-free artwork is supplied.

### Duplicating a card

A season is one template rendered once per company, and the text sits in the
same place on all seven. **تكرار** copies a card — its whole layout, plus the
style, occasion and season — and asks only for the new card's brand, category
and artwork. It is offered both in the layout editor, where it copies what is
currently on screen (saving the source first if it has unsaved changes), and on
each card in `/admin` → البطاقات.

The copy is created as a draft. The panel stays open afterwards with the brand
advanced to the next company with no card, so filling a season is one drop per
brand rather than one round trip per brand.

Dropping new artwork is optional. **Without it the copy points at the source's
image**, which is a supported state rather than a shortcut: storage paths carry
a random uuid and no design id, `designs.src` has no unique constraint, and
uploads are never deleted, so neither row can pull the image out from under the
other. That is what makes "same artwork, two categories" a single click.

Two things a copy cannot know, both stated in the panel:

- **A layout is fractional, not proportional.** `size` is a fraction of the
  image's height while `maxWidth` is a fraction of its width, so artwork of a
  different shape places the text differently. Copying onto it is allowed — and
  still less work than starting over — so this warns rather than refuses.
- **`brandMark` is a crop into the artwork itself**, used to preview a logo in
  the editor. It transfers correctly between cards cut from one template and
  needs re-dragging otherwise.

The pure part lives in `src/admin/lib/duplicateInput.js` with no imports, so
`scripts/verify-render.mjs` can assert the copy rules directly — that the layout
is cloned deeply, that `id` and `number` are left for `createDesign` to
allocate, and that the default brand is the next gap in the roster.

### Categories

What a card is *for* — «موظفين», «عملاء», whatever is needed next — as opposed
to what it looks like. Inside a brand's grid the categories present render as
filter chips, and `?category=` puts the choice in the URL.

This is the one axis of the registry the client owns outright, which is why it
is a table with an admin screen while `style` stays four ids in the bundle:

| | where it lives | why |
|---|---|---|
| `style` | `STYLES` in `src/data/designs/index.js` | the ids are i18n keys (`designs.style.<id>`); a fifth invented at runtime would render as a raw key |
| `category` | `public.categories` | carries its own `{ ar, en }` label, so the admin can invent one |

Both filter the same grid, and both are shown only where the grid actually
contains more than one value — a chip row where every card matches filters
nothing and just costs a line.

**A card's category is optional and stays optional.** Every card made before
categories existed has none, an occasion that never needs the distinction never
gains one, and those cards appear under "All" and under no chip. That is why
`designs.category_id` is nullable and why deleting a category *un-files* its
cards (`ON DELETE SET NULL`) rather than refusing the way a season or an
occasion does — there is nothing to orphan. The admin screen still counts them
first, so the confirmation can say how many cards are about to lose their
category.

A category reaches the public site only when it is both published **and**
stamped on a published card, so the whole taxonomy can be set up before a single
card moves.

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

## Operating it

### The daily function

`api/daily.mjs` runs once a day as a Vercel Cron Job (see `crons` in
`vercel.json`). It needs `SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and
`CRON_SECRET` set on the project, plus an optional `VERCEL_DEPLOY_HOOK`.

**It refuses unauthenticated calls.** A cron path is an ordinary public URL,
so without the `CRON_SECRET` check anyone could call it in a loop — and each
call could trigger a deploy. The function returns 401 when the secret is
unset rather than running unprotected, because an endpoint that quietly
works is how it stays unprotected.

**It keeps the project awake.** Free-plan Supabase projects pause after 7 days
without activity. The public site would not notice — it renders from the
snapshot bundled at build time — but `/admin` stops working until someone
restores the project by hand. The ping is a *read*: writing a row would mean
granting `anon` write access somewhere, which is opening a hole in the security
model to hold a door open.

It lives with the deployment rather than in GitHub Actions because scheduled workflows are
disabled after 60 days without a commit — exactly what a finished project
looks like — and it would then stop silently.

**It keeps the bundled fallback fresh.** Publishing makes a change live in
seconds, but the copy compiled into the bundle only changes on a rebuild, and
drifts further behind with every publish. The function compares the published
revision with the one in the running deploy and triggers a build only when they
differ, so an idle month costs no builds and a busy day costs one.

`VERCEL_DEPLOY_HOOK` is deliberately **not** `VITE_`-prefixed. An earlier
version read it from the browser, which was wrong in a way worth recording:
`/assets/AdminRoutes-*.js` is a static file with no authentication in front of
it — the login gate is inside that JavaScript — so the URL was not a secret at
risk of leaking, it was published. Anyone could have POSTed to it in a loop,
and build minutes are finite on every plan.

### The database

Schema changes live in `supabase/migrations/`, numbered, each written to run as
one transaction. Apply them in order against the project:

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/0005_categories.sql
```

or paste the file whole into the Supabase SQL editor, which wraps it for you.

`0005_categories.sql` and `0006_fonts.sql` are the two this deploy needs.
Until they are applied, the matching `/admin` screen reports the missing table
and the rest of the dashboard keeps working — the card form degrades to "no
category", and the editor offers the four bundled fonts. The public site is
unaffected either way.

`0006_fonts.sql` also **widens the media bucket's `allowed_mime_types`**. The
bucket was created allowing three image types and JSON, so without that
statement a font upload is refused before any of the application code matters.

### If something looks wrong

```bash
npm run verify:rls        # attack the database with the public key
npm test                  # the render contract and the layout round trip
npm run snapshot:pull     # re-sync the bundled snapshot with what is published
npm run snapshot:publish  # rebuild registry.json from the database
```

`npm run verify:rls` is the one worth running after any schema change. It uses
the key that ships in the bundle, because the only meaningful question is not
whether the interface hides its buttons but whether the database refuses.

## Known gaps

- **The footer carries no copyright line**, because the design does not show
  one. Restoring it is a `footer.copyright` string plus one paragraph.
- **Brand logos** are not available as transparent files, so `logo` is `null`
  throughout `src/data/brands.js` and the compositing path is inert. Brand names
  are English in both languages — they are registered trade names, and the
  wordmarks in the artwork are English.
- **The design mockup specified DIN Next Arabic**, a licensed Monotype face.
  Cairo and Space Grotesk were chosen instead (see Typography). If REDA holds a
  *web* licence for it, this is no longer a code change: upload the file in
  `/admin` → الخطوط and publish it.
- **Style tags** on designs were assigned by eye and are provisional — one
  field each in `/admin`. They now sit alongside categories, which are the
  admin-managed axis; if the styles turn out to be redundant, dropping them is
  deleting `STYLES`, one chip row and one upload field.
- **No card carries a category yet.** The table ships empty, so the chip row is
  absent until the first one is created in `/admin` → Categories and cards are
  filed under it.
- **Edition numbers** (Saudi National Day "96") are not derivable from a
  calendar and need an annual review, now editable in `/admin`.
- **Saudi Founding Day artwork** is a fully composed poster with very little
  clear space; its personalisation band is narrow and its type is set smaller
  than the other occasions as a result.
