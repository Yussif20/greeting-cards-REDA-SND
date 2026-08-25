import { Globe } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage.js";

/**
 * Globe, then "العربية | English" -- as in the design.
 *
 * The pair is pinned to dir="ltr" so the order and the divider stay put when
 * the page flips to RTL; it reads as one fixed control rather than a sentence.
 */
const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();

  const option = (code, label) => (
    <button
      type="button"
      onClick={() => setLang(code)}
      aria-current={lang === code}
      lang={code}
      className={`rounded px-0.5 transition-colors ${
        lang === code ? "font-semibold text-ink" : "text-ink-2 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-2 text-sm sm:gap-2.5">
      <Globe className="h-4.5 w-4.5 shrink-0 text-ink-2" aria-hidden="true" />
      <div className="flex items-center gap-2" dir="ltr">
        {option("ar", "العربية")}
        <span aria-hidden="true" className="text-line select-none">
          |
        </span>
        {option("en", "English")}
      </div>
    </div>
  );
};

export default LanguageToggle;
