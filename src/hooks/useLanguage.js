import { useTranslation } from "react-i18next";

/** Current language plus the small derivations nearly every component needs. */
export function useLanguage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage === "ar" ? "ar" : "en";
  return {
    t,
    i18n,
    lang,
    isArabic: lang === "ar",
    other: lang === "ar" ? "en" : "ar",
    setLang: (next) => i18n.changeLanguage(next),
    toggle: () => i18n.changeLanguage(lang === "ar" ? "en" : "ar"),
  };
}
