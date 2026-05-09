import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { memo, useEffect } from "react";
import { Logo } from "./Header";
import AnimatedSection from "./AnimatedSection";
import { useOccasion, OCCASIONS } from "../context/OccasionContext";
import { EightPointStar, PanelCorners, StarDivider } from "./Ornaments";
import sampleCard from "/eid-adha/RHC.jpg";

const Home = () => {
  const { t, i18n } = useTranslation();
  const { occasion } = useOccasion();
  const navigate = useNavigate();
  const isArabic = i18n.language === "ar";

  useEffect(() => {
    if (!occasion) {
      navigate("/");
    }
  }, [occasion, navigate]);

  if (!occasion) return null;

  const isEidAdha = occasion === OCCASIONS.EID_ADHA;
  const greetingKey = isEidAdha ? "eid_adha_greeting" : "eid_adha_greeting";
  const messageKey = isEidAdha ? "eid_adha_message" : "eid_adha_message";
  const previewDescKey = isEidAdha
    ? "eid_adha_preview_description"
    : "preview_description";
  const testimonialMsgKey = isEidAdha
    ? "eid_adha_testimonial_message"
    : "eid_adha_testimonial_message";
  const testimonialAuthorKey = isEidAdha
    ? "eid_adha_testimonial_author"
    : "eid_adha_testimonial_author";

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center font-sans bg-[url('/eid-light.jpg')] dark:bg-[url('/eid-dark.jpg')] bg-cover bg-no-repeat bg-center transition-all duration-300"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Jewel-tone overlay — saturates the underlying bg image into velvet ground */}
      <div className="absolute inset-0 jewel-overlay-light dark:jewel-overlay-dark transition-all duration-300" />

      <main className="container mx-auto px-4 py-12 lg:px-8 lg:py-16 max-w-5xl relative z-10">
        {/* Hero panel — ornate gold double-rule with corner arabesques */}
        <AnimatedSection>
          <div className="ornate-panel p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
            <PanelCorners />

            <div className="relative z-10 max-w-3xl mx-auto">
              {/* Logo */}
              <div className="mb-8">
                <Logo
                  className="logo-on-dark h-14 sm:h-16 w-auto max-w-64 mx-auto"
                  ariaLabel="Eid Al Adha Greeting Cards Logo"
                />
              </div>

              {/* Arabic display greeting */}
              <h1
                className="font-display-ar text-5xl sm:text-6xl lg:text-7xl text-[var(--jewel-gold)] mb-4 leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                dir="rtl"
              >
                {isArabic ? t("eid_adha_greeting") : "عيد مبارك"}
              </h1>

              <StarDivider className="my-6" />

              {/* English display subtitle */}
              <p className="font-display-en text-2xl sm:text-3xl lg:text-4xl text-[var(--ivory)] dark:text-[var(--ivory)] uppercase mb-3 tracking-[0.2em]">
                {isArabic ? "Eid Mubarak" : t("eid_adha_greeting")}
              </p>

              {/* Subtitle / wishes */}
              <p
                className={`text-base sm:text-lg text-[var(--parchment)] dark:text-[var(--parchment)] opacity-85 mb-10 max-w-xl mx-auto ${
                  isArabic ? "font-display-ar leading-relaxed" : "font-italic-display"
                }`}
              >
                {t(messageKey)}
              </p>

              {/* Sample card in mihrab arch */}
              <div className="relative mb-10 max-w-sm sm:max-w-md mx-auto">
                {/* Finial above the arch */}
                <div className="flex justify-center mb-1 relative z-10">
                  <EightPointStar
                    size={20}
                    className="text-[var(--jewel-gold)]"
                  />
                </div>
                <div className="mihrab-frame aspect-[4/5]">
                  <img
                    src={sampleCard}
                    alt={t("sample_card")}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p
                  className={`text-xs text-[var(--jewel-gold)] mt-3 tracking-wider uppercase opacity-80 ${
                    isArabic ? "font-display-ar" : "font-display-en"
                  }`}
                >
                  {t(previewDescKey)}
                </p>
              </div>

              {/* CTA */}
              <Link
                to="/cards"
                className={`cta-gold inline-flex items-center gap-3 px-8 py-3.5 font-semibold rounded-sm uppercase tracking-[0.18em] text-sm sm:text-base ${
                  isArabic ? "font-display-ar" : "font-display-en"
                }`}
                aria-label={t("create_card")}
              >
                <EightPointStar size={12} />
                {t("create_card")}
                <ChevronRight
                  size={18}
                  className={isArabic ? "transform rotate-180" : ""}
                />
              </Link>
            </div>
          </div>
        </AnimatedSection>

        {/* Testimonial — smaller framed panel */}
        <AnimatedSection delay={400}>
          <div className="ornate-panel mt-10 p-8 sm:p-10 text-center relative overflow-hidden">
            <PanelCorners className="text-[var(--jewel-gold)] scale-75" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <EightPointStar
                size={14}
                className="text-[var(--jewel-gold)] mx-auto mb-4 opacity-70"
              />
              <p
                className={`text-lg sm:text-xl text-[var(--parchment)] dark:text-[var(--parchment)] mb-5 ${
                  isArabic ? "font-display-ar leading-relaxed" : "font-italic-display"
                }`}
              >
                "{t(testimonialMsgKey)}"
              </p>
              <StarDivider width="max-w-xs" />
              <p
                className={`mt-5 text-sm text-[var(--jewel-gold)] tracking-[0.2em] uppercase ${
                  isArabic ? "font-display-ar" : "font-display-en"
                }`}
              >
                {t(testimonialAuthorKey)}
              </p>
            </div>
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
};

export default memo(Home);
