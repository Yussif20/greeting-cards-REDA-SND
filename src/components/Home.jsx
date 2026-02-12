import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { memo, useEffect } from "react";
import { Logo } from "./Header";
import AnimatedSection from "./AnimatedSection";
import { useOccasion, OCCASIONS } from "../context/OccasionContext";
import sampleCard from "/cards/RHC.jpg";

const Home = () => {
  const { t, i18n } = useTranslation();
  const { occasion, theme } = useOccasion();
  const navigate = useNavigate();
  const isArabic = i18n.language === "ar";

  // Redirect to occasion selector if no occasion is selected
  useEffect(() => {
    if (!occasion) {
      navigate("/");
    }
  }, [occasion, navigate]);

  if (!occasion) return null;

  const isFoundingDay = occasion === OCCASIONS.FOUNDING_DAY;

  // Get occasion-specific content
  const greetingKey = isFoundingDay
    ? "founding_day_greeting"
    : "ramadan_greeting";
  const messageKey = isFoundingDay ? "founding_day_message" : "ramadan_message";
  const previewDescKey = isFoundingDay
    ? "founding_day_preview_description"
    : "preview_description";
  const testimonialMsgKey = isFoundingDay
    ? "founding_day_testimonial_message"
    : "ramadan_testimonial_message";
  const testimonialAuthorKey = isFoundingDay
    ? "founding_day_testimonial_author"
    : "ramadan_testimonial_author";

  // Get occasion-specific logo/image
  const occasionLogo = isFoundingDay
    ? {
        light: "/founding-day-logo-light-theme.png",
        dark: "/founding-day-logo-dark-theme.png",
      }
    : null;

  // Background classes based on occasion
  const bgClasses = isFoundingDay
    ? "from-[#FFF8F0] via-[#F5E6D3] to-[#E8D5C4] dark:from-[#2D1F1A] dark:via-[#4A352F] dark:to-[#2D1F1A] bg-[url('/founding-day-light.jpg')] dark:bg-[url('/founding-day-dark.jpg')]"
    : "from-[#FFF8F0] via-[#FDF5EB] to-[#F5E6CC] dark:from-[#0F2641] dark:via-[#1B3A5C] dark:to-[#0F2641] bg-[url('/ramadan-light.jpg')] dark:bg-[url('/ramadan-dark.jpg')]";

  // Button color classes based on occasion
  const buttonClasses = isFoundingDay
    ? "from-[#6B4E45] to-[#4A352F] hover:from-[#7A5A50] hover:to-[#5A453F]"
    : "from-[#1B3A5C] to-[#0F2641]";

  // Accent colors
  const accentClass = isFoundingDay
    ? "border-[#D4A574]/20"
    : "border-[#C9A84C]/20";
  const glassAccent = isFoundingDay
    ? "dark:from-[#4A352F]/5"
    : "dark:from-[#1B3A5C]/5";

  return (
    <div
      className={`relative bg-linear-to-br ${bgClasses} min-h-screen flex flex-col items-center justify-center font-sans bg-cover bg-no-repeat bg-center transition-all duration-300`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Background Overlay for better readability */}
      <div className="absolute inset-0 bg-white/5 dark:bg-black/30 transition-all duration-300"></div>

      <main className="container mx-auto px-4 py-12 lg:px-8 lg:py-16 max-w-7xl relative z-10">
        {/* Hero Section */}
        <AnimatedSection>
          <div
            className={`bg-white/10 dark:bg-gray-900/30 rounded-3xl shadow-2xl border border-white/50 ${accentClass} p-6 sm:p-8 lg:p-12 text-center relative overflow-hidden glass-hover`}
          >
            {/* Glass effect enhancement */}
            <div
              className={`absolute inset-0 bg-linear-to-br from-white/20 to-transparent ${glassAccent} dark:to-transparent rounded-3xl`}
            ></div>

            <div className="relative z-10">
              <div className="mb-6 sm:mb-8">
                {isFoundingDay ? (
                  <>
                    <img
                      src={occasionLogo.light}
                      alt="Saudi Founding Day Logo"
                      className="h-48 sm:h-64 w-auto max-w-160 mx-auto transition-transform duration-300 hover:scale-105 block dark:hidden"
                    />
                    <img
                      src={occasionLogo.dark}
                      alt="Saudi Founding Day Logo"
                      className="h-48 sm:h-64 w-auto max-w-160 mx-auto transition-transform duration-300 hover:scale-105 hidden dark:block"
                    />
                  </>
                ) : (
                  <Logo
                    className="h-16 sm:h-20 w-auto max-w-75 mx-auto transition-transform duration-300 hover:scale-105"
                    ariaLabel="Ramadan Greeting Cards Logo"
                  />
                )}
              </div>
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#132E4A] dark:text-white mb-4 animate-slide-up drop-shadow-lg ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                {t(greetingKey)}
              </h1>
              <p
                className={`text-lg sm:text-xl lg:text-2xl text-[#3D6B8A] dark:text-[#F5E6CC] mb-6 animate-slide-up delay-100 drop-shadow-md font-medium ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                {t(messageKey)}
              </p>
              {!isFoundingDay && (
                <div className="mb-8 relative">
                  <div
                    className={`w-full max-w-125 sm:max-w-150 mx-auto bg-white/30 dark:bg-[#1B3A5C]/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl border border-white/40 ${accentClass} hover:border-white/60`}
                  >
                    <div className="relative w-full aspect-4/3 overflow-hidden rounded-lg">
                      <img
                        src={sampleCard}
                        alt={t("sample_card")}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <p
                      className={`text-sm text-[#132E4A] dark:text-[#F5E6CC] mt-3 sm:mt-4 font-medium ${
                        isArabic ? "font-elegant-ar" : "font-elegant-en"
                      }`}
                    >
                      {t(previewDescKey)}
                    </p>
                  </div>
                </div>
              )}
              <Link
                to="/cards"
                className={`inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r ${buttonClasses} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up delay-200 ${
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
          <div
            className={`mt-12 p-6 bg-white/10 dark:bg-gray-900/30 backdrop-blur-xl rounded-2xl border border-white/50 ${accentClass} text-center shadow-xl relative overflow-hidden`}
          >
            {/* Glass effect for testimonial */}
            <div
              className={`absolute inset-0 bg-linear-to-br from-white/20 to-transparent ${glassAccent} dark:to-transparent rounded-2xl`}
            ></div>

            <div className="relative z-10">
              <p
                className={`text-lg sm:text-xl text-[#132E4A] dark:text-[#F5E6CC] italic mb-4 font-medium ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                "{t(testimonialMsgKey)}"
              </p>
              <p
                className={`text-sm ${isFoundingDay ? "text-[#6B4E45] dark:text-[#D4A574]" : "text-[#3D6B8A] dark:text-[#C9A84C]"} font-semibold ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                - {t(testimonialAuthorKey)}
              </p>
            </div>
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
};

export default memo(Home);
