-- Restore service_role's privileges on the content tables.
--
-- Creating the project with "Automatically expose new tables" turned off
-- withheld the default DML grants from every Data API role -- including
-- service_role, which 0001 then did not grant to. The symptom is that the
-- seed script authenticates fine and is refused anyway:
--
--   42501: permission denied for table occasions
--
-- Why `grant all` here, when 0002 deliberately stripped anon and
-- authenticated back to the minimum:
--
-- Those revocations mattered because TRUNCATE is not governed by row level
-- security, so an over-granted anon held a privilege the security model could
-- not see. None of that reasoning transfers to service_role. That role
-- bypasses RLS outright, so its table grants are not a security boundary at
-- all -- anyone holding the secret key can already grant themselves whatever
-- they lack. The only thing protecting service_role is the key staying out of
-- the browser and out of git, which is why it is never VITE_-prefixed and why
-- vite.config.js fails the build if it ever lands in the anon variable.
--
-- Restricting it here would therefore buy no safety and cost future breakage:
-- Edge Functions, backups and admin tooling all expect the Supabase default.

begin;

grant usage on schema public to service_role;

grant all on public.seasons   to service_role;
grant all on public.occasions to service_role;
grant all on public.designs   to service_role;
grant all on public.admins    to service_role;

commit;
