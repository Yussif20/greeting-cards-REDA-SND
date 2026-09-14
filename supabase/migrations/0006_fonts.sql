-- Uploaded fonts: the editor's typeface list, as data rather than as a build.
--
-- The four fonts in src/data/fonts.js are bundled through @fontsource and
-- @import-ed in src/index.css, so adding a fifth has always meant an npm
-- dependency, a CSS line and a code edit -- and a licensed face that is not on
-- npm at all could not be added by any of those. The README has carried the
-- manual recipe for DIN Next Arabic since the first release for exactly that
-- reason.
--
-- A row here is a face the admin uploaded. It reaches the browser through the
-- registry snapshot like everything else, and is registered at runtime with the
-- FontFace API rather than through a stylesheet -- see src/lib/fonts.js.
--
-- Run as ONE transaction:
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/0006_fonts.sql

begin;

create table public.fonts (
  -- Slug, and it is load-bearing twice over: it is saved into every design's
  -- layout as `fontId`, and the CSS family the face registers under is derived
  -- from it (see the note on regular_src). So it is fixed at creation, like an
  -- occasion's slug.
  id           text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

  label_en     text not null check (length(btrim(label_en)) > 0),
  label_ar     text not null check (length(btrim(label_ar)) > 0),

  -- Proxied /media paths, not supabase.co URLs. Same-origin matters less for a
  -- font than for the artwork -- a font cannot taint a canvas -- but a
  -- cross-origin font file DOES need CORS headers to load at all, and routing
  -- through the host's proxy sidesteps that entirely.
  --
  -- The family name the browser registers is NOT taken from the file's internal
  -- name. Two uploads could both call themselves "IBM Plex Sans Arabic", and an
  -- upload calling itself "Cairo" would shadow the bundled Cairo for every
  -- card. The family is derived from `id` instead, so it is unique by
  -- construction and can never collide with a bundled face.
  regular_src  text not null check (length(btrim(regular_src)) > 0),

  -- Optional, and the asymmetry is the point. A card sets the name at 700 and
  -- the job title at 400; with only a regular file the face is registered
  -- across the whole weight range so both render from the real outlines, and
  -- the card simply loses that contrast. Synthetic bold is never used -- it
  -- smears Arabic letterforms, which is most of what these cards are.
  bold_src     text,

  sort_order   int  not null default 0,
  status       public.publish_status not null default 'draft',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz
);

create index fonts_listing_idx on public.fonts (status, sort_order);

create trigger fonts_touch before insert or update on public.fonts
  for each row execute function public.touch_row();

-- No foreign key from designs.layout->>'fontId'. The layout is jsonb and the
-- id may also name one of the four bundled fonts, which have no row here.
-- getFont() already falls back to the default for an unknown id, so
-- unpublishing a font degrades a card to Cairo rather than breaking it.

-- ---------------------------------------------------------------------------
-- Data API privileges
-- ---------------------------------------------------------------------------
--
-- "Automatically expose new tables" is off on this project, so PostgREST will
-- 404 /rest/v1/fonts without these. See the note in 0001_init.sql.

grant select on public.fonts to anon;
grant select, insert, update, delete on public.fonts to authenticated;

-- ---------------------------------------------------------------------------
-- row level security
-- ---------------------------------------------------------------------------

alter table public.fonts enable row level security;

create policy fonts_public_read on public.fonts
  for select to anon, authenticated using (status = 'published');
create policy fonts_admin_read on public.fonts
  for select to authenticated using (public.is_admin());
create policy fonts_admin_insert on public.fonts
  for insert to authenticated with check (public.is_admin());
create policy fonts_admin_update on public.fonts
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy fonts_admin_delete on public.fonts
  for delete to authenticated
  using (public.is_admin() and status = 'draft' and published_at is null);

commit;

-- ---------------------------------------------------------------------------
-- storage
-- ---------------------------------------------------------------------------
--
-- The media bucket was created allowing three image types and JSON, so a font
-- upload is refused before any of the code above matters. Restated whole rather
-- than appended to, so re-running this file cannot duplicate an entry.
--
-- The upload passes an explicit contentType derived from the file extension
-- rather than trusting file.type: browsers report .ttf as "font/ttf", as
-- "application/x-font-ttf", or as "" depending on the platform and the OS
-- registry, and only one of those would pass this list.

begin;

update storage.buckets
   set allowed_mime_types = array[
         'image/jpeg', 'image/webp', 'image/png', 'application/json',
         'font/ttf', 'font/otf', 'font/woff', 'font/woff2'
       ]
 where id = 'media';

commit;

-- ---------------------------------------------------------------------------
-- after running this
-- ---------------------------------------------------------------------------
--
-- Nothing else is required. The four bundled fonts keep working with no row
-- here, and the picker shows uploaded ones only once they are published.
--
--   /admin -> الخطوط -> add a font, drop the regular file, publish.
--
-- WOFF2 is roughly half the size of the equivalent TTF and every browser this
-- site supports reads it. A .ttf is accepted as-is because that is usually what
-- a foundry ships, and a browser cannot convert one.
