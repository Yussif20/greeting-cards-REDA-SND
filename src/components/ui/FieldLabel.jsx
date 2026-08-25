import { useTranslation } from "react-i18next";

/**
 * Bilingual form label, e.g. "Name (الاسم)" in English and "الاسم (Name)" in
 * Arabic. The secondary language is rendered from the same key rather than
 * being hardcoded into either bundle, so there is one string per language.
 *
 * The secondary span carries its own lang and dir. Without them the browser
 * places the parentheses on the wrong sides -- ")الاسم(" -- which is the
 * classic bidi punctuation bug.
 */
const FieldLabel = ({ labelKey, htmlFor, optional = false, children }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage === "ar" ? "ar" : "en";
  const other = lang === "ar" ? "en" : "ar";
  const secondary = i18n.getFixedT(other)(labelKey);
  const primary = t(labelKey);

  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink"
    >
      <span>{primary}</span>
      {secondary && secondary !== primary && (
        <span
          lang={other}
          dir={other === "ar" ? "rtl" : "ltr"}
          className="text-ink-3 font-normal"
        >
          ({secondary})
        </span>
      )}
      {optional && (
        <span className="text-ink-3 font-normal">{t("editor.optional")}</span>
      )}
      {children}
    </label>
  );
};

export default FieldLabel;
