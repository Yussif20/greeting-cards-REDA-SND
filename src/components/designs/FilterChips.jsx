import { useTranslation } from "react-i18next";
import Chip from "../ui/Chip.jsx";

/**
 * One row of filter pills, plus an "All" that clears it.
 *
 * `options` are `{ value, label }` rather than ids this component translates
 * itself. It renders two different axes now -- style, whose four ids are i18n
 * keys, and category, whose labels are admin-written and come out of the
 * registry -- and a component that resolved its own labels could only ever
 * serve the first.
 *
 * Renders nothing below two options, on either axis. The caller already passes
 * only values present in the grid below, so one option means every card matches
 * it: a row reading "All | Employees" above six cards that are all employees
 * filters nothing and just costs a line. Spacing belongs to the toolbar row
 * that holds this and the season picker, so that row keeps no gap when there
 * are no chips.
 */
const FilterChips = ({ options, value, onChange, label, allLabel }) => {
  const { t } = useTranslation();

  if (options.length < 2) return null;

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      <Chip active={value === "all"} onClick={() => onChange("all")}>
        {allLabel ?? t("designs.style.all")}
      </Chip>
      {options.map((option) => (
        <Chip
          key={option.value}
          active={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  );
};

export default FilterChips;
