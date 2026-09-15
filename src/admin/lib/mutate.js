/**
 * Execute a write and require PostgREST to return at least one affected row.
 *
 * Kept separate from the Supabase-backed mutation module so this contract can
 * be checked without credentials or a live database.
 */
export async function mutate(builder, label) {
  // Do not name a primary key here. Most admin tables use `id`, but occasions
  // deliberately use their public `slug` as the key. We only need a returned
  // row to distinguish a completed write from an RLS-hidden no-op.
  const { data, error } = await builder.select();
  if (error) throw new Error(`${label}: ${error.message}`);
  if (!data || data.length === 0) {
    throw new Error(
      `${label}: the database refused this, or the row no longer exists. ` +
        `Nothing was changed.`,
    );
  }
  return data;
}
