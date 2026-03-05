// src/components/Footer.jsx
import { useTranslation } from "react-i18next";
import { Logo } from "./Header"; // Import the Logo component

const Footer = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer
      className="py-6 w-full min-h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-white/20 dark:border-[#D4AF37]/20 text-[#1A3C34] dark:text-[#E8F5E9] flex flex-col items-center justify-center px-6 shadow-lg transition-all duration-300"
      dir={i18n.language === "ar" ? "rtl" : "ltr"} // Dynamic text direction
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-[#0D7377]/5 to-transparent dark:from-[#D4AF37]/5 dark:to-transparent"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="mb-3">
          <div className="dark:bg-transparent rounded-xl p-2">
            <Logo
              className="h-8 w-auto max-w-30 transition-transform duration-300 hover:scale-105"
              ariaLabel="Reda Hazard Control Logo"
            />
          </div>
        </div>

        {/* Copyright Text */}
        <p className="text-sm sm:text-base text-center font-medium bg-linear-to-r from-[#0D7377] to-[#065F56] dark:from-[#D4AF37] dark:to-[#E8F5E9] bg-clip-text text-transparent">
          {t("copyright")}
        </p>

        {/* Eid Badge */}
        <div className="mt-2 px-3 py-1 bg-[#0D7377]/10 dark:bg-[#D4AF37]/10 backdrop-blur-sm rounded-full border border-[#0D7377]/20 dark:border-[#D4AF37]/20">
          <span className="text-xs font-semibold text-[#0D7377] dark:text-[#D4AF37]">
            {i18n.language === "ar"
              ? "عيد مبارك 2026 ✨"
              : "✨ Eid Mubarak 2026"}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
