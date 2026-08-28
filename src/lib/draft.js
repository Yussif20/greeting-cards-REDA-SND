/** Draft persistence: one slot per design, in localStorage. */

const PREFIX = "reda-draft";
const VERSION = 1;

const key = (occasion, designId) => `${PREFIX}:${occasion}:${designId}`;

export function saveDraft(occasion, designId, state) {
  try {
    localStorage.setItem(
      key(occasion, designId),
      JSON.stringify({ v: VERSION, savedAt: Date.now(), state }),
    );
    return true;
  } catch {
    return false; // Quota exceeded or storage blocked.
  }
}

export function loadDraft(occasion, designId) {
  try {
    const raw = localStorage.getItem(key(occasion, designId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.v !== VERSION) return null;
    return parsed.state ?? null;
  } catch {
    return null;
  }
}

export function clearDraft(occasion, designId) {
  try {
    localStorage.removeItem(key(occasion, designId));
  } catch {
    // Nothing to do.
  }
}

/**
 * Identifies the geometry a draft was positioned against.
 *
 * A saved draft keeps where the customer dragged their name -- that is what
 * "Save Draft" means to them. But an admin can now change a design's default
 * layout, and a draft carrying coordinates from the old one would quietly
 * defeat that fix for exactly the people who had used the card most.
 *
 * Storing this alongside the draft lets the reader tell the two cases apart:
 * unchanged layout, restore everything; changed layout, keep the typing and
 * take the new geometry.
 *
 * Built from named fields rather than JSON.stringify because a layout that has
 * been through Postgres jsonb comes back with its keys in a different order,
 * and that would read as a change on every single load.
 */
export function layoutFingerprint(layout) {
  if (!layout) return "";
  const t = (l) => [l.x, l.y, l.size, l.maxWidth, l.align, l.rotation ?? 0].join(",");
  return [
    t(layout.name),
    t(layout.jobTitle),
    [layout.logo.x, layout.logo.y, layout.logo.width].join(","),
  ].join("|");
}
