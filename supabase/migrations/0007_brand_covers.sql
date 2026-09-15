-- Brand covers: the picture each company gets on an occasion's brand chooser.
--
-- /:occasion lists the seven REDA brands as illustrated tiles, and until now
-- BrandCard picked the illustration itself -- the company's lowest-numbered card
-- for the season. Deterministic, but not chosen: on Saudi National Day it lands
-- on a borrowed Founding Day placeholder rather than on the real artwork, which
-- is exactly why it reads as random to the people who made the cards.
--
-- A jsonb map on the occasion rather than a table, which is the dividing line
-- 0001_init.sql already draws: real columns for what you sort, filter, index or
-- constrain; jsonb for what the client consumes whole. This is read whole by one
-- component and never filtered, the same as `hero` and `theme` beside it.
--
-- Three consequences worth stating, because they are why a table was refused:
--
--   * The brand roster is code (src/data/brands.js) -- the group's registered
--     trade names, given rather than authored. A brand_covers table's `brand`
--     column would reference nothing, multiplying the untyped edge that
--     designs.brand already carries by one row per occasion per company.
--   * It publishes with its occasion. One status, one publishSnapshot(), no
--     sixth table in publish.js, and no new grants or five RLS policies -- which
--     a new table would need, or PostgREST 404s it, since "automatically expose
--     new tables" is off on this project.
--   * Every read is select("*"), so the column reaches /admin and the snapshot
--     builder untouched. Only the two mappers in src/lib/registry/serialize.js
--     have to learn about it.
--
-- Keyed by brand id, each value { src, width, height }. `src` is the proxied
-- /media/... path, never a supabase.co URL -- see the note on mediaUrl().
--
-- Apply this BEFORE deploying the build that carries it. Unlike 0005 and 0006,
-- which add tables that every reader tolerates as absent, this adds a column
-- that occasionToRow() now names on every occasion write -- so until it exists,
-- saving an occasion in /admin fails with 42703. The rest of the dashboard and
-- the whole public site are unaffected, and a write that quietly dropped the
-- field would be worse: the admin would find out from the live site.
--
-- Run as ONE transaction:
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/0007_brand_covers.sql

begin;

-- Default '{}' rather than null, so "no covers" and "covers not filled in yet"
-- are the same value and no reader has to distinguish them. The check is on the
-- container only: the keys are brand ids the database has no roster for, and
-- constraining them here would put src/data/brands.js in two places.
alter table public.occasions
  add column brand_covers jsonb not null default '{}'::jsonb;

alter table public.occasions
  add constraint brand_covers_shape check (jsonb_typeof(brand_covers) = 'object');

commit;

-- ---------------------------------------------------------------------------
-- after running this
-- ---------------------------------------------------------------------------
--
-- Nothing else is required. No grants and no policies: this is a column on a
-- table that already has both, and the occasions policies gate the whole row.
--
-- No storage change either. 0006_fonts.sql already allows image/webp on the
-- media bucket, and a cover is one ~900px WebP -- far inside the 10 MiB limit.
--
-- Every occasion gets '{}' and the site behaves exactly as before until the
-- first cover is uploaded in /admin -> المناسبات -> (an occasion) -> صور الشركات.
-- Each tile with no cover keeps showing that company's first card.
