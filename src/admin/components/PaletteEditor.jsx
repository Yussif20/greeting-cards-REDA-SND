import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";

/**
 * The colours a customer may pick for their name on this card.
 *
 * ColorSwatches reads `layout.palette` and never writes it, so until now the
 * list could only be inherited from a sibling design. That is right for a card
 * belonging to an existing set and wrong for artwork on a new ground -- a
 * white-on-navy palette offers nothing usable on a pale poster.
 *
 * Deliberately a small fixed list rather than a free colour picker for the
 * customer: the palette is a design decision about what reads legibly on this
 * particular artwork, and it is the admin who is in a position to make it.
 */
const MAX = 8;

const PaletteEditor = ({ value = [], onChange, defaultColor, onDefaultChange }) => {
  const { t } = useTranslation();

  const set = (index, colour) =>
    onChange(value.map((c, i) => (i === index ? colour.toUpperCase() : c)));

  const remove = (index) => {
    const next = value.filter((_, i) => i !== index);
    onChange(next);
    // The default has to stay in the palette, or the editor opens on a swatch
    // that is not offered and the selection reads as broken.
    if (!next.includes(defaultColor) && next.length) onDefaultChange(next[0]);
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">{t("admin.layout.palette")}</p>

      <ul className="flex flex-wrap items-center gap-2">
        {value.map((colour, index) => {
          const isDefault = colour === defaultColor;
          return (
            <li key={`${colour}-${index}`} className="relative">
              <input
                type="color"
                value={colour}
                aria-label={t("admin.layout.swatch", { colour })}
                onChange={(e) => set(index, e.target.value)}
                className={`h-9 w-9 cursor-pointer rounded-lg border bg-transparent p-0.5 ${
                  isDefault ? "border-brand ring-2 ring-brand/40" : "border-line"
                }`}
              />
              {value.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={t("admin.layout.removeSwatch", { colour })}
                  className="absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface-3 text-ink-2 hover:text-danger"
                >
                  <X className="h-2.5 w-2.5" aria-hidden="true" />
                </button>
              )}
            </li>
          );
        })}

        {value.length < MAX && (
          <li>
            <button
              type="button"
              onClick={() => onChange([...value, "#FFFFFF"])}
              aria-label={t("admin.layout.addSwatch")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-line text-ink-3 transition-colors hover:border-ink-3 hover:text-ink"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        )}
      </ul>

      <p className="mt-2 text-xs text-ink-3">{t("admin.layout.paletteHint")}</p>
    </div>
  );
};

export default PaletteEditor;
