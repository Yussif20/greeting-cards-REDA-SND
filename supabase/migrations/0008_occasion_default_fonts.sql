-- An occasion may choose the font visitors see when they first open any of
-- its cards. Null deliberately preserves the older behavior: each card uses
-- the font stored in its own layout until an admin makes an occasion choice.
--
-- This cannot be a foreign key to public.fonts because the four bundled font
-- ids have no database rows. Unknown or unpublished ids remain safe because
-- getFont() falls back to Cairo at render time.

begin;

alter table public.occasions
  add column default_font_id text
  check (
    default_font_id is null
    or default_font_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  );

commit;
