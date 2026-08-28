import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

import TextField from "../../components/ui/TextField.jsx";
import {
  LUCIDE_GROUPS,
  LUCIDE_PREFIX,
  LUCIDE_STROKE_WIDTH,
  isLucideIcon,
  lucideName,
} from "../../components/occasions/lucideIcons.js";

/**
 * Choose the gold mark for an occasion's tile.
 *
 * Rendered at the stroke weight the tile will actually use, so what the admin
 * picks is what appears next to the six hand-drawn marks rather than a heavier
 * preview that looks fine here and wrong on the home page.
 *
 * An occasion that already carries a hand-drawn key -- the original six -- is
 * left alone: the picker shows that it has one and does not offer to replace
 * it with something from this list, because the drawn set is better than
 * anything the shortlist could substitute.
 */
const IconPicker = ({ value, onChange, disabled = false }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const groups = useMemo(
    () =>
      LUCIDE_GROUPS.map((group) => ({
        ...group,
        entries: Object.entries(group.icons).filter(([name]) =>
          name.toLowerCase().includes(needle),
        ),
      })).filter((group) => group.entries.length),
    [needle],
  );

  const selected = isLucideIcon(value) ? lucideName(value) : null;

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink">{t("admin.occasion.icon")}</p>

      {disabled ? (
        <p className="rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs text-ink-3">
          {t("admin.occasion.iconHandDrawn", { name: value })}
        </p>
      ) : (
        <>
          <div className="relative mb-3">
            <Search
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3 start-3"
              aria-hidden="true"
            />
            <TextField
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("admin.occasion.iconSearch")}
              aria-label={t("admin.occasion.iconSearch")}
              className="ps-9"
              dir="ltr"
            />
          </div>

          <div className="max-h-64 overflow-y-auto rounded-xl border border-line bg-surface-2 p-3">
            {groups.length === 0 && (
              <p className="py-6 text-center text-xs text-ink-3">
                {t("admin.occasion.iconNone")}
              </p>
            )}

            {groups.map((group) => (
              <div key={group.key} className="mb-3 last:mb-0">
                <p className="mb-1.5 text-[11px] font-medium tracking-wide text-ink-3 uppercase">
                  {t(`admin.occasion.iconGroup.${group.key}`)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {group.entries.map(([name, Icon]) => {
                    const active = selected === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        title={name}
                        aria-pressed={active}
                        aria-label={name}
                        onClick={() => onChange(`${LUCIDE_PREFIX}${name}`)}
                        className={`flex h-11 w-11 items-center justify-center rounded-lg border transition-colors ${
                          active
                            ? "border-brand bg-brand-soft text-brand"
                            : "border-line bg-surface text-ink-2 hover:border-ink-3 hover:text-ink"
                        }`}
                      >
                        <Icon
                          className="h-7 w-7"
                          strokeWidth={LUCIDE_STROKE_WIDTH}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default IconPicker;
