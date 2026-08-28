-- Let an archived row be deleted, but never a live one.
--
-- The original rule was "delete only what was never published", enforced with
-- `status = 'draft' and published_at is null`. The intent was right -- a card's
-- URL is shareable, so destroying something people may have linked to should
-- not be one click away. But `published_at` is stamped once and never cleared,
-- so the rule had a consequence nobody chose: a card published by mistake, or
-- a test upload, could be hidden but never removed. Ever. The row and its
-- files would sit in the project permanently, and only a developer with
-- dashboard access could clear them.
--
-- The replacement keeps the protection and drops the trap. Deleting still
-- requires that the row is not currently public, which means removing anything
-- that has been live is deliberately two steps -- unpublish, then delete --
-- with the second step warning that shared links will stop working. What
-- cannot happen is a single click destroying something a customer can see
-- right now.
--
-- Storage is untouched by this. There is still no delete policy on
-- storage.objects at all, so the uploaded files outlive the row and an
-- accident stays recoverable from the dashboard.

begin;

drop policy if exists seasons_admin_delete   on public.seasons;
drop policy if exists occasions_admin_delete on public.occasions;
drop policy if exists designs_admin_delete   on public.designs;

create policy seasons_admin_delete on public.seasons
  for delete to authenticated
  using (public.is_admin() and status <> 'published');

create policy occasions_admin_delete on public.occasions
  for delete to authenticated
  using (public.is_admin() and status <> 'published');

create policy designs_admin_delete on public.designs
  for delete to authenticated
  using (public.is_admin() and status <> 'published');

commit;

-- Note for whoever adds occasion deletion to the interface: public.designs
-- references public.occasions(slug) with no ON DELETE action, so removing an
-- occasion that still has cards raises a foreign key violation rather than
-- quietly orphaning them. That is the right default -- it should be refused --
-- but the interface will need to say so in words rather than surfacing
-- Postgres error 23503.
