import { useId } from "react";
import { useTranslation } from "react-i18next";
import Select from "../ui/Select.jsx";
import { loc } from "../../lib/localize.js";
import { useLanguage } from "../../hooks/useLanguage.js";

/**
 * Season picker for an occasion's grid.
 *
 * Unlike the style chips this renders even with a single season to choose
 * from: the archive is the point of it, and the control is what tells you
 * which year's cards you are looking at.
 */
const YearSelect = ({ years, value, onChange }) => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const id = useId();
  const labelId = `${id}-label`;

  if (years.length === 0) return null;

  return (
    <div className="flex items-center gap-2.5">
      <label htmlFor={id} id={labelId} className="shrink-0 text-sm font-medium text-ink-2">
        {t("designs.year")}
      </label>
      {/* Width lives on the wrapper: it sizes the trigger and the panel below
          it together, since the panel is w-full of this box. */}
      <Select
        id={id}
        labelId={labelId}
        value={value ?? ""}
        onChange={onChange}
        options={years.map((year) => ({
          value: year.id,
          label: loc(year.label, lang),
        }))}
        className="w-40"
      />
    </div>
  );
};

export default YearSelect;
