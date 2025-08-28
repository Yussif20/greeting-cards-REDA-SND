import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { memo } from "react";
import { Logo } from "./Header";
import AnimatedSection from "./AnimatedSection";
import sampleCard from "/cards/RHC.jpg";

const Home = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <div
      className="relative bg-gradient-to-br from-[#f8fdf8] via-[#f0f8f0] to-[#e8f4e8] dark:from-[#004225] dark:via-[#006C35] dark:to-[#004225] min-h-screen flex flex-col items-center justify-center font-sans bg-[url('/saudi-light.jpg')] dark:bg-[url('/saudi-dark.jpg')] bg-cover bg-no-repeat bg-center transition-all duration-300"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Background Overlay for better readability */}
      <div className="absolute inset-0 bg-white/5 dark:bg-black/30 transition-all duration-300"></div>

      <main className="container mx-auto px-4 py-12 lg:px-8 lg:py-16 max-w-7xl relative z-10">
        {/* Hero Section */}
        <AnimatedSection>
          <div className="bg-white/10 dark:bg-gray-900/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 dark:border-[#FFD700]/20 p-6 sm:p-8 lg:p-12 text-center relative overflow-hidden glass-hover">
            {/* Glass effect enhancement */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-[#006C35]/5 dark:to-transparent rounded-3xl"></div>

            <div className="relative z-10">
              <div className="mb-6 sm:mb-8">
                <Logo
                  className="h-16 sm:h-20 w-auto max-w-[300px] mx-auto transition-transform duration-300 hover:scale-105"
                  ariaLabel="New Hijri Year Greeting Cards Logo"
                />
              </div>
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1a3d1a] dark:text-white mb-4 animate-slide-up drop-shadow-lg ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                {t("saudi_national_day_greeting")}
              </h1>
              <p
                className={`text-lg sm:text-xl lg:text-2xl text-[#2d5a2d] dark:text-[#F4E4BC] mb-6 animate-slide-up delay-100 drop-shadow-md font-medium ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                {t("saudi_national_day_message")}
              </p>
              <div className="mb-8 relative">
                <div className="w-full max-w-[500px] sm:max-w-[600px] mx-auto bg-white/30 dark:bg-[#006C35]/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl border border-white/40 dark:border-[#FFD700]/20 hover:border-white/60 dark:hover:border-[#FFD700]/40">
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg">
                    <img
                      src={sampleCard}
                      alt={t("sample_card")}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <p
                    className={`text-sm text-[#1a3d1a] dark:text-[#F4E4BC] mt-3 sm:mt-4 font-medium ${
                      isArabic ? "font-elegant-ar" : "font-elegant-en"
                    }`}
                  >
                    {t("preview_description")}
                  </p>
                </div>
              </div>
              <Link
                to="/cards"
                className={`inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#006C35] to-[#004225] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-200 ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
                aria-label={t("create_card")}
              >
                {t("create_card")}
                <ChevronRight
                  size={20}
                  className={isArabic ? "ml-2 transform rotate-180" : "ml-2"}
                />
              </Link>
            </div>
          </div>
        </AnimatedSection>

        {/* Testimonial Section */}
        <AnimatedSection delay={400}>
          <div className="mt-12 p-6 bg-white/10 dark:bg-gray-900/30 backdrop-blur-xl rounded-2xl border border-white/50 dark:border-[#FFD700]/20 text-center shadow-xl relative overflow-hidden">
            {/* Glass effect for testimonial */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-[#006C35]/5 dark:to-transparent rounded-2xl"></div>

            <div className="relative z-10">
              <p
                className={`text-lg sm:text-xl text-[#1a3d1a] dark:text-[#F4E4BC] italic mb-4 font-medium ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                "{t("saudi_national_testimonial_message")}"
              </p>
              <p
                className={`text-sm text-[#2d5a2d] dark:text-[#FFD700] font-semibold ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                - {t("saudi_national_testimonial_author")}
              </p>
            </div>
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
};

export default memo(Home);
