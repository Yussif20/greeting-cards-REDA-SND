import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { memo } from "react";
import { useOccasion, OCCASIONS } from "../context/OccasionContext";
import AnimatedSection from "./AnimatedSection";

const OccasionSelector = () => {
  const { t, i18n } = useTranslation();
  const { setOccasion } = useOccasion();
  const navigate = useNavigate();
  const isArabic = i18n.language === "ar";

  const handleSelectOccasion = (occasionType) => {
    setOccasion(occasionType);
    navigate("/welcome");
  };

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center font-sans bg-linear-to-br from-[#FFF8F0] via-[#FDF5EB] to-[#F5E6CC] dark:from-[#1a1a2e] dark:via-[#16213e] dark:to-[#0f0f23] bg-[url('/occasion-selector-light.jpg')] dark:bg-[url('/occasion-selector-dark.jpg')] bg-cover bg-no-repeat bg-center transition-all duration-300"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-white/30 dark:bg-black/50 transition-all duration-300"></div>

      <main className="container mx-auto px-4 py-12 lg:px-8 lg:py-16 max-w-6xl relative z-10">
        <AnimatedSection>
          <div className="text-center mb-12">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/60 dark:border-gray-700/40">
              <h1
                className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#132E4A] dark:text-white mb-4 animate-slide-up ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                {t("select_occasion")}
              </h1>
              <p
                className={`text-lg sm:text-xl text-[#3D6B8A] dark:text-gray-300 animate-slide-up delay-100 ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                {t("select_occasion_description")}
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Occasion Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Ramadan Card */}
          <AnimatedSection delay={200}>
            <button
              onClick={() => handleSelectOccasion(OCCASIONS.RAMADAN)}
              className="w-full group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#1B3A5C]/50 rounded-3xl"
            >
              <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#1B3A5C] to-[#0F2641] border-2 border-[#C9A84C]/30 shadow-xl h-full">
                {/* Card Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-32 h-32 bg-[#C9A84C] rounded-full blur-3xl"></div>
                  <div className="absolute bottom-4 left-4 w-24 h-24 bg-[#C9A84C] rounded-full blur-2xl"></div>
                </div>

                <div className="relative p-8 sm:p-10 flex flex-col items-center">
                  {/* Ramadan Icon/Moon */}
                  <div className="mb-6 w-24 h-24 sm:w-32 sm:h-32 bg-transparent rounded-full flex items-center justify-center transition-shadow duration-300">
                    <span className="text-5xl sm:text-6xl">🌙</span>
                  </div>

                  <h2
                    className={`text-2xl sm:text-3xl font-bold text-white mb-3 ${
                      isArabic ? "font-elegant-ar" : "font-elegant-en"
                    }`}
                  >
                    {t("ramadan_title")}
                  </h2>
                  <p
                    className={`text-[#F5E6CC] text-center text-base sm:text-lg ${
                      isArabic ? "font-elegant-ar" : "font-elegant-en"
                    }`}
                  >
                    {t("ramadan_occasion_description")}
                  </p>

                  {/* Hover Arrow */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="inline-flex items-center text-[#C9A84C] font-semibold">
                      {t("select")}
                      <svg
                        className={`w-5 h-5 ${isArabic ? "mr-2 rotate-180" : "ml-2"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </AnimatedSection>

          {/* Saudi Founding Day Card */}
          <AnimatedSection delay={400}>
            <button
              onClick={() => handleSelectOccasion(OCCASIONS.FOUNDING_DAY)}
              className="w-full group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#6B4E45]/50 rounded-3xl"
            >
              <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#6B4E45] to-[#4A352F] border-2 border-[#D4A574]/30 shadow-xl h-full">
                {/* Card Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-32 h-32 bg-[#D4A574] rounded-full blur-3xl"></div>
                  <div className="absolute bottom-4 left-4 w-24 h-24 bg-[#D4A574] rounded-full blur-2xl"></div>
                </div>

                <div className="relative p-8 sm:p-10 flex flex-col items-center">
                  {/* Founding Day Logo */}
                  <div className="w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
                    <img
                      src="/founding-day-logo-dark-theme.png"
                      alt="Saudi Founding Day Logo"
                      className="w-full h-full object-contain block "
                    />
                  </div>

                  <h2
                    className={`text-2xl sm:text-3xl font-bold text-white mb-3 ${
                      isArabic ? "font-elegant-ar" : "font-elegant-en"
                    }`}
                  >
                    {t("founding_day_title")}
                  </h2>
                  <p
                    className={`text-[#F5E6CC] text-center text-base sm:text-lg ${
                      isArabic ? "font-elegant-ar" : "font-elegant-en"
                    }`}
                  >
                    {t("founding_day_occasion_description")}
                  </p>

                  {/* Hover Arrow */}
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="inline-flex items-center text-[#D4A574] font-semibold">
                      {t("select")}
                      <svg
                        className={`w-5 h-5 ${isArabic ? "mr-2 rotate-180" : "ml-2"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </AnimatedSection>
        </div>
      </main>
    </div>
  );
};

export default memo(OccasionSelector);
