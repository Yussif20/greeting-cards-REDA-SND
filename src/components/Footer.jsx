// src/components/Footer.jsx
import { useTranslation } from "react-i18next";
import { Logo } from "./Header"; // Import the Logo component

const Footer = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer
      className="py-6 w-full min-h-[80px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-white/20 dark:border-[#FFD700]/20 text-[#004225] dark:text-[#F4E4BC] flex flex-col items-center justify-center px-6 shadow-lg transition-all duration-300"
      dir={i18n.language === "ar" ? "rtl" : "ltr"} // Dynamic text direction
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#006C35]/5 to-transparent dark:from-[#FFD700]/5 dark:to-transparent"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-3">
          <div className="dark:bg-transparent rounded-xl p-2">
            <Logo
              className="h-8 w-auto max-w-[120px] transition-transform duration-300 hover:scale-105"
              ariaLabel="Reda Hazard Control Logo"
            />
          </div>
        </div>

        {/* Copyright Text */}
        <p className="text-sm sm:text-base text-center font-medium bg-gradient-to-r from-[#006C35] to-[#004225] dark:from-[#FFD700] dark:to-[#F4E4BC] bg-clip-text text-transparent">
          {t("copyright")}
        </p>

        {/* Saudi National Day Badge */}
        <div className="mt-2 px-3 py-1 bg-[#006C35]/10 dark:bg-[#FFD700]/10 backdrop-blur-sm rounded-full border border-[#006C35]/20 dark:border-[#FFD700]/20">
          <span className="text-xs font-semibold text-[#006C35] dark:text-[#FFD700]">
            🇸🇦 Saudi National Day 2025
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
