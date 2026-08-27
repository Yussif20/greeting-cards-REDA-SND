import { useTranslation } from "react-i18next";
import Chip from "../ui/Chip.jsx";

/**
 * Style filter. `styles` contains only tags actually present for this occasion
 * -- with the current artwork most occasions carry one style, and a full chip
 * row where three options match nothing would look broken.
 *
 * Renders nothing when there is only one style to choose from. Spacing belongs
 * to the toolbar row that holds this and the season picker, so that the row
 * does not keep a gap when there are no chips.
 */
const FilterChips = ({ styles, value, onChange }) => {
  const { t } = useTranslation();

  if (styles.length < 2) return null;

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={t("designs.heading")}>
      <Chip active={value === "all"} onClick={() => onChange("all")}>
        {t("designs.style.all")}
      </Chip>
      {styles.map((style) => (
        <Chip key={style} active={value === style} onClick={() => onChange(style)}>
          {t(`designs.style.${style}`)}
        </Chip>
      ))}
    </div>
  );
};

export default FilterChips;
