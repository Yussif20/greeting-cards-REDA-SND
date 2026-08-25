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
