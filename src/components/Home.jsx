import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { memo, useEffect } from "react";
import { Logo } from "./Header";
import AnimatedSection from "./AnimatedSection";
import { useOccasion, OCCASIONS } from "../context/OccasionContext";
import sampleCard from "/eid/RHC.jpg";

const Home = () => {
  const { t, i18n } = useTranslation();
  const { occasion } = useOccasion();
  const navigate = useNavigate();
  const isArabic = i18n.language === "ar";

  // Redirect to occasion selector if no occasion is selected
  useEffect(() => {
    if (!occasion) {
      navigate("/");
    }
  }, [occasion, navigate]);

  if (!occasion) return null;

  const isEidFitr = occasion === OCCASIONS.EID_FITR;
  // const isFoundingDay = occasion === OCCASIONS.FOUNDING_DAY;

  // Get occasion-specific content
  const greetingKey = isEidFitr ? "eid_fitr_greeting" : "eid_fitr_greeting";
  const messageKey = isEidFitr ? "eid_fitr_message" : "eid_fitr_message";
  const previewDescKey = isEidFitr
    ? "eid_fitr_preview_description"
    : "preview_description";
  const testimonialMsgKey = isEidFitr
    ? "eid_fitr_testimonial_message"
    : "eid_fitr_testimonial_message";
  const testimonialAuthorKey = isEidFitr
    ? "eid_fitr_testimonial_author"
    : "eid_fitr_testimonial_author";

  // Background classes — Eid Al Fitr
  const bgClasses =
    "from-[#F0FFF4] via-[#F5FFF9] to-[#FDF6E3] dark:from-[#031D1F] dark:via-[#0D3B3E] dark:to-[#031D1F] bg-[url('/eid-light.jpg')] dark:bg-[url('/eid-dark.jpg')]";

  // Button color classes — Eid teal
  const buttonClasses =
    "from-[#0D7377] to-[#065F56] hover:from-[#065F56] hover:to-[#044A42]";

  // Accent colors — Eid gold
  const accentClass = "border-[#D4AF37]/20";
  const glassAccent = "dark:from-[#0D3B3E]/5";

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
                <Logo
                  className="h-16 sm:h-20 w-auto max-w-75 mx-auto transition-transform duration-300 hover:scale-105"
                  ariaLabel="Eid Al Fitr Greeting Cards Logo"
                />
              </div>
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A3C34] dark:text-white mb-4 animate-slide-up drop-shadow-lg ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                {t(greetingKey)}
              </h1>
              <p
                className={`text-lg sm:text-xl lg:text-2xl text-[#3D7A6A] dark:text-[#E8F5E9] mb-6 animate-slide-up delay-100 drop-shadow-md font-medium ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                {t(messageKey)}
              </p>
              {!isEidFitr ? null : (
                <div className="mb-8 relative">
                  <div
                    className={`w-full max-w-125 sm:max-w-150 mx-auto bg-white/30 dark:bg-[#0D3B3E]/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl border border-white/40 ${accentClass} hover:border-white/60`}
                  >
                    <div className="relative w-full aspect-4/3 overflow-hidden rounded-lg">
                      <img
                        src={sampleCard}
                        alt={t("sample_card")}
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                    <p
                      className={`text-sm text-[#1A3C34] dark:text-[#E8F5E9] mt-3 sm:mt-4 font-medium ${
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
                className={`text-lg sm:text-xl text-[#1A3C34] dark:text-[#E8F5E9] italic mb-4 font-medium ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                "{t(testimonialMsgKey)}"
              </p>
              <p
                className={`text-sm text-[#0D7377] dark:text-[#D4AF37] font-semibold ${
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
