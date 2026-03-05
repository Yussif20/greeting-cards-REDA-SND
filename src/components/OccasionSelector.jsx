import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { memo, useEffect } from "react";
import { useOccasion, OCCASIONS } from "../context/OccasionContext";
import AnimatedSection from "./AnimatedSection";

const OccasionSelector = () => {
  const { t, i18n } = useTranslation();
  const { occasion, setOccasion } = useOccasion();
  const navigate = useNavigate();
  const isArabic = i18n.language === "ar";

  // Auto-select Eid Al Fitr and redirect (single active occasion)
  useEffect(() => {
    if (!occasion) {
      setOccasion(OCCASIONS.EID_FITR);
    }
    navigate("/welcome");
  }, [occasion, setOccasion, navigate]);

  // Show a brief loading/transition screen with Eid branding
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center font-sans bg-linear-to-br from-[#F0FFF4] via-[#F5FFF9] to-[#FDF6E3] dark:from-[#031D1F] dark:via-[#0D3B3E] dark:to-[#031D1F] bg-[url('/eid-light.jpg')] dark:bg-[url('/eid-dark.jpg')] bg-cover bg-no-repeat bg-center transition-all duration-300"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-white/30 dark:bg-black/50 transition-all duration-300"></div>

      <main className="container mx-auto px-4 py-12 lg:px-8 lg:py-16 max-w-6xl relative z-10">
        <AnimatedSection>
          <div className="text-center mb-12">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/60 dark:border-gray-700/40">
              <div className="mb-6 w-24 h-24 sm:w-32 sm:h-32 bg-transparent rounded-full flex items-center justify-center mx-auto">
                <span className="text-5xl sm:text-6xl">✨</span>
              </div>
              <h1
                className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A3C34] dark:text-white mb-4 animate-slide-up ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                {t("eid_fitr_greeting")}
              </h1>
              <p
                className={`text-lg sm:text-xl text-[#3D7A6A] dark:text-gray-300 animate-slide-up delay-100 ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                {t("eid_fitr_occasion_description")}
              </p>
            </div>
          </div>
        </AnimatedSection>
      </main>
    </div>
  );

  /*
  // ========== MULTI-OCCASION SELECTOR (commented out — kept for future use) ==========
  // When re-enabling multiple occasions, uncomment the grid below and remove the auto-redirect above.

  const handleSelectOccasion = (occasionType) => {
    setOccasion(occasionType);
    navigate("/welcome");
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center font-sans bg-linear-to-br from-[#FFF8F0] via-[#FDF5EB] to-[#F5E6CC] dark:from-[#1a1a2e] dark:via-[#16213e] dark:to-[#0f0f23] bg-[url('/occasion-selector-light.jpg')] dark:bg-[url('/occasion-selector-dark.jpg')] bg-cover bg-no-repeat bg-center transition-all duration-300"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="absolute inset-0 bg-white/30 dark:bg-black/50 transition-all duration-300"></div>
      <main className="container mx-auto px-4 py-12 lg:px-8 lg:py-16 max-w-6xl relative z-10">
        <AnimatedSection>
          <div className="text-center mb-12">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/60 dark:border-gray-700/40">
              <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#132E4A] dark:text-white mb-4 animate-slide-up ${isArabic ? "font-elegant-ar" : "font-elegant-en"}`}>
                {t("select_occasion")}
              </h1>
              <p className={`text-lg sm:text-xl text-[#3D6B8A] dark:text-gray-300 animate-slide-up delay-100 ${isArabic ? "font-elegant-ar" : "font-elegant-en"}`}>
                {t("select_occasion_description")}
              </p>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {// Ramadan Card}
          <AnimatedSection delay={200}>
            <button onClick={() => handleSelectOccasion(OCCASIONS.RAMADAN)} className="w-full group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#1B3A5C]/50 rounded-3xl">
              <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#1B3A5C] to-[#0F2641] border-2 border-[#C9A84C]/30 shadow-xl h-full">
                <div className="relative p-8 sm:p-10 flex flex-col items-center">
                  <div className="mb-6 w-24 h-24 sm:w-32 sm:h-32 bg-transparent rounded-full flex items-center justify-center">
                    <span className="text-5xl sm:text-6xl">🌙</span>
                  </div>
                  <h2 className={`text-2xl sm:text-3xl font-bold text-white mb-3 ${isArabic ? "font-elegant-ar" : "font-elegant-en"}`}>{t("ramadan_title")}</h2>
                  <p className={`text-[#F5E6CC] text-center text-base sm:text-lg ${isArabic ? "font-elegant-ar" : "font-elegant-en"}`}>{t("ramadan_occasion_description")}</p>
                </div>
              </div>
            </button>
          </AnimatedSection>

          {// Founding Day Card}
          <AnimatedSection delay={400}>
            <button onClick={() => handleSelectOccasion(OCCASIONS.FOUNDING_DAY)} className="w-full group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#6B4E45]/50 rounded-3xl">
              <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#6B4E45] to-[#4A352F] border-2 border-[#D4A574]/30 shadow-xl h-full">
                <div className="relative p-8 sm:p-10 flex flex-col items-center">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                    <img src="/founding-day-logo-dark-theme.png" alt="Saudi Founding Day Logo" className="w-full h-full object-contain block" />
                  </div>
                  <h2 className={`text-2xl sm:text-3xl font-bold text-white mb-3 ${isArabic ? "font-elegant-ar" : "font-elegant-en"}`}>{t("founding_day_title")}</h2>
                  <p className={`text-[#F5E6CC] text-center text-base sm:text-lg ${isArabic ? "font-elegant-ar" : "font-elegant-en"}`}>{t("founding_day_occasion_description")}</p>
                </div>
              </div>
            </button>
          </AnimatedSection>
        </div>
      </main>
    </div>
  );
  // ========== END MULTI-OCCASION SELECTOR ==========
  */
};

export default memo(OccasionSelector);
