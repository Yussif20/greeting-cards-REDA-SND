import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getCardsByOccasion } from "../data";
import { useOccasion, OCCASIONS } from "../context/OccasionContext";
import AnimatedSection from "./AnimatedSection";
import { EightPointStar, PanelCorners, StarDivider } from "./Ornaments";

const CardGallery = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { occasion } = useOccasion();
  const isArabic = i18n.language === "ar";

  useEffect(() => {
    if (!occasion) {
      navigate("/");
    }
  }, [occasion, navigate]);

  if (!occasion) return null;

  const cards = getCardsByOccasion(occasion);
  const isEidAdha = occasion === OCCASIONS.EID_ADHA;
  const greetingKey = isEidAdha ? "eid_adha_greeting" : "eid_adha_greeting";

  const handleCardSelect = (card) => {
    navigate("/customize", { state: { selectedCard: card } });
  };

  return (
    <div
      className="relative min-h-screen bg-[url('/eid-light.jpg')] dark:bg-[url('/eid-dark.jpg')] bg-cover bg-no-repeat bg-center transition-all duration-300"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="absolute inset-0 jewel-overlay-light dark:jewel-overlay-dark transition-all duration-300" />

      <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16 max-w-6xl relative z-10">
        {/* Header panel */}
        <AnimatedSection>
          <div className="ornate-panel p-8 sm:p-10 text-center relative overflow-hidden mb-10">
            <PanelCorners className="text-[var(--jewel-gold)] scale-75" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <EightPointStar
                size={18}
                className="text-[var(--jewel-gold)] mx-auto mb-4 opacity-80"
              />

              <h1 className="font-display-en text-3xl sm:text-4xl lg:text-5xl text-[var(--ivory)] uppercase tracking-[0.2em] mb-3">
                {t("select_card")}
              </h1>

              <StarDivider className="my-4" width="max-w-sm" />

              <p
                className={`text-base sm:text-lg text-[var(--jewel-gold)] opacity-90 ${
                  isArabic ? "font-display-ar leading-relaxed text-2xl" : "font-italic-display"
                }`}
              >
                {t(greetingKey)}
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Card grid */}
        <AnimatedSection delay={150}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {cards.map((card, index) => (
              <button
                key={index}
                onClick={() => handleCardSelect(card)}
                className="ornate-card p-5 sm:p-6 text-center group cursor-pointer overflow-hidden"
                aria-label={`${t("customize_card")} - ${card.name}`}
              >
                <PanelCorners
                  className="text-[var(--jewel-gold)] opacity-70 group-hover:opacity-100 transition-opacity duration-300 scale-50"
                />

                <div className="relative z-10">
                  {/* Mihrab arch frame */}
                  <div className="mb-4 relative">
                    <div className="flex justify-center mb-1">
                      <EightPointStar
                        size={14}
                        className="text-[var(--jewel-gold)] opacity-80 group-hover:opacity-100"
                      />
                    </div>
                    <div className="mihrab-frame aspect-[4/5] mx-auto max-w-[220px]">
                      <img
                        src={card.src}
                        alt={card.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Card name */}
                  <h3
                    className={`text-lg uppercase tracking-[0.2em] text-[var(--jewel-gold)] mb-3 ${
                      isArabic ? "font-display-ar" : "font-display-en"
                    }`}
                  >
                    {card.name}
                  </h3>

                  {/* Hairline rule */}
                  <div className="heading-rule" />

                  {/* CTA */}
                  <div
                    className={`mt-4 inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-[var(--ivory)] dark:text-[var(--ivory)] opacity-80 group-hover:opacity-100 transition-opacity duration-300 ${
                      isArabic ? "font-display-ar" : "font-display-en"
                    }`}
                  >
                    {t("customize_card")}
                    <ChevronRight
                      size={14}
                      className={`transition-transform duration-300 group-hover:translate-x-1 ${
                        isArabic ? "rotate-180 group-hover:-translate-x-1" : ""
                      }`}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default CardGallery;
