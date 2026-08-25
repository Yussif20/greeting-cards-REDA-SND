import { useId } from "react";
import { useTranslation } from "react-i18next";
import FieldLabel from "../../ui/FieldLabel.jsx";
import Select from "../../ui/Select.jsx";
import RedaHazardControlLogo from "../../brand/RedaHazardControlLogo.jsx";
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
const BrandSelect = ({ occasionSlug, design, value, onChange }) => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const id = useId();

  const available = new Set(getBrandIds(occasionSlug));
  const selected = getBrand(value);

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

      {/* Logo preview chip, matching the mockup. Only the REDA Hazard Control
          mark exists as a vector today; the rest fall back to their name until
          transparent brand logos are supplied. */}
      <div className="mt-2 flex h-14 items-center justify-center rounded-xl border border-line bg-surface-2 px-4">
        {value === "rhc" ? (
          <RedaHazardControlLogo className="h-6 w-auto text-ink" />
        ) : (
          <span className="text-sm font-medium text-ink-2">
            {selected ? loc(selected.name, lang) : "—"}
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandSelect;
