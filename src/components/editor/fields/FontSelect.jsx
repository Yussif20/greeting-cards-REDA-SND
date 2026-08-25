import { useId } from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import FieldLabel from "../../ui/FieldLabel.jsx";
import Select from "../../ui/Select.jsx";
import Tooltip from "../../ui/Tooltip.jsx";
import { FONTS, getFont } from "../../../data/fonts.js";
import { loc } from "../../../lib/localize.js";
import { useLanguage } from "../../../hooks/useLanguage.js";

/**
 * Font picker plus live previews of the actual name.
 *
 * One choice styles the whole card. The old editor kept arabicFont, englishFont
 * and fontLanguage as three pieces of state to select one font; every face here
 * covers both scripts instead.
 */
const FontSelect = ({ value, sampleText, onChange }) => {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const id = useId();

  const current = getFont(value);
  const sample = sampleText?.trim() || t("editor.placeholder.name");

  // Show the current pairing first, then a couple of alternatives.
  const previews = [current, ...FONTS.filter((f) => f.id !== current.id)].slice(0, 3);

  return (
    <div>
      <FieldLabel labelKey="editor.field.font" htmlFor={id}>
        <Tooltip text={t("editor.fontHelp")} label={t("editor.field.font")} />
      </FieldLabel>

      <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {FONTS.map((font) => (
          <option key={font.id} value={font.id}>
            {loc(font.label, lang)}
          </option>
        ))}
      </Select>

      <ul className="mt-2.5 space-y-1.5">
        {previews.map((font) => {
          const active = font.id === value;
          return (
            <li key={font.id}>
              <button
                type="button"
                onClick={() => onChange(font.id)}
                aria-pressed={active}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition-colors ${
                  active
                    ? "border-accent bg-accent-soft"
                    : "border-line bg-surface-2 hover:border-ink-3"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? "border-accent" : "border-line"
                  }`}
                >
                  {active && <span className="h-2 w-2 rounded-full bg-accent" />}
                </span>

                <span
                  className="flex-1 truncate text-base text-ink"
                  style={{ fontFamily: font.stack }}
                >
                  {sample}
                </span>

                <ChevronRight
                  className="h-4 w-4 shrink-0 text-ink-3 rtl:rotate-180"
                  aria-hidden="true"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FontSelect;
