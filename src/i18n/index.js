import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./en.js";
import ar from "./ar.js";

export const LANGS = ["en", "ar"];
export const STORAGE_KEY = "reda-lang";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ar: { translation: ar } },
    fallbackLng: "en",
    supportedLngs: LANGS,
    nonExplicitSupportedLngs: true,
    detection: {
      order: ["localStorage", "htmlTag", "navigator"],
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

// Direction and language live on <html>, set here once. Components no longer
// carry `dir={isArabic ? "rtl" : "ltr"}`; they use logical properties and the
// rtl: variant instead.
function syncDocument(lng) {
  const doc = document.documentElement;
  doc.lang = lng;
  doc.dir = lng === "ar" ? "rtl" : "ltr";
}

i18n.on("languageChanged", syncDocument);
syncDocument(i18n.resolvedLanguage || i18n.language || "en");

export default i18n;
