// src/components/Footer.jsx
import { useTranslation } from "react-i18next";
import { Logo } from "./Header"; // Import the Logo component

const Footer = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer
      className="py-6 w-full min-h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-white/20 dark:border-[#C9A84C]/20 text-[#0F2641] dark:text-[#F5E6CC] flex flex-col items-center justify-center px-6 shadow-lg transition-all duration-300"
      dir={i18n.language === "ar" ? "rtl" : "ltr"} // Dynamic text direction
    >
      {/* Glass effect overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-[#1B3A5C]/5 to-transparent dark:from-[#C9A84C]/5 dark:to-transparent"></div>

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
        <p className="text-sm sm:text-base text-center font-medium bg-linear-to-r from-[#1B3A5C] to-[#0F2641] dark:from-[#C9A84C] dark:to-[#F5E6CC] bg-clip-text text-transparent">
          {t("copyright")}
        </p>

        {/* Ramadan Badge */}
        <div className="mt-2 px-3 py-1 bg-[#1B3A5C]/10 dark:bg-[#C9A84C]/10 backdrop-blur-sm rounded-full border border-[#1B3A5C]/20 dark:border-[#C9A84C]/20">
          <span className="text-xs font-semibold text-[#1B3A5C] dark:text-[#C9A84C]">
            {i18n.language === "ar"
              ? "رمضان مبارك 2026 🌙"
              : "🌙 Ramadan Mubarak 2026"}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
