import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import FieldLabel from "../../ui/FieldLabel.jsx";

/**
 * Preset colours. The palette comes from the design, not a global default --
 * white text belongs on the deep-blue Eid cards and maroon on the blush
 * Founding Day ones, and a single shared set would be wrong on half of them.
 */
const ColorSwatches = ({ palette, value, onChange }) => {
  const { t } = useTranslation();

  return (
    <div>
      <FieldLabel labelKey="editor.field.textColor" />
      <div className="flex flex-wrap gap-2.5" role="group" aria-label={t("editor.field.textColor")}>
        {palette.map((color) => {
          const active = color.toLowerCase() === String(value).toLowerCase();
          return (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              aria-label={color}
              aria-pressed={active}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-transform hover:scale-110 ${
                active ? "border-ink" : "border-line"
              }`}
              style={{ backgroundColor: color }}
            >
              {active && (
                <Check
                  className="h-4 w-4 mix-blend-difference text-white"
                  strokeWidth={3}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColorSwatches;
