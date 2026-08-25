import { Globe } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage.js";

/** Globe + "العربية | English", matching the design mockup's header. */
const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();

  const option = (code, label) => (
    <button
      type="button"
      onClick={() => setLang(code)}
      aria-current={lang === code}
      lang={code}
      className={`rounded px-1 transition-colors ${
        lang === code
          ? "font-semibold text-ink"
          : "text-ink-3 hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center gap-2 text-sm">
      <Globe className="h-4 w-4 text-ink-3" aria-hidden="true" />
      <div className="flex items-center gap-1.5" dir="ltr">
        {option("ar", "العربية")}
        <span aria-hidden="true" className="text-line">|</span>
        {option("en", "English")}
      </div>
    </div>
  );
};

export default LanguageToggle;
