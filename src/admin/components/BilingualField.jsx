import { useId } from "react";
import { useTranslation } from "react-i18next";

import TextField from "../../components/ui/TextField.jsx";

/**
 * One piece of occasion copy, in both languages side by side.
 *
 * Occasions are domain entities, so their copy travels as `{ ar, en }` objects
 * in the registry rather than as i18n keys -- which means both languages are
 * always required and neither is a translation of the other in the interface's
 * sense. Showing them together is what stops one being forgotten: a missing
 * Arabic tagline is not a fallback, it is a blank line on the tile.
 *
 * Each input carries its own lang and dir. Without them a browser lays Arabic
 * out left to right inside an LTR interface, and the admin sees their own text
 * mirrored while typing it.
 */
const BilingualField = ({ labelKey, value = {}, onChange, multiline = false, required }) => {
  const { t } = useTranslation();
  const id = useId();

  const field = (code) => {
    const Tag = multiline ? "textarea" : TextField;
    const shared = {
      id: `${id}-${code}`,
      value: value[code] ?? "",
      onChange: (e) => onChange({ ...value, [code]: e.target.value }),
      lang: code,
      dir: code === "ar" ? "rtl" : "ltr",
      required,
    };

    return multiline ? (
      <Tag
        {...shared}
        rows={2}
        className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink transition-colors placeholder:text-ink-3 hover:border-ink-3 focus:border-brand focus:outline-none"
      />
    ) : (
      <Tag {...shared} />
    );
  };

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">
        {t(labelKey)}
        {!required && (
          <span className="ms-1.5 font-normal text-ink-3">{t("editor.optional")}</span>
        )}
      </legend>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-ink-3">English</span>
          {field("en")}
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-ink-3" lang="ar" dir="rtl">
            العربية
          </span>
          {field("ar")}
        </label>
      </div>
    </fieldset>
  );
};

export default BilingualField;
