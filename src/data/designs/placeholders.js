// Borrowed artwork for occasions that have no designs of their own yet.
//
// Saudi National Day and the Gregorian New Year ship with another occasion's
// cards so every flow is clickable end to end. Each clone keeps the source
// image but takes the borrowing occasion's id and slug, and is flagged
// `isPlaceholder` so the UI can say so.
//
// To retire a placeholder: add a real src/data/designs/<slug>.js, register it
// in index.js, and set artStatus to "final" in occasions.js.

/**
 * Clone a source occasion's designs for `slug`.
 * @param {string} slug borrowing occasion
 * @param {Array} sourceDesigns designs to clone
 */
export function placeholderDesigns(slug, sourceDesigns) {
  return sourceDesigns.map((d) => ({
    ...d,
    id: `${slug}-${String(d.number).padStart(2, "0")}`,
    occasion: slug,
    isPlaceholder: true,
    layout: { ...d.layout },
  }));
}
