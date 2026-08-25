import { useId } from "react";
import { useTranslation } from "react-i18next";
import FieldLabel from "../../ui/FieldLabel.jsx";
import Select from "../../ui/Select.jsx";
import { BRANDS, getBrand } from "../../../data/brands.js";
import { getBrandIds } from "../../../data/designs/index.js";
import { loc } from "../../../lib/localize.js";
import { useLanguage } from "../../../hooks/useLanguage.js";

/**
 * Brand picker, with two behaviours depending on the artwork.
 *
 * Mode A (design.brandBakedIn, today): the brand logo is part of the artwork,
 * so choosing a brand means choosing a different design. Brands with no card
 * for this occasion are disabled rather than hidden, so the roster stays
 * legible.
 *
 * Mode B (logo-free artwork, future): the brand becomes a compositing layer and
 * nothing navigates.
 *
 * Both render the same control, so the UI does not change shape when artwork is
 * upgraded.
 */
/** Rendered height of the logo preview, in px. */
const SWATCH_H = 44;

const BrandSelect = ({ occasionSlug, design, value, onChange }) => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const id = useId();

  const available = new Set(getBrandIds(occasionSlug));
  const selected = getBrand(value);
  const brandName = selected ? loc(selected.name, lang) : "";
  const mark = design.layout.brandMark;

  return (
    <div>
      <FieldLabel labelKey="editor.field.brand" htmlFor={id} />
      <Select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
        {BRANDS.map((brand) => {
          const enabled = !design.brandBakedIn || available.has(brand.id);
          return (
            <option key={brand.id} value={brand.id} disabled={!enabled}>
              {loc(brand.name, lang)}
              {enabled ? "" : ` — ${t("editor.brandUnavailable")}`}
            </option>
          );
        })}
      </Select>

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
