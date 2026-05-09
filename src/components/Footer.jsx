import { useTranslation } from "react-i18next";
import { Logo } from "./Header";
import { EightPointStar } from "./Ornaments";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const labelFont = isArabic ? "font-display-ar" : "font-display-en";

  return (
    <footer
      className="relative w-full bg-[var(--parchment-light)]/95 dark:bg-[#06140f]/95 backdrop-blur-lg py-8 px-6 transition-all duration-300"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Double gold rule along the top edge */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-[var(--chrome-border)]" />
      <div className="absolute top-[3px] left-0 right-0 h-[1px] bg-[var(--chrome-border)]/50" />

      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Logo */}
        <Logo
          className="h-7 w-auto max-w-32 transition-transform duration-300 hover:scale-105"
          ariaLabel="Reda Hazard Control Logo"
        />

        {/* Copyright */}
        <p
          className={`text-xs uppercase tracking-[0.2em] text-center text-[var(--chrome-text)] opacity-80 ${labelFont}`}
        >
          {t("copyright")}
        </p>

        {/* Eid badge — ornate gold-rule chip with stars on either side */}
        <div className="inline-flex items-center gap-3 px-5 py-2 border border-[var(--chrome-border)] rounded-sm bg-[var(--chrome-border)]/5">
          <EightPointStar size={10} className="text-[var(--chrome-text)]" />
          <span
            className={`text-xs uppercase tracking-[0.22em] text-[var(--chrome-text)] ${labelFont}`}
          >
            {isArabic ? "عيد مبارك ٢٠٢٦" : "Eid Mubarak 2026"}
          </span>
          <EightPointStar size={10} className="text-[var(--chrome-text)]" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
