-- REDA Cards: occasions, seasons and designs, with the admin write gate.
--
-- Run this as ONE transaction. Enabling row level security on a table before
-- its SELECT policy exists is a live outage for the public site -- every read
-- by `anon` is denied in the window between the two statements.
--
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/0001_init.sql
--
-- Or paste it whole into the Supabase SQL editor, which wraps it for you.

begin;

-- ---------------------------------------------------------------------------
-- types and helpers
-- ---------------------------------------------------------------------------

create type public.publish_status as enum ('draft', 'published', 'archived');

create table public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

-- SECURITY DEFINER is load-bearing, not decoration.
--
-- As a plain `exists (select 1 from public.admins ...)` written inline in a
-- policy, this would be evaluated under the CALLER's row level security on
-- public.admins. The caller can only ever see their own row, and during an
-- INSERT/UPDATE check the subquery returns nothing -- so every admin write is
-- denied. It fails CLOSED, which presents as "login is broken" rather than as
-- a policy bug, and it is the most common way to lose a day to RLS.
--
-- `set search_path` is mandatory on any security definer function: without it
-- a caller can shadow `public` and make the function resolve a table they own.
create or replace function public.is_admin() returns boolean
  language sql
  stable
  security definer
  set search_path = public
as $fn$
  select exists (select 1 from public.admins a where a.user_id = auth.uid())
$fn$;

grant execute on function public.is_admin() to anon, authenticated;

-- Stamps updated_at, and stamps published_at exactly once, never clearing it.
-- That one-way stamp is what makes "hard delete only what was never published"
-- expressible as a DELETE policy rather than as UI discipline.
create or replace function public.touch_row() returns trigger
  language plpgsql
as $fn$
begin
  new.updated_at := now();
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end
$fn$;

-- ---------------------------------------------------------------------------
-- seasons
-- ---------------------------------------------------------------------------

create table public.seasons (
  id           text primary key check (id ~ '^[0-9]{4}-[0-9]{4}$'),   -- "2025-2026"
  label_en     text not null check (length(btrim(label_en)) > 0),
  label_ar     text not null check (length(btrim(label_ar)) > 0),
  -- The newest season carries the HIGHEST sort_order, so `order by sort_order
  -- desc` reproduces the newest-first ordering the year dropdown has always had.
  sort_order   int  not null,
  status       public.publish_status not null default 'draft',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz
);

create trigger seasons_touch before insert or update on public.seasons
  for each row execute function public.touch_row();

-- ---------------------------------------------------------------------------
-- occasions
-- ---------------------------------------------------------------------------
--
-- Columns for the flat fields, jsonb for the nested composites. The dividing
-- line: the fields you will sort, filter, index or constrain are exactly the
-- flat ones, and the fields the client consumes whole are exactly the nested
-- ones. Bilingual copy gets real columns so `not null` can guard a missing
-- translation -- a jsonb key-existence check cannot catch "".

create table public.occasions (
  slug               text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order         int  not null default 0,
  enabled            boolean not null default true,
  status             public.publish_status not null default 'draft',

  title_en           text not null check (length(btrim(title_en)) > 0),
  title_ar           text not null check (length(btrim(title_ar)) > 0),
  short_title_en     text not null check (length(btrim(short_title_en)) > 0),
  short_title_ar     text not null check (length(btrim(short_title_ar)) > 0),
  tagline_en         text,
  tagline_ar         text,

  edition            jsonb,           -- null | {label, labelAr}
  hero               jsonb not null,  -- {base,width,height,focal,formats,widths,alt}
  icon               text not null default 'lucide:sparkles',
  cards_dir          text,
  art_status         text not null default 'final'
                       check (art_status in ('final', 'placeholder')),
  placeholder_source text,

  theme              jsonb not null,  -- {light:{...}, dark:{...}}

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  published_at       timestamptz,

  constraint hero_shape  check (hero  ?& array['base','width','height','focal','alt']),
  constraint theme_shape check (theme ?& array['light','dark'])
);

-- Added after the table exists: a placeholder occasion points at another
-- occasion's slug, so the reference is self-referential.
alter table public.occasions
  add constraint occasions_placeholder_source_fkey
  foreign key (placeholder_source) references public.occasions(slug)
  on update cascade on delete set null;

create index occasions_listing_idx on public.occasions (status, sort_order);

create trigger occasions_touch before insert or update on public.occasions
  for each row execute function public.touch_row();

-- ---------------------------------------------------------------------------
-- designs
-- ---------------------------------------------------------------------------
--
-- TEXT primary key, deliberately not a uuid. The id is in the public URL
-- (/:occasion/:designId) and in every saved localStorage draft key
-- (`reda-draft:<occasion>:<designId>`). A surrogate key would break every
-- bookmarked editor link and orphan every saved draft. The
-- "<slug>-<season>-NN" shape is a public contract: immutable once published.

create table public.designs (
  id             text primary key,
  occasion_slug  text not null references public.occasions(slug) on update cascade,
  season_id      text not null references public.seasons(id)     on update cascade,
  number         int  not null check (number > 0),
  style          text not null
                   check (style in ('modern', 'traditional', 'minimal', 'elegant')),

  src            text not null,
  thumb          text not null,
  original_src   text,               -- private bucket path; admin-only
  width          int not null check (width  between 1 and 20000),
  height         int not null check (height between 1 and 20000),

  brand          text,               -- id from src/data/brands.js, which stays code
  brand_baked_in boolean not null default true,
  is_placeholder boolean not null default false,

  -- Written wholesale by "save as default layout", read wholesale by
  -- buildLayers(). Nothing ever filters on layout.name.y, and splitting it into
  -- ~20 float columns would mean a migration every time a key is added.
  layout         jsonb not null,
  layout_version smallint not null default 1,

  status         public.publish_status not null default 'draft',
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  published_at   timestamptz,

  unique (occasion_slug, season_id, number),
  constraint layout_shape check (
    layout ?& array['safeArea','name','jobTitle','logo','palette',
                    'defaultColor','brandMark','fontId']
  )
);

create index designs_listing_idx
  on public.designs (occasion_slug, season_id, sort_order);

create trigger designs_touch before insert or update on public.designs
  for each row execute function public.touch_row();

-- ---------------------------------------------------------------------------
-- Data API privileges
-- ---------------------------------------------------------------------------
--
-- Required because the project was created with "Automatically expose new
-- tables" turned OFF. PostgREST decides what to expose from table privileges,
-- so without these grants /rest/v1/occasions simply 404s.
--
-- Granting a privilege is not granting access. Row level security below is
-- what decides which rows each role may touch; these grants only say which
-- tables the Data API is allowed to know about at all.
--
-- Keeping auto-expose off is worth this handful of lines: it means a table
-- added later is invisible to the API until someone grants it deliberately,
-- which removes the "created a table, forgot to enable RLS, it was
-- world-writable" failure mode entirely.

grant usage on schema public to anon, authenticated;

-- anon reads. Which rows it may read is decided by the policies below.
grant select on public.seasons, public.occasions, public.designs to anon;

-- Signed-in users may attempt writes; is_admin() decides whether they land.
grant select, insert, update, delete
  on public.seasons, public.occasions, public.designs to authenticated;

-- Read-only, and only your own row, so the client can gate its own UI.
grant select on public.admins to authenticated;

-- ---------------------------------------------------------------------------
-- row level security
-- ---------------------------------------------------------------------------
--
-- The anon key ships inside the JS bundle. These policies, not the login
-- screen, are the security boundary.
--
-- Policies for the same command are OR'd, so an admin gets the public policy
-- plus their own. Every write policy states BOTH `using` and `with check`:
-- `using` alone would let an admin update a row INTO a state that `using`
-- would have refused.

alter table public.seasons   enable row level security;
alter table public.occasions enable row level security;
alter table public.designs   enable row level security;
alter table public.admins    enable row level security;

-- seasons ------------------------------------------------------------------
create policy seasons_public_read on public.seasons
  for select to anon, authenticated using (status = 'published');
create policy seasons_admin_read on public.seasons
  for select to authenticated using (public.is_admin());
create policy seasons_admin_insert on public.seasons
  for insert to authenticated with check (public.is_admin());
create policy seasons_admin_update on public.seasons
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy seasons_admin_delete on public.seasons
  for delete to authenticated
  using (public.is_admin() and status = 'draft' and published_at is null);

-- occasions ----------------------------------------------------------------
create policy occasions_public_read on public.occasions
  for select to anon, authenticated using (status = 'published');
create policy occasions_admin_read on public.occasions
  for select to authenticated using (public.is_admin());
create policy occasions_admin_insert on public.occasions
  for insert to authenticated with check (public.is_admin());
create policy occasions_admin_update on public.occasions
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy occasions_admin_delete on public.occasions
  for delete to authenticated
  using (public.is_admin() and status = 'draft' and published_at is null);

-- designs ------------------------------------------------------------------
create policy designs_public_read on public.designs
  for select to anon, authenticated using (status = 'published');
create policy designs_admin_read on public.designs
  for select to authenticated using (public.is_admin());
create policy designs_admin_insert on public.designs
  for insert to authenticated with check (public.is_admin());
create policy designs_admin_update on public.designs
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy designs_admin_delete on public.designs
  for delete to authenticated
  using (public.is_admin() and status = 'draft' and published_at is null);

-- admins -------------------------------------------------------------------
-- Readable only by yourself, so the client can gate its own UI. There is
-- deliberately NO insert/update/delete policy, which means only the service
-- role -- that is, the Supabase dashboard -- can provision an admin.
create policy admins_self_read on public.admins
  for select to authenticated using (user_id = auth.uid());

commit;

-- ---------------------------------------------------------------------------
-- storage
-- ---------------------------------------------------------------------------
--
-- Two buckets. Originals must not be world-readable: they are the large,
-- un-processed master artwork.
--
-- Paths are content-addressed with a crypto.randomUUID() segment, so an upload
-- is immutable, cacheable for a year, and never needs deleting or versioning:
--   media/heroes/<slug>/<uid>/hero{,@2x}.{webp,jpg}
--   media/cards/<slug>/<season>/<uid>/{master.jpg,thumb.webp}
--   media/registry/registry.json
--   media/registry/history/<revision>.json
--   originals/<slug>/<season>/<uid>/<name>

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('media', 'media', true, 10485760,
   array['image/jpeg','image/webp','image/png','application/json']),
  ('originals', 'originals', false, 52428800,
   array['image/jpeg','image/webp','image/png'])
on conflict (id) do nothing;

create policy media_public_read on storage.objects
  for select to anon, authenticated using (bucket_id = 'media');

create policy media_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

-- Publishing the snapshot is an upsert, which is an UPDATE on a second write.
create policy media_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

create policy originals_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'originals' and public.is_admin());

create policy originals_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'originals' and public.is_admin());

-- No DELETE policy on storage.objects at all. "Uploaded files are never
-- removed by the UI" is thereby a Postgres guarantee rather than a convention
-- someone can forget. Deleting a file requires the dashboard.

commit;

-- ---------------------------------------------------------------------------
-- after running this
-- ---------------------------------------------------------------------------
--
-- 1. Authentication -> Sign In / Providers -> turn OFF "Allow new users to
--    sign up". Defence in depth: even with signup on, a new account is not in
--    public.admins and every write policy denies it.
-- 2. Authentication -> Users -> Add user, with a real email and password.
-- 3. insert into public.admins (user_id, email)
--      values ('<the uuid from step 2>', '<their email>');
-- 4. node --env-file=.env.local scripts/migrate-to-supabase.mjs
