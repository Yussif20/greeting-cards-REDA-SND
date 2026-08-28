-- Revoke the privileges row level security cannot police.
--
-- Supabase's default privileges hand `anon` and `authenticated` TRUNCATE,
-- TRIGGER and REFERENCES on every new table in `public`. These arrive
-- independently of the "Automatically expose new tables" setting, which only
-- governs the DML verbs -- so a project created with that toggle off still
-- ends up with:
--
--   grant:anon | admins | REFERENCES,TRIGGER,TRUNCATE
--
-- TRUNCATE is the problem. Row level security filters SELECT, INSERT, UPDATE
-- and DELETE; it does not apply to TRUNCATE at all. A granted TRUNCATE is
-- therefore a privilege this design is structurally blind to -- and on
-- public.admins in particular, it targets the one table that decides whether
-- any write is allowed.
--
-- This is not currently reachable: PostgREST exposes no TRUNCATE verb, so
-- nothing in the Data API can call it. It is revoked regardless. The security
-- model is "RLS is the boundary", and a privilege that bypasses RLS
-- contradicts that premise no matter how unreachable it happens to be today.
--
-- Safe to run: TRIGGER and REFERENCES govern *creating* triggers and foreign
-- keys, not the ones that already exist. The touch_row triggers and every FK
-- were created by the migration role and are unaffected.

begin;

revoke truncate, trigger, references
  on all tables in schema public
  from anon, authenticated;

-- Stop future tables arriving with them. This only clears defaults owned by
-- the role running the statement, so if Supabase set them as another role the
-- statement is a harmless no-op -- re-run the verification query after adding
-- any table and revoke again if the three reappear.
alter default privileges in schema public
  revoke truncate, trigger, references on tables from anon, authenticated;

commit;
