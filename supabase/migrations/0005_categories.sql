-- Categories (تصنيفات): the admin-managed taxonomy a card is filed under.
--
-- A brand's cards for one occasion are no longer a flat set. The customer now
-- picks the occasion, then the brand, and then narrows by what the card is FOR
-- -- "موظفين", "عملاء", whatever the client needs next year. That last list is
-- the one thing here that is neither a date nor a company, so it is the one
-- thing that has to be data rather than an enum in the bundle.
--
-- Contrast with designs.style, which stays a check constraint: its four values
-- are i18n keys (`designs.style.<id>`), so a fifth added at runtime would
-- render as a raw key. A category carries its own bilingual label instead,
-- exactly like a season, which is what lets the admin invent one.
--
-- Run as ONE transaction:
--   psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/0005_categories.sql

begin;

create table public.categories (
  -- Slug rather than a uuid, for the same reason a season is "2025-2026": it
  -- travels in the public URL as ?category=, so it is legible in a shared link
  -- and fixed once published.
  id           text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

  -- Real columns, not jsonb, so `not null` can refuse a missing translation.
  -- A jsonb key-existence check cannot catch "".
  label_en     text not null check (length(btrim(label_en)) > 0),
  label_ar     text not null check (length(btrim(label_ar)) > 0),

  -- Unlike seasons, LOWEST first: a category list has no newest member, and
  -- the chips read in the order the admin arranged them.
  sort_order   int  not null default 0,

  status       public.publish_status not null default 'draft',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  published_at timestamptz
);

create index categories_listing_idx on public.categories (status, sort_order);

create trigger categories_touch before insert or update on public.categories
  for each row execute function public.touch_row();

-- ---------------------------------------------------------------------------
-- designs.category_id
-- ---------------------------------------------------------------------------
--
-- Nullable, and that is permanent rather than a migration convenience. Every
-- card that exists today predates categories, and a card is perfectly
-- displayable without one -- it simply appears under "All" and under no chip.
-- Requiring a category would mean inventing one for 38 existing cards and
-- forcing a choice on every upload for occasions that never need the
-- distinction.
--
-- ON DELETE SET NULL, where occasions and seasons block instead. The
-- difference is that a design cannot exist without its occasion or its season,
-- so cascading there would destroy artwork; a design without a category is a
-- valid design. So removing a category un-files its cards rather than refusing
-- or deleting them. The admin screen still counts them first and says how many
-- it is about to un-file, because "set null" being safe is not the same as it
-- being expected.
alter table public.designs
  add column category_id text
    references public.categories(id) on update cascade on delete set null;

create index designs_category_idx on public.designs (category_id);

-- ---------------------------------------------------------------------------
-- Data API privileges
-- ---------------------------------------------------------------------------
--
-- "Automatically expose new tables" is off on this project, so PostgREST will
-- 404 /rest/v1/categories without these. See the note in 0001_init.sql.

grant select on public.categories to anon;
grant select, insert, update, delete on public.categories to authenticated;

-- ---------------------------------------------------------------------------
-- row level security
-- ---------------------------------------------------------------------------
--
-- Same shape as seasons, including the delete policy's `status = 'draft' and
-- published_at is null`: a category that has been public is archived, never
-- destroyed, because its id has been in shared ?category= links.

alter table public.categories enable row level security;

create policy categories_public_read on public.categories
  for select to anon, authenticated using (status = 'published');
create policy categories_admin_read on public.categories
  for select to authenticated using (public.is_admin());
create policy categories_admin_insert on public.categories
  for insert to authenticated with check (public.is_admin());
create policy categories_admin_update on public.categories
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy categories_admin_delete on public.categories
  for delete to authenticated
  using (public.is_admin() and status = 'draft' and published_at is null);

commit;

-- ---------------------------------------------------------------------------
-- after running this
-- ---------------------------------------------------------------------------
--
-- Nothing else is required: every existing design keeps category_id null and
-- the site behaves exactly as before until the first category is published.
--
-- To start with one rather than through /admin -> Categories:
--
--   insert into public.categories (id, label_en, label_ar, sort_order, status)
--   values ('employees', 'Employees', 'موظفين', 1, 'published');
--
-- Then `npm run snapshot:publish`, or save anything in /admin, to put it in
-- front of the public site.
