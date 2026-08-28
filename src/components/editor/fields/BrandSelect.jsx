import { useId } from "react";
import { useTranslation } from "react-i18next";
import FieldLabel from "../../ui/FieldLabel.jsx";
import Select from "../../ui/Select.jsx";
import { BRANDS, getBrand } from "../../../data/brands.js";
import { getDesigns } from "../../../data/designs/index.js";
import { brandRows } from "../../../lib/brandRows.js";

/**
 * Brand picker, with two behaviours depending on the artwork.
 *
 * Mode A (design.brandBakedIn, today): the brand logo is part of the artwork,
 * so choosing a brand means choosing a different design. The list therefore has
 * one row per *card*, not per brand -- a company can have several designs for
 * the same occasion, and collapsing them to one row would make all but the
 * first unreachable from here. Where a brand has more than one, the rows are
 * numbered: "REDA Hazard Control 1", "REDA Hazard Control 2". A brand with a
 * single card is not numbered, because "1 of 1" is noise.
 *
 * Brands with no card for this occasion stay in the list, disabled, so the
 * roster reads as the full group rather than as a mysterious subset.
 *
 * Mode B (logo-free artwork, future): the brand becomes a compositing layer,
 * one row per brand, and nothing navigates -- numbering would be meaningless
 * because the artwork does not change.
 *
 * Both render the same control, so the interface does not change shape when
 * artwork is upgraded.
 */

/** Rendered height of the logo preview, in px. */
const SWATCH_H = 44;

const BrandSelect = ({ occasionSlug, design, value, onChange }) => {
  const { t } = useTranslation();
  const id = useId();
  const labelId = `${id}-label`;

  const composited = !design.brandBakedIn;
  const selected = getBrand(composited ? value : design.brand);
  // Brand names stay English in both languages -- see the note in brands.js.
  const brandName = selected?.name ?? "";
  const mark = design.layout.brandMark;

  // Scoped to the season: a brand can be in one year's set and not the next,
  // and switching never moves you to a different year's artwork.
  const options = composited
    ? BRANDS.map((brand) => ({ value: brand.id, label: brand.name }))
    : brandRows(getDesigns(occasionSlug, design.year), BRANDS).map((row) => ({
        value: row.key,
        label: row.label,
        disabled: row.disabled,
        // Why the row is dead, on its own line rather than appended to the name.
        hint: row.disabled ? t("editor.brandUnavailable") : undefined,
      }));

  return (
    <div>
      <FieldLabel labelKey="editor.field.brand" htmlFor={id} id={labelId} />
      <Select
        id={id}
        labelId={labelId}
        // In Mode A the row identifies a card, so the current card is what is
        // selected -- not its brand, which several rows may share.
        value={(composited ? value : design.id) ?? ""}
        onChange={onChange}
        options={options}
      />

      {/* Logo preview, cropped straight out of the chosen design's artwork.
          There are no transparent brand logo files, and the seven brands do not
          share one mark -- Verdifor and REDA Guard have their own -- so showing
          a single wordmark for all of them would be wrong. Cropping the real
          lockup needs no new assets and always matches what gets downloaded. */}
      <div className="mt-2 flex h-16 items-center justify-center rounded-xl border border-line bg-surface-3 p-2">
        {mark ? (
          <div
            role="img"
            aria-label={brandName}
            className="rounded-md ring-1 ring-line"
            style={{
              // Explicit pixels rather than a percentage height: a percentage
              // would have to resolve against a flex parent, and this box has
              // no content of its own to fall back on.
              height: `${SWATCH_H}px`,
              width: `${Math.round(SWATCH_H * (mark.w / mark.h))}px`,
              backgroundImage: `url("${design.src}")`,
              // Blow the artwork up so the marked region alone fills the box.
              backgroundSize: `${100 / mark.w}% ${100 / mark.h}%`,
              backgroundPosition: `${(mark.x / (1 - mark.w)) * 100}% ${
                (mark.y / (1 - mark.h)) * 100
              }%`,
              backgroundRepeat: "no-repeat",
            }}
          />
        ) : (
          <span className="text-sm font-medium text-ink-2">{brandName || "—"}</span>
        )}
      </div>
    </div>
  );
};

export default BrandSelect;
