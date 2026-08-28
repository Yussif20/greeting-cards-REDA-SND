/**
 * The rows the brand picker offers, when the logo is baked into the artwork.
 *
 * One row per *card*, not per brand. A company can have several designs for the
 * same occasion, and listing brands would make all but one of them unreachable
 * from the editor -- the customer would have to go back to the grid to find the
 * others, which is not what a picker labelled with their company name implies.
 *
 * Where a brand has more than one card the rows are numbered from 1 in card
 * order. A brand with a single card is left unnumbered, because "1 of 1" is
 * noise on what is otherwise just the company's name.
 *
 * Brands with no card for this occasion are kept, disabled. The roster is the
 * REDA group; showing a subset without explanation reads as something missing.
 *
 * Pulled out of the component so the numbering can be tested directly --
 * getting it wrong is invisible until a season ships with two cards for one
 * company, which is exactly when nobody is looking closely.
 *
 * @param {Array} cards   designs for one occasion and season
 * @param {Array} brands  the full brand roster, in display order
 * @returns {Array<{key: string, designId: string|null, brandId: string,
 *                  label: string, disabled: boolean}>}
 */
export function brandRows(cards, brands) {
  const byBrand = new Map();
  for (const card of cards) {
    if (!card.brand) continue;
    if (!byBrand.has(card.brand)) byBrand.set(card.brand, []);
    byBrand.get(card.brand).push(card);
  }
  for (const list of byBrand.values()) list.sort((a, b) => a.number - b.number);

  return brands.flatMap((brand) => {
    const mine = byBrand.get(brand.id) ?? [];

    if (mine.length === 0) {
      return [
        {
          // Prefixed so it can never collide with a design id, and so a stray
          // selection of a disabled row is recognisable rather than looking
          // like a card that has gone missing.
          key: `brand:${brand.id}`,
          designId: null,
          brandId: brand.id,
          label: brand.name,
          disabled: true,
        },
      ];
    }

    return mine.map((card, index) => ({
      key: card.id,
      designId: card.id,
      brandId: brand.id,
      label: mine.length > 1 ? `${brand.name} ${index + 1}` : brand.name,
      disabled: false,
    }));
  });
}
